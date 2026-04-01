// ══ STATE ════════════════════════════════════════════
let FLEET = {}, IDX = [];
let VID = null;          // current vessel id
let eJobIdx=null, eClsIdx=null, eDscIdx=null, eVesselNew=true;
let sKey='number', sDir=1;

const SK = {
  idx: 'fleet_idx',
  vi:  id=>`v_${id}_info`,
  vj:  id=>`v_${id}_jobs`,
  vc:  id=>`v_${id}_class`,
  vd:  id=>`v_${id}_disc`
};

const DEF_JOBS = [
  {number:'1.1',section:'GENERAL',category:'Shipyard',description:'Fixed fire fighting system isolation',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.2',section:'GENERAL',category:'Shipyard',description:'Ventilation fan',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.3',section:'GENERAL',category:'Shipyard',description:'Gas free inspection & certificate',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.4',section:'GENERAL',category:'Shipyard',description:'Gangway',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.5',section:'GENERAL',category:'Shipyard',description:'Pilot service',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.6',section:'GENERAL',category:'Shipyard',description:'Mooring rigger',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.7',section:'GENERAL',category:'Shipyard',description:'Tug service',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.8',section:'GENERAL',category:'Shipyard',description:'Fire line',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.9',section:'GENERAL',category:'Shipyard',description:'Fire watchman & Security service',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.10',section:'GENERAL',category:'Shipyard',description:'Ballasting',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.11',section:'GENERAL',category:'Shipyard',description:'Fresh water supply',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.12',section:'GENERAL',category:'Shipyard',description:'Shore power supply',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.13',section:'GENERAL',category:'Shipyard',description:'Dry dock space',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'1.14',section:'GENERAL',category:'Shipyard',description:'Wharfage',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'2.1',section:'PAINT',category:'Shipyard',description:'Hull blasting & painting',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'2.2',section:'PAINT',category:'Shipyard',description:'Boot top painting',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'2.3',section:'PAINT',category:'Shipyard',description:'Topside painting',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'2.4',section:'PAINT',category:'Shipyard',description:'Anti-fouling paint application',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'3.1',section:'STEEL',category:'Shipyard',description:'Hull steel renewal',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'3.2',section:'STEEL',category:'Shipyard',description:'Underwater hull inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'3.3',section:'STEEL',category:'Shipyard',description:'Sea chest cleaning & inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'3.4',section:'STEEL',category:'Shipyard',description:'Zinc anode renewal',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'3.5',section:'STEEL',category:'Shipyard',description:'Rudder inspection & repair',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'4.1',section:'DECK',category:'Shipyard',description:'Propeller polishing',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'4.2',section:'DECK',category:'Shipyard',description:'Anchor chain inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'4.3',section:'DECK',category:'Shipyard',description:'Steering gear inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'4.4',section:'DECK',category:'Shipyard',description:'Cargo hold inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'5.1',section:'ENGINE',category:'Shore Repair',description:'Main engine inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'5.2',section:'ENGINE',category:'Shore Repair',description:'Turbocharger overhaul',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'5.3',section:'ENGINE',category:'Shore Repair',description:'Auxiliary engine overhaul',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'5.4',section:'ENGINE',category:'Shore Repair',description:'Air compressor overhaul',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'5.5',section:'ENGINE',category:'Shore Repair',description:'Ballast water piping inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'6.1',section:'ELECTRIC',category:'Shore Repair',description:'Main switchboard inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'6.2',section:'ELECTRIC',category:'Shore Repair',description:'Generator overhaul',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'6.3',section:'ELECTRIC',category:'Shore Repair',description:'Navigation equipment inspection',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0},
  {number:'6.4',section:'ELECTRIC',category:'Shore Repair',description:'Fire detection system check',vendor:'',remarks:[],budget:0,consumption:0,start_date:'',end_date:'',duration:0}
];

// ══ FLASK REST API ════════════════════════════════════
const API = '/api';

function setSS(s){const el=document.getElementById('savePill');el.className='save-pill '+s;el.textContent=s==='saving'?'● SAVING…':s==='synced'?'● SYNCED':'● ERROR';}

async function apiFetch(url, method='GET', body=null){
  const opts={method, headers:{'Content-Type':'application/json'}};
  if(body!==null) opts.body=JSON.stringify(body);
  const res=await fetch(url,opts);
  if(!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.json();
}

async function persist(key, data){
  setSS('saving');
  try{
    if(key==='jobs'){
      const res = await apiFetch(`${API}/vessels/${VID}/jobs/bulk`,'PUT',data);
      FLEET[VID].jobs = res.map(dbJ);
    }
    else if(key==='class') await apiFetch(`${API}/vessels/${VID}/class_items/bulk`,'PUT',data);
    else if(key==='disc')  await apiFetch(`${API}/vessels/${VID}/discussions/bulk`,'PUT',data);
    setSS('synced');
  }catch(e){setSS('error');toast('저장 실패: '+e.message,true);}
}

async function loadAll(){
  setSS('saving');
  try{
    const summary=await apiFetch(`${API}/fleet/summary`);
    IDX=[];FLEET={};
    if(!summary.length){
      const v=await apiFetch(`${API}/vessels`,'POST',{
        name:'KUWAIT PROSPERITY',type:'Container Carrier',
        imo:'',shipyard:'',classSociety:'',dockIn:'',dockOut:'',duration:'',grt:''
      });
      IDX=[v.id];
      FLEET[v.id]={info:dbI(v),jobs:[],classItems:[],discussions:[],steel:[],outfit:[],wbt:[],fan:[],staging:[],gasfree:[],attachSet:new Set()};
    } else {
      for(const e of summary){
        const id=e.info.id; IDX.push(id);
        FLEET[id]={info:dbI(e.info),jobs:(e.jobs||[]).map(dbJ),classItems:(e.classItems||[]).map(dbC),discussions:(e.discussions||[]).map(dbD),steel:[],outfit:[],wbt:[],fan:[],staging:[],gasfree:[],
          attachSet: new Set((e.attachments||[]).map(a=>`${a.ref_type}:${a.ref_id}`))};
      }
    }
  }catch(e){toast('로드 실패: '+e.message,true);IDX=[];FLEET={};}
  setSS('synced');
  const dl=new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
  document.getElementById('todayLbl').textContent=dl;
  document.getElementById('heroDate').textContent=dl;
  renderFleet();
}

// DB → frontend normalizers
function dbI(r){return{id:r.id,name:r.name||'',type:r.type||'',imo:r.imo||'',shipyard:r.shipyard||'',classSociety:r.class_society||r.classSociety||'',dockIn:r.dock_in||r.dockIn||'',dockOut:r.dock_out||r.dockOut||'',duration:r.duration||'',grt:r.grt||''};}
function dbJ(r){
  let remarks = [];
  if(Array.isArray(r.remarks)) remarks = r.remarks;
  else if(typeof r.remarks === 'string'){
    try { remarks = JSON.parse(r.remarks); } catch(e){ remarks = []; }
  }
  return {_id:r.id||r._id,number:r.number||'',section:r.section||'GENERAL',category:r.category||'Shipyard',description:r.description||'',vendor:r.vendor||'',budget:r.budget||0,consumption:r.consumption||0,start_date:r.start_date||'',end_date:r.end_date||'',completion:r.completion||0,remarks};
}
function dbC(r){return{_id:r.id||r._id,no:r.no||'',finding:r.finding||'',description:r.description||'',actions:Array.isArray(r.actions)?r.actions:[],by:r.responsible||r.by||'Crew',open_date:r.open_date||'',close_date:r.close_date||'',status:r.status||'Open',priority:r.priority||'Normal'};}
function dbD(r){return{_id:r.id||r._id,no:r.no||'',date:r.date||'',time_of_day:r.time_of_day||'',item:r.item||'',description:r.description||'',actions:Array.isArray(r.actions)?r.actions:[],status:r.status||'Open',priority:r.priority||'Normal'};}

// ══ FLEET ════════════════════════════════════════════
function vesselStatus(info){
  if(!info.dockIn)return'PLANNED';
  const now=new Date(),di=new Date(info.dockIn),dout=info.dockOut?new Date(info.dockOut):null;
  if(now<di)return'PLANNED';if(dout&&now>dout)return'COMPLETED';return'IN DOCK';
}

function renderFleet(){
  let active=0,done=0,cls=0;
  IDX.forEach(id=>{const v=FLEET[id];cls+=(v.classItems||[]).filter(c=>c.status==='Open').length;const s=vesselStatus(v.info);if(s==='IN DOCK')active++;if(s==='COMPLETED')done++;});
  document.getElementById('fk-v').textContent=IDX.length;
  document.getElementById('fk-a').textContent=active;
  document.getElementById('fk-d').textContent=done;
  document.getElementById('fk-c').textContent=cls;

  document.getElementById('vesselsGrid').innerHTML=IDX.map(id=>{
    const v=FLEET[id],info=v.info,jobs=v.jobs||[];
    const tb=jobs.reduce((s,j)=>s+(+j.budget||0),0),tc=jobs.reduce((s,j)=>s+(+j.consumption||0),0);
    const pct=tb?Math.min(100,(tc/tb)*100):0;
    const done2=jobs.filter(j=>{const p=calcProgress(j.start_date,j.end_date);return(p!==null?p:j.completion||0)>=100;}).length;
    const oc=(v.classItems||[]).filter(c=>c.status==='Open').length;
    const st=vesselStatus(info);
    const stripeCls=st==='IN DOCK'?'amber':st==='COMPLETED'?'green':'grey';
    const badgeCls=st==='IN DOCK'?'sb-dock':st==='COMPLETED'?'sb-done':'sb-plan';
    return`<div class="vessel-card" onclick="openVessel('${id}')">
      <div class="vc-stripe ${stripeCls}"></div>
      <div class="vc-top">
        <div class="vc-name">${info.name}</div>
        ${info.type?`<div class="vc-type">${info.type}</div>`:''}
        <div class="vc-meta">
          ${info.shipyard?`<div class="vc-meta-item"><b>${info.shipyard}</b></div>`:''}
          ${info.dockIn?`<div class="vc-meta-item">In: <b>${info.dockIn}</b></div>`:''}
          ${info.dockOut?`<div class="vc-meta-item">Out: <b>${info.dockOut}</b></div>`:''}
          ${info.duration?`<div class="vc-meta-item"><b>${info.duration}</b> days</div>`:''}
        </div>
        <div class="status-badge ${badgeCls}">${st}</div>
      </div>
      <div class="vc-body">
        <div class="vc-prog-row">
          <div class="vc-prog-lbl">Budget</div>
          <div class="vc-prog-bar"><div class="vc-prog-fill" style="width:${pct}%"></div></div>
          <div class="vc-prog-pct">${pct.toFixed(0)}%</div>
        </div>
        <div class="vc-money">$${tc.toLocaleString()} consumed of $${tb.toLocaleString()}</div>
      </div>
      <div class="vc-stats">
        <div class="vc-stat"><div class="vc-stat-n">${jobs.length}</div><div class="vc-stat-l">Jobs</div></div>
        <div class="vc-stat"><div class="vc-stat-n" style="color:var(--green)">${done2}</div><div class="vc-stat-l">Done</div></div>
        <div class="vc-stat"><div class="vc-stat-n" style="color:${oc>0?'var(--red)':'var(--green)'}">${oc}</div><div class="vc-stat-l">Class</div></div>
      </div>
    </div>`;
  }).join('')+`<div class="add-card" onclick="openAddVesselModal()"><div class="add-card-icon">＋</div><div class="add-card-lbl">ADD NEW VESSEL</div></div>`;

  setBreadcrumb([{label:'FLEET OVERVIEW'}]);
  show('page-fleet');
}

function openVessel(id){
  VID=id;
  show('page-vessel');
  showTab('dashboard',document.querySelector('.vnav-btn'));
  setBreadcrumb([{label:'FLEET OVERVIEW',fn:'goFleet()'},{label:FLEET[id].info.name}]);
}
function goFleet(){VID=null;renderFleet();}

function showTab(tab,btn){
  document.querySelectorAll('.vnav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('[id^="vt-"]').forEach(t=>t.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const el=document.getElementById('vt-'+tab);if(el)el.classList.add('active');
  if(tab==='dashboard')renderDash();
  if(tab==='jobs'){buildJFilters();renderJobs();}
  if(tab==='gantt')renderGantt();
  if(tab==='class')renderClass();
  if(tab==='daily'){buildDDF();renderDisc();}
  if(tab==='steel')renderTracking('steel');
  if(tab==='outfit')renderTracking('outfit');
  if(tab==='wbt')renderTracking('wbt');
  if(tab==='fan')renderTracking('fan');
  if(tab==='staging')renderTracking('staging');
  if(tab==='gasfree')renderTracking('gasfree');
}

async function loadAttachStates(refType, idKey, btnPrefix) {
  if(!VID) return;
  const items = refType==='job' ? (FLEET[VID].jobs||[])
    : refType==='class' ? (FLEET[VID].classItems||[])
    : (FLEET[VID].discussions||[]);
  await Promise.all(items.map(async item => {
    const id = item[idKey] || item._id;
    if(!id) return;
    try {
      const list = await apiFetch(`${API}/vessels/${VID}/attachments/${refType}/${id}`);
      const btn = document.getElementById(`${btnPrefix}-${id}`);
      if(!btn) return;
      const has = list && list.length > 0;
      btn.style.background = has ? 'var(--blue)' : '';
      btn.style.color = has ? 'var(--white)' : '';
      btn.textContent = has ? '📎 1' : '📎';
    } catch(e) {}
  }));
}

// ══ DASHBOARD ════════════════════════════════════════
function renderDash(){
  if(!VID)return;
  const v=FLEET[VID],info=v.info,jobs=v.jobs||[];
  const tb=jobs.reduce((s,j)=>s+(+j.budget||0),0),tc=jobs.reduce((s,j)=>s+(+j.consumption||0),0);
  const done=jobs.filter(j=>{const p=calcProgress(j.start_date,j.end_date);return (p!==null?p:j.completion||0)>=100;}).length;
  const prog=jobs.filter(j=>{const p=calcProgress(j.start_date,j.end_date);const pct=p!==null?p:j.completion||0;return pct>0&&pct<100;}).length;
  const oc=(v.classItems||[]).filter(c=>c.status==='Open').length;
  document.getElementById('vb-name').textContent=info.name;
  document.getElementById('vs-total').textContent=jobs.length;
  document.getElementById('vs-done').textContent=done;
  document.getElementById('vs-prog').textContent=prog;
  document.getElementById('vs-bud').textContent=fmtK(tb);
  document.getElementById('vs-bud-s').textContent='$'+tb.toLocaleString()+' USD';
  document.getElementById('vs-con').textContent=fmtK(tc);
  document.getElementById('vs-con-s').textContent=tb?(tc/tb*100).toFixed(1)+'% of budget':'0%';
  document.getElementById('vs-cls').textContent=oc;

  const metas=[
    info.shipyard&&`SHIPYARD: <span>${info.shipyard}</span>`,
    info.dockIn&&`DOCK IN: <span>${info.dockIn}</span>`,
    info.dockOut&&`DOCK OUT: <span>${info.dockOut}</span>`,
    info.duration&&`DURATION: <span>${info.duration} DAYS</span>`,
    info.classSociety&&`CLASS: <span>${info.classSociety}</span>`,
    info.imo&&`IMO: <span>${info.imo}</span>`
  ].filter(Boolean);
  document.getElementById('vb-meta').innerHTML=metas.length?metas.map(m=>`<div class="vb-meta-item">${m}</div>`).join(''):'<div style="font-size:13px;opacity:.5">Click Edit Info to add dock details</div>';

  const st=vesselStatus(info);
  const sv=document.getElementById('vb-status');
  sv.textContent=st;
  sv.style.color=st==='IN DOCK'?'#fbbf24':st==='COMPLETED'?'#4ade80':'rgba(255,255,255,.5)';

  const pct=tb?Math.min(100,(tc/tb)*100):0;
  document.getElementById('v-bar').style.width=pct+'%';
  document.getElementById('v-bar-lbl').textContent=pct.toFixed(1)+'% consumed';

  const sd={};
  jobs.forEach(j=>{if(!sd[j.section])sd[j.section]={b:0,c:0,n:0};sd[j.section].b+=+j.budget||0;sd[j.section].c+=+j.consumption||0;sd[j.section].n++;});
  document.getElementById('v-sec-buds').innerHTML=Object.entries(sd).map(([nm,d])=>{
    const p=d.b?Math.min(100,(d.c/d.b)*100):0;
    return`<div class="sec-bud-card"><div class="sec-bud-name">${nm}</div><div class="sec-bud-bar"><div class="sec-bud-fill" style="width:${p}%"></div></div><div class="sec-bud-nums"><span style="color:var(--blue);font-weight:600">$${d.c.toLocaleString()}</span><span style="color:var(--txt-m)">/ $${d.b.toLocaleString()}</span></div></div>`;
  }).join('');
  document.getElementById('v-bud-rows').innerHTML=Object.entries(sd).map(([nm,d])=>{
    const p=d.b?(d.c/d.b*100).toFixed(1):'0.0';
    return`<div class="d-row"><div style="font-size:13px;color:var(--txt-b);font-weight:500">${nm} <span style="font-size:12px;color:var(--txt-m)">(${d.n} jobs)</span></div><div style="text-align:right"><div style="font-size:14px;font-weight:700;color:var(--txt-h)">$${d.b.toLocaleString()}</div><div style="font-size:11px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace">${p}% consumed</div></div></div>`;
  }).join('');
  const oi=(v.classItems||[]).filter(c=>c.status==='Open').slice(0,6);
  document.getElementById('v-open-cls').innerHTML=oi.length?oi.map(c=>`<div class="d-row" style="cursor:pointer" onclick="showTab('class',document.querySelectorAll('.vnav-btn')[3])"><div><div style="font-size:13px;font-weight:600;color:var(--txt-h)">${c.finding.substring(0,48)}${c.finding.length>48?'…':''}</div><div style="font-size:11px;color:var(--txt-m);margin-top:1px;font-family:'IBM Plex Mono',monospace">No.${c.no} · ${c.by||'—'} · ${c.open_date||'—'}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">${priorityBadge(c.priority)}<span class="c-badge c-open">OPEN</span></div></div>`).join(''):'<div class="empty-state" style="padding:20px">No open class items ✓</div>';
}

// ══ DATE SYNC HELPERS ════════════════════════════════
function syncDatePicker(txtId, pickerId) {
  const val = document.getElementById(txtId).value.trim();
  // Accept YYYY-MM-DD or YYYY/MM/DD or DD-MM-YYYY
  let norm = val;
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(val)) {
    // DD-MM-YYYY → YYYY-MM-DD
    const parts = val.split(/[\/\-]/);
    norm = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  } else if (/^\d{4}[\/]\d{2}[\/]\d{2}$/.test(val)) {
    norm = val.replace(/\//g,'-');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(norm)) {
    document.getElementById(pickerId).value = norm;
    updateProgPreview();
  }
}

// ══ AUTO PROGRESS CALCULATION ═════════════════════════
function calcProgress(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const sd = new Date(startDate), ed = new Date(endDate);
  if (isNaN(sd) || isNaN(ed) || ed <= sd) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  if (today < sd) return 0;
  if (today >= ed) return 100;
  const total = ed - sd;
  const elapsed = today - sd;
  return Math.round((elapsed / total) * 100);
}

function updateProgPreview() {
  const st = document.getElementById('mj-st').value || document.getElementById('mj-st-txt').value;
  const en = document.getElementById('mj-en').value || document.getElementById('mj-en-txt').value;
  const pct = calcProgress(st, en);
  const el = document.getElementById('mj-prog-preview');
  if (pct === null) {
    el.innerHTML = `<span style="color:var(--txt-m)">Start/End 날짜를 입력하면 오늘 기준 진행률이 자동 계산됩니다.</span>`;
    return;
  }
  const col = pct >= 100 ? 'var(--green)' : pct > 0 ? 'var(--amber)' : 'var(--txt-m)';
  const statusTxt = pct >= 100 ? '완료' : pct > 0 ? '진행 중' : '미시작';
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px">
      <div style="font-size:28px;font-weight:700;color:${col};font-family:'IBM Plex Mono',monospace">${pct}%</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--txt-h)">${statusTxt}</div>
        <div style="font-size:12px;color:var(--txt-m);margin-top:2px">${st} → ${en} 기준 오늘(${new Date().toISOString().slice(0,10)}) 진행률</div>
      </div>
      <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-left:8px">
        <div style="width:${pct}%;height:100%;background:${col};border-radius:4px;transition:width .5s"></div>
      </div>
    </div>`;
}

// ══ JOBS ═════════════════════════════════════════════
// ── Render remark entries in table cell ────────────
function renderRemarkCell(j) {
  const remarks = Array.isArray(j.remarks) ? j.remarks
    : (j.remark ? [{date:'', progress:j.remark, important:false}] : []);
  if (!remarks.length) return '—';

  const mkRow = (r, indent) => {
    const ds = r.date ? `<span class="rm-date" style="display:inline-block;min-width:72px">${r.date}</span>` : '<span style="display:inline-block;min-width:72px"></span>';
    const importantStyle = r.important ? 'color:#dc2626;font-weight:700;' : '';
    const pl = indent ? 'padding-left:14px;' : '';
    return `<div style="display:block;${pl}line-height:1.6">${ds}<span style="font-size:12px;${importantStyle}">${r.progress||''}</span></div>`;
  };

  const last = remarks[remarks.length - 1];
  if (remarks.length === 1) return mkRow(last, false);

  const uid = 'rm_' + Math.random().toString(36).slice(2,8);

  // 접힌 상태: ▶ + 마지막만
  const collapsedHtml =
    `<div style="display:flex;align-items:center;gap:4px;">` +
    `<span onclick="event.stopPropagation();toggleRemark('${uid}')" style="cursor:pointer;font-size:9px;color:var(--txt-m);flex-shrink:0;user-select:none">▶</span>` +
    mkRow(last, false) +
    `</div>`;

  // 펼친 상태: ▼ + 첫번째 같은 줄, 나머지 아래 (날짜 들여쓰기 맞춤)
  const expandedHtml =
    `<div style="display:flex;align-items:flex-start;gap:4px;">` +
    `<span onclick="event.stopPropagation();toggleRemark('${uid}')" style="cursor:pointer;font-size:9px;color:var(--txt-m);flex-shrink:0;user-select:none;margin-top:3px">▼</span>` +
    `<div>` +
    remarks.map((r, i) => mkRow(r, false)).join('') +
    `</div>` +
    `</div>`;

  return `<div id="${uid}" data-open="0"
    data-c="${encodeURIComponent(collapsedHtml)}"
    data-e="${encodeURIComponent(expandedHtml)}">${collapsedHtml}</div>`;
}

function toggleRemark(uid) {
  const el = document.getElementById(uid);
  if (!el) return;
  const isOpen = el.dataset.open === '1';
  el.dataset.open = isOpen ? '0' : '1';
  el.innerHTML = decodeURIComponent(isOpen ? el.dataset.c : el.dataset.e);
}

// ── Priority badge renderer ────────────────────────
const PRI_CONFIG = {
  'Normal':   { cls:'pri-normal',   label:'Normal' },
  'Urgent':   { cls:'pri-urgent',   label:'🔶 Urgent' },
  'Critical': { cls:'pri-critical', label:'🔴 Critical' },
  'On Hold':  { cls:'pri-onhold',   label:'⏸ On Hold' },
};
function priorityBadge(pri) {
  const cfg = PRI_CONFIG[pri] || PRI_CONFIG['Normal'];
  return `<span class="priority-badge ${cfg.cls}">${cfg.label}</span>`;
}

// ── Render action plan entries in table cell ───────
function renderActionsCell(actions, legacyAction) {
  const list = Array.isArray(actions) ? actions
    : (legacyAction ? [{date:'', progress:legacyAction, important:false}] : []);
  if (!list.length) return '—';
  return list.map(r => {
    const dateSpan = r.date ? `<span class="rm-date">${r.date}</span>` : '';
    const cls = r.important ? 'rm-text important' : 'rm-text';
    return `<div class="remark-entry">${dateSpan}<span class="${cls}">${r.progress||''}</span></div>`;
  }).join('');
}

// ══ CSV 업로드 ════════════════════════════════════════
function downloadCSVTemplate() {
  const headers = 'number,section,category,description,vendor,budget';
  const sample = [
    '1.1,GENERAL,Shipyard,Fixed fire fighting system isolation,,0',
    '1.2,GENERAL,Shipyard,Ventilation fan,,0',
    '2.1,PAINT,Shipyard,Hull blasting & painting,,0',
    '3.1,STEEL,Shipyard,Hull steel renewal,,0',
    '5.1,ENGINE,Shore Repair,Main engine inspection,,0',
  ].join('\n');
  const csv = headers + '\n' + sample;
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.getElementById('csv-template-download');
  a.href = url; a.download = 'job_template.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV 양식이 다운로드됐습니다');
}

async function uploadJobsCSV(input) {
  if (!VID) { toast('선박을 먼저 선택하세요', true); return; }
  if (!input.files.length) return;

  const file = input.files[0];
  if (!file.name.endsWith('.csv')) { toast('CSV 파일(.csv)만 업로드 가능합니다', true); return; }

  const formData = new FormData();
  formData.append('file', file);

  setSS('saving');
  try {
    const res = await fetch(`${API}/vessels/${VID}/jobs/csv`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error || '업로드 실패', true); setSS('error'); return; }

    setSS('synced');
    const errMsg = data.errors && data.errors.length ? ` (오류 ${data.errors.length}건)` : '';
    toast(`✓ ${data.inserted}개 Job이 추가됐습니다${errMsg}`);

    // 새로 추가된 Job 반영
    const newJobs = await apiFetch(`${API}/vessels/${VID}/jobs`);
    FLEET[VID].jobs = newJobs.map(dbJ);
    buildJFilters(); renderJobs(); renderDash();
  } catch(e) {
    setSS('error'); toast('업로드 실패: ' + e.message, true);
  }
  input.value = '';
}

function buildJFilters(){
  if(!VID)return;
  const jobs=FLEET[VID].jobs||[];
  const secs=[...new Set(jobs.map(j=>j.section))];
  document.getElementById('j-sf').innerHTML='<option value="">All Sections</option>'+secs.map(s=>`<option>${s}</option>`).join('');
  const cats=[...new Set(jobs.map(j=>j.category).filter(Boolean))];
  document.getElementById('j-cf').innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option>${c}</option>`).join('');
  const vendors=[...new Set(jobs.map(j=>j.vendor).filter(Boolean))].sort();
  document.getElementById('j-vf').innerHTML='<option value="">All Vendors</option>'+vendors.map(v=>`<option>${v}</option>`).join('');
}
function renderJobs(){
  if(!VID)return;
  const jobs=FLEET[VID].jobs||[];
  const q=document.getElementById('j-q').value.toLowerCase();
  const sf=document.getElementById('j-sf').value,cf=document.getElementById('j-cf').value,pf=document.getElementById('j-pf').value;
  const vf=document.getElementById('j-vf').value;
  let fil=jobs.filter(j=>{
    if(q&&!j.description.toLowerCase().includes(q)&&!j.number.includes(q)&&!(j.vendor||'').toLowerCase().includes(q))return false;
    if(sf&&j.section!==sf)return false;if(cf&&j.category!==cf)return false;
    if(vf&&(j.vendor||'')!==vf)return false;
    if(pf==='ns'&&j.completion>0)return false;if(pf==='ip'&&(j.completion===0||j.completion>=100))return false;
    if(pf==='done'&&j.completion<100)return false;return true;
  });
  fil.sort((a,b)=>{
    let av=a[sKey], bv=b[sKey];
    if(sKey==='number'){av=pNum(av);bv=pNum(bv);}
    if(sKey==='_id'){av=+(a._id||0);bv=+(b._id||0);}
    return av<bv?-sDir:av>bv?sDir:0;
  });
  document.getElementById('j-cnt').textContent=`${fil.length} / ${jobs.length} jobs`;
  const tb=document.getElementById('j-body');
  if(!fil.length){tb.innerHTML='<tr><td colspan="10" class="empty-state">No jobs match the filters</td></tr>';return;}

  const SECTIONS=['GENERAL','PAINT','STEEL','DECK','ENGINE','ELECTRIC','ETC'];
  const CATS=['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];

  tb.innerHTML=fil.map(j=>{
    const ri=jobs.indexOf(j);
    const livePct=calcProgress(j.start_date,j.end_date);
    const pct=livePct!==null?livePct:(j.completion||0);
    const col=pct>=100?'var(--green)':pct>0?'var(--amber)':'var(--txt-m)';
    const cc=j.category==='Shipyard'?'cat-sy':j.category==='Shore Repair'?'cat-sh':j.category==='Spare'?'cat-sp':j.category==='Store'?'cat-st':j.category==='Paint'?'cat-pt':'cat-cr';
    const dateInfo=j.start_date&&j.end_date
      ?`<div style="font-size:10px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace;margin-top:2px">${j.start_date} → ${j.end_date}</div>`
      :`<div style="font-size:10px;color:var(--txt-m)">—</div>`;

    const secOpts=SECTIONS.map(s=>`<option${s===j.section?' selected':''}>${s}</option>`).join('');
    const catOpts=CATS.map(c=>`<option${c===j.category?' selected':''}>${c}</option>`).join('');

    return`<tr data-ri="${ri}">
      <td data-label="No."><span class="cell-edit" onclick="startEdit(this,${ri},'number','text')">${j.number||'—'}</span></td>
      <td data-label="Section"><span class="cell-edit" onclick="startEditSelect(this,${ri},'section',[${SECTIONS.map(s=>`'${s}'`).join(',')}])">
        <span style="font-size:12px;color:var(--txt-s)">${j.section||'—'}</span>
      </span></td>
      <td data-label="Category"><span class="cell-edit" onclick="startEditSelect(this,${ri},'category',[${CATS.map(c=>`'${c}'`).join(',')}])">
        <span class="cat-badge ${cc}">${j.category||'—'}</span>
      </span></td>
      <td data-label="Description"><span class="cell-edit" onclick="startEdit(this,${ri},'description','text')" style="display:block;max-width:260px;color:var(--txt-h);font-size:13px;font-weight:500">${j.description||'—'}</span></td>
      <td data-label="Vendor"><span class="cell-edit" onclick="startEdit(this,${ri},'vendor','text')" style="display:block;max-width:130px;font-size:12px;color:var(--txt-m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${j.vendor||'—'}</span></td>
      <td data-label="Budget" style="text-align:right"><span class="cell-edit" onclick="startEdit(this,${ri},'budget','number')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:var(--txt-h)">$${(+j.budget||0).toLocaleString()}</span></td>
      <td data-label="Consumed" style="text-align:right"><span class="cell-edit" onclick="startEdit(this,${ri},'consumption','number')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:var(--green)">$${(+j.consumption||0).toLocaleString()}</span></td>
      <td data-label="Progress">
        <div class="prog-wrap">
          <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${col}"></div></div>
          <div class="prog-pct" style="color:${col}">${pct}%</div>
        </div>
        ${dateInfo}
      </td>
      <td data-label="Remark" style="vertical-align:middle"><div class="remark-cell" onclick="openJobModal(${ri})" style="cursor:pointer;max-width:300px" title="클릭하여 Remark 편집">${renderRemarkCell(j)}</div></td>
      <td style="white-space:nowrap">
        <button class="edit-btn" onclick="openJobModal(${ri})">Edit</button>
        <button class="attach-btn" id="jattbtn-${j._id}" onclick="openJobAttach(${j._id})" title="첨부파일" style="${(FLEET[VID].attachSet||new Set()).has('job:'+j._id)?'background:var(--blue);color:var(--white)':''}">
          ${(FLEET[VID].attachSet||new Set()).has('job:'+j._id)?'📎 1':'📎'}
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── INLINE EDIT HELPERS ──────────────────────────────────────
function startEdit(span, ri, field, type) {
  const origVal = FLEET[VID].jobs[ri][field] ?? '';
  const w = Math.max(span.offsetWidth, 80);
  const inp = document.createElement('input');
  inp.className = 'inline-input';
  inp.type = type === 'number' ? 'number' : 'text';
  inp.value = origVal;
  inp.style.width = (w + 20) + 'px';
  span.replaceWith(inp);
  inp.focus();
  inp.select();

  const save = async () => {
    const val = type === 'number' ? (+inp.value || 0) : inp.value.trim();
    FLEET[VID].jobs[ri][field] = val;
    const job = FLEET[VID].jobs[ri];
    try {
      await apiFetch(`${API}/jobs/${job._id}`,'PUT', job);
    } catch(e){ toast('저장 실패: '+e.message,true); }
    if(field === 'vendor') buildJFilters();
    if(field === 'number') { sKey='number'; sDir=1; }
    renderJobs();
    renderDash();
  };
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => {
    if(e.key === 'Enter') { inp.blur(); }
    if(e.key === 'Escape') { renderJobs(); }
  });
}

function startEditSelect(span, ri, field, options) {
  const origVal = FLEET[VID].jobs[ri][field] ?? '';
  const sel = document.createElement('select');
  sel.className = 'inline-select';
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    if(o === origVal) opt.selected = true;
    sel.appendChild(opt);
  });
  span.replaceWith(sel);
  sel.focus();

  const save = async () => {
    FLEET[VID].jobs[ri][field] = sel.value;
    const job = FLEET[VID].jobs[ri];
    try {
      await apiFetch(`${API}/jobs/${job._id}`,'PUT', job);
    } catch(e){ toast('저장 실패: '+e.message,true); }
    buildJFilters();
    renderJobs();
    renderDash();
  };
  sel.addEventListener('change', save);
  sel.addEventListener('blur', () => setTimeout(()=>{ if(document.activeElement!==sel) renderJobs(); }, 150));
  sel.addEventListener('keydown', e => { if(e.key === 'Escape') renderJobs(); });
}

async function addInlineRow() {
  if(!VID) return;

  // 1. API로 새 Job 생성
  setSS('saving');
  try {
    const newJob = await apiFetch(`${API}/vessels/${VID}/jobs`, 'POST', {
      number:'', section:'GENERAL', category:'Shipyard',
      description:'', vendor:'', budget:0, consumption:0,
      start_date:'', end_date:'', completion:0, remarks:[]
    });
    FLEET[VID].jobs = [...(FLEET[VID].jobs||[]), dbJ(newJob)];
    setSS('synced');
  } catch(e){ setSS('error'); toast('추가 실패: '+e.message, true); return; }

  // 2. 필터 초기화 + 정렬을 id순(입력순)으로 변경 → 새 행이 맨 아래
  const qEl = document.getElementById('j-q');
  const sfEl = document.getElementById('j-sf');
  const cfEl = document.getElementById('j-cf');
  const vfEl = document.getElementById('j-vf');
  const stEl = document.getElementById('j-st');
  if(qEl) qEl.value = '';
  if(sfEl) sfEl.value = '';
  if(cfEl) cfEl.value = '';
  if(vfEl) vfEl.value = '';
  if(stEl) stEl.value = '';
  sKey = '_id'; sDir = 1;  // id 순으로 정렬 → 새 행이 맨 아래

  buildJFilters();
  renderJobs();

  // 3. 맨 아래로 스크롤 + 새 행의 No. 셀에 커서
  setTimeout(() => {
    const rows = document.querySelectorAll('#j-body tr');
    const lastRow = rows[rows.length - 1];
    if(lastRow) {
      lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const numCell = lastRow.querySelector('td:first-child .cell-edit');
      if(numCell) numCell.click();
    }
  }, 150);

  toast('새 행이 추가됐습니다');
}
function sortJ(k){sKey===k?sDir*=-1:(sKey=k,sDir=1);renderJobs();}
function pNum(n){
  const s = String(n||'').trim();
  const prefixMatch = s.match(/^([A-Za-z]*)/);
  const prefix = prefixMatch ? prefixMatch[1].toUpperCase() : '';
  const rest = s.slice(prefix.length);
  const parts = rest.replace('-', '.').split('.');
  const num = (parseInt(parts[0])||0)*1000 + (parseInt(parts[1])||0);
  // 알파벳 접두사 있으면 앞에(음수 영역), 없으면(숫자만) 뒤에(양수 영역)
  if(prefix) return (prefix.charCodeAt(0) - 64) * 100000 + num;
  return 10000000 + num;
}

function openJobModal(idx){
  if(!VID)return;eJobIdx=idx;
  const isNew=idx===null;
  document.getElementById('mj-title').textContent=isNew?'ADD JOB':'EDIT JOB';
  document.getElementById('mj-del').style.display=isNew?'none':'block';
  const j=isNew?{number:'',section:'GENERAL',category:'Shipyard',description:'',vendor:'',budget:0,consumption:0,start_date:'',end_date:'',remark:''}:FLEET[VID].jobs[idx];
  document.getElementById('mj-num').value=j.number||'';
  document.getElementById('mj-sec').value=j.section||'GENERAL';
  document.getElementById('mj-cat').value=j.category||'Shipyard';
  document.getElementById('mj-desc').value=j.description||'';
  document.getElementById('mj-vend').value=j.vendor||'';
  document.getElementById('mj-bud').value=j.budget||0;
  document.getElementById('mj-con').value=j.consumption||0;
  // Date fields — both text and picker
  const st=j.start_date||'', en=j.end_date||'';
  document.getElementById('mj-st').value=st;
  document.getElementById('mj-st-txt').value=st;
  document.getElementById('mj-en').value=en;
  document.getElementById('mj-en-txt').value=en;
  // Load daily remarks (support legacy remark string)
  const remarks = Array.isArray(j.remarks) ? j.remarks
    : (j.remark ? [{date:'', progress:j.remark, important:false}] : []);
  renderRemarkRows(remarks);
  // Trigger preview
  updateProgPreview();
  // Live update on date picker change
  ['mj-st','mj-en'].forEach(id=>{
    document.getElementById(id).onchange=()=>{
      const picker=document.getElementById(id);
      const txtId=id+'-txt';
      document.getElementById(txtId).value=picker.value;
      updateProgPreview();
    };
  });
  openM('m-job');
}
async function saveJob(){
  if(!VID)return;
  const st = document.getElementById('mj-st').value || document.getElementById('mj-st-txt').value.trim();
  const en = document.getElementById('mj-en').value || document.getElementById('mj-en-txt').value.trim();
  const autoPct = calcProgress(st, en);
  const j={
    number:document.getElementById('mj-num').value.trim(),
    section:document.getElementById('mj-sec').value,
    category:document.getElementById('mj-cat').value,
    description:document.getElementById('mj-desc').value.trim(),
    vendor:document.getElementById('mj-vend').value.trim(),
    budget:+document.getElementById('mj-bud').value||0,
    consumption:+document.getElementById('mj-con').value||0,
    start_date:st,
    end_date:en,
    completion: autoPct !== null ? autoPct : 0,
    remarks: collectRemarks()
  };
  if(!j.number||!j.description){toast('Job number and description are required',true);return;}
  setSS('saving');
  try {
    if(eJobIdx===null){
      // 신규 추가
      const res = await apiFetch(`${API}/vessels/${VID}/jobs`,'POST',j);
      FLEET[VID].jobs.push(dbJ(res));
    } else {
      // 기존 수정 — id 유지
      const existing = FLEET[VID].jobs[eJobIdx];
      const res = await apiFetch(`${API}/jobs/${existing._id}`,'PUT',j);
      FLEET[VID].jobs[eJobIdx] = dbJ(res);
    }
    setSS('synced');
  } catch(e){ setSS('error'); toast('저장 실패: '+e.message,true); return; }
  closeM('m-job');buildJFilters();sKey='number';sDir=1;renderJobs();renderDash();
  toast(eJobIdx===null?'Job added':'Job updated');
}
// ══ DAILY REMARKS HELPERS ════════════════════════════
function renderRemarkRows(remarks) {
  renderRemarkRowsTo('mj-remarks-body', remarks);
}

function renderRemarkRowsTo(tbodyId, remarks) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = '';
  (remarks || []).forEach(r => addRemarkRowTo(tbodyId, r));
  if (!remarks || !remarks.length) addRemarkRowTo(tbodyId, {date:'', progress:'', important:false});
}

function addRemarkRowData(r) {
  addRemarkRowTo('mj-remarks-body', r);
}

function addRemarkRowTo(tbodyId, r) {
  r = r || {date:'', progress:'', important:false};
  const tbody = document.getElementById(tbodyId);
  const tr = document.createElement('tr');
  const today = new Date().toISOString().slice(0,10);
  tr.innerHTML = `
    <td>
      <div class="date-combo" style="gap:4px">
        <input class="rm-date-inp" type="text" placeholder="${today}" value="${r.date||''}">
        <div class="cal-btn" style="width:30px;height:30px;font-size:13px" title="캘린더">📅
          <input type="date" onchange="this.closest('tr').querySelector('.rm-date-inp').value=this.value">
        </div>
      </div>
    </td>
    <td><input class="rm-prog-inp" type="text" placeholder="내용 입력…" value="${(r.progress||'').replace(/"/g,'&quot;')}"></td>
    <td style="text-align:center">
      <input type="checkbox" class="rm-imp-chk" ${r.important?'checked':''} title="중요 표시 (빨간 볼드)">
    </td>
    <td>
      <button type="button" class="rm-del-btn" onclick="this.closest('tr').remove()" title="삭제">✕</button>
    </td>`;
  tbody.appendChild(tr);
}

function addRemarkRow() {
  addRemarkRowTo('mj-remarks-body', {date: new Date().toISOString().slice(0,10), progress:'', important:false});
  const rows = document.querySelectorAll('#mj-remarks-body tr');
  const last = rows[rows.length-1];
  if (last) last.querySelector('.rm-prog-inp').focus();
}

function collectRemarksFrom(tbodyId) {
  const rows = document.querySelectorAll(`#${tbodyId} tr`);
  const result = [];
  rows.forEach(tr => {
    const date      = tr.querySelector('.rm-date-inp').value.trim();
    const progress  = tr.querySelector('.rm-prog-inp').value.trim();
    const important = tr.querySelector('.rm-imp-chk').checked;
    if (date || progress) result.push({date, progress, important});
  });
  return result;
}

function collectRemarks() {
  return collectRemarksFrom('mj-remarks-body');
}

async function deleteJob(){
  if(eJobIdx===null||!VID)return;if(!confirm('Delete this job?'))return;
  const job = FLEET[VID].jobs[eJobIdx];
  setSS('saving');
  try {
    await apiFetch(`${API}/jobs/${job._id}`,'DELETE');
    FLEET[VID].jobs.splice(eJobIdx,1);
    setSS('synced');
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message,true); return; }
  closeM('m-job');renderJobs();renderDash();toast('Job deleted');
}

// ══ GANTT ═════════════════════════════════════════════
function renderGantt(){
  if(!VID)return;
  const secs=[...new Set((FLEET[VID].jobs||[]).map(j=>j.section))];
  const allCats=['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];
  document.getElementById('g-chips').innerHTML=
    `<button class="g-chip active" onclick="buildGantt(null,null,this)">All Sections</button>`+
    secs.map(s=>`<button class="g-chip" onclick="buildGantt('${s}',null,this)">${s}</button>`).join('')+
    `<span style="width:1px;background:var(--border);margin:0 4px;align-self:stretch;display:inline-block"></span>`+
    allCats.map(c=>`<button class="g-chip" onclick="buildGantt(null,'${c}',this)">${c}</button>`).join('');
  buildGantt(null,null,null);
}
function buildGantt(sf,cf,btn){
  document.querySelectorAll('.g-chip').forEach(c=>c.classList.remove('active'));
  if(btn)btn.classList.add('active');else document.querySelector('.g-chip')?.classList.add('active');
  if(!VID)return;
  const info=FLEET[VID].info;
  const ds=info.dockIn?new Date(info.dockIn):new Date();
  const de=info.dockOut?new Date(info.dockOut):new Date(ds.getTime()+25*86400000);
  const nd=Math.max(28,Math.ceil((de-ds)/86400000)+4);
  const dates=Array.from({length:nd},(_,i)=>new Date(ds.getTime()+i*86400000));
  const today=new Date();const DW=38;
  const jobs=(FLEET[VID].jobs||[]).filter(j=>{
    if(sf && j.section!==sf) return false;
    if(cf && j.category!==cf) return false;
    return true;
  });
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Find today's column index for absolute line overlay
  const todayIdx = dates.findIndex(d=>d.toDateString()===today.toDateString());

  let html=`<div style="min-width:${280+dates.length*DW}px;position:relative;">`;

  // Today vertical line overlay (spans full height, sits on top)
  if(todayIdx>=0){
    const lineLeft = 280 + todayIdx*DW + Math.floor(DW/2);
    html+=`<div style="position:absolute;top:0;bottom:0;left:${lineLeft}px;width:2px;background:var(--blue);opacity:.5;z-index:5;pointer-events:none;"></div>`;
  }

  html+=`
  <div style="display:flex;background:var(--bg-panel);border-bottom:2px solid var(--border);position:sticky;top:0;z-index:10;">
    <div style="min-width:280px;padding:10px 14px;font-size:12px;font-weight:700;color:var(--txt-s);text-transform:uppercase;letter-spacing:.7px;border-right:2px solid var(--border);">Job Description</div>
    <div style="display:flex;">`;
  dates.forEach(d=>{
    const isT=d.toDateString()===today.toDateString();
    const isFirst=d.getDate()===1||d.getTime()===ds.getTime();
    const lbl=isFirst
      ?`<div style="font-size:9px;font-weight:700;letter-spacing:.5px">${months[d.getMonth()]}</div><div>${d.getDate()}</div>`
      :d.getDate();
    if(isT){
      // Today header: navy bg, white text, TODAY tag
      html+=`<div style="min-width:${DW}px;padding:4px 2px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:800;color:#fff;border-right:2px solid var(--blue);border-left:2px solid var(--blue);background:var(--navy);box-sizing:border-box;">
        <div style="font-size:8px;letter-spacing:1px;opacity:.75;line-height:1.2">TODAY</div>
        <div>${d.getDate()}</div>
      </div>`;
    } else {
      html+=`<div style="min-width:${DW}px;padding:6px 2px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--txt-m);border-right:1px solid var(--border);">${lbl}</div>`;
    }
  });
  html+=`</div></div>`;
  jobs.forEach((j,ji)=>{
    let bs=-1,bw=0;
    if(j.start_date&&j.start_date!==''){const sd=new Date(j.start_date),ed=j.end_date&&j.end_date!==''?new Date(j.end_date):new Date(sd.getTime()+Math.max(1,+j.duration||1)*86400000);bs=Math.round((sd-ds)/86400000);bw=Math.max(1,Math.round((ed-sd)/86400000)+1);}
    const pct=Math.min(100, calcProgress(j.start_date, j.end_date) ?? (+j.completion||0));
    const barCol=pct>=100?'var(--green)':pct>0?'linear-gradient(90deg,var(--navy),var(--blue))':'#cbd5e1';
    const rowBg=ji%2===0?'var(--bg-white)':'var(--bg-panel)';
    html+=`<div style="display:flex;border-bottom:1px solid var(--border);min-height:36px;background:${rowBg}" onmouseover="this.style.background='var(--blue-light)'" onmouseout="this.style.background='${rowBg}'">
      <div style="width:280px;min-width:280px;max-width:280px;padding:6px 14px;border-right:2px solid var(--border);display:flex;align-items:center;gap:8px;overflow:hidden;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--blue);font-weight:600;flex-shrink:0;min-width:32px">${j.number}</span>
        <span style="font-size:12px;color:var(--txt-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;flex:1" title="${j.description}">${j.description}</span>
      </div>
      <div style="display:flex;align-items:center;flex:1;position:relative;">`;
    dates.forEach((d,i)=>{
      const isT=d.toDateString()===today.toDateString();
      const cellBg = isT
        ? 'background:rgba(29,111,219,.08);border-left:2px solid var(--blue);border-right:2px solid var(--blue);box-sizing:border-box;'
        : '';
      html+=`<div style="min-width:${DW}px;height:36px;border-right:${isT?'none':'1px solid var(--border)'};flex:none;position:relative;${cellBg}">`;
      if(i===bs&&bs>=0){const w=bw*DW-4;html+=`<div style="position:absolute;top:50%;transform:translateY(-50%);left:2px;width:${w}px;height:16px;background:${barCol};border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.15)"><div style="width:${pct}%;height:100%;background:rgba(255,255,255,.25);border-radius:4px 0 0 4px"></div></div>`;}
      html+=`</div>`;
    });
    html+=`</div></div>`;
  });
  html+=`</div>`;
  document.getElementById('g-wrap').innerHTML=html;
}

// ══ JOB ATTACHMENTS ══════════════════════════════════
async function openJobAttach(jobId) {
  if(!VID) return;
  // 파일 목록 로드
  const list = await apiFetch(`${API}/vessels/${VID}/attachments/job/${jobId}`);
  const file = list && list.length ? list[list.length-1] : null;

  const modal = document.getElementById('m-job-attach');
  document.getElementById('ja-title').textContent = '📎 첨부파일';
  document.getElementById('ja-jobid').value = jobId;

  // 버튼 상태 업데이트
  _renderJobAttachUI(file);
  openM('m-job-attach');
}

function _renderJobAttachUI(file) {
  const area = document.getElementById('ja-file-area');
  if(!file) {
    area.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--txt-m);font-size:13px">
        <div style="font-size:32px;margin-bottom:8px">📂</div>
        첨부된 파일이 없습니다
      </div>`;
    return;
  }
  const isImg = file.mimetype && file.mimetype.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';
  const sizeMB = file.filesize ? (file.filesize/1024/1024).toFixed(1)+' MB' : '';
  area.innerHTML = `
    <div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;padding:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:28px">${isImg?'🖼️':isPdf?'📄':'📁'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.filename}</div>
          <div style="font-size:11px;color:var(--txt-m);margin-top:2px">${sizeMB}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sec" style="flex:1" onclick="previewJobAttach(${file.id},'${file.mimetype}')">👁 미리보기</button>
        <button class="btn-sec" style="flex:1" onclick="window.location='/api/attachments/${file.id}'">⬇ 다운로드</button>
        <button class="btn-sec" style="flex:1;color:var(--red)" onclick="deleteJobAttach(${file.id},${document.getElementById('ja-jobid').value})">✕ 삭제</button>
      </div>
    </div>`;
}

async function uploadJobAttach(input) {
  if(!VID || !input.files.length) return;
  const jobId = +document.getElementById('ja-jobid').value;
  const formData = new FormData();
  formData.append('files', input.files[0]);
  setSS('saving');
  try {
    const res = await fetch(`${API}/vessels/${VID}/attachments/job/${jobId}`, {method:'POST', body:formData});
    const data = await res.json();
    setSS('synced');
    // 목록 다시 로드해서 UI 갱신
    const list = await apiFetch(`${API}/vessels/${VID}/attachments/job/${jobId}`);
    const file = list && list.length ? list[list.length-1] : null;
    _renderJobAttachUI(file);
    if(FLEET[VID].attachSet) FLEET[VID].attachSet.add(`job:${jobId}`);
    _updateJobAttachBtn(jobId, !!file);
    toast('파일 업로드 완료');
  } catch(e){ setSS('error'); toast('업로드 실패: '+e.message, true); }
  input.value = '';
}

async function deleteJobAttach(aid, jobId) {
  if(!confirm('파일을 삭제하시겠습니까?')) return;
  setSS('saving');
  try {
    await apiFetch(`${API}/attachments/${aid}`, 'DELETE');
    setSS('synced');
    _renderJobAttachUI(null);
    if(FLEET[VID].attachSet) FLEET[VID].attachSet.delete(`job:${jobId}`);
    _updateJobAttachBtn(jobId, false);
    toast('삭제됐습니다');
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message, true); }
}

function previewJobAttach(aid, mimetype) {
  const isImg = mimetype && mimetype.startsWith('image/');
  const isPdf = mimetype === 'application/pdf';
  const url = `/api/attachments/${aid}/preview`;
  if(isImg || isPdf) {
    window.open(url, '_blank');
  } else {
    window.location = `/api/attachments/${aid}`;
  }
}

function _updateJobAttachBtn(jobId, hasFile) {
  const btn = document.getElementById(`jattbtn-${jobId}`);
  if(!btn) return;
  btn.style.background = hasFile ? 'var(--blue)' : '';
  btn.style.color = hasFile ? 'var(--white)' : '';
  btn.textContent = hasFile ? '📎 1' : '📎';
}

// 첨부 버튼 상태 초기화 (renderJobs 후 호출)
async function loadJobAttachStates() {
  if(!VID) return;
  const jobs = FLEET[VID].jobs || [];
  for(const j of jobs) {
    try {
      const list = await apiFetch(`${API}/vessels/${VID}/attachments/job/${j._id}`);
      _updateJobAttachBtn(j._id, list && list.length > 0);
    } catch(e) {}
  }
}

// ══ GENERIC ATTACHMENTS (Class / Daily Log) ═══════════
const GEN_ATTACH_PREFIX = { class: 'cattbtn', disc: 'dattbtn' };

async function openGenAttach(refType, refId) {
  if(!VID) return;
  const list = await apiFetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`);
  const file = list && list.length ? list[list.length-1] : null;
  document.getElementById('ga-reftype').value = refType;
  document.getElementById('ga-refid').value = refId;
  _renderGenAttachUI(file);
  openM('m-gen-attach');
}

function _renderGenAttachUI(file) {
  const area = document.getElementById('ga-file-area');
  if(!file) {
    area.innerHTML = `<div style="text-align:center;padding:24px;color:var(--txt-m);font-size:13px"><div style="font-size:32px;margin-bottom:8px">📂</div>첨부된 파일이 없습니다</div>`;
    return;
  }
  const isImg = file.mimetype && file.mimetype.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';
  const sizeMB = file.filesize ? (file.filesize/1024/1024).toFixed(1)+' MB' : '';
  area.innerHTML = `
    <div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;padding:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:28px">${isImg?'🖼️':isPdf?'📄':'📁'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.filename}</div>
          <div style="font-size:11px;color:var(--txt-m);margin-top:2px">${sizeMB}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sec" style="flex:1" onclick="previewJobAttach(${file.id},'${file.mimetype}')">👁 미리보기</button>
        <button class="btn-sec" style="flex:1" onclick="window.location='/api/attachments/${file.id}'">⬇ 다운로드</button>
        <button class="btn-sec" style="flex:1;color:var(--red)" onclick="deleteGenAttach(${file.id})">✕ 삭제</button>
      </div>
    </div>`;
}

async function uploadGenAttach(input) {
  if(!VID || !input.files.length) return;
  const refType = document.getElementById('ga-reftype').value;
  const refId = document.getElementById('ga-refid').value;
  const formData = new FormData();
  formData.append('files', input.files[0]);
  setSS('saving');
  try {
    await fetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`, {method:'POST', body:formData});
    const list = await apiFetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`);
    const file = list && list.length ? list[list.length-1] : null;
    _renderGenAttachUI(file);
    if(FLEET[VID].attachSet) FLEET[VID].attachSet.add(`${refType}:${refId}`);
    _updateGenAttachBtn(refType, +refId, !!file);
    setSS('synced'); toast('파일 업로드 완료');
  } catch(e){ setSS('error'); toast('업로드 실패: '+e.message, true); }
  input.value = '';
}

async function deleteGenAttach(aid) {
  if(!confirm('파일을 삭제하시겠습니까?')) return;
  const refType = document.getElementById('ga-reftype').value;
  const refId = document.getElementById('ga-refid').value;
  setSS('saving');
  try {
    await apiFetch(`${API}/attachments/${aid}`, 'DELETE');
    _renderGenAttachUI(null);
    if(FLEET[VID].attachSet) FLEET[VID].attachSet.delete(`${refType}:${refId}`);
    _updateGenAttachBtn(refType, +refId, false);
    setSS('synced'); toast('삭제됐습니다');
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message, true); }
}

function _updateGenAttachBtn(refType, refId, hasFile) {
  const prefix = GEN_ATTACH_PREFIX[refType];
  if(!prefix) return;
  const btn = document.getElementById(`${prefix}-${refId}`);
  if(!btn) return;
  btn.style.background = hasFile ? 'var(--blue)' : '';
  btn.style.color = hasFile ? 'var(--white)' : '';
  btn.textContent = hasFile ? '📎 1' : '📎';
}

// ══ CLASS ═════════════════════════════════════════════
const BY_OPTS = ['Crew','Shipyard','Crew / Shipyard','3rd Party'];
const ST_OPTS = ['Open','Closed'];

function renderClass(){
  if(!VID)return;
  const items=FLEET[VID].classItems||[];
  const q=document.getElementById('c-q').value.toLowerCase();
  const sf=document.getElementById('c-sf').value,bf=document.getElementById('c-bf').value;
  const pf=document.getElementById('c-pf').value;
  let fil=items.filter(c=>{
    if(q&&!c.finding.toLowerCase().includes(q)&&!(c.description||'').toLowerCase().includes(q))return false;
    if(sf&&c.status!==sf)return false;
    if(bf&&!(c.by||'').includes(bf))return false;
    if(pf&&(c.priority||'Normal')!==pf)return false;
    return true;
  });
  document.getElementById('c-cnt').textContent=`${fil.length} items`;
  const tb=document.getElementById('c-body');
  if(!fil.length){tb.innerHTML='<tr><td colspan="10" class="empty-state">No class items found</td></tr>';return;}
  tb.innerHTML=fil.map(c=>{
    const ri=items.indexOf(c);
    const stCls=c.status==='Open'?'c-open':'c-closed';
    const priHtml=priorityBadge(c.priority);
    return`<tr>
      <td data-label="No."><span class="cell-edit" onclick="startEditC(this,${ri},'no','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--blue);font-weight:600">${c.no||'—'}</span></td>
      <td data-label="Status"><span class="cell-edit" onclick="startEditSelectC(this,${ri},'status',['Open','Closed'])">
        <span class="c-badge ${stCls}">${c.status}</span>
      </span></td>
      <td data-label="Priority">${priHtml}</td>
      <td data-label="By"><span class="cell-edit" onclick="startEditSelectC(this,${ri},'by',${JSON.stringify(BY_OPTS)})" style="font-size:12px;color:var(--txt-s)">${c.by||'—'}</span></td>
      <td data-label="Finding"><span class="cell-edit" onclick="startEditC(this,${ri},'finding','text')" style="font-size:13px;font-weight:600;color:var(--txt-h);display:block;max-width:220px">${c.finding||'—'}</span></td>
      <td data-label="Description"><span class="cell-edit" onclick="startEditC(this,${ri},'description','text')" style="font-size:12px;color:var(--txt-s);display:block;max-width:220px;white-space:pre-line">${c.description||'—'}</span></td>
      <td data-label="Action"><div style="font-size:12px;max-width:200px;cursor:pointer" onclick="openClassModal(${ri})" title="클릭하여 편집">${renderActionsCell(c.actions, c.action)}</div></td>
      <td data-label="Open"><span class="cell-edit" onclick="startEditC(this,${ri},'open_date','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-s)">${c.open_date||'—'}</span></td>
      <td data-label="Close"><span class="cell-edit" onclick="startEditC(this,${ri},'close_date','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:${c.close_date?'var(--green)':'var(--txt-m)'}">${c.close_date||'—'}</span></td>
      <td style="white-space:nowrap"><button class="edit-btn" onclick="openClassModal(${ri})">Edit</button><button class="attach-btn" id="cattbtn-${c._id}" onclick="openGenAttach('class',${c._id})" title="첨부파일" style="${(FLEET[VID].attachSet||new Set()).has('class:'+c._id)?'background:var(--blue);color:var(--white)':''}">${(FLEET[VID].attachSet||new Set()).has('class:'+c._id)?'📎 1':'📎'}</button></td>
    </tr>`;
  }).join('');
}

function startEditC(span, ri, field, type){
  const origVal=FLEET[VID].classItems[ri][field]??'';
  const w=Math.max(span.offsetWidth,80);
  const inp=document.createElement('input');
  inp.className='inline-input';inp.type='text';inp.value=origVal;inp.style.width=(w+20)+'px';
  span.replaceWith(inp);inp.focus();inp.select();
  const save=()=>{
    FLEET[VID].classItems[ri][field]=inp.value.trim();
    // auto-update status when close_date filled/cleared
    if(field==='close_date'){
      FLEET[VID].classItems[ri].status=inp.value.trim()?'Closed':'Open';
    }
    persist('class',FLEET[VID].classItems);
    renderClass();renderDash();
  };
  inp.addEventListener('blur',save);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape')renderClass();});
}

function startEditSelectC(span, ri, field, options){
  const origVal=FLEET[VID].classItems[ri][field]??'';
  const sel=document.createElement('select');
  sel.className='inline-select';
  options.forEach(o=>{const opt=document.createElement('option');opt.value=o;opt.textContent=o;if(o===origVal)opt.selected=true;sel.appendChild(opt);});
  span.replaceWith(sel);sel.focus();
  const save=()=>{
    FLEET[VID].classItems[ri][field]=sel.value;
    // if status manually set to Closed but no close_date, set today
    if(field==='status'&&sel.value==='Closed'&&!FLEET[VID].classItems[ri].close_date){
      FLEET[VID].classItems[ri].close_date=new Date().toISOString().slice(0,10);
    }
    if(field==='status'&&sel.value==='Open'){
      FLEET[VID].classItems[ri].close_date='';
    }
    persist('class',FLEET[VID].classItems);
    renderClass();renderDash();
  };
  sel.addEventListener('change',save);
  sel.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==sel)renderClass();},150));
  sel.addEventListener('keydown',e=>{if(e.key==='Escape')renderClass();});
}

function addClassRow(){
  if(!VID)return;
  if(!FLEET[VID].classItems)FLEET[VID].classItems=[];
  const items=FLEET[VID].classItems;
  items.push({no:String(items.length+1),finding:'',description:'',action:'',by:'Crew',open_date:new Date().toISOString().slice(0,10),close_date:'',status:'Open'});
  persist('class',items);
  renderClass();renderDash();
  requestAnimationFrame(()=>{
    const rows=document.querySelectorAll('#c-body tr');
    const last=rows[rows.length-1];
    if(last){const cell=last.querySelector('.cell-edit');if(cell)cell.click();}
  });
  toast('새 항목이 추가됐습니다. 셀을 클릭해서 바로 입력하세요.');
}
function openClassModal(idx){
  eClsIdx=idx;const isNew=idx===null;
  document.getElementById('mc-title').textContent=isNew?'ADD CLASS ITEM':'EDIT CLASS ITEM';
  document.getElementById('mc-del').style.display=isNew?'none':'block';
  const c=isNew?{no:'',finding:'',description:'',actions:[],by:'Crew',open_date:'',close_date:'',priority:'Normal'}:(FLEET[VID].classItems||[])[idx];
  document.getElementById('mc-no').value=c.no||'';document.getElementById('mc-find').value=c.finding||'';
  document.getElementById('mc-desc').value=c.description||'';
  // Action plan remarks
  const actRemarks = Array.isArray(c.actions) ? c.actions
    : (c.action ? [{date:'', progress:c.action, important:false}] : []);
  renderRemarkRowsTo('mc-act-body', actRemarks);
  document.getElementById('mc-by').value=c.by||'Crew';
  document.getElementById('mc-open').value=c.open_date||'';
  document.getElementById('mc-open-pick').value=c.open_date||'';
  document.getElementById('mc-close').value=c.close_date||'';
  document.getElementById('mc-close-pick').value=c.close_date||'';
  // Set priority radio
  const pri = c.priority||'Normal';
  document.querySelectorAll('input[name="mc-priority"]').forEach(r=>{ r.checked=(r.value===pri); });
  openM('m-class');
}
function saveClass(){
  if(!VID)return;
  const cd=document.getElementById('mc-close').value.trim();
  const selPri = document.querySelector('input[name="mc-priority"]:checked');
  const c={
    no:document.getElementById('mc-no').value.trim(),
    finding:document.getElementById('mc-find').value.trim(),
    description:document.getElementById('mc-desc').value.trim(),
    actions:collectRemarksFrom('mc-act-body'),
    by:document.getElementById('mc-by').value,
    open_date:document.getElementById('mc-open').value.trim(),
    close_date:cd,
    status:cd?'Closed':'Open',
    priority:selPri?selPri.value:'Normal'
  };
  if(!c.finding){toast('Finding title is required',true);return;}
  if(!FLEET[VID].classItems)FLEET[VID].classItems=[];
  if(eClsIdx===null)FLEET[VID].classItems.push(c);else FLEET[VID].classItems[eClsIdx]=c;
  persist('class',FLEET[VID].classItems);closeM('m-class');renderClass();renderDash();
  toast(eClsIdx===null?'Class item added':'Class item updated');
}
function deleteClass(){
  if(eClsIdx===null||!VID)return;if(!confirm('Delete this class item?'))return;
  FLEET[VID].classItems.splice(eClsIdx,1);persist('class',FLEET[VID].classItems);
  closeM('m-class');renderClass();renderDash();toast('Class item deleted');
}

// ══ DISCUSSION ════════════════════════════════════════
const SESSION_OPTS=['','Morning','Afternoon','Evening','Close meeting'];
const DISC_ST_OPTS=['Open','Close'];

function buildDDF(){
  if(!VID)return;
  const dates=[...new Set((FLEET[VID].discussions||[]).map(d=>d.date).filter(Boolean))];
  document.getElementById('d-df').innerHTML='<option value="">All Dates</option>'+dates.map(d=>`<option>${d}</option>`).join('');
}

function renderDisc(){
  if(!VID)return;
  const items=FLEET[VID].discussions||[];
  const q=document.getElementById('d-q').value.toLowerCase();
  const df=document.getElementById('d-df').value,sf=document.getElementById('d-sf').value;
  const pf=document.getElementById('d-pf').value;
  let fil=items.filter(d=>{
    if(q&&!d.item.toLowerCase().includes(q)&&!(d.description||'').toLowerCase().includes(q))return false;
    if(df&&d.date!==df)return false;
    if(sf&&d.status!==sf)return false;
    if(pf&&(d.priority||'Normal')!==pf)return false;
    return true;
  });
  document.getElementById('d-cnt').textContent=`${fil.length} items`;
  const tb=document.getElementById('d-body');
  if(!fil.length){tb.innerHTML='<tr><td colspan="9" class="empty-state">No discussion items found</td></tr>';return;}
  tb.innerHTML=fil.map(d=>{
    const ri=items.indexOf(d);
    const stCls=d.status==='Close'?'c-closed':'c-open';
    const stLbl=d.status==='Close'?'Closed':'Open';
    const priHtml=priorityBadge(d.priority);
    return`<tr>
      <td data-label="No."><span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-m)">${d.no}</span></td>
      <td data-label="Date"><span class="cell-edit" onclick="startEditD(this,${ri},'date','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-h);font-weight:600">${d.date||'—'}</span></td>
      <td data-label="Session"><span class="cell-edit" onclick="startEditSelectD(this,${ri},'time_of_day',${JSON.stringify(SESSION_OPTS)})" style="font-size:12px;color:var(--txt-s)">${d.time_of_day||'—'}</span></td>
      <td data-label="Item"><span class="cell-edit" onclick="startEditD(this,${ri},'item','text')" style="font-size:13px;font-weight:600;color:var(--txt-h);display:block;max-width:200px">${d.item||'—'}</span></td>
      <td data-label="Description"><span class="cell-edit" onclick="startEditD(this,${ri},'description','text')" style="font-size:12px;color:var(--txt-s);display:block;max-width:200px;white-space:pre-line">${d.description||'—'}</span></td>
      <td data-label="Action"><div style="font-size:12px;max-width:180px;cursor:pointer" onclick="openDiscModal(${ri})" title="클릭하여 편집">${renderActionsCell(d.actions, d.action)}</div></td>
      <td data-label="Priority">${priHtml}</td>
      <td data-label="Status"><span class="cell-edit" onclick="startEditSelectD(this,${ri},'status',['Open','Close'])">
        <span class="c-badge ${stCls}">${stLbl}</span>
      </span></td>
      <td style="white-space:nowrap"><button class="edit-btn" onclick="openDiscModal(${ri})">Edit</button><button class="attach-btn" id="dattbtn-${d._id}" onclick="openGenAttach('disc',${d._id})" title="첨부파일" style="${(FLEET[VID].attachSet||new Set()).has('disc:'+d._id)?'background:var(--blue);color:var(--white)':''}">${(FLEET[VID].attachSet||new Set()).has('disc:'+d._id)?'📎 1':'📎'}</button></td>
    </tr>`;
  }).join('');
}

function startEditD(span, ri, field, type){
  const origVal=FLEET[VID].discussions[ri][field]??'';
  const w=Math.max(span.offsetWidth,80);
  const inp=document.createElement('input');
  inp.className='inline-input';inp.type='text';inp.value=origVal;inp.style.width=(w+20)+'px';
  span.replaceWith(inp);inp.focus();inp.select();
  const save=()=>{
    FLEET[VID].discussions[ri][field]=inp.value.trim();
    persist('disc',FLEET[VID].discussions);
    buildDDF();renderDisc();
  };
  inp.addEventListener('blur',save);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape')renderDisc();});
}

function startEditSelectD(span, ri, field, options){
  const origVal=FLEET[VID].discussions[ri][field]??'';
  const sel=document.createElement('select');
  sel.className='inline-select';
  options.forEach(o=>{const opt=document.createElement('option');opt.value=o;opt.textContent=o||'—';if(o===origVal)opt.selected=true;sel.appendChild(opt);});
  span.replaceWith(sel);sel.focus();
  const save=()=>{
    FLEET[VID].discussions[ri][field]=sel.value;
    persist('disc',FLEET[VID].discussions);
    buildDDF();renderDisc();
  };
  sel.addEventListener('change',save);
  sel.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==sel)renderDisc();},150));
  sel.addEventListener('keydown',e=>{if(e.key==='Escape')renderDisc();});
}

function addDiscRow(){
  if(!VID)return;
  if(!FLEET[VID].discussions)FLEET[VID].discussions=[];
  const items=FLEET[VID].discussions;
  items.push({no:String(items.length+1),date:new Date().toISOString().slice(0,10),time_of_day:'',item:'',description:'',action:'',status:'Open'});
  persist('disc',items);
  buildDDF();renderDisc();
  requestAnimationFrame(()=>{
    const rows=document.querySelectorAll('#d-body tr');
    const last=rows[rows.length-1];
    if(last){const cells=last.querySelectorAll('.cell-edit');if(cells[1])cells[1].click();}
  });
  toast('새 로그가 추가됐습니다. 셀을 클릭해서 바로 입력하세요.');
}
function openDiscModal(idx){
  eDscIdx=idx;const isNew=idx===null;
  document.getElementById('md-title').textContent=isNew?'ADD DISCUSSION LOG':'EDIT LOG ITEM';
  document.getElementById('md-del').style.display=isNew?'none':'block';
  const d=isNew?{no:'',date:'',time_of_day:'',item:'',description:'',actions:[],status:'Open',priority:'Normal'}:(FLEET[VID].discussions||[])[idx];
  document.getElementById('md-date').value=d.date||'';
  document.getElementById('md-date-pick').value=d.date||'';
  document.getElementById('md-time').value=d.time_of_day||'';
  document.getElementById('md-item').value=d.item||'';document.getElementById('md-desc').value=d.description||'';
  // Action plan remarks
  const dActRemarks = Array.isArray(d.actions) ? d.actions
    : (d.action ? [{date:'', progress:d.action, important:false}] : []);
  renderRemarkRowsTo('md-act-body', dActRemarks);
  document.getElementById('md-stat').value=d.status||'Open';
  // Set priority radio
  const dpri = d.priority||'Normal';
  document.querySelectorAll('input[name="md-priority"]').forEach(r=>{ r.checked=(r.value===dpri); });
  openM('m-disc');
}
function saveDisc(){
  if(!VID)return;
  const items=FLEET[VID].discussions||[];
  const selPri = document.querySelector('input[name="md-priority"]:checked');
  const d={
    no:String(eDscIdx===null?items.length+1:items[eDscIdx].no),
    date:document.getElementById('md-date').value.trim(),
    time_of_day:document.getElementById('md-time').value,
    item:document.getElementById('md-item').value.trim(),
    description:document.getElementById('md-desc').value.trim(),
    actions:collectRemarksFrom('md-act-body'),
    status:document.getElementById('md-stat').value,
    priority:selPri?selPri.value:'Normal'
  };
  if(!d.item){toast('Topic is required',true);return;}
  if(!FLEET[VID].discussions)FLEET[VID].discussions=[];
  if(eDscIdx===null)FLEET[VID].discussions.push(d);else FLEET[VID].discussions[eDscIdx]=d;
  persist('disc',FLEET[VID].discussions);closeM('m-disc');buildDDF();renderDisc();
  toast(eDscIdx===null?'Log added':'Log updated');
}
function deleteDisc(){
  if(eDscIdx===null||!VID)return;if(!confirm('Delete?'))return;
  FLEET[VID].discussions.splice(eDscIdx,1);persist('disc',FLEET[VID].discussions);
  closeM('m-disc');buildDDF();renderDisc();toast('Log deleted');
}

// ══ VESSEL ADD/EDIT ═══════════════════════════════════
function openAddVesselModal(){
  eVesselNew=true;
  document.getElementById('mv-title').textContent='ADD NEW VESSEL';
  document.getElementById('mv-del').style.display='none';
  ['name','type','imo','yard','class','dur','grt'].forEach(k=>document.getElementById('mv-'+k).value='');
  ['mv-in','mv-out','mv-in-txt','mv-out-txt'].forEach(id=>document.getElementById(id).value='');
  openM('m-vessel');
}
function openVesselEditModal(){
  if(!VID)return;eVesselNew=false;
  const info=FLEET[VID].info;
  document.getElementById('mv-title').textContent='EDIT VESSEL INFO';
  document.getElementById('mv-del').style.display='block';
  document.getElementById('mv-name').value=info.name||'';document.getElementById('mv-type').value=info.type||'';
  document.getElementById('mv-imo').value=info.imo||'';document.getElementById('mv-yard').value=info.shipyard||'';
  document.getElementById('mv-class').value=info.classSociety||'';
  document.getElementById('mv-in').value=info.dockIn||'';document.getElementById('mv-in-txt').value=info.dockIn||'';
  document.getElementById('mv-out').value=info.dockOut||'';document.getElementById('mv-out-txt').value=info.dockOut||'';document.getElementById('mv-dur').value=info.duration||'';
  document.getElementById('mv-grt').value=info.grt||'';openM('m-vessel');
}
async function saveVessel(){
  const name=document.getElementById('mv-name').value.trim();
  if(!name){toast('Vessel name is required',true);return;}
  const payload={name,type:document.getElementById('mv-type').value.trim(),imo:document.getElementById('mv-imo').value.trim(),shipyard:document.getElementById('mv-yard').value.trim(),classSociety:document.getElementById('mv-class').value.trim(),dockIn:document.getElementById('mv-in').value||document.getElementById('mv-in-txt').value.trim(),dockOut:document.getElementById('mv-out').value||document.getElementById('mv-out-txt').value.trim(),duration:document.getElementById('mv-dur').value,grt:document.getElementById('mv-grt').value.trim()};
  setSS('saving');
  try{
    if(!eVesselNew&&VID){
      const updated=await apiFetch(`${API}/vessels/${VID}`,'PUT',payload);
      FLEET[VID].info=dbI(updated);
      setSS('synced');closeM('m-vessel');renderDash();
      setBreadcrumb([{label:'FLEET OVERVIEW',fn:'goFleet()'},{label:payload.name}]);
      toast('Vessel info updated');
    } else {
      const created=await apiFetch(`${API}/vessels`,'POST',payload);
      const id=created.id;
      FLEET[id]={info:dbI(created),jobs:[],classItems:[],discussions:[]};
      IDX.push(id);
      setSS('synced');closeM('m-vessel');renderFleet();toast(`${name} added to fleet`);
    }
  }catch(e){setSS('error');toast('저장 실패: '+e.message,true);}
}
async function deleteVessel(){
  if(!VID||eVesselNew)return;
  const name=FLEET[VID].info.name;
  if(!confirm(`Delete "${name}" and ALL its data? This cannot be undone.`))return;
  setSS('saving');
  try{
    await apiFetch(`${API}/vessels/${VID}`,'DELETE');
    IDX=IDX.filter(i=>i!==VID);delete FLEET[VID];
    setSS('synced');closeM('m-vessel');VID=null;goFleet();toast(`${name} removed from fleet`);
  }catch(e){setSS('error');toast('삭제 실패: '+e.message,true);}
}

// ══ HELPERS ═══════════════════════════════════════════
function show(id){document.querySelectorAll('.page:not([id^="vt-"]):not([id^="vtab-"])').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');}
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));

function setBreadcrumb(items){
  document.getElementById('breadcrumb').innerHTML=items.map((item,i)=>{
    const isLast=i===items.length-1;
    let h='';
    if(i>0)h+=`<span class="bc-sep">/</span>`;
    h+=`<span class="bc-item${isLast?' active':''}" ${item.fn?`onclick="${item.fn}"`:''} style="${!isLast?'cursor:pointer':''}">${item.label}</span>`;
    return h;
  }).join('');
}

function fmtK(n){if(n>=1e6)return'$'+(n/1e6).toFixed(1)+'M';if(n>=1000)return'$'+(n/1000).toFixed(0)+'K';return'$'+n;}

function toast(msg,isErr=false){
  const t=document.getElementById('toast');
  t.textContent=(isErr?'✕  ':'✓  ')+msg;
  t.className='toast show'+(isErr?' err':'');
  setTimeout(()=>t.classList.remove('show'),2800);
}


// ══════════════════════════════════════════════════════════════
// DAILY TRACKING LOGS
// ══════════════════════════════════════════════════════════════

// 탭별 설정
const TRACKING_CFG = {
  steel: {
    api: 'steel_repair', key: 'steel', tbody: 'steel-body',
    cols: ['no','description','location','priority','status','start_date','completion_date','remark'],
    headers: ['No.','Description','Location','Priority','Status','Start Date','Completion','Remark'],
    widths: ['50px','','120px','90px','120px','130px','130px',''],
    priCol: 'priority', statCol: 'status',
    newRow: ()=>({no:'',description:'',location:'',priority:'Normal',status:'Not Started',start_date:'',completion_date:'',remark:''}),
  },
  outfit: {
    api: 'outfitting', key: 'outfit', tbody: 'outfit-body',
    cols: ['no','description','location','priority','status','start_date','completion_date','remark'],
    headers: ['No.','Description','Location','Priority','Status','Start Date','Completion','Remark'],
    widths: ['50px','','120px','90px','120px','130px','130px',''],
    priCol: 'priority', statCol: 'status',
    newRow: ()=>({no:'',description:'',location:'',priority:'Normal',status:'Not Started',start_date:'',completion_date:'',remark:''}),
  },
  wbt: {
    api: 'wbt_cot', key: 'wbt', tbody: 'wbt-body',
    cols: ['no','tank_name','manhole_status','open_date','close_date','bottom_plug_open','bottom_plug_close','remark'],
    headers: ['No.','WBT / COT','Manhole','Open Date','Close Date','Bottom Plug Open','Bottom Plug Close','Remark'],
    widths: ['50px','','100px','130px','130px','140px','140px',''],
    priCol: null, statCol: null,
    dateCols: ['open_date','close_date','bottom_plug_open','bottom_plug_close'],
    newRow: ()=>({no:'',tank_name:'',manhole_status:'',open_date:'',close_date:'',bottom_plug_open:'',bottom_plug_close:'',remark:''}),
  },
  fan: {
    api: 'portable_fan', key: 'fan', tbody: 'fan-body',
    cols: ['no','location','qty','start_date','stop_date','remark'],
    headers: ['No.','Location','Q\'ty','Start Date','Stop Date','Remark'],
    widths: ['50px','','70px','130px','130px',''],
    priCol: null, statCol: null,
    newRow: ()=>({no:'',location:'',qty:'',start_date:'',stop_date:'',remark:''}),
  },
  staging: {
    api: 'staging', key: 'staging', tbody: 'staging-body',
    cols: ['no','location','staging_area','qty','remark'],
    headers: ['No.','Location / Frame No.','Staging Area (L×W×H)','Q\'ty','Remark'],
    widths: ['50px','','','80px',''],
    priCol: null, statCol: null,
    newRow: ()=>({no:'',location:'',staging_area:'',qty:'',remark:''}),
  },
  gasfree: {
    api: 'gas_free', key: 'gasfree', tbody: 'gasfree-body',
    cols: ['no','tank','certificate','date','remark'],
    headers: ['No.','Tank','Gas Free Certificate','Date','Remark'],
    widths: ['50px','','','130px',''],
    priCol: null, statCol: null,
    newRow: ()=>({no:'',tank:'',certificate:'',date:'',remark:''}),
  },
};

const PRI_OPTS  = ['Normal','Urgent','Critical','On Hold'];
const STAT_OPTS = ['Not Started','In Progress','Completed','On Hold'];

// Priority/Status 옵션 인덱스로 전달 (따옴표 충돌 방지)
const TRACKING_OPTS = { pri: PRI_OPTS, stat: STAT_OPTS };

// 데이터 로드 + 렌더
async function renderTracking(key){
  if(!VID) return;
  const cfg = TRACKING_CFG[key];
  try {
    const data = await apiFetch(`${API}/vessels/${VID}/${cfg.api}`);
    FLEET[VID][cfg.key] = data;
  } catch(e) { toast('로드 실패: '+e.message, true); return; }
  _renderTrackingTable(key);
}

function _renderTrackingTable(key){
  const cfg = TRACKING_CFG[key];
  const data = FLEET[VID][cfg.key] || [];
  const tbody = document.getElementById(cfg.tbody);
  if(!tbody) return;

  tbody.innerHTML = data.map((row, ri) => {
    const rowId = row.id;
    const cells = cfg.cols.map((col, ci) => {
      const v = row[col] || '';
      // dateCols 설정이 있으면 우선, 없으면 컬럼명에 date 포함 여부
      const isDate = cfg.dateCols
        ? cfg.dateCols.includes(col)
        : (col.includes('date') || col === 'date');

      // Priority 배지
      if(col === cfg.priCol){
        return `<td data-label="${cfg.headers[ci]}"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','pri')">${priorityBadge(v||'Normal')}</span></td>`;
      }
      // Status 배지
      if(col === cfg.statCol){
        const sc = v==='Completed'?'c-closed':v==='Not Started'||!v?'c-open':'cat-badge cat-sh';
        return `<td data-label="${cfg.headers[ci]}" style="white-space:nowrap"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','stat')"><span class="c-badge ${sc}">${v||'Not Started'}</span></span></td>`;
      }
      // 날짜 컬럼 — 캘린더 버튼 포함
      if(isDate){
        const dv = v ? String(v).slice(0,10) : '';
        return `<td data-label="${cfg.headers[ci]}" style="white-space:nowrap">
          <div style="display:flex;align-items:center;gap:4px;">
            <span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-s);white-space:nowrap">${dv||'—'}</span>
            <span class="cal-btn" style="width:28px;height:24px;font-size:13px;flex-shrink:0;" title="날짜 선택">📅<input type="date" ${dv?`value="${dv}"`:''}  onchange="setTrackingDate('${key}','${rowId}','${col}',this.value)" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;"></span>
          </div>
        </td>`;
      }
      // No. 컬럼
      if(col === 'no'){
        return `<td data-label="No."><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--blue);font-weight:600">${v||'—'}</span></td>`;
      }
      // 기본
      return `<td data-label="${cfg.headers[ci]}"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-size:13px;color:var(--txt-b)">${v||'—'}</span></td>`;
    });
    return `<tr data-id="${rowId}">${cells.join('')}<td><button class="edit-btn" style="color:var(--red)" onclick="deleteTrackingRow('${key}','${rowId}')">✕</button></td></tr>`;
  }).join('');

  if(!data.length){
    tbody.innerHTML = `<tr><td colspan="${cfg.cols.length+1}" class="empty-state">데이터가 없습니다. xlsx 업로드 또는 + Add Row를 사용하세요.</td></tr>`;
  }
}

// 캘린더로 날짜 직접 설정
async function setTrackingDate(key, rowId, col, val){
  const cfg = TRACKING_CFG[key];
  const row = (FLEET[VID][cfg.key]||[]).find(r=>String(r.id)===String(rowId));
  if(!row) return;
  row[col] = val;
  await saveTrackingRow(key, rowId, row);
}

// 인라인 편집
function startTrackingEdit(span, key, rowId, col, type, optsOrKey){
  const cfg = TRACKING_CFG[key];
  const row = (FLEET[VID][cfg.key]||[]).find(r=>String(r.id)===String(rowId));
  if(!row) return;
  const origVal = row[col] || '';

  if(type === 'select'){
    // 문자열 키('pri','stat')면 배열로 변환
    const opts = typeof optsOrKey === 'string'
      ? (TRACKING_OPTS[optsOrKey] || [])
      : (optsOrKey || []);

    const sel = document.createElement('select');
    sel.className = 'inline-select';
    opts.forEach(o=>{ const op=document.createElement('option'); op.value=o; op.textContent=o; if(o===origVal)op.selected=true; sel.appendChild(op); });
    let saved = false;
    sel.onchange = ()=>{
      saved = true;
      row[col] = sel.value;
      saveTrackingRow(key, rowId, row);
    };
    sel.onblur = ()=>{ if(!saved) _renderTrackingTable(key); };
    span.replaceWith(sel); sel.focus();
    return;
  }

  const inp = document.createElement('input');
  inp.className = 'inline-input';
  inp.value = origVal;
  inp.style.width = Math.max(span.offsetWidth, 80) + 'px';
  inp.onblur = ()=>{ row[col]=inp.value; saveTrackingRow(key, rowId, row); };
  inp.onkeydown = e=>{ if(e.key==='Enter')inp.blur(); if(e.key==='Escape'){inp.value=origVal;_renderTrackingTable(key);} };
  span.replaceWith(inp); inp.focus(); inp.select();
}

// 저장
async function saveTrackingRow(key, id, row){
  const cfg = TRACKING_CFG[key];
  setSS('saving');
  try {
    await apiFetch(`${API}/${cfg.api}/${id}`, 'PUT', row);
    setSS('synced');
  } catch(e){ setSS('error'); toast('저장 실패: '+e.message, true); }
  _renderTrackingTable(key);
}

// 행 추가
async function addTrackingRow(key){
  if(!VID) return;
  const cfg = TRACKING_CFG[key];
  setSS('saving');
  try {
    const newRow = await apiFetch(`${API}/vessels/${VID}/${cfg.api}`, 'POST', cfg.newRow());
    FLEET[VID][cfg.key] = [...(FLEET[VID][cfg.key]||[]), newRow];
    setSS('synced');
    _renderTrackingTable(key);
    toast('행이 추가됐습니다');
  } catch(e){ setSS('error'); toast('추가 실패: '+e.message, true); }
}

// 행 삭제
async function deleteTrackingRow(key, rowId){
  if(!confirm('이 행을 삭제하시겠습니까?')) return;
  const cfg = TRACKING_CFG[key];
  setSS('saving');
  try {
    await apiFetch(`${API}/${cfg.api}/${rowId}`, 'DELETE');
    FLEET[VID][cfg.key] = (FLEET[VID][cfg.key]||[]).filter(r=>String(r.id)!==String(rowId));
    setSS('synced');
    _renderTrackingTable(key);
    toast('삭제됐습니다');
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message, true); }
}

// xlsx 업로드 모달
function openTrackingXlsx(){ openM('m-tracking-xlsx'); }

async function uploadTrackingXlsx(input){
  if(!VID){ toast('선박을 먼저 선택하세요', true); return; }
  if(!input.files.length) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  setSS('saving');
  document.getElementById('xlsx-result').style.display='none';

  try {
    const res = await fetch(`${API}/vessels/${VID}/tracking/upload_xlsx`, {method:'POST', body:formData});
    const data = await res.json();
    if(!res.ok){ toast(data.error||'업로드 실패', true); setSS('error'); return; }

    setSS('synced');
    const imp = data.imported || {};
    const summary = Object.entries({
      steel_repair:'Steel Repair', outfitting:'Outfitting', wbt_cot:'WBT & COT',
      portable_fan:'Portable Fan', staging:'Staging', gas_free:'Gas Free'
    }).map(([k,label])=>imp[k]!=null?`${label}: <b>${imp[k]}건</b>`:'').filter(Boolean).join(' &nbsp;|&nbsp; ');

    const resEl = document.getElementById('xlsx-result');
    resEl.style.display='block';
    resEl.innerHTML=`<div style="background:var(--green-bg);border:1.5px solid var(--green);border-radius:8px;padding:12px;font-size:13px;color:var(--green)">✅ 업로드 완료!<br><span style="font-size:12px;color:var(--txt-s)">${summary}</span></div>`;

    // 현재 탭 데이터 갱신
    for(const [apiKey, fKey] of [['steel_repair','steel'],['outfitting','outfit'],['wbt_cot','wbt'],['portable_fan','fan'],['staging','staging'],['gas_free','gasfree']]){
      if(imp[apiKey] != null){
        const fresh = await apiFetch(`${API}/vessels/${VID}/${apiKey}`);
        FLEET[VID][fKey] = fresh;
      }
    }
    _renderTrackingTable('outfit');
    toast('xlsx 업로드 완료!');
  } catch(e){
    setSS('error'); toast('업로드 실패: '+e.message, true);
  }
  input.value='';
}

loadAll();
