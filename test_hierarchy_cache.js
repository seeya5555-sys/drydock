const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('static/js/app.js', 'utf8');
const parent = source.match(/function getParentNumber\(num\) \{[\s\S]*?\n\}/)[0];
const child = source.match(/let JOB_HIERARCHY_CACHE = new WeakMap\(\);[\s\S]*?function hasChildren\(num, jobs\) \{[\s\S]*?\n\}/)[0];
const context = {};
vm.createContext(context); vm.runInContext(parent+'\n'+child, context);

test('nearest-existing-parent semantics and render invalidation', () => {
  const jobs = [{number:'R'},{number:'R1.1'},{number:''}];
  assert.equal(context.hasChildren('R', jobs), true);
  assert.equal(context.hasChildren('R1.1', jobs), false);
  jobs[1].number = 'X1';
  vm.runInContext('JOB_HIERARCHY_CACHE = new WeakMap()', context);
  assert.equal(context.hasChildren('R', jobs), false);
});
