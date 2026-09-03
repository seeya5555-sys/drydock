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

test('card inline edit keeps the id and persists only once on Enter then blur', async () => {
  global.VID = 'v_1';
  const item = { _id: 10, item: 'old', description: 'detail' };
  global.FLEET = { v_1: { discussions: [item] } };
  global.isViewer = () => false;
  const listeners = {};
  const editor = {
    className: '', value: '', focus: () => {}, select: () => {},
    addEventListener: (name, fn) => { listeners[name] = fn; }
  };
  global.document = { createElement: tag => { editor.tag = tag; return editor; } };
  let replacement = null, saves = 0;
  const node = { replaceWith: value => { replacement = value; } };
  global.persist = async (kind, items) => {
    assert.equal(kind, 'disc');
    assert.equal(items[0]._id, 10);
    saves += 1;
  };
  global.buildDDF = () => {};
  global.renderDisc = () => {};
  _ddEditDaily({ stopPropagation: () => {} }, '10', node, 'item');
  assert.equal(replacement, editor);
  assert.equal(editor.tag, 'input');
  editor.value = 'new topic';
  listeners.keydown({ key: 'Enter', preventDefault: () => {} });
  listeners.blur();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(item.item, 'new topic');
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
