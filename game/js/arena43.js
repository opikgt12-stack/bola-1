'use strict';
// Matchday 4.3: small cached visuals, responsive fixtures and editable touch HUD.
const clamp43=(n,a,b)=>Math.max(a,Math.min(b,n));
let impact43=null;
function strike43(p,buffer=true){
 if(state!=='playing'||p.cool>0||p.frozen>0||p.stun>0)return false;
 const boot=bootFor(p),size=p.size||1,dx=ball.x-p.x,dy=ball.y-(p.y-36*size);
 if(Math.abs(dx)>86*boot.reach*size+ball.r*.4||Math.abs(dy)>83*size){
  if(buffer)p.shotBuffer43=simTime+.16;
  if((p.swing43||0)<simTime){p.kick=.18;p.swing43=simTime+.18;}
  return false;
 }
 const lob=p.side===0?!!keys.x:mode==='versus'?!!keys.ArrowDown:!!p.aiLob;
 const low=p.side===0&&keys.s,fire=p.fire>0,dir=p.side===0?1:-1;
 const speed=settings().shotSpeed*(ROSTER[p.character]?.shot||1)*boot.shot*(p.side===0?1.23:1.12)*(fire?1.32:1);
 const speedLimit=bootShotLimit416(p);
 ball.vx=dir*Math.min(speedLimit,speed*(lob?.78:1))+p.vx*.12;
 // A shallow, distance-aware drive. Physics, defenders and the posts still decide the goal.
 const distance=Math.abs((dir>0?RIGHT:LEFT)-ball.x),travel=clamp43(distance/Math.max(450,Math.abs(ball.vx)),.1,.9);
 const target=GROUND-36-clamp43(distance*.018,0,14);
 const aim=(target-ball.y-.5*settings().gravity*travel*travel)/travel;
 ball.vy=lob?-settings().lobSpeed*.94:low?-95:clamp43(aim,-355,110);
 ball.hot=fire?2:0;ball.lastTouch=p.side;ball.stuckTime=0;ball.strikeGuard43={side:p.side,until:simTime+.11};
 p.cool=Math.max(.09,boot.cooldown*.86);p.bootCool=.15;p.kick=.28;p.shotBuffer43=0;
 matchMetrics.shots=(matchMetrics.shots||0)+(p.side===0?1:0);
 sfx('kick',.8);impact43={x:ball.x,y:ball.y,t:simTime,color:fire?'#ffd08a':'#d7fff4'};
 if(settings().cameraShake&&saved.effects!==false)shake=fire?3:1.1;
 return true;
}
shoot=function(p,power=false){
 if(power){if(state==='playing'&&p.cool<=0&&p.frozen<=0&&p.stun<=0&&p.power>=100)activateSkill(p);return}
 strike43(p);
};
const bootContact43=collideBoot,headContact43=collideHead;
function ownStrikeGuard43(p){return ball.strikeGuard43?.side===p.side&&ball.strikeGuard43.until>simTime}
collideBoot=function(p){
 if(ownStrikeGuard43(p)){p.bootCool=Math.max(0,(p.bootCool||0)-1/120);return}
 const before=ball.lastTouch,old=ball.vx;bootContact43(p);
 if(p.bootCool===.18&&ball.lastTouch===p.side&&(before!==p.side||old!==ball.vx)){
  const dir=p.side===0?1:-1;
  ball.vx=dir*Math.max(Math.abs(ball.vx),Math.min(ballSpeedLimit(),settings().shotSpeed*.77*bootFor(p).shot));
  ball.vy=-135;ball.strikeGuard43={side:p.side,until:simTime+.065};
 }
};
collideHead=function(p){if(!ownStrikeGuard43(p))headContact43(p)};
const simulation43=simulate;
simulate=function(dt){
 if(state==='playing')for(const p of [p1,p2])if(p.shotBuffer43>simTime)strike43(p,false);
 simulation43(dt);
 // Bound decorative allocations on low-memory devices; gameplay projectiles are never culled.
 if(particles.length>110)particles.splice(0,particles.length-110);
};
const resetPositions43=resetPositions;
resetPositions=function(){resetPositions43();ball.strikeGuard43=null;impact43=null;p1.shotBuffer43=p2.shotBuffer43=0};
const ballDraw43=drawBall;
drawBall=function(){
 ballDraw43();if(!impact43||saved.effects===false||reducedMotion.matches)return;
 const age=simTime-impact43.t;if(age<0||age>.14)return;
 ctx.save();ctx.globalAlpha=1-age/.14;ctx.strokeStyle=impact43.color;ctx.lineWidth=2;
 for(let i=0;i<5;i++){const a=i*1.256,r=10+age*90;ctx.beginPath();ctx.moveTo(impact43.x+Math.cos(a)*r,impact43.y+Math.sin(a)*r);ctx.lineTo(impact43.x+Math.cos(a)*(r+7),impact43.y+Math.sin(a)*(r+7));ctx.stroke()}ctx.restore();
};
// A full-size cached pitch texture. No per-frame gradients or canvas resizing.
const pitchPaint43=paintStadium;
paintStadium=function(c){
 pitchPaint43(c);c.save();c.globalAlpha=.12;
 for(let i=0;i<230;i++){const x=(i*167)%1120,y=402+(i*31)%137;c.fillStyle=i%2?'#d8f7b5':'#062d27';c.fillRect(x,y,1+(i%3),1)}
 c.globalAlpha=1;c.strokeStyle='#e8ffe066';c.lineWidth=1;c.strokeRect(54,444,87,65);c.strokeRect(979,444,87,65);
 c.fillStyle='#efffe580';for(const x of [170,950]){c.beginPath();c.ellipse(x,476,2,1.5,0,0,7);c.fill()}c.restore();
};
const goalLayers43={};
function makeGoal43(left,front){
 const layer=document.createElement('canvas');layer.width=132;layer.height=170;
 const c=layer.getContext('2d'),x=left?112:20,back=left?28:104,dir=left?-1:1,top=12,bottom=150;
 c.save();
 if(!front){
  c.fillStyle='#02192250';c.beginPath();c.ellipse((x+back)/2,153,53,7,0,0,7);c.fill();
  c.fillStyle='#c9e2e70c';c.beginPath();c.moveTo(x,top);c.lineTo(back,top+15);c.lineTo(back,bottom);c.lineTo(x,bottom);c.closePath();c.fill();
  c.save();c.clip();c.lineWidth=.65;c.strokeStyle='#e5f3ef80';
  for(let y=top;y<=bottom;y+=9){c.beginPath();c.moveTo(x,y);c.lineTo(back,y+15*(bottom-y)/(bottom-top));c.stroke()}
  for(let i=0;i<=12;i++){const t=i/12,xx=x+(back-x)*t;c.beginPath();c.moveTo(xx,top+15*t);c.quadraticCurveTo(xx+dir*3,90,xx,bottom);c.stroke()}
  c.restore();c.strokeStyle='#93aaaf';c.lineWidth=2.5;c.beginPath();c.moveTo(x,top);c.lineTo(back,top+15);c.lineTo(back,bottom);c.lineTo(x,bottom);c.stroke();
  c.strokeStyle='#bbcdd0';c.lineWidth=1.5;c.beginPath();c.moveTo(x,bottom);c.lineTo(back,top+15);c.stroke();
 }else{
  c.lineCap='round';const g=c.createLinearGradient(x-4,0,x+5,0);g.addColorStop(0,'#a0b7c0');g.addColorStop(.35,'#fff');g.addColorStop(.65,'#edf7f8');g.addColorStop(1,'#76969f');
  c.strokeStyle='#051c2b60';c.lineWidth=10;c.beginPath();c.moveTo(x+2,bottom);c.lineTo(x+2,top+2);c.lineTo(back,top+2);c.stroke();
  c.strokeStyle=g;c.lineWidth=6;c.beginPath();c.moveTo(x,bottom);c.lineTo(x,top);c.lineTo(back,top);c.stroke();
  c.strokeStyle='#ffffff';c.lineWidth=1;c.beginPath();c.moveTo(x-1,bottom-3);c.lineTo(x-1,top+2);c.lineTo(back,top+2);c.stroke();
  c.fillStyle='#d9e6e3';c.fillRect(x-5,bottom-2,10,4);c.fillStyle='#536d75';c.fillRect(x-4,bottom-1,8,1);
  c.fillStyle='#f4fbff';c.beginPath();c.arc(x,top,3,0,7);c.fill();
 }
 c.restore();return layer;
}
drawGoal=function(left,front=false){
 const key=left+'|'+front;goalLayers43[key]??=makeGoal43(left,front);
 const offset=left?0:988;ctx.drawImage(goalLayers43[key],offset,POST-12);
 if(!front&&netWaves[left?0:1]>.03&&saved.effects!==false&&!reducedMotion.matches){
  const x=left?LEFT:RIGHT,back=left?28:1092,dir=left?-1:1,pulse=netWaves[left?0:1]*Math.sin(simTime*28)*6;
  ctx.save();ctx.strokeStyle='#f0fff694';ctx.lineWidth=.8;
  for(let y=POST+24;y<GROUND;y+=24){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((x+back)/2+dir*pulse,y+10,back,y+12);ctx.stroke()}ctx.restore();
 }
};
// Matchday group tables: clear alignment, matchday fixtures and qualification markers.
worldTable=function(){
 const index=clamp43(worldTab,0,7),group=world.groups[index],rows=rankGroup(group),day=Math.min(2,world.day);
 return `<section class="group-panel43"><div class="group-tabs" role="tablist" aria-label="Pilih grup">${world.groups.map((g,i)=>`<button role="tab" aria-selected="${index===i}" data-group="${i}" class="${index===i?'active':''}">Grup ${String.fromCharCode(65+i)}</button>`).join('')}</div><div class="group-caption43"><div><span>KLASEMEN</span><h2>Grup ${String.fromCharCode(65+index)}</h2></div><small><i></i> 2 teratas lolos</small></div><div class="standings"><table><thead><tr><th scope="col">#</th><th scope="col">NEGARA</th><th scope="col">M</th><th scope="col">MNG</th><th scope="col">S</th><th scope="col">K</th><th scope="col">SG</th><th scope="col">PTS</th></tr></thead><tbody>${rows.map((t,i)=>`<tr class="${t.id===world.team?'your-team':''} ${i<2?'qualifier43':''}"><td>${i+1}</td><th scope="row"><span class="team-cell43">${flagMarkup(t.id)}<span>${esc(nation(t.id).name)}${t.id===world.team?'<small>TIM KAMU</small>':''}</span></span></th><td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf-t.ga>0?'+':''}${t.gf-t.ga}</td><td><b>${t.pts}</b></td></tr>`).join('')}</tbody></table></div><div class="group-legend43">M: main · MNG: menang · S: seri · K: kalah · SG: selisih gol</div><div class="fixture-strip43"><span>MATCHDAY ${day+1}</span>${groupSchedule(day).map(([a,b])=>`<div>${flagMarkup(group[a].id)}<b>${group[a].id}</b><small>vs</small><b>${group[b].id}</b>${flagMarkup(group[b].id)}</div>`).join('')}</div></section>`;
};
const hub43=showWorldHub;
showWorldHub=function(){
 hub43();if(view!=='world')return;
 const layout=$('.world-layout'),options=$('.world-next .world-options');
 if(options){options.classList.add('match-options43');layout.append(options)}
 const aside=$('.world-next');aside.insertAdjacentHTML('afterbegin',`<span class="broadcast-label43">PIALA DUNIA / ${world.status==='eliminated'?'HASIL AKHIR':'MATCH CENTRE'}</span>`);
 const heading=$('.page-heading h1');if(world.phase==='group'&&world.status==='active'&&heading)heading.textContent='Fase grup · Matchday '+(world.day+1);
 if(!$('.world-history').children.length)$('.world-history').innerHTML='<span class="history-empty43">Perjalananmu dimulai di sini. Mainkan tiga laga untuk lolos dari grup.</span>';
};
// User-adjustable HUD uses center coordinates in percent and separate orientation profiles.
const HUD43={analog:'#analog',shoot:'.shoot',skill:'.skill-action',jump:'.jump-action',score:'#matchHud',tools:'#matchTools',power:'#matchBottom'};
const HUD_LABEL43={analog:'Analog',shoot:'Shoot',skill:'Skill',jump:'Lompat',score:'Skor',tools:'Jeda / suara',power:'Meter skill'};
function hudOrientation43(w=innerWidth,h=innerHeight){return w>h?'landscape':'portrait'}
function defaultHud43(orientation){return orientation==='landscape'?{analog:[12,76],shoot:[89,77],skill:[94,49],jump:[81,50],score:[50,10],tools:[89,10],power:[31,89]}:{analog:[19,83],shoot:[85,85],skill:[88,69],jump:[68,72],score:[50,6],tools:[78,59],power:[27,59]}}
function hudStore43(){const c=saved.controls;c.hud43=c.hud43&&typeof c.hud43==='object'?c.hud43:{enabled:false,opacity:.88};return c.hud43}
function hudProfile43(o){return {...defaultHud43(o),...(hudStore43()[o]||{})}}
function validCenter43(value,fallback){return Array.isArray(value)&&value.length===2&&value.every(n=>Number.isFinite(n))?value:fallback}
function applyHud43(){
 const store=hudStore43(),root=$('#app'),touch=$('#touchControls'),enabled=!!store.enabled&&(innerWidth<=900||matchMedia('(pointer:coarse)').matches);
 touch.classList.toggle('custom-hud43',enabled);root.classList.toggle('hud-active43',enabled);
 touch.style.setProperty('--hud-opacity43',clamp43(Number(store.opacity)||.88,.4,1));
 if(!enabled){for(const selector of Object.values(HUD43)){const el=$(selector);for(const prop of ['left','top','bottom','right','transform','position','width','height','inset'])el.style.removeProperty(prop)}moveZone.style.cssText='';moveZone.setAttribute('aria-label','Area analog kiri');return}
 const o=hudOrientation43(root.clientWidth,root.clientHeight),profile=hudProfile43(o),defaults=defaultHud43(o),r=root.getBoundingClientRect();
 for(const [key,selector]of Object.entries(HUD43)){
  const el=$(selector),value=validCenter43(profile[key],defaults[key]);
  el.style.left=clamp43(value[0],1,99)+'%';el.style.top=clamp43(value[1],1,99)+'%';
  el.style.right='auto';el.style.bottom='auto';
 }
 // Clamp rendered rectangles, including enlarged controls, after CSS sizing.
 for(const selector of Object.values(HUD43)){
  const el=$(selector),b=el.getBoundingClientRect();if(!b.width||!b.height)continue;
  const dx=b.left<r.left+8?r.left+8-b.left:b.right>r.right-8?r.right-8-b.right:0;
  const dy=b.top<r.top+8?r.top+8-b.top:b.bottom>r.bottom-8?r.bottom-8-b.bottom:0;
  if(dx)el.style.left=parseFloat(el.style.left)+dx/r.width*100+'%';if(dy)el.style.top=parseFloat(el.style.top)+dy/r.height*100+'%';
 }
 const b=pad.getBoundingClientRect(),size=Math.min(190,saved.controls.analog+46);
 moveZone.setAttribute('aria-label','Area analog custom');
 moveZone.style.cssText=`inset:auto;left:calc(${pad.style.left} - ${size/2}px);top:calc(${pad.style.top} - ${size/2}px);width:${size}px;height:${size}px;border-radius:50%`;
}
const applyControls43=applyControls;
applyControls=function(){applyControls43();applyHud43()};
const resetAnalog43=resetAnalog;
resetAnalog=function(){resetAnalog43();if(hudStore43().enabled)applyHud43()};
const setMatchUI43=setMatchUI;
setMatchUI=function(on){setMatchUI43(on);if(on)applyHud43()};
function openHudEditor43(){
 if($('#hudEditor43'))return;
 keys={};resetAnalog();const initial=JSON.parse(JSON.stringify(hudStore43())),draft=JSON.parse(JSON.stringify(initial));
 const dialog=document.createElement('dialog');dialog.id='hudEditor43';dialog.setAttribute('aria-label','Editor HUD mobile');
 dialog.innerHTML=`<div class="hud-editor-top43"><div><b>Atur HUD</b><small>Geser tanpa menumpuk · portrait & landscape terpisah</small></div><button id="hudCancel43" class="outline">Batal</button><button id="hudSave43" class="primary">Simpan</button></div><div class="hud-editor-stage43"><canvas width="1120" height="560" aria-hidden="true"></canvas><span class="hud-field-label43">PREVIEW KONTROL · BUKAN PERTANDINGAN AKTIF</span>${Object.keys(HUD43).map(k=>`<button class="hud-handle43 hud-${k}43" data-hud="${k}" aria-label="Posisi ${HUD_LABEL43[k]}. Geser atau gunakan tombol panah.">${k==='analog'?'↔':k==='jump'?'↑':k==='shoot'?'◎':k==='score'?'0 : 0':k==='tools'?'Ⅱ · ♪':k==='power'?'SKILL ▰▰▰': 'ϟ'}<small>${HUD_LABEL43[k]}</small></button>`).join('')}</div><div class="hud-editor-bottom43"><button id="hudReset43" class="outline">Reset posisi</button><label>Transparansi <input id="hudOpacity43" aria-label="Opasitas tombol HUD" type="range" min="40" max="100" value="${Math.round((draft.opacity||.88)*100)}"></label><span id="hudOrientation43"></span></div>`;
 document.body.append(dialog);dialog.showModal();
 const stage=$('.hud-editor-stage43'),preview=stage.querySelector('canvas');preview.getContext('2d').drawImage(stadiumCache,0,0);
 let orientation=hudOrientation43(),drag=null;
 const dimensions=k=>({analog:[saved.controls.analog,saved.controls.analog],shoot:[saved.controls.shoot,saved.controls.shoot],skill:[saved.controls.skill,saved.controls.skill],jump:[saved.controls.jump,saved.controls.jump],score:orientation==='portrait'?[252,77]:[260,65],tools:[134,40],power:[136,76]})[k];
 function paint(){
  orientation=hudOrientation43();draft[orientation]??=JSON.parse(JSON.stringify(defaultHud43(orientation)));
  $('#hudOrientation43').textContent=orientation==='portrait'?'PORTRAIT':'LANDSCAPE';
  for(const el of stage.querySelectorAll('[data-hud]')){const k=el.dataset.hud,[w,h]=dimensions(k),r=stage.getBoundingClientRect();el.style.width=Math.min(w,r.width-16)+'px';el.style.height=Math.min(h,r.height-16)+'px';el.style.opacity=String(draft.opacity||.88);
   const raw=validCenter43(draft[orientation][k],defaultHud43(orientation)[k]);
   const x=clamp43(raw[0],(w/2+8)/r.width*100,100-(w/2+8)/r.width*100),y=clamp43(raw[1],(h/2+8)/r.height*100,100-(h/2+8)/r.height*100);
   el.style.left=x+'%';el.style.top=y+'%';
  }
 }
 function place(el,x,y){const r=stage.getBoundingClientRect(),b=el.getBoundingClientRect();draft[orientation][el.dataset.hud]=[clamp43((x-r.left)/r.width*100,(b.width/2+8)/r.width*100,100-(b.width/2+8)/r.width*100),clamp43((y-r.top)/r.height*100,(b.height/2+8)/r.height*100,100-(b.height/2+8)/r.height*100)];paint()}
 stage.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-hud]');if(!el)return;e.preventDefault();el.setPointerCapture(e.pointerId);const r=el.getBoundingClientRect();drag={el,id:e.pointerId,dx:e.clientX-r.left-r.width/2,dy:e.clientY-r.top-r.height/2};el.classList.add('dragging')});
 stage.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId){e.preventDefault();place(drag.el,e.clientX-drag.dx,e.clientY-drag.dy)}});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,e=>{if(drag?.id===e.pointerId){drag.el.classList.remove('dragging');drag=null}});
 stage.addEventListener('keydown',e=>{const el=e.target.closest('[data-hud]'),d={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];if(el&&d){e.preventDefault();const b=el.getBoundingClientRect();place(el,b.left+b.width/2+d[0],b.top+b.height/2+d[1])}});
 const ro=new ResizeObserver(paint);ro.observe(stage);
 function close(saveChanges){ro.disconnect();if(saveChanges){draft.enabled=true;Object.assign(hudStore43(),draft);save();applyControls();toast('Posisi HUD disimpan untuk browser ini.','✓')}dialog.close();dialog.remove()}
 $('#hudCancel43').onclick=()=>close(false);$('#hudSave43').onclick=()=>close(true);dialog.addEventListener('cancel',e=>{e.preventDefault();close(false)});
 $('#hudReset43').onclick=()=>{draft[orientation]=defaultHud43(orientation);paint()};
 $('#hudOpacity43').oninput=e=>{draft.opacity=Number(e.target.value)/100;paint()};paint();
}
const settings43=showSettings;
showSettings=function(from='home'){
 settings43(from);const panel=$$('.settings-panel')[1];
 panel.insertAdjacentHTML('afterbegin',`<div class="hud-settings43"><span>LAYOUT MILIKMU</span><h3>Kontrol di tempat yang pas.</h3><p>Geser analog, tombol aksi, skor, meter skill dan tombol jeda. Layout tersimpan terpisah untuk portrait dan landscape.</p><button id="hudEdit43" class="primary">Atur posisi HUD →</button><label><input type="checkbox" id="hudEnabled43" ${hudStore43().enabled?'checked':''}> Gunakan posisi custom (analog tetap)</label></div>`);
 $('#fxToggle')?.addEventListener('click',()=>$('#app').classList.toggle('motion-off43',saved.effects===false));
 const help=panel.querySelector('.keyboard-help p');if(help)help.textContent='A/D gerak · W lompat · Spasi shoot · Q skill · X lob. P2: ←/→ gerak · ↑ lompat · Enter shoot · Shift skill · ↓ lob. Esc jeda.';
 $('#hudEdit43').onclick=openHudEditor43;$('#hudEnabled43').onchange=e=>{hudStore43().enabled=e.target.checked;applyControls();save()};
};
const pause43=showPause;
showPause=function(){pause43();const b=document.createElement('button');b.className='outline';b.textContent='Atur posisi HUD';b.onclick=openHudEditor43;$('#splash').append(b)};
// Short transform/opacity transitions, not a second animation loop.
const render43=renderPage;
renderPage=function(...args){
 window.menuCanvasDirty43=true;render43(...args);$('#app').classList.toggle('motion-off43',saved.effects===false);
 const cards=$$('#screen .competition-tile,#screen .premium-dock button,#screen .mode-card,#screen .roster-card,#screen .settings-panel,#screen .challenge-card,#screen .boot-card,#screen .skill-shop-card');
 cards.slice(0,24).forEach((el,i)=>{el.classList.add('enter43');el.style.setProperty('--delay43',Math.min(i,6)*25+'ms')});
};
const home43=showHome;
showHome=function(){home43();const label=$('#shopMenu span');if(label)label.textContent='Shop & skill';$('.brand-edition').textContent='MATCHDAY / 4.3';$('.premium-hero').insertAdjacentHTML('beforeend','<span class="hero-corner43">DUEL READY <i></i></span>')};
applyHud43();
