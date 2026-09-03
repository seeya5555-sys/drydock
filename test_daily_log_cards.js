const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
global.VID = null;
global.renderClass = () => {};
global.renderDisc = () => {};
global.document = { getElementById: () => null };
require('./static/js/dd-cards.js');

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
  global.discCollapsed = new Set(['2026-09-02', '2026-09-03']);
  let renders = 0;
  global.renderDisc = () => { renders += 1; };
  window._ddDscExp.clear();

  _ddToggleDailyAll();
  assert.deepEqual([...discCollapsed], []);
  assert.deepEqual([...window._ddDscExp], ['10', '11']);

  _ddToggleDailyAll();
  assert.deepEqual([...discCollapsed], ['2026-09-02', '2026-09-03']);
  assert.deepEqual([...window._ddDscExp], []);
  assert.equal(renders, 2);
});
