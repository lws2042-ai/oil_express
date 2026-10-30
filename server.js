'use strict';

/* =========================================================
 * Oil Express 개발 서버
 * - 이 폴더의 정적 파일(index.html 등)을 보여줍니다.
 * - /api/oil-price, /api/areas 요청을 오피넷 API로 대신 호출합니다.
 *   (오피넷은 브라우저 직접 호출(CORS)을 막고, API 키를 화면 코드에 넣으면 누구나 볼 수 있어서)
 *
 * 실행: node server.js  →  http://localhost:3000
 * API 키는 같은 폴더의 .env 파일에 OPINET_API_KEY=... 로 넣어 둡니다.
 * ========================================================= */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

// .env 읽기 (외부 패키지 없이)
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {
  // .env가 없으면 환경 변수만 사용
}

const API_KEY = process.env.OPINET_API_KEY;
const OPINET = 'https://www.opinet.co.kr/api';

// 화면에 보여줄 유종과 순서 (오피넷 제품 코드)
const PRODUCTS = [
  { code: 'C004', name: '실내등유' },
  { code: 'D047', name: '경유' },
  { code: 'B027', name: '휘발유' },
];

async function opinet(endpoint, params = {}) {
  const url = new URL(`${OPINET}/${endpoint}`);
  url.search = new URLSearchParams({ out: 'json', certkey: API_KEY, ...params });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`오피넷 응답 오류 (${res.status})`);
  // 오피넷은 JSON 앞뒤에 공백을 붙여 text/html로 보내므로 직접 파싱
  return JSON.parse((await res.text()).trim()).RESULT?.OIL ?? [];
}

const toDate = (ymd) => (ymd && ymd.length === 8 ? `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6)}` : null);

async function getOilPrice(sido) {
  // 시도를 고르면 시도별 평균, 아니면 전국 평균
  const rows = sido ? await opinet('avgSidoPrice.do', { sido }) : await opinet('avgAllPrice.do');
  const items = PRODUCTS.map((p) => {
    const row = rows.find((r) => r.PRODCD === p.code);
    return row ? { code: p.code, name: p.name, price: Number(row.PRICE), diff: Number(row.DIFF) } : null;
  }).filter(Boolean);

  return {
    date: toDate(rows.find((r) => r.TRADE_DT)?.TRADE_DT) ?? new Date().toISOString().slice(0, 10),
    area: sido ? rows[0]?.SIDONM ?? null : '전국',
    items,
  };
}

async function getAreas() {
  const rows = await opinet('areaCode.do');
  return rows.map((r) => ({ code: r.AREA_CD, name: r.AREA_NM }));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function serveStatic(res, pathname) {
  const file = path.normalize(path.join(ROOT, decodeURIComponent(pathname === '/' ? '/index.html' : pathname)));
  const ext = path.extname(file).toLowerCase();
  // 폴더 밖 파일, .env·server.js 같은 비공개 파일은 내보내지 않음
  if (!file.startsWith(ROOT + path.sep) || !MIME[ext] || path.basename(file) === 'server.js') {
    res.writeHead(404).end('Not found');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': MIME[ext] }).end(data);
  });
}

http
  .createServer(async (req, res) => {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');

    if (pathname.startsWith('/api/')) {
      if (!API_KEY) return sendJson(res, 500, { error: '.env 파일에 OPINET_API_KEY가 없어요.' });
      try {
        if (pathname === '/api/oil-price') {
          const sido = searchParams.get('sido');
          return sendJson(res, 200, await getOilPrice(/^\d{2}$/.test(sido ?? '') ? sido : null));
        }
        if (pathname === '/api/areas') return sendJson(res, 200, await getAreas());
        return sendJson(res, 404, { error: '없는 API예요.' });
      } catch (err) {
        console.error(err);
        return sendJson(res, 502, { error: '오피넷에서 가격을 가져오지 못했어요.' });
      }
    }

    serveStatic(res, pathname);
  })
  .listen(PORT, () => {
    console.log(`Oil Express 서버 실행 중 → http://localhost:${PORT}`);
    if (!API_KEY) console.warn('주의: .env 파일에 OPINET_API_KEY가 없어요.');
  });
