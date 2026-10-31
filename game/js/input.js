'use strict';
const notificationStack=document.createElement('div');notificationStack.id='notifications';notificationStack.className='notifications';notificationStack.setAttribute('aria-live','polite');$('#app').append(notificationStack);
function resizeWorld(){const w=matchMedia('(max-width:900px) and (orientation:portrait)').matches?(window.HAOnline422?.active()?720:640):1120;configureCanvas428(w,window.ArenaMobile427?.info().quality==='lite');cameraX=window.HAOnline422?.active()?Math.max(0,(1120-w)/2):0}
window.addEventListener('resize',resizeWorld);resizeWorld();
$('#pause').onclick=pause;$('#sound').onclick=toggleSound;$('#fullscreen').onclick=toggleFull;
function jump(p){if(p.onGround&&(p.frozen||0)<=0&&(p.stun||0)<=0){if(p===p1&&window.controlInfo415?.().active&&window.controlInfo415().settings.troll==='reverseRival')return;p.vy=-settings().jumpSpeed*(ROSTER[p.character]?.jump||1)*bootFor(p).jump;p.onGround=false;p.support=null;beep(240,.08,'sine',.07)}}
function tapKey(k){if(state!=='playing')return;if(k===' ')shoot(p1);if(k==='q')shoot(p1,true);if(k==='x'){const held=keys.w;keys.w=true;shoot(p1);keys.w=held}if(k==='Enter'&&mode==='versus')shoot(p2);if(k==='Shift'&&mode==='versus')shoot(p2,true);if(k==='w')jump(p1);if(k==='ArrowUp'&&mode==='versus')jump(p2)}
window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='Escape'){e.preventDefault();if(e.repeat)return;if(!$('#screen').classList.contains('hidden')){if(view==='settings'&&settingsFrom==='pause')showPause();else if(view!=='home')showHome()}else pause();return}if(!$('#screen').classList.contains('hidden'))return;if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(k))e.preventDefault();keys[k]=true;if(!e.repeat)tapKey(k)});
window.addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});function autoPause(){if(window.HAOnline422?.active()){window.HAOnline422.background();return;}keys={};if(['playing','countdown','goal'].includes(state))pause()}window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause()});
// Exactly one gesture stream. Touch actions are pulses, not held auto-fire.
const touchButtons431=new Set(),clearInputs431=[];
window.ArenaInput431={clear(){for(const fn of clearInputs431)fn();keys={};resetAnalog()},touchActive:k=>touchButtons431.has(k)};
$$('[data-key]').forEach(b=>{
 const ids=new Set();let down=false;const k=b.dataset.key;
 function press(){if(down)return;down=true;touchButtons431.add(k);keys[k]=true;b.classList.add('pressed');tapKey(k);if(k!=='w'){keys[k]=false;window.HAOnline422?.flushInput();}}
 function release(){if(ids.size||!down)return;down=false;touchButtons431.delete(k);keys[k]=false;b.classList.remove('pressed');window.HAOnline422?.flushInput();}
 const end=e=>{ids.delete(e.pointerId);release()};
 if(window.PointerEvent){
  b.addEventListener('pointerdown',e=>{e.preventDefault();ids.add(e.pointerId);press();try{b.setPointerCapture(e.pointerId)}catch{}},{passive:false});
  b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
  // Lost capture alone does not mean the finger was released. Window-up remains reliable.
 }else{
  b.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches)ids.add(t.identifier);press()},{passive:false});
  for(const name of ['touchend','touchcancel'])window.addEventListener(name,e=>{for(const t of e.changedTouches)ids.delete(t.identifier);release()},{passive:false});
 }
 const clear=()=>{ids.clear();release()};clearInputs431.push(clear);window.addEventListener('blur',clear);window.addEventListener('resize',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
});
// Mobile-safe image decoding: bundled assets work from a local folder and static hosting.
bootManaged().then(ok=>{if(!ok)return;Promise.all(FACE_SOURCES.map(src=>new Promise(res=>{if(!src){res(null);return}const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src}))).then(images=>{faceImages.push(...images);rivalIndex=enabledRival();applyFaces();showHome();requestAnimationFrame(frame)})});
if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>{if(r.scope===new URL('./',location.href).href)r.unregister()}));
