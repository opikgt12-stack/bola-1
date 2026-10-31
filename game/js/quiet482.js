'use strict';
// Compact skill feedback reuses the existing charge label: no popup, no overlay.
if(!avatarPreview45){
 let side482=null,notice482=null;
 const label482=()=>document.getElementById('powerLabel');
 function paint482(){
  const el=label482();if(!el)return;
  if(state!=='playing'||notice482&&performance.now()>=notice482.until)notice482=null;
  el.classList.toggle('skill-status482',!!notice482);
  if(notice482){el.textContent=notice482.text;el.dataset.side=notice482.side===0?'own':'rival';el.title=notice482.text;}
  else{el.removeAttribute('data-side');el.removeAttribute('title');}
 }
 const activate482=activateSkill;
 activateSkill=function(p){const previous=side482;side482=p.side;try{return activate482(p)}finally{side482=previous}};
 const announce482=announce;
 announce=function(title,sub='',kind='good'){
  if(side482!==null){
   if(state==='playing'){notice482={text:(side482===0?'Kamu · ':'Lawan · ')+String(title),side:side482,until:performance.now()+1250};paint482()}
   return;
  }
  announce482(title,sub,kind);
 };
 const hud482=updateHud;updateHud=function(){hud482();paint482()};
 const reset482=resetPositions;resetPositions=function(){notice482=null;reset482();paint482()};
 // Fail-safe for legacy callers: never turn "skill ready" into a large toast.
 const toast482=toast;toast=function(text,mark='✓'){if(/^skill siap\b/i.test(String(text)))return;toast482(text,mark)};
}
