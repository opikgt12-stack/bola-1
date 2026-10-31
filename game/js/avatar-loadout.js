'use strict';
// 4.2 — non-destructive head fitting and character-specific skill equipment.
const fittedHeads=new WeakMap();
function headDefaults(d){return{scale:Math.max(.75,Math.min(1.25,Number(d.headScale)||1)),x:Number(d.headX)||0,y:Number(d.headY)||0,tilt:Number(d.headTilt??(d.image==='assets/face0.png'?-14:d.image==='assets/face1.png'?8:0)),full:d.headFullImage!==false,crop:d.headFullImage!==false?0:Math.max(0,Math.min(15,Number(d.headCropBottom)||0))}}
function headSurface(photo,d){
 const cfg=headDefaults(d);let cache=fittedHeads.get(photo);if(!cache){cache=new Map();fittedHeads.set(photo,cache)}
 const cacheKey=cfg.crop+':'+cfg.full;
 if(cache.has(cacheKey))return cache.get(cacheKey);
 const fallback={image:photo,width:photo.naturalWidth||photo.width||1,height:photo.naturalHeight||photo.height||1,chin:(photo.naturalWidth||photo.width||1)/2,skin:null};
 try{
  const source=document.createElement('canvas'),iw=photo.naturalWidth||photo.width,ih=photo.naturalHeight||photo.height;
  if(!iw||!ih)return fallback;
  const ratio=Math.min(1,512/Math.max(iw,ih));source.width=Math.max(1,Math.round(iw*ratio));source.height=Math.max(1,Math.round(ih*ratio));
  const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(photo,0,0,source.width,source.height);
  const w=source.width,h=source.height,pixels=sc.getImageData(0,0,w,h).data;
  let left=w,right=0,top=h,bottom=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
  if(left>=right||top>=bottom){cache.set(cacheKey,fallback);return fallback}
  bottom=Math.max(top+1,Math.floor(bottom-(bottom-top)*cfg.crop/100));
  let sum=0,weight=0,rr=0,gg=0,bb=0,count=0;
  for(let y=top+Math.floor((bottom-top)*.72);y<=bottom;y++)for(let x=left;x<=right;x++){
   const i=(y*w+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];if(a<180)continue;
   if(y>top+(bottom-top)*.88){const k=(y-top)/(bottom-top);sum+=x*k;weight+=k}
   if(r>85&&r>g+5&&g>b*.95&&r<250){rr+=r;gg+=g;bb+=b;count++}
  }
  const result=document.createElement('canvas');result.width=right-left+1;result.height=bottom-top+1;
  const c=result.getContext('2d');c.drawImage(source,left,top,result.width,result.height,0,0,result.width,result.height);
  // Only the last two percent feather into the neck; original files stay untouched.
  if(!cfg.full){const fade=c.createLinearGradient(0,result.height*.965,0,result.height);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#ffffff00');c.globalCompositeOperation='destination-in';c.fillStyle=fade;c.fillRect(0,0,result.width,result.height);c.globalCompositeOperation='source-over';}
  const surface={image:result,width:result.width,height:result.height,chin:weight?sum/weight-left:result.width/2,skin:count?'rgb('+Math.round(rr/count)+','+Math.round(gg/count)+','+Math.round(bb/count)+')':null};
  cache.set(cacheKey,surface);return surface;
 }catch{cache.set(cacheKey,fallback);return fallback}
}
function drawIntegratedHead(c,p,d,photo){
 const f=headSurface(photo,d),cfg=headDefaults(d),scale=Math.min(68/f.height,70/f.width)*cfg.scale;
 c.save();c.translate(cfg.x,31+cfg.y);c.rotate(cfg.tilt*Math.PI/180);
 if(!cfg.full&&d.imageMode==='circle'){
  c.beginPath();c.ellipse(0,-33*cfg.scale,34*cfg.scale,36*cfg.scale,0,0,Math.PI*2);c.clip();
 }
 c.imageSmoothingEnabled=true;c.drawImage(f.image,-f.chin*scale,-f.height*scale,f.width*scale,f.height*scale);c.restore();
}
const SKILL_PRICES={titan:1200,freeze:1600,fire:1800,inflate:1400,storm:1500,shield:1300,...Object.fromEntries((window.PREMIUM419||[]).map(s=>[s.id,s.price]))};
saved.skillOwned=Array.isArray(saved.skillOwned)?[...new Set(saved.skillOwned.filter(id=>id in SKILL_PRICES))]:[];
saved.playerSkills=saved.playerSkills&&typeof saved.playerSkills==='object'&&!Array.isArray(saved.playerSkills)?saved.playerSkills:{};
function nativeSkillId(character){return ROSTER[character]?.skill||'titan'}
function skillUnlocked(id,character=selectedFace){return id===nativeSkillId(character)||saved.skillOwned.includes(id)}
function skillSellable(id){return skillDef(id).enabled!==false&&managedConfig?.shop?.['skill-'+id]?.enabled!==false}
function equippedSkillId(character=selectedFace){
 const base=nativeSkillId(character),id=saved.playerSkills[String(character)];
 if(id&&skillUnlocked(id,character)&&skillDef(id).enabled!==false&&(id===base||skillSellable(id)))return id;
 if(skillDef(base).enabled!==false)return base;
 return (managedConfig?.skills||fallbackSkills).find(s=>s.enabled!==false)?.id||base;
}
skillFor=function(p){
 if(p.side===0&&mode==='challenge'&&challenge&&['countdown','playing','goal','paused'].includes(state))return skillDef(challenge.skill);
 return skillDef(p.side===0?equippedSkillId(p.character??selectedFace):nativeSkillId(p.character??rivalIndex));
};
function skillPrice(id){return Math.max(0,Math.min(50000,Number(managedConfig?.shop?.['skill-'+id]?.price??SKILL_PRICES[id])||0))}
function equipSkill(id){
 if(state!=='menu'||!(id in SKILL_PRICES)||!skillSellable(id)||!ROSTER[selectedFace]?.enabled)return false;
 if(!settings().skillEnabled){toast('Skill pertandingan sedang dinonaktifkan di dashboard.','!');return false;}
 if(!skillUnlocked(id)){
  const price=skillPrice(id);if(saved.coins<price){toast('Koin belum cukup untuk membuka skill ini.','!');return false}
  saved.coins-=price;saved.skillOwned.push(id);
 }
 saved.playerSkills[String(selectedFace)]=id;save();return true;
}
function shopTabsMarkup(){return`<div class="shop-tabs">${[['boot','SEPATU'],['ball','BOLA'],['gear','AKSESORI'],['skill','SKILL']].map(([id,label])=>`<button data-tab="${id}" class="${shopTab===id?'active':''}">${label}</button>`).join('')}</div>`}
function showSkillShop(){
 state='menu';shopTab='skill';const eq=skillFor({side:0,character:selectedFace}),base=nativeSkillId(selectedFace),all=(managedConfig?.skills||fallbackSkills).filter(s=>skillSellable(s.id)).sort((a,b)=>skillPrice(a.id)-skillPrice(b.id));
 renderPage('shop',heading('','Skill Lab','Beli sekali, lalu atur kemampuan untuk setiap karakter.',`<label class="skill-character-select">PEMAIN<select id="skillCharacter">${ROSTER.filter(r=>r.enabled!==false).map(r=>`<option value="${r.id}" ${r.id===selectedFace?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>`)+shopTabsMarkup()+
 `<section class="skill-loadout-strip"><img src="${esc(eq.icon)}" alt=""><div><small>SKILL ${esc(ownName()).toUpperCase()}</small><strong>${esc(eq.name)}</strong><span>Satu skill aktif · CPU tetap memakai skill bawaannya</span></div><button class="outline" id="restoreNativeSkill">Skill bawaan</button></section>`+
 `<div class="skill-grid">${all.map(s=>{const own=skillUnlocked(s.id),native=s.id===base,chosen=s.id===eq.id;return`<article class="skill-shop-card ${chosen?'equipped-skill':''}" style="--skill-color:${esc(s.color)}"><div class="skill-card-label"><span>${native?'BAWAAN KARAKTER':own?'SUDAH TERBUKA':'BUKA KEMAMPUAN'}</span><b>${chosen?'TERPASANG ✓':''}</b></div><div class="skill-shop-icon"><img src="${esc(s.icon)}" alt=""></div><h2>${esc(s.name)}</h2><p>${esc(skillDescription(s.id))}</p><div class="skill-meta"><span>DURASI DASAR<b>${s.duration} detik</b></span><span>AKTIVASI<b>Meter penuh</b></span></div><button data-buy-skill="${s.id}" class="${chosen?'outline':'primary'}" ${chosen?'disabled':''}>${chosen?'Terpasang ✓':native?'Pakai skill bawaan':own?'Pasang skill →':'● '+skillPrice(s.id).toLocaleString('id-ID')+' · Beli & pasang'}</button></article>`}).join('')}</div>`+
 `<p class="skill-save-note">Skill bawaan gratis untuk karakternya. Skill yang dibeli bisa dipakai ulang tanpa bayar lagi. Pilihan disimpan per karakter di browser ini.</p>`);
 $$('[data-tab]').forEach(el=>el.onclick=()=>{shopTab=el.dataset.tab;showShop()});
 $('#skillCharacter').onchange=e=>{selectedFace=Number(e.target.value);saved.face=selectedFace;save();applyFaces();showSkillShop()};
 $$('[data-buy-skill]').forEach(el=>el.onclick=()=>{if(equipSkill(el.dataset.buySkill)){showSkillShop();toast(skillDef(el.dataset.buySkill).name+' dipasang untuk '+ownName(),'✓')}});
 $('#restoreNativeSkill').onclick=()=>{delete saved.playerSkills[String(selectedFace)];save();showSkillShop();toast('Skill bawaan dipakai kembali')};
}
const shopBeforeSkills=showShop;
showShop=function(){if(shopTab==='skill')return showSkillShop();shopBeforeSkills()};
// A direct skill-shop shortcut from player selection; no inventory edit affects CPU.
const rosterBeforeSkills=showRoster;
showRoster=function(purpose='match'){
 rosterBeforeSkills(purpose);
 if(!(selectSide===1&&purpose==='match')){
  const info=$('.selected-info');if(info){const link=document.createElement('button');link.className='skill-roster-link outline';link.textContent='Ganti skill · Skill Lab →';link.onclick=()=>{shopTab='skill';showShop()};info.append(link)}
 }
};
