// ══ STATE ════════════════════════════════════════════
let FLEET = {}, IDX = [];
let VID = null;          // current vessel id
let eJobIdx=null, eClsIdx=null, eDscIdx=null, eVesselNew=true;
let sKey='number', sDir=1;
let _budCatExpanded = new Set();    // Dashboard: Budget 카테고리 펼침 상태 (기본 접힘)
let _clsDateExpanded = new Set();   // Dashboard: Class Items 날짜그룹 펼침 상태 (기본 접힘)
let _secBudCatExpanded = new Set(); // Dashboard: Budget Consumption 카테고리 펼침 상태 (기본 접힘)
let _qfJob = null;  // Jobs 퀵필터: 'critical'|'urgent'|'wip'|'novendor'|null
let _qfCls = null;  // Class 퀵필터: 'critical'|'urgent'|'open'|null

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
    else if(key==='class'){
      const res = await apiFetch(`${API}/vessels/${VID}/class_items/bulk`,'PUT',data);
      if(Array.isArray(res)) FLEET[VID].classItems = res.map(dbC);
    }
    else if(key==='disc'){
      const res = await apiFetch(`${API}/vessels/${VID}/discussions/bulk`,'PUT',data);
      if(Array.isArray(res)) FLEET[VID].discussions = res.map(dbD);
    }
    setSS('synced');
  }catch(e){setSS('error');toast('저장 실패: '+e.message,true);}
}

function isViewer() { return CURRENT_USER.role === 'viewer'; }

function applyRoleUI() {
  const isAdminUser = CURRENT_USER.role === 'admin';

  // 아바타 이니셜 + 사용자명 설정
  const initial = (CURRENT_USER.username||'?')[0].toUpperCase();
  const avatarEl = document.getElementById('avatarInitial');
  if(avatarEl) avatarEl.textContent = initial;
  const avatarUser = document.getElementById('avatarMenuUser');
  if(avatarUser) avatarUser.textContent = CURRENT_USER.username + ' (' + (CURRENT_USER.role||'editor') + ')';

  // 사용자 관리 메뉴 아이템 — admin 아니면 숨김
  const userMgmtItem = document.getElementById('avatarUserMgmtItem');
  if(userMgmtItem) userMgmtItem.style.display = isAdminUser ? '' : 'none';

  // viewer면 CSS로 쓰기 UI 전체 숨김 (role이 명시적으로 'viewer'일 때만)
  if(CURRENT_USER && CURRENT_USER.role === 'viewer') {
    if(!document.getElementById('viewer-style')) {
      const style = document.createElement('style');
      style.id = 'viewer-style';
      style.textContent = `
        .btn-add, .add-btn, .edit-btn, .btn-edit,
        #j-add-row-btn, .upload-btn,
        .j-toolbar .btn-sec, .c-toolbar .btn-sec, .d-toolbar .btn-sec,
        button[onclick*="openJobModal(null)"], button[onclick*="openAddVesselModal"],
        button[onclick*="addDiscRow"], button[onclick*="addInlineRow"],
        button[onclick*="uploadJobsCSV"],
        button[onclick*="csv-upload-input"],
        button[onclick*="downloadCSVTemplate"],
        button[onclick*="addTrackingRow"], button[onclick*="deleteTrackingRow"],
        button[onclick*="openTrackingXlsx"],
        button[onclick*="showTankAddForm"], button[onclick*="saveTankItem"],
        button[onclick*="openTankLayoutEditor"], button[onclick*="openOrphanRecovery"],
        button[onclick*="startTankItemEdit"], button[onclick*="startPipeItemEdit"]
        { display: none !important; }
        .cell-edit { pointer-events: none !important; cursor: default !important; }
        .tracking-date-cell input, .tracking-date-cell select
        { pointer-events: none !important; }
      `;
      document.head.appendChild(style);
    }
  }
}

async function loadAll(){
  setSS('saving');
  // 현재 사용자 정보 로드
  try {
    CURRENT_USER = await apiFetch(`${API}/auth/me`);
    applyRoleUI();
  } catch(e) {}

  try{
    const summary=await apiFetch(`${API}/fleet/summary`);
    IDX=[];FLEET={};
    if(!summary.length){
      const v=await apiFetch(`${API}/vessels`,'POST',{
        name:'KUWAIT PROSPERITY',type:'Container Carrier',
        imo:'',shipyard:'',classSociety:'',dockIn:'',dockOut:'',duration:'',grt:''
      });
      IDX=[v.id];
      FLEET[v.id]={info:dbI(v),jobs:[],classItems:[],discussions:[],steel:[],pipe:[],outfit:[],wbt:[],fan:[],staging:[],gasfree:[],attachSet:new Set()};
    } else {
      for(const e of summary){
        const id=e.info.id; IDX.push(id);
        FLEET[id]={info:dbI(e.info),jobs:(e.jobs||[]).map(dbJ),classItems:(e.classItems||[]).map(dbC),discussions:(e.discussions||[]).map(dbD),steel:[],pipe:[],outfit:[],wbt:[],fan:[],staging:[],gasfree:[],
          attachSet: new Set((e.attachments||[]).map(a=>`${a.ref_type}:${a.ref_id}`))};
        // secBudget 로드
        (e.secBudget||[]).forEach(sb => {
          const key = `${id}::${sb.category}::${sb.section}`;
          if(!window._secManualBudget) window._secManualBudget = {};
          window._secManualBudget[key] = {budget: sb.budget||0, consumed: sb.consumed||0};
        });
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
function dbI(r){return{id:r.id,name:r.name||'',type:r.type||'',imo:r.imo||'',shipyard:r.shipyard||'',classSociety:r.class_society||r.classSociety||'',berthingDate:r.berthing_date||r.berthingDate||'',dockIn:r.dock_in||r.dockIn||'',dockOut:r.dock_out||r.dockOut||'',departureDate:r.departure_date||r.departureDate||'',duration:r.duration||'',grt:r.grt||'',dcRate:+(r.dcRate||r.dc_rate||0)};}function dbJ(r){
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
  const now = new Date(); now.setHours(0,0,0,0);
  const bd   = info.berthingDate   ? new Date(info.berthingDate)   : null;
  const di   = info.dockIn         ? new Date(info.dockIn)         : null;
  const dout = info.dockOut        ? new Date(info.dockOut)        : null;
  const dep  = info.departureDate  ? new Date(info.departureDate)  : null;
  // 기준 날짜가 하나도 없으면 PLANNED
  if(!bd && !di) return 'PLANNED';
  // Departure 이후 → COMPLETED
  if(dep && now > dep) return 'COMPLETED';
  // Dock In ~ Dock Out → IN DRY DOCK
  if(di && dout && now >= di && now <= dout) return 'IN DRY DOCK';
  // Dock In 이후 (dockOut 없거나 아직 안됨) → IN DRY DOCK
  if(di && !dout && now >= di) return 'IN DRY DOCK';
  // Berthing ~ (Dock In 전, 또는 Dock Out ~ Departure) → IN WET DOCK
  if(bd && now >= bd) return 'IN WET DOCK';
  // Berthing 전 → PLANNED
  return 'PLANNED';
}

function renderFleet(){
  let active=0,done=0,cls=0;
  IDX.forEach(id=>{const v=FLEET[id];cls+=(v.classItems||[]).filter(c=>c.status==='Open').length;const s=vesselStatus(v.info);if(s==='IN DRY DOCK'||s==='IN WET DOCK')active++;if(s==='COMPLETED')done++;});
  document.getElementById('fk-v').textContent=IDX.length;
  document.getElementById('fk-a').textContent=active;
  document.getElementById('fk-d').textContent=done;
  document.getElementById('fk-c').textContent=cls;

  document.getElementById('vesselsGrid').innerHTML=IDX.map(id=>{
    const v=FLEET[id],info=v.info,jobs=v.jobs||[];
    const dcRate = info.dcRate || 0;
    const tb = jobs.reduce((s,j) => { const b=+j.budget||0; return s+(j.category==='Shipyard'?b*(1-dcRate/100):b); }, 0);
    const tc = jobs.reduce((s,j) => { const c=+j.consumption||0; return s+(j.category==='Shipyard'?c*(1-dcRate/100):c); }, 0);
    const pct=tb?Math.min(100,(tc/tb)*100):0;
    const done2=jobs.filter(j=>{if(hasChildren(j.number,jobs))return false;const p=calcProgress(j.start_date,j.end_date);return(p!==null?p:j.completion||0)>=100;}).length;
    const leafCount=jobs.filter(j=>!hasChildren(j.number,jobs)).length;
    const oc=(v.classItems||[]).filter(c=>c.status==='Open').length;
    const st=vesselStatus(info);
    const stripeCls=st==='IN DRY DOCK'?'amber':st==='IN WET DOCK'?'amber':st==='COMPLETED'?'green':'grey';
    const badgeCls=st==='IN DRY DOCK'?'sb-dock':st==='IN WET DOCK'?'sb-wet':st==='COMPLETED'?'sb-done':'sb-plan';

    // D-Day 배지 — Departure 기준, 없으면 Dock Out 기준
    let ddayBadge = '';
    const ddRef = info.departureDate || info.dockOut;
    if(ddRef) {
      const todayD = new Date(); todayD.setHours(0,0,0,0);
      const refD = new Date(ddRef);
      const diff = Math.round((refD - todayD) / 86400000);
      let ddColor, ddText;
      if(st === 'COMPLETED') {
        ddColor = '#64748b'; ddText = 'DONE';
      } else if(diff < 0) {
        ddColor = '#dc2626'; ddText = `D+${Math.abs(diff)}`;
      } else if(diff <= 7) {
        ddColor = '#d97706'; ddText = `D-${diff}`;
      } else {
        ddColor = '#1d6fdb'; ddText = `D-${diff}`;
      }
      ddayBadge = `<span style="background:${ddColor}18;color:${ddColor};border:1.5px solid ${ddColor}44;font-size:12px;font-weight:700;padding:2px 9px;border-radius:8px;font-family:'IBM Plex Mono',monospace;letter-spacing:.5px;white-space:nowrap">${ddText}</span>`;
    }

    // Duration: Dock In ~ Dock Out (상가~하가)
    const autoDur = (info.dockIn && info.dockOut)
      ? Math.round((new Date(info.dockOut) - new Date(info.dockIn)) / 86400000) + 1
      : (info.duration || null);
    let elapsedTag = '';
    if(info.dockIn) {
      const todayC = new Date(); todayC.setHours(0,0,0,0);
      const diC = new Date(info.dockIn);
      const doC = info.dockOut ? new Date(info.dockOut) : null;
      if(todayC < diC) {
        elapsedTag = `<span style="font-size:11px;color:#94a3b8;font-weight:600">상가 전</span>`;
      } else if(doC && todayC <= doC) {
        elapsedTag = `<span style="font-size:11px;color:var(--amber);font-weight:600">상가 중</span>`;
      } else {
        elapsedTag = `<span style="font-size:11px;color:var(--green);font-weight:600">하가 완료</span>`;
      }
    }

    return`<div class="vessel-card" onclick="openVessel('${id}')">
      <div class="vc-stripe ${stripeCls}"></div>
      <div class="vc-top">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          ${ddayBadge||`<span></span>`}
          <span class="status-badge ${badgeCls}">${st}</span>
        </div>
        <div class="vc-name">${info.name}</div>
        ${info.type?`<div class="vc-type">${info.type}</div>`:''}
        <div class="vc-meta" style="margin-top:8px">
          ${info.shipyard?`<div class="vc-meta-item" style="margin-bottom:4px"><b>${info.shipyard}</b></div>`:''}
          <div class="vc-meta-row">
            ${info.berthingDate?`<span class="vc-date-item">Berthing: <b>${info.berthingDate}</b></span>`:''}
            ${info.dockIn?`<span class="vc-date-item">Dock In: <b>${info.dockIn}</b></span>`:''}
          </div>
          <div class="vc-meta-row">
            ${info.dockOut?`<span class="vc-date-item">Dock Out: <b>${info.dockOut}</b></span>`:''}
            ${info.departureDate?`<span class="vc-date-item">Departure: <b>${info.departureDate}</b></span>`:''}
          </div>
          ${elapsedTag?`<div style="margin-top:4px">${elapsedTag}</div>`:''}
        </div>
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
        <div class="vc-stat"><div class="vc-stat-n">${leafCount}</div><div class="vc-stat-l">Jobs</div></div>
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
  resetQF();
  show('page-vessel');
  showTab('dashboard',document.querySelector('.vnav-btn'));
  setBreadcrumb([{label:'FLEET OVERVIEW',fn:'goFleet()'},{label:FLEET[id].info.name}]);
}
function goFleet(){VID=null;renderFleet();}

// ── Avatar 메뉴 ───────────────────────────────────────
function toggleAvatarMenu() {
  const menu = document.getElementById('avatarMenu');
  const isOpen = menu.classList.contains('open');
  if(isOpen){ menu.classList.remove('open'); return; }
  menu.classList.add('open');
  setTimeout(()=>{
    document.addEventListener('click', function _close(e){
      if(!e.target.closest('#avatarWrap')){
        menu.classList.remove('open');
        document.removeEventListener('click',_close);
      }
    });
  },0);
}
function closeAvatarMenu(){ document.getElementById('avatarMenu').classList.remove('open'); }

// ── Tracking 서브탭 (nav 아래 가로 행) ───────────────
function toggleTrackingMenu(triggerBtn) {
  const menu = document.getElementById('trackingMenu');
  const isOpen = menu.classList.contains('open');
  if(isOpen && document.querySelector('.tracking-sub-btn.active')) return;
  menu.classList.toggle('open', !isOpen);
  triggerBtn.classList.toggle('active', !isOpen);
}

function pickTrackingTab(tab, btn) {
  document.querySelectorAll('.tracking-sub-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const trigger = document.getElementById('trackingTriggerBtn');
  if(trigger) trigger.classList.add('active');
  showTab(tab, null);
}

// ── Quick Filter ──────────────────────────────────────
function toggleQF(type, filter) {
  if(type==='j'){
    _qfJob = (_qfJob===filter) ? null : filter;
    ['wip','ns','done','novendor'].forEach(f=>{
      const btn=document.getElementById('qf-j-'+f);
      if(btn) btn.classList.toggle('active', _qfJob===f);
    });
    renderJobs();
  } else if(type==='c'){
    _qfCls = (_qfCls===filter) ? null : filter;
    ['critical','urgent','open'].forEach(f=>{
      const btn=document.getElementById('qf-c-'+f);
      if(btn) btn.classList.toggle('active', _qfCls===f);
    });
    renderClass();
  }
}

function resetQF(){
  _qfJob=null; _qfCls=null;
  ['wip','ns','done','novendor'].forEach(f=>{
    const btn=document.getElementById('qf-j-'+f); if(btn) btn.classList.remove('active');
  });
  ['critical','urgent','open'].forEach(f=>{
    const btn=document.getElementById('qf-c-'+f); if(btn) btn.classList.remove('active');
  });
}

// ── Jump to Today ─────────────────────────────────────
function jumpToToday() {
  const today = fmtD(new Date());
  const df = document.getElementById('d-df');
  if(df) df.value = today;
  const q=document.getElementById('d-q'); if(q) q.value='';
  const sf=document.getElementById('d-sf'); if(sf) sf.value='';
  const pf=document.getElementById('d-pf'); if(pf) pf.value='';
  if(discCollapsed.has(today)) discCollapsed.delete(today);
  renderDisc();
  setTimeout(()=>{
    const headers = document.querySelectorAll('#d-body .disc-date-header td');
    for(const td of headers){
      if(td.textContent.includes(today)){
        td.parentElement.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
    }
  },80);
  toast('오늘 ('+today+') 항목으로 이동');
}

// ══ USER MANAGEMENT ═══════════════════════════════════
async function openUserMgmt() {
  // admin만 추가 섹션 표시
  const addSection = document.getElementById('user-add-section');
  if(addSection) addSection.style.display = CURRENT_USER.role==='admin' ? 'block' : 'none';

  // 선박 체크박스 동적 생성
  const checksEl = document.getElementById('new-vessel-checks');
  if(checksEl) {
    checksEl.innerHTML = IDX.map(vid => {
      const name = FLEET[vid]?.info?.name || vid;
      return `<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;background:var(--bg-panel);padding:4px 8px;border-radius:6px">
        <input type="checkbox" value="${vid}"> ${name}
      </label>`;
    }).join('');
  }
  await loadUserList();
  openM('m-user-mgmt');
}

// 사용자 vessel 캐시
const _userVesselCache = {};
const _userNameCache = {};

async function loadUserList() {
  try {
    const users = await apiFetch('/api/auth/users');
    const el = document.getElementById('user-list');
    const roleLabel = {'admin':'관리자','editor':'편집자','viewer':'읽기전용'};
    const roleColor = {'admin':'var(--blue)','editor':'var(--green)','viewer':'var(--amber)'};
    if(!users.length) { el.innerHTML='<div style="color:var(--txt-m);font-size:13px">등록된 사용자 없음</div>'; return; }
    el.innerHTML = users.map(u => {
      const vessels = JSON.parse(u.vessels||'[]');
      _userVesselCache[u.id] = vessels;
      _userNameCache[u.id] = u.username;
      const vesselNames = vessels.map(vid => FLEET[vid]?.info?.name || vid).join(', ') || '전체';
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg-panel);border-radius:8px;margin-bottom:6px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
            <span style="font-size:13px;font-weight:600;color:var(--txt-h)">${u.username}</span>
            <span style="font-size:10px;font-weight:600;color:${roleColor[u.role]||'var(--txt-m)'};background:var(--bg-white);padding:2px 7px;border-radius:4px;border:1px solid ${roleColor[u.role]||'var(--border)'}">${roleLabel[u.role]||u.role}</span>
          </div>
          <div style="font-size:11px;color:var(--txt-m)">접근 선박: ${u.role==='admin'?'전체':vesselNames}</div>
        </div>
        ${u.username!=='admin' && CURRENT_USER.role==='admin' ?`
        <div style="display:flex;gap:6px">
          <button class="btn-sec" style="font-size:11px;padding:4px 8px" onclick="editUserVessels(${u.id})">⚙ 설정</button>
          <button class="btn-sec" style="font-size:11px;padding:4px 8px;color:var(--red)" onclick="deleteUserMgmt(${u.id},'${u.username}')">삭제</button>
        </div>`:''}
      </div>`;
    }).join('');
  } catch(e) { console.error(e); }
}

async function addUserMgmt() {
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const role = document.getElementById('new-role').value;
  const errEl = document.getElementById('user-add-err');
  errEl.style.display = 'none';
  if(!username||!password) { errEl.textContent='아이디와 비밀번호를 입력하세요'; errEl.style.display='block'; return; }

  // 선택된 vessel 수집
  const vessels = [];
  document.querySelectorAll('#new-vessel-checks input:checked').forEach(cb => vessels.push(cb.value));

  try {
    await apiFetch('/api/auth/users','POST',{username, password, role, vessels});
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    await loadUserList();
    toast('사용자가 추가됐습니다');
  } catch(e) { errEl.textContent = e.message||'추가 실패'; errEl.style.display='block'; }
}

async function editUserVessels(uid) {
  const username = _userNameCache[uid] || '';
  const currentVessels = _userVesselCache[uid] || [];
  const vesselOpts = IDX.map(vid => {
    const name = FLEET[vid]?.info?.name || vid;
    const checked = currentVessels.includes(vid) ? 'checked' : '';
    return `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer">
      <input type="checkbox" value="${vid}" ${checked}> <span style="font-size:13px">${name}</span>
    </label>`;
  }).join('');

  const roleOpts = ['editor','viewer'].map(r =>
    `<option value="${r}">${r==='editor'?'편집자':'읽기전용'}</option>`).join('');

  const html = `<div style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:12px">👤 ${username} 설정</div>
    <div style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--txt-s);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">역할</div>
      <select id="edit-role" class="form-ctrl">${roleOpts}</select>
    </div>
    <div>
      <div style="font-size:11px;color:var(--txt-s);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">접근 가능 선박</div>
      <div id="edit-vessel-checks">${vesselOpts}</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn-add" onclick="saveUserEdit(${uid})" style="flex:1">저장</button>
      <button class="btn-sec" onclick="closeM('m-edit-user')" style="flex:1">취소</button>
    </div>
  </div>`;

  // 간단한 인라인 모달
  let editModal = document.getElementById('m-edit-user');
  if(!editModal) {
    editModal = document.createElement('div');
    editModal.id = 'm-edit-user';
    editModal.className = 'modal-overlay';
    editModal.innerHTML = `<div class="modal" style="width:380px"><div id="edit-user-body"></div></div>`;
    document.body.appendChild(editModal);
  }
  document.getElementById('edit-user-body').innerHTML = html;
  openM('m-edit-user');
}

async function saveUserEdit(uid) {
  const role = document.getElementById('edit-role').value;
  const vessels = [];
  document.querySelectorAll('#edit-vessel-checks input:checked').forEach(cb => vessels.push(cb.value));
  try {
    await apiFetch(`/api/auth/users/${uid}`,'PUT',{role, vessels});
    closeM('m-edit-user');
    await loadUserList();
    toast('설정이 저장됐습니다');
  } catch(e) { toast('저장 실패: '+e.message, true); }
}

async function deleteUserMgmt(uid, username) {
  if(!confirm(`'${username}' 계정을 삭제하시겠습니까?`)) return;
  try {
    await apiFetch(`/api/auth/users/${uid}`,'DELETE');
    await loadUserList();
    toast('사용자가 삭제됐습니다');
  } catch(e) { toast('삭제 실패: '+e.message, true); }
}

async function changePw() {
  const oldPw = document.getElementById('old-pw').value;
  const newPw = document.getElementById('new-pw').value;
  const msgEl = document.getElementById('pw-msg');
  msgEl.style.display = 'none';
  if(!oldPw||!newPw) { msgEl.textContent='비밀번호를 입력하세요'; msgEl.style.color='var(--red)'; msgEl.style.display='block'; return; }
  try {
    await apiFetch('/api/auth/password','PUT',{old_password:oldPw,new_password:newPw});
    document.getElementById('old-pw').value = '';
    document.getElementById('new-pw').value = '';
    msgEl.textContent = '비밀번호가 변경됐습니다';
    msgEl.style.color = 'var(--green)';
    msgEl.style.display = 'block';
  } catch(e) { msgEl.textContent=e.message||'변경 실패'; msgEl.style.color='var(--red)'; msgEl.style.display='block'; }
}

function printCurrentTab() {
  const activeBtn = document.querySelector('.vnav-btn.active');
  const isGantt = activeBtn && activeBtn.textContent.trim().includes('Gantt');

  const old = document.getElementById('print-orientation');
  if(old) old.remove();

  const style = document.createElement('style');
  style.id = 'print-orientation';

  if(isGantt) {
    document.documentElement.classList.add('print-gantt');
    style.innerHTML = '@media print { @page { size: A4 landscape; margin: 6mm; } }';
    document.head.appendChild(style);

    const gWrap = document.getElementById('g-wrap');
    const inner = gWrap ? gWrap.firstElementChild : null;
    if(inner) {
      const contentW = inner.scrollWidth;
      const pageW = Math.floor((297 - 12) / 25.4 * 96);
      if(contentW > pageW) {
        const scale = pageW / contentW;
        inner.style.transformOrigin = 'top left';
        inner.style.transform = `scale(${scale})`;
        const origH = inner.scrollHeight;
        inner.style.marginBottom = `-${Math.round(origH * (1 - scale))}px`;
        inner.dataset.printScaled = '1';
      }
    }
  } else {
    document.documentElement.classList.remove('print-gantt');
    style.innerHTML = '@media print { @page { size: A4 portrait; margin: 8mm; } }';
    document.head.appendChild(style);
  }

  window.print();

  setTimeout(() => {
    document.documentElement.classList.remove('print-gantt');
    const s = document.getElementById('print-orientation');
    if(s) s.remove();
    const gWrap = document.getElementById('g-wrap');
    const inner = gWrap ? gWrap.firstElementChild : null;
    if(inner && inner.dataset.printScaled) {
      inner.style.transform = '';
      inner.style.transformOrigin = '';
      inner.style.marginBottom = '';
      delete inner.dataset.printScaled;
    }
  }, 500);
}

function showTab(tab,btn){
  // 일반 탭 이동 시 tracking 서브탭 닫기
  if(!['steel','pipe','outfit','wbt','fan','staging','gasfree'].includes(tab)) {
    const menu = document.getElementById('trackingMenu');
    if(menu) menu.classList.remove('open');
    document.querySelectorAll('.tracking-sub-btn').forEach(b => b.classList.remove('active'));
    const trigger = document.getElementById('trackingTriggerBtn');
    if(trigger) trigger.classList.remove('active');
  }
  document.querySelectorAll('.vnav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('[id^="vt-"]').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('[id^="vt-"]').forEach(t=>t.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const el=document.getElementById('vt-'+tab);if(el)el.classList.add('active');
  if(tab==='dashboard')renderDash();
  if(tab==='jobs'){
    buildJFilters();
    // 탭 열 때 루트(depth=0) 항목 자동 접기 (nav 이동 시 skip)
    const jobs = FLEET[VID] ? (FLEET[VID].jobs||[]) : [];
    if(!_calNavExpand && jobs.length > 0 && jobCollapsed.size === 0) {
      const numMap = {};
      jobs.forEach(j => { if(j.number) numMap[j.number] = j; });
      jobs.forEach(j => {
        if(!j.number) return;
        const p = getParentNumber(j.number);
        if(!p || !numMap[p]) jobCollapsed.add(j.number); // 루트 항목
      });
    }
    renderJobs();
  }
  if(tab==='gantt'){
    const btn = document.getElementById('btn-gantt-expand');
    if(btn) btn.textContent = _expandAll ? '▼ 전체 접기' : '▶ 전체 펼치기';
    renderGantt();
  }
  if(tab==='class')renderClass();
  if(tab==='daily'){buildDDF();renderDisc();}
  if(tab==='steel')renderTracking('steel');
  if(tab==='pipe')renderTracking('pipe');
  if(tab==='outfit')renderTracking('outfit');
  if(tab==='wbt')renderTracking('wbt');
  if(tab==='fan')renderTracking('fan');
  if(tab==='staging')renderTracking('staging');
  if(tab==='gasfree')renderTracking('gasfree');
  if(tab==='calendar')renderCalendar();
  if(tab==='documents')renderDocuments();
  if(tab==='tankplan')renderTankPlan();
  if(tab==='pipeplan')renderPipePlan();
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
      btn.textContent = has ? '📎 +' : '📎';
    } catch(e) {}
  }));
}

// ══ DASHBOARD ════════════════════════════════════════
function toggleBudCat(cat){
  if(_budCatExpanded.has(cat)) _budCatExpanded.delete(cat);
  else _budCatExpanded.add(cat);
  renderDash();
}
function toggleClsDate(dt){
  if(_clsDateExpanded.has(dt)) _clsDateExpanded.delete(dt);
  else _clsDateExpanded.add(dt);
  renderDash();
}
function toggleBudgetConsumption(){
  const body  = document.getElementById('v-budc-body');
  const arrow = document.getElementById('v-budc-arrow');
  if(!body) return;
  const open = body.style.display === 'none';
  body.style.display  = open ? '' : 'none';
  arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
}
function toggleSecBudCat(cat){
  if(_secBudCatExpanded.has(cat)) _secBudCatExpanded.delete(cat);
  else _secBudCatExpanded.add(cat);
  renderDash();
}
function renderDash(){
  if(!VID)return;
  const v=FLEET[VID],info=v.info,jobs=v.jobs||[];
  // _autoSum이 항상 최신값이 되도록 재계산 (Job Progress 탭 미방문 시에도 동일 값 보장)
  computeParentDates(jobs);
  computeParentSums(jobs);
  // Shipyard는 After D/C 기준으로 합산
  const dcRate = info.dcRate || 0;
  const tb = jobs.reduce((s,j) => {
    const b = +j.budget||0;
    return s + (j.category==='Shipyard' ? b*(1-dcRate/100) : b);
  }, 0);
  const tc = jobs.reduce((s,j) => {
    const c = +j.consumption||0;
    return s + (j.category==='Shipyard' ? c*(1-dcRate/100) : c);
  }, 0);
  const leafJobs = jobs.filter(j => !hasChildren(j.number, jobs));
  const done=leafJobs.filter(j=>{const p=calcProgress(j.start_date,j.end_date);return (p!==null?p:j.completion||0)>=100;}).length;
  const prog=leafJobs.filter(j=>{const p=calcProgress(j.start_date,j.end_date);const pct=p!==null?p:j.completion||0;return pct>0&&pct<100;}).length;
  const oc=(v.classItems||[]).filter(c=>c.status==='Open').length;
  document.getElementById('vb-name').textContent=info.name;
  document.getElementById('vs-total').textContent=leafJobs.length;
  document.getElementById('vs-done').textContent=done;
  document.getElementById('vs-prog').textContent=prog;
  document.getElementById('vs-bud').textContent=fmtK(tb);
  document.getElementById('vs-bud-s').textContent='$'+tb.toLocaleString()+' USD';
  document.getElementById('vs-con').textContent=fmtK(tc);
  document.getElementById('vs-con-s').textContent=tb?(tc/tb*100).toFixed(1)+'% of budget':'0%';
  document.getElementById('vs-cls').textContent=oc;

  // Duration: Dock In ~ Dock Out (상가~하가)
  const autoDur = (info.dockIn && info.dockOut)
    ? Math.round((new Date(info.dockOut) - new Date(info.dockIn)) / 86400000) + 1
    : (info.duration || null);

  // D-day 기준: Departure → Dock Out 순 fallback
  const today = new Date(); today.setHours(0,0,0,0);
  const ddRef = info.departureDate || info.dockOut;
  let ddayStr = '', elapsedStr = '';
  if(info.dockIn && info.dockOut) {
    const sd = new Date(info.dockIn), ed = new Date(info.dockOut);
    const elapsed = Math.round((today - sd) / 86400000) + 1;
    const dday    = Math.round((ed - today) / 86400000);
    if(today < sd) {
      ddayStr    = `D-${Math.round((sd-today)/86400000)}`;
      elapsedStr = '상가 전';
    } else if(today > ed) {
      ddayStr    = 'D+'+Math.abs(dday);
      elapsedStr = `${elapsed-1}일 경과 (하가 완료)`;
    } else {
      ddayStr    = dday === 0 ? 'D-DAY' : `D-${dday}`;
      elapsedStr = `${elapsed}일째 / ${autoDur}일`;
    }
  } else if(ddRef) {
    const refD = new Date(ddRef);
    const dday = Math.round((refD - today) / 86400000);
    ddayStr = dday >= 0 ? `D-${dday}` : `D+${Math.abs(dday)}`;
  }

  const metas=[
    info.shipyard&&`SHIPYARD: <span>${info.shipyard}</span>`,
    info.berthingDate&&`BERTHING: <span>${info.berthingDate}</span>`,
    info.dockIn&&`DOCK IN: <span>${info.dockIn}</span>`,
    info.dockOut&&`DOCK OUT: <span>${info.dockOut}</span>`,
    info.departureDate&&`DEPARTURE: <span>${info.departureDate}</span>`,
    autoDur&&`DD DURATION: <span>${autoDur} DAYS</span>`,
    info.classSociety&&`CLASS: <span>${info.classSociety}</span>`,
    info.imo&&`IMO: <span>${info.imo}</span>`
  ].filter(Boolean);
  document.getElementById('vb-meta').innerHTML=metas.length?metas.map(m=>`<div class="vb-meta-item">${m}</div>`).join(''):'<div style="font-size:13px;opacity:.5">Click Edit Info to add dock details</div>';

  // D-day / 소요일 표시 (오른쪽 배너)
  const ddayEl = document.getElementById('vb-dday');
  if(ddayEl) {
    ddayEl.innerHTML = ddayStr
      ? `<div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:1px;font-family:'IBM Plex Mono',monospace">${ddayStr}</div>
         <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:4px">${elapsedStr}</div>`
      : '';
  }

  const st=vesselStatus(info);
  const sv=document.getElementById('vb-status');
  sv.textContent=st;
  sv.style.color=st==='IN DRY DOCK'?'#fbbf24':st==='IN WET DOCK'?'#60a5fa':st==='COMPLETED'?'#4ade80':'rgba(255,255,255,.5)';

  // ── Progress Overview (Shipyard / Shore Repair 스케줄 + 공정률) ──
  const OV_CATS = ['Shipyard', 'Shore Repair'];
  const ovEl = document.getElementById('v-cat-overview');
  const ovRows = document.getElementById('v-cat-overview-rows');
  const ovCatData = {};
  jobs.forEach(j => {
    const cat = j.category || 'Shipyard';
    if (!OV_CATS.includes(cat)) return;
    if (!ovCatData[cat]) ovCatData[cat] = [];
    ovCatData[cat].push(j);
  });
  if (Object.keys(ovCatData).length) {
    ovEl.style.display = '';
    ovRows.innerHTML = OV_CATS.filter(c => ovCatData[c]).map(cat => {
      const catJobs = ovCatData[cat];
      // 스케줄 바: Shipyard는 vessel 전체 조선소 체류 기간, 나머지는 job 날짜 범위
      let earliest, latest;
      if(cat === 'Shipyard') {
        earliest = info.berthingDate || info.dockIn  || null;
        latest   = info.departureDate|| info.dockOut || null;
      } else {
        const allStarts = catJobs.map(j=>j.start_date).filter(d=>d&&d.trim()).sort();
        const allEnds   = catJobs.map(j=>j.end_date).filter(d=>d&&d.trim()).sort();
        earliest = allStarts[0] || null;
        latest   = allEnds[allEnds.length-1] || null;
      }
      let schedPct = calcProgress(earliest, latest) ?? 0;
      schedPct = Math.min(100, schedPct);
      const schedCol = schedPct>=100?'var(--green)':schedPct>0?'var(--amber)':'#cbd5e1';
      // 공정률 바: 루트 job completion 평균
      // 공정률 바: Shipyard는 GENERAL/CANCEL 제외, parent는 autoSum 활용 (Job Progress 탭과 동일 로직)
      const rootJobs = catJobs.filter(j => {
        const sec = j.section || 'GENERAL';
        if(cat === 'Shipyard' && (sec === 'GENERAL' || sec === 'CANCEL')) return false;
        const p = getParentNumber(j.number);
        return !p || !catJobs.some(x => x.number === p);
      });
      const actPct = rootJobs.length
        ? Math.min(100, Math.round(rootJobs.map(j => {
            if(hasChildren(j.number, catJobs)) {
              return (+j.completion||0) > 0 ? (+j.completion) : (j._autoSum?.completion ?? 0);
            }
            return +j.completion||0;
          }).reduce((a,b)=>a+b,0) / rootJobs.length))
        : 0;
      const actCol = actPct>=100?'var(--green)':actPct>0?'#7c3aed':'#cbd5e1';
      // consumed 바
      const catBudRaw = catJobs.reduce((s,j)=>s+(+j.budget||0),0);
      const catConRaw = catJobs.reduce((s,j)=>s+(+j.consumption||0),0);
      const isYard = cat==='Shipyard';
      const catBud = isYard ? catBudRaw*(1-dcRate/100) : catBudRaw;
      const catCon = isYard ? catConRaw*(1-dcRate/100) : catConRaw;
      const conRawPct = catBud>0?(catCon/catBud*100):0;
      const conPct = Math.min(100, conRawPct);
      const conOver = catBud>0 && catCon>catBud;
      const conCol = conOver?'var(--red)':'var(--blue)';
      return `<div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:13px;font-weight:700;color:var(--txt-h)">${cat}</span>
            <span style="font-size:11px;color:var(--txt-m)">${catJobs.length} jobs</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="font-size:11px;color:var(--txt-m)">📅 스케줄</span>
              <span style="font-size:12px;font-weight:700;color:${schedCol}">${schedPct}%</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${schedPct}%;background:${schedCol};border-radius:4px;transition:width .4s"></div>
            </div>
            <div style="font-size:10px;color:var(--txt-m);margin-top:4px">${earliest||'—'} → ${latest||'—'}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="font-size:11px;color:var(--txt-m)">✏ 공정률</span>
              <span style="font-size:12px;font-weight:700;color:${actCol}">${actPct}%</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${actPct}%;background:${actCol};border-radius:4px;transition:width .4s"></div>
            </div>
            <div style="font-size:10px;color:var(--txt-m);margin-top:4px">${rootJobs.length} root items 기준 평균</div>
          </div>
        </div>
      </div>`;
    }).join('');
  } else {
    ovEl.style.display = 'none';
  }

  const rawPct = tb?(tc/tb)*100:0;
  const pct = Math.min(100, rawPct);
  const vBar = document.getElementById('v-bar');
  vBar.style.width = pct+'%';
  vBar.style.background = rawPct>100 ? 'var(--red)' : '';
  document.getElementById('v-bar-lbl').textContent = rawPct.toFixed(1)+'% consumed';
  document.getElementById('v-bar-lbl').style.color = rawPct>100 ? '#fff' : '';

  // ── Budget Consumption (v-sec-buds — Category 기준, Section 하위 접기/펼치기) ──
  const scCatData={};
  jobs.forEach(j=>{
    const cat=j.category||'Shipyard', sec=j.section||'GENERAL';
    if(!scCatData[cat]) scCatData[cat]={};
    if(!scCatData[cat][sec]) scCatData[cat][sec]={b:0,c:0,n:0};
    scCatData[cat][sec].b+=+j.budget||0;
    scCatData[cat][sec].c+=+j.consumption||0;
    scCatData[cat][sec].n++;
  });
  // Crew 맨 밑 정렬
  const scCatEntries=Object.entries(scCatData).sort(([a],[b])=>{
    if(a==='Crew') return 1; if(b==='Crew') return -1; return 0;
  });
  document.getElementById('v-sec-buds').innerHTML=scCatEntries.map(([cat, secs])=>{
    const tot=Object.values(secs).reduce((a,s)=>({b:a.b+s.b,c:a.c+s.c}),{b:0,c:0});
    const isYard=cat==='Shipyard';
    const dcB=isYard?tot.b*(1-dcRate/100):tot.b;
    const dcC=isYard?tot.c*(1-dcRate/100):tot.c;
    const rawPct=dcB?(dcC/dcB)*100:0;
    const pct=Math.min(100,rawPct);
    const barOver=rawPct>100&&dcB>0;
    const expanded=_secBudCatExpanded.has(cat);
    const safecat=cat.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    // Section 하위카드 (CANCEL 맨 밑)
    const secEntries=Object.entries(secs).sort(([a],[b])=>{
      if(a==='CANCEL') return 1; if(b==='CANCEL') return -1; return 0;
    });
    const secHtml=expanded?`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">`+
      secEntries.map(([sec,d])=>{
        const dcSecB=isYard?d.b*(1-dcRate/100):d.b;
        const dcSecC=isYard?d.c*(1-dcRate/100):d.c;
        const rawSp=dcSecB?(dcSecC/dcSecB)*100:0;
        const sp=Math.min(100,rawSp);
        const spOver=rawSp>100&&dcSecB>0;
        return`<div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px">
          <div style="font-size:11px;font-weight:600;color:var(--txt-s);margin-bottom:6px">↳ ${sec}</div>
          <div style="height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:3px"><div style="height:100%;width:${sp}%;background:${spOver?'var(--red)':'var(--blue)'};border-radius:2px"></div></div>
          <div style="font-size:9px;font-family:'IBM Plex Mono',monospace;text-align:right;color:${spOver?'var(--red)':'var(--txt-m)'};font-weight:${spOver?'700':'400'};margin-bottom:4px">${rawSp.toFixed(1)}%${spOver?' ⚠':''}</div>
          <div style="display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:10px">
            <span style="color:${spOver?'var(--red)':'var(--blue)'};font-weight:600">$${Math.round(dcSecC).toLocaleString()}</span>
            <span style="color:var(--txt-m)">/ $${Math.round(dcSecB).toLocaleString()}</span>
          </div>
        </div>`;
      }).join('')+`</div>`:'';
    return`<div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:var(--radius);padding:14px;cursor:pointer" onclick="toggleSecBudCat('${safecat}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:10px;display:inline-block;transform:rotate(${expanded?'90':'0'}deg)"">▶</span>
          <span style="font-size:12px;font-weight:700;color:var(--txt-h)">${cat}</span>
          ${isYard&&dcRate>0?`<span style="font-size:10px;background:#f59e0b;color:#fff;border-radius:4px;padding:1px 5px;font-weight:700">D/C ${dcRate}%</span>`:''}
        </div>
        <div style="text-align:right">
          ${isYard&&dcRate>0?`<div style="font-size:10px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace;text-decoration:line-through">$${tot.b.toLocaleString()}</div>`:''}
          <div style="font-size:12px;font-weight:700;color:${isYard&&dcRate>0?'#d97706':'var(--txt-h)'};font-family:'IBM Plex Mono',monospace"><span style="color:${dcC>dcB&&dcB>0?'var(--red)':isYard&&dcRate>0?'#d97706':'var(--blue)'}">$${Math.round(dcC).toLocaleString()}</span> / $${Math.round(dcB).toLocaleString()}</div>
        </div>
      </div>
      <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${barOver?'var(--red)':'var(--blue)'};border-radius:2px"></div></div>
      <div style="font-size:10px;font-family:'IBM Plex Mono',monospace;margin-top:3px;text-align:right;color:${barOver?'var(--red)':'var(--txt-m)'}${barOver?';font-weight:700':''}">${rawPct.toFixed(1)}% consumed${barOver?' ⚠':''}</div>
      ${secHtml}
    </div>`;
  }).join('');

  // ── Budget by Category → Section (계층 접기/펼치기) ──
  // tb = 전체 예산 합계 (After D/C, 위에서 이미 계산됨)
  document.getElementById('v-bud-title').innerHTML=
    `<span>Budget by Section</span><span style="font-size:13px;font-weight:400;color:var(--txt-s)">Total: <span style="font-size:15px;font-weight:700;color:var(--txt-h);font-family:'IBM Plex Mono',monospace">$${Math.round(tb).toLocaleString()}</span></span>`;

  const catData={};
  jobs.forEach(j=>{
    const cat=j.category||'Shipyard', sec=j.section||'GENERAL';
    if(!catData[cat]) catData[cat]={};
    if(!catData[cat][sec]) catData[cat][sec]={b:0,c:0,n:0};
    catData[cat][sec].b+=+j.budget||0;
    catData[cat][sec].c+=+j.consumption||0;
    catData[cat][sec].n++;
  });
  // Crew 맨 밑 정렬
  const catEntries = Object.entries(catData).sort(([a],[b])=>{
    if(a==='Crew') return 1; if(b==='Crew') return -1; return 0;
  });
  let budHtml='';
  for(const [cat, secs] of catEntries){
    const tot=Object.values(secs).reduce((a,s)=>({b:a.b+s.b,c:a.c+s.c,n:a.n+s.n}),{b:0,c:0,n:0});
    const collapsed=!_budCatExpanded.has(cat);
    const safecat=cat.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const isYard = cat==='Shipyard';
    const dcB = isYard ? tot.b*(1-dcRate/100) : tot.b;
    const dcC = isYard ? tot.c*(1-dcRate/100) : tot.c;
    const tp = dcB?(dcC/dcB*100).toFixed(1):'0.0';
    const catShare = tb>0?(dcB/tb*100).toFixed(1):'0.0';
    budHtml+=`<div class="d-row dash-cat-hdr" onclick="toggleBudCat('${safecat}')" style="cursor:pointer;background:var(--blue-light);border-radius:6px;margin-bottom:2px">
      <div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--blue)">
        <span style="font-size:10px;display:inline-block;transform:rotate(${collapsed?'0':'90'}deg)">▶</span>
        ${cat} <span style="font-size:11px;font-weight:400;color:var(--txt-m)">(${tot.n} jobs)</span>
        <span style="font-size:10px;background:var(--blue);color:#fff;border-radius:10px;padding:1px 7px;font-weight:600">${catShare}%</span>
      </div>
      <div style="text-align:right">
        ${isYard && dcRate>0 ? `
        <div style="font-size:11px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace;text-decoration:line-through">$${tot.b.toLocaleString()}</div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
          <span style="font-size:10px;background:#f59e0b;color:#fff;border-radius:4px;padding:1px 5px;font-weight:700">D/C ${dcRate}%</span>
          <span style="font-size:14px;font-weight:700;color:#d97706">$${Math.round(dcB).toLocaleString()}</span>
        </div>` :
        `<div style="font-size:14px;font-weight:700;color:var(--txt-h)">$${tot.b.toLocaleString()}</div>`}
        <div style="font-size:11px;color:${+tp>100?'var(--red)':'var(--txt-m)'};font-family:'IBM Plex Mono',monospace;font-weight:${+tp>100?'700':'400'}">${tp}% consumed${+tp>100?' ⚠':''}
        </div>
      </div>
    </div>`;
    if(!collapsed){
      // CANCEL 맨 밑 정렬
      const secEntries = Object.entries(secs).sort(([a],[b])=>{
        if(a==='CANCEL') return 1; if(b==='CANCEL') return -1; return 0;
      });
      for(const [sec, d] of secEntries){
        const dcSecB = isYard ? d.b*(1-dcRate/100) : d.b;
        const dcSecC = isYard ? d.c*(1-dcRate/100) : d.c;
        const p = dcSecB?(dcSecC/dcSecB*100).toFixed(1):'0.0';
        const secShare = dcB>0?(dcSecB/dcB*100).toFixed(1):'0.0';
        budHtml+=`<div class="d-row dash-sec-child" style="padding-left:28px;background:#fafbfc;border-left:3px solid var(--blue-light);margin-bottom:2px">
          <div style="font-size:12px;color:var(--txt-s);display:flex;align-items:center;gap:6px">
            ↳ ${sec} <span style="color:var(--txt-m)">(${d.n} jobs)</span>
            <span style="font-size:10px;background:#e2e8f0;color:var(--txt-s);border-radius:10px;padding:1px 6px;font-weight:600">${secShare}%</span>
          </div>
          <div style="text-align:right">
            ${isYard && dcRate>0 ? `
            <div style="font-size:11px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace;text-decoration:line-through">$${d.b.toLocaleString()}</div>
            <div style="font-size:13px;font-weight:600;color:#d97706">$${Math.round(dcSecB).toLocaleString()}</div>` :
            `<div style="font-size:13px;font-weight:600;color:var(--txt-h)">$${d.b.toLocaleString()}</div>`}
            <div style="font-size:11px;color:${+p>100?'var(--red)':'var(--txt-m)'};font-family:'IBM Plex Mono',monospace;font-weight:${+p>100?'700':'400'}">${p}% consumed${+p>100?' ⚠':''}</div>
          </div>
        </div>`;
      }
    }
  }
  document.getElementById('v-bud-rows').innerHTML=budHtml||'<div class="empty-state" style="padding:20px">No jobs yet</div>';

  // ── Open Class Items (날짜별 접기/펼치기) ──
  const oi=(v.classItems||[]).filter(c=>c.status==='Open');
  if(!oi.length){
    document.getElementById('v-open-cls').innerHTML='<div class="empty-state" style="padding:20px">No open class items ✓</div>';
  } else {
    const byDate={};
    oi.forEach(c=>{const d=c.open_date||'—';if(!byDate[d])byDate[d]=[];byDate[d].push(c);});
    const sortedDates=Object.keys(byDate).sort((a,b)=>b.localeCompare(a));
    let clsHtml='';
    for(const dt of sortedDates){
      const items=byDate[dt];
      const collapsed=!_clsDateExpanded.has(dt);
      const safedt=dt.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      clsHtml+=`<div class="d-row dash-cls-date-hdr" onclick="toggleClsDate('${safedt}')" style="cursor:pointer;background:#f1f5f9;border-radius:6px;margin-bottom:2px">
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--txt-s)">
          <span style="font-size:10px;display:inline-block;transform:rotate(${collapsed?'0':'90'}deg)">▶</span>
          ${dt} <span style="font-size:11px;font-weight:400;color:var(--txt-m)">(${items.length})</span>
        </div>
      </div>`;
      if(!collapsed){
        clsHtml+=items.map(c=>`<div class="d-row" style="cursor:pointer;padding-left:16px;border-left:3px solid #e2e8f0;margin-bottom:2px" onclick="showTab('class',document.querySelectorAll('.vnav-btn')[3])">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--txt-h)">${c.finding.substring(0,48)}${c.finding.length>48?'…':''}</div>
            <div style="font-size:11px;color:var(--txt-m);margin-top:1px;font-family:'IBM Plex Mono',monospace">No.${c.no} · ${c.by||'—'}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">${priorityBadge(c.priority)}<span class="c-badge c-open">OPEN</span></div>
        </div>`).join('');
      }
    }
    document.getElementById('v-open-cls').innerHTML=clsHtml;
  }
}

// ══ DATE SYNC HELPERS ════════════════════════════════
function calcVesselDuration() {
  const inVal  = document.getElementById('mv-berthing-txt')?.value.trim()  || document.getElementById('mv-berthing')?.value;
  const outVal = document.getElementById('mv-departure-txt')?.value.trim() || document.getElementById('mv-departure')?.value;
  const durEl  = document.getElementById('mv-dur');
  if(!durEl) return;
  if(inVal && outVal) {
    const sd = new Date(inVal), ed = new Date(outVal);
    if(!isNaN(sd) && !isNaN(ed) && ed >= sd) {
      durEl.value = Math.round((ed - sd) / 86400000) + 1;
      return;
    }
  }
  durEl.value = '';
}

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
  if (isNaN(sd) || isNaN(ed)) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  sd.setHours(0,0,0,0);
  ed.setHours(0,0,0,0);
  // 시작일 = 완료일 (당일 완료): 오늘이 그 날짜 이후면 100%
  if (ed <= sd) return today >= sd ? 100 : 0;
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
  'Low':      { cls:'pri-normal',   label:'Low' },
  'Medium':   { cls:'pri-urgent',   label:'Medium' },
  'High':     { cls:'pri-critical', label:'High' },
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

  const mkRow = r => {
    const ds = r.date ? `<span class="rm-date" style="display:inline-block;min-width:72px">${r.date}</span>` : '<span style="display:inline-block;min-width:72px"></span>';
    const importantStyle = r.important ? 'color:#dc2626;font-weight:700;' : '';
    return `<div style="display:block;line-height:1.6">${ds}<span style="font-size:12px;${importantStyle}">${r.progress||''}</span></div>`;
  };

  const last = list[list.length - 1];
  if (list.length === 1) return mkRow(last);

  const uid = 'ac_' + Math.random().toString(36).slice(2,8);

  const collapsedHtml =
    `<div style="display:flex;align-items:center;gap:4px;">` +
    `<span onclick="event.stopPropagation();toggleRemark('${uid}')" style="cursor:pointer;font-size:9px;color:var(--txt-m);flex-shrink:0;user-select:none">▶</span>` +
    mkRow(last) +
    `</div>`;

  const expandedHtml =
    `<div style="display:flex;align-items:flex-start;gap:4px;">` +
    `<span onclick="event.stopPropagation();toggleRemark('${uid}')" style="cursor:pointer;font-size:9px;color:var(--txt-m);flex-shrink:0;user-select:none;margin-top:3px">▼</span>` +
    `<div>${list.map(r => mkRow(r)).join('')}</div>` +
    `</div>`;

  return `<div id="${uid}" data-open="0"
    data-c="${encodeURIComponent(collapsedHtml)}"
    data-e="${encodeURIComponent(expandedHtml)}">${collapsedHtml}</div>`;
}

// ══ CSV 업로드 ════════════════════════════════════════
function downloadCSVTemplate() {
  const headers = 'number,section,category,description,vendor,budget,start_date,end_date,completion';
  const sample = [
    '1.1,GENERAL,Shipyard,Fixed fire fighting system isolation,,0,2026-03-24,2026-04-10,0',
    '1.2,GENERAL,Shipyard,Ventilation fan,,0,,,0',
    '2.1,PAINT,Shipyard,Hull blasting & painting,,0,2026-03-24,2026-05-05,0',
    '3.1,STEEL,Shipyard,Hull steel renewal,,0,,,0',
    '5.1,ENGINE,Shore Repair,Main engine inspection,,0,2026-04-01,2026-04-15,50',
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
    const parts = [];
    if(data.inserted > 0) parts.push(`${data.inserted}개 추가`);
    if(data.updated  > 0) parts.push(`${data.updated}개 업데이트`);
    toast(`✓ ${parts.join(', ')}됐습니다${errMsg}`);

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
// ══ JOB HIERARCHY ════════════════════════════════════
// Job No. 기반 계층 구조 파싱
// 예: 22 → 22.6 → 22.6.1 / R9 / S1 → S1.1 → S1.1B

const jobCollapsed = new Set(); // 접힌 항목의 number 저장

// Job No.의 부모 번호 반환
// 22.6.1 → 22.6, 22.6 → 22, 22 → null
// R → null, R1 → R, R1.1 → R1, R1.1.2 → R1.1
// S1.1 → S1, S1.1B → S1.1, S1 → S, S → null
function getParentNumber(num) {
  if(!num) return null;
  const s = String(num).trim();

  // 알파벳 접두사 추출 (R, P, S, ST 등)
  const prefixMatch = s.match(/^([A-Za-z]+)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const rest = s.slice(prefix.length);

  // rest가 없으면 (예: "R", "P") → 부모 없음
  if(!rest) return null;

  // 마지막 알파벳 suffix 제거 (예: S1.1B → S1.1, R1A → R1)
  const alphaMatch = rest.match(/^([\d.]+)([A-Za-z]+)$/);
  if(alphaMatch) {
    const parent = prefix + alphaMatch[1];
    return parent;
  }

  // 마지막 .숫자 제거 (예: R1.1.2 → R1.1, 22.6.1 → 22.6)
  const dotMatch = rest.match(/^(.+)\.\d+[A-Za-z]*$/);
  if(dotMatch) {
    return prefix + dotMatch[1];
  }

  // 단독 숫자 (예: R1 → R, S1 → S, 22 → null)
  if(/^\d+$/.test(rest)) {
    // prefix있으면 prefix가 부모, 없으면 null
    return prefix ? prefix : null;
  }

  return null;
}

// jobs 배열을 계층 트리로 변환 (flat 배열, depth/parent 정보 추가)
function buildJobTree(jobs) {
  const numMap = {};
  jobs.forEach(j => { if(j.number) numMap[j.number] = j; });

  return jobs.map(j => {
    let depth = 0;
    let p = getParentNumber(j.number);
    while(p) {
      if(numMap[p]) { depth++; }
      p = getParentNumber(p);
    }
    return { ...j, _depth: depth, _parentNum: getParentNumber(j.number) };
  });
}

// 계층 정렬: 부모 바로 아래 자식들이 오도록
function sortJobTree(jobs) {
  const numMap = {};
  jobs.forEach(j => { if(j.number) numMap[j.number] = j; });

  const result = [];
  const visited = new Set();

  // 가장 가까운 실존 조상 찾기
  function findNearestAncestor(num) {
    let p = getParentNumber(num);
    while(p) {
      if(numMap[p]) return p;
      p = getParentNumber(p);
    }
    return null;
  }

  function insertWithChildren(job) {
    if(visited.has(job.number)) return;
    visited.add(job.number);
    result.push(job);
    // 직접 자식 + 중간 부모가 없는 자손도 포함
    const children = jobs
      .filter(j => {
        if(visited.has(j.number)) return false;
        return findNearestAncestor(j.number) === job.number;
      })
      .sort((a,b) => pNum(a.number) - pNum(b.number));
    children.forEach(c => insertWithChildren(c));
  }

  // 루트: 실존 조상이 없는 항목
  const roots = jobs
    .filter(j => {
      if(!j.number) return true;
      return findNearestAncestor(j.number) === null;
    })
    .sort((a,b) => {
      if(!a.number) return 1;
      if(!b.number) return -1;
      return pNum(a.number) - pNum(b.number);
    });

  roots.forEach(r => insertWithChildren(r));
  jobs.forEach(j => { if(!visited.has(j.number)) result.push(j); });

  return result;
}

// 접힌 상태에서 보여야 할 항목인지 확인
function isJobVisible(job, jobs) {
  const numMap = {};
  jobs.forEach(j => { if(j.number) numMap[j.number] = j; });

  let p = getParentNumber(job.number);
  while(p) {
    // 부모가 실제로 jobs 배열에 존재하고 접혀있으면 숨김
    if(numMap[p] && jobCollapsed.has(p)) return false;
    if(!numMap[p]) break; // 실제 존재하지 않는 부모면 중단
    p = getParentNumber(p);
  }
  return true;
}

// 해당 job의 직접 자식이 있는지 (중간 부모 없는 자손 포함)
function hasChildren(num, jobs) {
  const numMap = {};
  jobs.forEach(j => { if(j.number) numMap[j.number] = j; });
  function findNearestAncestor(n) {
    let p = getParentNumber(n);
    while(p) { if(numMap[p]) return p; p = getParentNumber(p); }
    return null;
  }
  return jobs.some(j => j.number !== num && findNearestAncestor(j.number) === num);
}

function toggleJobCollapse(num) {
  if(jobCollapsed.has(num)) jobCollapsed.delete(num);
  else jobCollapsed.add(num);
  renderJobs();
}

function toggleGanttCollapse(num) {
  _expandAll = false;
  if(jobCollapsed.has(num)) jobCollapsed.delete(num);
  else jobCollapsed.add(num);
  const btn = document.getElementById('btn-gantt-expand');
  if(btn) btn.textContent = '▶ 전체 펼치기';
  buildGantt(null, null, null);
}

// 상위항목 날짜를 하위항목 기준으로 자동 계산
function computeParentDates(jobs) {
  const numMap = {};
  jobs.forEach(j => { if(j.number) numMap[j.number] = j; });

  // 모든 자손 수집 함수
  function getDescendants(num) {
    const result = [];
    jobs.forEach(child => {
      if(getParentNumber(child.number) === num) {
        result.push(child);
        getDescendants(child.number).forEach(d => result.push(d));
      }
    });
    return result;
  }

  jobs.forEach(j => {
    if(!hasChildren(j.number, jobs)) return;
    const descendants = getDescendants(j.number);
    if(!descendants.length) return;

    const starts = descendants.map(d => d.start_date).filter(s => s && s.trim());
    const ends   = descendants.map(d => d.end_date).filter(e => e && e.trim());

    j._autoStart = starts.length ? starts.sort()[0] : null;
    j._autoEnd   = ends.length   ? ends.sort().reverse()[0] : null;
  });
}

// 상위항목 Budget/Consumed/Progress를 하위항목 합계로 자동 계산
function computeParentSums(jobs) {
  const numMap = {};
  jobs.forEach(j => { if(j.number) numMap[j.number] = j; });

  function getAllDesc(num) {
    const result = [];
    jobs.forEach(j => {
      if(j.number === num) return;
      let p = getParentNumber(j.number);
      while(p) {
        if(p === num) { result.push(j); break; }
        p = getParentNumber(p);
      }
    });
    return result;
  }

  jobs.forEach(j => {
    if(!hasChildren(j.number, jobs)) { j._autoSum = null; return; }
    const desc = getAllDesc(j.number);
    if(!desc.length) { j._autoSum = null; return; }

    const totalBudget   = desc.reduce((s,d) => s + (+d.budget||0), 0);
    const totalConsumed = desc.reduce((s,d) => s + (+d.consumption||0), 0);
    // leaf 항목만 기준으로 계산
    const leaves = desc.filter(d => !hasChildren(d.number, jobs));
    // 공정률: completion이 입력된(>0) leaf만 분자/분모에 포함 (규칙2: 미입력 항목은 제외)
    const enteredLeaves = leaves.filter(d => (+d.completion||0) > 0);
    const avgPct = enteredLeaves.length
      ? Math.round(enteredLeaves.reduce((s,d)=>s+(+d.completion),0) / enteredLeaves.length)
      : 0;
    // 스케줄: 날짜가 있는 leaf만 분자/분모에 포함 (날짜 미입력 항목 제외)
    const datedLeaves = leaves.filter(d => d.start_date && d.end_date);
    const schedPcts = datedLeaves.map(d => {
      const lp = calcProgress(d.start_date, d.end_date);
      return lp !== null ? lp : 0;
    });
    const avgSchedPct = schedPcts.length ? Math.round(schedPcts.reduce((a,b)=>a+b,0)/schedPcts.length) : 0;
    j._autoSum = { budget: totalBudget, consumption: totalConsumed, completion: avgPct, schedule: avgSchedPct };
  });
}

function renderJobs(){
  const jobs=FLEET[VID].jobs||[];
  const q=document.getElementById('j-q').value.toLowerCase();
  const sf=document.getElementById('j-sf').value,cf=document.getElementById('j-cf').value,pf=document.getElementById('j-pf').value;
  const vf=document.getElementById('j-vf').value;

  // 필터 적용
  let fil=jobs.filter(j=>{
    if(q&&!j.description.toLowerCase().includes(q)&&!j.number.includes(q)&&!(j.vendor||'').toLowerCase().includes(q))return false;
    if(sf&&j.section!==sf)return false;if(cf&&j.category!==cf)return false;
    if(vf&&(j.vendor||'')!==vf)return false;
    if(pf==='ns'&&j.completion>0)return false;if(pf==='ip'&&(j.completion===0||j.completion>=100))return false;
    if(pf==='done'&&j.completion<100)return false;
    // 퀵필터
    if(_qfJob==='wip'&&(j.completion===0||j.completion>=100))return false;
    if(_qfJob==='ns'&&j.completion>0)return false;
    if(_qfJob==='done'&&j.completion<100)return false;
    if(_qfJob==='novendor'&&(j.vendor||'').trim()!=='')return false;
    return true;
  });

  // 검색/필터 중이면 계층 정렬만, 아니면 트리 구조 표시
  const isFiltering = q||sf||cf||vf||pf||_qfJob;
  if(isFiltering){
    fil.sort((a,b)=>{
      let av=a[sKey], bv=b[sKey];
      if(sKey==='number'){av=pNum(av);bv=pNum(bv);}
      if(sKey==='_id'){av=+(a._id||0);bv=+(b._id||0);}
      return av<bv?-sDir:av>bv?sDir:0;
    });
  } else {
    fil = sortJobTree(fil);
  }

  const leafFilCount = fil.filter(j => !hasChildren(j.number, fil)).length;
  const leafTotalCount = jobs.filter(j => !hasChildren(j.number, jobs)).length;
  document.getElementById('j-cnt').textContent=`${leafFilCount} / ${leafTotalCount} jobs`;
  const tb=document.getElementById('j-body');
  if(!fil.length){tb.innerHTML='<tr><td colspan="10" class="empty-state">No jobs match the filters</td></tr>';return;}

  const SECTIONS=['GENERAL','PAINT','STEEL','DECK','ENGINE','ELECTRIC','ADD','REPAIR','STORE','SPARE','CANCEL'];
  const CATS=['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];

  // 계층 트리 미리 계산 (depth 캐시)
  const treeMap = {};
  buildJobTree(fil).forEach(j => { treeMap[j._id] = j._depth || 0; });

  // 상위항목 날짜/합계 자동 계산 - 전체 jobs 기준으로 해야 부모-자식 관계 정확
  computeParentDates(jobs);
  computeParentSums(jobs);

  // Category/Section 그룹 - 전체 펼치기 상태거나 nav 이동 시 건너뜀
  if(!_expandAll && !_calNavExpand) {
    const allCats = [...new Set(fil.map(j=>j.category||'Uncategorized'))];
    allCats.forEach(c => {
      if(!catCollapsed.has(c) && !_catEverSeen.has(c)) {
        catCollapsed.add(c);
      }
      _catEverSeen.add(c);
      const secs = [...new Set(fil.filter(j=>(j.category||'Uncategorized')===c).map(j=>j.section||'GENERAL'))];
      secs.forEach(s => {
        const k = c+'::'+s;
        if(!catCollapsed.has(k) && !_catEverSeen.has(k)) {
          catCollapsed.add(k);
        }
        _catEverSeen.add(k);
      });
    });
  }

  // 필터 중이면 그냥 평면 표시
  if(isFiltering) {
    tb.innerHTML = fil.map(j => _jobRow(j, jobs, fil, treeMap, 0, false)).join('');
    return;
  }

  // Category별 그룹화
  const CATS_ORDER = ['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];
  const catGroups = {};
  CATS_ORDER.forEach(c => catGroups[c] = []);
  fil.forEach(j => {
    const cat = j.category || 'Uncategorized';
    if(!catGroups[cat]) catGroups[cat] = [];
    catGroups[cat].push(j);
  });

  let html = '';
  Object.entries(catGroups).forEach(([cat, catJobs]) => {
    if(!catJobs.length) return;
    const isCollapsed = catCollapsed.has(cat);

    // 집계 (STORE 섹션은 수동입력값 우선 — Section 레벨과 동일 로직)
    let totalBudget = 0, totalConsumed = 0;
    const secMap = {};
    catJobs.forEach(j => { const s = j.section||'GENERAL'; if(!secMap[s]) secMap[s]=[]; secMap[s].push(j); });
    Object.entries(secMap).forEach(([sec, sJobs]) => {
      const sk = `${VID}::${cat}::${sec}`;
      const sd = window._secManualBudget?.[sk] || {};
      const jobBudget   = sJobs.reduce((s,j) => s + (+j.budget||0), 0);
      const jobConsumed = sJobs.reduce((s,j) => s + (+j.consumption||0), 0);
      // STORE: 수동입력값 우선, 없으면 job 합산 (Section 헤더와 동일 로직)
      totalBudget   += (sec === 'STORE' && (sd.budget   || 0) > 0) ? (sd.budget   || 0) : jobBudget;
      totalConsumed += (sec === 'STORE' && (sd.consumed || 0) > 0) ? (sd.consumed || 0) : jobConsumed;
    });

    // 계산 기준: 자식 없는 단독항목 그자체 + 자식 있는 부모항목 자체값
    // (중간 자식항목은 제외 - 최상위 부모가 있으면 최상위 부모만)
    const catRootJobs = catJobs.filter(j => {
      const sec = j.section||'GENERAL';
      if(sec === 'GENERAL' || sec === 'CANCEL') return false; // GENERAL/CANCEL 제외
      const p = getParentNumber(j.number);
      return !p || !catJobs.some(x => x.number === p);
    });

    // 스케줄 바: Shipyard는 전체 공기(DockIn~DockOut) 기준, 나머지는 날짜범위 or completion 기반
    let avgPct;
    if(cat === 'Shipyard') {
      const info = FLEET[VID]?.info;
      avgPct = (info?.dockIn && info?.dockOut)
        ? (calcProgress(info.dockIn, info.dockOut) ?? 0)
        : 0;
    } else {
      // GENERAL/CANCEL 제외
      const calcJobs = catJobs.filter(j => (j.section||'GENERAL') !== 'GENERAL' && (j.section||'') !== 'CANCEL');
      const allStarts = calcJobs.map(j => j.start_date).filter(d => d && d.trim()).sort();
      const allEnds   = calcJobs.map(j => j.end_date).filter(d => d && d.trim()).sort();
      const earliest = allStarts.length ? allStarts[0] : null;
      const latest   = allEnds.length   ? allEnds[allEnds.length-1] : null;
      if(earliest && latest) {
        avgPct = calcProgress(earliest, latest) ?? 0;
      } else {
        // 날짜 없는 경우: 루트 항목의 effective schedule 평균
        const effScheds = catRootJobs.map(j => {
          const lp = calcProgress(j.start_date, j.end_date);
          if(lp !== null) return lp;
          if(hasChildren(j.number, fil)) return j._autoSum?.schedule ?? (j.completion||0);
          return j.completion||0;
        });
        avgPct = effScheds.length ? Math.round(effScheds.reduce((a,b)=>a+b,0)/effScheds.length) : 0;
      }
    }
    const pctCol = avgPct>=100?'var(--green)':avgPct>0?'var(--amber)':'#cbd5e1';

    // 공정률 바: GENERAL/CANCEL 제외한 루트 항목 기준
    const actPct = catRootJobs.length
      ? Math.round(catRootJobs.map(j => {
          if(hasChildren(j.number, fil)) {
            return (+j.completion||0) > 0 ? (+j.completion) : (j._autoSum?.completion ?? 0);
          }
          return (+j.completion||0);
        }).reduce((a,b)=>a+b,0) / catRootJobs.length)
      : 0;
    const leafCatJobs = catRootJobs; // Budget/Consumed는 전체 합산 유지
    const actCol = actPct>=100?'#0d9488':actPct>0?'#7c3aed':'rgba(255,255,255,.2)';

    const catCls = cat==='Shipyard'?'cat-sy':cat==='Shore Repair'?'cat-sh':cat==='Spare'?'cat-sp':cat==='Store'?'cat-st':cat==='Paint'?'cat-pt':'cat-cr';

    // Category 헤더 행
    // Shipyard D/C 요율
    const dcRate = cat === 'Shipyard' ? (FLEET[VID]?.info?.dcRate || 0) : 0;
    const dcBudget   = cat === 'Shipyard' ? Math.round(totalBudget   * (1 - dcRate/100)) : totalBudget;
    const dcConsumed = cat === 'Shipyard' ? Math.round(totalConsumed * (1 - dcRate/100)) : totalConsumed;
    // consumed 초과 여부 (DC 적용 기준)
    const catConsOver = dcBudget > 0 && dcConsumed > dcBudget;
    const catConsRawPct = dcBudget > 0 ? (dcConsumed / dcBudget * 100) : 0;
    const catConsBarPct = Math.min(100, catConsRawPct);
    const catConsCol = catConsOver ? 'var(--red)' : 'var(--green)';
    const catConsBarCol = catConsOver ? 'var(--red)' : 'var(--green)';

    html += `<tr style="background:var(--navy);cursor:pointer" onclick="toggleCatGroup('${cat.replace(/'/g,"\\'")}')">
      <td colspan="2" style="padding:10px 14px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:10px;color:#fff;user-select:none">${isCollapsed?'▶':'▼'}</span>
          <span class="cat-badge ${catCls}" style="font-size:12px;flex-shrink:0">${cat}</span>
          <span style="font-size:11px;color:rgba(255,255,255,.6);white-space:nowrap;flex-shrink:0">${catJobs.length} jobs</span>
        </div>
      </td>
      <td colspan="2" style="padding:10px 8px;color:rgba(255,255,255,.5);font-size:10px;text-transform:uppercase;letter-spacing:.5px">
        ${cat === 'Shipyard' ? `
          <div onclick="event.stopPropagation()" style="display:flex;align-items:center;gap:4px">
            <span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap">D/C 요율</span>
            <div class="cell-edit" onclick="event.stopPropagation();startDcRateEdit(this)"
              style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:#f59e0b">
              ${dcRate}%
            </div>
          </div>` : ''}
      </td>
      <td style="padding:10px 8px;text-align:right">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:#fff">$${totalBudget.toLocaleString()}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5)">Total Budget</div>
        ${cat === 'Shipyard' ? `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:#f59e0b;margin-top:2px">$${dcBudget.toLocaleString()}</div><div style="font-size:9px;color:#f59e0b;opacity:.7">After D/C</div>` : ''}
      </td>
      <td style="padding:10px 8px;text-align:right">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:${catConsCol}">$${totalConsumed.toLocaleString()}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5)">Consumed${catConsOver?' ⚠':''}</div>
        ${cat === 'Shipyard' ? `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:${catConsOver?'var(--red)':'#f59e0b'};margin-top:2px">$${dcConsumed.toLocaleString()}</div><div style="font-size:9px;color:${catConsOver?'var(--red)':'#f59e0b'};opacity:.7">After D/C</div>` : ''}
      </td>
      <td colspan="2" style="padding:10px 14px">
        <div style="display:flex;gap:20px">
          <div style="min-width:160px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <div style="width:120px;height:8px;background:rgba(255,255,255,.15);border-radius:4px;overflow:hidden;flex-shrink:0">
                <div style="width:${catConsBarPct}%;height:100%;background:${catConsBarCol};border-radius:4px"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:${catConsCol};min-width:36px">${catConsRawPct.toFixed(1)}%${catConsOver?' ⚠':''}</span>
            </div>
            <div style="font-size:9px;color:rgba(255,255,255,.5);letter-spacing:.4px">TOTAL CONSUMED</div>
          </div>
          <div style="min-width:160px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap;min-width:32px">📅 스케줄</span>
              <div style="flex:1;height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden">
                <div style="width:${avgPct}%;height:100%;background:${pctCol};border-radius:3px"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:${pctCol};min-width:36px">${avgPct}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap;min-width:32px">✏ 공정률</span>
              <div style="flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden">
                <div style="width:${actPct}%;height:100%;background:${actCol};border-radius:3px"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:${actCol};min-width:36px">${actPct}%</span>
            </div>
          </div>
        </div>
      </td>
      <td colspan="3" style="padding:10px 8px"></td>
    </tr>`;

    // 하위 job 행들 - Section 중분류로 그룹화
    if(!isCollapsed) {
      const sorted = sortJobTree(catJobs);
      const secTreeMap = buildJobTree(sorted).reduce((m,x)=>{m[x._id]=x._depth||0;return m;},{});

      // Section별 그룹화
      const secGroups = {};
      const secOrder = [];
      sorted.forEach(j => {
        const sec = j.section || 'GENERAL';
        if(!secGroups[sec]) { secGroups[sec] = []; secOrder.push(sec); }
        secGroups[sec].push(j);
      });
      // CANCEL을 맨 뒤로 정렬
      secOrder.sort((a,b) => {
        if(a==='CANCEL') return 1;
        if(b==='CANCEL') return -1;
        return 0;
      });

      secOrder.forEach(sec => {
        const secJobs = secGroups[sec];
        if(!secJobs.length) return;
        const secKey = cat + '::' + sec;
        const isSecCollapsed = catCollapsed.has(secKey);

        // Section 집계
        const sBudget   = secJobs.reduce((s,j)=>s+(+j.budget||0),0);
        const sConsumed = secJobs.reduce((s,j)=>s+(+j.consumption||0),0);
        const sConsRawPct = sBudget>0?(sConsumed/sBudget*100):0;
        const sConsPct = Math.min(100, Math.round(sConsRawPct));
        const sConsOver = sBudget>0 && sConsumed>sBudget;
        const sConsCol = sConsOver ? 'var(--red)' : 'var(--green)';
        // 계산 기준: 자식 없는 단독항목 + 자식 있는 부모항목 자체값
        const secRootJobs = secJobs.filter(j => {
          const p = getParentNumber(j.number);
          return !p || !secJobs.some(x => x.number === p);
        });
        // 스케줄 바: 날짜 있으면 날짜범위 기반, 날짜 없으면 completion 기반으로 평균
        const allStarts = secJobs.map(j => j.start_date).filter(d => d && d.trim()).sort();
        const allEnds   = secJobs.map(j => j.end_date).filter(d => d && d.trim()).sort();
        const secEarliestStart = allStarts.length ? allStarts[0] : null;
        const secLatestEnd     = allEnds.length   ? allEnds[allEnds.length-1] : null;
        let sAvgPct;
        if(secEarliestStart && secLatestEnd) {
          sAvgPct = calcProgress(secEarliestStart, secLatestEnd) ?? 0;
        } else {
          // 날짜 없는 경우: 루트 항목의 effective schedule(날짜없으면 completion) 평균
          const effScheds = secRootJobs.map(j => {
            const lp = calcProgress(j.start_date, j.end_date);
            if(lp !== null) return lp;
            if(hasChildren(j.number, fil)) return j._autoSum?.schedule ?? (j.completion||0);
            return j.completion||0;
          });
          sAvgPct = effScheds.length ? Math.round(effScheds.reduce((a,b)=>a+b,0)/effScheds.length) : 0;
        }
        const sPctCol = sAvgPct>=100?'var(--green)':sAvgPct>0?'var(--amber)':'#cbd5e1';
        // 공정률 바: 루트 항목 completion 평균 (부모는 autoSum.completion 활용)
        const sActPct = secRootJobs.length
          ? Math.round(secRootJobs.map(j => {
              if(hasChildren(j.number, fil)) {
                return (+j.completion||0) > 0 ? (+j.completion) : (j._autoSum?.completion ?? 0);
              }
              return (+j.completion||0);
            }).reduce((a,b)=>a+b,0) / secRootJobs.length)
          : 0;
        const sActCol = sActPct>=100?'#0d9488':sActPct>0?'#7c3aed':'rgba(255,255,255,.15)';

        // STORE 섹션은 Budget/Consumed 수동 입력 가능
        const storeKey = `${VID}::${cat}::${sec}`;
        const storeData = window._secManualBudget?.[storeKey] || {budget:0, consumed:0};
        const dispBudget   = sec === 'STORE' && storeData.budget   > 0 ? storeData.budget   : sBudget;
        const dispConsumed = sec === 'STORE' && storeData.consumed > 0 ? storeData.consumed : sConsumed;

        // Section 헤더 행 (파란색 계열)
        html += `<tr style="background:#1e3a5f;cursor:pointer" onclick="toggleSecGroup('${secKey.replace(/'/g,"\\'")}')">
          <td colspan="2" style="padding:8px 14px 8px 28px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:9px;color:rgba(255,255,255,.7);user-select:none">${isSecCollapsed?'▶':'▼'}</span>
              <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.9);letter-spacing:.5px">${sec}</span>
              <span style="font-size:10px;color:rgba(255,255,255,.4)">${secJobs.length} jobs</span>
            </div>
          </td>
          <td colspan="2" style="padding:8px"></td>
          <td style="padding:8px;text-align:right" onclick="event.stopPropagation()">
            ${sec==='STORE'
              ? `<div class="cell-edit" onclick="event.stopPropagation();startStoreEdit(this,'${storeKey}','budget',${dispBudget})"
                   style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:rgba(255,255,255,.8);display:inline-block">
                   $${dispBudget.toLocaleString()}
                 </div>`
              : `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:rgba(255,255,255,.8)">$${dispBudget.toLocaleString()}</div>`
            }
          </td>
          <td style="padding:8px;text-align:right" onclick="event.stopPropagation()">
            ${sec==='STORE'
              ? `<div class="cell-edit" onclick="event.stopPropagation();startStoreEdit(this,'${storeKey}','consumed',${dispConsumed})"
                   style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:${sConsCol};display:inline-block">
                   $${dispConsumed.toLocaleString()}
                 </div>`
              : `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:${sConsCol}">$${dispConsumed.toLocaleString()}${sConsOver?' ⚠':''}</div>`
            }
          </td>
          <td colspan="2" style="padding:8px 14px">
            <div style="display:flex;gap:16px">
              <div style="min-width:130px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                  <div style="width:90px;height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden;flex-shrink:0">
                    <div style="width:${sConsPct}%;height:100%;background:${sConsCol};border-radius:3px"></div>
                  </div>
                  <span style="font-size:11px;font-weight:600;color:${sConsCol}">${sConsRawPct.toFixed(1)}%${sConsOver?' ⚠':''}</span>
                </div>
                <div style="font-size:8px;color:rgba(255,255,255,.4);letter-spacing:.4px">TOTAL CONSUMED</div>
              </div>
              <div style="min-width:130px">
                ${sec === 'CANCEL' || sec === 'GENERAL'
                  ? `<div style="display:flex;align-items:center;gap:6px;opacity:.5">
                       <span style="font-size:14px">${sec === 'CANCEL' ? '🚫' : 'ℹ️'}</span>
                       <span style="font-size:11px;color:rgba(255,255,255,.7);font-weight:600">${sec === 'CANCEL' ? 'CANCELLED' : 'GENERAL'}</span>
                     </div>`
                  : `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                  <span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap;min-width:32px">📅 스케줄</span>
                  <div style="flex:1;height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden">
                    <div style="width:${sAvgPct}%;height:100%;background:${sPctCol};border-radius:3px"></div>
                  </div>
                  <span style="font-size:12px;font-weight:700;color:${sPctCol};min-width:36px">${sAvgPct}%</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap;min-width:32px">✏ 공정률</span>
                  <div style="flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden">
                    <div style="width:${sActPct}%;height:100%;background:${sActCol};border-radius:3px"></div>
                  </div>
                  <span style="font-size:12px;font-weight:700;color:${sActCol};min-width:36px">${sActPct}%</span>
                </div>`
                }
              </div>
            </div>
          </td>
          <td colspan="2" style="padding:8px"></td>
        </tr>`;

        // Section 하위 job들
        if(!isSecCollapsed) {
          const secSorted = sortJobTree(secJobs);
          const secJobTreeMap = buildJobTree(fil).reduce((m,x)=>{m[x._id]=x._depth||0;return m;},{});
          secSorted.filter(j=>isJobVisible(j,secSorted)).forEach(j=>{
            html += _jobRow(j, jobs, fil, secJobTreeMap, 0, false);
          });
        }
      });
    }
  });
  tb.innerHTML = html;
}

const catCollapsed = window.catCollapsed || new Set();
const _catEverSeen = new Set();
let _expandAll = false; // 전체 펼치기 상태 플래그
let _calNavExpand = false;     // 캘린더 이동 시 Job 자동접기 skip
let _calNavExpandDisc = false; // 캘린더 이동 시 Daily Log 자동접기 skip

// STORE 섹션 수동 Budget/Consumed 저장
window._secManualBudget = window._secManualBudget || {};

function startStoreEdit(span, key, field, currentVal) {
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
  const w = Math.max(span.offsetWidth, 80);
  const inp = document.createElement('input');
  inp.type = 'number';
  inp.className = 'inline-input';
  inp.value = currentVal || '';
  inp.style.width = w + 'px';
  inp.style.color = field === 'consumed' ? 'var(--green)' : 'rgba(255,255,255,.9)';
  span.replaceWith(inp);
  inp.focus();
  inp.select();
  const save = () => {
    setSecManualBudget(key, field, inp.value);
  };
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => {
    if(e.key === 'Enter') inp.blur();
    if(e.key === 'Escape') inp.blur();
  });
}

function startDcRateEdit(span) {
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
  const current = FLEET[VID]?.info?.dcRate || 0;
  const inp = document.createElement('input');
  inp.type = 'number'; inp.min = 0; inp.max = 100; inp.step = 0.1;
  inp.value = current;
  inp.style.cssText = 'width:55px;background:transparent;border:none;border-bottom:1px solid #f59e0b;color:#f59e0b;font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:700;text-align:center;outline:none';
  span.replaceWith(inp);
  inp.focus(); inp.select();
  const save = async () => {
    const val = parseFloat(inp.value) || 0;
    try {
      await apiFetch(`${API}/vessels/${VID}/dc_rate`, 'PUT', {dcRate: val});
      FLEET[VID].info.dcRate = val;
    } catch(e) { toast('저장 실패: '+e.message, true); }
    renderJobs(); renderDash();
  };
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => { if(e.key==='Enter') inp.blur(); if(e.key==='Escape') inp.blur(); });
}

async function setSecManualBudget(key, field, value) {
  if(!window._secManualBudget) window._secManualBudget = {};
  if(!window._secManualBudget[key]) window._secManualBudget[key] = {budget:0, consumed:0};
  // 빈값이면 0으로 → 자동계산으로 복귀
  window._secManualBudget[key][field] = value === '' ? 0 : (parseFloat(value) || 0);

  const parts = key.split('::');
  const [vid, cat, sec] = parts;
  try {
    await apiFetch(`${API}/vessels/${vid}/sec_budget`, 'PUT', {
      category: cat,
      section: sec,
      budget:   window._secManualBudget[key].budget,
      consumed: window._secManualBudget[key].consumed
    });
  } catch(e) { toast('저장 실패: '+e.message, true); }
  renderJobs();
} // 한번이라도 렌더된 cat/sec 추적

function toggleCatGroup(cat) {
  _expandAll = false;
  if(catCollapsed.has(cat)) catCollapsed.delete(cat);
  else catCollapsed.add(cat);
  renderJobs();
}

function toggleSecGroup(secKey) {
  _expandAll = false;
  if(catCollapsed.has(secKey)) {
    catCollapsed.delete(secKey);
  } else {
    catCollapsed.add(secKey);
  }
  catCollapsed.delete(secKey+'_opened');
  renderJobs();
}

function expandCollapseAllGantt() {
  const jobs = FLEET[VID] ? (FLEET[VID].jobs||[]) : [];
  const btn = document.getElementById('btn-gantt-expand');
  const isExpanding = btn && btn.textContent.includes('펼치기');

  catCollapsed.clear();
  jobCollapsed.clear();
  _catEverSeen.clear();

  if(!isExpanding) {
    _expandAll = false;
    const cats = [...new Set(jobs.map(j=>j.category||'Uncategorized'))];
    cats.forEach(c => {
      catCollapsed.add(c);
      const secs = [...new Set(jobs.filter(j=>(j.category||'Uncategorized')===c).map(j=>j.section||'GENERAL'))];
      secs.forEach(s => catCollapsed.add(c+'::'+s));
    });
    jobs.forEach(j => { if(j.number && hasChildren(j.number, jobs)) jobCollapsed.add(j.number); });
    if(btn) btn.textContent = '▶ 전체 펼치기';
  } else {
    _expandAll = true;
    if(btn) btn.textContent = '▼ 전체 접기';
  }
  const jpBtn = document.getElementById('btn-expand-all');
  if(jpBtn) jpBtn.textContent = isExpanding ? '▼ 전체 접기' : '▶ 전체 펼치기';
  buildGantt(null, null, null);
}

function expandCollapseAll() {
  const jobs = FLEET[VID] ? (FLEET[VID].jobs||[]) : [];
  const btn = document.getElementById('btn-expand-all');
  const isExpanding = btn && btn.textContent.includes('펼치기');

  catCollapsed.clear();
  jobCollapsed.clear();
  _catEverSeen.clear();

  if(!isExpanding) {
    // 전체 접기
    _expandAll = false;
    const cats = [...new Set(jobs.map(j=>j.category||'Uncategorized'))];
    cats.forEach(c => {
      catCollapsed.add(c);
      const secs = [...new Set(jobs.filter(j=>(j.category||'Uncategorized')===c).map(j=>j.section||'GENERAL'))];
      secs.forEach(s => catCollapsed.add(c+'::'+s));
    });
    jobs.forEach(j => { if(j.number && hasChildren(j.number, jobs)) jobCollapsed.add(j.number); });
    if(btn) btn.textContent = '▶ 전체 펼치기';
  } else {
    // 전체 펼치기
    _expandAll = true;
    if(btn) btn.textContent = '▼ 전체 접기';
  }
  renderJobs();
}

function _jobRow(j, jobs, fil, treeMap, extraDepth, isFiltering) {
    const ri=jobs.indexOf(j);
    // 수동 날짜 있으면 autoStart 무시, 없으면 자식 기준 자동날짜 사용
    const hasManualDates = !!(j.start_date && j.end_date);
    const effStart = hasManualDates ? j.start_date : (j._autoStart || j.start_date);
    const effEnd   = hasManualDates ? j.end_date   : (j._autoEnd   || j.end_date);
    const hasAutoSum = j._autoSum !== null && j._autoSum !== undefined;
    // 부모 항목에 직접 입력값이 있으면 우선 사용, 없으면(0) 자동 계산값 사용
    const hasManualBudget   = hasAutoSum && (+j.budget||0) > 0;
    const hasManualConsumed = hasAutoSum && (+j.consumption||0) > 0;
    const effBudget   = hasManualBudget   ? (+j.budget||0)          : hasAutoSum ? j._autoSum.budget      : (+j.budget||0);
    const effConsumed = hasManualConsumed ? (+j.consumption||0)      : hasAutoSum ? j._autoSum.consumption : (+j.consumption||0);
    const showAuto = hasAutoSum && !hasManualBudget; // auto 뱃지 표시 여부
    // 스케줄 바: 수동 날짜 있으면 수동 기반, 없으면 자식 평균
    // 날짜도 없고 자식도 없으면 → 수동 공정률(completion)과 동일하게
    const livePct = calcProgress(effStart, effEnd);
    const pct = hasManualDates
      ? (livePct !== null ? livePct : 0)
      : hasAutoSum ? (j._autoSum.schedule ?? 0)
      : livePct !== null ? livePct
      : (j.completion||0); // 날짜 미입력 시 completion으로 fallback
    const col=pct>=100?'var(--green)':pct>0?'var(--amber)':'var(--txt-m)';

    // 공정률 바: completion > 0 이면 수동값 우선, 0이면 자식 평균
    // 부모항목도 클릭하여 수동 입력 가능
    const hasManualCompletion = (+j.completion||0) > 0;
    const cc=j.category==='Shipyard'?'cat-sy':j.category==='Shore Repair'?'cat-sh':j.category==='Spare'?'cat-sp':j.category==='Store'?'cat-st':j.category==='Paint'?'cat-pt':'cat-cr';
    const dateInfo=effStart&&effEnd
      ?`<div style="font-size:10px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace;margin-top:2px">${effStart} → ${effEnd}${j._autoStart?'<span style="font-size:9px;color:var(--blue);margin-left:4px">auto</span>':''}</div>`
      :`<div style="font-size:10px;color:var(--txt-m)">—</div>`;

    const SECTIONS=['GENERAL','PAINT','STEEL','DECK','ENGINE','ELECTRIC','ADD','REPAIR','STORE','SPARE','CANCEL'];
    const CATS=['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];
    const secOpts=SECTIONS.map(s=>`<option${s===j.section?' selected':''}>${s}</option>`).join('');
    const catOpts=CATS.map(c=>`<option${c===j.category?' selected':''}>${c}</option>`).join('');

    // 공정률: 자식 있으면 autoSum.completion 자동계산, 없으면 수동입력
    // 단, 부모에 completion 직접 입력(>0)이면 수동값 우선
    const effCompletion = hasManualCompletion ? (+j.completion||0)
                        : hasAutoSum ? j._autoSum.completion
                        : (j.completion||0);
    // 자동계산 표시만 하고 클릭은 항상 가능 (수동 입력으로 override 가능)
    const isAutoCompletion = false;
    const actBarCol = effCompletion>=100?'#0d9488':effCompletion>0?'#7c3aed':'#cbd5e1';
    const actPctCol = effCompletion>=100?'#0d9488':effCompletion>0?'#7c3aed':'var(--txt-m)';
    const depth = isFiltering ? 0 : (treeMap[j._id] || 0);
    const indent = depth * 20;
    const isCollapsed = jobCollapsed.has(j.number);
    const hasKids = hasChildren(j.number, fil);
    const toggleBtn = hasKids
      ? `<span onclick="toggleJobCollapse('${j.number}')" style="cursor:pointer;font-size:9px;color:var(--txt-m);margin-right:4px;user-select:none;flex-shrink:0">${isCollapsed?'▶':'▼'}</span>`
      : `<span style="display:inline-block;width:13px;flex-shrink:0"></span>`;
    const numStyle = depth===0
      ? 'font-weight:700;color:var(--navy)'
      : depth===1 ? 'font-weight:600;color:var(--blue)' : 'color:var(--txt-s)';
    const rowBg = depth===0 ? 'var(--bg-panel)' : 'var(--bg-white)';

    return`<tr data-ri="${ri}" data-jid="${j._id}" style="background:${rowBg}">
      <td data-label="No." style="padding-left:${8+indent}px">
        <div style="display:flex;align-items:center">
          ${toggleBtn}
          <span class="cell-edit" onclick="startEdit(this,${ri},'number','text')" style="${numStyle};font-family:'IBM Plex Mono',monospace;font-size:12px">${j.number||'—'}</span>
        </div>
      </td>
      <td data-label="Section"><span class="cell-edit" onclick="startEditSelect(this,${ri},'section',[${SECTIONS.map(s=>`'${s}'`).join(',')}])">
        <span style="font-size:12px;color:var(--txt-s)">${j.section||'—'}</span>
      </span></td>
      <td data-label="Category"><span class="cell-edit" onclick="startEditSelect(this,${ri},'category',[${CATS.map(c=>`'${c}'`).join(',')}])">
        <span class="cat-badge ${cc}">${j.category||'—'}</span>
      </span></td>
      <td data-label="Description"><span class="cell-edit" onclick="startEdit(this,${ri},'description','text')" style="display:block;max-width:260px;color:var(--txt-h);font-size:13px;font-weight:500">${j.description||'—'}</span></td>
      <td data-label="Vendor"><span class="cell-edit" onclick="startEdit(this,${ri},'vendor','text')" style="display:block;max-width:130px;font-size:12px;color:var(--txt-m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${j.vendor||'—'}</span></td>
      <td data-label="Budget" style="text-align:right">
        <span class="cell-edit" onclick="startEdit(this,${ri},'budget','number')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:var(--txt-h)">$${effBudget.toLocaleString()}</span>
        ${showAuto?'<div style="font-size:9px;color:var(--blue);text-align:right">auto</div>':''}
      </td>
      <td data-label="Consumed" style="text-align:right">
        <span class="cell-edit" onclick="startEdit(this,${ri},'consumption','number')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:${effConsumed>effBudget&&effBudget>0?'var(--red)':'var(--green)'}">$${effConsumed.toLocaleString()}</span>
        ${effConsumed>effBudget&&effBudget>0?'<div style="font-size:9px;color:var(--red);text-align:right;font-weight:600">초과</div>':''}
      </td>
      <td data-label="Progress">
        ${j.section === 'CANCEL'
          ? `<div style="display:flex;align-items:center;gap:6px;opacity:.4">
               <span style="font-size:16px">🚫</span>
               <span style="font-size:11px;color:var(--txt-m);font-weight:600">CANCELLED</span>
             </div>`
          : `<div style="display:flex;align-items:center;gap:4px">
          <span style="font-size:9px;color:var(--txt-m);white-space:nowrap;min-width:36px">📅 스케줄</span>
          <div class="prog-wrap" style="flex:1">
            <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${col}"></div></div>
            <div class="prog-pct" style="color:${col}">${pct}%</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:3px" title="실제 공정률 (클릭하여 수정)">
          <span style="font-size:9px;color:#7c3aed;white-space:nowrap;min-width:36px">✏ 공정률</span>
          <div class="prog-wrap" style="flex:1">
            <div class="prog-bar" style="background:#e8e0f0;border-color:#d8c8f0">
              <div class="prog-fill" style="width:${effCompletion}%;background:${actBarCol}"></div>
            </div>
            ${isAutoCompletion
              ? `<div class="prog-pct" style="color:${actPctCol}">${effCompletion}%</div>`
              : `<div class="prog-pct cell-edit" onclick="startEdit(this,${ri},'completion','number')" style="color:${actPctCol};cursor:pointer">${effCompletion}%</div>`
            }
          </div>
        </div>
        ${dateInfo}`
        }
      </td>
      <td data-label="Remark" style="vertical-align:middle"><div class="remark-cell" ${isViewer()?'':` onclick="openJobModal(${ri})"`} style="cursor:${isViewer()?'default':'pointer'};max-width:300px" ${isViewer()?'':` title="클릭하여 Remark 편집"`}>${renderRemarkCell(j)}</div></td>
      <td style="white-space:nowrap">
        <button class="edit-btn" onclick="openJobModal(${ri})">Edit</button>
        <button class="attach-btn" id="jattbtn-${j._id}" onclick="openJobAttach(${j._id})" title="첨부파일" style="${(FLEET[VID].attachSet||new Set()).has('job:'+j._id)?'background:var(--blue);color:var(--white)':''}">
          ${(FLEET[VID].attachSet||new Set()).has('job:'+j._id)?'📎 +':'📎'}
        </button>
      </td>
    </tr>`;
}

// ── INLINE EDIT HELPERS ──────────────────────────────────────
function startEdit(span, ri, field, type) {
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

  if(!VID) return;

  // 필터 초기화
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
  sKey = 'number'; sDir = 1;

  buildJFilters();
  renderJobs();

  const SECTIONS = ['GENERAL','PAINT','STEEL','DECK','ENGINE','ELECTRIC','ADD','REPAIR','STORE','SPARE','CANCEL'];
  const CATS = ['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];

  const tb = document.getElementById('j-body');
  const tempTr = document.createElement('tr');
  tempTr.id = 'inline-temp-row';
  tempTr.style.background = 'var(--blue-light)';
  tempTr.innerHTML = `
    <td style="padding:4px 6px">
      <input id="il-num" class="inline-input" type="text" placeholder="No." style="width:70px">
    </td>
    <td style="padding:4px 6px">
      <select id="il-sec" class="inline-select" style="width:100px">
        ${SECTIONS.map(s=>`<option${s==='GENERAL'?' selected':''}>${s}</option>`).join('')}
      </select>
    </td>
    <td style="padding:4px 6px">
      <select id="il-cat" class="inline-select" style="width:110px">
        ${CATS.map(c=>`<option${c==='Shipyard'?' selected':''}>${c}</option>`).join('')}
      </select>
    </td>
    <td style="padding:4px 6px">
      <input id="il-desc" class="inline-input" type="text" placeholder="Description" style="width:180px">
    </td>
    <td style="padding:4px 6px">
      <input id="il-vend" class="inline-input" type="text" placeholder="Vendor" style="width:100px">
    </td>
    <td style="padding:4px 6px">
      <input id="il-bud" class="inline-input" type="number" placeholder="Budget" style="width:90px">
    </td>
    <td colspan="4" style="padding:4px 8px;color:var(--txt-m);font-size:11px">
      Enter 저장 — Esc 취소
    </td>`;
  tb.appendChild(tempTr);

  const numInp = document.getElementById('il-num');
  numInp.focus();
  tempTr.scrollIntoView({ behavior:'smooth', block:'center' });

  // Tab키로 필드 간 이동, Enter로 저장
  const saveRow = async () => {
    // 값을 먼저 읽고 나서 행 제거
    const num   = document.getElementById('il-num')?.value.trim();
    const sec   = document.getElementById('il-sec')?.value  || 'GENERAL';
    const cat   = document.getElementById('il-cat')?.value  || 'Shipyard';
    const desc  = document.getElementById('il-desc')?.value.trim() || '';
    const vend  = document.getElementById('il-vend')?.value.trim() || '';
    const bud   = parseFloat(document.getElementById('il-bud')?.value) || 0;

    if(!num) { tempTr.remove(); return; }
    tempTr.remove();

    setSS('saving');
    try {
      const newJob = await apiFetch(`${API}/vessels/${VID}/jobs`, 'POST', {
        number:num, section:sec, category:cat,
        description:desc, remark:desc, vendor:vend, budget:bud,
        consumption:0, start_date:'', end_date:'', completion:0, remarks:[]
      });
      FLEET[VID].jobs = [...(FLEET[VID].jobs||[]), dbJ(newJob)];
      setSS('synced');
    } catch(err){ setSS('error'); toast('추가 실패: '+err.message, true); return; }

    sKey = 'number'; sDir = 1;
    buildJFilters(); renderJobs();
    toast('Job 추가됐습니다');
  };

  // 모든 입력 필드에 이벤트 등록
  tempTr.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('keydown', e => {
      if(e.key === 'Escape') { tempTr.remove(); }
      if(e.key === 'Enter')  { saveRow(); }
    });
  });

  // 포커스가 행 밖으로 나가면 취소
  tempTr.addEventListener('focusout', e => {
    setTimeout(() => {
      if(!tempTr.contains(document.activeElement)) {
        const row = document.getElementById('inline-temp-row');
        if(row) row.remove();
      }
    }, 200);
  });
}
function sortJ(k){sKey===k?sDir*=-1:(sKey=k,sDir=1);renderJobs();}
function pNum(n){
  const s = String(n||'').trim();
  // 알파벳 접두사 (R, S, P 등)
  const prefixMatch = s.match(/^([A-Za-z]+)/);
  const prefix = prefixMatch ? prefixMatch[1].toUpperCase() : '';
  const rest = s.slice(prefix.length);

  // rest를 점/하이픈으로 분리 후 각 파트에서 숫자/suffix 추출
  // 예: '14.2' → ['14','2'], '1A' → ['1A'], '1.1B' → ['1','1B']
  const dotParts = rest.replace('-', '.').split('.');

  let num = 0;
  let multiplier = 1000000;
  for(let i = 0; i < Math.min(dotParts.length, 3); i++) {
    const part = dotParts[i];
    const numMatch = part.match(/^(\d*)/);
    const suffixMatch = part.match(/([A-Za-z]+)$/);
    const partNum = numMatch ? (parseInt(numMatch[1]) || 0) : 0;
    const partSuffix = suffixMatch ? (suffixMatch[1].toUpperCase().charCodeAt(0) - 64) : 0;
    num += (partNum * 100 + partSuffix) * multiplier;
    multiplier = Math.floor(multiplier / 10000);
  }

  if(prefix) return (prefix.charCodeAt(0) - 64) * 100000000000 + num;
  return 10000000000000 + num;  // 숫자만 있는 경우 맨 뒤
}

function openJobModal(idx){
  if(!VID)return;eJobIdx=idx;
  const isNew=idx===null;
  if(isViewer() && isNew) { toast('읽기 전용 계정입니다', true); return; }
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
  // viewer면 저장/삭제 버튼 숨김, 입력 비활성화
  const vjMode = isViewer();
  document.getElementById('mj-del').style.display = vjMode ? 'none' : (isNew?'none':'block');
  document.querySelector('#m-job .btn-pri').style.display = vjMode ? 'none' : '';
  document.querySelectorAll('#m-job input, #m-job select, #m-job textarea').forEach(el => {
    el.disabled = vjMode;
  });
  openM('m-job');
}
async function saveJob(){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

  if(!VID)return;
  const st = document.getElementById('mj-st').value || document.getElementById('mj-st-txt').value.trim();
  const en = document.getElementById('mj-en').value || document.getElementById('mj-en-txt').value.trim();
  // completion은 기존 값 유지 (날짜 변경으로 덮어쓰지 않음)
  const existingCompletion = eJobIdx !== null ? (FLEET[VID].jobs[eJobIdx].completion || 0) : 0;
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
    completion: existingCompletion,
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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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

  const jobs_all = FLEET[VID].jobs||[];

  if(sf || cf) {
    // 필터 적용 시 → 전체 펼침
    catCollapsed.clear();
    jobCollapsed.clear();
    _expandAll = true;
    const expandBtn = document.getElementById('btn-gantt-expand');
    if(expandBtn) expandBtn.textContent = '▼ 전체 접기';
  } else {
    // All Sections → 대분류만 보이게 (중분류·소분류 전부 접기)
    catCollapsed.clear();
    jobCollapsed.clear();
    _catEverSeen.clear();
    _expandAll = false;
    const cats = [...new Set(jobs_all.map(j=>j.category||'Uncategorized'))];
    cats.forEach(c => {
      // 중분류(section 그룹) 접기
      const secs = [...new Set(jobs_all.filter(j=>(j.category||'Uncategorized')===c).map(j=>j.section||'GENERAL'))];
      secs.forEach(s => catCollapsed.add(c+'::'+s));
    });
    // 소분류(개별 job 하위) 접기
    jobs_all.forEach(j => { if(j.number && hasChildren(j.number, jobs_all)) jobCollapsed.add(j.number); });
    const expandBtn = document.getElementById('btn-gantt-expand');
    if(expandBtn) expandBtn.textContent = '▶ 전체 펼치기';
  }
  const info=FLEET[VID].info;
  const ds = (info.berthingDate||info.dockIn) ? new Date(info.berthingDate||info.dockIn) : new Date();
  const de = (info.departureDate||info.dockOut) ? new Date(info.departureDate||info.dockOut) : new Date(ds.getTime()+25*86400000);
  const nd=Math.max(28,Math.ceil((de-ds)/86400000)+4);
  const dates=Array.from({length:nd},(_,i)=>new Date(ds.getTime()+i*86400000));
  const today=new Date();const DW=38;
  const jobs = sortJobTree((FLEET[VID].jobs||[]).filter(j=>{
    if(sf && j.section!==sf) return false;
    if(cf && j.category!==cf) return false;
    return true;
  }));
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
  // depth 캐시 + 상위항목 날짜/합계 자동 계산
  const ganttTreeMap = {};
  buildJobTree(jobs).forEach(j => { ganttTreeMap[j._id] = j._depth || 0; });
  computeParentDates(jobs);
  computeParentSums(jobs);

  const CATS_ORDER = ['Shipyard','Shore Repair','Crew','Spare','Store','Paint'];
  const catGroups = {};
  CATS_ORDER.forEach(c => catGroups[c] = []);
  jobs.forEach(j => {
    const cat = j.category || 'Uncategorized';
    if(!catGroups[cat]) catGroups[cat] = [];
    catGroups[cat].push(j);
  });

  // Gantt 행 렌더 헬퍼
  function ganttJobRow(j, depth, ji) {
    if(!isJobVisible(j, jobs)) return '';
    const indent = depth * 16;
    const isColl = jobCollapsed.has(j.number);
    const hasKids = hasChildren(j.number, jobs);
    const toggleBtn = hasKids
      ? `<span onclick="toggleGanttCollapse('${j.number}')" style="cursor:pointer;font-size:9px;color:var(--txt-m);flex-shrink:0;user-select:none">${isColl?'▶':'▼'}</span>`
      : `<span style="display:inline-block;width:13px;flex-shrink:0"></span>`;
    const effStart = j._autoStart || j.start_date;
    const effEnd   = j._autoEnd   || j.end_date;
    let bs=-1,bw=0;
    if(effStart&&effStart!==''){
      const sd=new Date(effStart);
      const ed=effEnd&&effEnd!==''?new Date(effEnd):new Date(sd.getTime()+86400000);
      bs=Math.round((sd-ds)/86400000);
      bw=Math.max(1,Math.round((ed-sd)/86400000)+1);
      if(bs<0){bw=Math.max(1,bw+bs);bs=0;}
    }
    const pct=Math.min(100, j._autoSum ? j._autoSum.completion : (calcProgress(effStart,effEnd) ?? (+j.completion||0)));
    const barCol=pct>=100?'var(--green)':pct>0?'linear-gradient(90deg,var(--navy),var(--blue))':'#cbd5e1';
    const rowBg=ji%2===0?'var(--bg-white)':'var(--bg-panel)';
    const numStyle=depth===0?'font-weight:700;color:var(--navy)':depth===1?'font-weight:600;color:var(--blue)':'color:var(--txt-s)';
    let row=`<div style="display:flex;border-bottom:1px solid var(--border);min-height:36px;background:${rowBg}" onmouseover="this.style.background='var(--blue-light)'" onmouseout="this.style.background='${rowBg}'">
      <div style="width:280px;min-width:280px;max-width:280px;padding:6px 14px 6px ${8+indent}px;border-right:2px solid var(--border);display:flex;align-items:center;gap:4px;overflow:hidden;">
        ${toggleBtn}
        <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;${numStyle};flex-shrink:0;min-width:28px">${j.number}</span>
        <span style="font-size:12px;color:var(--txt-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;flex:1" title="${j.description}">${j.description}</span>
      </div>
      <div style="display:flex;align-items:center;flex:1;position:relative;">`;
    dates.forEach((d,i)=>{
      const isT=d.toDateString()===today.toDateString();
      const cellBg=isT?'background:rgba(29,111,219,.08);border-left:2px solid var(--blue);border-right:2px solid var(--blue);box-sizing:border-box;':'';
      row+=`<div style="min-width:${DW}px;height:36px;border-right:${isT?'none':'1px solid var(--border)'};flex:none;position:relative;${cellBg}">`;
      if(i===bs&&bs>=0){const w=bw*DW-4;row+=`<div style="position:absolute;top:50%;transform:translateY(-50%);left:2px;width:${w}px;height:16px;background:${barCol};border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.15)"><div style="width:${pct}%;height:100%;background:rgba(255,255,255,.25);border-radius:4px 0 0 4px"></div></div>`;}
      row+=`</div>`;
    });
    row+=`</div></div>`;
    return row;
  }

  let ji = 0;
  Object.entries(catGroups).forEach(([cat, catJobs]) => {
    if(!catJobs.length) return;
    const isCatColl = catCollapsed.has(cat);
    const catCls = cat==='Shipyard'?'cat-sy':cat==='Shore Repair'?'cat-sh':cat==='Spare'?'cat-sp':cat==='Store'?'cat-st':cat==='Paint'?'cat-pt':'cat-cr';

    // Category 헤더 행
    html+=`<div style="display:flex;border-bottom:1px solid var(--border);min-height:38px;background:var(--navy);cursor:pointer" onclick="toggleCatGroup('${cat.replace(/'/g,"\\'")}');buildGantt(null,null,null)">
      <div style="width:280px;min-width:280px;max-width:280px;padding:8px 14px;border-right:2px solid var(--border);display:flex;align-items:center;gap:8px;">
        <span style="font-size:10px;color:#fff;user-select:none">${isCatColl?'▶':'▼'}</span>
        <span class="cat-badge ${catCls}" style="font-size:11px">${cat}</span>
        <span style="font-size:10px;color:rgba(255,255,255,.5)">${catJobs.length}</span>
      </div>
      <div style="flex:1;display:flex;align-items:center;padding:0 14px">
        <span style="font-size:11px;color:rgba(255,255,255,.4)">— ${catJobs.length} jobs</span>
      </div>
    </div>`;

    if(!isCatColl) {
      // Section 그룹
      const secGroups = {};
      const secOrder = [];
      sortJobTree(catJobs).forEach(j => {
        const sec = j.section||'GENERAL';
        if(!secGroups[sec]) { secGroups[sec]=[]; secOrder.push(sec); }
        secGroups[sec].push(j);
      });
      // CANCEL을 맨 뒤로 정렬
      secOrder.sort((a,b) => { if(a==='CANCEL') return 1; if(b==='CANCEL') return -1; return 0; });

      secOrder.forEach(sec => {
        const secJobs = secGroups[sec];
        const secKey = cat+'::'+sec;
        const isSecColl = catCollapsed.has(secKey);

        // Section 헤더 행
        html+=`<div style="display:flex;border-bottom:1px solid var(--border);min-height:34px;background:#1e3a5f;cursor:pointer" onclick="toggleSecGroup('${secKey.replace(/'/g,"\\'")}');buildGantt(null,null,null)">
          <div style="width:280px;min-width:280px;max-width:280px;padding:6px 14px 6px 28px;border-right:2px solid var(--border);display:flex;align-items:center;gap:6px;">
            <span style="font-size:9px;color:rgba(255,255,255,.7);user-select:none">${isSecColl?'▶':'▼'}</span>
            <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.85)">${sec}</span>
            <span style="font-size:10px;color:rgba(255,255,255,.4)">${secJobs.length}</span>
          </div>
          <div style="flex:1;display:flex;align-items:center;padding:0 14px">
            <span style="font-size:10px;color:rgba(255,255,255,.3)">— ${secJobs.length} jobs</span>
          </div>
        </div>`;

        if(!isSecColl) {
          sortJobTree(secJobs).filter(j=>isJobVisible(j,jobs)).forEach(j => {
            html += ganttJobRow(j, ganttTreeMap[j._id]||0, ji++);
          });
        }
      });
    }
  });

  html+=`</div>`;
  document.getElementById('g-wrap').innerHTML=html;
}

// ══ JOB ATTACHMENTS ══════════════════════════════════
async function openJobAttach(jobId) {
  if(!VID) return;
  const list = await apiFetch(`${API}/vessels/${VID}/attachments/job/${jobId}`);
  document.getElementById('ja-title').textContent = '📎 첨부파일';
  document.getElementById('ja-jobid').value = jobId;
  // viewer면 업로드 버튼 숨김
  const uploadLabel = document.querySelector('#m-job-attach label');
  if(uploadLabel) uploadLabel.style.display = isViewer() ? 'none' : '';
  _renderJobAttachUI(list||[]);
  openM('m-job-attach');
}

function _renderJobAttachUI(files) {
  const area = document.getElementById('ja-file-area');
  if(!files.length){
    area.innerHTML=`<div style="text-align:center;padding:24px;color:var(--txt-m);font-size:13px"><div style="font-size:32px;margin-bottom:8px">📂</div>첨부된 파일이 없습니다</div>`;
    return;
  }
  area.innerHTML = files.map(file=>{
    const isImg = file.mimetype&&file.mimetype.startsWith('image/');
    const isPdf = file.mimetype==='application/pdf';
    const sizeMB = file.filesize?(file.filesize/1024/1024).toFixed(1)+' MB':'';
    return`<div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:24px">${isImg?'🖼️':isPdf?'📄':'📁'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.filename}</div>
          <div style="font-size:11px;color:var(--txt-m);margin-top:2px">${sizeMB}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn-sec" style="padding:4px 8px;font-size:11px" onclick="previewJobAttach(${file.id},'${file.mimetype}','${file.filename}')">👁</button>
          <button class="btn-sec" style="padding:4px 8px;font-size:11px" onclick="window.location='/api/attachments/${file.id}'">⬇</button>
          ${isViewer()?'':` <button class="btn-sec" style="padding:4px 8px;font-size:11px;color:var(--red)" onclick="deleteJobAttach(${file.id},${document.getElementById('ja-jobid').value})">✕</button>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

async function uploadJobAttach(input) {
  if(!VID || !input.files.length) return;
  const jobId = +document.getElementById('ja-jobid').value;
  const formData = new FormData();
  for(const f of input.files) formData.append('files', f);
  setSS('saving');
  try {
    await fetch(`${API}/vessels/${VID}/attachments/job/${jobId}`, {method:'POST', body:formData});
    const list = await apiFetch(`${API}/vessels/${VID}/attachments/job/${jobId}`);
    _renderJobAttachUI(list||[]);
    if(FLEET[VID].attachSet) FLEET[VID].attachSet.add(`job:${jobId}`);
    _updateJobAttachBtn(jobId, list?list.length:0);
    setSS('synced'); toast(`${input.files.length}개 파일 업로드 완료`);
  } catch(e){ setSS('error'); toast('업로드 실패: '+e.message, true); }
  input.value='';
}

async function deleteJobAttach(aid, jobId) {
  if(!confirm('파일을 삭제하시겠습니까?')) return;
  setSS('saving');
  try {
    await apiFetch(`${API}/attachments/${aid}`, 'DELETE');
    const list = await apiFetch(`${API}/vessels/${VID}/attachments/job/${jobId}`);
    _renderJobAttachUI(list||[]);
    const cnt = list?list.length:0;
    if(!cnt && FLEET[VID].attachSet) FLEET[VID].attachSet.delete(`job:${jobId}`);
    _updateJobAttachBtn(jobId, cnt);
    setSS('synced'); toast('삭제됐습니다');
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message, true); }
}

function previewJobAttach(aid, mimetype, filename) {
  const isImg = mimetype && mimetype.startsWith('image/');
  const isPdf = mimetype === 'application/pdf';
  if(isImg || isPdf) window.open(`/api/attachments/${aid}/preview`, '_blank');
  else window.location = `/api/attachments/${aid}`;
}

function previewDoc(did, mimetype) {
  const isImg = mimetype && mimetype.startsWith('image/');
  const isPdf = mimetype === 'application/pdf';
  if(isImg || isPdf) window.open(`/api/documents/${did}/preview`, '_blank');
  else window.location = `/api/documents/${did}`;
}

function _updateJobAttachBtn(jobId, cnt) {
  const btn = document.getElementById(`jattbtn-${jobId}`);
  if(!btn) return;
  btn.style.background = cnt>0 ? 'var(--blue)' : '';
  btn.style.color = cnt>0 ? 'var(--white)' : '';
  btn.textContent = cnt>0 ? `📎 ${cnt}` : '📎';
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
const GEN_ATTACH_PREFIX = { class: 'cattbtn', disc: 'dattbtn', steel: 'tattbtn', pipe: 'pipebtn' };

async function openGenAttach(refType, refId) {
  if(!VID) return;
  const list = await apiFetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`);
  document.getElementById('ga-reftype').value = refType;
  document.getElementById('ga-refid').value = refId;
  // viewer면 업로드 버튼 숨김
  const uploadLabel = document.querySelector('#m-gen-attach label');
  if(uploadLabel) uploadLabel.style.display = isViewer() ? 'none' : '';
  _renderGenAttachUI(list || []);
  openM('m-gen-attach');
}

function _renderGenAttachUI(files) {
  const area = document.getElementById('ga-file-area');
  if(!files.length) {
    area.innerHTML = `<div style="text-align:center;padding:24px;color:var(--txt-m);font-size:13px"><div style="font-size:32px;margin-bottom:8px">📂</div>첨부된 파일이 없습니다</div>`;
    return;
  }
  area.innerHTML = files.map(file => {
    const isImg = file.mimetype && file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    const ext = (file.filename||'').split('.').pop().toLowerCase();
    const isXls = ['xlsx','xls','xlsm'].includes(ext);
    const isDoc = ['docx','doc'].includes(ext);
    const icon = isImg?'🖼️':isPdf?'📄':isXls?'📊':isDoc?'📝':'📁';
    const sizeMB = file.filesize ? (file.filesize/1024/1024).toFixed(1)+' MB' : '';
    return `<div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:24px">${icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.filename}</div>
          <div style="font-size:11px;color:var(--txt-m);margin-top:2px">${sizeMB}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn-sec" style="padding:4px 8px;font-size:11px" onclick="previewJobAttach(${file.id},'${file.mimetype}','${file.filename}')">👁</button>
          <button class="btn-sec" style="padding:4px 8px;font-size:11px" onclick="window.location='/api/attachments/${file.id}'">⬇</button>
          ${isViewer()?'':` <button class="btn-sec" style="padding:4px 8px;font-size:11px;color:var(--red)" onclick="deleteGenAttach(${file.id})">✕</button>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

async function uploadGenAttach(input) {
  if(!VID || !input.files.length) return;
  const refType = document.getElementById('ga-reftype').value;
  const refId = document.getElementById('ga-refid').value;
  const formData = new FormData();
  for(const f of input.files) formData.append('files', f);
  setSS('saving');
  try {
    await fetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`, {method:'POST', body:formData});
    const list = await apiFetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`);
    _renderGenAttachUI(list || []);
    if(FLEET[VID].attachSet) FLEET[VID].attachSet.add(`${refType}:${refId}`);
    _updateGenAttachBtn(refType, +refId, list ? list.length : 0);
    setSS('synced'); toast(`${input.files.length}개 파일 업로드 완료`);
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
    const list = await apiFetch(`${API}/vessels/${VID}/attachments/${refType}/${refId}`);
    _renderGenAttachUI(list || []);
    const cnt = list ? list.length : 0;
    if(!cnt && FLEET[VID].attachSet) FLEET[VID].attachSet.delete(`${refType}:${refId}`);
    _updateGenAttachBtn(refType, +refId, cnt);
    setSS('synced'); toast('삭제됐습니다');
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message, true); }
}

function _updateGenAttachBtn(refType, refId, cnt) {
  const prefix = GEN_ATTACH_PREFIX[refType];
  if(!prefix) return;
  const btn = document.getElementById(`${prefix}-${refId}`);
  if(!btn) return;
  btn.style.background = cnt > 0 ? 'var(--blue)' : '';
  btn.style.color = cnt > 0 ? 'var(--white)' : '';
  btn.textContent = cnt > 0 ? `📎 ${cnt}` : '📎';
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
    // 퀵필터
    if(_qfCls==='critical'&&(c.priority||'Normal')!=='Critical')return false;
    if(_qfCls==='urgent'&&(c.priority||'Normal')!=='Urgent')return false;
    if(_qfCls==='open'&&c.status!=='Open')return false;
    return true;
  });
  document.getElementById('c-cnt').textContent=`${fil.length} items`;
  const tb=document.getElementById('c-body');
  if(!fil.length){tb.innerHTML='<tr><td colspan="10" class="empty-state">No class items found</td></tr>';return;}
  tb.innerHTML=fil.map(c=>{
    const ri=items.indexOf(c);
    const stCls=c.status==='Open'?'c-open':'c-closed';
    const priHtml=priorityBadge(c.priority);
    return`<tr data-cid="${c._id}">
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
      <td style="white-space:nowrap"><button class="edit-btn" onclick="openClassModal(${ri})">Edit</button><button class="attach-btn" id="cattbtn-${c._id}" onclick="openGenAttach('class',${c._id})" title="첨부파일" style="${(FLEET[VID].attachSet||new Set()).has('class:'+c._id)?'background:var(--blue);color:var(--white)':''}">${(FLEET[VID].attachSet||new Set()).has('class:'+c._id)?'📎 +':'📎'}</button></td>
    </tr>`;
  }).join('');
}

function startEditC(span, ri, field, type){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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

  // 최초 렌더 시 모든 날짜 자동 접기 (nav 이동 시 skip)
  if(!_calNavExpandDisc && discCollapsed.size === 0 && fil.length > 0) {
    const dates = [...new Set(fil.map(d => d.date || '(날짜 없음)'))];
    dates.forEach(d => discCollapsed.add(d));
  }
  document.getElementById('d-cnt').textContent=`${fil.length} items`;
  const tb=document.getElementById('d-body');
  if(!fil.length){tb.innerHTML='<tr><td colspan="9" class="empty-state">No discussion items found</td></tr>';return;}

  // 날짜별 그룹핑
  const isFiltering = document.getElementById('d-q').value || document.getElementById('d-df').value ||
                      document.getElementById('d-sf').value || document.getElementById('d-pf').value;

  if(isFiltering) {
    // 필터 중이면 그냥 평면 표시
    tb.innerHTML=fil.map(d=>_discRow(d, items)).join('');
    return;
  }

  // 날짜별 그룹화
  const groups = {};
  const groupOrder = [];
  fil.forEach(d => {
    const key = d.date || '(날짜 없음)';
    if(!groups[key]) { groups[key] = []; groupOrder.push(key); }
    groups[key].push(d);
  });

  let html = '';
  groupOrder.forEach(dateKey => {
    const isCollapsed = discCollapsed.has(dateKey);
    const count = groups[dateKey].length;
    // 날짜 헤더 행
    html += `<tr class="disc-date-header" style="background:var(--navy);cursor:pointer" onclick="toggleDiscDate('${dateKey}')">
      <td colspan="9" style="padding:8px 14px;color:#fff;font-size:12px;font-weight:700;font-family:'IBM Plex Mono',monospace;user-select:none">
        <span style="margin-right:8px;font-size:10px">${isCollapsed?'▶':'▼'}</span>
        ${dateKey}
        <span style="margin-left:8px;font-size:11px;opacity:.7;font-weight:400">${count} item${count>1?'s':''}</span>
      </td>
    </tr>`;
    // 하위 항목들
    if(!isCollapsed) {
      groups[dateKey].forEach(d => { html += _discRow(d, items); });
    }
  });
  tb.innerHTML = html;
}

const discCollapsed = new Set();

function toggleDiscDate(dateKey) {
  if(discCollapsed.has(dateKey)) discCollapsed.delete(dateKey);
  else discCollapsed.add(dateKey);
  renderDisc();
}

function _discRow(d, items) {
  const ri = items.indexOf(d);
  const stCls=d.status==='Close'?'c-closed':'c-open';
  const stLbl=d.status==='Close'?'Closed':'Open';
  const priHtml=priorityBadge(d.priority);
  return`<tr data-did="${d._id}" style="background:var(--bg-white)">
    <td data-label="No."><span style="font-family:'IBM Plex Mono'",monospace;font-size:12px;color:var(--txt-m)">${d.no}</span></td>
    <td data-label="Date"><span class="cell-edit" onclick="startEditD(this,${ri},'date','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-h);font-weight:600">${d.date||'—'}</span></td>
    <td data-label="Session"><span class="cell-edit" onclick="startEditSelectD(this,${ri},'time_of_day',${JSON.stringify(SESSION_OPTS)})" style="font-size:12px;color:var(--txt-s)">${d.time_of_day||'—'}</span></td>
    <td data-label="Item"><span class="cell-edit" onclick="startEditD(this,${ri},'item','text')" style="font-size:13px;font-weight:600;color:var(--txt-h);display:block;max-width:200px">${d.item||'—'}</span></td>
    <td data-label="Description"><span class="cell-edit" onclick="startEditD(this,${ri},'description','text')" style="font-size:12px;color:var(--txt-s);display:block;min-width:220px;max-width:320px;white-space:pre-line;line-height:1.6;padding:4px 0">${d.description||'—'}</span></td>
    <td data-label="Action"><div style="font-size:12px;min-width:260px;max-width:360px;cursor:pointer;padding:4px 0;line-height:1.6" onclick="openDiscModal(${ri})" title="클릭하여 편집">${renderActionsCell(d.actions, d.action)}</div></td>
    <td data-label="Priority">${priHtml}</td>
    <td data-label="Status"><span class="cell-edit" onclick="startEditSelectD(this,${ri},'status',['Open','Close'])">
      <span class="c-badge ${stCls}">${stLbl}</span>
    </span></td>
    <td style="white-space:nowrap"><button class="edit-btn" onclick="openDiscModal(${ri})">Edit</button><button class="attach-btn" id="dattbtn-${d._id}" onclick="openGenAttach('disc',${d._id})" title="첨부파일" style="${(FLEET[VID].attachSet||new Set()).has('disc:'+d._id)?'background:var(--blue);color:var(--white)':''}">${(FLEET[VID].attachSet||new Set()).has('disc:'+d._id)?'📎 +':'📎'}</button></td>
  </tr>`;
}

function startEditD(span, ri, field, type){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  const today = new Date().toISOString().slice(0,10);
  items.push({no:String(items.length+1),date:today,time_of_day:'',item:'',description:'',action:'',status:'Open'});
  persist('disc',items).then(()=>{
    // 오늘 날짜 그룹 펼치기
    discCollapsed.delete(today);
    buildDDF();renderDisc();
    requestAnimationFrame(()=>{
      const rows=document.querySelectorAll('#d-body tr:not(.disc-date-header)');
      const last=rows[rows.length-1];
      if(last){const cells=last.querySelectorAll('.cell-edit');if(cells[1])cells[1].click();}
    });
  });
  toast('새 로그가 추가됐습니다. 셀을 클릭해서 바로 입력하세요.');
}
function openDiscModal(idx){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  // viewer면 저장/삭제 버튼 숨김, 입력 비활성화
  const viewerMode = isViewer();
  document.getElementById('md-del').style.display = viewerMode ? 'none' : (isNew?'none':'block');
  document.querySelector('#m-disc .btn-pri').style.display = viewerMode ? 'none' : '';
  document.querySelectorAll('#m-disc input, #m-disc select, #m-disc textarea').forEach(el => {
    el.disabled = viewerMode;
  });
  openM('m-disc');
}
function saveDisc(){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

  if(eDscIdx===null||!VID)return;if(!confirm('Delete?'))return;
  FLEET[VID].discussions.splice(eDscIdx,1);persist('disc',FLEET[VID].discussions);
  closeM('m-disc');buildDDF();renderDisc();toast('Log deleted');
}

// ══ VESSEL ADD/EDIT ═══════════════════════════════════
function openAddVesselModal(){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
  eVesselNew=true;
  document.getElementById('mv-title').textContent='ADD NEW VESSEL';
  document.getElementById('mv-del').style.display='none';
  ['name','type','imo','yard','class','dur','grt'].forEach(k=>document.getElementById('mv-'+k).value='');
  ['mv-berthing','mv-in','mv-out','mv-departure',
   'mv-berthing-txt','mv-in-txt','mv-out-txt','mv-departure-txt'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  openM('m-vessel');
}
function openVesselEditModal(){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
  if(!VID)return; eVesselNew=false;
  const info=FLEET[VID].info;
  document.getElementById('mv-title').textContent='EDIT VESSEL INFO';
  document.getElementById('mv-del').style.display='block';
  document.getElementById('mv-name').value=info.name||'';
  document.getElementById('mv-type').value=info.type||'';
  document.getElementById('mv-imo').value=info.imo||'';
  document.getElementById('mv-yard').value=info.shipyard||'';
  document.getElementById('mv-class').value=info.classSociety||'';
  // 4개 날짜
  const setDate=(txtId, pickId, val)=>{
    const t=document.getElementById(txtId), p=document.getElementById(pickId);
    if(t) t.value=val||''; if(p) p.value=val||'';
  };
  setDate('mv-berthing-txt','mv-berthing', info.berthingDate);
  setDate('mv-in-txt',      'mv-in',       info.dockIn);
  setDate('mv-out-txt',     'mv-out',      info.dockOut);
  setDate('mv-departure-txt','mv-departure',info.departureDate);
  calcVesselDuration();
  document.getElementById('mv-grt').value=info.grt||'';
  openM('m-vessel');
}
async function saveVessel(){
  const name=document.getElementById('mv-name').value.trim();
  if(!name){toast('Vessel name is required',true);return;}
  const gv=id=>(document.getElementById(id)||{}).value||'';
  const payload={
    name,
    type:       gv('mv-type').trim(),
    imo:        gv('mv-imo').trim(),
    shipyard:   gv('mv-yard').trim(),
    classSociety: gv('mv-class').trim(),
    berthingDate:  gv('mv-berthing') || gv('mv-berthing-txt').trim(),
    dockIn:        gv('mv-in')       || gv('mv-in-txt').trim(),
    dockOut:       gv('mv-out')      || gv('mv-out-txt').trim(),
    departureDate: gv('mv-departure')|| gv('mv-departure-txt').trim(),
    duration: gv('mv-dur'),
    grt:      gv('mv-grt').trim()
  };
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
    cols: ['no','position_tank','frame_no','location_detail','type','length_l','width_w','thickness_t','steel_grade','new_weight','space_type','shape','remark','priority','status','start_date','completion_date'],
    headers: ['No.','Position/Tank','Frame No.','Location','Type','L(mm)','W(mm)','T(mm)','Grade','New Wt(kg)★','Space Type','Shape','Remark','Priority','Status','Start Date','Completion'],
    widths: ['44px','100px','80px','110px','110px','70px','70px','65px','80px','90px','120px','100px','','80px','105px','95px','95px'],
    priCol: 'priority', statCol: 'status',
    newRow: ()=>({no:'',position_tank:'',frame_no:'',location_detail:'',type:'',length_l:'',width_w:'',thickness_t:'',steel_grade:'',new_weight:'',space_type:'Open Space',shape:'Flat',remark:'',priority:'Normal',status:'Not Started',start_date:'',completion_date:''}),
  },
  pipe: {
    api: 'pipe_repair', key: 'pipe', tbody: 'pipe-body',
    cols: ['no','system_line','position_tank','frame_no','location_detail','description','pipe_od','schedule','material','length_m','bend_qty','flange_qty','valve_type','valve_size','valve_qty','remark','priority','status','start_date','completion_date'],
    headers: ['No.','System/Line','Position/Tank','Frame No.','Location','Description','OD(mm)','Schedule','Material','Length(m)','Bend(pc)','Flange(pc)','Valve Type','V.Size(mm)','V.Qty','Remark','Priority','Status','Start Date','Completion'],
    widths: ['44px','100px','100px','75px','110px','','70px','70px','110px','75px','70px','75px','90px','80px','65px','','80px','105px','95px','95px'],
    priCol: 'priority', statCol: 'status',
    newRow: ()=>({no:'',system_line:'',position_tank:'',frame_no:'',location_detail:'',description:'',pipe_od:'',schedule:'Sch40',material:'Carbon Steel',length_m:'',bend_qty:'',flange_qty:'',valve_type:'None',valve_size:'',valve_qty:'',remark:'',priority:'Normal',status:'Not Started',start_date:'',completion_date:''}),
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
const PRI_OPTS_LMH = ['Low','Medium','High'];
const STAT_OPTS = ['Not Started','In Progress','Completed','On Hold'];
const STEEL_TYPE_OPTS = ['Shell Plate','Stiffener','Longitudinal','Bulb Bar','Angle Bar','Flat Bar','Checked Plate','Web Plate','Other'];
const STEEL_GRADE_OPTS = ['A','B','AH32','AH36','DH32','EH32','Other'];
const STEEL_SPACE_OPTS = ['Open Space','Closed Space','DBT / FPT / Oil Tank','Dry Dock (Underwater)'];
const STEEL_SHAPE_OPTS = ['Flat','Single Curved','Double Curved','Profiled (Bulb/Angle/Bar)'];
const STEEL_TEST_OPTS  = ['None','UT Gauging','Dye-Check','Vacuum Test','X-Ray','UT Detection'];
const PIPE_OD_OPTS  = ['25','40','50','65','80','90','100','125','150','200','250','300','350','400','450','500'];
const PIPE_SCH_OPTS = ['Sch40','Sch80','Other'];
const PIPE_MAT_OPTS = ['Carbon Steel','Galvanized','Stainless Steel','Hydraulic','Acid Treatment','Other'];
const PIPE_VALVE_OPTS = ['None','Globe','Gate','Butterfly','Check','Ball'];
const PIPE_SPACE_OPTS = ['Open Deck / Open Space','Engine Room','Closed Space / Cargo Hold','DBT / WBT / Duct Keel','Oil Tank / Pump Room','Lavatory'];
const PIPE_RR_OPTS = ['Not Required','Yes - Open/Deck (30%)','Yes - Engine Room (35%)','Yes - Confined Space (40%)'];

const TRACKING_OPTS = {
  pri: PRI_OPTS, pri_lmh: PRI_OPTS_LMH, stat: STAT_OPTS,
  steel_type: STEEL_TYPE_OPTS, steel_grade: STEEL_GRADE_OPTS,
  steel_space: STEEL_SPACE_OPTS, steel_shape: STEEL_SHAPE_OPTS,
  steel_test: STEEL_TEST_OPTS,
  pipe_od: PIPE_OD_OPTS, pipe_sch: PIPE_SCH_OPTS,
  pipe_mat: PIPE_MAT_OPTS, pipe_valve: PIPE_VALVE_OPTS,
  pipe_space: PIPE_SPACE_OPTS, pipe_rr: PIPE_RR_OPTS,
};

// 데이터 로드 + 렌더
async function renderTracking(key){
  if(!VID) return;
  const cfg = TRACKING_CFG[key];
  try {
    const data = await apiFetch(`${API}/vessels/${VID}/${cfg.api}`);
    FLEET[VID][cfg.key] = data;
  } catch(e) { toast('로드 실패: '+e.message, true); return; }

  // steel/pipe: 첫 로드 시에만 전체 접힌 상태로 초기화 (이미 상태 있으면 유지)
  if((key === 'steel' || key === 'pipe') && !_trackingGroupCollapsed[key]) {
    const d = FLEET[VID][cfg.key] || [];
    _trackingGroupCollapsed[key] = new Set(
      d.map(r => (r.position_tank || '').trim() || '(미지정)')
    );
  }

  _renderTrackingTable(key);
}

// Position/Tank 그룹 접힘 상태 (key → Set of collapsed group names)
const _trackingGroupCollapsed = {};
let _highlightRowId  = null;   // 렌더 후 하이라이트할 row id
let _highlightRowKey = null;   // 어느 탭인지

function toggleTrackingGroup(key, groupName) {
  if(!_trackingGroupCollapsed[key]) _trackingGroupCollapsed[key] = new Set();
  const s = _trackingGroupCollapsed[key];
  if(s.has(groupName)) s.delete(groupName); else s.add(groupName);
  _renderTrackingTable(key);
}
function expandAllTrackingGroups(key)  { _trackingGroupCollapsed[key] = new Set(); _renderTrackingTable(key); }
function collapseAllTrackingGroups(key) {
  const cfg = TRACKING_CFG[key];
  const data = FLEET[VID]?.[cfg.key] || [];
  _trackingGroupCollapsed[key] = new Set(data.map(r=>(r.position_tank||'').trim()||'(미지정)'));
  _renderTrackingTable(key);
}

function _renderTrackingTable(key){
  const cfg = TRACKING_CFG[key];
  const data = FLEET[VID][cfg.key] || [];
  const tbody = document.getElementById(cfg.tbody);
  if(!tbody) return;

  if(key === 'steel' || key === 'pipe') {
    return _renderGroupedTrackingTable(key, cfg, data, tbody);
  }

  // 컬럼별 select 옵션 키 매핑
  const SELECT_MAP = {
    steel: {type:'steel_type', steel_grade:'steel_grade', space_type:'steel_space', shape:'steel_shape', priority:'pri', status:'stat'},
    pipe:  {schedule:'pipe_sch', material:'pipe_mat', valve_type:'pipe_valve', priority:'pri', status:'stat'},
  };
  const selMap = SELECT_MAP[key] || {};

  tbody.innerHTML = data.map((row, ri) => {
    const rowId = row.id;
    const cells = cfg.cols.map((col, ci) => {
      const v = row[col] || '';
      const isDate = cfg.dateCols ? cfg.dateCols.includes(col) : (col.includes('date') || col === 'date');
      if(col === cfg.priCol){
        const priKey = (key==='steel'||key==='pipe') ? 'pri' : (key==='outfit'?'pri_lmh':'pri');
        return `<td data-label="${cfg.headers[ci]}"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','${priKey}')">${priorityBadge(v||'Normal')}</span></td>`;
      }
      if(col === cfg.statCol){
        const sc = v==='Completed'?'c-closed':v==='Not Started'||!v?'c-open':'cat-badge cat-sh';
        return `<td data-label="${cfg.headers[ci]}" style="white-space:nowrap"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','stat')"><span class="c-badge ${sc}">${v||'Not Started'}</span></span></td>`;
      }
      if(isDate){
        const dv = v ? String(v).slice(0,10) : '';
        return `<td data-label="${cfg.headers[ci]}" style="white-space:nowrap">
          <div style="display:flex;align-items:center;gap:4px;">
            <span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-s);white-space:nowrap">${dv||'—'}</span>
            <span class="cal-btn" style="width:28px;height:24px;font-size:13px;flex-shrink:0;" title="날짜 선택">📅<input type="date" ${dv?'value="'+dv+'"':''}  onchange="setTrackingDate('${key}','${rowId}','${col}',this.value)" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;"></span>
          </div>
        </td>`;
      }
      if(col === 'no') return `<td data-label="No."><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--blue);font-weight:600">${v||'—'}</span></td>`;
      if(selMap[col]){
        const optKey = selMap[col];
        const dispV = v || '—';
        if(col === 'space_type'){
          const spColor = v.includes('DBT')||v.includes('Oil')?'#f59e0b':v.includes('Engine')||v.includes('Closed')||v.includes('Cargo')?'#6366f1':v.includes('Dry')?'#ef4444':'#64748b';
          return `<td data-label="${cfg.headers[ci]}"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','${optKey}')" style="font-size:11px;font-weight:600;color:${spColor}">${dispV}</span></td>`;
        }
        return `<td data-label="${cfg.headers[ci]}"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','${optKey}')" style="font-size:12px;color:var(--txt-s)">${dispV}</span></td>`;
      }
      if(['length_l','width_w','thickness_t','new_weight','staging_m3','est_cost','actual_charged','length_m','bend_qty','flange_qty','valve_qty','valve_size','pipe_od'].includes(col))
        return `<td data-label="${cfg.headers[ci]}" style="text-align:right"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-h)">${v||'—'}</span></td>`;
      return `<td data-label="${cfg.headers[ci]}"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-size:12px;color:var(--txt-b)">${v||'—'}</span></td>`;
    });
    return `<tr data-id="${rowId}">${cells.join('')}<td><button class="edit-btn" style="color:var(--red)" onclick="deleteTrackingRow('${key}','${rowId}')">✕</button></td></tr>`;
  }).join('');

  if(!data.length) tbody.innerHTML = `<tr><td colspan="${cfg.cols.length+1}" class="empty-state">데이터가 없습니다. xlsx 업로드 또는 + Add Row를 사용하세요.</td></tr>`;
}

function _renderGroupedTrackingTable(key, cfg, data, tbody) {
  if(!data.length) {
    tbody.innerHTML = `<tr><td colspan="${cfg.cols.length+1}" class="empty-state">데이터가 없습니다. + Add Row를 사용하세요.</td></tr>`;
    return;
  }
  if(!_trackingGroupCollapsed[key]) _trackingGroupCollapsed[key] = new Set();
  const collapsed = _trackingGroupCollapsed[key];

  const SELECT_MAP = {
    steel: {type:'steel_type', steel_grade:'steel_grade', space_type:'steel_space', shape:'steel_shape', priority:'pri', status:'stat'},
    pipe:  {schedule:'pipe_sch', material:'pipe_mat', valve_type:'pipe_valve', priority:'pri', status:'stat'},
  };
  const selMap = SELECT_MAP[key] || {};

  // 그룹핑 (순서 유지)
  const groupOrder = [], groups = {};
  data.forEach(row => {
    const g = (row.position_tank || '').trim() || '(미지정)';
    if(!groups[g]) { groups[g] = []; groupOrder.push(g); }
    groups[g].push(row);
  });

  const renderCell = (col, ci, row) => {
    const rowId = row.id;
    const v = row[col] || '';
    const isDate = cfg.dateCols ? cfg.dateCols.includes(col) : (col.includes('date') || col === 'date');
    if(col === cfg.priCol) return `<td><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','pri')">${priorityBadge(v||'Normal')}</span></td>`;
    if(col === cfg.statCol){
      const sc = v==='Completed'?'c-closed':v==='Not Started'||!v?'c-open':'cat-badge cat-sh';
      return `<td style="white-space:nowrap"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','stat')"><span class="c-badge ${sc}">${v||'Not Started'}</span></span></td>`;
    }
    if(isDate){
      const dv = v ? String(v).slice(0,10) : '';
      return `<td style="white-space:nowrap"><div style="display:flex;align-items:center;gap:4px;">
        <span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-s)">${dv||'—'}</span>
        <span class="cal-btn" style="width:28px;height:24px;font-size:13px;flex-shrink:0;">📅<input type="date" ${dv?'value="'+dv+'"':''}  onchange="setTrackingDate('${key}','${rowId}','${col}',this.value)" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;"></span>
      </div></td>`;
    }
    if(col === 'no') return `<td><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--blue);font-weight:600">${v||'—'}</span></td>`;
    if(col === 'new_weight' && key === 'steel'){
      const calc = calcSteelWeight(row);
      const display = calc !== '' ? calc : (v || '—');
      const isAuto = calc !== '';
      return `<td style="text-align:right"><span style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:${isAuto?'#1D6FDB':'var(--txt-s)'};">${display}</span>${isAuto?'<span style="font-size:9px;color:#94a3b8;margin-left:2px">kg</span>':''}</td>`;
    }
    if(selMap[col]){
      const optKey = selMap[col], dispV = v || '—';
      if(col === 'space_type'){
        const spColor = v.includes('DBT')||v.includes('Oil')?'#f59e0b':v.includes('Engine')||v.includes('Closed')||v.includes('Cargo')?'#6366f1':v.includes('Dry')?'#ef4444':'#64748b';
        return `<td><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','${optKey}')" style="font-size:11px;font-weight:600;color:${spColor}">${dispV}</span></td>`;
      }
      return `<td><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','select','${optKey}')" style="font-size:12px;color:var(--txt-s)">${dispV}</span></td>`;
    }
    if(['length_l','width_w','thickness_t','length_m','bend_qty','flange_qty','valve_qty','valve_size','pipe_od'].includes(col))
      return `<td style="text-align:right"><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--txt-h)">${v||'—'}</span></td>`;
    return `<td><span class="cell-edit" onclick="startTrackingEdit(this,'${key}','${rowId}','${col}','text')" style="font-size:12px;color:var(--txt-b)">${v||'—'}</span></td>`;
  };

  const colCount = cfg.cols.length + 1;
  let html = '';

  groupOrder.forEach(gName => {
    const rows = groups[gName];
    const isCollapsed = collapsed.has(gName);
    const cr = rows.filter(r=>r.priority==='Critical').length;
    const ug = rows.filter(r=>r.priority==='Urgent').length;
    const dn = rows.filter(r=>(r.status||'')==='Completed').length;
    const priBadge = cr ? `<span style="font-size:10px;background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:3px;font-weight:600">🔴 ${cr}</span>`
                   : ug ? `<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:3px;font-weight:600">🟡 ${ug}</span>` : '';
    const doneTag = dn===rows.length && dn>0
      ? `<span style="font-size:10px;background:#d1fae5;color:#065f46;padding:1px 6px;border-radius:3px">✅ 전체완료</span>`
      : dn ? `<span style="font-size:10px;background:#d1fae5;color:#065f46;padding:1px 6px;border-radius:3px">✅ ${dn}/${rows.length}</span>` : '';
    const gKey = gName.replace(/'/g, "\\'");
    html += `<tr style="background:#dbeafe;cursor:pointer" onclick="toggleTrackingGroup('${key}','${gKey}')">
      <td colspan="${colCount}" style="padding:7px 14px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;color:#1d4ed8">${isCollapsed?'▶':'▼'}</span>
          <span style="font-size:12px;font-weight:700;color:#1e3a8a">${gName}</span>
          <span style="font-size:11px;color:#3b82f6">${rows.length}건</span>
          ${priBadge}${doneTag}
        </div>
      </td>
    </tr>`;
    if(!isCollapsed) {
      rows.forEach(row => {
        const cells = cfg.cols.map((col,ci) => renderCell(col, ci, row));
        html += `<tr data-id="${row.id}">${cells.join('')}<td><button class="edit-btn" style="color:var(--red)" onclick="deleteTrackingRow('${key}','${row.id}')">✕</button></td></tr>`;
      });
    }
  });
  tbody.innerHTML = html;

  // 바로가기로 이동한 항목 하이라이트 처리
  if(_highlightRowId !== null && _highlightRowKey === key) {
    const id = _highlightRowId;
    _highlightRowId = null; _highlightRowKey = null;
    requestAnimationFrame(() => {
      const row = tbody.querySelector(`tr[data-id="${id}"]`);
      if(!row) return;
      row.scrollIntoView({behavior:'smooth', block:'center'});
      row.style.transition = 'background .2s';
      row.style.background = '#fecaca';  // 연한 빨강
      setTimeout(() => { row.style.background = ''; setTimeout(() => row.style.transition = '', 600); }, 1800);
    });
  }
}
// 캘린더로 날짜 직접 설정
async function setTrackingDate(key, rowId, col, val){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

  const cfg = TRACKING_CFG[key];
  const row = (FLEET[VID][cfg.key]||[]).find(r=>String(r.id)===String(rowId));
  if(!row) return;
  row[col] = val;
  await saveTrackingRow(key, rowId, row);
}

// 인라인 편집
function startTrackingEdit(span, key, rowId, col, type, optsOrKey){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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

// Steel 중량 자동계산: L(mm) × W(mm) × T(mm) × 8.0 / 1,000,000,000 → ton
function calcSteelWeight(row) {
  const l = parseFloat(row.length_l);
  const w = parseFloat(row.width_w);
  const t = parseFloat(row.thickness_t);
  if(isNaN(l) || isNaN(w) || isNaN(t) || l<=0 || w<=0 || t<=0) return '';
  const ton = l * w * t * 8.0 / 1000000;
  return ton.toFixed(2);
}

// 저장
async function saveTrackingRow(key, id, row){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

  // Steel: L/W/T 입력 시 중량 자동계산
  if(key === 'steel') {
    const calc = calcSteelWeight(row);
    if(calc !== '') row.new_weight = calc;
  }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
function openTrackingXlsx(){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
 openM('m-tracking-xlsx'); }

async function uploadTrackingXlsx(input){
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }

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
      outfitting:'Outfitting', wbt_cot:'WBT & COT',
      portable_fan:'Portable Fan', staging:'Staging', gas_free:'Gas Free'
    }).map(([k,label])=>imp[k]!=null?`${label}: <b>${imp[k]}건</b>`:'').filter(Boolean).join(' &nbsp;|&nbsp; ');

    const resEl = document.getElementById('xlsx-result');
    resEl.style.display='block';
    resEl.innerHTML=`<div style="background:var(--green-bg);border:1.5px solid var(--green);border-radius:8px;padding:12px;font-size:13px;color:var(--green)">✅ 업로드 완료! (기존 No. 일치 → 덮어쓰기, 신규 → 추가, 빈 시트 → 유지)<br><span style="font-size:12px;color:var(--txt-s)">${summary}</span></div>`;

    for(const [apiKey, fKey] of [
      ['outfitting','outfit'],['wbt_cot','wbt'],
      ['portable_fan','fan'],['staging','staging'],['gas_free','gasfree']
    ]){
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


// ══ TANK PLAN ════════════════════════════════════════════════

let _tankPlanData  = [];
let _tankLayout    = null;
let _layoutEditing = null;
let _curTankId     = null;
let _curTankName   = null;

// ── Type color map ────────────────────────────────────────────
const TANK_BASE_COLORS = {
  WBT: {f:'#e0f2fe',s:'#7dd3fc'},  // WBT = same as DBT
  COT: {f:'#dbeafe',s:'#93c5fd'}, DBT: {f:'#e0f2fe',s:'#7dd3fc'},
  SLOP:{f:'#ede9fe',s:'#c4b5fd'}, FOT: {f:'#dcfce7',s:'#86efac'},
  WBT: {f:'#e0f2fe',s:'#7dd3fc'}, FPT: {f:'#fef9c3',s:'#fde047'},
  APT: {f:'#fef9c3',s:'#fde047'}, ER:  {f:'#f1f5f9',s:'#cbd5e1'},
  MISC:{f:'#f8fafc',s:'#e2e8f0'},
};

// ── Default VLCC Layout — AFT(좌) → FWD(우) ──────────────────
const TANK_LAYOUT_VERSION = 6;  // bump to force-reset saved layouts
function _defaultVLCCLayout() {
  const mk = (id,name,type,cl) => ({id,name,type,cl});
  // P/C/S 3행 COT 컬럼
  const mkpcs = (n, w) => ({
    id:`cC${n}`, w,
    p: mk(`COT${n}P`,`COT ${n}P`,'COT',true),
    c: mk(`COT${n}C`,`COT ${n}C`,'COT',true),
    s: mk(`COT${n}S`,`COT ${n}S`,'COT',true),
  });
  // P/S 2행 컬럼 (Center 없음 - 3행 섹션 안에서 P=상단, S=하단)
  const mkps = (id, pName, sName, type, w) => ({
    id, w,
    p: mk(id+'P', pName, type, true),
    c: null,
    s: mk(id+'S', sName, type, true),
  });

  // 폭 계산 (GAP=2):
  // Cargo: 55 + 90×3 + 190×5 + 8gap×2 = 1291
  // DBT:   75 + 197  + 190×5 + 55 + 7gap×2 = 1291 ✓
  return {
    version: TANK_LAYOUT_VERSION,
    direction: 'aft-fwd',
    sections: [
      {
        id:'s_cargo', label:'CARGO TANK ARRANGEMENT', sublabel:'',
        columns: [
          {id:'cER',   w:55,  p:mk('ER',    'E/R',          'ER',  true), c:null, s:null},
          mkps('cHFO2','No.2 HFO BT P','No.2 HFO BT S','FOT', 90),
          mkps('cHFO1','LSHFO BT',     'No.1 HFO BT',  'FOT', 90),
          mkps('cSLP', 'SLOP P',       'SLOP S',        'SLOP',90),
          mkpcs(5, 190), mkpcs(4, 190), mkpcs(3, 190), mkpcs(2, 190), mkpcs(1, 190),
        ]
      },
      {
        id:'s_dbt', label:'WATER BALLAST TANK ARRANGEMENT', sublabel:'',
        columns: [
          {id:'dAPT', w:75,  p:mk('APT',   'APT',       'APT',true), c:null, s:null},
          {id:'dPR',  w:197, p:mk('PR',    'Pump Room', 'ER', true), c:null, s:null},
          {id:'dD5',  w:190, p:mk('DBT5P','DBT 5P',    'DBT',true), c:null, s:mk('WBT5S','WBT 5S','WBT',true)},
          {id:'dD4',  w:190, p:mk('DBT4P','DBT 4P',    'DBT',true), c:null, s:mk('WBT4S','WBT 4S','WBT',true)},
          {id:'dD3',  w:190, p:mk('DBT3P','DBT 3P',    'DBT',true), c:null, s:mk('WBT3S','WBT 3S','WBT',true)},
          {id:'dD2',  w:190, p:mk('DBT2P','DBT 2P',    'DBT',true), c:null, s:mk('WBT2S','WBT 2S','WBT',true)},
          {id:'dD1',  w:190, p:mk('DBT1P','DBT 1P',    'DBT',true), c:null, s:mk('WBT1S','WBT 1S','WBT',true)},
          {id:'dFPT', w:55,  p:mk('FPT',  'FPT',        'FPT',true), c:null, s:null},
        ]
      }
    ]
  };
}

// ── Item matching ────────────────────────────────────────────
function _matchItems(tankName) { return _matchItemsFrom(tankName, _tankPlanData); }
function _matchItemsFrom(tankName, data) {
  if(!tankName || !Array.isArray(data)) return [];
  const tn = tankName.replace(/\s+/g,'').toUpperCase();
  return data.filter(i => {
    if(!i.position_tank) return false;
    const pt = i.position_tank.replace(/\s+/g,'').toUpperCase();
    return pt.includes(tn) || tn.includes(pt);
  });
}

// 색상 생성 헬퍼 — data 배열을 캡처한 colFn 반환
function _makeColFn(data, hasItemsFill, hasItemsStroke, hasItemsText) {
  return function(name, type, clickable) {
    const b = TANK_BASE_COLORS[type] || TANK_BASE_COLORS.MISC;
    if(!clickable) return {fill:'#f1f5f9', stroke:'#cbd5e1', text:'#94a3b8', count:0};
    const items = _matchItemsFrom(name, data);
    if(!items.length) return {fill:b.f, stroke:b.s, text:'#475569', count:0};
    const cr = items.filter(i=>i.priority==='Critical').length;
    const ug = items.filter(i=>i.priority==='Urgent').length;
    if(cr>0) return {fill:'#fee2e2', stroke:'#ef4444', text:'#991b1b', count:items.length, critical:cr};
    if(ug>0) return {fill:'#fef3c7', stroke:'#f59e0b', text:'#92400e', count:items.length};
    return {fill:hasItemsFill, stroke:hasItemsStroke, text:hasItemsText, count:items.length};
  };
}

// ── SVG Generator ────────────────────────────────────────────
function _svgFromLayout(layout, clickFn, colFn) {
  const dir  = layout.direction || 'aft-fwd';
  const lLbl = dir==='aft-fwd' ? '◄  AFT' : '◄  FWD';
  const rLbl = dir==='aft-fwd' ? 'FWD  ►' : 'AFT  ►';
  const LM=14, RM=14, ROWH=76, GAP=2, SECHDR=22, SECGAP=32, LGND=92;

  const esc = s => (s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');

  // 각 섹션의 행 수: Center(c) 있는 컬럼이 하나라도 있으면 3행 (empty 마커 제외)
  const secRowCount = (sec) => {
    if(!sec.columns||!sec.columns.length) return 2;
    return sec.columns.some(col => col.c && typeof col.c === 'object' && !col.c.empty) ? 3 : 2;
  };
  const secBodyH = (sec) => {
    const n = secRowCount(sec);
    return n * ROWH + (n-1) * GAP;
  };
  const secTotalH = (sec) => SECHDR + secBodyH(sec);

  // 최대 컬럼 폭
  const maxCW = Math.max(...layout.sections.map(sec =>
    (sec.columns||[]).reduce((s,c) => s + (c.w||100) + GAP, 0) - GAP
  ), 100);
  const SVG_W = LM + maxCW + RM + LGND;

  // 전체 높이
  const SVG_H = layout.sections.reduce((acc, sec, i) =>
    acc + secTotalH(sec) + (i < layout.sections.length-1 ? SECGAP : 0)
  , 0) + 30;

  let sv = `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;min-width:700px;display:block;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
  <style>.tk rect{transition:filter .1s;} .tk:hover rect{filter:brightness(.9);}</style>
  <text x="${LM}" y="13" font-family="IBM Plex Mono" font-size="10" fill="#94a3b8">${lLbl}</text>
  <text x="${LM+maxCW}" y="13" font-family="IBM Plex Mono" font-size="10" fill="#94a3b8" text-anchor="end">${rLbl}</text>`;

  // 탱크 셀 그리기 헬퍼 — null 또는 empty:true 이면 빈 공간
  const drawCell = (t, cx, ry, w, h) => {
    if(!t || t.empty) return '';  // empty 마커 = 빈 공간
    const c = colFn(t.name, t.type, t.cl);
    const oc = t.cl ? `onclick="${clickFn||'openTankModal'}('${esc(t.id)}','${esc(t.name)}')"` : '';
    const cursor = t.cl ? 'pointer' : 'default';
    const badge = c.count > 0
      ? `<rect x="${cx+w-20}" y="${ry+h-16}" width="17" height="13" rx="2"
           fill="${c.critical?'#ef4444':'#3b82f6'}" opacity=".9"/>
         <text x="${cx+w-11.5}" y="${ry+h-6}" font-family="IBM Plex Mono" font-size="9"
           font-weight="700" fill="white" text-anchor="middle">${c.count}</text>`
      : '';
    const nl = t.name.split(/[\n\/]/);
    const ty = ry + h/2;
    const nameEl = nl.map((l,i) =>
      `<text x="${cx+w/2}" y="${ty+(i-(nl.length-1)/2)*13}"
        font-family="IBM Plex Sans,Arial" font-size="${nl.length>1?9:10}" font-weight="700"
        fill="${c.text}" text-anchor="middle" dominant-baseline="central">${l}</text>`
    ).join('');
    return `<g class="${t.cl?'tk':''}" style="cursor:${cursor}" ${oc}>
      <rect x="${cx}" y="${ry}" width="${w}" height="${h}" rx="2"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      ${nameEl}${badge}</g>`;
  };

  // 섹션 그리기
  let secY = 17;
  layout.sections.forEach(sec => {
    const nRows   = secRowCount(sec);
    const bodyH   = secBodyH(sec);
    const totalH  = secTotalH(sec);
    const topY    = secY + SECHDR;          // 첫 행 시작 y
    const rowYs   = Array.from({length:nRows}, (_,i) => topY + i*(ROWH+GAP));

    // 섹션 레이블
    const labelText = sec.label||'';
    const subText   = sec.sublabel ? ` — ${sec.sublabel}` : '';
    sv += `<text x="${LM+maxCW/2}" y="${secY+14}"
      font-family="IBM Plex Sans,Arial" font-size="11" font-weight="700" fill="#475569"
      text-anchor="middle" letter-spacing="2">${labelText}${subText}</text>`;

    // 행 레이블 (P/C/S 또는 P/S)
    const rowLabels = nRows===3 ? ['P','C','S'] : ['P','S'];
    rowLabels.forEach((lbl, i) => {
      const midY = rowYs[i] + ROWH/2;
      sv += `<text x="7" y="${midY}" font-family="IBM Plex Sans" font-size="9" fill="#94a3b8"
        text-anchor="middle" dominant-baseline="central"
        transform="rotate(-90,7,${midY})">${lbl}</text>`;
    });

    // 섹션 테두리
    sv += `<rect x="${LM-1}" y="${topY-1}" width="${maxCW+2}" height="${bodyH+2}" rx="3"
      fill="none" stroke="#cbd5e1" stroke-width="1.5"/>`;

    // 행 구분선
    for(let i=0; i<nRows-1; i++) {
      const lineY = rowYs[i] + ROWH + GAP/2;
      sv += `<line x1="${LM}" y1="${lineY}" x2="${LM+maxCW}" y2="${lineY}"
        stroke="#e2e8f0" stroke-width=".8" stroke-dasharray="6,3"/>`;
    }

    // 컬럼 그리기
    let cx = LM;
    (sec.columns||[]).forEach(col => {
      const w = col.w || 100;
      const hasCenter = col.c && typeof col.c === 'object' && !col.c.empty;
      const isSpan    = !col.s && !hasCenter && !(col.s?.empty);  // p만 있고 s/c 없음 → 전체 SPAN

      if(isSpan) {
        // SPAN: p가 전체 bodyH 차지
        sv += drawCell(col.p, cx, topY, w, bodyH);
      } else if(hasCenter) {
        // 3행: P/C/S
        [[col.p,0],[col.c,1],[col.s,2]].forEach(([t,ri]) => {
          sv += drawCell(t, cx, rowYs[ri], w, ROWH);
        });
      } else {
        // 2행: P/S — P는 최상단, S는 최하단 (3행 섹션이어도 STBD 위치 유지)
        if(col.p) sv += drawCell(col.p, cx, rowYs[0],          w, ROWH);
        if(col.s) sv += drawCell(col.s, cx, rowYs[nRows-1],    w, ROWH);
      }
      cx += w + GAP;
    });

    secY += totalH + SECGAP;
  });

  // Legend
  const lgX = LM + maxCW + RM + 4;
  sv += `<text x="${lgX}" y="30" font-family="IBM Plex Sans" font-size="9" fill="#475569"
    font-weight="700" letter-spacing="1">LEGEND</text>`;
  [['No items','#dbeafe','#93c5fd'],['Has items','#dbeafe','#3b82f6'],
   ['Urgent','#fef3c7','#f59e0b'],['Critical','#fee2e2','#ef4444']].forEach(([lbl,f,s],i)=>{
    sv += `<rect x="${lgX}" y="${37+i*17}" width="12" height="10" rx="1" fill="${f}" stroke="${s}" stroke-width="1"/>
      <text x="${lgX+17}" y="${46+i*17}" font-family="IBM Plex Sans" font-size="9" fill="#64748b">${lbl}</text>`;
  });
  return sv + '</svg>';
}

// ── Render ───────────────────────────────────────────────────
async function renderTankPlan() {
  if(!VID) return;
  const wrap = document.getElementById('tank-svg-wrap');
  if(wrap) wrap.innerHTML = '<div style="text-align:center;padding:40px;color:#334155;font-size:13px">로딩 중…</div>';

  const [items, saved] = await Promise.all([
    apiFetch(`${API}/vessels/${VID}/tank_plan`).catch(()=>[]),
    apiFetch(`${API}/vessels/${VID}/tank_layout`).catch(()=>null),
  ]);
  _tankPlanData = items || [];
  // 구버전 레이아웃 감지 (Cargo에 FPT 포함 or DBT에 WBT FWD 포함) → 기본값 재설정
  let layout = saved;
  if(layout) {
    const cargoCols = (layout.sections||[]).find(s=>s.id==='s_cargo')?.columns||[];
    const dbtCols   = (layout.sections||[]).find(s=>s.id==='s_dbt')?.columns||[];
    const hasOldFPTinCargo = cargoCols.some(c=>c.p?.id==='FPT'||c.s?.id==='FPT');
    const hasNoCenterRow   = cargoCols.some(c=>c.id?.startsWith('cC')&&c.c===undefined);
    const hasWBTFWD        = dbtCols.some(c=>c.p?.id==='WBTF'||c.p?.name==='WBT FWD');
    if(hasOldFPTinCargo || hasWBTFWD || hasNoCenterRow) layout = null;
  }
  _tankLayout = layout || _defaultVLCCLayout();

  // Steel Plan 색상: 파란색 — 렌더 시점 데이터 캡처
  const _tankColFn = _makeColFn(_tankPlanData, '#dbeafe', '#3b82f6', '#1d4ed8');
  if(wrap) wrap.innerHTML = _svgFromLayout(_tankLayout, 'openTankModal', _tankColFn);

  _initPlanDocBadges().catch(()=>{});  // GA / Repair Plan 버튼 뱃지

  const total=_tankPlanData.length, cr=_tankPlanData.filter(i=>i.priority==='Critical').length;
  const ug=_tankPlanData.filter(i=>i.priority==='Urgent').length;
  const tnks=new Set(_tankPlanData.map(i=>i.position_tank).filter(Boolean)).size;

  // 총 강재량 계산 (new_weight 우선, 없으면 L×W×T 자동계산)
  let totalKg = 0, itemsWithWeight = 0;
  _tankPlanData.forEach(i => {
    const wt = parseFloat(i.new_weight) || parseFloat(calcSteelWeight(i)) || 0;
    if(wt > 0) { totalKg += wt; itemsWithWeight++; }
  });
  const totalTon = (totalKg / 1000).toFixed(3);
  const weightStr = totalKg >= 1000
    ? `<b style="color:#1d4ed8;font-size:14px">${totalTon}</b> <span style="font-size:11px">T</span>`
    : `<b style="color:#1d4ed8;font-size:14px">${totalKg.toFixed(1)}</b> <span style="font-size:11px">kg</span>`;
  const weightNote = itemsWithWeight < total
    ? `<span style="font-size:10px;color:#94a3b8">(${itemsWithWeight}/${total}건 집계)</span>` : '';

  const st=document.getElementById('tank-plan-stats');
  if(st) st.innerHTML=`
    <span style="display:inline-flex;align-items:center;gap:6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:4px 10px;margin-right:8px">
      ⚖ 총 강재량 ${weightStr} ${weightNote}
    </span>
    <span style="font-size:12px;color:var(--txt-s)">
      전체 <b>${total}</b>건 · <b>${tnks}</b>개 구역
      ${cr ? ` · <span style="color:#ef4444">🔴 <b>${cr}</b></span>` : ''}
      ${ug ? ` · <span style="color:#f59e0b">🟡 <b>${ug}</b></span>` : ''}
    </span>`;
}

// ── Tank Modal ────────────────────────────────────────────────
async function openTankModal(tankId, tankName) {
  _curTankId = tankId; _curTankName = tankName;
  _editTankItemId = null;
  document.getElementById('m-tank-title').textContent = tankName + ' — Steel Repair Items';
  document.getElementById('m-tank-body').innerHTML =
    '<div style="text-align:center;padding:24px;color:var(--txt-m)">로딩 중…</div>';
  hideTankAddForm();
  openM('m-tank');
  if(!FLEET[VID].steel || !FLEET[VID].steel.length) {
    try { FLEET[VID].steel = await apiFetch(`${API}/vessels/${VID}/steel_repair`); } catch(e) {}
  }
  _renderTankModalBody();
}

let _editTankItemId  = null;   // 현재 편집 중인 Tank modal item ID
let _editPipeItemId  = null;   // 현재 편집 중인 Pipe modal item ID

// ── Steel inline edit helpers ─────────────────────────────────
function startTankItemEdit(id) { _editTankItemId = id; _renderTankModalBody(); }
function cancelTankItemEdit()  { _editTankItemId = null; _renderTankModalBody(); }

async function saveTankItemEdit(id) {
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
  const row = (FLEET[VID].steel||[]).find(r=>r.id===id);
  if(!row) return;
  const g = (sid) => document.getElementById(sid)?.value ?? row[sid.replace('te-','')]??'';

  const l = g('te-length_l'), w = g('te-width_w'), t = g('te-thickness_t');
  const calcWt = (!isNaN(+l)&&!isNaN(+w)&&!isNaN(+t)&&+l>0&&+w>0&&+t>0)
    ? (+l * +w * +t * 8.0 / 1000000).toFixed(2) : (row.new_weight||'');

  const updated = {
    ...row,
    description:     document.getElementById('te-description')?.value    ?? row.description,
    frame_no:        document.getElementById('te-frame_no')?.value        ?? row.frame_no,
    location_detail: document.getElementById('te-location_detail')?.value ?? row.location_detail,
    type:            document.getElementById('te-type')?.value             ?? row.type,
    steel_grade:     document.getElementById('te-steel_grade')?.value      ?? row.steel_grade,
    length_l:        l, width_w: w, thickness_t: t,
    new_weight:      document.getElementById('te-new_weight')?.value || calcWt,
    space_type:      document.getElementById('te-space_type')?.value       ?? row.space_type,
    priority:        document.getElementById('te-priority')?.value         ?? row.priority,
    status:          document.getElementById('te-status')?.value           ?? row.status,
    remark:          document.getElementById('te-remark')?.value           ?? row.remark,
  };
  setSS('saving');
  try {
    await apiFetch(`${API}/steel_repair/${id}`, 'PUT', updated);
    Object.assign(row, updated);
    // _tankPlanData 동기화
    const tp = _tankPlanData.find(r=>r.id===id);
    if(tp) Object.assign(tp, {priority:updated.priority, status:updated.status, new_weight:updated.new_weight});
    setSS('synced'); _editTankItemId = null; _renderTankModalBody();
    toast('저장됐습니다');
  } catch(e) { setSS('error'); toast('저장 실패: '+e.message, true); }
}

function _tankEditForm(item) {
  const esc = s => (s||'').replace(/"/g,'&quot;');
  const sel = (id, opts, val) =>
    `<select class="form-ctrl" id="${id}" style="font-size:11px">
      ${opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}
     </select>`;
  return `<div style="padding:10px 14px 12px;background:#f8fafc;border-top:1px solid var(--border)">
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group" style="flex:3">
        <label class="form-lbl">Description</label>
        <input class="form-ctrl" id="te-description" value="${esc(item.description)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Priority</label>
        ${sel('te-priority',['Normal','Urgent','Critical'],item.priority)}
      </div>
      <div class="form-group">
        <label class="form-lbl">Status</label>
        ${sel('te-status',['Not Started','In Progress','Completed','On Hold'],item.status)}
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group">
        <label class="form-lbl">Type</label>
        ${sel('te-type',['','Shell Plate','Stiffener','Longitudinal','Bulb Bar','Angle Bar','Flat Bar','Checked Plate','Web Plate','Other'],item.type)}
      </div>
      <div class="form-group">
        <label class="form-lbl">Grade</label>
        ${sel('te-steel_grade',['','A','B','AH32','AH36','DH32','EH32','Other'],item.steel_grade)}
      </div>
      <div class="form-group">
        <label class="form-lbl">Space Type</label>
        ${sel('te-space_type',['Open Space','Closed Space','DBT / FPT / Oil Tank','Dry Dock (Underwater)'],item.space_type)}
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group">
        <label class="form-lbl">Frame No.</label>
        <input class="form-ctrl" id="te-frame_no" value="${esc(item.frame_no)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Location</label>
        <input class="form-ctrl" id="te-location_detail" value="${esc(item.location_detail)}" style="font-size:11px">
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px;align-items:flex-end">
      <div class="form-group">
        <label class="form-lbl">L (mm)</label>
        <input class="form-ctrl" id="te-length_l" type="number" value="${item.length_l||''}" oninput="tankEditAutoWeight()" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">W (mm)</label>
        <input class="form-ctrl" id="te-width_w" type="number" value="${item.width_w||''}" oninput="tankEditAutoWeight()" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">T (mm)</label>
        <input class="form-ctrl" id="te-thickness_t" type="number" value="${item.thickness_t||''}" oninput="tankEditAutoWeight()" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">New Wt (kg)</label>
        <input class="form-ctrl" id="te-new_weight" type="number" value="${item.new_weight||''}" style="font-size:11px;color:var(--blue);font-weight:700">
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group" style="flex:1">
        <label class="form-lbl">Remark</label>
        <input class="form-ctrl" id="te-remark" value="${esc(item.remark)}" style="font-size:11px">
      </div>
    </div>
    <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:4px">
      <button class="btn-sec" style="font-size:11px" onclick="cancelTankItemEdit()">취소</button>
      <button class="btn-pri" style="font-size:11px" onclick="saveTankItemEdit(${item.id})">💾 저장</button>
    </div>
  </div>`;
}

function tankEditAutoWeight() {
  const l=+document.getElementById('te-length_l')?.value||0;
  const w=+document.getElementById('te-width_w')?.value||0;
  const t=+document.getElementById('te-thickness_t')?.value||0;
  const wt=document.getElementById('te-new_weight');
  if(wt&&l>0&&w>0&&t>0) wt.value=(l*w*t*8.0/1000000).toFixed(2);
}

function _renderTankModalBody() {
  const items = (FLEET[VID].steel||[]).filter(i => {
    if(!i.position_tank) return false;
    const pt=i.position_tank.replace(/\s+/g,'').toUpperCase();
    const tn=(_curTankName||'').replace(/\s+/g,'').toUpperCase();
    return pt.includes(tn)||tn.includes(pt);
  });
  const sum=document.getElementById('m-tank-summary');
  if(sum){
    const cr=items.filter(i=>i.priority==='Critical').length;
    const ug=items.filter(i=>i.priority==='Urgent').length;
    const dn=items.filter(i=>i.status==='Completed').length;
    sum.innerHTML=`<span style="font-size:12px;color:var(--txt-s)">총 <b style="color:var(--txt-h)">${items.length}</b>건
      ${cr?` · <span style="color:#ef4444">🔴 Critical <b>${cr}</b></span>`:''}
      ${ug?` · <span style="color:#d97706">🟡 Urgent <b>${ug}</b></span>`:''}
      ${dn?` · ✅ Completed <b style="color:var(--green)">${dn}</b>`:''}
    </span>`;
  }
  const body=document.getElementById('m-tank-body');
  if(!items.length){
    body.innerHTML=`<div style="text-align:center;padding:32px;color:var(--txt-m)">
      <div style="font-size:28px;margin-bottom:8px">🔧</div>
      <div>이 탱크에 등록된 Steel Repair 항목이 없습니다.</div>
      <div style="font-size:12px;margin-top:4px">아래 ＋ Add Item으로 추가하세요.</div>
    </div>`;
    return;
  }
  body.innerHTML=items.map((item,idx)=>{
    const isEditing = _editTankItemId === item.id;
    const ph=priorityBadge(item.priority||'Normal');
    const stCls=item.status==='Completed'?'c-closed':item.status==='Not Started'||!item.status?'c-open':'cat-badge cat-sh';
    const dims=[item.length_l,item.width_w,item.thickness_t].filter(Boolean);
    return `<div class="tank-item-row" style="flex-direction:column;align-items:stretch;padding:0">
      <div style="display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px 18px">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--blue);
                    font-weight:700;min-width:28px;padding-top:1px">${item.no||idx+1}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--txt-h);margin-bottom:4px">${item.description||'—'}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            ${ph}
            <span class="c-badge ${stCls}" style="font-size:10px">${item.status||'Not Started'}</span>
            ${item.type?`<span style="font-size:11px;color:var(--txt-s);background:var(--bg);padding:1px 6px;border-radius:4px">${item.type}</span>`:''}
            ${item.steel_grade?`<span style="font-size:11px;color:#7c3aed;background:#f5f3ff;padding:1px 6px;border-radius:4px;font-weight:600">${item.steel_grade}</span>`:''}
            ${dims.length?`<span style="font-size:11px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace">${dims.join('×')}mm</span>`:''}
            ${item.new_weight?`<span style="font-size:11px;color:var(--blue);font-family:'IBM Plex Mono',monospace;font-weight:600">${item.new_weight}kg</span>`:''}
          </div>
          ${item.frame_no?`<div style="font-size:11px;color:var(--txt-m);margin-top:3px">📐 Fr.${item.frame_no}${item.location_detail?' &nbsp;·&nbsp; '+item.location_detail:''}</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
          ${!isViewer() ? `<button class="btn-sec" style="font-size:11px;padding:4px 8px;white-space:nowrap;${isEditing?'background:var(--blue);color:white':''}"
                  onclick="${isEditing?'cancelTankItemEdit()':'startTankItemEdit('+item.id+')'}">
            ${isEditing?'✕ 닫기':'✎ 편집'}</button>` : ''}
          <button class="btn-sec" style="font-size:11px;padding:4px 8px;white-space:nowrap"
                  onclick="goToSteelItem(${item.id})">↗ 바로가기</button>
          <button class="btn-sec attach-btn" id="tattbtn-${item.id}"
                  style="font-size:11px;padding:4px 8px;${(FLEET[VID].attachSet||new Set()).has('steel:'+item.id)?'background:var(--blue);color:var(--white)':''}"
                  onclick="openGenAttach('steel',${item.id})">
            ${(FLEET[VID].attachSet||new Set()).has('steel:'+item.id)?'📎 +':'📎'}
          </button>
        </div>
      </div>
      ${isEditing ? _tankEditForm(item) : ''}
    </div>`;
  }).join('');
}

// 탱크 모달 → Steel Repair 탭 해당 행으로 바로가기
function goToSteelItem(itemId) {
  closeM('m-tank');

  const trigger = document.getElementById('trackingTriggerBtn');
  const menu    = document.getElementById('trackingMenu');
  if(trigger && menu) { trigger.classList.add('active'); menu.classList.add('open'); }
  document.querySelectorAll('.tracking-sub-btn').forEach(b => b.classList.remove('active'));
  const steelBtn = document.querySelector('.tracking-sub-btn[onclick*="steel"]');
  if(steelBtn) steelBtn.classList.add('active');

  // 하이라이트 대상 저장 (renderTracking 완료 후 적용됨)
  _highlightRowId  = String(itemId);
  _highlightRowKey = 'steel';

  // 해당 그룹만 펼치기 (데이터가 이미 로드된 경우)
  const item = (FLEET[VID]?.steel||[]).find(r => String(r.id)===String(itemId));
  if(item) {
    const grp = (item.position_tank||'').trim() || '(미지정)';
    if(!_trackingGroupCollapsed['steel']) _trackingGroupCollapsed['steel'] = new Set();
    _trackingGroupCollapsed['steel'].delete(grp);
  }

  showTab('steel', trigger);
}

function showTankAddForm() {
  document.getElementById('m-tank-addform').style.display='';
  document.getElementById('m-tank-addbtn').style.display='none';
  document.getElementById('m-tank-savebtn').style.display='';
  document.getElementById('m-tank-cancelbtn').style.display='';
  document.getElementById('m-tank-add-pos').value=_curTankName||'';
  setTimeout(()=>document.getElementById('m-tank-add-desc')?.focus(),50);
}

// L×W×T 입력 시 중량 자동계산
function tankAutoWeight() {
  const l = parseFloat(document.getElementById('m-tank-add-L')?.value);
  const w = parseFloat(document.getElementById('m-tank-add-W')?.value);
  const t = parseFloat(document.getElementById('m-tank-add-T')?.value);
  const wtEl = document.getElementById('m-tank-add-wt');
  if(!wtEl) return;
  if(!isNaN(l) && !isNaN(w) && !isNaN(t) && l>0 && w>0 && t>0) {
    wtEl.value = (l * w * t * 8.0 / 1000000).toFixed(2);
  }
}

function hideTankAddForm() {
  ['m-tank-addform'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});
  const ab=document.getElementById('m-tank-addbtn');if(ab)ab.style.display='';
  const sb=document.getElementById('m-tank-savebtn');if(sb)sb.style.display='none';
  const cb=document.getElementById('m-tank-cancelbtn');if(cb)cb.style.display='none';
  ['m-tank-add-desc','m-tank-add-frame','m-tank-add-loc',
   'm-tank-add-L','m-tank-add-W','m-tank-add-T','m-tank-add-wt'].forEach(id=>{
    const e=document.getElementById(id); if(e) e.value='';
  });
  const ts=document.getElementById('m-tank-add-type'); if(ts) ts.value='';
  const gs=document.getElementById('m-tank-add-grade'); if(gs) gs.value='';
  const ps=document.getElementById('m-tank-add-pri'); if(ps) ps.value='Normal';
}
async function saveTankItem() {
  if(isViewer()){toast('읽기 전용 계정입니다',true);return;}
  const desc=(document.getElementById('m-tank-add-desc')?.value||'').trim();
  if(!desc){toast('Description을 입력하세요',true);return;}
  const L  = document.getElementById('m-tank-add-L')?.value  || '';
  const W  = document.getElementById('m-tank-add-W')?.value  || '';
  const T  = document.getElementById('m-tank-add-T')?.value  || '';
  const wt = document.getElementById('m-tank-add-wt')?.value || '';
  // 해당 탱크의 기존 항목 수 기준으로 No. 자동 채번
  const existingItems = (FLEET[VID].steel||[]).filter(i => {
    if(!i.position_tank) return false;
    const pt=i.position_tank.replace(/\s+/g,'').toUpperCase();
    const tn=(_curTankName||'').replace(/\s+/g,'').toUpperCase();
    return pt.includes(tn)||tn.includes(pt);
  });
  const nextNo = String(existingItems.length + 1);
  const payload={
    no: nextNo, position_tank:_curTankName||'',
    frame_no:        (document.getElementById('m-tank-add-frame')?.value||'').trim(),
    location_detail: (document.getElementById('m-tank-add-loc')?.value||'').trim(),
    type:            document.getElementById('m-tank-add-type')?.value||'',
    steel_grade:     document.getElementById('m-tank-add-grade')?.value||'',
    length_l:        L, width_w: W, thickness_t: T,
    new_weight:      wt,
    description:     desc,
    priority:        document.getElementById('m-tank-add-pri')?.value||'Normal',
    status:          'Not Started',
    space_type:      'Closed Space', shape:'Flat',
    remark:'', start_date:'', completion_date:'',
  };
  setSS('saving');
  try {
    const n=await apiFetch(`${API}/vessels/${VID}/steel_repair`,'POST',payload);
    FLEET[VID].steel=[...(FLEET[VID].steel||[]),n];
    _tankPlanData=[..._tankPlanData,{id:n.id,no:n.no,position_tank:n.position_tank||_curTankName,
      priority:n.priority,status:n.status,description:n.description}];
    setSS('synced'); hideTankAddForm(); _renderTankModalBody();
    const wrap=document.getElementById('tank-svg-wrap');
    if(wrap&&_tankLayout) {
      const _cf=_makeColFn(_tankPlanData,'#dbeafe','#3b82f6','#1d4ed8');
      wrap.innerHTML=_svgFromLayout(_tankLayout,'openTankModal',_cf);
    }
    toast('Steel Repair 항목이 추가됐습니다');
  } catch(e){setSS('error');toast('추가 실패: '+e.message,true);}
}

// ── Tank Layout Editor ────────────────────────────────────────
function openTankLayoutEditor() {
  if(!_tankLayout) _tankLayout = _defaultVLCCLayout();
  _layoutEditing = JSON.parse(JSON.stringify(_tankLayout));
  _renderLayoutEditor();
  openM('m-tank-layout');
}

function _renderLayoutEditor() {
  const el = document.getElementById('m-tl-body');
  if(!el) return;
  const L = _layoutEditing;

  // 섹션의 현재 행 구성 판별
  const getSecMode = (sec) => {
    if(!sec.columns||!sec.columns.length) return 'ps';
    return sec.columns.some(col => col.c && typeof col.c==='object' && !col.c?.empty) ? 'pcs' : 'ps';
  };
  // 컬럼의 현재 레이아웃 모드
  const getColMode = (col) => {
    const isSpan = col.s===null && !(col.c && !col.c?.empty);
    if(isSpan) return 'span';
    const hasC = col.c && typeof col.c==='object' && !col.c?.empty;
    return hasC ? 'pcs' : 'ps';
  };

  let html = `<div style="display:flex;gap:16px;align-items:center;padding:10px 20px;
      border-bottom:1px solid var(--border);background:var(--bg-panel);flex-wrap:wrap">
    <span style="font-size:12px;font-weight:700;color:var(--txt-s)">표시 방향:</span>
    <label style="font-size:12px;cursor:pointer;display:flex;gap:6px;align-items:center">
      <input type="radio" name="tp-dir" value="aft-fwd" ${L.direction==='aft-fwd'?'checked':''}
             onchange="_layoutEditing.direction=this.value">
      <b>AFT</b> ← 좌측 &nbsp;·&nbsp; <b>FWD</b> → 우측
    </label>
    <label style="font-size:12px;cursor:pointer;display:flex;gap:6px;align-items:center">
      <input type="radio" name="tp-dir" value="fwd-aft" ${L.direction!=='aft-fwd'?'checked':''}
             onchange="_layoutEditing.direction=this.value">
      <b>FWD</b> ← 좌측 &nbsp;·&nbsp; <b>AFT</b> → 우측
    </label>
    <button class="btn-sec" style="font-size:11px;margin-left:auto" onclick="resetToDefaultLayout()">↺ VLCC 기본값</button>
  </div>`;

  L.sections.forEach((sec, si) => {
    const secMode = getSecMode(sec);
    html += `<div style="border-bottom:2px solid var(--border);padding:12px 20px">
      <!-- 섹션 헤더 -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
        <span style="font-size:10px;font-weight:700;color:var(--blue);min-width:56px;text-transform:uppercase">Section ${si+1}</span>
        <input class="fi" value="${(sec.label||'').replace(/"/g,'&quot;')}" placeholder="Section Label"
               style="flex:1;font-size:13px;font-weight:600;min-width:160px"
               onchange="_layoutEditing.sections[${si}].label=this.value">
        <input class="fi" value="${(sec.sublabel||'').replace(/"/g,'&quot;')}" placeholder="Sub Label"
               style="width:140px;font-size:12px"
               onchange="_layoutEditing.sections[${si}].sublabel=this.value">
        <!-- 섹션 기본 행 수 -->
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-size:11px;color:var(--txt-s)">기본 행:</span>
          <select class="fi" style="width:100px;font-size:11px" onchange="setSectionRowMode(${si},this.value)">
            <option value="ps"  ${secMode==='ps' ?'selected':''}>2행 (P/S)</option>
            <option value="pcs" ${secMode==='pcs'?'selected':''}>3행 (P/C/S)</option>
          </select>
        </div>
        ${L.sections.length>1?`<button class="edit-btn" style="color:var(--red)" onclick="deleteTankSection(${si})">✕ 삭제</button>`:''}
      </div>

      <!-- 컬럼 테이블 -->
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:540px">
          <thead>
            <tr style="background:var(--bg-panel)">
              <th style="padding:5px 6px;color:var(--txt-m);text-align:center;width:50px">이동</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:center;width:100px">행 구성</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:left">Port (P)</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:left">Center (C)</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:left">Stbd (S)</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:center;width:62px">폭(px)</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:center;width:68px">Type</th>
              <th style="padding:5px 6px;color:var(--txt-m);text-align:center;width:42px">클릭</th>
              <th style="width:28px"></th>
            </tr>
          </thead>
          <tbody>
            ${sec.columns.map((col, ci) => {
              const typ = col.p?.type || col.c?.type || col.s?.type || 'MISC';
              const colMode = getColMode(col);

              // 셀 이름 입력 헬퍼
              const cellInput = (field, tank, placeholder) => {
                if(!tank) return `<span style="font-size:10px;color:#cbd5e1;padding:0 4px">—</span>`;
                if(tank.empty)
                  return `<span style="display:inline-flex;align-items:center;gap:2px">
                    <span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-weight:600">EMPTY</span>
                    <button class="edit-btn" onclick="setTankCellEmpty(${si},${ci},'${field}',false)" title="해제">↺</button>
                  </span>`;
                return `<span style="display:inline-flex;align-items:center;gap:2px">
                  <input class="fi" style="width:84px;font-size:11px" value="${(tank.name||'').replace(/"/g,'&quot;')}"
                         placeholder="${placeholder}" onchange="updateColField(${si},${ci},'${field}',this.value)">
                  <button class="edit-btn" onclick="setTankCellEmpty(${si},${ci},'${field}',true)"
                          title="빈 공간" style="font-size:10px;color:#94a3b8">○</button>
                </span>`;
              };

              return `<tr style="border-top:1px solid var(--border)">
                <td style="padding:4px 6px;text-align:center">
                  <button class="edit-btn" onclick="moveTankCol(${si},${ci},-1)" ${ci===0?'style="opacity:.3"':''}>◄</button>
                  <button class="edit-btn" onclick="moveTankCol(${si},${ci},1)" ${ci===sec.columns.length-1?'style="opacity:.3"':''}>►</button>
                </td>
                <!-- 행 구성 드롭다운 -->
                <td style="padding:4px 6px;text-align:center">
                  <select class="fi" style="width:92px;font-size:11px" onchange="setColLayout(${si},${ci},this.value)">
                    <option value="span" ${colMode==='span'?'selected':''}>▣ SPAN</option>
                    <option value="ps"   ${colMode==='ps'  ?'selected':''}>P / S</option>
                    <option value="pcs"  ${colMode==='pcs' ?'selected':''}>P / C / S</option>
                  </select>
                </td>
                <td style="padding:4px 6px">${cellInput('p', col.p, 'Port명')}</td>
                <td style="padding:4px 6px">
                  ${colMode==='span' ? `<span style="font-size:10px;color:#cbd5e1">—</span>`
                  : colMode==='pcs'  ? cellInput('c', col.c, 'Center명')
                                     : `<span style="font-size:10px;color:#cbd5e1">—</span>`}
                </td>
                <td style="padding:4px 6px">
                  ${colMode==='span' ? `<span style="font-size:10px;color:#cbd5e1">—</span>`
                                     : cellInput('s', col.s, 'Stbd명')}
                </td>
                <td style="padding:4px 6px;text-align:center">
                  <input type="number" class="fi" style="width:54px;text-align:center;font-size:11px"
                         value="${col.w||100}" min="20" max="600"
                         onchange="updateColField(${si},${ci},'w',+this.value)">
                </td>
                <td style="padding:4px 6px;text-align:center">
                  <select class="fi" style="width:64px;font-size:11px" onchange="updateColField(${si},${ci},'type',this.value)">
                    ${['COT','WBT','DBT','SLOP','FOT','FPT','APT','ER','MISC'].map(t=>
                      `<option ${typ===t?'selected':''}>${t}</option>`
                    ).join('')}
                  </select>
                </td>
                <td style="padding:4px 6px;text-align:center">
                  <input type="checkbox" ${col.p?.cl||col.c?.cl||col.s?.cl?'checked':''}
                         onchange="updateColField(${si},${ci},'cl',this.checked)">
                </td>
                <td style="padding:4px 6px">
                  <button class="edit-btn" style="color:var(--red)" onclick="deleteTankCol(${si},${ci})">✕</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <button class="btn-sec" style="font-size:11px;margin-top:8px" onclick="addTankCol(${si})">＋ 열 추가</button>
    </div>`;
  });

  html += `<div style="padding:12px 20px">
    <button class="btn-sec" style="font-size:12px" onclick="addTankSection()">＋ 섹션 추가</button>
  </div>`;
  el.innerHTML = html;
}

function resetToDefaultLayout() {
  if(!confirm('VLCC 기본 레이아웃으로 초기화하시겠습니까?')) return;
  _layoutEditing = _defaultVLCCLayout();
  _renderLayoutEditor();
  toast('VLCC 기본 레이아웃으로 초기화됐습니다');
}
function moveTankCol(si, ci, dir) {
  const cols=_layoutEditing.sections[si].columns;
  const ni=ci+dir; if(ni<0||ni>=cols.length) return;
  [cols[ci],cols[ni]]=[cols[ni],cols[ci]];
  _renderLayoutEditor();
}
function updateColField(si, ci, field, value) {
  const col=_layoutEditing.sections[si].columns[ci];
  if(field==='p'){if(!col.p)col.p={id:'',name:'',type:'MISC',cl:true};col.p.name=value;col.p.id=value.replace(/\s+/g,'').toUpperCase();}
  else if(field==='c'){if(!col.c)col.c={id:'',name:'',type:'MISC',cl:true};col.c.name=value;col.c.id=value.replace(/\s+/g,'').toUpperCase();}
  else if(field==='s'){if(!col.s)col.s={id:'',name:'',type:'MISC',cl:true};col.s.name=value;col.s.id=value.replace(/\s+/g,'').toUpperCase();}
  else if(field==='w'){col.w=value||100;}
  else if(field==='type'){if(col.p)col.p.type=value;if(col.c)col.c.type=value;if(col.s)col.s.type=value;}
  else if(field==='cl'){if(col.p)col.p.cl=value;if(col.c)col.c.cl=value;if(col.s)col.s.cl=value;}
}
// 컬럼 행 구성 드롭다운 변경
function setColLayout(si, ci, mode) {
  const col  = _layoutEditing.sections[si].columns[ci];
  const typ  = col.p?.type || col.c?.type || col.s?.type || 'MISC';
  const base = (col.p?.name||'Tank').replace(/[\sPCS]+$/,'').trim();
  const mk   = (sfx) => ({id:(base+sfx).replace(/\s+/g,'').toUpperCase(), name:base+' '+sfx, type:typ, cl:true});
  if(mode==='span'){
    col.s = null;
    col.c = null;
    if(!col.p) col.p = mk('P');
  } else if(mode==='ps'){
    col.c = null;
    if(!col.p) col.p = mk('P');
    if(!col.s || col.s===null) col.s = mk('S');
  } else if(mode==='pcs'){
    if(!col.p) col.p = mk('P');
    if(!col.c || col.c===null) col.c = mk('C');
    if(!col.s || col.s===null) col.s = mk('S');
  }
  _renderLayoutEditor();
}

// 섹션 기본 행 수 변경 — 전체 컬럼에 적용
function setSectionRowMode(si, mode) {
  const sec = _layoutEditing.sections[si];
  sec.columns.forEach((col, ci) => {
    const isSpan = col.s===null && !(col.c && !col.c?.empty);
    if(isSpan) return; // SPAN 컬럼은 유지
    setColLayout(si, ci, mode);
  });
  _renderLayoutEditor();
}

function addTankCol(si) {
  const sec    = _layoutEditing.sections[si];
  // 섹션의 현재 기본 행 수 자동 반영
  const hasPCS = sec.columns.some(c => c.c && typeof c.c==='object' && !c.c?.empty);
  const n = Date.now();
  _layoutEditing.sections[si].columns.push({
    id:'c_'+n, w:130,
    p:{id:'NEWP'+n, name:'New P', type:'MISC', cl:true},
    c: hasPCS ? {id:'NEWC'+n, name:'New C', type:'MISC', cl:true} : null,
    s:{id:'NEWS'+n, name:'New S', type:'MISC', cl:true},
  });
  _renderLayoutEditor();
}
function deleteTankCol(si, ci) {
  _layoutEditing.sections[si].columns.splice(ci,1);
  _renderLayoutEditor();
}
function addTankSection() {
  _layoutEditing.sections.push({id:'sec_'+Date.now(),label:'새 섹션',sublabel:'',columns:[]});
  _renderLayoutEditor();
}
// 레이아웃에서 모든 탱크를 {id → name} 맵으로 평탄화
function _flattenTankNames(layout) {
  const map = {};
  (layout.sections||[]).forEach(sec => {
    (sec.columns||[]).forEach(col => {
      ['p','c','s'].forEach(f => {
        const t = col[f];
        if(t && !t.empty && t.id && t.name) map[t.id] = t.name;
      });
    });
  });
  return map;
}

async function saveTankLayoutToDb() {
  setSS('saving');
  try {
    // ── 탱크명 변경 감지 ──────────────────────────────────────
    const renames = [];
    if(_tankLayout) {
      const oldNames = _flattenTankNames(_tankLayout);
      const newNames = _flattenTankNames(_layoutEditing);
      for(const [id, newName] of Object.entries(newNames)) {
        const oldName = oldNames[id];
        if(oldName && oldName !== newName)
          renames.push({old: oldName, new: newName});
      }
    }

    // ── 레이아웃 저장 ─────────────────────────────────────────
    await apiFetch(`${API}/vessels/${VID}/tank_layout`, 'PUT', _layoutEditing);
    _tankLayout = JSON.parse(JSON.stringify(_layoutEditing));

    // ── position_tank 자동 업데이트 ───────────────────────────
    if(renames.length) {
      const result = await apiFetch(`${API}/vessels/${VID}/position_rename`, 'PUT', renames).catch(()=>null);
      const updated = result?.updated || 0;
      // 메모리 동기화
      const renameMap = Object.fromEntries(renames.map(r=>[r.old, r.new]));
      [FLEET[VID]?.steel, FLEET[VID]?.pipe, _tankPlanData, _pipePlanData].forEach(arr => {
        (arr||[]).forEach(item => {
          if(item.position_tank && renameMap[item.position_tank])
            item.position_tank = renameMap[item.position_tank];
        });
      });
      const names = renames.map(r=>`"${r.old}"→"${r.new}"`).join(', ');
      toast(`저장 완료 · ${names}${updated?' · DB '+updated+'건 자동 업데이트':''}`);
    } else {
      toast('레이아웃이 저장됐습니다');
    }

    setSS('synced');
    closeM('m-tank-layout');
    const tw = document.getElementById('tank-svg-wrap');
    if(tw) tw.innerHTML = _svgFromLayout(_tankLayout, 'openTankModal', _tankCol);
    const pw = document.getElementById('pipe-svg-wrap');
    if(pw) pw.innerHTML = _svgFromLayout(_tankLayout, 'openPipeModal', _pipePlanCol);

  } catch(e) { setSS('error'); toast('저장 실패: '+e.message, true); }
}

// ══ PLAN DOCUMENTS (GA / Repair Plan) ════════════════════════
// ref_id 규칙: GA=0(공유), Tank Repair Plan=1, Pipe Repair Plan=2
const PLAN_DOC_CFG = {
  ga:           { ref_type:'vessel_ga',   ref_id:0, title:'📐 General Arrangement (GA)', btnTank:'btn-ga-tank',   btnPipe:'btn-ga-pipe'   },
  tank_repair:  { ref_type:'vessel_plan', ref_id:1, title:'📋 Tank Repair Plan',          btnTank:'btn-rp-tank',   btnPipe:null            },
  pipe_repair:  { ref_type:'vessel_plan', ref_id:2, title:'📋 Pipe Repair Plan',          btnTank:null,            btnPipe:'btn-rp-pipe'   },
  wps:          { ref_type:'vessel_wps',  ref_id:0, title:'🔥 Welding Procedure Spec (WPS)', btnTank:'btn-wps-tank', btnPipe:null          },
};
let _curPlanDocKey = null;

async function openPlanDoc(docKey) {
  if(!VID) return;
  _curPlanDocKey = docKey;
  const cfg = PLAN_DOC_CFG[docKey];
  document.getElementById('m-plan-doc-title').textContent = cfg.title;
  document.getElementById('m-plan-doc-body').innerHTML =
    '<div style="text-align:center;padding:24px;color:var(--txt-m)">로딩 중…</div>';

  // 뷰어는 업로드 버튼 숨김
  const footer = document.getElementById('m-plan-doc-footer');
  if(footer) footer.querySelector('label').style.display = isViewer() ? 'none' : '';

  openM('m-plan-doc');
  await _loadPlanDocList();
}

async function _loadPlanDocList() {
  const cfg = PLAN_DOC_CFG[_curPlanDocKey];
  const files = await apiFetch(`${API}/vessels/${VID}/attachments/${cfg.ref_type}/${cfg.ref_id}`)
    .catch(()=>[]);
  _renderPlanDocList(files || []);
  _updatePlanDocBtn(_curPlanDocKey, (files||[]).length);
}

function _renderPlanDocList(files) {
  const body = document.getElementById('m-plan-doc-body');
  if(!files.length) {
    body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--txt-m)">
      <div style="font-size:36px;margin-bottom:10px">📂</div>
      <div style="font-size:13px">업로드된 문서가 없습니다.</div>
      <div style="font-size:12px;color:var(--txt-s);margin-top:4px">하단 버튼으로 파일을 업로드하세요.</div>
    </div>`;
    return;
  }
  body.innerHTML = files.map(f => {
    const ext  = (f.filename||'').split('.').pop().toLowerCase();
    const icon = f.mimetype?.startsWith('image/') ? '🖼️'
               : f.mimetype==='application/pdf'    ? '📄'
               : ['xlsx','xls','xlsm'].includes(ext) ? '📊'
               : ['docx','doc'].includes(ext)        ? '📝' : '📁';
    const size = f.filesize ? (f.filesize >= 1024*1024
      ? (f.filesize/1024/1024).toFixed(1)+' MB'
      : (f.filesize/1024).toFixed(0)+' KB') : '';
    const canPreview = f.mimetype?.startsWith('image/') || f.mimetype==='application/pdf';
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid var(--border)">
      <span style="font-size:28px;flex-shrink:0">${icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--txt-h);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.filename}</div>
        <div style="font-size:11px;color:var(--txt-m);margin-top:2px">${size}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        ${canPreview ? `<button class="btn-sec" style="font-size:11px;padding:4px 10px"
          onclick="previewJobAttach(${f.id},'${f.mimetype}','${f.filename}')">👁 미리보기</button>` : ''}
        <a class="btn-sec" style="font-size:11px;padding:4px 10px;text-decoration:none"
           href="/api/attachments/${f.id}">⬇ 다운로드</a>
        ${!isViewer() ? `<button class="btn-sec" style="font-size:11px;padding:4px 10px;color:var(--red)"
          onclick="deletePlanDoc(${f.id})">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function _updatePlanDocBtn(docKey, count) {
  if(docKey === 'wps') return;  // WPS 버튼은 별도 관리
  const cfg = PLAN_DOC_CFG[docKey];
  [cfg.btnTank, cfg.btnPipe].filter(Boolean).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if(!btn) return;
    btn.style.background = count > 0 ? 'var(--blue)' : '';
    btn.style.color      = count > 0 ? 'var(--white)' : '';
    btn.style.fontWeight = count > 0 ? '700' : '';
    const label = docKey === 'ga' ? '📐 GA' : '📋 Repair Plan';
    btn.textContent = count > 0 ? `${label} (${count})` : label;
  });
}

async function uploadPlanDoc(input) {
  if(!VID || !input.files.length || !_curPlanDocKey) return;
  const cfg = PLAN_DOC_CFG[_curPlanDocKey];
  const formData = new FormData();
  for(const f of input.files) formData.append('files', f);
  setSS('saving');
  try {
    await fetch(`${API}/vessels/${VID}/attachments/${cfg.ref_type}/${cfg.ref_id}`,
      {method:'POST', body:formData});
    await _loadPlanDocList();
    setSS('synced'); toast(`${input.files.length}개 파일 업로드 완료`);
  } catch(e) { setSS('error'); toast('업로드 실패: '+e.message, true); }
  input.value = '';
}

async function deletePlanDoc(aid) {
  if(!confirm('파일을 삭제하시겠습니까?')) return;
  setSS('saving');
  try {
    await apiFetch(`${API}/attachments/${aid}`, 'DELETE');
    await _loadPlanDocList();
    setSS('synced'); toast('삭제됐습니다');
  } catch(e) { setSS('error'); toast('삭제 실패: '+e.message, true); }
}

// 탭 로드 시 버튼 뱃지 초기화
async function _initPlanDocBadges() {
  if(!VID) return;
  for(const [docKey, cfg] of Object.entries(PLAN_DOC_CFG)) {
    try {
      const files = await apiFetch(
        `${API}/vessels/${VID}/attachments/${cfg.ref_type}/${cfg.ref_id}`);
      _updatePlanDocBtn(docKey, (files||[]).length);
    } catch(e) {}
  }
}

// ══ WPS FIT-UP INSPECTOR ════════════════════════════════════════

let _wpsJoint    = 'butt';
let _wpsCriteria = null;

// ── 기본값 (AWS D1.1 / 일반 조선 관행) ─────────────────────────
const WPS_DEFAULT_CRITERIA = {
  butt: {
    no_backing: {
      root_gap_min:0, root_gap_max:4,
      groove_min:55,  groove_max:75,
    },
    backing_cases: [
      { label:'Case 1', rg_min:0, rg_max:3,  groove_min:55, groove_max:75 },
      { label:'Case 2', rg_min:3, rg_max:10, groove_min:40, groove_max:55 },
    ],
    preheat:[{t_max:20,temp:5},{t_max:40,temp:50},{t_max:60,temp:100},{t_max:999,temp:150}],
  },
  fillet: {
    no_backing: {
      root_gap_min:0, root_gap_max:1.5,
      groove_min:0,   groove_max:90,
    },
    backing_cases: [
      { label:'Case 1', rg_min:0, rg_max:3,  groove_min:45, groove_max:75 },
      { label:'Case 2', rg_min:3, rg_max:8,  groove_min:35, groove_max:55 },
    ],
    preheat:[{t_max:20,temp:5},{t_max:40,temp:50},{t_max:60,temp:100},{t_max:999,temp:150}],
  },
};

function _getCrit(joint) {
  return (_wpsCriteria?.[joint]) ?? WPS_DEFAULT_CRITERIA[joint];
}

function _matchBackingCase(joint, rg) {
  const cases = _getCrit(joint)?.backing_cases;
  if(!cases?.length) return null;
  const sorted = [...cases].sort((a,b)=>(a.rg_max??99)-(b.rg_max??99));
  for(const c of sorted) { if(rg <= (c.rg_max??99)) return c; }
  return sorted[sorted.length-1];
}

// 개선각 계산 공식: 2 × atan((끝단갭 - 루트갭) / (2 × T))
function calcGrooveAngle(t, rg, fg) {
  if(t<=0 || fg<rg) return null;
  return +(Math.atan2((fg-rg)/2, t) * 2 * 180/Math.PI).toFixed(1);
}

// 개선각으로 끝단갭 역산: fg = rg + 2 × T × tan(angle/2 × π/180)
function calcFaceGap(t, rg, angleDeg) {
  if(t<=0) return null;
  return +(rg + 2*t*Math.tan(angleDeg/2*Math.PI/180)).toFixed(1);
}

const WPS_PROCESS_OPTS = [
  {val:'SMAW', label:'SMAW — 피복 아크 용접 (일반 봉용접)'},
  {val:'FCAW', label:'FCAW — 플럭스 코어드 아크 용접 (반자동)'},
  {val:'GMAW', label:'GMAW — MIG/MAG 용접 (가스 금속 아크)'},
  {val:'SAW',  label:'SAW  — 서브머지드 아크 용접 (자동, 수평)'},
  {val:'GTAW', label:'GTAW — TIG 용접 (불활성 가스 텅스텐)'},
];

function openWpsModal() {
  if(!VID) return;
  _wpsJoint = 'butt';
  openM('m-wps');
  switchWpsTab('files');
  _loadWpsFiles();
  apiFetch(`${API}/vessels/${VID}/wps_criteria`)
    .then(d => { if(d) _wpsCriteria = d; }).catch(()=>{});
}

function switchWpsTab(tab) {
  ['files','calc','crit'].forEach(t => {
    const p = document.getElementById('wps-panel-'+t);
    const b = document.getElementById('wps-tab-'+t);
    if(p) p.style.display = t===tab ? '' : 'none';
    if(b) { b.style.borderBottom = t===tab ? '2px solid var(--blue)' : '2px solid transparent'; b.style.fontWeight = t===tab?'700':'400'; }
  });
  if(tab==='calc')  { _renderWpsInputs(); _renderWpsCalcResult(null); }
  if(tab==='files') { _loadWpsFiles(); document.getElementById('wps-upload-lbl').style.display=isViewer()?'none':''; }
  if(tab==='crit')  { _renderWpsCritUI(); }
}

function setWpsJoint(joint) {
  _wpsJoint = joint;
  document.querySelectorAll('.wps-joint-btn').forEach(b => {
    b.style.background = b.dataset.joint===joint ? 'var(--blue)' : '';
    b.style.color      = b.dataset.joint===joint ? 'var(--white)' : '';
  });
  _renderWpsInputs();
  _renderWpsCalcResult(null);
}

// ── 계산기 입력폼 ────────────────────────────────────────────
function _renderWpsInputs() {
  const j = _wpsJoint;
  const procOpts = WPS_PROCESS_OPTS.map(o=>`<option value="${o.val}">${o.label}</option>`).join('');
  const N = (id,label,ph,fn='') =>
    `<div class="form-group"><label class="form-lbl">${label}</label>
     <input class="form-ctrl" id="${id}" type="number" step="0.1" min="0" placeholder="${ph}"
            ${fn?`oninput="${fn}"`:''}>
     </div>`;

  const t2Row = `<div class="form-group">
    <label class="form-lbl">부재 두께 T₂ (mm)
      <label style="font-size:10px;font-weight:400;color:var(--txt-m);margin-left:8px;cursor:pointer">
        <input type="checkbox" id="wps_t2_diff" onchange="toggleWpsT2(this.checked)"
               style="width:11px;height:11px;vertical-align:middle"> 주재와 다름
      </label></label>
    <input class="form-ctrl" id="wps_t2" type="number" step="0.1" min="0" disabled
           placeholder="주재와 동일" style="color:var(--txt-m);background:var(--bg-panel)"
           oninput="_autoGroove()">
  </div>`;

  const backingRow = `<div class="form-group" style="grid-column:1/-1">
    <label class="form-lbl">뒷댐재 (Backing)</label>
    <select class="form-ctrl" id="wps_backing" onchange="_onBackingChange()">
      <option value="none">없음 (No Backing)</option>
      <option value="ceramic">Chill Plate / Ceramic Backing</option>
      <option value="steel">Steel Backing Bar</option>
      <option value="flux">Flux / Tape Backing</option>
    </select>
  </div>`;

  const groovePreview = `<div id="wps-groove-preview" style="grid-column:1/-1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;font-size:12px;color:#1e3a8a;min-height:36px">
    T₁, 루트 간격, 개선 끝단 갭을 입력하면 개선각이 자동 계산됩니다.
  </div>`;

  let html = '';
  if(j==='butt') {
    html = N('wps_t1','모재 두께 T₁ (mm) *','주재 두께','_autoGroove()') + t2Row
         + backingRow
         + N('wps_root_gap','루트 간격 Root Gap (mm)','0','_autoGroove()')
         + N('wps_face_gap','개선 끝단 갭 Face Gap (mm)','개선 상단 열린 거리','_autoGroove()')
         + groovePreview
         + `<div class="form-group" style="grid-column:1/-1">
              <label class="form-lbl">용접 방법</label>
              <select class="form-ctrl" id="wps_process">${procOpts}</select>
            </div>`;
  } else {
    html = N('wps_t1','모재 두께 T₁ (mm) *','주재 두께','_autoGroove()')
         + t2Row + backingRow
         + N('wps_gap','루트 간격 Root Gap (mm)','0','_autoGroove()')
         + N('wps_face_gap','개선 끝단 갭 Face Gap (mm)','개선 상단 열린 거리','_autoGroove()')
         + groovePreview
         + `<div class="form-group" style="grid-column:1/-1">
              <label class="form-lbl">용접 방법</label>
              <select class="form-ctrl" id="wps_process">${procOpts}</select>
            </div>`;
  }
  document.getElementById('wps-inputs').innerHTML = html;
}

function _onBackingChange() { _autoGroove(); }

function toggleWpsT2(enabled) {
  const el = document.getElementById('wps_t2');
  if(!el) return;
  el.disabled = !enabled;
  el.style.color = enabled?'':'var(--txt-m)';
  el.style.background = enabled?'':'var(--bg-panel)';
  el.placeholder = enabled?'부재 두께 입력':'주재와 동일';
  if(!enabled) el.value='';
  _autoGroove();
}

function _valT2() {
  const diff = document.getElementById('wps_t2_diff');
  return (diff?.checked) ? (_val('wps_t2')||_val('wps_t1')) : _val('wps_t1');
}

// ── 개선각 실시간 미리보기 ───────────────────────────────────
function _autoGroove() {
  const el = document.getElementById('wps-groove-preview');
  if(!el) return;
  const t  = _val('wps_t1');
  const rg = _wpsJoint==='fillet' ? _val('wps_gap') : _val('wps_root_gap');
  const fg = _val('wps_face_gap');
  const backing = document.getElementById('wps_backing')?.value || 'none';

  if(!t) { el.innerHTML='T₁을 먼저 입력하세요.'; el.style.cssText='background:#eff6ff;border-color:#bfdbfe;color:#1e3a8a;grid-column:1/-1;border-radius:6px;padding:8px 12px;font-size:12px;'; return; }

  // 기준 결정
  let gMin, gMax, rgMin, rgMax, fgMin, fgMax, caseLabel='';
  if(backing === 'none') {
    const nb = _getCrit('butt')?.no_backing || WPS_DEFAULT_CRITERIA.butt.no_backing;
    gMin=nb.groove_min??55; gMax=nb.groove_max??75;
    rgMin=nb.root_gap_min??0; rgMax= t<=25 ? (nb.root_gap_max??4) : (nb.root_gap_max_thick??6);
    fgMin=fgMax=null;
    caseLabel='No Backing';
  } else {
    const rule = _matchBackingCase('butt', rg);
    if(!rule) { el.innerHTML='⚠ 루트갭에 맞는 Backing Rule이 없습니다. WPS 기준 탭 확인.'; return; }
    gMin=rule.groove_min??55; gMax=rule.groove_max??75;
    rgMin=rule.root_gap_min??0; rgMax=rule.root_gap_max??10;
    fgMin=rule.face_gap_min??null; fgMax=rule.face_gap_max??null;
    caseLabel=`${backing==='ceramic'?'Ceramic':'Steel/Flux'} Backing — ${rule.label} (루트갭 ${rule.rg_min??0}~${rule.rg_max}mm)`;
    // 개선각 기준으로 끝단갭 범위 역산
    if(t>0 && !fgMin && gMin) fgMin = calcFaceGap(t, rgMin, gMin);
    if(t>0 && !fgMax && gMax) fgMax = calcFaceGap(t, rgMax, gMax);
  }

  // 루트갭 체크
  const rgOk = rg>=rgMin && rg<=rgMax;
  // 개선각 + 끝단갭 체크
  let angleOk=null, calcAngle=null;
  if(fg>0) {
    if(fg<rg) { el.innerHTML='⚠ 끝단 갭이 루트 간격보다 작습니다.'; el.style.background='#fef9c3'; el.style.borderColor='#fde047'; el.style.color='#854d0e'; return; }
    calcAngle = calcGrooveAngle(t, rg, fg);
    angleOk = calcAngle>=gMin && calcAngle<=gMax;
  }

  const ok = rgOk && (angleOk===null ? true : angleOk);
  const bg = ok?'#f0fdf4':'#fef2f2', bc=ok?'#86efac':'#fca5a5', co=ok?'#166534':'#991b1b';
  el.style.cssText=`background:${bg};border:1px solid ${bc};border-radius:6px;padding:8px 12px;font-size:12px;color:${co};grid-column:1/-1;`;

  const rgRange = `루트갭 허용: <b>${rgMin}~${rgMax}mm</b> → ${rgOk?'✅':'❌'} ${rg}mm`;
  const gRange  = `개선각 허용: <b>${gMin}~${gMax}°</b>`;
  const fgRange = fgMin&&fgMax ? ` &nbsp;|&nbsp; 끝단갭 역산: <b>${fgMin}~${fgMax}mm</b>` : '';
  const calcLine = calcAngle!==null
    ? ` &nbsp;|&nbsp; 계산각: <b>${calcAngle}°</b> → ${angleOk?'✅':'❌'}`
    : '';
  el.innerHTML = `<b>${caseLabel}</b><br>${rgRange} &nbsp;|&nbsp; ${gRange}${fgRange}${calcLine}
    ${calcAngle!==null?`<br><span style="font-size:10px;opacity:.75">2×atan((${fg}-${rg})/(2×${t})) = ${calcAngle}°</span>`:''}`;
}

function _val(id){ return parseFloat(document.getElementById(id)?.value)||0; }
function _sel(id){ return document.getElementById(id)?.value||''; }

// ── 판정 실행 ────────────────────────────────────────────────
function runWpsCalc() {
  const joint = _wpsJoint;
  const results = [];
  const pass=(l,m,lim,u='mm',d='')=>results.push({pass:true, label:l,measured:m,limit:lim,unit:u,detail:d});
  const fail=(l,m,lim,u='mm',d='')=>results.push({pass:false,label:l,measured:m,limit:lim,unit:u,detail:d});
  const warn=(l,m,lim,u='mm',d='')=>results.push({pass:'warn',label:l,measured:m,limit:lim,unit:u,detail:d});
  const info=(l,v,u='',d='')      =>results.push({pass:'info',label:l,measured:v,limit:'',unit:u,detail:d});

  const backing = document.getElementById('wps_backing')?.value || 'none';
  const process = _sel('wps_process').split(' ')[0];
  const crit    = _getCrit(joint);

  if(joint==='butt') {
    const t1=_val('wps_t1'), t2=_valT2(), tMax=Math.max(t1,t2);
    const rg=_val('wps_root_gap'), fg=_val('wps_face_gap');

    let rgMin, rgMax, gMin, gMax, fgMin, fgMax;
    if(backing==='none') {
      const nb = crit?.no_backing || WPS_DEFAULT_CRITERIA.butt.no_backing;
      rgMin=nb.root_gap_min??0; rgMax=tMax<=25?(nb.root_gap_max??4):(nb.root_gap_max_thick??6);
      gMin=nb.groove_min??55; gMax=nb.groove_max??75;
      fgMin=null; fgMax=null;
      info('뒷댐재','없음 (No Backing)','','');
    } else {
      const rule = _matchBackingCase('butt', rg);
      if(!rule) { warn('뒷댐재',backing,'','','루트갭에 맞는 Rule 없음 — WPS 기준 탭 확인'); _renderWpsCalcResult(results); return; }
      rgMin=rule.root_gap_min??0; rgMax=rule.root_gap_max??10;
      gMin=rule.groove_min??40; gMax=rule.groove_max??75;
      fgMin=rule.face_gap_min??null; fgMax=rule.face_gap_max??null;
      if(t1>0 && !fgMin) fgMin=calcFaceGap(t1,rgMin,gMin);
      if(t1>0 && !fgMax) fgMax=calcFaceGap(t1,rgMax,gMax);
      info('뒷댐재',`${backing==='ceramic'?'Ceramic':'Steel/Flux'} — ${rule.label}`,'',rule.note||'');
    }

    // 루트 간격
    if(rg>=rgMin&&rg<=rgMax) pass('루트 간격 Root Gap',rg,`${rgMin}~${rgMax}`,'mm');
    else                      fail('루트 간격 Root Gap',rg,`${rgMin}~${rgMax}`,'mm');

    // 개선 끝단 갭
    if(fg>0) {
      const limStr = fgMin&&fgMax ? `${fgMin}~${fgMax}` : '—';
      if(fgMin&&fgMax) {
        if(fg>=fgMin&&fg<=fgMax) pass('개선 끝단 갭 Face Gap',fg,limStr,'mm');
        else                      fail('개선 끝단 갭 Face Gap',fg,limStr,'mm');
      }
      // 개선각
      const angle = calcGrooveAngle(t1,rg,fg);
      if(angle!==null) {
        if(angle>=gMin&&angle<=gMax) pass('개선각 (총)',angle,`${gMin}~${gMax}`,'°',`2×atan((${fg}-${rg})/(2×${t1}))`);
        else                         fail('개선각 (총)',angle,`${gMin}~${gMax}`,'°');
      }
    }

    // Hi-Lo

    if(document.getElementById('wps_t2_diff')?.checked && t1!==t2) {
      const d=Math.abs(t1-t2); info(`두께 차이`,d.toFixed(1),'mm',d>3?'⚠ 테이퍼 필요':'OK');
    }
    const ph=_getPreheat(tMax,process,crit?.preheat); info(`예열 온도 (${process},t=${tMax}mm)`,ph.temp,'°C 이상',ph.note);

  } else { // fillet
    const t1=_val('wps_t1'), t2=_valT2(), tMax=Math.max(t1,t2);
    const gap=_val('wps_gap');
    const fg =_val('wps_face_gap')||0;

    if(backing==='none') {
      const nb = crit?.no_backing || WPS_DEFAULT_CRITERIA.fillet.no_backing;
      const rgMin=nb.root_gap_min??0, rgMax=nb.root_gap_max??1.5;
      const gMin=nb.groove_min??0,    gMax=nb.groove_max??90;
      info('뒷댐재','없음 (No Backing)','','');
      if(gap>=rgMin&&gap<=rgMax) pass('루트 간격',gap,`${rgMin}~${rgMax}`,'mm');
      else                       fail('루트 간격',gap,`${rgMin}~${rgMax}`,'mm');
      if(fg>0 && t1>0) {
        const angle=calcGrooveAngle(t1,gap,fg);
        if(angle!==null) {
          if(angle>=gMin&&angle<=gMax) pass('개선각 (총)',angle,`${gMin}~${gMax}`,'°');
          else                         fail('개선각 (총)',angle,`${gMin}~${gMax}`,'°');
        }
      }
    } else {
      const rule = _matchBackingCase('fillet', gap);
      if(!rule) { warn('뒷댐재',backing,'','','루트갭에 맞는 Rule 없음'); _renderWpsCalcResult(results); return; }
      const rgMin=rule.rg_min??0, rgMax=rule.rg_max??99;
      const gMin=rule.groove_min??0, gMax=rule.groove_max??90;
      info('뒷댐재',`${backing==='ceramic'?'Ceramic':'Steel/Flux'} — ${rule.label}`,'','');
      if(gap>=rgMin&&gap<=rgMax) pass('루트 간격',gap,`${rgMin}~${rgMax}`,'mm');
      else                       fail('루트 간격',gap,`${rgMin}~${rgMax}`,'mm');
      if(fg>0 && t1>0) {
        const angle=calcGrooveAngle(t1,gap,fg);
        if(angle!==null) {
          if(angle>=gMin&&angle<=gMax) pass('개선각 (총)',angle,`${gMin}~${gMax}`,'°');
          else                         fail('개선각 (총)',angle,`${gMin}~${gMax}`,'°');
        }
      }
    }
    const ph=_getPreheat(tMax,process,crit?.preheat); info(`예열 온도 (${process},t=${tMax}mm)`,ph.temp,'°C 이상',ph.note);
  }

  _renderWpsCalcResult(results);
}

function _getPreheat(tMax,process,phArr){
  const arr=phArr||WPS_DEFAULT_CRITERIA.butt.preheat;
  for(const r of arr){if(tMax<=r.t_max)return{temp:r.temp,note:`예열 ${r.temp}°C 이상`};}
  return{temp:150,note:'예열 150°C 이상 (고두께)'};
}

function _renderWpsCalcResult(results) {
  const el = document.getElementById('wps-result');
  if(!el) return;
  if(!results){el.style.display='none';return;}
  const hasFail=results.some(r=>r.pass===false), hasWarn=results.some(r=>r.pass==='warn');
  const[oBg,oCol,oIcon,oText]=hasFail?['#fee2e2','#991b1b','❌','FAIL — 재작업 필요']:
    hasWarn?['#fef9c3','#854d0e','⚠️','MARGINAL — 조건부 허용']:
    ['#dcfce7','#166534','✅','PASS — 용접 진행 가능'];
  const rows=results.map(r=>{
    const ic=r.pass===true?'✅':r.pass===false?'❌':r.pass==='warn'?'⚠️':'ℹ️';
    const bg=r.pass===false?'#fff1f2':r.pass==='warn'?'#fefce8':'';
    return`<tr style="background:${bg}">
      <td style="padding:5px 8px">${ic}</td>
      <td style="padding:5px 8px;font-size:12px;font-weight:600">${r.label}</td>
      <td style="padding:5px 8px;font-size:12px;font-family:'IBM Plex Mono',monospace;color:var(--blue);font-weight:700">${r.measured}${r.unit?`<span style="font-size:10px;color:var(--txt-m)"> ${r.unit}</span>`:''}</td>
      <td style="padding:5px 8px;font-size:11px;color:var(--txt-m)">${r.limit}${r.limit&&r.unit?' '+r.unit:''}</td>
      <td style="padding:5px 8px;font-size:11px;color:var(--txt-s)">${r.detail||''}</td></tr>`;
  }).join('');
  el.style.display='';
  el.innerHTML=`<div style="background:${oBg};border-radius:8px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
    <span style="font-size:22px">${oIcon}</span><span style="font-size:15px;font-weight:700;color:${oCol}">${oText}</span></div>
  <table style="width:100%;border-collapse:collapse;border:1px solid var(--border)">
    <thead><tr style="background:var(--bg-panel)">
      <th style="width:28px;padding:5px 8px"></th>
      <th style="padding:5px 8px;font-size:11px;text-align:left">검사 항목</th>
      <th style="padding:5px 8px;font-size:11px;text-align:left">측정값</th>
      <th style="padding:5px 8px;font-size:11px;text-align:left">허용 기준</th>
      <th style="padding:5px 8px;font-size:11px;text-align:left">비고</th>
    </tr></thead><tbody>${rows}</tbody></table>
  <div style="font-size:10px;color:var(--txt-m);margin-top:8px">
    기준: ${_wpsCriteria?'조선소 WPS 기준 (저장값)':'AWS D1.1 기본값 — WPS 기준 탭에서 입력 가능'}</div>`;
}

// ══ WPS 기준 설정 UI ════════════════════════════════════════
async function _renderWpsCritForm() {
  let crit = _wpsCriteria;
  if(!crit) {
    crit = await apiFetch(`${API}/vessels/${VID}/wps_criteria`).catch(()=>null);
    _wpsCriteria = crit;
  }
  const cb = crit?.butt||{}, cf = crit?.fillet||{};
  const nb_b = cb.no_backing||{}, nb_f = cf.no_backing||{};
  const set = (id,v) => { const e=document.getElementById(id); if(e&&v!==undefined&&v!==null) e.value=v; };
  set('wc_b_nb_rgmin', nb_b.root_gap_min); set('wc_b_nb_rgmax', nb_b.root_gap_max);
  set('wc_b_nb_gmin',  nb_b.groove_min);   set('wc_b_nb_gmax',  nb_b.groove_max);
  set('wc_f_nb_rgmin', nb_f.root_gap_min); set('wc_f_nb_rgmax', nb_f.root_gap_max);
  set('wc_f_nb_gmin',  nb_f.groove_min);   set('wc_f_nb_gmax',  nb_f.groove_max);
}

// Backing Case Table 렌더링
function _renderBackingCaseTables() {
  _renderCaseTable('butt',   document.getElementById('case-table-butt'));
  _renderCaseTable('fillet', document.getElementById('case-table-fillet'));
}

function _renderCaseTable(joint, tbody) {
  if(!tbody) return;
  const cases = _getCrit(joint)?.backing_cases || WPS_DEFAULT_CRITERIA[joint].backing_cases;
  tbody.innerHTML = cases.map((c,i) => `
    <tr id="cr-${joint}-${i}">
      <td style="padding:4px;border:1px solid var(--border)"><input class="fi" id="cr_${joint}_label_${i}" value="${c.label||'Case '+(i+1)}" style="width:70px;font-size:11px"></td>
      <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_rg_min_${i}" value="${c.rg_min??''}" placeholder="0" style="width:65px;font-size:11px"></td>
      <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_rg_max_${i}" value="${c.rg_max??''}" placeholder="" style="width:65px;font-size:11px"></td>
      <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_gmin_${i}" value="${c.groove_min??''}" placeholder="e.g. 45" style="width:65px;font-size:11px"></td>
      <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_gmax_${i}" value="${c.groove_max??''}" placeholder="e.g. 75" style="width:65px;font-size:11px"></td>
      <td style="padding:4px;border:1px solid var(--border);text-align:center"><button class="edit-btn" style="color:var(--red)" onclick="delCaseRow('${joint}',${i})">✕</button></td>
    </tr>`).join('');
}

function addCaseRow(joint) {
  const tbody = document.getElementById(`case-table-${joint}`);
  if(!tbody) return;
  const i = tbody.querySelectorAll('tr').length;
  const tr = document.createElement('tr'); tr.id=`cr-${joint}-${i}`;
  tr.innerHTML = `
    <td style="padding:4px;border:1px solid var(--border)"><input class="fi" id="cr_${joint}_label_${i}" placeholder="Case ${i+1}" style="width:70px;font-size:11px"></td>
    <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_rg_min_${i}" placeholder="0" style="width:65px;font-size:11px"></td>
    <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_rg_max_${i}" placeholder="" style="width:65px;font-size:11px"></td>
    <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_gmin_${i}" placeholder="" style="width:65px;font-size:11px"></td>
    <td style="padding:4px;border:1px solid var(--border)"><input class="fi" type="number" id="cr_${joint}_gmax_${i}" placeholder="" style="width:65px;font-size:11px"></td>
    <td style="padding:4px;border:1px solid var(--border);text-align:center"><button class="edit-btn" style="color:var(--red)" onclick="delCaseRow('${joint}',${i})">✕</button></td>`;
  tbody.appendChild(tr);
}

function delCaseRow(joint, i) { document.getElementById(`cr-${joint}-${i}`)?.remove(); }

function _collectCases(joint) {
  const rows = document.querySelectorAll(`#case-table-${joint} tr`);
  return [...rows].map(r => {
    const idx = r.id.replace(`cr-${joint}-`,'');
    const g = id => { const v=parseFloat(document.getElementById(`cr_${joint}_${id}_${idx}`)?.value); return isNaN(v)?undefined:v; };
    const s = id => document.getElementById(`cr_${joint}_${id}_${idx}`)?.value||'';
    return { label:s('label'), rg_min:g('rg_min'), rg_max:g('rg_max'), groove_min:g('gmin'), groove_max:g('gmax') };
  }).filter(c => c.rg_max!==undefined);
}

async function saveWpsCrit() {
  const g = id => { const v=parseFloat(document.getElementById(id)?.value); return isNaN(v)?undefined:v; };
  const criteria = {
    butt: {
      no_backing:{ root_gap_min:g('wc_b_nb_rgmin'), root_gap_max:g('wc_b_nb_rgmax'), groove_min:g('wc_b_nb_gmin'), groove_max:g('wc_b_nb_gmax') },
      backing_cases: _collectCases('butt'),
      preheat:WPS_DEFAULT_CRITERIA.butt.preheat,
    },
    fillet: {
      no_backing:{ root_gap_min:g('wc_f_nb_rgmin'), root_gap_max:g('wc_f_nb_rgmax'), groove_min:g('wc_f_nb_gmin'), groove_max:g('wc_f_nb_gmax') },
      backing_cases: _collectCases('fillet'),
      preheat:WPS_DEFAULT_CRITERIA.fillet.preheat,
    },
  };
  setSS('saving');
  try {
    await apiFetch(`${API}/vessels/${VID}/wps_criteria`,'PUT',criteria);
    _wpsCriteria = criteria;
    setSS('synced'); toast('WPS 기준이 저장됐습니다');
  } catch(e){ setSS('error'); toast('저장 실패: '+e.message,true); }
}

// ── WPS 파일 관리 ─────────────────────────────────────────────
async function _loadWpsFiles() {
  const list = document.getElementById('wps-file-list');
  if(!list) return;
  list.innerHTML='<div style="text-align:center;padding:20px;color:var(--txt-m)">로딩 중…</div>';
  const files = await apiFetch(`${API}/vessels/${VID}/attachments/vessel_wps/0`).catch(()=>[]);
  const cnt=(files||[]).length;
  const badge=document.getElementById('wps-file-badge');
  if(badge) badge.textContent=cnt>0?` (${cnt})`:'';
  const btn=document.getElementById('btn-wps-tank');
  if(btn){btn.style.background=cnt>0?'var(--blue)':'';btn.style.color=cnt>0?'var(--white)':'';btn.textContent=cnt>0?`🔥 WPS (${cnt})`:'🔥 WPS';}
  if(!cnt){list.innerHTML=`<div style="text-align:center;padding:40px;color:var(--txt-m)"><div style="font-size:32px;margin-bottom:8px">📂</div><div>업로드된 WPS 파일이 없습니다.</div></div>`;return;}
  list.innerHTML=(files||[]).map(f=>{
    const ext=(f.filename||'').split('.').pop().toLowerCase();
    const icon=f.mimetype?.startsWith('image/')?'🖼️':f.mimetype==='application/pdf'?'📄':['xlsx','xls'].includes(ext)?'📊':['docx','doc'].includes(ext)?'📝':'📁';
    const size=f.filesize?(f.filesize>=1024*1024?(f.filesize/1024/1024).toFixed(1)+' MB':(f.filesize/1024).toFixed(0)+' KB'):'';
    const canPrev=f.mimetype?.startsWith('image/')||f.mimetype==='application/pdf';
    return`<div style="display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--border)">
      <span style="font-size:24px">${icon}</span>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.filename}</div><div style="font-size:11px;color:var(--txt-m)">${size}</div></div>
      <div style="display:flex;gap:5px">
        ${canPrev?`<button class="btn-sec" style="font-size:11px;padding:3px 8px" onclick="previewJobAttach(${f.id},'${f.mimetype}','${f.filename}')">👁 미리보기</button>`:''}
        <a class="btn-sec" style="font-size:11px;padding:3px 8px;text-decoration:none" href="/api/attachments/${f.id}">⬇</a>
        ${!isViewer()?`<button class="btn-sec" style="font-size:11px;padding:3px 8px;color:var(--red)" onclick="deleteWpsFile(${f.id})">✕</button>`:''}
      </div></div>`;
  }).join('');
}
async function uploadWpsFile(input){if(!VID||!input.files.length)return;const fd=new FormData();for(const f of input.files)fd.append('files',f);setSS('saving');try{await fetch(`${API}/vessels/${VID}/attachments/vessel_wps/0`,{method:'POST',body:fd});await _loadWpsFiles();setSS('synced');toast(`${input.files.length}개 업로드 완료`);}catch(e){setSS('error');toast('업로드 실패: '+e.message,true);}input.value='';}
async function deleteWpsFile(aid){if(!confirm('파일을 삭제하시겠습니까?'))return;setSS('saving');try{await apiFetch(`${API}/attachments/${aid}`,'DELETE');await _loadWpsFiles();setSS('synced');toast('삭제됐습니다');}catch(e){setSS('error');toast('삭제 실패: '+e.message,true);}}


// ══ PIPE PLAN ═════════════════════════════════════════════════

let _pipePlanData = [];
let _curPipeTankId = null, _curPipeTankName = null;

// Pipe Plan 전용 색상 (초록 계열 — Steel Plan 파란색과 구분)
const PIPE_PLAN_COLORS = {
  noItems:  {fill:'#f0fdf4', stroke:'#86efac', text:'#4b7c5a'},
  hasItems: {fill:'#d1fae5', stroke:'#10b981', text:'#065f46'},
  urgent:   {fill:'#fef3c7', stroke:'#f59e0b', text:'#92400e'},
  critical: {fill:'#fee2e2', stroke:'#ef4444', text:'#991b1b'},
};

// _pipePlanCol → _makeColFn으로 대체됨

async function renderPipePlan() {
  if(!VID) return;
  const wrap = document.getElementById('pipe-svg-wrap');
  if(wrap) wrap.innerHTML = '<div style="text-align:center;padding:40px;color:#334155;font-size:13px">로딩 중…</div>';

  const [items, saved] = await Promise.all([
    apiFetch(`${API}/vessels/${VID}/pipe_plan`).catch(()=>[]),
    apiFetch(`${API}/vessels/${VID}/tank_layout`).catch(()=>null),
  ]);
  _pipePlanData = items || [];

  // 레이아웃은 Tank Plan과 공유
  if(!_tankLayout) {
    const layout = (saved && saved.version === TANK_LAYOUT_VERSION) ? saved : null;
    _tankLayout = layout || _defaultVLCCLayout();
  }

  // Pipe Plan 색상: 초록색 — 렌더 시점 데이터 캡처
  const _pipeColFn = _makeColFn(_pipePlanData, '#d1fae5', '#10b981', '#065f46');
  if(wrap) wrap.innerHTML = _svgFromLayout(_tankLayout, 'openPipeModal', _pipeColFn);

  _initPlanDocBadges().catch(()=>{});  // GA / Repair Plan 버튼 뱃지

  const total=_pipePlanData.length;
  const cr=_pipePlanData.filter(i=>i.priority==='Critical').length;
  const ug=_pipePlanData.filter(i=>i.priority==='Urgent').length;
  const tnks=new Set(_pipePlanData.map(i=>i.position_tank).filter(Boolean)).size;
  const st=document.getElementById('pipe-plan-stats');
  if(st) st.innerHTML=`전체 <b>${total}</b>건 · 공간 <b>${tnks}</b>개 · <span style="color:#fca5a5">🔴 Critical <b>${cr}</b></span> · <span style="color:#fde68a">🟡 Urgent <b>${ug}</b></span>`;
}

// ── Pipe Modal ────────────────────────────────────────────────
async function openPipeModal(tankId, tankName) {
  _curPipeTankId = tankId; _curPipeTankName = tankName;
  _editPipeItemId = null;
  document.getElementById('m-pipe-title').textContent = tankName + ' — Pipe Repair Items';
  document.getElementById('m-pipe-body').innerHTML =
    '<div style="text-align:center;padding:24px;color:var(--txt-m)">로딩 중…</div>';
  openM('m-pipe');

  if(!FLEET[VID].pipe || !FLEET[VID].pipe.length) {
    try { FLEET[VID].pipe = await apiFetch(`${API}/vessels/${VID}/pipe_repair`); } catch(e) {}
  }
  _renderPipeModalBody();
}

// ── Pipe inline edit helpers ──────────────────────────────────
function startPipeItemEdit(id) { _editPipeItemId = id; _renderPipeModalBody(); }
function cancelPipeItemEdit()  { _editPipeItemId = null; _renderPipeModalBody(); }

async function savePipeItemEdit(id) {
  if(isViewer()) { toast('읽기 전용 계정입니다', true); return; }
  const row = (FLEET[VID].pipe||[]).find(r=>r.id===id);
  if(!row) return;
  const g = (sid) => document.getElementById(sid)?.value ?? '';
  const updated = {
    ...row,
    system_line:     g('pe-system_line')     || row.system_line,
    description:     g('pe-description')     || row.description,
    frame_no:        g('pe-frame_no'),
    location_detail: g('pe-location_detail'),
    pipe_od:         g('pe-pipe_od'),
    schedule:        g('pe-schedule')        || row.schedule,
    material:        g('pe-material')        || row.material,
    length_m:        g('pe-length_m'),
    bend_qty:        g('pe-bend_qty'),
    flange_qty:      g('pe-flange_qty'),
    valve_type:      g('pe-valve_type')      || row.valve_type,
    valve_size:      g('pe-valve_size'),
    valve_qty:       g('pe-valve_qty'),
    priority:        g('pe-priority')        || row.priority,
    status:          g('pe-status')          || row.status,
    remark:          g('pe-remark'),
  };
  setSS('saving');
  try {
    await apiFetch(`${API}/pipe_repair/${id}`, 'PUT', updated);
    Object.assign(row, updated);
    const pp = _pipePlanData.find(r=>r.id===id);
    if(pp) Object.assign(pp, {priority:updated.priority, status:updated.status, system_line:updated.system_line});
    setSS('synced'); _editPipeItemId = null; _renderPipeModalBody();
    toast('저장됐습니다');
  } catch(e) { setSS('error'); toast('저장 실패: '+e.message, true); }
}

function _pipeEditForm(item) {
  const esc = s => (s||'').replace(/"/g,'&quot;');
  const sel = (id, opts, val) =>
    `<select class="form-ctrl" id="${id}" style="font-size:11px">
      ${opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}
     </select>`;
  const SYS_OPTS = ['','Ballast','F.O.','C.O.','L.O.','S.W.','F.W.','Steam','Drain','Fire & GS','Comp. Air','Inert Gas','Hydraulic','Other'];
  return `<div style="padding:10px 14px 12px;background:#f0fdf4;border-top:1px solid var(--border)">
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group">
        <label class="form-lbl">System / Line</label>
        ${sel('pe-system_line', SYS_OPTS, item.system_line)}
      </div>
      <div class="form-group" style="flex:2">
        <label class="form-lbl">Description</label>
        <input class="form-ctrl" id="pe-description" value="${esc(item.description)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Priority</label>
        ${sel('pe-priority',['Normal','Urgent','Critical'],item.priority)}
      </div>
      <div class="form-group">
        <label class="form-lbl">Status</label>
        ${sel('pe-status',['Not Started','In Progress','Completed','On Hold'],item.status)}
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group">
        <label class="form-lbl">Frame No.</label>
        <input class="form-ctrl" id="pe-frame_no" value="${esc(item.frame_no)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Location</label>
        <input class="form-ctrl" id="pe-location_detail" value="${esc(item.location_detail)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Pipe OD (mm)</label>
        <input class="form-ctrl" id="pe-pipe_od" value="${esc(item.pipe_od)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Schedule</label>
        ${sel('pe-schedule',['Sch40','Sch80','Other'],item.schedule)}
      </div>
      <div class="form-group">
        <label class="form-lbl">Material</label>
        ${sel('pe-material',['Carbon Steel','Galvanized','Stainless Steel','Hydraulic','Acid Treatment','Other'],item.material)}
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group">
        <label class="form-lbl">Length (m)</label>
        <input class="form-ctrl" id="pe-length_m" type="number" value="${item.length_m||''}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Bend (pc)</label>
        <input class="form-ctrl" id="pe-bend_qty" type="number" value="${item.bend_qty||''}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Flange (pc)</label>
        <input class="form-ctrl" id="pe-flange_qty" type="number" value="${item.flange_qty||''}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">Valve Type</label>
        ${sel('pe-valve_type',['None','Globe','Gate','Butterfly','Check','Ball'],item.valve_type)}
      </div>
      <div class="form-group">
        <label class="form-lbl">V.Size (mm)</label>
        <input class="form-ctrl" id="pe-valve_size" value="${esc(item.valve_size)}" style="font-size:11px">
      </div>
      <div class="form-group">
        <label class="form-lbl">V.Qty (pc)</label>
        <input class="form-ctrl" id="pe-valve_qty" type="number" value="${item.valve_qty||''}" style="font-size:11px">
      </div>
    </div>
    <div class="form-row" style="margin-bottom:6px">
      <div class="form-group" style="flex:1">
        <label class="form-lbl">Remark</label>
        <input class="form-ctrl" id="pe-remark" value="${esc(item.remark)}" style="font-size:11px">
      </div>
    </div>
    <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:4px">
      <button class="btn-sec" style="font-size:11px" onclick="cancelPipeItemEdit()">취소</button>
      <button class="btn-pri" style="font-size:11px" onclick="savePipeItemEdit(${item.id})">💾 저장</button>
    </div>
  </div>`;
}

function _renderPipeModalBody() {
  const items = (FLEET[VID].pipe||[]).filter(i => {
    if(!i.position_tank) return false;
    const pt=i.position_tank.replace(/\s+/g,'').toUpperCase();
    const tn=(_curPipeTankName||'').replace(/\s+/g,'').toUpperCase();
    return pt.includes(tn)||tn.includes(pt);
  });

  const sum = document.getElementById('m-pipe-summary');
  if(sum) {
    const cr=items.filter(i=>i.priority==='Critical').length;
    const ug=items.filter(i=>i.priority==='Urgent').length;
    const dn=items.filter(i=>i.status==='Completed').length;
    sum.innerHTML=`<span style="font-size:12px;color:var(--txt-s)">총 <b style="color:var(--txt-h)">${items.length}</b>건
      ${cr?` · <span style="color:#ef4444">🔴 Critical <b>${cr}</b></span>`:''}
      ${ug?` · <span style="color:#d97706">🟡 Urgent <b>${ug}</b></span>`:''}
      ${dn?` · ✅ Completed <b style="color:var(--green)">${dn}</b>`:''}
    </span>`;
  }

  const body = document.getElementById('m-pipe-body');
  if(!items.length) {
    body.innerHTML=`<div style="text-align:center;padding:32px;color:var(--txt-m)">
      <div style="font-size:28px;margin-bottom:8px">🔩</div>
      <div>이 공간에 등록된 Pipe Repair 항목이 없습니다.</div>
      <div style="font-size:12px;margin-top:4px">아래 ＋ Add Item으로 추가하세요.</div>
    </div>`;
    return;
  }

  body.innerHTML = items.map((item, idx) => {
    const isEditing = _editPipeItemId === item.id;
    const ph = priorityBadge(item.priority||'Normal');
    const stCls = item.status==='Completed'?'c-closed':item.status==='Not Started'||!item.status?'c-open':'cat-badge cat-sh';
    const specs = [
      item.pipe_od   ? `OD ${item.pipe_od}mm` : '',
      item.schedule  || '',
      item.material  || '',
      item.length_m  ? `L=${item.length_m}m` : '',
      item.bend_qty  ? `Bend×${item.bend_qty}` : '',
      item.flange_qty? `Flange×${item.flange_qty}` : '',
    ].filter(Boolean);
    const valveInfo = item.valve_type && item.valve_type!=='None'
      ? `🔧 ${item.valve_type}${item.valve_size?' '+item.valve_size+'mm':''}${item.valve_qty?' ×'+item.valve_qty:''}` : '';

    return `<div class="tank-item-row" style="flex-direction:column;align-items:stretch;padding:0">
      <div style="display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px 18px">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#10b981;
                    font-weight:700;min-width:28px;padding-top:1px">${item.no||idx+1}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--txt-h);margin-bottom:4px">
            ${item.system_line?`<span style="font-size:11px;font-weight:700;color:#0891b2;background:#e0f2fe;padding:1px 6px;border-radius:3px;margin-right:5px">${item.system_line}</span>`:''}
            ${item.description||'—'}
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
            ${ph}
            <span class="c-badge ${stCls}" style="font-size:10px">${item.status||'Not Started'}</span>
            ${specs.length?`<span style="font-size:11px;color:var(--txt-m);font-family:'IBM Plex Mono',monospace">${specs.join(' · ')}</span>`:''}
          </div>
          ${valveInfo?`<div style="font-size:11px;color:var(--txt-m);margin-top:3px">${valveInfo}</div>`:''}
          ${item.frame_no?`<div style="font-size:11px;color:var(--txt-m);margin-top:2px">📐 Fr.${item.frame_no}${item.location_detail?' &nbsp;·&nbsp; '+item.location_detail:''}</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
          ${!isViewer() ? `<button class="btn-sec" style="font-size:11px;padding:4px 8px;white-space:nowrap;${isEditing?'background:var(--blue);color:white':''}"
                  onclick="${isEditing?'cancelPipeItemEdit()':'startPipeItemEdit('+item.id+')'}">
            ${isEditing?'✕ 닫기':'✎ 편집'}</button>` : ''}
          <button class="btn-sec" style="font-size:11px;padding:4px 8px;white-space:nowrap"
                  onclick="goToPipeItem(${item.id})">↗ 바로가기</button>
          <button class="btn-sec attach-btn" id="pipebtn-${item.id}"
                  style="font-size:11px;padding:4px 8px;${(FLEET[VID].attachSet||new Set()).has('pipe:'+item.id)?'background:var(--blue);color:var(--white)':''}"
                  onclick="openGenAttach('pipe',${item.id})">
            ${(FLEET[VID].attachSet||new Set()).has('pipe:'+item.id)?'📎 +':'📎'}
          </button>
        </div>
      </div>
      ${isEditing ? _pipeEditForm(item) : ''}
    </div>`;
  }).join('');
}

// Pipe Plan → Pipe Repair 탭 바로가기
function goToPipeItem(itemId) {
  closeM('m-pipe');
  const trigger = document.getElementById('trackingTriggerBtn');
  const menu    = document.getElementById('trackingMenu');
  if(trigger && menu) { trigger.classList.add('active'); menu.classList.add('open'); }
  document.querySelectorAll('.tracking-sub-btn').forEach(b => b.classList.remove('active'));
  const pipeBtn = document.querySelector('.tracking-sub-btn[onclick*="\'pipe\'"]');
  if(pipeBtn) pipeBtn.classList.add('active');

  // 하이라이트 대상 저장
  _highlightRowId  = String(itemId);
  _highlightRowKey = 'pipe';

  // 해당 그룹만 펼치기
  const item = (FLEET[VID]?.pipe||[]).find(r => String(r.id)===String(itemId));
  if(item) {
    const grp = (item.position_tank||'').trim() || '(미지정)';
    if(!_trackingGroupCollapsed['pipe']) _trackingGroupCollapsed['pipe'] = new Set();
    _trackingGroupCollapsed['pipe'].delete(grp);
  }

  showTab('pipe', trigger);
}

// Pipe Plan Add Item
async function savePipeItem() {
  if(isViewer()){toast('읽기 전용 계정입니다',true);return;}
  const sys = (document.getElementById('m-pipe-add-sys')?.value||'').trim();
  const desc= (document.getElementById('m-pipe-add-desc')?.value||'').trim();
  if(!desc){toast('Description을 입력하세요',true);return;}
  const existingItems=(FLEET[VID].pipe||[]).filter(i=>{
    if(!i.position_tank)return false;
    const pt=i.position_tank.replace(/\s+/g,'').toUpperCase();
    const tn=(_curPipeTankName||'').replace(/\s+/g,'').toUpperCase();
    return pt.includes(tn)||tn.includes(pt);
  });
  const payload={
    no:String(existingItems.length+1),
    system_line:sys, position_tank:_curPipeTankName||'',
    frame_no:(document.getElementById('m-pipe-add-frame')?.value||'').trim(),
    location_detail:(document.getElementById('m-pipe-add-loc')?.value||'').trim(),
    pipe_od:(document.getElementById('m-pipe-add-od')?.value||'').trim(),
    schedule:document.getElementById('m-pipe-add-sch')?.value||'Sch40',
    material:document.getElementById('m-pipe-add-mat')?.value||'Carbon Steel',
    length_m:(document.getElementById('m-pipe-add-len')?.value||'').trim(),
    description:desc, remark:'',
    priority:document.getElementById('m-pipe-add-pri')?.value||'Normal',
    status:'Not Started',
    bend_qty:'',flange_qty:'',
    valve_type:'None',valve_size:'',valve_qty:'',
    start_date:'',completion_date:'',
  };
  setSS('saving');
  try {
    const n=await apiFetch(`${API}/vessels/${VID}/pipe_repair`,'POST',payload);
    FLEET[VID].pipe=[...(FLEET[VID].pipe||[]),n];
    _pipePlanData=[..._pipePlanData,{id:n.id,no:n.no,position_tank:n.position_tank||_curPipeTankName,
      system_line:n.system_line,priority:n.priority,status:n.status,description:n.description}];
    setSS('synced');
    document.getElementById('m-pipe-addform').style.display='none';
    document.getElementById('m-pipe-addbtn').style.display='';
    _renderPipeModalBody();
    const wrap=document.getElementById('pipe-svg-wrap');
    if(wrap&&_tankLayout) {
      const _cf=_makeColFn(_pipePlanData,'#d1fae5','#10b981','#065f46');
      wrap.innerHTML=_svgFromLayout(_tankLayout,'openPipeModal',_cf);
    }
    // 폼 리셋
    ['m-pipe-add-sys','m-pipe-add-desc','m-pipe-add-frame','m-pipe-add-loc','m-pipe-add-od','m-pipe-add-len'].forEach(id=>{
      const e=document.getElementById(id);if(e)e.value='';
    });
    toast('Pipe Repair 항목이 추가됐습니다');
  } catch(e){setSS('error');toast('추가 실패: '+e.message,true);}
}

// ── 데이터 복구 (Orphan Position Recovery) ───────────────────
async function openOrphanRecovery() {
  if(!VID) return;
  document.getElementById('m-orphan-body').innerHTML =
    '<div style="text-align:center;padding:24px;color:var(--txt-m)">조회 중…</div>';
  openM('m-orphan');

  const orphans = await apiFetch(`${API}/vessels/${VID}/orphan_positions`).catch(()=>({}));

  // 현재 레이아웃 탱크명 목록
  const layoutNames = [];
  (_tankLayout?.sections||[]).forEach(sec =>
    (sec.columns||[]).forEach(col =>
      ['p','c','s'].forEach(f => {
        const t = col[f];
        if(t && !t.empty && t.name) layoutNames.push(t.name);
      })
    )
  );
  layoutNames.sort();

  const body = document.getElementById('m-orphan-body');
  const keys = Object.keys(orphans || {});
  if(!keys.length) {
    body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--green)">
      <div style="font-size:32px;margin-bottom:8px">✅</div>
      <div style="font-size:14px;font-weight:600">누락된 데이터가 없습니다.</div>
      <div style="font-size:12px;color:var(--txt-m);margin-top:6px">모든 항목이 현재 레이아웃과 일치합니다.</div>
    </div>`;
    return;
  }

  const opts = layoutNames.map(n =>
    `<option value="${n.replace(/"/g,'&quot;')}">${n}</option>`
  ).join('');

  body.innerHTML = `
    <div style="padding:12px 20px;background:#fef9c3;border-bottom:1px solid #fde047;font-size:12px;color:#92400e">
      ⚠ 아래 항목들은 현재 레이아웃에 없는 <b>position_tank</b> 값을 갖고 있습니다.
      올바른 탱크명으로 변경하면 데이터가 다시 표시됩니다.
    </div>
    ${keys.map(oldName => {
      const g = orphans[oldName];
      const steelCnt = g.steel?.length || 0;
      const pipeCnt  = g.pipe?.length  || 0;
      const id = 'orph_' + oldName.replace(/\W/g,'_');
      return `<div style="padding:12px 20px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--red)">"${oldName}"</div>
            <div style="font-size:11px;color:var(--txt-m);margin-top:2px">
              ${steelCnt ? `🔧 Steel ${steelCnt}건 ` : ''}${pipeCnt ? `🔩 Pipe ${pipeCnt}건` : ''}
            </div>
          </div>
          <div style="font-size:18px;color:var(--txt-m)">→</div>
          <div style="flex:1;min-width:160px">
            <select class="fi" id="${id}" style="width:100%">
              <option value="">— 탱크 선택 —</option>
              ${opts}
            </select>
          </div>
          <button class="btn-pri" style="font-size:11px;white-space:nowrap"
                  onclick="applyOrphanRename('${oldName.replace(/'/g,"\\'")}','${id}')">
            적용
          </button>
        </div>
      </div>`;
    }).join('')}`;
}

async function applyOrphanRename(oldName, selectId) {
  const newName = document.getElementById(selectId)?.value;
  if(!newName) { toast('탱크를 선택하세요', true); return; }
  setSS('saving');
  try {
    const result = await apiFetch(`${API}/vessels/${VID}/position_rename`, 'PUT',
      [{old: oldName, new: newName}]);
    const updated = result?.updated || 0;
    // 메모리 동기화
    [FLEET[VID]?.steel, FLEET[VID]?.pipe, _tankPlanData, _pipePlanData].forEach(arr => {
      (arr||[]).forEach(item => {
        if(item.position_tank === oldName) item.position_tank = newName;
      });
    });
    setSS('synced');
    toast(`"${oldName}" → "${newName}" · ${updated}건 업데이트 완료`);
    // 해당 행 제거 후 재조회
    openOrphanRecovery();
    // SVG 재렌더
    const tw=document.getElementById('tank-svg-wrap');
    if(tw&&_tankLayout) tw.innerHTML=_svgFromLayout(_tankLayout,'openTankModal',_tankCol);
    const pw=document.getElementById('pipe-svg-wrap');
    if(pw&&_tankLayout) pw.innerHTML=_svgFromLayout(_tankLayout,'openPipeModal',_pipePlanCol);
  } catch(e){ setSS('error'); toast('실패: '+e.message, true); }
}

// ══ CALENDAR ═════════════════════════════════════════════════
let _calYear = new Date().getFullYear();
let _calMonth = new Date().getMonth();
let _calPendingHighlight = null; // {tabName, type, id}

function calMove(dir) {
  _calMonth += dir;
  if(_calMonth > 11){ _calMonth=0; _calYear++; }
  if(_calMonth < 0) { _calMonth=11; _calYear--; }
  renderCalendar();
}
function calGoToday() {
  const now = new Date();
  _calYear=now.getFullYear(); _calMonth=now.getMonth();
  renderCalendar();
}

// ── 이벤트 맵 생성 ─────────────────────────────────────────
function buildCalEvents() {
  if(!VID) return {evMap:{}, schedList:[]};
  const v = FLEET[VID];
  const evMap = {};

  function addEv(date, ev) {
    if(!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return;
    const d = date.substring(0,10);
    if(!evMap[d]) evMap[d] = [];
    evMap[d].push(ev);
  }

  // Job Progress — remarks
  (v.jobs||[]).forEach(j => {
    (j.remarks||[]).forEach(r => {
      if(!r.date) return;
      addEv(r.date, { type:'job', source:'Job Progress',
        desc: j.number?`[${j.number}] ${j.description||''}`:(j.description||'—'),
        note: r.progress||'', important: r.important||false,
        refType:'job', refId: j._id, tabIdx:1 });
    });
  });

  // Daily Log — actions
  (v.discussions||[]).forEach(d => {
    (d.actions||[]).forEach(a => {
      if(!a.date) return;
      addEv(a.date, { type:'daily', source:'Daily Log',
        desc: d.item||d.description||'—',
        note: a.progress||'', important: a.important||false,
        refType:'disc', refId: d._id, tabIdx:4 });
    });
  });

  // Class Items — actions
  (v.classItems||[]).forEach(c => {
    (c.actions||[]).forEach(a => {
      if(!a.date) return;
      addEv(a.date, { type:'class', source:'Class Items',
        desc: c.finding||'—',
        note: a.progress||'', important: a.important||false,
        refType:'class', refId: c._id, tabIdx:3 });
    });
  });

  // Job 스케줄 (start_date ~ end_date)
  const schedList = [];
  (v.jobs||[]).forEach(j => {
    if(!j.start_date || !j.end_date) return;
    if(j.section==='CANCEL') return;
    schedList.push({ jid: j._id, number: j.number||'', desc: j.description||'',
      start: j.start_date, end: j.end_date,
      section: j.section||'', category: j.category||'' });
  });

  return {evMap, schedList};
}

// ── 캘린더 렌더 ────────────────────────────────────────────
function renderCalendar() {
  if(!VID) return;
  const MONTHS=['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  document.getElementById('cal-title').textContent=`${MONTHS[_calMonth]} ${_calYear}`;

  const {evMap, schedList} = buildCalEvents();
  const today = new Date();
  const todayStr = fmtD(today);

  const firstDay = new Date(_calYear, _calMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  // 이번 달 날짜 범위
  const monthStart = fmtD(new Date(_calYear, _calMonth, 1));
  const monthEnd   = fmtD(new Date(_calYear, _calMonth+1, 0));

  // 스케줄 바 색상 (section 기반)
  const SCHED_COLORS = {
    PAINT:'#8b5cf6', STEEL:'#64748b', DECK:'#0891b2', ENGINE:'#dc2626',
    ELECTRIC:'#f59e0b', REPAIR:'#16a34a', ADD:'#9333ea', SPARE:'#78716c',
    STORE:'#6b7280', GENERAL:'#94a3b8'
  };
  function schedColor(sec) { return SCHED_COLORS[sec] || '#6366f1'; }

  let html = '';
  const cur = new Date(startDate);

  for(let i=0; i<42; i++){
    const dow = cur.getDay(); // 0=Sun, 6=Sat
    const dateStr = fmtD(cur);
    const isToday = dateStr===todayStr;
    const isOther = cur.getMonth()!==_calMonth;
    const evs = evMap[dateStr]||[];

    // 해당 날짜가 start 또는 end인 job만
    const dayScheds = schedList.filter(s => dateStr===s.start || dateStr===s.end);

    const jobEvs   = evs.filter(e=>e.type==='job');
    const dailyEvs = evs.filter(e=>e.type==='daily');
    const classEvs = evs.filter(e=>e.type==='class');

    let badges='';
    if(jobEvs.length)   badges+=`<span class="cal-badge job">Job ${jobEvs.length}</span>`;
    if(dailyEvs.length) badges+=`<span class="cal-badge daily">Daily ${dailyEvs.length}</span>`;
    if(classEvs.length) badges+=`<span class="cal-badge class">Class ${classEvs.length}</span>`;

    // 스케줄 바 (최대 3개 표시)
    let schedBars='';
    dayScheds.slice(0,3).forEach(s=>{
      const isStart = dateStr===s.start;
      const isEnd   = dateStr===s.end;
      const col = isStart&&isEnd ? '#f59e0b' : isStart ? '#10b981' : '#ef4444';
      const tag = isStart&&isEnd ? '▶■' : isStart ? '▶' : '■';
      const label = s.number ? `${tag} ${s.number}` : tag;
      schedBars+=`<div style="display:inline-flex;align-items:center;gap:3px;background:${col};color:#fff;border-radius:4px;padding:2px 6px;margin-bottom:2px;font-size:10px;font-weight:700;cursor:pointer;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"
        onclick="event.stopPropagation();openCalDay('${dateStr}','sched')"
        title="${s.number} ${s.desc} (${s.start}→${s.end})">
        ${label}
      </div>`;
    });
    if(dayScheds.length>3) schedBars+=`<div style="font-size:9px;color:var(--txt-m)">+${dayScheds.length-3}개</div>`;

    const hasClick = evs.length>0 || dayScheds.length>0;
    // 요일별 날짜 색상
    const numColor = dow===0?'color:var(--red)': dow===6?'color:var(--blue)':'';

    html+=`<div class="cal-cell${isToday?' today':''}${isOther?' other-month':''}"
      ${hasClick?`onclick="openCalDay('${dateStr}','ev')"`:''}>
      <div class="cal-day-num" style="${numColor}">${cur.getDate()}</div>
      ${schedBars?`<div style="margin-bottom:3px">${schedBars}</div>`:''}
      ${badges?`<div class="cal-badges">${badges}</div>`:''}
    </div>`;
    cur.setDate(cur.getDate()+1);
  }
  document.getElementById('cal-body').innerHTML=html;
}

function fmtD(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

// ── 날짜 팝업 ──────────────────────────────────────────────
function openCalDay(dateStr, focus) {
  const {evMap, schedList} = buildCalEvents();
  const evs = evMap[dateStr]||[];
  const dayScheds = schedList.filter(s=>dateStr===s.start || dateStr===s.end);

  document.getElementById('cal-popup-title').textContent=`📅 ${dateStr}`;

  const TAB_NAMES={1:'jobs',3:'class',4:'daily'};
  const TAB_BTN_IDX={1:1,3:3,4:4};

  let html='';

  // Job 스케줄
  if(dayScheds.length){
    const SCHED_COLORS={PAINT:'#8b5cf6',STEEL:'#64748b',DECK:'#0891b2',ENGINE:'#dc2626',
      ELECTRIC:'#f59e0b',REPAIR:'#16a34a',ADD:'#9333ea',SPARE:'#78716c',STORE:'#6b7280',GENERAL:'#94a3b8'};
    html+=`<div style="font-size:11px;font-weight:700;color:var(--txt-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">📊 Job Schedule</div>`;
    html+=dayScheds.map(s=>{
      const col=SCHED_COLORS[s.section]||'#6366f1';
      const isStart=dateStr===s.start, isEnd=dateStr===s.end;
      const tag=isStart&&isEnd?'Start/End':isStart?'▶ Start':isEnd?'■ End':'진행 중';
      return`<div class="cal-popup-item" style="border-color:${col}">
        <div class="cal-popup-source" style="color:${col}">${s.section} · ${s.category}</div>
        <div class="cal-popup-desc">${s.number?`[${s.number}] `:''}${s.desc}</div>
        <div style="font-size:11px;color:var(--txt-m);margin:3px 0">${s.start} → ${s.end} · <span style="font-weight:600;color:${col}">${tag}</span></div>
        <button class="btn-sec" style="margin-top:6px;font-size:11px;padding:4px 10px"
          onclick="closeM('m-cal-day');navToJob(${s.jid})">→ Job Progress 이동</button>
      </div>`;
    }).join('');
  }

  // Remarks / Actions
  if(evs.length){
    html+=`<div style="font-size:11px;font-weight:700;color:var(--txt-m);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px">📝 Updates</div>`;
    html+=evs.map(e=>`<div class="cal-popup-item ${e.type}">
      <div class="cal-popup-source">${e.source}</div>
      <div class="cal-popup-desc">${e.desc}</div>
      ${e.note?`<div class="cal-popup-note">${e.note}${e.important?' ⭐':''}</div>`:''}
      <button class="btn-sec" style="margin-top:8px;font-size:11px;padding:4px 10px"
        onclick="closeM('m-cal-day');navToItem('${TAB_NAMES[e.tabIdx]}',${TAB_BTN_IDX[e.tabIdx]},'${e.refType}',${e.refId})">
        → ${e.source} 이동
      </button>
    </div>`).join('');
  }

  document.getElementById('cal-popup-body').innerHTML=html||'<div style="text-align:center;padding:20px;color:var(--txt-m)">내용 없음</div>';
  openM('m-cal-day');
}

// ── 탭 이동 + 해당 항목 하이라이트 ────────────────────────
function navToJob(jid) {
  const job = (FLEET[VID]?.jobs||[]).find(j=>j._id==jid);
  if(!job) return;
  _calNavExpand = true;
  _expandTargetJob(job);
  showTab('jobs', document.querySelectorAll('.vnav-btn')[1]);
  renderJobs();
  _calNavExpand = false;
  _scrollToRow(`tr[data-jid="${jid}"]`, '#dbeafe');
}

function navToItem(tabName, tabIdx, refType, refId) {
  if(refType==='job'){
    const job = (FLEET[VID]?.jobs||[]).find(j=>j._id==refId);
    if(!job) return;
    _calNavExpand = true;
    _expandTargetJob(job);
    showTab(tabName, document.querySelectorAll('.vnav-btn')[tabIdx]);
    renderJobs();
    _calNavExpand = false;
    _scrollToRow(`tr[data-jid="${refId}"]`, '#dbeafe');

  } else if(refType==='disc'){
    const disc = (FLEET[VID]?.discussions||[]).find(d=>d._id==refId);
    if(!disc) return;
    // 해당 날짜 그룹만 펼치기, 나머지는 접기
    _calNavExpandDisc = true;
    const allDates = [...new Set((FLEET[VID].discussions||[]).map(d=>d.date||'(날짜 없음)'))];
    discCollapsed.clear();
    allDates.forEach(dt => { if(dt !== (disc.date||'(날짜 없음)')) discCollapsed.add(dt); });
    showTab(tabName, document.querySelectorAll('.vnav-btn')[tabIdx]);
    renderDisc();
    _calNavExpandDisc = false;
    _scrollToRow(`tr[data-did="${refId}"]`, '#d1fae5');

  } else if(refType==='class'){
    const cls = (FLEET[VID]?.classItems||[]).find(c=>c._id==refId);
    if(!cls) return;
    showTab(tabName, document.querySelectorAll('.vnav-btn')[tabIdx]);
    // 모든 class 필터 초기화 후 finding으로 검색
    ['c-sf','c-bf','c-pf'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    const qEl = document.getElementById('c-q');
    if(qEl){ qEl.value = cls.no||cls.finding||''; renderClass(); }
    _scrollToRow(`tr[data-cid="${refId}"]`, '#fef9c3');
  }
}

function _expandTargetJob(job) {
  const jobs = FLEET[VID]?.jobs||[];
  const tgtCat = job.category||'Uncategorized';
  const tgtSec = job.section||'GENERAL';

  catCollapsed.clear();
  _catEverSeen.clear();
  jobCollapsed.clear();

  // 대상 카테고리+섹션 제외하고 모두 접기
  const allCats = [...new Set(jobs.map(j=>j.category||'Uncategorized'))];
  allCats.forEach(c => {
    const secs = [...new Set(jobs.filter(j=>(j.category||'Uncategorized')===c).map(j=>j.section||'GENERAL'))];
    if(c !== tgtCat) {
      catCollapsed.add(c);
      secs.forEach(s => catCollapsed.add(c+'::'+s));
    } else {
      secs.forEach(s => { if(s !== tgtSec) catCollapsed.add(c+'::'+s); });
    }
  });

  // 대상 job의 직계 조상만 펼치기, 나머지 parent는 접기
  jobs.forEach(j => {
    if(!hasChildren(j.number, jobs)) return;
    let isAncestor = false;
    let p = getParentNumber(job.number);
    while(p) { if(p===j.number){ isAncestor=true; break; } p=getParentNumber(p); }
    if(!isAncestor) jobCollapsed.add(j.number);
  });
}

function _scrollToRow(sel, color) {
  setTimeout(()=>{
    const row = document.querySelector(sel);
    if(row){ row.scrollIntoView({behavior:'smooth', block:'center'}); flashRow(row, color); return; }
    setTimeout(()=>{
      const row2 = document.querySelector(sel);
      if(row2){ row2.scrollIntoView({behavior:'smooth', block:'center'}); flashRow(row2, color); }
    }, 150);
  }, 50);
}

function flashRow(row, color) {
  const orig = row.style.background || '';
  row.style.transition = 'background .15s';
  row.style.background = color;
  let count = 0;
  const blink = setInterval(()=>{
    count++;
    row.style.background = count%2===0 ? color : orig;
    if(count >= 5){ clearInterval(blink); row.style.background = orig; }
  }, 300);
}


// ══ DOCUMENTS ════════════════════════════════════════════════
const DOC_TYPES = [
  { key:'Shipyard Specification', icon:'📋', color:'#3b82f6' },
  { key:'Shipyard Quotation',     icon:'💰', color:'#10b981' },
  { key:'Shipyard Workdone List', icon:'✅', color:'#8b5cf6' },
  { key:'Yard Report',            icon:'🏗️', color:'#f59e0b' },
  { key:'Service Report',         icon:'🔧', color:'#ef4444' },
  { key:'Invoices',               icon:'🧾', color:'#0891b2' },
  { key:'Reference',              icon:'📚', color:'#64748b' },
];

const _docCollapsed = new Set(); // 기본 접힘

async function renderDocuments() {
  if(!VID) return;
  const grid = document.getElementById('docs-grid');
  grid.innerHTML = '<div style="color:var(--txt-m);padding:20px">Loading…</div>';
  try {
    const allDocs = await apiFetch(`${API}/vessels/${VID}/documents`);
    const byType = {};
    DOC_TYPES.forEach(t => byType[t.key] = []);
    (allDocs||[]).forEach(d => { if(byType[d.doc_type]) byType[d.doc_type].push(d); });
    // 각 섹션 파일 이름순 정렬
    Object.keys(byType).forEach(k => byType[k].sort((a,b) => a.filename.localeCompare(b.filename)));

    // 최초 진입 시 모두 접기
    if(_docCollapsed.size === 0) DOC_TYPES.forEach(t => _docCollapsed.add(t.key));

    grid.innerHTML = DOC_TYPES.map(t => {
      const files = byType[t.key] || [];
      const collapsed = _docCollapsed.has(t.key);
      const safeKey = t.key.replace(/'/g,"\\'");
      const fileHtml = files.length
        ? files.map(f => _docFileItem(f)).join('')
        : `<div class="docs-empty">📂 업로드된 파일이 없습니다</div>`;
      return `<div class="docs-section">
        <div class="docs-section-hdr" style="background:${t.color};cursor:pointer" onclick="toggleDocSection('${safeKey}')">
          <div class="docs-section-title" style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;display:inline-block;transform:rotate(${collapsed?'0':'90'}deg);transition:transform .2s">▶</span>
            ${t.icon} ${t.key}
            <span style="font-size:11px;font-weight:400;opacity:.7">(${files.length})</span>
          </div>
          ${isViewer() ? '' : `<label class="docs-upload-btn" title="파일 업로드" onclick="event.stopPropagation()">
            ＋ 업로드
            <input type="file" multiple style="display:none"
              onchange="uploadDocument(this,'${safeKey}')">
          </label>`}
        </div>
        <div class="docs-file-list" id="docs-list-${_docTypeId(t.key)}"
          style="display:${collapsed?'none':'block'}">${fileHtml}</div>
      </div>`;
    }).join('');
  } catch(e) {
    grid.innerHTML = `<div style="color:var(--red);padding:20px">로드 실패: ${e.message}</div>`;
  }
  _updateDocsToggleAllBtn();
}

function toggleDocSection(key) {
  if(_docCollapsed.has(key)) _docCollapsed.delete(key);
  else _docCollapsed.add(key);
  const typeId = _docTypeId(key);
  const listEl = document.getElementById('docs-list-'+typeId);
  const hdr = listEl?.previousElementSibling;
  const collapsed = _docCollapsed.has(key);
  if(listEl) listEl.style.display = collapsed ? 'none' : 'block';
  if(hdr) { const arrow = hdr.querySelector('span'); if(arrow) arrow.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(90deg)'; }
  _updateDocsToggleAllBtn();
}

function toggleAllDocSections() {
  const allCollapsed = DOC_TYPES.every(t => _docCollapsed.has(t.key));
  DOC_TYPES.forEach(t => {
    if(allCollapsed) _docCollapsed.delete(t.key); else _docCollapsed.add(t.key);
    const listEl = document.getElementById('docs-list-'+_docTypeId(t.key));
    const hdr = listEl?.previousElementSibling;
    const collapsed = !allCollapsed;
    if(listEl) listEl.style.display = collapsed ? 'none' : 'block';
    if(hdr) { const arrow = hdr.querySelector('span'); if(arrow) arrow.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(90deg)'; }
  });
  _updateDocsToggleAllBtn();
}

function _updateDocsToggleAllBtn() {
  const btn = document.getElementById('docs-toggle-all');
  if(!btn) return;
  const allCollapsed = DOC_TYPES.every(t => _docCollapsed.has(t.key));
  btn.textContent = allCollapsed ? '▶ 전체 펼치기' : '▼ 전체 접기';
}

function filterDocs() {
  const q = (document.getElementById('docs-search')?.value||'').toLowerCase().trim();
  DOC_TYPES.forEach(t => {
    const typeId = _docTypeId(t.key);
    const listEl = document.getElementById('docs-list-'+typeId);
    if(!listEl) return;
    const items = listEl.querySelectorAll('.docs-file-item');
    let visibleCount = 0;
    items.forEach(item => {
      const name = item.querySelector('.docs-file-name')?.textContent.toLowerCase()||'';
      const match = !q || name.includes(q);
      item.style.display = match ? '' : 'none';
      if(match) visibleCount++;
    });
    // 검색 중이면 매칭 파일 있는 섹션만 펼치기, 없는 섹션은 접기
    const hdr = listEl.previousElementSibling;
    if(q) {
      const shouldExpand = visibleCount > 0;
      listEl.style.display = shouldExpand ? 'block' : 'none';
      if(hdr){ const arrow=hdr.querySelector('span'); if(arrow) arrow.style.transform=shouldExpand?'rotate(90deg)':'rotate(0deg)'; }
    }
    // 검색어 없으면 원래 접힘 상태로
    if(!q) {
      const collapsed = _docCollapsed.has(t.key);
      listEl.style.display = collapsed ? 'none' : 'block';
      if(hdr){ const arrow=hdr.querySelector('span'); if(arrow) arrow.style.transform=collapsed?'rotate(0deg)':'rotate(90deg)'; }
    }
    // empty 메시지 처리
    let emptyEl = listEl.querySelector('.docs-empty');
    if(q && visibleCount === 0) {
      if(!emptyEl){
        emptyEl = document.createElement('div');
        emptyEl.className = 'docs-empty';
        listEl.appendChild(emptyEl);
      }
      emptyEl.textContent = `"${q}" 검색 결과 없음`;
      emptyEl.style.display = '';
    } else if(emptyEl) {
      emptyEl.style.display = q ? 'none' : '';
    }
  });
  _updateDocsToggleAllBtn();
}

function _docTypeId(key) { return key.replace(/\s+/g,'_').toLowerCase(); }

function _docFileItem(f) {
  const isImg = f.mimetype&&f.mimetype.startsWith('image/');
  const isPdf = f.mimetype==='application/pdf';
  const icon  = isImg?'🖼️': isPdf?'📄':'📁';
  const size  = f.filesize ? (f.filesize/1024/1024).toFixed(1)+' MB' : '';
  const date  = f.uploaded_at ? f.uploaded_at.substring(0,10) : '';
  return `<div class="docs-file-item">
    <div class="docs-file-icon">${icon}</div>
    <div class="docs-file-info">
      <div class="docs-file-name" title="${f.filename}">${f.filename}</div>
      <div class="docs-file-meta">${size}${size&&date?' · ':''}${date}</div>
    </div>
    <div class="docs-file-actions">
      <button class="btn-sec" onclick="window._docFilename='${f.filename}';previewDoc(${f.id},'${f.mimetype||''}')">👁</button>
      <button class="btn-sec" onclick="window.location='/api/documents/${f.id}'">⬇</button>
      ${isViewer()?'':` <button class="btn-sec" style="color:var(--red)" onclick="deleteDoc(${f.id},'${_docTypeId(f.doc_type)}')">✕</button>`}
    </div>
  </div>`;
}

async function uploadDocument(input, docType) {
  if(!VID || !input.files.length) return;
  const formData = new FormData();
  formData.append('doc_type', docType);
  for(const f of input.files) formData.append('file', f);
  setSS('saving');
  try {
    await fetch(`${API}/vessels/${VID}/documents`, {method:'POST', body:formData});
    setSS('synced'); toast(`${input.files.length}개 파일 업로드 완료`);
    // 해당 섹션만 갱신
    const listId = 'docs-list-'+_docTypeId(docType);
    const el = document.getElementById(listId);
    if(el){
      const allDocs = await apiFetch(`${API}/vessels/${VID}/documents?doc_type=${encodeURIComponent(docType)}`);
      el.innerHTML = allDocs&&allDocs.length ? allDocs.map(f=>_docFileItem(f)).join('')
        : '<div class="docs-empty">📂 업로드된 파일이 없습니다</div>';
    }
  } catch(e){ setSS('error'); toast('업로드 실패: '+e.message, true); }
  input.value='';
}

async function deleteDoc(did, typeId) {
  if(!confirm('파일을 삭제하시겠습니까?')) return;
  setSS('saving');
  try {
    // doc_type 복원
    const docType = DOC_TYPES.find(t=>_docTypeId(t.key)===typeId)?.key||'';
    await apiFetch(`${API}/documents/${did}`, 'DELETE');
    setSS('synced'); toast('삭제됐습니다');
    const el = document.getElementById('docs-list-'+typeId);
    if(el && docType){
      const allDocs = await apiFetch(`${API}/vessels/${VID}/documents?doc_type=${encodeURIComponent(docType)}`);
      el.innerHTML = allDocs&&allDocs.length ? allDocs.map(f=>_docFileItem(f)).join('')
        : '<div class="docs-empty">📂 업로드된 파일이 없습니다</div>';
    }
  } catch(e){ setSS('error'); toast('삭제 실패: '+e.message, true); }
}

loadAll();
