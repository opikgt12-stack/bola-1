'use strict';
// Premium equipment uses the same save, meter, physical contact and 120 Hz loop.
{
 const definitions=window.PREMIUM419,lookup=new Map(definitions.map(s=>[s.id,s]));
 window.premiumSkill419=id=>lookup.get(id);
 const oldDef=skillDef;skillDef=function(id){const s=lookup.get(id);return s?{...s,enabled:managedConfig?.shop?.['skill-'+id]?.enabled!==false}:oldDef(id)};
 const oldPrice=skillPrice;skillPrice=function(id){const s=lookup.get(id);return s?Math.max(10000,Math.min(250000,Number(managedConfig?.shop?.['skill-'+id]?.price??s.price)||s.price)):oldPrice(id)};
 const oldDescription=skillDescription;skillDescription=function(id){return lookup.get(id)?.description||oldDescription(id)};
 showSkillShop=function(){
  state='menu';shopTab='skill';const eq=skillFor({side:0,character:selectedFace});
  const all=definitions.filter(s=>skillSellable(s.id)).sort((a,b)=>skillPrice(a.id)-skillPrice(b.id));
  renderPage('shop',heading('','Skill Arsenal','Kemampuan premium · Satu skill aktif per pemain.',`<label class="skill-character-select">PEMAIN<select id="skillCharacter">${ROSTER.filter(r=>r.enabled!==false).map(r=>`<option value="${r.id}" ${r.id===selectedFace?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>`)+shopTabsMarkup()+
   `<section class="skill-loadout-strip arsenal-loadout419"><img src="${esc(eq.icon)}" alt=""><div><small>LOADOUT AKTIF</small><strong>${esc(eq.name)}</strong><span>${esc(ownName())} · Aktif saat meter penuh</span></div><button class="outline" id="restoreNativeSkill">Skill bawaan</button></section>`+
   `<div class="skill-grid arsenal419 arsenal420">${all.map(s=>{const own=skillUnlocked(s.id),chosen=s.id===eq.id;return `<article class="skill-shop-card ${chosen?'equipped-skill':''}" style="--skill-color:${s.color}"><div class="skill-card-label"><span>${s.tag}</span><b>${String(s.tier).padStart(2,'0')} / 06</b></div><button class="skill-shop-icon skill-art420" data-preview-skill="${s.id}" aria-label="Lihat detail ${s.name}"><img src="${s.icon}" alt="${s.name}" loading="lazy"></button><h2>${s.name}</h2><p>${s.description}</p><div class="arsenal-stats419"><span>TENDANGAN<b>+${Math.round((s.shot-1)*100)}%</b></span><span>KECEPATAN<b>+${Math.round((s.speed-1)*100)}%</b></span><span>DURASI<b>${s.duration} dtk</b></span></div><div class="arsenal-price419"><small>${own?'KOLEKSI PEMAIN':'HARGA SKILL'}</small><strong>● ${skillPrice(s.id).toLocaleString('id-ID')}</strong></div><button data-buy-skill="${s.id}" class="${chosen?'outline':'primary'}" ${chosen?'disabled':''}>${chosen?'Terpasang ✓':own?'Pasang skill →':'Beli & pasang →'}</button></article>`}).join('')}</div>`);
  $$('[data-tab]').forEach(el=>el.onclick=()=>{shopTab=el.dataset.tab;showShop()});
  $$('[data-preview-skill]').forEach(el=>el.onclick=()=>previewSkill420(el.dataset.previewSkill));
  $('#skillCharacter').onchange=e=>{selectedFace=Number(e.target.value);saved.face=selectedFace;save();applyFaces();showSkillShop()};
  $$('[data-buy-skill]').forEach(el=>el.onclick=()=>{if(equipSkill(el.dataset.buySkill)){showSkillShop();toast(skillDef(el.dataset.buySkill).name+' terpasang','✓')}});
  $('#restoreNativeSkill').onclick=()=>{delete saved.playerSkills[String(selectedFace)];save();showSkillShop()};
 };
 function previewSkill420(id){const s=lookup.get(id);if(!s)return;const dialog=document.createElement('dialog');dialog.className='skill-preview420';dialog.setAttribute('aria-labelledby','skillPreviewTitle420');dialog.innerHTML=`<header><span>DETAIL KEMAMPUAN</span><button class="outline" aria-label="Tutup detail skill">×</button></header><div class="skill-preview-layout420" style="--skill-color:${s.color}"><img src="${s.icon}" alt="${s.name}"><section><small>${s.tag}</small><h2 id="skillPreviewTitle420">${s.name}</h2><p>${s.description}</p><div class="arsenal-stats419"><span>TENDANGAN<b>+${Math.round((s.shot-1)*100)}%</b></span><span>KECEPATAN<b>+${Math.round((s.speed-1)*100)}%</b></span><span>DURASI<b>${s.duration} dtk</b></span></div><strong class="preview-price420">● ${skillPrice(s.id).toLocaleString('id-ID')}</strong></section></div>`;document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal(); }
 if(!avatarPreview45){
  const active=p=>p.premium419&&p.premium419.remaining>0&&settings().skillEnabled?p.premium419:null;
  const boosted=new WeakMap(),baseBoot=bootFor;
  bootFor=function(p){const b=baseBoot(p),a=active(p);if(!a)return b;let cache=boosted.get(b);if(!cache){cache=new Map();boosted.set(b,cache)}if(!cache.has(a.id)){const s=lookup.get(a.id);cache.set(a.id,{...b,speed:b.speed*s.speed,shot:b.shot*s.shot,jump:b.jump*s.jump,reach:b.reach*s.reach,cooldown:Math.max(.055,b.cooldown*s.recovery)})}return cache.get(a.id)};
  const activate=activateSkill;
  activateSkill=function(p){const s=lookup.get(skillFor(p).id);if(!s)return activate(p);
   if(state!=='playing'||p.frozen>0||p.stun>0||p.power<100||!settings().skillEnabled||!skillSellable(s.id)||active(p))return false;
   p.power=0;p.skillPulse=.65;p.skillColor=s.color;
   p.premium419={id:s.id,remaining:s.duration,elapsed:0,pulse:0,dash:0,counter:0,orbit:0};
   if(s.tier>=5){p.shield=Math.max(p.shield||0,s.duration);p.fire=Math.max(p.fire||0,s.duration)}
   if(p.side===0)matchMetrics.skillUse++;
   sfx('skill');skillFX(p.x,p.y-45,s.color);window.HA46?.ring(p.x,p.y-40,s.color,110,.5,3);
   announce(s.name,s.tag,p.side===0?'good':'bad');return true;
  };
  const tick=tickSkills;tickSkills=function(dt){tick(dt);
   for(const p of [p1,p2]){const a=p.premium419;if(!a)continue;
    if(!settings().skillEnabled){p.premium419=null;continue}
    a.remaining=Math.max(0,a.remaining-dt);a.elapsed+=dt;if(a.remaining<=0){p.premium419=null;continue}
    const s=lookup.get(a.id),enemy=p.side===0?p2:p1,d=Math.hypot(enemy.x-p.x,enemy.y-p.y),protectedEnemy=(enemy.shield||0)>0||(enemy===p1&&window.controlInfo415?.().active&&controlInfo415().settings.shield);
    if(s.tier===1){a.dash-=dt;if(a.dash<=0){a.dash=.8;if(p.onGround&&Math.abs(ball.x-p.x)>65)p.vx=clamp43(p.vx+Math.sign(ball.x-p.x)*180,-1250,1250);}}
    a.counter=Math.max(0,(a.counter||0)-dt);
    if((s.tier===5||s.tier===6)&&a.counter<=0&&Math.hypot(ball.x-p.x,ball.y-(p.y-48))<88&&ball.vx*(p.side===0?1:-1)<-120){ball.vx=(p.side===0?1:-1)*Math.min(1750,Math.max(600,Math.abs(ball.vx)*1.15));ball.vy=Math.min(30,ball.vy*.65);ball.hot=Math.max(ball.hot,1);ball.lastTouch=p.side;a.counter=1.4;window.HA46?.ring(ball.x,ball.y,s.color,90,.35,3);}
    if(s.tier===2){a.pulse-=dt;if(a.pulse<=0){a.pulse=.95;if(d<s.radius&&!protectedEnemy){enemy.heavy=Math.max(enemy.heavy||0,.65);enemy.vx=clamp43(enemy.vx+Math.sign(enemy.x-p.x||1)*260,-1100,1100);if(p.side===0)matchMetrics.skillHits++}window.HA46?.ring(p.x,p.y-40,s.color,s.radius,.45,2)}}
    if((s.tier===3||s.tier===6)&&d<s.radius&&!protectedEnemy)enemy.heavy=Math.max(enemy.heavy||0,.15);
    if((s.tier===3||s.tier===6)&&ball.lastTouch!==p.side&&Math.hypot(ball.x-p.x,ball.y-(p.y-45))<s.radius&&ball.vx*(p.side===0?1:-1)<0){ball.vx*=Math.exp(-1.35*dt);ball.vy*=Math.exp(-.6*dt);}
    if(s.tier===6){a.orbit-=dt;if(a.orbit<=0){a.orbit=1.6;if(d<s.radius&&!protectedEnemy){enemy.heavy=Math.max(enemy.heavy||0,.45);enemy.vx=clamp43(enemy.vx+Math.sign(enemy.x-p.x||1)*310,-1150,1150)}window.HA46?.ring(p.x,p.y-40,'#c7f5ff',s.radius,.55,2)}}
    if(s.tier>=4){const tx=p.x+(p.side===0?1:-1)*46,ty=p.y-28,dx=tx-ball.x,dy=ty-ball.y,dist=Math.hypot(dx,dy);
     // Accelerate, never snap. No force through a post/roof or inside a goal.
     if(ball.x>LEFT+ball.r+8&&ball.x<RIGHT-ball.r-8&&ball.y>POST+ball.r+6&&dist<s.radius&&dist>24){
      const force=(s.tier===6?1500:s.tier===5?1200:900)*(1-dist/(s.radius*1.5));
      ball.vx=clamp43(ball.vx+dx/dist*force*dt,-1800,1800);ball.vy=clamp43(ball.vy+dy/dist*force*dt,-1050,1050);
     }
    }
   }
  };
  const draw=drawSkillEffects;drawSkillEffects=function(){draw();if(saved.effects===false||reducedMotion.matches||window.HA46&&HA46.state.quality<1)return;
   ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
   for(const p of [p1,p2]){const a=active(p);if(!a)continue;const s=lookup.get(a.id),t=a.elapsed,x=p.x,y=p.y-44;
    ctx.save();ctx.translate(x,y);ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=2;
    const circle=(r,alpha)=>{ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke()};
    if(s.tier===1){
     ctx.globalAlpha=.8;for(let k=0;k<3;k++){const sign=p.face||1;ctx.beginPath();ctx.moveTo(-sign*12,12+k*13);ctx.lineTo(-sign*(42+Math.sin(t*15+k)*8),2+k*13);ctx.lineTo(-sign*34,19+k*13);ctx.lineTo(-sign*(86+k*7),10+k*13);ctx.stroke()}
     ctx.globalAlpha=.35;ctx.beginPath();ctx.ellipse(0,39,49,10,0,0,7);ctx.stroke();
    }else if(s.tier===2){
     for(let k=0;k<3;k++){const f=(t*1.2+k/3)%1;ctx.globalAlpha=(1-f)*.7;ctx.lineWidth=3*(1-f)+1;ctx.beginPath();ctx.ellipse(0,2,34+f*90,27+f*56,0,-.8,2.1);ctx.stroke();ctx.beginPath();ctx.ellipse(0,2,34+f*90,27+f*56,0,2.3,5.5);ctx.stroke()}
    }else if(s.tier===3){
     circle(73,.4);ctx.globalAlpha=.75;
     for(let k=0;k<12;k++){const r=k*Math.PI/6+t*.25;ctx.beginPath();ctx.moveTo(Math.cos(r)*65,Math.sin(r)*65);ctx.lineTo(Math.cos(r)*73,Math.sin(r)*73);ctx.stroke()}
     ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(Math.cos(t)*41,Math.sin(t)*41);ctx.lineTo(0,0);ctx.lineTo(Math.cos(-t*.4)*54,Math.sin(-t*.4)*54);ctx.stroke();
    }else if(s.tier===4){
     for(let arm=0;arm<3;arm++){ctx.globalAlpha=.6;ctx.beginPath();for(let k=0;k<=26;k++){const angle=arm*2.094+t*1.8+k*.12,r=18+k*2;const xx=Math.cos(angle)*r,yy=Math.sin(angle)*r*.7;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke()}
     for(let i=0;i<5;i++){const z=t+i*1.26;ctx.globalAlpha=.75;ctx.save();ctx.translate(Math.cos(z)*78,Math.sin(z)*52);ctx.rotate(z);ctx.fillRect(-3,-3,6,6);ctx.restore()}
    }else if(s.tier===5){
     ctx.globalAlpha=.65;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<6;i++){const z=-Math.PI/2+i*Math.PI/3,xx=Math.cos(z)*76,yy=Math.sin(z)*85;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.closePath();ctx.stroke();
     ctx.globalAlpha=.23;for(let i=0;i<6;i++){const z=-Math.PI/2+i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(z)*76,Math.sin(z)*85);ctx.stroke()}
     ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(-18,-92);ctx.lineTo(0,-110);ctx.lineTo(18,-92);ctx.stroke();
    }else{
     circle(77,.25);for(let k=0;k<3;k++){const z=t*(k%2?-1.2:1)+k*2.094;ctx.strokeStyle=['#8eeeff','#dfb7ff','#ffe5a3'][k];ctx.globalAlpha=.7;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(0,0,67+k*7,36+k*6,z,0,Math.PI*2);ctx.stroke()}
     for(let i=0;i<8;i++){const z=t*1.4+i*Math.PI/4,xx=Math.cos(z)*88,yy=Math.sin(z)*62;ctx.globalAlpha=.8;ctx.fillStyle=i%2?'#dfc9ff':'#b5faff';ctx.beginPath();ctx.moveTo(xx-4,yy);ctx.lineTo(xx,yy-6);ctx.lineTo(xx+4,yy);ctx.lineTo(xx,yy+6);ctx.closePath();ctx.fill()}
    }
    ctx.restore();
    if(s.tier>=4&&Math.hypot(ball.x-x,ball.y-y)<s.radius){ctx.strokeStyle=s.color;ctx.globalAlpha=.25;ctx.lineWidth=s.tier===6?3:1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((x+ball.x)/2,y-45,ball.x,ball.y);ctx.stroke()}
   }ctx.restore();
  };
  window.skillState419=p=>p.premium419?{...p.premium419}:null;
 }
}
