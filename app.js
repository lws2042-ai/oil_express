'use strict';

/* =========================================================
 * 저장소
 * 지금은 브라우저 localStorage에 저장합니다.
 * 필드 이름은 schema.sql의 customers 테이블과 같게 맞춰 두었으니,
 * 나중에 Supabase로 옮길 때는 이 store 객체만 바꾸면 됩니다.
 * ========================================================= */
const STORAGE_KEY = 'oilExpress.customers.v1';

const store = {
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  },
};

/* ---------- 아이콘 ---------- */
const ICONS = {
  drop: '<path d="M12 2.5c3.4 4.1 7 8.3 7 12.1A7 7 0 0 1 5 14.6c0-3.8 3.6-8 7-12.1Z"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  nav: '<path d="m3 11 19-9-9 19-2-8-8-2Z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  searchX: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2M8.5 8.5l5 5M13.5 8.5l-5 5"/>',
  fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.8a2 2 0 0 0-.6-1.4L18 5"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
};

const svg = (name) =>
  `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- 유틸 ---------- */
const $ = (sel) => document.querySelector(sel);

const uid = () =>
  crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const digitsOnly = (s) => String(s).replace(/\D/g, '');

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// 010-1234-5678, 02-123-4567, 031-123-4567 형태로 자동 하이픈
function formatPhone(value) {
  const raw = digitsOnly(value);
  if (raw.startsWith('02')) {
    const d = raw.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  const d = raw.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const naverMapUrl = (address) => `https://map.naver.com/p/search/${encodeURIComponent(address)}`;

const AVATAR_COLORS = [
  ['#ffa04d', '#ef5a00'],
  ['#6b95ff', '#3a5bdc'],
  ['#34cdb0', '#0f9479'],
  ['#b67bff', '#7a3fe0'],
  ['#ff7b97', '#df3460'],
  ['#f7c04a', '#d48a00'],
];

function avatarStyle(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  const [a, b] = AVATAR_COLORS[h % AVATAR_COLORS.length];
  return `background:linear-gradient(140deg,${a},${b})`;
}

const initial = (name) => Array.from(name.trim())[0] ?? '?';

/* ---------- 상태 ---------- */
let customers = store.load();
let sortMode = 'recent';
let query = '';
let editingId = null;
let currentId = null;
let highlightId = null;

const els = {
  count: $('#count'),
  search: $('#search'),
  clearSearch: $('#clearSearch'),
  resultInfo: $('#resultInfo'),
  list: $('#list'),
  empty: $('#empty'),
  overlay: $('#overlay'),
  formSheet: $('#formSheet'),
  formTitle: $('#formTitle'),
  form: $('#form'),
  submitBtn: $('#submitBtn'),
  detailSheet: $('#detailSheet'),
  detailBody: $('#detailBody'),
  confirm: $('#confirm'),
  confirmOverlay: $('#confirmOverlay'),
  confirmDesc: $('#confirmDesc'),
  toast: $('#toast'),
  toastText: $('#toastText'),
  toastAction: $('#toastAction'),
};

const fields = {
  name: $('#fName'),
  phone: $('#fPhone'),
  address: $('#fAddress'),
  address_detail: $('#fDetail'),
  memo: $('#fMemo'),
};

function persist() {
  if (!store.save(customers)) showToast('저장 공간이 부족해 저장하지 못했어요');
}

/* ---------- 목록 렌더링 ---------- */
function getVisible() {
  const q = query.trim().toLowerCase();
  const qDigits = digitsOnly(q);
  const items = q
    ? customers.filter((c) =>
        [c.name, c.address, c.address_detail, c.memo].some((v) => (v || '').toLowerCase().includes(q)) ||
        (qDigits.length >= 2 && c.phone_digits.includes(qDigits)))
    : [...customers];

  if (sortMode === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  else items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return items;
}

function cardHTML(c, i) {
  const address = [c.address, c.address_detail].filter(Boolean).join(' ');
  return `
    <li class="card${c.id === highlightId ? ' is-new' : ''}" style="--i:${Math.min(i, 12)}">
      <button type="button" class="card-main" data-open="${escapeHtml(c.id)}">
        <span class="avatar" style="${avatarStyle(c.name)}">${escapeHtml(initial(c.name))}</span>
        <span class="card-body">
          <span class="card-name">${escapeHtml(c.name)}</span>
          <span class="card-phone">${escapeHtml(c.phone)}</span>
          <span class="card-addr">${svg('pin')}<span>${escapeHtml(address)}</span></span>
        </span>
      </button>
      <a class="card-call" href="tel:${c.phone_digits}" aria-label="${escapeHtml(c.name)}에게 전화">${svg('phone')}</a>
    </li>`;
}

function emptyHTML() {
  if (!customers.length) {
    return `
      <div class="empty-art">${svg('users')}</div>
      <h3>아직 등록된 고객이 없어요</h3>
      <p>단골 고객의 전화번호와 배달 주소를 등록해 두면<br>통화 후 바로 찾아 지도로 볼 수 있어요.</p>
      <div class="empty-actions">
        <button type="button" class="btn btn-primary btn--sm" data-empty="add">${svg('plus')}첫 고객 등록하기</button>
        <button type="button" class="btn btn-ghost btn--sm" data-empty="sample">샘플 고객으로 둘러보기</button>
      </div>`;
  }
  return `
    <div class="empty-art">${svg('searchX')}</div>
    <h3>‘${escapeHtml(query.trim())}’ 고객이 없어요</h3>
    <p>처음 보는 번호라면 바로 새 고객으로 등록해 보세요.</p>
    <div class="empty-actions">
      <button type="button" class="btn btn-primary btn--sm" data-empty="add-from-query">${svg('plus')}새 고객으로 등록</button>
    </div>`;
}

function render() {
  const items = getVisible();
  els.count.textContent = customers.length;
  els.resultInfo.innerHTML = query.trim()
    ? `검색 결과 <strong>${items.length}</strong>명`
    : `전체 <strong>${items.length}</strong>명`;

  els.list.innerHTML = items.map(cardHTML).join('');
  els.empty.hidden = items.length > 0;
  if (!items.length) els.empty.innerHTML = emptyHTML();
  highlightId = null;
}

/* ---------- 바텀 시트 ----------
 * 시트를 열 때 history에 한 칸을 넣어, 안드로이드 뒤로가기 버튼으로 시트가 닫히게 합니다.
 */
let activeSheet = null;

function setSheetOpen(sheet, open) {
  sheet.classList.toggle('is-open', open);
  sheet.inert = !open;
  sheet.setAttribute('aria-hidden', String(!open));
}

function openSheet(sheet) {
  if (activeSheet === sheet) return;
  if (activeSheet) setSheetOpen(activeSheet, false);
  else history.pushState({ oeSheet: true }, '');
  activeSheet = sheet;
  setSheetOpen(sheet, true);
  els.overlay.classList.add('is-open');
  document.body.classList.add('is-locked');
}

function closeSheet() {
  if (activeSheet) history.back();
}

function hideSheet() {
  if (!activeSheet) return;
  setSheetOpen(activeSheet, false);
  activeSheet = null;
  els.overlay.classList.remove('is-open');
  document.body.classList.remove('is-locked');
}

window.addEventListener('popstate', () => {
  hideConfirm();
  hideSheet();
});

if (history.state?.oeSheet) history.replaceState(null, '');

/* ---------- 상세 ---------- */
function openDetail(id) {
  const c = customers.find((x) => x.id === id);
  if (!c) return;
  currentId = id;

  const edited = formatDate(c.updated_at) !== formatDate(c.created_at);
  els.detailBody.innerHTML = `
    <div class="profile">
      <div class="avatar avatar--lg" style="${avatarStyle(c.name)}">${escapeHtml(initial(c.name))}</div>
      <h2 class="profile-name">${escapeHtml(c.name)}</h2>
      <p class="profile-phone">${escapeHtml(c.phone)}</p>
    </div>

    <div class="actions">
      <a class="action action--call" href="tel:${c.phone_digits}"><span class="action-ic">${svg('phone')}</span>전화</a>
      <a class="action action--sms" href="sms:${c.phone_digits}"><span class="action-ic">${svg('message')}</span>문자</a>
      <a class="action action--map" href="${naverMapUrl(c.address)}" target="_blank" rel="noopener"><span class="action-ic">${svg('nav')}</span>네이버 지도</a>
    </div>

    <dl class="info">
      <div class="info-row">
        <dt>배달 주소</dt>
        <dd>
          ${escapeHtml(c.address)}
          ${c.address_detail ? `<span class="info-sub">${escapeHtml(c.address_detail)}</span>` : ''}
          <button type="button" class="chip" data-action="copy">${svg('copy')}주소 복사</button>
        </dd>
      </div>
      ${c.memo ? `<div class="info-row"><dt>메모</dt><dd class="memo">${escapeHtml(c.memo)}</dd></div>` : ''}
      <div class="info-row info-row--meta">
        <dt>등록일</dt>
        <dd>${formatDate(c.created_at)}${edited ? ` · 수정 ${formatDate(c.updated_at)}` : ''}</dd>
      </div>
    </dl>

    <div class="detail-foot">
      <button type="button" class="btn btn-ghost" data-action="edit">${svg('edit')}수정</button>
      <button type="button" class="btn btn-danger" data-action="delete">${svg('trash')}삭제</button>
    </div>`;

  els.detailBody.scrollTop = 0;
  openSheet(els.detailSheet);
}

/* ---------- 등록 / 수정 폼 ---------- */
function clearErrors() {
  els.form.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error', 'shake'));
}

function setError(key, message) {
  const field = fields[key].closest('.field');
  field.querySelector('.field-error').textContent = message;
  field.classList.remove('shake');
  void field.offsetWidth; // 흔들림 애니메이션 재시작
  field.classList.add('has-error', 'shake');
}

function openForm(id = null, prefill = {}) {
  editingId = id;
  const c = id ? customers.find((x) => x.id === id) : null;
  const data = c ?? prefill;

  for (const [key, input] of Object.entries(fields)) input.value = data[key] ?? '';
  els.formTitle.textContent = c ? '고객 정보 수정' : '새 고객 등록';
  els.submitBtn.textContent = c ? '수정 완료' : '등록하기';
  clearErrors();
  els.form.scrollTop = 0;
  openSheet(els.formSheet);

  if (!c) setTimeout(() => (prefill.name ? fields.phone : fields.name).focus(), 350);
}

fields.phone.addEventListener('input', () => {
  fields.phone.value = formatPhone(fields.phone.value);
});

for (const input of Object.values(fields)) {
  input.addEventListener('input', () => input.closest('.field').classList.remove('has-error'));
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();

  const data = {
    name: fields.name.value.trim(),
    phone: formatPhone(fields.phone.value),
    address: fields.address.value.trim(),
    address_detail: fields.address_detail.value.trim(),
    memo: fields.memo.value.trim(),
  };
  const phoneDigits = digitsOnly(data.phone);

  const errors = {};
  if (!data.name) errors.name = '이름이나 상호를 입력해 주세요.';
  if (phoneDigits.length < 9) {
    errors.phone = '전화번호를 정확히 입력해 주세요.';
  } else {
    const dup = customers.find((c) => c.phone_digits === phoneDigits && c.id !== editingId);
    if (dup) errors.phone = `이미 등록된 번호예요 · ${dup.name}`;
  }
  if (!data.address) errors.address = '배달 주소를 입력해 주세요.';

  const errorKeys = Object.keys(errors);
  if (errorKeys.length) {
    errorKeys.forEach((key) => setError(key, errors[key]));
    fields[errorKeys[0]].focus();
    return;
  }

  const now = new Date().toISOString();

  if (editingId) {
    const c = customers.find((x) => x.id === editingId);
    Object.assign(c, data, { phone_digits: phoneDigits, updated_at: now });
    persist();
    render();
    openDetail(c.id);
    showToast('고객 정보를 수정했어요');
  } else {
    const c = {
      id: uid(),
      ...data,
      phone_digits: phoneDigits,
      lat: null,
      lng: null,
      created_at: now,
      updated_at: now,
    };
    customers.push(c);
    persist();
    query = '';
    els.search.value = '';
    els.clearSearch.hidden = true;
    highlightId = c.id;
    render();
    closeSheet();
    showToast(`${c.name} 님을 등록했어요`);
  }
});

/* ---------- 삭제 확인 ---------- */
let onConfirm = null;

function openConfirm(c, onOk) {
  onConfirm = onOk;
  els.confirmDesc.innerHTML = `<strong>${escapeHtml(c.name)}</strong> 님의 정보가 삭제돼요.<br>삭제 직후에는 되돌릴 수 있어요.`;
  els.confirm.inert = false;
  els.confirm.setAttribute('aria-hidden', 'false');
  els.confirm.classList.add('is-open');
  els.confirmOverlay.classList.add('is-open');
  $('#confirmCancel').focus();
}

function hideConfirm() {
  onConfirm = null;
  els.confirm.inert = true;
  els.confirm.setAttribute('aria-hidden', 'true');
  els.confirm.classList.remove('is-open');
  els.confirmOverlay.classList.remove('is-open');
}

$('#confirmCancel').addEventListener('click', hideConfirm);
els.confirmOverlay.addEventListener('click', hideConfirm);
$('#confirmOk').addEventListener('click', () => {
  const fn = onConfirm;
  hideConfirm();
  fn?.();
});

function deleteCustomer(id) {
  const index = customers.findIndex((x) => x.id === id);
  if (index < 0) return;
  const [removed] = customers.splice(index, 1);
  persist();
  render();
  closeSheet();
  showToast(`${removed.name} 님을 삭제했어요`, {
    label: '되돌리기',
    onClick() {
      customers.splice(Math.min(index, customers.length), 0, removed);
      persist();
      highlightId = removed.id;
      render();
      showToast('다시 복구했어요');
    },
  });
}

/* ---------- 토스트 ---------- */
let toastTimer = null;

function showToast(message, action) {
  clearTimeout(toastTimer);
  els.toastText.textContent = message;
  els.toastAction.hidden = !action;
  els.toastAction.textContent = action?.label ?? '';
  els.toastAction.onclick = action
    ? () => {
        els.toast.classList.remove('is-show');
        action.onClick();
      }
    : null;
  els.toast.classList.add('is-show');
  toastTimer = setTimeout(() => els.toast.classList.remove('is-show'), action ? 5000 : 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/* ---------- 샘플 데이터 ---------- */
function addSamples() {
  const now = Date.now();
  const samples = [
    { name: '김영수', phone: '010-2345-6789', address: '울산광역시 남구 삼산로 274', address_detail: '뒷마당 보일러실 옆', memo: '보일러등유 200L\n현금 결제' },
    { name: '한빛농원', phone: '010-5555-1212', address: '울산광역시 북구 농소로 120', address_detail: '비닐하우스 3동 앞 탱크', memo: '실내등유 · 월말 일괄 결제' },
    { name: '박순자', phone: '010-9876-5432', address: '울산광역시 울주군 언양읍 헌양길 49', address_detail: '', memo: '어르신 혼자 계심. 도착 전 전화 필수' },
  ];
  samples.forEach((s, i) => {
    const at = new Date(now - (samples.length - i) * 60000).toISOString();
    customers.push({ id: uid(), ...s, phone_digits: digitsOnly(s.phone), lat: null, lng: null, created_at: at, updated_at: at });
  });
  persist();
  render();
  showToast('샘플 고객 3명을 넣었어요');
}

/* ---------- 이벤트 ---------- */
els.search.addEventListener('input', () => {
  query = els.search.value;
  els.clearSearch.hidden = !query;
  render();
});

els.clearSearch.addEventListener('click', () => {
  els.search.value = '';
  query = '';
  els.clearSearch.hidden = true;
  render();
  els.search.focus();
});

document.querySelectorAll('.seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    sortMode = btn.dataset.sort;
    document.querySelectorAll('.seg-btn').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    render();
  });
});

els.list.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open]');
  if (btn) openDetail(btn.dataset.open);
});

els.empty.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-empty]');
  if (!btn) return;
  const kind = btn.dataset.empty;
  if (kind === 'sample') addSamples();
  else if (kind === 'add') openForm();
  else if (kind === 'add-from-query') {
    const q = query.trim();
    openForm(null, digitsOnly(q).length >= 9 ? { phone: formatPhone(q) } : { name: q });
  }
});

els.detailBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const c = customers.find((x) => x.id === currentId);
  if (!c) return;

  if (btn.dataset.action === 'edit') openForm(c.id);
  else if (btn.dataset.action === 'delete') openConfirm(c, () => deleteCustomer(c.id));
  else if (btn.dataset.action === 'copy') {
    const ok = await copyText([c.address, c.address_detail].filter(Boolean).join(' '));
    showToast(ok ? '주소를 복사했어요' : '복사하지 못했어요');
  }
});

$('#fab').addEventListener('click', () => openForm());
els.overlay.addEventListener('click', closeSheet);
document.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', closeSheet));

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (els.confirm.classList.contains('is-open')) hideConfirm();
  else closeSheet();
});

/* ---------- 시작 ---------- */
document.querySelectorAll('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', svg(el.dataset.icon)));
render();
