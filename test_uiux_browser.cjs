// Synthetic DOM, actual production interaction code. No live server or business writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const read=p=>fs.readFileSync(p,'utf8');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.DOCK_BROWSER_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try{
    const page=await browser.newPage();
    const requests=[];
    await page.route('**/*',r=>{requests.push(r.request().url());return r.abort();});
    await page.setContent(`<style>.modal-overlay{display:none}.modal-overlay.open{display:block}</style>
      <button id="origin" onclick="openM('m-test')">Open</button>
      <div class="modal-overlay" id="m-test"><div class="modal"><h2 class="modal-title">Edit fixture</h2><button class="modal-x" onclick="closeM('m-test')">×</button><input id="field"><button id="last">Save</button></div></div>
      <div class="modal-overlay" id="m-child"><div class="modal"><h2 class="modal-title">Attachment</h2><button onclick="closeM('m-child')">Close attachment</button></div></div>
      <div id="vt-dashboard" class="page active"></div><button class="vnav-btn" onclick="showTab('dashboard',this)">Dashboard</button>
      <div id="vt-jobs" class="page"></div><button class="vnav-btn" onclick="showTab('jobs',this)">Jobs</button>
      <button id="trackingTriggerBtn"></button><div id="trackingMenu"></div>
      <div id="edits"></div><div class="table-wrap"><table><tbody id="c-body"></tbody></table></div>`);
    const app=read('static/js/app.js');
    await page.addScriptTag({content:app.slice(app.indexOf('function openM(id)'),app.indexOf('function setBreadcrumb(items)'))});
    await page.evaluate(()=>{
      window.opened=0; window.viewer=false; window.VID='fixture';
      window.isViewer=()=>window.viewer; window.renderClass=()=>{}; window.renderDisc=()=>{};
      window.FLEET={fixture:{classItems:[{_id:7,no:'1',finding:'Fixture finding',description:'Read and copy this description'}]}};
      window.openClassModal=index=>{window.classIndex=index;openM('m-test');};
      window.showTab=tab=>{document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='vt-'+tab));};
    });
    await page.addScriptTag({content:read('static/js/dd-cards.js')});
    await page.addScriptTag({content:read('static/js/dock-accessibility.js')});
    await page.locator('#origin').click();
    assert.equal(await page.locator('.modal[role="dialog"]').first().getAttribute('aria-labelledby'),'m-test-label');
    assert.equal(await page.evaluate(()=>document.activeElement.className),'modal');
    await page.keyboard.press('Shift+Tab'); assert.equal(await page.evaluate(()=>document.activeElement.id),'last');
    await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.className),'modal-x');
    await page.evaluate(()=>openM('m-child'));
    await page.getByText('Close attachment',{exact:true}).click();
    assert.equal(await page.evaluate(()=>document.activeElement.className),'modal-x');
    await page.locator('#m-test .modal-x').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'origin');
    await page.evaluate(()=>{document.getElementById('edits').innerHTML='<span class="cell-edit" onclick="window.opened++">Editable</span>';});
    const cell=page.locator('.cell-edit');
    await cell.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    assert.equal(await page.evaluate(()=>window.opened),2);
    await cell.evaluate(node=>{const range=document.createRange();range.selectNodeContents(node);getSelection().removeAllRanges();getSelection().addRange(range);node.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));});
    assert.equal(await page.evaluate(()=>window.opened),2,'selection must not start editing');
    await page.evaluate(()=>getSelection().removeAllRanges());
    await page.getByText('Jobs',{exact:true}).click();
    assert.equal(await page.getByText('Jobs',{exact:true}).getAttribute('aria-current'),'page');
    assert.equal(await page.getByText('Dashboard',{exact:true}).getAttribute('aria-current'),null);
    await page.evaluate(()=>renderClass());
    await page.getByText('Fixture finding',{exact:true}).focus(); await page.keyboard.press('Enter');
    assert.equal(await page.getByText('Fixture finding',{exact:true}).getAttribute('aria-expanded'),'true');
    const description=page.locator('.dock-edit-surface');
    await description.focus(); await page.keyboard.press('Space');
    assert.equal(await page.evaluate(()=>window.classIndex),0);
    await page.locator('#m-test .modal-x').click();
    await page.evaluate(()=>{window.viewer=true;renderClass();});
    assert.equal(await page.locator('.dock-edit-surface').count(),0,'viewer must not gain an edit surface');
    await page.evaluate(()=>{
      window.viewer=false;
      document.body.insertAdjacentHTML('beforeend','<div id="m-tank-body"></div><div id="m-pipe-body"></div>');
      window._curTankName=window._curPipeTankName='Tank A';
      window._editTankItemId=window._editPipeItemId=null;
      window.priorityBadge=()=>'';
      FLEET.fixture.steel=[{id:11,position_tank:'Tank A',description:'Steel fixture'}];
      FLEET.fixture.pipe=[{id:12,position_tank:'Tank A',description:'Pipe fixture'}];
      window.startTankItemEdit=id=>window.tankEdit=id;
      window.startPipeItemEdit=id=>window.pipeEdit=id;
    });
    await page.addScriptTag({content:app.slice(app.indexOf('function _renderTankModalBody()'),app.indexOf('// ── Fit-up Reference Card'))});
    await page.addScriptTag({content:app.slice(app.indexOf('function _renderPipeModalBody()'),app.indexOf('// Pipe Plan → Pipe Repair'))});
    await page.evaluate(()=>{_renderTankModalBody();_renderPipeModalBody();});
    await page.locator('#m-tank-body .dock-edit-surface').click();
    await page.locator('#m-pipe-body .dock-edit-surface').focus(); await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(()=>[window.tankEdit,window.pipeEdit]),[11,12]);
    await page.evaluate(()=>{window.viewer=true;_renderTankModalBody();_renderPipeModalBody();});
    assert.equal(await page.locator('#m-tank-body .dock-edit-surface,#m-pipe-body .dock-edit-surface').count(),0);
    assert.equal(requests.length,0);
    console.log('PASS: keyboard inline/Class/Tank/Pipe, selection, viewer gating, dialog focus/stack/Tab/restore, nav state; network requests 0');
  }finally{
    let timer;
    try{await Promise.race([browser.close(),new Promise((_,reject)=>{timer=setTimeout(()=>{const error=new Error('Browser shutdown timeout');error.code='BROWSER_SHUTDOWN_TIMEOUT';reject(error);},10000);})]);}
    finally{clearTimeout(timer);}
  }
})().catch(error=>{console.error(error);process.exit(error.code==='BROWSER_SHUTDOWN_TIMEOUT'?2:1);});
