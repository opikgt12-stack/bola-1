'use strict';
// 4.16: monotonic equipment progression and bounded cosmetic feedback.
function normalizeBootStats416() {
 const ordered = [...BOOTS].sort((a,b) => bootPrice(a)-bootPrice(b));
 const prices = [...new Set(ordered.map(bootPrice))];
 for (const b of ordered) {
  const rank = prices.indexOf(bootPrice(b)), t = rank / Math.max(1, prices.length-1);
  b.shot = +(1+t*1.1).toFixed(3);
  b.speed = +(1+t*.42).toFixed(3);
  b.jump = +(1+t*.32).toFixed(3);
  b.reach = +(1+t*.5).toFixed(3);
  b.cooldown = +(.32-t*.21).toFixed(3);
 }
}
function canBootColor416(b) {
 return b.id==='boot-infinity'&&bootEnabled(b.id)&&bootPrice(b)>=Math.max(...BOOTS.filter(x=>bootEnabled(x.id)).map(bootPrice));
}
function bootShotLimit416(p) {
 const b=bootFor(p);let limit=1250+Math.max(0,b.shot-1)/1.1*700;
 const control=window.controlInfo415?.();
 if(p.side===0&&control?.active){if(control.settings.autoPlay)return 2400;limit*=control.settings.shot;}
 return Math.min(2400,limit);
}
ballSpeedLimit=function(){return bootShotLimit416(ball?.lastTouch===0?p1:p2);};
bootStatRows=function(b){return [['SHOT',b.shot],['SPEED',b.speed],['JUMP',b.jump],['RECOVERY',.32/b.cooldown]].map(([k,v])=>`<span><small>${k}</small><b>${v===1?'BASE':'+'+Math.round((v-1)*100)+'%'}</b></span>`).join('');};
function drawBruise416(c,p) {
 const fade = Math.min(1, (p.bruiseUntil416-simTime)/1.2), power=p.bruisePower416||.4;
 c.save(); c.globalAlpha=fade;
 // Cartoon cheek/eye swelling; no blood. Drawn inside the actual head transform.
 c.fillStyle=`rgba(112,69,150,${.35+power*.32})`;
 c.beginPath(); c.ellipse(17,5,9+power*3,6+power*2,-.2,0,Math.PI*2); c.fill();
 c.fillStyle='#e397b2';c.globalAlpha=fade*.55;
 c.beginPath();c.ellipse(-17,12,8,4,.2,0,Math.PI*2);c.fill();
 c.globalAlpha=fade*.85;c.strokeStyle='#60365c';c.lineWidth=1.8;c.lineCap='round';
 for(let i=0;i<3;i++){c.beginPath();c.moveTo(12+i*4,3);c.lineTo(10+i*4,8);c.stroke();}
 c.restore();
}
normalizeBootStats416();
if (!avatarPreview45) {
 const reset416=resetPositions;
 resetPositions=function(){reset416();for(const p of [p1,p2])if(p){p.bruiseUntil416=0;p.bruiseHit416=-1;}};
 const base416=drawBasePlayer;
 drawBasePlayer=function(c,p,photo=null,mini=false){
  base416(c,p,photo,mini);
  if(mini||p.preview||p.bruiseUntil416<=simTime||!p.bruiseUntil416||saved.effects===false||reducedMotion.matches)return;
  const hp=headPose47(p),fade=Math.min(1,(p.bruiseUntil416-simTime)/1.2);
  c.save();c.translate(p.x+hp.x,p.y+hp.y-48);c.globalAlpha=.8*fade;
  for(let i=0;i<3;i++){
   const a=simTime*3+i*Math.PI*2/3,x=Math.cos(a)*26,y=Math.sin(a)*6;
   c.fillStyle=i%2?'#aeeaff':'#ffe09a';c.beginPath();
   for(let j=0;j<10;j++){const angle=j*Math.PI/5-Math.PI/2,r=j%2?2:4.5;c.lineTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r);}
   c.closePath();c.fill();
  }c.restore();
 };
 // Avoid tab-switch backlog and stale movement input.
 document.addEventListener('visibilitychange',()=>{acc=0;last=0;if(document.hidden)keys={};});
}
if (!avatarPreview45) {
 const effects416=()=>saved.effects!==false&&!reducedMotion.matches&&(!window.HA46||HA46.state.quality>0);
 // Premium energy facets use the existing frame, no extra timers or particle pool.
 const playerFX416=drawBasePlayer;
 drawBasePlayer=function(c,p,photo=null,mini=false){
  if(!mini&&!p.preview&&effects416()){
   const boot=bootFor(p),tier=window.equipmentFX49?.level(boot)||0;
   if(tier>=2&&(Math.abs(p.vx)>130||p.kick>.1)){
    const size=18+tier*5,t=simTime*7+p.side;
    c.save();c.translate(p.x,p.y-12);c.strokeStyle=boot.color;c.lineWidth=tier>=4?2:1.3;c.globalAlpha=.5;
    for(let i=0;i<Math.min(3,tier-1);i++){
     const x=-p.face*(25+i*15),y=Math.sin(t+i)*4;
     c.beginPath();c.moveTo(x,y-8);c.lineTo(x-p.face*size*.35,y-2);c.lineTo(x-p.face*size*.2,y+2);c.lineTo(x-p.face*size,y+8);c.stroke();
    }c.restore();
   }
  }playerFX416(c,p,photo,mini);
 };
 const ballFX416=drawBall;
 drawBall=function(){
  if(effects416()){
   const item=catalog.find(x=>x.id===saved.ball),tier=window.equipmentFX49?.level(item)||0,speed=Math.hypot(ball.vx,ball.vy);
   if(tier>=2&&speed>480){
    ctx.save();ctx.translate(ball.x,ball.y);ctx.rotate(Math.atan2(ball.vy,ball.vx));
    const length=Math.min(85,18+tier*8+speed*.012);
    for(let i=0;i<Math.min(3,tier);i++){
     ctx.fillStyle=tier===5?`hsl(${(simTime*50+i*70)%360} 85% 75%)`:item.color;
     ctx.globalAlpha=.05+(2-i)*.035;const width=ball.r*(1-i*.22);
     ctx.beginPath();ctx.moveTo(-length-i*8,0);ctx.quadraticCurveTo(-length*.25,-width,-4,-width*.6);ctx.lineTo(-4,width*.6);ctx.quadraticCurveTo(-length*.25,width,-length-i*8,0);ctx.fill();
    }ctx.restore();
   }
  }ballFX416();
 };
 const contactFX416=drive44;
 drive44=function(p,hit,active){
  const result=contactFX416(p,hit,active);
  if(result&&active&&effects416()){
   const b=bootFor(p),tier=window.equipmentFX49?.level(b)||0;
   if(tier>=2){window.HA46?.ring(hit.x,hit.y,b.color,35+tier*11,.26+tier*.025,1.5+tier*.3);if(tier>=4)window.HA46?.ring(hit.x,hit.y,'#fff3c7',28+tier*6,.22,1.5,.42);}
  }return result;
 };
}
