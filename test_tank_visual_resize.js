'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const listeners = {};
const classes = new Set();
const elements = Object.fromEntries([
  'tank-svg-wrap', 'pipe-svg-wrap',
  'tank-layout-visual-toolbar', 'pipe-layout-visual-toolbar',
  'btn-layout-edit-tank', 'btn-layout-edit-pipe', 'savePill', 'm-tank-layout', 'm-tank-summary', 'm-tank-body', 'toast'
].map(id => [id, {id, style:{}, innerHTML:'', classList:{add(){},remove(){}}}]));

const documentStub = {
  addEventListener(type, handler) { listeners[type] = handler; },
  getElementById(id) { return elements[id] || null; },
  querySelectorAll() { return []; },
  documentElement: {classList:{
    add(name){ classes.add(name); },
    remove(name){ classes.delete(name); }
  }}
};

const context = {
  console,
  document: documentStub,
  window: {addEventListener(){}, location:{}, innerWidth:1280},
  CURRENT_USER: {role:'editor', username:'test'},
  requestAnimationFrame(callback) { callback(); return 1; },
  cancelAnimationFrame(){},
  fetch: async () => ({ok:true,json:async()=>[]}),
  setTimeout, clearTimeout, setInterval, clearInterval,
  FormData: class {}, Blob: class {}, URL: {createObjectURL(){return '';},revokeObjectURL(){}},
};
vm.createContext(context);
let source = fs.readFileSync('static/js/app.js', 'utf8').replace(/\nloadAll\(\);\s*$/, '\n');
vm.runInContext(source, context);

function run(expression) { return vm.runInContext(expression, context); }
function pointerEvent(x, y, pointerId=1) {
  return {
    pointerId, clientX:x, clientY:y,
    preventDefault(){}, stopPropagation(){},
    currentTarget:{ownerSVGElement:{
      getBoundingClientRect(){return {width:1400,height:600};},
      viewBox:{baseVal:{width:1400,height:600}}
    }}
  };
}

run('_tankLayout=_defaultVLCCLayout(); _tankPlanData=[]; _pipePlanData=[];');
run("startVisualLayoutEdit('tank')");
assert.strictEqual(elements['tank-layout-visual-toolbar'].style.display, 'flex');
assert.strictEqual(elements['pipe-layout-visual-toolbar'].style.display, 'flex');
assert.match(elements['tank-svg-wrap'].innerHTML, /layout-handle-hit/);
assert.match(elements['pipe-svg-wrap'].innerHTML, /layout-handle-hit/);
assert.match(elements['tank-svg-wrap'].innerHTML, /cursor:col-resize/);
assert.match(elements['tank-svg-wrap'].innerHTML, /cursor:row-resize/);
assert.doesNotMatch(elements['tank-svg-wrap'].innerHTML, /onclick="openTankModal/);

const colBefore = run('_layoutEditing.sections[0].columns[3].w');
const colAfter = run('_layoutEditing.sections[0].columns[4].w');
context.resizeStart = pointerEvent(100, 100);
run("_startLayoutResize(resizeStart,'col',0,3)");
context.resizeMove = pointerEvent(130, 100);
run('_onLayoutResizeMove(resizeMove)');
assert.strictEqual(run('_layoutEditing.sections[0].columns[3].w'), colBefore + 30);
assert.strictEqual(run('_layoutEditing.sections[0].columns[4].w'), colAfter - 30);
assert.strictEqual(run('_layoutEditing.sections[0].columns[3].w+_layoutEditing.sections[0].columns[4].w'), colBefore+colAfter);

context.resizeMove = pointerEvent(-10000, 100);
run('_onLayoutResizeMove(resizeMove)');
assert.strictEqual(run('_layoutEditing.sections[0].columns[3].w'), 40);
assert.strictEqual(run('_layoutEditing.sections[0].columns[4].w'), colBefore+colAfter-40);

run('_finishLayoutResize({pointerId:1})');
const rowBefore = run('_layoutRowHeights(_layoutEditing.sections[0])');
context.resizeStart = pointerEvent(100, 100, 2);
run("_startLayoutResize(resizeStart,'row',0,0)");
context.resizeMove = pointerEvent(100, 125, 2);
run('_onLayoutResizeMove(resizeMove)');
const rowAfter = run('_layoutEditing.sections[0].rowHeights');
assert.deepStrictEqual(Array.from(rowAfter), [rowBefore[0]+25,rowBefore[1]-25,rowBefore[2]]);
assert.strictEqual(rowAfter.reduce((a,b)=>a+b,0), rowBefore.reduce((a,b)=>a+b,0));

run('_finishLayoutResize({pointerId:2}); cancelVisualLayoutEdit();');
assert.strictEqual(elements['tank-layout-visual-toolbar'].style.display, 'none');
assert.strictEqual(elements['pipe-layout-visual-toolbar'].style.display, 'none');
assert.doesNotMatch(elements['tank-svg-wrap'].innerHTML, /onpointerdown="_startLayoutResize/);
assert.match(elements['tank-svg-wrap'].innerHTML, /onclick="openTankModal/);
assert.strictEqual(classes.has('layout-resizing'), false);
assert.deepStrictEqual(Array.from(run('_layoutRowHeights({columns:[{c:{id:"C"}}]})')), [76,76,76]);

run(`_tankPlanData=[
  {position_tank:'COT 1P',new_weight:'100'},
  {position_tank:'COT 1P',length_l:'1000',width_w:'1000',thickness_t:'10'}
]; _renderPlanLayoutViews();`);
assert.match(elements['tank-svg-wrap'].innerHTML, /180\.0 kg/);
assert.match(elements['tank-svg-wrap'].innerHTML, /fill="#dc2626"[^>]*>180\.0 kg/);
run("_tankAssessments={COT1P:{steel_none:true,inspection_pending:false}}; _renderPlanLayoutViews();");
assert.match(elements['tank-svg-wrap'].innerHTML, /강재 수리 없음/);
assert.match(elements['tank-svg-wrap'].innerHTML, /fill="#16a34a"[^>]*>강재 수리 없음/);
run("_tankAssessments={COT1P:{steel_none:false,inspection_pending:true}}; _renderPlanLayoutViews();");
assert.match(elements['tank-svg-wrap'].innerHTML, />검사예정</);
assert.match(elements['tank-svg-wrap'].innerHTML, /fill="#2563eb"[^>]*>검사예정/);
assert.doesNotMatch(elements['tank-svg-wrap'].innerHTML, /\(검사예정\)/);
run("VID='test'; _planDataVID='test'; _tankPlanData=[]; _syncTankPlanSteelRow({id:99,position_tank:'WBT 5S',new_weight:'401.28'}); _renderPlanLayoutViews();");
assert.match(elements['tank-svg-wrap'].innerHTML, /401\.3 kg/);
run("_syncTankPlanSteelRow({id:99,priority:'Urgent',new_weight:undefined})");
assert.strictEqual(run("_tankPlanData[0].new_weight"), '401.28');
run("_syncTankPlanSteelRow({id:99},true)");
assert.strictEqual(run('_tankPlanData.length'), 0);

(async () => {
  context.apiCalls = [];
  context.apiMock = async (...args) => { context.apiCalls.push(args); return {success:true}; };
  run("apiFetch=apiMock; VID='test'; FLEET={test:{steel:[],pipe:[]}}; startVisualLayoutEdit('tank')");
  context.resizeStart = pointerEvent(100,100,3);
  run("_startLayoutResize(resizeStart,'row',0,0)");
  context.resizeMove = pointerEvent(100,112,3);
  run('_onLayoutResizeMove(resizeMove); _finishLayoutResize({pointerId:3})');
  await run('saveTankLayoutToDb()');
  assert.strictEqual(context.apiCalls.length, 1);
  assert.strictEqual(context.apiCalls[0][1], 'PUT');
  assert.deepStrictEqual(Array.from(context.apiCalls[0][2].sections[0].rowHeights), [88,64,76]);
  assert.strictEqual(elements['tank-layout-visual-toolbar'].style.display, 'none');
  context.apiMock = async () => { throw new Error('network down'); };
  run("apiFetch=apiMock; startVisualLayoutEdit('pipe')");
  await run('saveTankLayoutToDb()');
  assert.strictEqual(run('_visualLayoutEditing'), true);
  assert.strictEqual(elements['pipe-layout-visual-toolbar'].style.display, 'flex');
  run('cancelVisualLayoutEdit()');
  context.apiCalls = [];
  context.apiMock = async (...args) => { context.apiCalls.push(args); throw new Error('assessment save failed'); };
  run(`apiFetch=apiMock; VID='test'; FLEET={test:{steel:[]}}; _curTankId='COT1P'; _curTankName='COT 1P';
    _tankAssessmentSaving=false; _tankAssessments={}; _tankPlanData=[];`);
  await run("setTankAssessment('steel_none',true)");
  assert.strictEqual(run("Object.prototype.hasOwnProperty.call(_tankAssessments,'COT1P')"), false);
  assert.strictEqual(run('_tankAssessmentSaving'), false);
  context.apiMock = async (...args) => {
    context.apiCalls.push(args);
    return {...args[2],tank_id:'COT1P'};
  };
  run('apiFetch=apiMock');
  await run("setTankAssessment('steel_none',true)");
  assert.strictEqual(run("_tankAssessments.COT1P.steel_none"), true);
  assert.strictEqual(run("_tankAssessments.COT1P.inspection_pending"), false);
  await run("setTankAssessment('inspection_pending',true)");
  assert.strictEqual(run("_tankAssessments.COT1P.steel_none"), false);
  assert.strictEqual(run("_tankAssessments.COT1P.inspection_pending"), true);
  assert.strictEqual(context.apiCalls.length, 3);
  assert.strictEqual(context.apiCalls[2][1], 'PUT');
  assert.match(context.apiCalls[2][0], /tank_assessments\/COT1P$/);
  console.log('tank visual resize/runtime assessment: 40 assertions PASS');
})().catch(error => { console.error(error); process.exitCode=1; });
