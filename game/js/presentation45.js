'use strict';
const avatarPreview45=new URLSearchParams(location.search).get('avatarPreview45')==='1';
if(avatarPreview45){
 // A read-only preview session: no analytics, progress writes, match loop or audio.
 save=function(){};eventMetric=function(){};frame=function(){};
 let previewMounted45=false,previewData45=null,previewImage45=null,previewPath45='',imageSerial45=0,previewDrag45=null,previewView45=null;
 const status45=message=>parent.postMessage({type:'ha45:status',message},location.origin);
 function paintAvatarStudio45(){
  if(!previewMounted45||!previewData45)return;
  const {index,player:p}=previewData45;ROSTER[index]=p;selectedFace=index;activeTeams=null;mode='quick';
  const who={x:0,y:0,vx:0,vy:0,side:0,character:index,face:1,onGround:true,neutralBoot:true,preview:true,nation:p.nation,size:1,kick:0};
  for(const id of ['headDragCanvas45','headResultCanvas45']){
   const el=document.getElementById(id),c=el.getContext('2d');c.clearRect(0,0,300,360);
   c.fillStyle=id==='headDragCanvas45'?'#102f3b':'#0c2632';c.fillRect(0,0,300,360);
   let b=avatarBounds473(who,previewImage45);
   if(id==='headDragCanvas45'){
    // Stable room around all legal offsets, so dragging never recentres the canvas.
    b=avatarBounds473(who,previewImage45,{...p,headX:0,headY:0});
    b={minX:b.minX-22,maxX:b.maxX+22,minY:b.minY-18,maxY:b.maxY+18};
    previewView45=fitAvatarCanvas473(el,who,previewImage45,{bounds:b,padding:20,maxScale:2});
   }else fitAvatarCanvas473(el,who,previewImage45,{padding:24,maxScale:1.6});
  }
 }
 function receiveAvatar45(d){
  if(!d||d.type!=='ha45:avatar'||!Number.isInteger(d.index)||d.index<0||d.index>63||!d.player||typeof d.player!=='object')return;
  const p={...d.player};p.headX=clamp43(Number(p.headX)||0,-14,14);p.headY=clamp43(Number(p.headY)||0,-10,10);previewData45={index:d.index,player:p};
  if(!previewMounted45)return;
  const path=String(p.image||'');
  if(path!==previewPath45){previewPath45=path;previewImage45=null;const serial=++imageSerial45;
   if(path){let url;try{url=new URL(path,location.href);if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol))throw Error()}catch{status45('Preview hanya menerima aset gambar dari situs ini.');paintAvatarStudio45();return}
    const image=new Image();image.onload=()=>{if(serial!==imageSerial45)return;previewImage45=image;paintAvatarStudio45();status45('Geser kepala di avatar kiri. Preview kanan mengikuti secara langsung.')};image.onerror=()=>{if(serial!==imageSerial45)return;status45('Foto belum dapat dimuat. Periksa path atau unggah foto baru.');paintAvatarStudio45()};image.src=url.href;
   }else status45('Avatar ini belum punya foto. Unggah foto kepala untuk memakai editor geser.');
  }
  paintAvatarStudio45();
 }
 function studioCoordinates45(canvas){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/300,r.height/360);return{scale,left:r.left+(r.width-300*scale)/2,top:r.top+(r.height-360*scale)/2}}
 function moveHead45(x,y){if(!previewData45)return;const p=previewData45.player;p.headX=clamp43(x,-14,14);p.headY=clamp43(y,-10,10);paintAvatarStudio45();parent.postMessage({type:'ha45:head',index:previewData45.index,x:p.headX,y:p.headY},location.origin)}
 function mountAvatarStudio45(){
  if(previewMounted45)return;state='menu';keys={};previewMounted45=true;document.body.classList.add('avatar-preview-body45');
  const root=document.createElement('section');root.id='avatarPreviewRoot45';root.innerHTML='<div class="preview-panes45"><section><span>EDITOR / GESER KEPALA</span><canvas id="headDragCanvas45" width="300" height="360" tabindex="0" aria-label="Editor posisi kepala. Geser dengan jari atau mouse; tombol panah untuk penyesuaian halus."></canvas></section><section><span>PREVIEW AVATAR</span><canvas id="headResultCanvas45" width="300" height="360" aria-label="Preview avatar lengkap sesuai posisi kepala"></canvas></section></div><p class="preview-help45">Tarik kepala dengan mouse atau jari. Foto tampil utuh. Geser di mana saja pada editor kiri; ukuran dan kemiringan diatur di dashboard.</p>';document.body.append(root);
  const c=document.getElementById('headDragCanvas45');c.addEventListener('pointerdown',e=>{if(previewDrag45||!previewData45?.player.image||!previewImage45)return;e.preventDefault();c.focus();c.setPointerCapture(e.pointerId);previewDrag45={id:e.pointerId,x:e.clientX,y:e.clientY,headX:previewData45.player.headX||0,headY:previewData45.player.headY||0,scale:previewView45?.scale||1};c.classList.add('dragging')});
  c.addEventListener('pointermove',e=>{if(previewDrag45?.id!==e.pointerId)return;e.preventDefault();const r=studioCoordinates45(c);moveHead45(previewDrag45.headX+(e.clientX-previewDrag45.x)/r.scale/previewDrag45.scale/(window.avatarHeadScale412?.({preview:true})||window.G47?.headK||1),previewDrag45.headY+(e.clientY-previewDrag45.y)/r.scale/previewDrag45.scale/(window.avatarHeadScale412?.({preview:true})||window.G47?.headK||1))});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(name,e=>{if(previewDrag45?.id===e.pointerId){previewDrag45=null;c.classList.remove('dragging')}});
  window.addEventListener('keydown',e=>{const delta={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,-.5],ArrowDown:[0,.5]}[e.key];if(document.activeElement===c&&delta&&previewData45?.player.image){e.preventDefault();e.stopImmediatePropagation();moveHead45((previewData45.player.headX||0)+delta[0],(previewData45.player.headY||0)+delta[1])}},true);
  parent.postMessage({type:'ha45:ready'},location.origin);if(previewData45)receiveAvatar45({...previewData45,type:'ha45:avatar'});
 }
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent)receiveAvatar45(e.data)});
 showHome=mountAvatarStudio45;
}else{
 // All added effects share the existing simulation/render loop and bounded pools.
 const effects45=[],streak45=[];let trailTime45=0,notificationTime45=0,lastToast45='',lastToastAt45=0,skillSound45=null;
 const fxAllowed45=()=>saved.effects!==false&&!reducedMotion.matches;
 function emit45(x,y,color,count=12,shape='dash',force=150,life=.35){
  if(!fxAllowed45())return;const amount=Math.round(count*(matchMedia('(pointer:coarse)').matches?.7:1));
  for(let i=0;i<amount;i++){const a=i*2.399+Math.random()*.3,s=force*(.35+Math.random()*.65);effects45.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life,total:life,color,size:2+Math.random()*3,shape,angle:a})}
  if(effects45.length>140)effects45.splice(0,effects45.length-140);
 }
 const driveBefore45=drive44;
 drive44=function(p,hit,active){const ok=driveBefore45(p,hit,active);if(ok){emit45(hit.x,hit.y,p.fire>0?'#ffce86':'#ddfff3',active?17:6,'dash',active?175:95,active?.42:.24);emit45(hit.x,GROUND,'#c6dfb0',active?8:3,'dust',70,.36)}return ok};
 const skillFxBefore45=skillFX;
 skillFX=function(x,y,color,label=''){skillFxBefore45(x,y,color,label);emit45(x,y,color,24,'diamond',190,.68)};
 const skillBefore45=activateSkill;
 activateSkill=function(p){skillSound45=skillFor(p).id;try{return skillBefore45(p)}finally{skillSound45=null}};
 const scoreBefore45=scoreGoal;
 scoreGoal=function(side){scoreBefore45(side);emit45(side===0?RIGHT:LEFT,POST+45,side===0?'#a8f3cb':'#ffc39f',36,'ribbon',260,.85)};
 const simBefore45=simulate;
 simulate=function(dt){
  const before=p1.power;simBefore45(dt);
  if(!fxAllowed45()){effects45.length=0;streak45.length=0;return}
  for(let i=effects45.length-1;i>=0;i--){const f=effects45[i];f.life-=dt;if(f.life<=0){effects45.splice(i,1);continue}f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.exp(-dt*3);f.vy+=(f.shape==='ribbon'?230:f.shape==='dust'?-40:100)*dt}
  if(state==='playing'&&Math.hypot(ball.vx,ball.vy)>480){trailTime45+=dt;if(trailTime45>.025){trailTime45=0;streak45.push({x:ball.x,y:ball.y,t:simTime})}}else trailTime45=0;
  while(streak45.length>13||streak45.length&&simTime-streak45[0].t>.24)streak45.shift();
  if(state==='playing'&&before<100&&p1.power>=100)emit45(p1.x,p1.y-65,'#c8f7b9',4,'diamond',40,.22);
 };
 const ballBefore45=drawBall;
 drawBall=function(){
  if(fxAllowed45()&&streak45.length>1){ctx.save();ctx.lineCap='round';for(let i=1;i<streak45.length;i++){const a=streak45[i-1],b=streak45[i];ctx.globalAlpha=i/streak45.length*.18;ctx.strokeStyle=ball.hot>0?'#ffc273':'#c1f6f0';ctx.lineWidth=1+i/streak45.length*ball.r*.65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore()}ballBefore45();
 };
 const effectsBefore45=drawSkillEffects;
 drawSkillEffects=function(){effectsBefore45();if(!fxAllowed45())return;ctx.save();for(const f of effects45){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.globalAlpha=Math.min(1,f.life/f.total*1.4);ctx.fillStyle=f.color;
  if(f.shape==='diamond'){ctx.beginPath();ctx.moveTo(0,-f.size*2);ctx.lineTo(f.size,0);ctx.lineTo(0,f.size*2);ctx.lineTo(-f.size,0);ctx.closePath();ctx.fill()}
  else if(f.shape==='dust'){ctx.globalAlpha*=.38;ctx.beginPath();ctx.ellipse(0,0,f.size*2,f.size,0,0,7);ctx.fill()}
  else ctx.fillRect(-f.size*.5,-1,f.shape==='ribbon'?f.size*2.2:f.size*2, f.shape==='ribbon'?3:1.5);ctx.restore()}ctx.restore()};
 const resetBefore45=resetPositions;
 resetPositions=function(){resetBefore45();effects45.length=0;streak45.length=0;trailTime45=0};
 // Audio: decoded buffers, soft limiter, per-cue rate limits and a bounded voice count.
 const soundCache45=new Map(),soundLast45=new Map(),voices45=new Set();let soundContext45=null,soundMaster45=null,soundLimiter45=null;
 const defaultAudio45=new Set(['kick','bounce','body','post','skill','goal']);
 function context45(){
  if(soundContext45)return soundContext45;
  const AudioContext45=window.AudioContext||window.webkitAudioContext;if(!AudioContext45)return null;
  soundContext45=new AudioContext45();soundMaster45=soundContext45.createGain();soundLimiter45=soundContext45.createDynamicsCompressor();soundLimiter45.threshold.value=-15;soundLimiter45.knee.value=16;soundLimiter45.ratio.value=5;soundLimiter45.attack.value=.006;soundLimiter45.release.value=.18;soundMaster45.connect(soundLimiter45);soundLimiter45.connect(soundContext45.destination);return soundContext45;
 }
 function soundUrl45(name){
  const base=defaultAudio45.has(name)?name:name.startsWith('skill-')?'skill':null;
  if(base){const custom=managedConfig?.sounds?.[base];if(managedConfig?.sounds&&Object.hasOwn(managedConfig.sounds,base)&&!custom)return null;if(custom&&!/^assets\/audio\/(?:kick|bounce|body|post|skill|goal)(?:-premium)?\.(?:wav|ogg)$/.test(custom))return custom}
  return 'assets/audio/v45/'+name+'.wav';
 }
 async function decoded45(url){
  if(soundCache45.has(url))return soundCache45.get(url);if(soundCache45.size>=24)soundCache45.delete(soundCache45.keys().next().value);
  const promise=fetch(url).then(r=>{if(!r.ok)throw Error('audio');return r.arrayBuffer()}).then(data=>context45().decodeAudioData(data));soundCache45.set(url,promise);try{return await promise}catch(e){soundCache45.delete(url);throw e}
 }
 async function playCue45(name,volume=.5){
  if(muted||Number(saved.volume)<=0||document.hidden)return false;
  const now=performance.now(),gap={kick:55,bounce:95,body:160,post:150,goal:800,notify:150,warning:250}[name]??100;
  if(now-(soundLast45.get(name)??-Infinity)<gap)return false;soundLast45.set(name,now);
  try{const url=soundUrl45(name);if(!url)return false;const c=context45();if(!c)return false;if(c.state==='suspended')await c.resume();if(c.state!=='running')return false;
   const buffer=await decoded45(url);if(muted||Number(saved.volume)<=0||document.hidden||c.state!=='running')return false;
   while(voices45.size>=10){const oldest=voices45.values().next().value;oldest.stop();voices45.delete(oldest)}
   soundMaster45.gain.setValueAtTime(clamp43(Number(saved.volume)||0,0,1),c.currentTime);
   const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=clamp43(volume,0,1);source.connect(gain);gain.connect(soundMaster45);source.onended=()=>{voices45.delete(source);source.disconnect();gain.disconnect()};voices45.add(source);source.start();return true;
  }catch{return false}
 }
 function stopVoices45(){for(const v of voices45)try{v.stop()}catch{}voices45.clear();if(soundMaster45)soundMaster45.gain.value=0}
 window.addEventListener('pointerdown',()=>{if(!muted){const c=context45();if(c?.state==='suspended')c.resume().catch(()=>{})}},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoices45()});
 sfx=function(name,volume=1){
  if(name==='post')emit45(ball.x,ball.y,'#ffe3a0',14,'dash',175,.32);
  if(name==='bounce'&&Math.abs(ball.vy)>100)emit45(ball.x,ball.y,'#c1e5ce',4,'dust',55,.22);
  if(name==='body'&&Math.abs(p1.x-p2.x)<85)emit45((p1.x+p2.x)/2,(p1.y+p2.y)/2-35,'#d5eddf',7,'dust',85,.3);
  const cue=name==='skill'&&skillSound45?'skill-'+skillSound45:name;if(!defaultAudio45.has(name))return;
  playCue45(cue,volume*({kick:.68,bounce:.3,body:.38,post:.4,skill:.38,goal:.48}[name]||.4));
 };
 beep=function(f=440,d=.1,type='sine',vol=.2){
  if(muted||state==='goal'||Number(saved.volume)<=0)return;
  try{const c=context45();if(!c)return;if(c.state==='suspended')c.resume().catch(()=>{});const o=c.createOscillator(),g=c.createGain(),t=c.currentTime,span=Math.min(.2,Math.max(.04,d));o.type='sine';o.frequency.value=clamp43(f,180,1000);soundMaster45.gain.value=clamp43(Number(saved.volume)||0,0,1);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.min(.08,vol*.35),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+span);o.connect(g);g.connect(soundMaster45);o.onended=()=>{o.disconnect();g.disconnect()};o.start();o.stop(t+span)}catch{}
 };
 const toggleBefore45=toggleSound;
 toggleSound=function(){toggleBefore45();if(muted)stopVoices45();else playCue45('ui',.2)};
 // Concise, dismissible notices: bounded, deduplicated, no HTML from messages.
 toast=function(text,mark='✓'){
  const stack=document.getElementById('notifications');if(!stack)return;
  const now=performance.now();if(text===lastToast45&&now-lastToastAt45<1000)return;lastToast45=text;lastToastAt45=now;
  const warning=mark==='!'||/belum cukup|gagal|tidak valid|dinonaktifkan|ditolak|penuh/i.test(text),reward=/\+\d|bonus|hadiah|juara/i.test(text);
  const el=document.createElement('div');el.className='notification notice45 '+(warning?'warning45':reward?'reward45':'success45');el.setAttribute('role',warning?'alert':'status');
  const badge=document.createElement('span');badge.className='notice-badge45';badge.textContent=warning?'!':reward?'★':mark;
  const body=document.createElement('div'),label=document.createElement('small'),message=document.createElement('span'),close=document.createElement('button'),progress=document.createElement('i');label.textContent=warning?'PERIKSA DULU':reward?'HADIAH & PROGRES':'HEAD ARENA';message.textContent=String(text);body.append(label,message);close.textContent='×';close.setAttribute('aria-label','Tutup notifikasi');progress.className='notice-progress45';el.append(badge,body,close,progress);stack.append(el);while(stack.children.length>3){const old=stack.firstElementChild;old.dispose45?.();old.remove()}
  let timer,started=now,remaining=warning?4800:3400,removed=false,paused=false,hovered=false,focused=false;
  const remove=()=>{if(removed)return;removed=true;clearTimeout(timer);el.classList.add('leaving');setTimeout(()=>el.remove(),180)};
  const resume=()=>{if(removed||hovered||focused)return;paused=false;started=performance.now();clearTimeout(timer);timer=setTimeout(remove,remaining);el.style.setProperty('--notice-time45',remaining+'ms');el.classList.remove('paused45')};
  const pause=()=>{if(removed||paused)return;paused=true;remaining=Math.max(100,remaining-(performance.now()-started));clearTimeout(timer);el.classList.add('paused45')};
  el.dispose45=remove;close.onclick=remove;el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation()});el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;pause()}});el.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovered=false;resume()}});el.addEventListener('focusin',()=>{focused=true;pause()});el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget)){focused=false;resume()}});resume();
  if(now-notificationTime45>300){notificationTime45=now;playCue45(warning?'warning':'notify',warning?.12:.09)}
 };
 announce=function(title,sub='',kind='good'){
  const el=document.getElementById('announce');el.replaceChildren();
  const label=document.createElement('small'),heading=document.createElement('strong'),body=document.createElement('span');label.textContent=/GOAL/i.test(title)?'MATCH MOMENT':/GOLDEN|CHAMPION/i.test(title)?'TURNAMEN':'SKILL MOMENT';heading.textContent=title;body.textContent=sub;el.append(label,heading,body);el.className='announce announce45 '+(['good','bad','gold'].includes(kind)?kind:'good');clearTimeout(announceTimer);announceTimer=setTimeout(()=>el.classList.add('hidden'),2200);
 };
 const settingsBefore45=showSettings;
 showSettings=function(from='home'){settingsBefore45(from);const panel=document.querySelector('.settings-panel');if(!panel)return;const fxLabel=document.getElementById('fxToggle')?.closest('.settings-field')?.querySelector('span');if(fxLabel)fxLabel.textContent='Efek visual & kamera';const preview=document.createElement('button');preview.className='outline audio-preview45';preview.textContent='Coba suara bola & skill';preview.onclick=()=>{if(muted||Number(saved.volume)<=0){toast('Aktifkan suara dan naikkan volume terlebih dahulu.','!');return}playCue45('kick',.5);setTimeout(()=>playCue45('skill-freeze',.28),330)};panel.append(preview);const note=document.createElement('p');note.className='audio-note45';note.textContent='Bola, tiang, benturan, gol dan enam skill memakai karakter suara berbeda. Suara baru aktif setelah interaksi dan mengikuti volume di sini.';panel.append(note);document.getElementById('volume')?.addEventListener('input',()=>{if(soundMaster45)soundMaster45.gain.value=clamp43(Number(saved.volume)||0,0,1)});document.getElementById('audioToggle')?.addEventListener('click',()=>{if(muted)stopVoices45()})};
 const homeBefore45=showHome;
 showHome=function(){homeBefore45();document.querySelector('.brand-edition').textContent='MATCHDAY / 4.5'};
 // Expose bounded diagnostic counts only, never audio buffers or user data.
 window.presentationStats45=()=>({effects:effects45.length,streak:streak45.length,voices:voices45.size,buffers:soundCache45.size,audioState:soundContext45?.state||'not-started'});
}
