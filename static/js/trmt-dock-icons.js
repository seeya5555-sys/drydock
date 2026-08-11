/* Runtime UI emoji replacement for Dock Manager.
   Runs after app.js and observes dynamic renders, leaving user-entered values intact.
   All replacements are monochrome inline SVG; no colour emoji is rendered. */
(function(){
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const paths={
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    folder:'<path d="M3 6h7l2 3h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    paperclip:'<path d="m21.4 11.6-8.8 8.8a6 6 0 0 1-8.5-8.5l8.8-8.8a4 4 0 1 1 5.7 5.7l-8.9 8.8a2 2 0 0 1-2.8-2.8l8.2-8.2"/>',
    warning:'<path d="m12 3 10 18H2z"/><path d="M12 9v4M12 17h.01"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    document:'<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v6h6M9 13h6M9 17h6"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
    save:'<path d="M5 3h12l3 3v15H4V3z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1L14.5 3h-5L9 6a7 7 0 0 0-1.7 1L5 6 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5L5 18l2.3-1a7 7 0 0 0 1.7 1l.5 3h5l.5-3a7 7 0 0 0 1.7-1l2.3 1 2-3.5L19 13c.1-.3.1-.7.1-1z"/>',
    wrench:'<path d="M14 6a4 4 0 0 0-5 5L3 17l4 4 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>',
    eye:'<path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
    pin:'<path d="M15 4 20 9l-4 1-4 4-1 5-2-6-5-2 5-1 4-4z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    upload:'<path d="M12 16V3M7 8l5-5 5 5M4 16v5h16v-5"/>',
    download:'<path d="M12 3v13M7 11l5 5 5-5M4 21h16v-5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    anchor:'<path d="M12 3v14M8 7h8M5 14a7 7 0 0 0 14 0M8 21h8"/>',
    generic:'<circle cx="12" cy="12" r="5"/>'
  };
  const ariaLabels={calendar:'일정',folder:'파일',paperclip:'첨부',warning:'주의',check:'완료',close:'닫기',document:'문서',chart:'현황',edit:'편집',save:'저장',settings:'설정',wrench:'도구',eye:'보기',user:'사용자',bolt:'실행',pin:'고정',search:'검색',upload:'업로드',download:'다운로드',info:'정보',anchor:'Dock Manager',generic:'동작'};
  const map={
    '📅':'calendar','📂':'folder','📁':'folder','📎':'paperclip','⚠':'warning','❗':'warning','🔴':'warning','🟡':'warning','🔶':'warning','✅':'check','❌':'close','📄':'document','📋':'document','📝':'document','🧾':'document','📊':'chart','✏':'edit','✎':'edit','💾':'save','⚙':'settings','🔧':'wrench','🔩':'wrench','👁':'eye','👤':'user','👆':'user','⚡':'bolt','🔥':'bolt','📌':'pin','🔍':'search','📥':'download','⬇':'download','⚓':'anchor','ℹ':'info','❓':'info','💡':'info','🔑':'generic','🏗':'generic','📚':'folder','🚪':'generic','🔒':'generic','⚖':'generic','🖨':'document','📱':'generic','💰':'generic','🛢':'generic','🖼':'document','⭐':'generic','★':'generic','⏸':'generic','🚫':'close','➕':'generic'
  };
  const emoji=/\p{Extended_Pictographic}/u;
  const segmenter=window.Intl&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
  function icon(kind){
    const span=document.createElement('span'); span.className='dd-ui-icon'; span.setAttribute('aria-hidden','true');
    const svg=document.createElementNS(NS,'svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('focusable','false'); svg.innerHTML=paths[kind]||paths.generic; span.appendChild(svg); return span;
  }
  function segments(text){ return segmenter?[...segmenter.segment(text)].map(x=>x.segment):Array.from(text); }
  function transformText(node){
    const text=node.nodeValue; if(!segmenter || !emoji.test(text)) return;
    const frag=document.createDocumentFragment(); let onlyIcon=true, firstKind='generic';
    for(const chunk of segments(text)){
      emoji.lastIndex=0;
      if(emoji.test(chunk)){ const kind=map[chunk]||map[[...chunk][0]]||'generic'; firstKind=kind; frag.appendChild(icon(kind)); }
      else { frag.appendChild(document.createTextNode(chunk)); if(chunk.trim()) onlyIcon=false; }
    }
    const host=node.parentElement;
    if(onlyIcon && host && host.matches('button,a') && !host.getAttribute('aria-label')) host.setAttribute('aria-label',host.getAttribute('title')||ariaLabels[firstKind]||'동작');
    node.parentNode.replaceChild(frag,node);
  }
  function eligible(p){
    if(!p || p.closest('script,style,textarea,code,pre,option,select,input,[contenteditable],[data-dd-icon-skip],.exp-desc,.act-progress,td')) return false;
    return !!p.closest('header,.vessel-nav,.tracking-subnav,.sec-hdr,.modal-title,.modal-hdr,.toast,button,.btn-add,.btn-pri,.btn-sec,.btn-edit,.btn-del,.qf-btn,.fleet-hero,.vessel-banner');
  }
  function sweep(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
      const p=n.parentElement; emoji.lastIndex=0;
      return eligible(p)&&emoji.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }}); const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode); nodes.forEach(transformText);
  }
  function start(){ sweep(document.body); new MutationObserver(ms=>{for(const m of ms) for(const n of m.addedNodes){if(n.nodeType===Node.TEXT_NODE){if(eligible(n.parentElement)) transformText(n);} else if(n.nodeType===Node.ELEMENT_NODE) sweep(n);}}).observe(document.body,{childList:true,subtree:true}); }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
