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
  global.persist = async (kind, items) => {
    assert.equal(kind, 'disc');
    assert.equal(items[0]._id, 10);
    saves += 1;
  };
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
  assert.equal(item.description, 'new detail');
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
    'd-q': { value: '' }, 'd-df': { value: '' }, 'd-sf': { value: '' }, 'd-pf': { value: '' },
    'd-cnt': { textContent: '' }, 'btn-daily-expand-all': { disabled: false, textContent: '', setAttribute: () => {} },
    'd-body': body, 'd-cards': host
  };
  global.document = { getElementById: id => elements[id] || null };
  window._ddSelectedDate = '';
  window._ddPreferredDate = '';
  cardRender();
  assert.match(host.innerHTML, /dd-date-sidebar/);
  assert.match(host.innerHTML, /2026-09-03/);
  assert.match(host.innerHTML, /남음 1/);
  assert.match(host.innerHTML, /완료 1/);
  assert.match(host.innerHTML, /긴급 1/);
  assert.equal(elements['d-cnt'].textContent, '남음 2 · 전체 3');
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
    'd-q': { value: '' }, 'd-df': { value: '2026-09-02' }, 'd-sf': { value: '' }, 'd-pf': { value: '' },
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
