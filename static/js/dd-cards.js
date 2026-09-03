/* ============================================================
   dd-cards.js — Dock Manager "Class Items" & "Daily Log" 탭을
   TRMT 현안업무 카드형 UI로 교체 (원본 app.js 무수정, 런타임 override).
   app.js 뒤에 로드. 전역 renderClass/renderDisc 를 재정의.
   편집/모달/첨부/필터/날짜접기 기존 기능 그대로 재사용.
   ============================================================ */
(function () {
  if (window._ddCardsLoaded) return;
  window._ddCardsLoaded = true;
  window._ddClsExp = window._ddClsExp || new Set();  // Class 카드 펼침
  window._ddDscExp = window._ddDscExp || new Set();  // Daily 카드 펼침
  // 안전망: 원본 렌더 보존 → 카드 렌더가 에러나면 원본 테이블로 폴백(탭 안 깨짐)
  var _origCls = window.renderClass, _origDsc = window.renderDisc;

  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function attrArg(s){ return encodeURIComponent(String(s)).replace(/'/g,'%27'); }
  window._ddAttrArg = attrArg;

  // 우선순위 → TRMT .bd .pri-* 매핑 (drydock: Normal/Urgent/Critical/On Hold)
  function priBadge(pri){
    var p = pri || 'Normal', cls='pri-normal', lbl=p;
    if(p==='Critical'){ cls='pri-cocflag'; }
    else if(p==='Urgent'){ cls='pri-urgent'; }
    else if(p==='On Hold'){ cls='pri-nextdd'; }
    return '<span class="bd '+cls+'">'+esc(lbl)+'</span>';
  }
  function statBadge(st, closedVal){
    var closed = (st===closedVal || st==='Closed' || st==='Close');
    return '<span class="bd '+(closed?'status-done':'status-open')+'">'+esc(closed?'Closed':(st||'Open'))+'</span>';
  }
  function timeline(actions, legacy){
    var list = Array.isArray(actions)?actions:(legacy?[{date:'',progress:legacy}]:[]);
    if(!list.length) return '';
    var rows = list.map(function(r){
      return '<div class="act-entry"><span class="act-date">'+esc(r.date||'')+'</span>'+
             '<span class="act-progress'+(r.important?' act-imp':'')+'">'+esc(r.progress||'')+'</span></div>';
    }).join('');
    return '<div class="exp-label">진행사항</div><div class="exp-acts-wrap"><div class="act-entries">'+rows+'</div></div>';
  }
  // 테이블 자리에 카드 컨테이너 마운트(테이블 숨김, #c-body/#d-body 는 DOM 유지)
  function mount(bodyId, hostId, html){
    var tb = document.getElementById(bodyId); if(!tb) return;
    var wrap = tb.closest('.table-wrap');
    var host = document.getElementById(hostId);
    if(!host){
      host = document.createElement('div'); host.id = hostId; host.className='dd-cards';
      if(wrap){ wrap.style.display='none'; wrap.parentNode.insertBefore(host, wrap.nextSibling); }
      else { tb.parentNode.appendChild(host); }
    }
    host.innerHTML = html;
  }

  window._ddTgl = function(kind, id){
    id = String(id);   // _id가 숫자/문자 섞여도 키 타입 통일(펼침 토글 정확)
    var set = kind==='cls' ? window._ddClsExp : window._ddDscExp;
    if(set.has(id)) set.delete(id); else set.add(id);
    (kind==='cls' ? window.renderClass : window.renderDisc)();
  };

  // 날짜 헤더의 Add Log: 모달을 연 뒤 그 그룹 날짜를 바로 넣는다.
  window._ddAddLog = function(event, date){
    event.preventDefault();
    event.stopPropagation();
    if(typeof isViewer==='function' && isViewer()){ toast('읽기 전용 계정입니다', true); return; }
    openDiscModal(null);
    var text = date === '(날짜 없음)' ? '' : date;
    var input = document.getElementById('md-date'), picker = document.getElementById('md-date-pick');
    if(input) input.value = text;
    if(picker) picker.value = text;
  };

  // 카드 제목·상세를 카드 안에서 직접 편집하고 기존 bulk 저장 경로로 보낸다.
  window._ddEditDaily = function(event, id, node, field){
    event.stopPropagation();
    if(typeof isViewer==='function' && isViewer()){ toast('읽기 전용 계정입니다', true); return; }
    var items = (FLEET[VID].discussions)||[];
    var item = items.find(function(d){ return String(d._id)===String(id); });
    if(!item) return;
    var originalHeight = Math.max(34, node.offsetHeight||0);
    var wrap = document.createElement('div');
    wrap.className = 'dd-card-edit-wrap';
    var editor = document.createElement(field==='description' ? 'textarea' : 'input');
    editor.className = 'inline-input dd-card-editor';
    editor.value = item[field]||'';
    if(field==='description') editor.rows = 1;
    var actions = document.createElement('div');
    actions.className = 'dd-card-edit-actions';
    var saveBtn = document.createElement('button');
    saveBtn.type = 'button'; saveBtn.className = 'exp-btn pri'; saveBtn.textContent = '저장';
    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button'; cancelBtn.className = 'exp-btn'; cancelBtn.textContent = '취소';
    actions.append(saveBtn, cancelBtn); wrap.append(editor, actions);
    node.replaceWith(wrap); editor.focus(); editor.select();
    var done = false;
    function cancel(){ if(done) return; done=true; window.renderDisc(); }
    function fit(){
      if(field!=='description') return;
      editor.style.height='auto';
      editor.style.height=Math.max(originalHeight, editor.scrollHeight||0)+'px';
    }
    function save(){
      if(done) return;
      var value=editor.value.trim();
      if(field==='item' && !value){ toast('Topic is required', true); cancel(); return; }
      done=true; item[field]=value;
      Promise.resolve(persist('disc', items)).then(function(){ buildDDF(); window.renderDisc(); });
    }
    fit(); editor.addEventListener('input', fit);
    saveBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); save(); });
    cancelBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); cancel(); });
    editor.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ e.preventDefault(); cancel(); }
      else if(field!=='description' && e.key==='Enter'){ e.preventDefault(); save(); }
      else if(field==='description' && e.key==='Enter' && (e.metaKey||e.ctrlKey)){ e.preventDefault(); save(); }
    });
  };

  // 날짜 그룹과 개별 카드를 한 버튼으로 함께 펼치거나 접는다.
  window._ddToggleDailyAll = function(){
    if(typeof VID==='undefined' || !VID) return;
    var items = (FLEET[VID].discussions)||[];
    var dates = Array.from(new Set(items.map(function(d){ return d.date||'(날짜 없음)'; })));
    var allExpanded = dates.every(function(d){ return !discCollapsed.has(d); }) &&
      items.every(function(d){ return window._ddDscExp.has(String(d._id)); });
    if(allExpanded){
      dates.forEach(function(d){ discCollapsed.add(d); });
      window._ddDscExp.clear();
    }else{
      dates.forEach(function(d){ discCollapsed.delete(d); });
      items.forEach(function(d){ window._ddDscExp.add(String(d._id)); });
    }
    window.renderDisc();
  };

  // ── Class Items 카드 렌더 ────────────────────────────────
  var _cardCls = function(){
    if(typeof VID==='undefined' || !VID) return;
    var items = (FLEET[VID].classItems)||[];
    var g=function(id){ var e=document.getElementById(id); return e?e.value:''; };
    var q=g('c-q').toLowerCase(), sf=g('c-sf'), bf=g('c-bf'), pf=g('c-pf');
    var qf = (typeof _qfCls!=='undefined') ? _qfCls : null;
    var fil = items.filter(function(c){
      if(q && !(c.finding||'').toLowerCase().includes(q) && !(c.description||'').toLowerCase().includes(q)) return false;
      if(sf && c.status!==sf) return false;
      if(bf && !((c.by||'').includes(bf))) return false;
      if(pf && (c.priority||'Normal')!==pf) return false;
      if(qf==='critical' && (c.priority||'Normal')!=='Critical') return false;
      if(qf==='urgent' && (c.priority||'Normal')!=='Urgent') return false;
      if(qf==='open' && c.status!=='Open') return false;
      return true;
    });
    var cnt=document.getElementById('c-cnt'); if(cnt) cnt.textContent = fil.length+' items';
    if(!fil.length){ mount('c-body','c-cards','<div class="dd-empty">No class items found</div>'); return; }
    var html = fil.map(function(c){
      var ri = items.indexOf(c), exp = window._ddClsExp.has(String(c._id));
      var head = '<span class="issue-card-no">'+esc(c.no||'—')+'</span>'+
                 '<span class="card-caret">'+(exp?'▾':'▸')+'</span>'+
                 priBadge(c.priority)+ statBadge(c.status,'Closed')+
                 (c.open_date?'<span class="card-date">'+esc(c.open_date)+'</span>':'');
      var det='';
      if(exp){
        det = '<div class="issue-card-det" onclick="event.stopPropagation()">'+
          (c.description?'<div class="exp-label">상세 내용</div><div class="exp-desc">'+esc(c.description)+'</div>':'')+
          timeline(c.actions, c.action)+
          '<div class="exp-meta">'+(c.by?'담당 '+esc(c.by):'')+(c.close_date?'  ·  완료 '+esc(c.close_date):'')+'</div>'+
          '<div class="exp-btns"><button class="exp-btn pri" onclick="openClassModal('+ri+')">상세 / 편집</button>'+
          '<button class="exp-btn" onclick="openGenAttach(\'class\','+c._id+')">📎 첨부</button></div></div>';
      }
      return '<div class="issue-card'+(exp?' is-expanded':'')+'" onclick="_ddTgl(\'cls\',\''+c._id+'\')">'+
             '<div class="issue-card-head">'+head+'</div>'+
             '<div class="issue-card-body"><div class="issue-card-title">'+esc(c.finding||'—')+'</div></div>'+det+'</div>';
    }).join('');
    mount('c-body','c-cards', html);
  };

  // ── Daily Log 카드 렌더 (날짜 그룹 + 카드) ────────────────
  var _cardDsc = function(){
    if(typeof VID==='undefined' || !VID) return;
    var items = (FLEET[VID].discussions)||[];
    var g=function(id){ var e=document.getElementById(id); return e?e.value:''; };
    var q=g('d-q').toLowerCase(), df=g('d-df'), sf=g('d-sf'), pf=g('d-pf');
    var fil = items.filter(function(d){
      if(q && !(d.item||'').toLowerCase().includes(q) && !(d.description||'').toLowerCase().includes(q)) return false;
      if(df && d.date!==df) return false;
      if(sf && d.status!==sf) return false;
      if(pf && (d.priority||'Normal')!==pf) return false;
      return true;
    });
    // 최초 1회만 전체 접기(플래그) — 매 렌더 재접힘 방지(마지막 날짜 펼쳐도 유지)
    if(!window._ddDiscInit && (typeof _calNavExpandDisc==='undefined' || !_calNavExpandDisc) && discCollapsed.size===0 && fil.length>0){
      [...new Set(fil.map(function(d){return d.date||'(날짜 없음)';}))].forEach(function(d){ discCollapsed.add(d); });
    }
    window._ddDiscInit = true;
    var allDates = Array.from(new Set(items.map(function(d){return d.date||'(날짜 없음)';})));
    var allExpanded = allDates.every(function(d){return !discCollapsed.has(d);}) &&
      items.every(function(d){return window._ddDscExp.has(String(d._id));});
    var allBtn=document.getElementById('btn-daily-expand-all');
    if(allBtn){
      allBtn.textContent = allExpanded ? '▶ 전체 접기' : '▼ 전체 펼치기';
      allBtn.setAttribute('aria-pressed', allExpanded ? 'true' : 'false');
    }
    var cnt=document.getElementById('d-cnt'); if(cnt) cnt.textContent = fil.length+' items';
    if(!fil.length){ mount('d-body','d-cards','<div class="dd-empty">No discussion items found</div>'); return; }

    function card(d){
      var exp = window._ddDscExp.has(String(d._id));
      var idArg = attrArg(d._id);
      var head = '<span class="issue-card-no">'+esc(d.no||'')+'</span>'+
                 '<span class="card-caret">'+(exp?'▾':'▸')+'</span>'+
                 (d.time_of_day?'<span class="bd sess">'+esc(d.time_of_day)+'</span>':'')+
                 priBadge(d.priority)+ statBadge(d.status,'Close');
      var det='';
      if(exp){
        det = '<div class="issue-card-det" onclick="event.stopPropagation()">'+
          '<div class="exp-label">상세 내용</div><div class="exp-desc dd-inline-edit" title="클릭하여 바로 편집" onclick="_ddEditDaily(event,decodeURIComponent(\''+idArg+'\'),this,\'description\')">'+esc(d.description||'—')+'</div>'+
          timeline(d.actions, d.action)+
          '<div class="exp-btns"><button class="exp-btn pri" onclick="openDiscModalById(\''+d._id+'\')">상세 / 편집</button>'+
          '<button class="exp-btn" onclick="openGenAttach(\'disc\','+d._id+')">📎 첨부</button></div></div>';
      }
      return '<div class="issue-card'+(exp?' is-expanded':'')+'" onclick="_ddTgl(\'dsc\',\''+d._id+'\')">'+
             '<div class="issue-card-head">'+head+'</div>'+
             '<div class="issue-card-body"><div class="issue-card-title dd-inline-edit" title="클릭하여 바로 편집" onclick="_ddEditDaily(event,decodeURIComponent(\''+idArg+'\'),this,\'item\')">'+esc(d.item||'—')+'</div></div>'+det+'</div>';
    }

    var isFiltering = q||df||sf||pf;
    if(isFiltering){ mount('d-body','d-cards', fil.map(card).join('')); return; }
    // 날짜 그룹
    var groups={}, order=[];
    fil.forEach(function(d){ var k=d.date||'(날짜 없음)'; if(!groups[k]){groups[k]=[];order.push(k);} groups[k].push(d); });
    var html = order.map(function(k){
      var col = discCollapsed.has(k), n=groups[k].length;
      var dateArg = attrArg(k);
      var hdr = '<div class="dd-date-hdr" onclick="toggleDiscDate(decodeURIComponent(\''+dateArg+'\'))">'+
                '<span class="dd-caret">'+(col?'▶':'▼')+'</span>'+esc(k)+
                '<button class="dd-date-add" type="button" onclick="_ddAddLog(event,decodeURIComponent(\''+dateArg+'\'))">+ Add Log</button>'+
                '<span class="dd-date-cnt">'+n+' item'+(n>1?'s':'')+'</span></div>';
      return hdr + (col?'':'<div class="dd-date-body">'+groups[k].map(card).join('')+'</div>');
    }).join('');
    mount('d-body','d-cards', html);
  };

  // 안전망 래퍼: 카드 렌더 에러 시 원본 테이블 렌더로 폴백
  window.renderClass = function(){
    try { return _cardCls.apply(this, arguments); }
    catch(e){ console.error('[dd-cards] class 카드 렌더 실패 → 원본 폴백', e); if(_origCls) return _origCls.apply(this, arguments); }
  };
  window.renderDisc = function(){
    try { return _cardDsc.apply(this, arguments); }
    catch(e){ console.error('[dd-cards] daily 카드 렌더 실패 → 원본 폴백', e); if(_origDsc) return _origDsc.apply(this, arguments); }
  };

  // 초기 진입 시 이미 그려진 탭 갱신
  try { if(typeof VID!=='undefined' && VID){ window.renderClass(); window.renderDisc(); } } catch(e){}
})();
