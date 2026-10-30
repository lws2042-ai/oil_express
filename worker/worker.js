/* =========================================================
 * Oil Express API 중계 (Cloudflare Workers)
 * - GitHub Pages에서는 server.js가 실행되지 않으므로, /api/oil-price, /api/areas를
 *   이 Worker가 대신 오피넷에 요청합니다. (로직은 server.js와 같음)
 * - API 키는 코드에 넣지 않고 Worker의 비밀 변수로 넣습니다.
 *     npx wrangler secret put OPINET_API_KEY
 * 배포: worker 폴더에서 npx wrangler deploy
 * ========================================================= */
const OPINET = 'https://www.opinet.co.kr/api';

// 이 주소에서 연 화면만 호출할 수 있게 함
const ALLOWED_ORIGINS = ['https://lws2042-ai.github.io', 'http://localhost:3000'];

// 화면에 보여줄 유종과 순서 (오피넷 제품 코드)
const PRODUCTS = [
  { code: 'C004', name: '실내등유' },
  { code: 'D047', name: '경유' },
  { code: 'B027', name: '휘발유' },
];

async function opinet(apiKey, endpoint, params = {}) {
  const url = new URL(`${OPINET}/${endpoint}`);
  url.search = new URLSearchParams({ out: 'json', certkey: apiKey, ...params });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`오피넷 응답 오류 (${res.status})`);
  // 오피넷은 JSON 앞뒤에 공백을 붙여 text/html로 보내므로 직접 파싱
  return JSON.parse((await res.text()).trim()).RESULT?.OIL ?? [];
}

const toDate = (ymd) => (ymd && ymd.length === 8 ? `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6)}` : null);

async function getOilPrice(apiKey, sido) {
  // 시도를 고르면 시도별 평균, 아니면 전국 평균
  const rows = sido ? await opinet(apiKey, 'avgSidoPrice.do', { sido }) : await opinet(apiKey, 'avgAllPrice.do');
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

async function getAreas(apiKey) {
  const rows = await opinet(apiKey, 'areaCode.do');
  return rows.map((r) => ({ code: r.AREA_CD, name: r.AREA_NM }));
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin');
    const cors = ALLOWED_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    const json = (status, body) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors },
      });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname, searchParams } = new URL(req.url);
    if (!env.OPINET_API_KEY) return json(500, { error: 'API 키가 없어요. Worker에 OPINET_API_KEY 비밀 변수를 넣어 주세요.' });
    try {
      if (pathname === '/api/oil-price') {
        const sido = searchParams.get('sido');
        return json(200, await getOilPrice(env.OPINET_API_KEY, /^\d{2}$/.test(sido ?? '') ? sido : null));
      }
      if (pathname === '/api/areas') return json(200, await getAreas(env.OPINET_API_KEY));
      return json(404, { error: '없는 API예요.' });
    } catch (err) {
      console.error(err);
      return json(502, { error: '오피넷에서 가격을 가져오지 못했어요.' });
    }
  },
};
