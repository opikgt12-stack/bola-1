'use strict';
// 4.4: the same rendered boot transform and alpha pixels drive foot contact.
const bootMasks44=new WeakMap();
function bootMask44(image){
 if(!image?.complete||!image.naturalWidth)return null;
 if(bootMasks44.has(image))return bootMasks44.get(image);
 const c=document.createElement('canvas');c.width=46;c.height=22;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,46,22);
 try{const rgba=g.getImageData(0,0,46,22).data,cells=[];let left=46,top=22,right=0,bottom=0;
  for(let y=0;y<22;y++)for(let x=0;x<46;x++)if(rgba[(y*46+x)*4+3]>=110){cells.push([x,y]);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1)}
  const result=cells.length?{cells,left,top,right,bottom}:null;bootMasks44.set(image,result);return result;
 }catch{bootMasks44.set(image,null);return null}
}
function legPose44(p,side){
 const walk=Math.sin(simTime*16)*Math.min(1,Math.abs(p.vx)/250)*.5;
 const phase=p.kick>0?Math.sin(clamp43((.26-p.kick)/.26,0,1)*Math.PI):0;
 const active=side===p.face,a=active?-p.face*phase*1.15:walk*side,b=active?-p.face*phase*.35:-walk*side*.3;
 return{a,b,x:side*11-Math.sin(a)*11,y:-15+Math.cos(a)*11,angle:a+b,flip:p.face<0?-1:1};
}
function bodyBob44(p){return p.onGround?Math.sin(simTime*15)*Math.min(Math.abs(p.vx)/340,1)*2:0}
// Both the artwork and contact use legPose44; there is no bonus invisible reach.
drawLegs=function(c,p,skin){
 const frame=bootFrame(bootFor(p));
 for(const side of [-1,1]){const pose=legPose44(p,side);c.save();c.translate(side*11,-15);c.rotate(pose.a);
  c.fillStyle=skin;rounded(c,-5,0,10,10,4);c.fillStyle='#fafcff';rounded(c,-6,7,12,8,3);
  c.translate(0,11);c.rotate(pose.b);c.scale(pose.flip,1);
  if(frame.a){c.drawImage(frame.a,-14,-17,46,22);if(frame.b){c.globalAlpha=frame.mix;c.drawImage(frame.b,-14,-17,46,22)}}c.restore();
 }
};
function footContact44(p){
 const size=p.size||1,rad=ball.r/size,bob=bodyBob44(p);
 if(Math.abs(ball.x-p.x)>76*size+ball.r||Math.abs(ball.y-p.y)>72*size+ball.r)return null;
 const frame=bootFrame(bootFor(p)),images=[frame.a];if(frame.b&&frame.mix>.1)images.push(frame.b);
 const dx=(ball.x-p.x)/size,dy=(ball.y-p.y)/size-bob;
 let best=null;
 for(const side of [-1,1]){
  const pose=legPose44(p,side),co=Math.cos(pose.angle),si=Math.sin(pose.angle);
  const u=((dx-pose.x)*co+(dy-pose.y)*si)*pose.flip+14,v=-(dx-pose.x)*si+(dy-pose.y)*co+17;
  for(const image of images){const mask=bootMask44(image);if(!mask||u+rad<mask.left||u-rad>mask.right||v+rad<mask.top||v-rad>mask.bottom)continue;
   for(const [x,y]of mask.cells){if(x>u+rad||x+1<u-rad||y>v+rad||y+1<v-rad)continue;
    const qx=clamp43(u,x,x+1),qy=clamp43(v,y,y+1),dist2=(u-qx)**2+(v-qy)**2;
    if(dist2>rad*rad||best&&dist2>=best.dist2)continue;
    const lx=(qx-14)*pose.flip,ly=qy-17;
    const wx=p.x+(pose.x+lx*co-ly*si)*size,wy=p.y+(bob+pose.y+lx*si+ly*co)*size;
    const dist=Math.sqrt(dist2)*size;
    let nx=dist>.001?(ball.x-wx)/dist:(p.side===0?1:-1),ny=dist>.001?(ball.y-wy)/dist:0;
    best={dist2,dist,nx,ny,x:wx,y:wy,side,penetration:Math.max(0,ball.r-dist)};
   }
  }
 }
 return best;
}
function contactSeparate44(hit){
 // Resolve only existing overlap, along the actual surface normal; never place the ball ahead of a player.
 const depth=Math.min(ball.r,hit.penetration)+.03;ball.x+=hit.nx*depth;ball.y+=hit.ny*depth;
}
function shotVelocity430(p,orb,active,lob,low=false){
 const dir=p.side===0?1:-1,boot=bootFor(p),fire=p.fire>0;
 const speed=settings().shotSpeed*(ROSTER[p.character]?.shot||1)*boot.shot*(active?(p.side===0?1.23:1.12):.64)*(fire?1.32:1);
 const limit=bootShotLimit416(p);
 orb.vx=dir*Math.min(limit,speed*(lob?.78:1))+p.vx*.12;
 const distance=Math.abs((dir>0?RIGHT:LEFT)-orb.x),travel=clamp43(distance/Math.max(450,Math.abs(orb.vx)),.1,.9),target=GROUND-36-clamp43(distance*.018,0,14);
 const aim=(target-orb.y-.5*settings().gravity*travel*travel)/travel;
 orb.vy=lob?-settings().lobSpeed*.94:active?(low?-95:clamp43(aim,-355,110)):-125;
 return {vx:orb.vx,vy:orb.vy};
}
function drive44(p,hit,active){
 const boot=bootFor(p),fire=p.fire>0,lob=active&&(p.side===0?!!keys.x:mode==='versus'?!!keys.ArrowDown:!!p.aiLob);
 contactSeparate44(hit);
 shotVelocity430(p,ball,active,lob,p.side===0&&keys.s);
 ball.hot=fire?2:0;ball.lastTouch=p.side;ball.stuckTime=0;
 ball.strikeGuard43={side:p.side,until:simTime+.055};p.bootCool=active?.13:.16;
 if(active){p.cool=Math.max(.09,boot.cooldown*.86);p.shotBuffer43=0;matchMetrics.shots=(matchMetrics.shots||0)+(p.side===0?1:0)}
 sfx('kick',active?.8:.32);impact43={x:hit.x,y:hit.y,t:simTime,color:fire?'#ffd08a':'#d7fff4'};
 if(active&&settings().cameraShake&&saved.effects!==false)shake=fire?3:1;
 return true;
}
strike43=function(p,buffer=true){
 if(state!=='playing'||p.cool>0||p.frozen>0||p.stun>0)return false;
 if(buffer)p.shotBuffer43=simTime+.16;
 const hit=footContact44(p);
 if(hit)return drive44(p,hit,true);
 // Swinging alone changes neither the ball nor its sound; a pending input still needs contact.
 if(buffer&&(p.kick||0)<=0)p.kick=.26;
 return false;
};
collideBoot=function(p){
 p.bootCool=Math.max(0,(p.bootCool||0)-1/120);
 if(ownStrikeGuard43(p))return;
 const hit=footContact44(p);if(!hit)return;
 if(p.frozen>0||p.stun>0){contactSeparate44(hit);return}
 const pressed=p.side===0?keys[' ']||keys.x:mode==='versus'?keys.Enter:false;
 if(p.cool<=0&&(pressed||p.shotBuffer43>simTime)){drive44(p,hit,true);return}
 if(p.bootCool<=0){drive44(p,hit,false);return}
 contactSeparate44(hit);
};
// Body contact is passive collision, not an invisible 120 px/s kick near the feet.
collideHead=function(p){
 if(ownStrikeGuard43(p))return;
 const size=p.size||1,bob=bodyBob44(p)*size,cx=p.x,cy=p.y+ bob-79*size;
 function bounce(nx,ny,depth){ball.x+=nx*(depth+.02);ball.y+=ny*(depth+.02);const incoming=(ball.vx-p.vx)*nx+(ball.vy-p.vy)*ny;if(incoming<0){ball.vx-=1.55*incoming*nx;ball.vy-=1.55*incoming*ny;ball.lastTouch=p.side;sfx('bounce',.3)}return incoming}
 const dx=ball.x-cx,dy=ball.y-cy,dist=Math.hypot(dx,dy),radius=32*size+ball.r;
 if(dist<radius){const incoming=bounce(dist?dx/dist:0,dist?dy/dist:-1,radius-dist);if(incoming<0&&p.fire>0){ball.hot=1.5;ball.vx+=p.face*140}return}
 const boxes=[[-18,-44,18,-14],[-19,-21,19,-4]];
 for(const [a,b,c,d]of boxes){const left=p.x+a*size,right=p.x+c*size,top=p.y+b*size+bob,bottom=p.y+d*size+bob,qx=clamp43(ball.x,left,right),qy=clamp43(ball.y,top,bottom),x=ball.x-qx,y=ball.y-qy,l=Math.hypot(x,y);if(l<ball.r&&l>.001){bounce(x/l,y/l,ball.r-l);return}}
};
// The old proximity-based unstick launched balls without a touch. Physical overlaps now resolve at contact.
releaseStuckBall=function(){ball.stuckTime=0;ball.rescueCool=0;ball.stuckAnchor=null};
// CPU approaches the actual boot contact instead of stopping at the old oversized hitbox.

// Shoe upgrades retain power, movement and recovery, never phantom contact range.
bootStatRows=function(b){return [['SHOT',b.shot],['SPEED',b.speed],['JUMP',b.jump]].map(([k,v])=>`<span><small>${k}</small><b>${v===1?'BASE':'+'+Math.round((v-1)*100)+'%'}</b></span>`).join('')+`<span><small>JEDA SHOT</small><b>${Math.max(.13,b.cooldown*.86).toFixed(2)}s</b></span>`};
for(const b of BOOTS){if(b.id==='boot-phantom')b.info='Power boot hitam–cyan. Tembakan kuat dan respons tendangan cepat.';if(b.id==='boot-royal')b.info='Ungu pekat dengan detail perak. Kombinasi kecepatan dan respons tendangan.'}

// Portable progress: explicit allowlist, bounded JSON, preview and local pre-load backup.
const SAVE_FORMAT44='head-arena-progress',SAVE_VERSION44=1,MAX_SAVE44=2*1024*1024;
const SAVE_FIELDS44=['coins','goals','wins','owned','kit','arena','ball','boot','bootColor','infinityColor','gear','trail','photo','name','volume','sound','effects','haptics','face','matches','cups','best','worldCups','cleanSheets','proWins','streak','claims','challengeClaims','daily','customNames','playerBoots','playerSkills','skillOwned','controls','quickRival','worldOptions','world','cup','cpuDifficulty410'];
const BEFORE_LOAD44=STORE+'-before-load-v1';
function progressSnapshot44(){const data={};for(const k of SAVE_FIELDS44)if(saved[k]!==undefined)data[k]=saved[k];return JSON.parse(JSON.stringify(data))}
function saveEnvelope44(progress=progressSnapshot44()){return{format:SAVE_FORMAT44,version:SAVE_VERSION44,gameVersion:'4.23.0',exportedAt:new Date().toISOString(),progress}}
function exportText44(){return JSON.stringify(saveEnvelope44(),null,2)}
function parseSave44(text){
 function bad(label){throw Error(label||'Struktur file save tidak valid.')}
 if(typeof text!=='string'||new Blob([text]).size>MAX_SAVE44)bad('File save terlalu besar. Maksimal 2 MB.');
 let file;try{file=JSON.parse(text)}catch{bad('File bukan JSON save yang valid.')}
 const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v),num=(v,a=0,b=100000000)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b,int=(v,a=0,b=100000000)=>num(v,a,b)&&Number.isInteger(v),str=(v,max=80)=>typeof v==='string'&&v.length<=max;
 let nodes=0;
 function inspect(v,depth=0){if(++nodes>12000||depth>14)bad('Struktur file save terlalu kompleks.');if(typeof v==='number'&&!Number.isFinite(v))bad();if(typeof v==='string'&&v.length>1500000)bad();if(Array.isArray(v)&&v.length>512)bad();if(v&&typeof v==='object')for(const [k,value]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))bad('File save berisi properti yang tidak diizinkan.');inspect(value,depth+1)}}
 inspect(file);
 if(!obj(file)||file.format!==SAVE_FORMAT44||file.version!==SAVE_VERSION44||!obj(file.progress))bad('Bukan file progres Head Arena yang didukung. Gunakan file dari tombol Unduh save.');
 const p=file.progress,out={};for(const k of SAVE_FIELDS44)if(Object.hasOwn(p,k))out[k]=p[k];
 if(!['coins','wins','owned','face'].every(k=>Object.hasOwn(out,k)))bad('Data utama progres tidak lengkap.');
 for(const k of ['coins','goals','wins','face','matches','cups','best','worldCups','cleanSheets','proWins','streak'])if(k in out&&!int(out[k]))bad('Nilai '+k+' tidak valid.');
 if('cpuDifficulty410' in out&&!['easy','normal','hard','elite'].includes(out.cpuDifficulty410))bad('Level bot tidak valid.');
 if(!int(out.face,0,63))bad('Karakter save tidak valid.');
 for(const k of ['sound','effects','haptics'])if(k in out&&typeof out[k]!=='boolean')bad('Pengaturan '+k+' tidak valid.');
 if('volume'in out&&!num(out.volume,0,1))bad('Volume tidak valid.');
 for(const k of ['kit','arena','ball','boot','bootColor','infinityColor','gear','trail'])if(k in out&&out[k]!==null&&!str(out[k],64))bad('Item '+k+' tidak valid.');
 for(const k of ['name','daily'])if(k in out&&!str(out[k],80))bad('Data '+k+' tidak valid.');
 const list=(v)=>Array.isArray(v)&&v.length<=512&&v.every(x=>str(x,80));
 for(const k of ['owned','claims','challengeClaims','skillOwned'])if(k in out&&!list(out[k]))bad('Daftar '+k+' tidak valid.');
 const skillIds=Object.keys(SKILL_PRICES);
 if(out.skillOwned&&!out.skillOwned.every(s=>skillIds.includes(s)))bad('Skill save tidak dikenal.');
 for(const k of ['customNames','playerBoots','playerSkills'])if(k in out){if(!obj(out[k])||Object.keys(out[k]).length>64)bad();for(const [i,value]of Object.entries(out[k])){if(!/^\d{1,2}$/.test(i)||!int(Number(i),0,63)||!str(value,k==='customNames'?80:64))bad('Loadout karakter tidak valid.');if(k==='playerSkills'&&!skillIds.includes(value))bad('Skill karakter tidak dikenal.')}}
 if('quickRival'in out&&out.quickRival!==null&&!int(out.quickRival,0,63))bad();
 if('photo'in out&&out.photo!==null&&(!str(out.photo,1500000)||!/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(out.photo)))bad('Foto lokal tidak valid.');
 const nations=new Set(NATIONS.map(n=>n.id)),score=v=>Array.isArray(v)&&v.length===2&&v.every(n=>int(n,0,9999));
 function options(o){if(!obj(o)||!int(o.player,0,63)||![30,60,90,120,180,300].includes(o.duration)||!['easy','normal','hard','elite'].includes(o.difficulty))bad('Opsi pertandingan tidak valid.')}
 if(out.worldOptions)options(out.worldOptions);
 if(out.world!==undefined&&out.world!==null){
  const w=out.world;
  if(!obj(w)||!nations.has(w.team)||!['group','knockout'].includes(w.phase)||!['active','eliminated','champion'].includes(w.status)||!int(w.day,0,3)||!int(w.knockRound,0,3)||!Array.isArray(w.groups)||w.groups.length!==8||!Array.isArray(w.history)||w.history.length>7||!Array.isArray(w.rounds)||w.rounds.length>4)bad('Data Piala Dunia tidak valid.');
  const ids=[];for(const g of w.groups){if(!Array.isArray(g)||g.length!==4)bad();for(const row of g){if(!obj(row)||!nations.has(row.id)||!['p','w','d','l','gf','ga','pts'].every(k=>int(row[k],0,9999)))bad('Klasemen tidak valid.');ids.push(row.id)}}
  if(new Set(ids).size!==32||!w.groups[0].some(t=>t.id===w.team))bad('Susunan grup tidak valid.');
  for(const h of w.history)if(!obj(h)||!nations.has(h.opponent)||!score(h.score)||!str(h.stage,80))bad('Riwayat turnamen tidak valid.');
  w.rounds.forEach((round,i)=>{if(!Array.isArray(round)||round.length!==8/(2**i))bad('Bagan turnamen tidak valid.');for(const f of round){if(!obj(f)||!nations.has(f.a)||!nations.has(f.b)||f.a===f.b||f.score!==null&&!score(f.score)||f.winner!==null&&![f.a,f.b].includes(f.winner))bad('Fixture tidak valid.')}});
  if(w.phase==='group'&&w.status==='active'&&w.day>2)bad('Matchday tidak valid.');
  if(w.phase==='knockout'&&(!w.rounds[w.knockRound]||w.status==='active'&&!w.rounds[w.knockRound].some(f=>f.a===w.team||f.b===w.team)))bad('Babak aktif tidak valid.');
  if(w.champion!==null&&!nations.has(w.champion))bad();if(w.options)options(w.options);
 }
 if(out.cup!==undefined&&out.cup!==null){const c=out.cup;if(!obj(c)||!int(c.round,0,3)||!Array.isArray(c.results)||c.results.length>3||!c.results.every(score)||!Array.isArray(c.opponents)||c.opponents.length!==3||!c.opponents.every(n=>str(n,40)&&/^[A-Za-z0-9 ._-]{1,40}$/.test(n))||typeof c.champion!=='boolean'||typeof c.eliminated!=='boolean')bad('Data Arcade Cup tidak valid.')}
 if('controls'in out){const c=out.controls;if(!obj(c))bad('Kontrol tidak valid.');for(const [k,a,b]of [['analog',72,144],['shoot',48,92],['skill',44,80],['jump',44,80]])if(k in c&&!num(c[k],a,b))bad('Ukuran tombol tidak valid.');if(c.layout&&!['classic','compact','arcade'].includes(c.layout))bad();
  if(c.hud43){const h=c.hud43;if(!obj(h)||typeof h.enabled!=='boolean'||!num(h.opacity,.4,1))bad('HUD tidak valid.');for(const o of ['portrait','landscape'])if(o in h){if(!obj(h[o]))bad();for(const [key,value]of Object.entries(h[o]))if(!Object.hasOwn(HUD43,key)||!Array.isArray(value)||value.length!==2||!value.every(n=>num(n,0,100)))bad('Posisi HUD tidak valid.')}}
 }
 return{progress:out,exportedAt:str(file.exportedAt,80)?file.exportedAt:'',gameVersion:str(file.gameVersion,20)?file.gameVersion:''};
}
function downloadSave44(){
 try{const text=exportText44();parseSave44(text);const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Head-Arena-Save-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#saveStatus44').textContent='File save dibuat. Simpan file JSON ini, lalu pilih Load save di browser tujuan.'}catch(e){$('#saveStatus44').textContent=e.message}
}
function commitLoad44(parsed){
 // Every durable write is checked before touching the live in-memory progress or reloading.
 const before=JSON.stringify(saveEnvelope44()),after=JSON.stringify({...parsed.progress,giftLedger49:saved.giftLedger49||{},giftEpoch49:saved.giftEpoch49});
 try{localStorage.setItem(BEFORE_LOAD44,before)}catch{throw Error('Backup progres lama gagal disimpan. Load dibatalkan; progres saat ini tetap aman.')}
 try{localStorage.setItem(STORE,after)}catch{throw Error('Penyimpanan browser penuh atau tidak tersedia. Load dibatalkan; progres saat ini tidak berubah.')}
 location.reload();
}
function previewLoad44(parsed,fromBackup=false){
 $('#loadPreview44')?.remove();const dialog=document.createElement('dialog');dialog.id='loadPreview44';dialog.className='load-preview44';dialog.setAttribute('aria-label','Konfirmasi load progres');
 const p=parsed.progress,playerName=ROSTER[p.face]?.name||'Pemain '+(p.face+1);
 dialog.innerHTML=`<span class="page-label">${fromBackup?'BACKUP LOKAL':'LOAD SAVE'}</span><h2>Ganti progres di browser ini?</h2><p>Progres akan <b>diganti, bukan digabung</b>. Progres sekarang dibuatkan backup lokal terlebih dahulu. Pertandingan yang sedang berjalan tidak ikut dimuat.</p><div class="save-summary44"><span>Koin sekarang <b>${saved.coins.toLocaleString('id-ID')}</b></span><span>Koin dari save <b>${p.coins.toLocaleString('id-ID')}</b></span><span>Menang <b>${p.wins}</b></span><span>Karakter <b>${esc(playerName)}</b></span><span>Skill dibeli <b>${p.skillOwned?.length||0}</b></span><span>Piala Dunia <b>${p.world?esc(p.world.phase==='group'?'Fase grup':'Knockout'):'Belum mulai'}</b></span></div><small>${parsed.exportedAt?'Tanggal file: '+esc(parsed.exportedAt):'File progres Head Arena'}</small><p id="loadError44" role="alert"></p><div class="save-dialog-actions44"><button class="outline" id="cancelLoad44">Batal</button><button class="primary" id="confirmLoad44">Ganti progres & load</button></div>`;
 document.body.append(dialog);dialog.showModal();$('#cancelLoad44').onclick=()=>{dialog.close();dialog.remove()};dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();dialog.remove()});
 $('#confirmLoad44').onclick=()=>{try{commitLoad44(parsed)}catch(e){$('#loadError44').textContent=e.message}};
}
const settingsBefore44=showSettings;
showSettings=function(from='home'){
 settingsBefore44(from);$('.settings-grid').insertAdjacentHTML('beforeend',`<section class="settings-panel progress-panel44"><div><span class="page-label">PROGRES MILIKMU</span><h3>Save & load antarbrowser</h3><p>Progres otomatis tersimpan di browser ini. Untuk pindah browser/perangkat, unduh file save lalu load file yang sama di browser tujuan. <b>Bukan sinkronisasi otomatis atau akun online.</b></p></div><div class="save-actions44"><button class="primary" id="downloadSave44">Unduh save</button><button class="outline" id="chooseSave44">Load save</button><button class="ghost" id="restoreSave44">Pulihkan sebelum load</button><input id="saveFile44" type="file" accept=".json,application/json" hidden></div><p class="save-hint44">Membawa koin, statistik, item/skill dibeli, loadout, progres turnamen, klaim hadiah dan HUD. Tidak membawa akun admin, aset server, atau posisi/skor pertandingan yang belum selesai. Gunakan versi game yang sama atau lebih baru.</p><p id="saveStatus44" role="status">Simpan file ini di tempat aman. Jangan hapus data browser sebelum punya backup.</p></section>`);
 const jump=document.createElement('button');jump.className='outline save-shortcut44';jump.textContent='Save & load progres ↓';jump.onclick=()=>$('.progress-panel44').scrollIntoView({block:'start',behavior:reducedMotion.matches||saved.effects===false?'auto':'smooth'});$('.page-heading').append(jump);
 $('#downloadSave44').onclick=downloadSave44;$('#chooseSave44').onclick=()=>{$('#saveFile44').value='';$('#saveFile44').click()};
 $('#saveFile44').onchange=async e=>{const file=e.target.files[0];if(!file)return;e.target.value='';try{if(file.size>MAX_SAVE44)throw Error('File terlalu besar. Maksimal 2 MB.');const parsed=parseSave44(await file.text());previewLoad44(parsed)}catch(err){$('#saveStatus44').textContent='Load ditolak: '+err.message}};
 let hasBackup=false;try{hasBackup=!!localStorage.getItem(BEFORE_LOAD44)}catch{}
 $('#restoreSave44').disabled=!hasBackup;$('#restoreSave44').onclick=()=>{try{const text=localStorage.getItem(BEFORE_LOAD44);if(!text)throw Error('Belum ada backup sebelum load.');previewLoad44(parseSave44(text),true)}catch(e){$('#saveStatus44').textContent=e.message}};
};
const homeBefore44=showHome;
showHome=function(){homeBefore44();$('.brand-edition').textContent='MATCHDAY / 4.4'};
