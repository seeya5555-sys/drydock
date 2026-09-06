const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
global.VID = null;
global.renderClass = () => {};
global.renderDisc = () => {};
global.document = { getElementById: () => null };
require('./static/js/dd-cards.js');
const cardRender = global.renderDisc;

test('date Add Log opens a new modal with that date selected', () => {
  const fields = { 'md-date': { value: '' }, 'md-date-pick': { value: '' } };
  global.document = { getElementById: id => fields[id] || null };
  global.isViewer = () => false;
  let opened = 'unset';
  global.openDiscModal = value => { opened = value; };
  let stopped = false, prevented = false;
  _ddAddLog({ preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } }, '2026-09-02');
  assert.equal(opened, null);
  assert.equal(fields['md-date'].value, '2026-09-02');
  assert.equal(fields['md-date-pick'].value, '2026-09-02');
  assert.equal(stopped, true);
  assert.equal(prevented, true);
});

test('date Add Log is blocked for a viewer', () => {
  global.isViewer = () => true;
  global.toast = () => {};
  let opened = false;
  global.openDiscModal = () => { opened = true; };
  _ddAddLog({ preventDefault: () => {}, stopPropagation: () => {} }, '2026-09-02');
  assert.equal(opened, false);
});

test('inline handler arguments also escape apostrophes', () => {
  assert.equal(_ddAttrArg("day's log"), 'day%27s%20log');
});

test('card inline edit matches content height and saves only from an explicit action', async () => {
  global.VID = 'v_1';
  const item = { _id: 10, item: 'old', description: 'detail' };
  global.FLEET = { v_1: { discussions: [item] } };
  global.isViewer = () => false;
  const made = [];
  function element(tag){
    const el = { tag, className: '', value: '', textContent: '', type: '', rows: 0,
      children: [], listeners: {}, style: {}, scrollHeight: tag==='textarea' ? 140 : 0,
      focus: () => {}, select: () => {},
      append: function(...nodes){ this.children.push(...nodes); },
      addEventListener: function(name, fn){ this.listeners[name] = fn; }
    };
    made.push(el); return el;
  }
  global.document = { createElement: element };
  let replacement = null, saves = 0;
  const node = { offsetHeight: 96, replaceWith: value => { replacement = value; } };
  const locked = new Set();
  global.mutateRow = async (key, operation) => {
    if(locked.has(key)) return null;
    locked.add(key);
    try { return await operation(); } finally { locked.delete(key); }
  };
  global.API = '/api';
  global.apiFetch = async (url, method, payload) => {
    assert.equal(url, '/api/discussions/10'); assert.equal(method, 'PUT');
    saves += 1; return { ...payload, _id: 10 };
  };
  global.dbD = value => value;
  global.buildDDF = () => {};
  global.renderDisc = () => {};
  _ddEditDaily({ stopPropagation: () => {} }, '10', node, 'description');
  const editor = made.find(el => el.tag === 'textarea');
  const saveBtn = made.find(el => el.textContent === '저장');
  const cancelBtn = made.find(el => el.textContent === '취소');
  assert.equal(replacement.className, 'dd-card-edit-wrap');
  assert.equal(editor.style.height, '140px');
  assert.ok(saveBtn); assert.ok(cancelBtn);
  editor.value = 'new detail';
  assert.equal(saves, 0, 'blur/입력만으로 자동 저장하면 안 됨');
  saveBtn.listeners.click({ preventDefault: () => {}, stopPropagation: () => {} });
  saveBtn.listeners.click({ preventDefault: () => {}, stopPropagation: () => {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(global.FLEET.v_1.discussions[0].description, 'new detail');
  assert.equal(saves, 1);
});

test('daily toggle expands and collapses date groups and cards together', () => {
  global.VID = 'v_1';
  global.FLEET = { v_1: { discussions: [
    { _id: 10, date: '2026-09-02' }, { _id: 11, date: '2026-09-03' }
  ] } };
  let renders = 0;
  global.renderDisc = () => { renders += 1; };
  window._ddDscExp.clear();
  window._ddVisibleDailyItems = global.FLEET.v_1.discussions;

  _ddToggleDailyAll();
  assert.deepEqual([...window._ddDscExp], ['10', '11']);

  _ddToggleDailyAll();
  assert.deepEqual([...window._ddDscExp], []);
  assert.equal(renders, 2);
});

test('sidebar date selection survives the hidden legacy date filter', () => {
  const df = { value: '2026-09-02' };
  global.document = { getElementById: id => id === 'd-df' ? df : null };
  global.renderDisc = () => {};
  _ddSelectDailyDate('2026-09-03');
  assert.equal(window._ddSelectedDate, '2026-09-03');
  assert.equal(window._ddPreferredDate, '2026-09-03');
  assert.equal(df.value, '');
});

test('Open and Close tabs drive the hidden compatibility status value', () => {
  const sf = { value: 'Open' };
  global.document = { getElementById: id => id === 'd-sf' ? sf : null };
  let renders = 0;
  global.renderDisc = () => { renders += 1; };
  _ddSetDailyStatusTab('Close');
  assert.equal(window._ddDailyStatusTab, 'Close');
  assert.equal(sf.value, 'Close');
  assert.equal(renders, 1);
});

test('status badge toggles one item with PUT and stops card expansion', async () => {
  global.VID = 'v_1';
  const item = { _id: 7, item: 'topic', status: 'Open' };
  global.FLEET = { v_1: { discussions: [item] } };
  global.isViewer = () => false;
  global.API = '/api';
  let request = null, stopped = false, prevented = false;
  global.apiFetch = async (url, method, body) => {
    request = { url, method, body: { ...body } };
    return { ...body, _id: 7 };
  };
  global.buildDDF = () => {};
  global.renderDisc = () => {};
  global.toast = () => {};
  _ddToggleDailyStatus({
    preventDefault: () => { prevented = true; },
    stopPropagation: () => { stopped = true; }
  }, '7');
  assert.equal(item.status, 'Close', 'UI should update optimistically');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(request, { url: '/api/discussions/7', method: 'PUT', body: { _id: 7, item: 'topic', status: 'Close' } });
  assert.equal(stopped, true);
  assert.equal(prevented, true);
});

test('failed status PUT rolls back and unlocks the item for retry', async () => {
  global.VID = 'v_1';
  const item = { _id: 8, item: 'topic', status: 'Open' };
  global.FLEET = { v_1: { discussions: [item] } };
  global.isViewer = () => false;
  global.API = '/api';
  global.apiFetch = async () => { throw new Error('offline'); };
  global.renderDisc = () => {};
  global.toast = () => {};
  global.setSS = () => {};
  _ddToggleDailyStatus({ preventDefault: () => {}, stopPropagation: () => {} }, '8');
  assert.equal(item.status, 'Close');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(item.status, 'Open');
  assert.equal(window._ddStatusSaving.has('8'), false);
});

test('daily render builds a date sidebar with remaining and completed counts', () => {
  global.VID = 'v_1';
  global.FLEET = { v_1: { discussions: [
    { _id: 1, date: '2026-09-03', item: 'open item', status: 'Open', priority: 'Urgent' },
    { _id: 2, date: '2026-09-03', item: 'done item', status: 'Close', priority: 'Normal' },
    { _id: 3, date: '2026-09-02', item: 'older', status: 'Open', priority: 'Normal' }
  ] } };
  const host = { innerHTML: '' };
  const wrap = { style: {}, parentNode: { insertBefore: () => {} } };
  const body = { closest: () => wrap };
  const elements = {
    'd-q': { value: '' }, 'd-df': { value: '' }, 'd-sf': { value: 'Open' }, 'd-pf': { value: '' },
    'd-cnt': { textContent: '' }, 'btn-daily-expand-all': { disabled: false, textContent: '', setAttribute: () => {} },
    'd-body': body, 'd-cards': host
  };
  global.document = { getElementById: id => elements[id] || null };
  window._ddSelectedDate = '';
  window._ddPreferredDate = '';
  cardRender();
  assert.equal(window._ddSelectedDate, '2026-09-02', 'earliest date should be selected by default');
  const earlyDateIndex = host.innerHTML.indexOf('dd-date-nav-date">2026-09-02');
  const laterDateIndex = host.innerHTML.indexOf('dd-date-nav-date">2026-09-03');
  assert.ok(earlyDateIndex >= 0, 'earliest sidebar date should be rendered');
  assert.ok(laterDateIndex >= 0, 'later sidebar date should be rendered');
  assert.ok(earlyDateIndex < laterDateIndex, 'earliest date should appear first in the sidebar');
  assert.match(host.innerHTML, /dd-date-sidebar/);
  assert.match(host.innerHTML, /2026-09-03/);
  assert.match(host.innerHTML, /남음 1/);
  assert.match(host.innerHTML, /긴급 1/);
  assert.equal(elements['d-cnt'].textContent, '남음 2 · 전체 2');
});

test('Today is consumed once and preferred date returns after a temporary filter fallback', () => {
  global.VID = 'v_1';
  global.FLEET = { v_1: { discussions: [
    { _id: 1, date: '2026-09-03', item: 'urgent', status: 'Open', priority: 'Urgent' },
    { _id: 2, date: '2026-09-02', item: 'normal', status: 'Open', priority: 'Normal' }
  ] } };
  const host = { innerHTML: '' };
  const wrap = { style: {}, parentNode: { insertBefore: () => {} } };
  const elements = {
    'd-q': { value: '' }, 'd-df': { value: '2026-09-02' }, 'd-sf': { value: 'Open' }, 'd-pf': { value: '' },
    'd-cnt': { textContent: '' }, 'btn-daily-expand-all': { disabled: false, textContent: '', setAttribute: () => {} },
    'd-body': { closest: () => wrap }, 'd-cards': host
  };
  global.document = { getElementById: id => elements[id] || null };
  cardRender();
  assert.equal(window._ddSelectedDate, '2026-09-02');
  assert.equal(window._ddPreferredDate, '2026-09-02');
  assert.equal(elements['d-df'].value, '', 'legacy/Today date filter must be consumed once');
  elements['d-pf'].value = 'Urgent';
  cardRender();
  assert.equal(window._ddSelectedDate, '2026-09-03', 'filtered view may temporarily fall back');
  assert.equal(window._ddPreferredDate, '2026-09-02', 'user preference must not be overwritten');
  elements['d-pf'].value = '';
  cardRender();
  assert.equal(window._ddSelectedDate, '2026-09-02');
});
