/* Interaction-only enhancements. Existing editors and save contracts remain authoritative. */
(function () {
  'use strict';
  const editSelector='.cell-edit[onclick],.remark-cell[onclick],.dd-inline-edit[onclick],.dock-edit-surface';
  function enhance(root){
    const nodes=[];
    if(root.matches && root.matches(editSelector)) nodes.push(root);
    if(root.querySelectorAll) nodes.push(...root.querySelectorAll(editSelector));
    nodes.forEach(node=>{
      if(node.tagName==='BUTTON' || node.querySelector('input,select,textarea,button,a,label,summary,[contenteditable],[role="button"]')) return;
      node.setAttribute('role','button'); node.tabIndex=0;
      if(!node.title) node.title='클릭 또는 Enter로 편집';
    });
    if(root.querySelectorAll) root.querySelectorAll('.modal-x').forEach(node=>node.setAttribute('aria-label','닫기'));
  }
  function syncNavigation(){
    document.querySelectorAll('.vnav-btn[onclick],.tracking-sub-btn').forEach(button=>{
      const match=(button.getAttribute('onclick')||'').match(/(?:showTab|pickTrackingTab)\('([^']+)'/);
      if(!match) return;
      const page=document.getElementById('vt-'+match[1]);
      button.setAttribute('aria-controls','vt-'+match[1]);
      if(page && page.classList.contains('active')) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    [['trackingTriggerBtn','trackingMenu'],['avatarBtn','avatarMenu']].forEach(([triggerId,menuId])=>{
      const trigger=document.getElementById(triggerId),menu=document.getElementById(menuId);
      if(!trigger || !menu) return;
      trigger.setAttribute('aria-controls',menuId);
      trigger.setAttribute('aria-expanded',String(menu.classList.contains('open')));
    });
  }
  enhance(document);
  document.querySelectorAll('.logo[onclick],#avatarBtn,.bc-item[onclick]').forEach(node=>{
    node.setAttribute('role','button'); node.tabIndex=0;
  });
  const logo=document.querySelector('.logo[onclick]');
  if(logo) logo.setAttribute('aria-label','Fleet overview');
  const avatar=document.getElementById('avatarBtn');
  if(avatar) avatar.setAttribute('aria-label','계정 메뉴');
  syncNavigation();
  new MutationObserver(records=>{
    records.forEach(record=>record.addedNodes.forEach(node=>{ if(node.nodeType===1) enhance(node); }));
    syncNavigation();
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

  // Text selection/copy and nested form controls take precedence over editor entry.
  document.addEventListener('click',event=>{
    const surface=event.target.closest(editSelector);
    if(!surface || event.target.closest('input,select,textarea,a,label,summary,[contenteditable]')) return;
    const button=event.target.closest('button');
    if(button && button!==surface) return;
    if((event.detail>0 && String(window.getSelection()||'').trim()) || event.detail>1){
      event.preventDefault(); event.stopImmediatePropagation();
    }
  },true);
  document.addEventListener('keydown',event=>{
    const target=event.target;
    if((event.key==='Enter'||event.key===' ') && target.matches('[role="button"][tabindex="0"]') &&
       !target.matches('button,a,input,select,textarea') && !target.hasAttribute('onkeydown')){
      event.preventDefault(); target.click(); return;
    }
    // Daily status is an existing roving tablist; expose its other tab to keyboards.
    if(target.matches('.dd-status-tabs [role="tab"]') && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      const tabs=Array.from(target.parentElement.querySelectorAll('[role="tab"]'));
      const next=event.key==='Home'?tabs[0]:event.key==='End'?tabs[tabs.length-1]:tabs[(tabs.indexOf(target)+1)%tabs.length];
      event.preventDefault(); next.click(); next.focus(); return;
    }
    const dialogs=Array.from(document.querySelectorAll('.modal-overlay.open'));
    // The focused dialog wins when a nested attachment/reference dialog is open.
    const overlay=target.closest('.modal-overlay.open')||dialogs[dialogs.length-1];
    if(overlay && event.key==='Tab'){
      const focusable=Array.from(overlay.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]'))
        .filter(node=>!node.disabled && node.getClientRects().length && !node.closest('[hidden]'));
      const first=focusable[0],last=focusable[focusable.length-1];
      if(!first){ event.preventDefault(); overlay.querySelector('.modal').focus(); }
      else if(event.shiftKey && (target===first || !focusable.includes(target))){event.preventDefault();last.focus();}
      else if(!event.shiftKey && (target===last || !focusable.includes(target))){event.preventDefault();first.focus();}
    }
    // Escape does not dismiss forms: preserve existing unsaved-edit semantics.
    if(event.key==='Escape' && !overlay && target.closest('#avatarWrap')){
      closeAvatarMenu(); avatar.focus();
    }
  });
})();
