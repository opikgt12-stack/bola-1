'use strict';
// Matchday 4.0 — isolated equipment, floating controls and tournament preferences.
const HOME_COPY = {tagline:'YOUR NEXT MATCH STARTS HERE',eyebrow:'ARCADE FOOTBALL / 1 V 1',titleLine1:'PANGGUNG',titleLine2:'PARA JUARA.',description:'Kepala besar. Duel sengit. Satu gol bisa mengubah segalanya.',playLabel:'Main sekarang',sectionLabel:'PILIH TANTANGANMU',sectionNote:'BUKAN SEKADAR PERTANDINGAN'};
BOOTS.push(
 {id:'boot-copper',sprite:'copper',name:'Copper Pro',rarity:'UNCOMMON',price:650,color:'#e8aa78',shot:1.12,speed:1.06,jump:1.02,reach:1.04,cooldown:.28,info:'Upper tembaga, sol krem. Sentuhan terarah untuk duel jarak dekat.'},
 {id:'boot-arctic',sprite:'arctic',name:'Arctic Touch',rarity:'RARE',price:1400,color:'#a6dcfa',shot:1.28,speed:1.12,jump:1.08,reach:1.10,cooldown:.24,info:'Putih es dengan aksen biru. Kontrol ringan, respons cepat.'},
 {id:'boot-forest',sprite:'forest',name:'Forest Elite',rarity:'RARE',price:1900,color:'#78d9a4',shot:1.33,speed:1.20,jump:1.12,reach:1.12,cooldown:.23,info:'Hijau hutan dan sol gading. Spesialis gerak dan lompatan.'},
 {id:'boot-solar',sprite:'solar',name:'Solar Strike',rarity:'EPIC',price:3200,color:'#ffcc68',shot:1.55,speed:1.16,jump:1.10,reach:1.18,cooldown:.20,info:'Kuning matahari, siluet low-cut. Finisher dengan tembakan kuat.'},
 {id:'boot-royal',sprite:'royal',name:'Royal Control',rarity:'EPIC',price:4500,color:'#bba3ff',shot:1.62,speed:1.25,jump:1.18,reach:1.23,cooldown:.18,info:'Ungu pekat dengan detail perak. Kombinasi kecepatan dan jangkauan.'},
 {id:'boot-carbon',sprite:'carbon',name:'Carbon Apex',rarity:'LEGENDARY',price:6500,color:'#c0cbd9',shot:1.72,speed:1.28,jump:1.21,reach:1.30,cooldown:.16,info:'Hitam karbon, tali terang. Tenaga tinggi dengan bentuk tetap natural.'}
);
for(let i=catalog.length-1;i>=0;i--) if(catalog[i].type==='trail')catalog.splice(i,1);
saved.trail='none';
catalog.push(
 {id:'rubyball',type:'ball',name:'Ruby Match',price:450,color:'#ef7185'},
 {id:'oceanball',type:'ball',name:'Ocean Match',price:500,color:'#62bce5'},
 {id:'pearlball',type:'ball',name:'Pearl Eclipse',price:600,color:'#e8def8'},
 {id:'glove-ice',type:'gear',name:'Arctic Gloves',price:600,color:'#b2e5ff'},
 {id:'glove-sunset',type:'gear',name:'Sunset Gloves',price:850,color:'#ff9876'},
 {id:'glove-carbon',type:'gear',name:'Carbon Gloves',price:1200,color:'#8395ae'},
 {id:'band-gold',type:'gear',name:'Champion Bands',price:1600,color:'#ffd477'}
);
const baseProductArt=productArt;
productArt=function(x){
 if(x.type!=='gear')return baseProductArt(x);
 return x.id==='band-gold'?`<svg viewBox="0 0 100 80" width="100" height="80" aria-hidden="true"><path d="M25 20h22v40H25zm31 0h22v40H56z" fill="${x.color}"/><path d="M25 29h22M25 51h22M56 29h22M56 51h22" stroke="#fff" stroke-width="3"/></svg>`:`<svg viewBox="0 0 100 80" width="100" height="80" aria-hidden="true"><path d="M28 64 18 47q-7-14 0-16l10 10V20q0-8 6-5l4 20V14q0-7 6-3l3 24 2-19q2-7 7-2l-1 23 5-13q5-6 8 0l-6 24-8 16Z" fill="${x.color}" stroke="#e5f5ff" stroke-width="2"/><path d="M27 56h30v12H27z" fill="#18354b"/><path d="m32 42 10-5 12 5-10 7z" fill="#fff" opacity=".7"/></svg>`;
};
function drawGear(c,p){
 if(p.side!==0||p.neutralBoot||(p.preview&&p.character!==selectedFace))return;
 const item=catalog.find(x=>x.id===saved.gear&&x.type==='gear'&&saved.owned.includes(x.id)&&managedConfig?.shop?.[x.id]?.enabled!==false);
 if(!item)return;
 c.fillStyle=item.color;
 for(const side of [-1,1]){rounded(c,side*22-5,-24,10,item.id==='band-gold'?5:12,3);c.fillStyle='#f6fbff';c.fillRect(side*22-3,-22,6,2);c.fillStyle=item.color;}
}
// Complete left half is the movement target, with an independent pointer.
saved.controls={analog:104,shoot:72,skill:58,jump:58,layout:'classic',...(saved.controls||{})};
const moveZone=$('#moveZone'); let stickOrigin={x:0,y:0};
function applyControls(){
 const s=saved.controls,root=$('#app');
 for(const [k,min,max] of [['analog',72,144],['shoot',48,92],['skill',44,80],['jump',44,80]]){
  s[k]=Math.max(min,Math.min(max,Number(s[k])||min));root.style.setProperty('--'+k+'-size',s[k]+'px');
 }
 if(!['classic','compact','arcade'].includes(s.layout))s.layout='classic';
 $('#touchControls').dataset.layout=s.layout;
 root.style.setProperty('--thumb-zone',Math.max(s.analog+28,(s.layout==='compact'?s.skill+s.shoot:s.skill+s.jump)+36)+'px');
}
let stickLimit427=34,knobFrame427=0,knobX427=0,knobY427=0;
function paintKnob427(){knobFrame427=0;knob.style.transform=`translate3d(${knobX427}px,${knobY427}px,0)`;}
function resetAnalog(){
 analogPointer=null;analog.active=false;analog.x=0;analog.jump=false;
 if(knobFrame427)cancelAnimationFrame(knobFrame427);knobFrame427=0;knobX427=knobY427=0;
 knob.style.transform='translate3d(0,0,0)';pad.classList.remove('engaged');pad.style.removeProperty('left');pad.style.removeProperty('top');window.HAOnline422?.flushInput();
}
function analogMove(e){
 const limit=stickLimit427,dx=e.clientX-stickOrigin.x,dy=e.clientY-stickOrigin.y,d=Math.hypot(dx,dy),scale=d>limit?limit/d:1;
 const axis=Math.abs(dx)<limit*.1?0:Math.sign(dx)*Math.min(1,(Math.abs(dx)-limit*.1)/(limit*.9));
 analog.active=true;analog.x=Math.round(axis*50)/50;analog.jump=false;
 knobX427=dx*scale;knobY427=dy*scale;if(!knobFrame427)knobFrame427=requestAnimationFrame(paintKnob427);
 window.HAOnline422?.flushInput();
}
function startStick427(id,e){
 if(analogPointer!==null||!['playing','countdown'].includes(state))return false;
 const custom=typeof hudStore43==='function'&&hudStore43().enabled;
 if(custom)applyHud43();const r=$('#touchControls').getBoundingClientRect(),b=pad.getBoundingClientRect(),size=b.width;stickLimit427=Math.max(12,size*.33);
 analogPointer=id;
 if(custom)stickOrigin={x:b.left+b.width/2,y:b.top+b.height/2};else{
  const x=Math.max(4,Math.min(r.width/2-size-4,e.clientX-r.left-size/2)),y=Math.max(4,Math.min(r.height-size-4,e.clientY-r.top-size/2));
  pad.style.left=x+'px';pad.style.top=y+'px';stickOrigin={x:r.left+x+size/2,y:r.top+y+size/2};
 }
 pad.classList.add('engaged');analogMove(e);return true;
}
if(window.PointerEvent){
moveZone.addEventListener('pointerdown',e=>{e.preventDefault();if(startStick427(e.pointerId,e))try{moveZone.setPointerCapture(e.pointerId)}catch{}},{passive:false});
moveZone.addEventListener('pointermove',e=>{if(e.pointerId===analogPointer){e.preventDefault();const list=e.getCoalescedEvents?.();analogMove(list?.length?list[list.length-1]:e)}},{passive:false});
window.addEventListener('pointermove',e=>{if(e.pointerId===analogPointer&&e.target!==moveZone){e.preventDefault();analogMove(e)}},{passive:false});
for(const name of ['pointerup','pointercancel'])moveZone.addEventListener(name,e=>{if(e.pointerId===analogPointer)resetAnalog()});
for(const ev of ['pointerup','pointercancel'])window.addEventListener(ev,e=>{if(e.pointerId===analogPointer)resetAnalog()});
}else{
// Fallback for touch-only browsers. Pointer-capable browsers use the same gesture once.
moveZone.addEventListener('touchstart',e=>{e.preventDefault();if(analogPointer===null&&e.changedTouches.length)startStick427('touch:'+e.changedTouches[0].identifier,e.changedTouches[0])},{passive:false});
moveZone.addEventListener('touchmove',e=>{if(typeof analogPointer!=='string')return;for(const t of e.changedTouches)if('touch:'+t.identifier===analogPointer){e.preventDefault();analogMove(t)}},{passive:false});
for(const name of ['touchend','touchcancel'])moveZone.addEventListener(name,e=>{for(const t of e.changedTouches)if('touch:'+t.identifier===analogPointer){e.preventDefault();resetAnalog()}},{passive:false});
}
window.addEventListener('blur',resetAnalog);window.addEventListener('resize',()=>{resetAnalog();applyControls()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetAnalog()});
applyControls();
const originalSettings=showSettings;
showSettings=function(from='home'){
 originalSettings(from);
 const panels=$$('.settings-panel'),panel=panels[1],s=saved.controls;
 panel.innerHTML=`<h3>Kontrol mobile</h3><p>Sentuh di mana saja pada <b>setengah layar kiri</b>, lalu geser untuk bergerak. Lompat memakai tombol terpisah di kanan.</p><label class="settings-field">Model tombol<select id="controlLayout"><option value="classic">Classic · segitiga</option><option value="compact">Compact · vertikal</option><option value="arcade">Arcade · kotak</option></select></label>${[['analog','Analog',72,144],['shoot','Shoot',48,92],['skill','Skill',44,80],['jump','Lompat',44,80]].map(([id,label,min,max])=>`<label class="size-control">${label}<output id="size-${id}">${s[id]} px</output><input data-control-size="${id}" aria-label="Ukuran ${label}" type="range" min="${min}" max="${max}" value="${s[id]}"></label>`).join('')}<div class="control-preview" data-layout="${s.layout}"><span class="preview-stick">↔</span><span class="preview-action">↑</span><span class="preview-action">SK</span><span class="preview-action">●</span></div><button id="resetControls" class="outline">Reset kontrol</button><details class="keyboard-help"><summary>Kontrol keyboard</summary><p>A/D gerak · W lompat · Spasi shoot · Q skill · X lob<br>P2: ←/→ gerak · ↑ lompat · Enter shoot · Shift skill<br>Esc jeda.</p></details>`;
 $('#controlLayout').value=s.layout;
 $('#controlLayout').onchange=e=>{s.layout=e.target.value;applyControls();save();$('.control-preview').dataset.layout=s.layout};
 $$('[data-control-size]').forEach(el=>el.oninput=()=>{s[el.dataset.controlSize]=Number(el.value);$('#size-'+el.dataset.controlSize).textContent=el.value+' px';applyControls();save();updateControlPreview()});
 $('#resetControls').onclick=()=>{saved.controls={analog:104,shoot:72,skill:58,jump:58,layout:'classic'};applyControls();save();showSettings(from)};
 updateControlPreview();
};
function updateControlPreview(){const e=$('.control-preview');if(!e)return;const s=saved.controls;e.style.setProperty('--preview-stick',s.analog*.6+'px');for(const [i,k]of ['jump','skill','shoot'].entries())$$('.preview-action')[i].style.width=$$('.preview-action')[i].style.height=s[k]*.7+'px'}
// Tournament setup is editable only before creation; active fixtures use the saved snapshot.
saved.worldOptions={duration:90,difficulty:'normal',player:selectedFace,...saved.worldOptions};
function tournamentOptions421(){
 if(!world)return saved.worldOptions;
 if(!world.options){world.options={...saved.worldOptions};saveWorld();}
 return world.options;
}
function worldOptionsMarkup(){
 const locked=view==='world',o=locked?tournamentOptions421():saved.worldOptions;
 const lock=locked?' disabled aria-disabled="true"':'';
 return `<section class="world-options"><div class="world-options-title"><span>MATCH SETUP</span><b>${locked?'Pengaturan turnamen terkunci':'Atur pertandinganmu'}</b></div><div class="world-options-fields"><label>Pemain<select id="worldPlayer"${lock}>${ROSTER.filter(p=>p.enabled!==false).map(p=>`<option value="${p.id}" ${Number(o.player)===p.id?'selected':''}>${esc(p.name)} · ${esc(skillFor({side:0,character:p.id}).name)}</option>`).join('')}</select></label><label>Waktu bermain<select id="worldDuration"${lock}>${[30,60,90,120,180,300].map(n=>`<option value="${n}" ${Number(o.duration)===n?'selected':''}>${n===90?'1 menit 30 detik':n<60?n+' detik':n/60+' menit'}</option>`).join('')}</select></label><label>Level bot<select id="worldDifficulty"${lock}>${[['easy','Santai'],['normal','Normal'],['hard','Pro'],['elite','Paling Jago']].map(([id,label])=>`<option value="${id}" ${o.difficulty===id?'selected':''}>${label}</option>`).join('')}</select></label></div><div class="world-kit-preview"><canvas id="worldPreview" width="100" height="130" aria-label="Preview pemain dan jersey"></canvas><div><strong id="worldPreviewName"></strong><small>${locked?'Pemain, waktu, dan level bot tetap hingga turnamen selesai.<br>Untuk mengubahnya, mulai turnamen baru.':'Jersey sesuai tim pilihanmu.<br>Bola eksklusif Aurum Cup aktif otomatis.'}</small></div></div></section>`;
}
function drawWorldPreview(team){
 const el=$('#worldPreview');if(!el)return;const c=el.getContext('2d');c.clearRect(0,0,100,130);
 c.save();c.translate(50,122);drawPlayer(c,{x:0,y:0,vx:0,side:0,character:selectedFace,face:1,preview:true,nation:team||world?.team||saved.nation},headImage,true);c.restore();
 $('#worldPreviewName').textContent=faceName(selectedFace)+' · '+nation(team||world?.team||saved.nation).name;
}
function bindWorldOptions(team){
 if(view==='world'){
  selectedFace=Number(tournamentOptions421().player);applyFaces();drawWorldPreview(team);return;
 }
 const read=()=>{
  const o={duration:Number($('#worldDuration').value),difficulty:$('#worldDifficulty').value,player:Number($('#worldPlayer').value)};
  if(!ROSTER[o.player]?.enabled)o.player=ROSTER.findIndex(p=>p.enabled);
  saved.worldOptions=o;
  saved.face=o.player;selectedFace=o.player;applyFaces();save();drawWorldPreview(view==='world-setup'?$('.nation-card.selected')?.dataset.nation:team);
 };
 for(const id of ['worldPlayer','worldDuration','worldDifficulty'])$('#'+id).onchange=read;
 read();
}
const originalWorldSetup=showWorldSetup;
showWorldSetup=function(){
 originalWorldSetup();$('.nation-grid').insertAdjacentHTML('beforebegin',worldOptionsMarkup());bindWorldOptions(saved.nation);
 $$('[data-nation]').forEach(el=>el.addEventListener('click',()=>drawWorldPreview(el.dataset.nation)));
};
const originalInitWorld=initWorld;
initWorld=function(team){originalInitWorld(team);world.options={...saved.worldOptions};saveWorld()};
const originalWorldHub=showWorldHub;
showWorldHub=function(){
 originalWorldHub();if(view!=='world'||world?.status!=='active')return;
 $('#playWorld').insertAdjacentHTML('beforebegin',worldOptionsMarkup());bindWorldOptions(world.team);
};
const originalStartMatch=startMatch;
startMatch=function(){
 if(mode==='world'){
  const o=tournamentOptions421();
  $('#difficulty').value=o.difficulty;
  if(!$('#duration option[value="300"]'))$('#duration').insertAdjacentHTML('beforeend','<option value="300">300</option>');
  $('#duration').value=String(o.duration);saved.face=Number(o.player);selectedFace=Number(o.player);applyFaces();
 }
 originalStartMatch();resetAnalog();applyControls();
};
// Countdown is a compact broadcast card, not a full-pitch text overlay.
function drawKickoff(){
 // Three short beats (0.35s each), then GO (0.35s). Goal restarts use GO only.
 const cx=cameraX+worldViewWidth428()/2,t=Math.max(0,startTimer);
 const beat=t>.35?Math.min(3,Math.ceil((t-.35)/.35)):0;
 const go=beat===0,w=go?194:132,h=go?84:140,x=-w/2,y=-h/2;
 ctx.save();ctx.translate(cx,250);ctx.textAlign='center';
 // Flat cut-corner plate: no scale animation, shadows, gradients or particles.
 ctx.fillStyle=go?'#0a3539f2':'#081c2cf2';
 ctx.beginPath();ctx.moveTo(x+12,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h-12);
 ctx.lineTo(x+w-12,y+h);ctx.lineTo(x,y+h);ctx.lineTo(x,y+12);ctx.closePath();ctx.fill();
 ctx.fillStyle=go?'#83f2cf':'#e6c987';ctx.fillRect(x+12,y,w-24,3);
 if(go){
  ctx.fillStyle='#91f6d7';ctx.font='italic 900 57px Arial';ctx.fillText('GO!',-3,20);
 }else{
  ctx.fillStyle='#a9c4d2';ctx.font='bold 10px Arial';ctx.fillText('KICK OFF',0,-44);
  ctx.fillStyle='#fff3d5';ctx.font='900 74px Arial';ctx.fillText(String(beat),0,30);
  for(let i=0;i<3;i++){ctx.fillStyle=i>=beat-1?'#e6c987':'#294553';ctx.fillRect(-28+i*21,49,14,3)}
 }
 ctx.restore();
}
// Local selection and World Cup balls share a shaded panel renderer.
const BALL_PALETTES={classicball:['#fff','#bdcbd7','#193049'],goldball:['#fff1b8','#b8852b','#754c16'],iceball:['#edffff','#72c2dc','#245c7c'],neonball:['#efffc2','#8cbd35','#284a23'],rubyball:['#ffdfe5','#d25b76','#65283d'],oceanball:['#d0f7ff','#399ac8','#184f7b'],pearlball:['#fff3ff','#c5afd4','#654e85']};
drawBall=function(){
 ctx.save();ctx.fillStyle='#06132140';ctx.beginPath();ctx.ellipse(ball.x,GROUND+1,ball.r*1.3,4,0,0,Math.PI*2);ctx.fill();
 if(saved.effects!==false&&!reducedMotion.matches&&ball.hot>0){
  for(let i=0;i<trail.length;i++){const t=trail[i];ctx.globalAlpha=i/trail.length*.45;ctx.fillStyle=i%2?'#ffcb62':'#ff7242';ctx.beginPath();ctx.ellipse(t.x,t.y,ball.r*(i+1)/trail.length,ball.r*.65,Math.atan2(ball.vy,ball.vx),0,7);ctx.fill()}
 }
 ctx.globalAlpha=1;ctx.translate(ball.x,ball.y);ctx.rotate(ball.spin);
 const cupBall=mode==='world'&&activeTeams,palette=cupBall?['#fff7de','#c5ad7a','#153e4c']:BALL_PALETTES[saved.ball]||BALL_PALETTES.classicball;
 const g=ctx.createRadialGradient(-ball.r*.35,-ball.r*.4,1,0,0,ball.r);g.addColorStop(0,palette[0]);g.addColorStop(1,palette[1]);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,ball.r,0,7);ctx.fill();ctx.save();ctx.clip();
 ctx.fillStyle=palette[2];ctx.strokeStyle=cupBall?'#d8aa50':palette[2];ctx.lineWidth=1;
 if(cupBall){for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.beginPath();ctx.moveTo(-3,-ball.r);ctx.bezierCurveTo(-ball.r,0,-3,ball.r*.7,7,ball.r);ctx.lineTo(11,ball.r);ctx.bezierCurveTo(0,ball.r*.25,-6,-3,1,-ball.r);ctx.fill();ctx.stroke();ctx.restore()}}
 else{ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;ctx.lineTo(Math.cos(a)*ball.r*.44,Math.sin(a)*ball.r*.44)}ctx.closePath();ctx.fill();for(let i=0;i<5;i++){ctx.save();ctx.rotate(i*Math.PI*2/5);ctx.beginPath();ctx.moveTo(0,-ball.r*.4);ctx.lineTo(0,-ball.r);ctx.stroke();ctx.beginPath();ctx.arc(0,-ball.r,ball.r*.25,0,7);ctx.fill();ctx.restore()}}
 ctx.restore();ctx.strokeStyle='#f9ffff88';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,ball.r-.5,0,7);ctx.stroke();ctx.restore();
};
// Faceted projectiles and silhouette FX; no expanding outline circles.
function shard(c,x,y,size,color,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();c.moveTo(0,-size);c.lineTo(size*.38,0);c.lineTo(0,size);c.lineTo(-size*.38,0);c.closePath();c.fill();c.fillStyle='#ffffff77';c.beginPath();c.moveTo(0,-size);c.lineTo(0,size*.4);c.lineTo(-size*.38,0);c.fill();c.restore()}
drawProjectiles=function(){for(const q of projectiles){
 ctx.save();ctx.translate(q.x,q.y);ctx.scale(Math.sign(q.vx),1);
 const fx=saved.effects!==false&&!reducedMotion.matches;
 if(q.id==='freeze'){
  for(let i=0;i<5;i++)shard(ctx,-i*9,Math.sin(q.age*8+i)*8,18-i*2,i%2?'#c6f6ff':'#65c6f4',Math.PI/2);
  shard(ctx,8,0,29,'#c8f7ff',Math.PI/2);
 }else if(q.id==='inflate'){
  ctx.save();ctx.rotate(q.age*(fx?3:0));for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);shard(ctx,0,-13,16,'#ce94ff',.45)}ctx.restore();
  ctx.fillStyle='#fff1ff';rounded(ctx,-6,-6,12,12,3);
 }else{
  for(let i=0;i<4;i++){const y=(i-1.5)*12;ctx.fillStyle=i%2?'#d9ffe1':'#76e7be';ctx.beginPath();ctx.moveTo(-40-i*7,y+5);ctx.quadraticCurveTo(15,y-20,32-i*5,y);ctx.quadraticCurveTo(5,y-4,-40-i*7,y+5);ctx.fill()}
 }
 ctx.restore();
}};
drawSkillEffects=function(){
 for(const w of skillWaves){
  const t=1-w.life/w.total;ctx.save();ctx.globalAlpha=Math.min(1,w.life*3);
  if(saved.effects!==false&&!reducedMotion.matches)for(let i=0;i<7;i++){const a=i*2.399;shard(ctx,w.x+Math.cos(a)*(10+t*52),w.y+Math.sin(a)*(10+t*35),5*(1-t)+1,w.color,a)}
  if(w.label){ctx.font='bold 12px Arial';ctx.textAlign='center';const width=ctx.measureText(w.label).width+20;ctx.fillStyle='#071b30ed';rounded(ctx,w.x-width/2,Math.max(80,w.y-130),width,24,5);ctx.fillStyle=w.color;ctx.fillText(w.label,w.x,Math.max(80,w.y-130)+16)}ctx.restore();
 }
};
drawPlayer=function(c,p,photo=null,mini=false){
 c.save();c.translate(p.x,p.y);const size=p.size||1;c.scale(size,size);
 const fx=saved.effects!==false&&!reducedMotion.matches;
 if(!mini&&fx&&p.giant>0){for(let i=0;i<6;i++)shard(c,Math.cos(i*2.4)*39,-45+Math.sin(i*2.4+simTime)*43,6,'#ffd477',i)}
 drawBasePlayer(c,{...p,x:0,y:0},photo,mini);
 if(!mini){
  if(p.frozen>0){c.fillStyle='#8dddf94d';c.strokeStyle='#e1faff';c.lineWidth=1.5;c.beginPath();c.moveTo(-36,0);c.lineTo(-44,-74);c.lineTo(-25,-116);c.lineTo(19,-121);c.lineTo(40,-90);c.lineTo(35,0);c.closePath();c.fill();c.stroke();for(let i=0;i<4;i++)shard(c,-32+i*21,-18-(i%2)*70,18,'#c6f5ff88',.25)}
  if(p.shield>0){c.save();c.fillStyle='#71c9ff20';c.strokeStyle='#95e5ff';c.lineWidth=2.5;c.beginPath();c.moveTo(-42,-100);c.lineTo(0,-118);c.lineTo(42,-100);c.lineTo(38,-35);c.quadraticCurveTo(20,-4,0,7);c.quadraticCurveTo(-20,-4,-38,-35);c.closePath();c.fill();c.stroke();c.strokeStyle='#d0faff77';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-33,-85+i*19);c.lineTo(0,-94+i*19);c.lineTo(33,-85+i*19);c.stroke()}c.restore()}
  if(p.fire>0&&fx){for(let i=0;i<7;i++){const x=-28+i*9,h=14+Math.sin(simTime*11+i*2)*8;c.fillStyle=i%2?'#ffe18a':'#ff844c';c.beginPath();c.moveTo(x-5,0);c.bezierCurveTo(x-9,-10,x+3,-h,x+1,-h-12);c.bezierCurveTo(x+15,-10,x+8,-3,x+5,0);c.fill()}}
  if(p.heavy>0){c.strokeStyle='#d6a4ff';c.lineWidth=3;for(let i=0;i<3;i++){const x=-25+i*25,y=-11+(fx?Math.sin(simTime*5)*3:0);c.beginPath();c.moveTo(x-5,y-6);c.lineTo(x,y);c.lineTo(x+5,y-6);c.stroke()}shard(c,0,-124,9,'#d5a4ff')}
  if(p.stun>0)for(let i=0;i<3;i++)shard(c,-20+i*20,-114+(i%2)*-8,6,'#d4ffe8',fx?simTime:0);
  const statuses=[['frozen','BEKU','#c1f4ff'],['heavy','LAMBAT','#dfbcff'],['giant','TITAN','#ffdf92'],['fire','METEOR','#ffc98d'],['shield','SHIELD','#afe7ff']].filter(([k])=>p[k]>0);
  statuses.forEach(([k,label,color],i)=>{c.fillStyle='#071b30f0';rounded(c,-40,-145-i*18,80,16,4);c.font='bold 10px Arial';c.textAlign='center';c.fillStyle=color;c.fillText(label+' '+p[k].toFixed(1)+'s',0,-133-i*18)});
 }
 c.restore();
};
SKILL_HELP.inflate='Kutukan gravitasi memperlambat lawan tanpa memperbesar tubuhnya. Efek kristal ungu menandai target.';

const originalShopV4=showShop;
showShop=function(){
 originalShopV4();
 if(shopTab==='gear'){
  $('.shop-grid').insertAdjacentHTML('beforebegin','<div class="gear-notice"><p>Aksesori tampil hanya pada pemainmu. Kosmetik, tanpa bonus tersembunyi.</p><button id="removeGear" class="outline">Lepas aksesori</button></div>');
  $('#removeGear').onclick=()=>{saved.gear=null;save();showShop();toast('Aksesori dilepas')};
 }
};
