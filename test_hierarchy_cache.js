const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('static/js/app.js', 'utf8');
const parent = source.match(/function getParentNumber\(num\) \{[\s\S]*?\n\}/)[0];
const child = source.match(/let JOB_HIERARCHY_CACHE = new WeakMap\(\);[\s\S]*?function hasChildren\(num, jobs\) \{[\s\S]*?\n\}/)[0];
const sorter = source.match(/function sortJobTree\(jobs\) \{[\s\S]*?\n\}\n\n\/\/ 접힌 상태/)[0].replace(/\n\n\/\/ 접힌 상태[\s\S]*/, '');
const pnum = source.match(/function pNum\(n\)\{[\s\S]*?\n\}/)[0];
const progress = source.match(/function calcProgress\(startDate, endDate\) \{[\s\S]*?\n\}/)[0];
const dates = source.match(/function computeParentDates\(jobs\) \{[\s\S]*?\n\}\n\n\/\/ 상위항목/)[0].replace(/\n\n\/\/ 상위항목[\s\S]*/, '');
const sums = source.match(/function computeParentSums\(jobs\) \{[\s\S]*?\n\}\n\nfunction renderJobs/)[0].replace(/\n\nfunction renderJobs[\s\S]*/, '');
const context = {};
vm.createContext(context); vm.runInContext(parent+'\n'+child+'\n'+pnum+'\n'+progress+'\n'+sorter+'\n'+dates+'\n'+sums, context);

test('nearest-existing-parent semantics and render invalidation', () => {
  const jobs = [{number:'R'},{number:'R1.1'},{number:''}];
  assert.equal(context.hasChildren('R', jobs), true);
  assert.equal(context.hasChildren('R1.1', jobs), false);
  jobs[1].number = 'X1';
  vm.runInContext('JOB_HIERARCHY_CACHE = new WeakMap()', context);
  assert.equal(context.hasChildren('R', jobs), false);
});

function reference(jobs){
  const parentOf=n=>context.getParentNumber(n);
  const has=(n)=>context.hasChildren(n,jobs);
  function descDirect(num){const out=[];for(const c of jobs)if(parentOf(c.number)===num){out.push(c);out.push(...descDirect(c.number));}return out;}
  for(const j of jobs){if(!has(j.number))continue;const ds=descDirect(j.number);if(!ds.length)continue;
    const starts=ds.map(d=>d.start_date).filter(s=>s&&s.trim()).sort();const ends=ds.map(d=>d.end_date).filter(s=>s&&s.trim()).sort().reverse();
    j._autoStart=starts.length?starts[0]:null;j._autoEnd=ends.length?ends[0]:null;}
  for(const j of jobs){if(!has(j.number)){j._autoSum=null;continue;}const ds=jobs.filter(d=>{if(d.number===j.number)return false;let p=parentOf(d.number);while(p){if(p===j.number)return true;p=parentOf(p);}return false;});
    if(!ds.length){j._autoSum=null;continue;}const leaves=ds.filter(d=>!has(d.number));const entered=leaves.filter(d=>(+d.completion||0)>0);const dated=leaves.filter(d=>d.start_date&&d.end_date);
    j._autoSum={budget:ds.reduce((s,d)=>s+(+d.budget||0),0),consumption:ds.reduce((s,d)=>s+(+d.consumption||0),0),
      completion:entered.length?Math.round(entered.reduce((s,d)=>s+(+d.completion),0)/entered.length):0,
      schedule:dated.length?Math.round(dated.reduce((s,d)=>s+(context.calcProgress(d.start_date,d.end_date)??0),0)/dated.length):0};}
}

test('parent date and sum optimization matches prior semantics',()=>{
  const seed=[
    {number:'R',budget:10,consumption:1,completion:0,start_date:'',end_date:''},
    {number:'R1',budget:100,consumption:10,completion:0,start_date:'',end_date:''},
    {number:'R1.1',budget:40,consumption:4,completion:20,start_date:'2026-01-01',end_date:'2026-01-03'},
    {number:'R1.1B',budget:5,consumption:1,completion:80,start_date:'2026-01-02',end_date:'2026-01-04'},
    {number:'R1.2',budget:60,consumption:6,completion:0,start_date:'',end_date:''},
    {number:'X1.1',budget:7,consumption:2,completion:100,start_date:'2026-02-01',end_date:'2026-02-01'},
  ];
  const old=JSON.parse(JSON.stringify(seed)),now=JSON.parse(JSON.stringify(seed));
  reference(old);context.JOB_HIERARCHY_CACHE=new WeakMap();context.computeParentDates(now);context.computeParentSums(now);
  assert.equal(JSON.stringify(now.map(j=>[j._autoStart??null,j._autoEnd??null,j._autoSum??null])),
               JSON.stringify(old.map(j=>[j._autoStart??null,j._autoEnd??null,j._autoSum??null])));
});

test('missing intermediate parent keeps dates but still rolls sums upward',()=>{
  const seed=[
    {number:'R',budget:0,consumption:0,completion:0,start_date:'',end_date:'',_autoStart:'keep',_autoEnd:'keep'},
    {number:'R1.1',budget:7,consumption:2,completion:100,start_date:'   ',end_date:'bad'},
  ];
  const old=JSON.parse(JSON.stringify(seed)),now=JSON.parse(JSON.stringify(seed));
  reference(old);vm.runInContext('JOB_HIERARCHY_CACHE = new WeakMap()',context);context.computeParentDates(now);context.computeParentSums(now);
  assert.equal(JSON.stringify(now.map(j=>[j._autoStart??null,j._autoEnd??null,j._autoSum??null])),
               JSON.stringify(old.map(j=>[j._autoStart??null,j._autoEnd??null,j._autoSum??null])));
  assert.equal(now[0]._autoStart,'keep');assert.equal(now[0]._autoSum.budget,7);
});

test('sort keeps nearest-existing-parent and fallback order', () => {
  const jobs = [{number:'R1.1B'},{number:'R'},{number:'X'},{number:'R1.2'},{number:'R1'}];
  assert.deepEqual(Array.from(context.sortJobTree(jobs), j=>j.number), ['R','R1','R1.1B','R1.2','X']);
  const missing = [{number:'R1.1'},{number:'R'}];
  assert.deepEqual(Array.from(context.sortJobTree(missing), j=>j.number), ['R','R1.1']);
});
