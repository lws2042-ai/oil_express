'use strict';

/* 오늘의 유가: server.js의 /api/oil-price를 통해 오피넷 가격을 가져옵니다.
 * (API 키는 서버의 .env에만 있고 이 화면 코드에는 없습니다)
 * GitHub Pages에서는 server.js가 없으므로 Cloudflare Worker(worker/worker.js)로 요청합니다. */
const AREA_KEY = 'oilExpress.priceArea';
const API_BASE = location.hostname.endsWith('github.io') ? 'https://oil-express-api.lws2042-ai.workers.dev' : '';

const ICONS = {
  back: '<path d="m15 18-6-6 6-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a6 6 0 0 1-12 0V8Z"/>',
};

const svg = (name) =>
  `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const $ = (sel) => document.querySelector(sel);
const els = { prices: $('#prices'), date: $('#dateText'), area: $('#area'), refresh: $('#refresh') };

const DOT = { C004: '#fff', D047: '#2ec4a6', B027: '#f5b82e' };

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const storage = {
  get() {
    try { return localStorage.getItem(AREA_KEY) ?? ''; } catch { return ''; }
  },
  set(v) {
    try { localStorage.setItem(AREA_KEY, v); } catch { /* 저장 못 해도 무시 */ }
  },
};

function formatKoreanDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const week = '일월화수목금토'[d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${week}) 기준`;
}

function diffHTML(diff) {
  if (!diff) return '<p class="price-diff">– 변동 없음</p>';
  const up = diff > 0;
  return `<p class="price-diff ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(diff).toFixed(2)}원 <small>전일 대비</small></p>`;
}

function cardHTML(item) {
  const [int, dec] = item.price.toFixed(2).split('.');
  const hero = item.code === 'C004';
  return `
    <article class="price-card${hero ? ' price-card--hero' : ''}" style="--dot:${DOT[item.code] ?? 'var(--brand)'}">
      <div class="price-head">
        <span class="price-dot"></span>
        <h2>${escapeHtml(item.name)}</h2>
        ${hero ? '<span class="price-tag">배달 주력</span>' : ''}
      </div>
      <p class="price-value">
        <strong>${Number(int).toLocaleString('ko-KR')}</strong><span class="price-dec">.${dec}</span><span class="price-unit">원/L</span>
      </p>
      ${diffHTML(item.diff)}
    </article>`;
}

function noticeHTML(icon, title, body) {
  return `
    <div class="notice">
      <div class="notice-ic">${svg(icon)}</div>
      <h2>${title}</h2>
      <p>${body}</p>
    </div>`;
}

async function getJson(url) {
  const res = await fetch(API_BASE + url, { cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `요청 실패 (${res.status})`);
  return data;
}

async function loadPrices() {
  els.refresh.classList.add('is-loading');
  els.refresh.disabled = true;
  els.prices.innerHTML = '<div class="skeleton skeleton--hero"></div><div class="skeleton"></div><div class="skeleton"></div>';

  try {
    const sido = els.area.value;
    const data = await getJson(`/api/oil-price${sido ? `?sido=${sido}` : ''}`);
    els.date.textContent = formatKoreanDate(data.date);

    els.prices.innerHTML = data.items.length
      ? data.items.map(cardHTML).join('')
      : noticeHTML('alert', '가격 정보를 받지 못했어요', '오피넷이 빈 결과를 보냈어요.<br>오피넷 사이트에서 API 키가 <b>승인(사용 가능)</b> 상태인지 확인해 주세요.');
  } catch (err) {
    els.date.textContent = '가격을 불러오지 못했어요';
    els.prices.innerHTML =
      location.protocol === 'file:'
        ? noticeHTML('plug', '서버로 열어 주세요', '이 페이지는 파일을 더블클릭해서는 동작하지 않아요.<br>터미널에서 <code>node server.js</code> 실행 후<br><code>http://localhost:3000</code> 으로 접속해 주세요.')
        : noticeHTML('alert', '가격을 불러오지 못했어요', `${escapeHtml(err.message)}<br>잠시 후 새로고침해 주세요.`);
  } finally {
    els.refresh.classList.remove('is-loading');
    els.refresh.disabled = false;
  }
}

async function loadAreas() {
  try {
    const areas = await getJson('/api/areas');
    els.area.insertAdjacentHTML(
      'beforeend',
      areas.map((a) => `<option value="${escapeHtml(a.code)}">${escapeHtml(a.name)}</option>`).join(''),
    );
    const saved = storage.get();
    if (areas.some((a) => a.code === saved)) els.area.value = saved;
  } catch {
    // 지역 목록을 못 받으면 전국 평균만 보여줌
  }
}

els.area.addEventListener('change', () => {
  storage.set(els.area.value);
  loadPrices();
});
els.refresh.addEventListener('click', loadPrices);

document.querySelectorAll('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', svg(el.dataset.icon)));

loadAreas().then(loadPrices);
