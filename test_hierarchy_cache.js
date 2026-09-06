const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('static/js/app.js', 'utf8');
const parent = source.match(/function getParentNumber\(num\) \{[\s\S]*?\n\}/)[0];
const child = source.match(/let JOB_HIERARCHY_CACHE = new WeakMap\(\);[\s\S]*?function hasChildren\(num, jobs\) \{[\s\S]*?\n\}/)[0];
const sorter = source.match(/function sortJobTree\(jobs\) \{[\s\S]*?\n\}\n\n\/\/ 접힌 상태/)[0].replace(/\n\n\/\/ 접힌 상태[\s\S]*/, '');
const pnum = source.match(/function pNum\(n\)\{[\s\S]*?\n\}/)[0];
const context = {};
vm.createContext(context); vm.runInContext(parent+'\n'+child+'\n'+pnum+'\n'+sorter, context);

test('nearest-existing-parent semantics and render invalidation', () => {
  const jobs = [{number:'R'},{number:'R1.1'},{number:''}];
  assert.equal(context.hasChildren('R', jobs), true);
  assert.equal(context.hasChildren('R1.1', jobs), false);
  jobs[1].number = 'X1';
  vm.runInContext('JOB_HIERARCHY_CACHE = new WeakMap()', context);
  assert.equal(context.hasChildren('R', jobs), false);
});

test('sort keeps nearest-existing-parent and fallback order', () => {
  const jobs = [{number:'R1.1B'},{number:'R'},{number:'X'},{number:'R1.2'},{number:'R1'}];
  assert.deepEqual(Array.from(context.sortJobTree(jobs), j=>j.number), ['R','R1','R1.1B','R1.2','X']);
  const missing = [{number:'R1.1'},{number:'R'}];
  assert.deepEqual(Array.from(context.sortJobTree(missing), j=>j.number), ['R','R1.1']);
});
