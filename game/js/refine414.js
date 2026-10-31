'use strict';
// 4.14: one RAF, cached lobby poses, purposeful bounded match feedback.
if (!avatarPreview45) {
 const poses414 = new Map(); let lobbyStamp414 = 0;
 const motion414 = () => saved.effects !== false && !reducedMotion.matches;
 const render414 = renderCharacters;
 renderCharacters = function() {
  render414(); poses414.clear();
  if (view !== 'home') return;
  document.querySelectorAll('.hero-cast canvas[data-character]').forEach((el,i) => {
   const image=document.createElement('canvas');image.width=el.width;image.height=el.height;
   image.getContext('2d').drawImage(el,0,0);poses414.set(el,{image,phase:i*2.3});
  });
 };
 window.tickLobby414 = function(now) {
  if(state!=='menu'||view!=='home'||document.hidden||!motion414()||now-lobbyStamp414<1000/30)return;
  lobbyStamp414=now;
  for(const [el,p] of poses414){
   if(!el.isConnected){poses414.delete(el);continue;}
   const c=el.getContext('2d'),w=el.width,h=el.height,t=now*.001+p.phase;
   const breath=Math.sin(t*2.6),ready=Math.sin(t*1.3);
   c.clearRect(0,0,w,h);c.save();c.translate(w/2,h-15);
   c.fillStyle='#041a2440';c.beginPath();c.ellipse(0,1,w*.16*(1-breath*.025),4,0,0,Math.PI*2);c.fill();
   c.translate(ready*1.8,-1.5-breath*1.4);c.rotate(ready*.012);c.scale(1-breath*.004,1+breath*.007);
   c.drawImage(p.image,-w/2,-h+15);c.restore();
  }
 };
 reducedMotion.addEventListener?.('change',()=>{if(view==='home')renderCharacters()});

 // Elite picks a legal shot trajectory around the actual goalkeeper. Contact is
 // still mandatory; no teleport, hidden speed boost, extra reach or meter cheat.
 const drive414=drive44;
 drive44=function(p,hit,active){
  const ok=drive414(p,hit,active);
  if(!ok)return ok;
  if(active&&p.side===1&&mode!=='versus'&&cpuLevel()>=2&&!p.aiLob){
   const vx=ball.vx,g=settings().gravity,drag=settings().ballDrag;
   const distance=Math.max(1,ball.x-LEFT-ball.r-3),speed=Math.max(200,-vx);
   const goalTime=clamp43(drag>0&&distance*drag<speed?-Math.log(1-distance*drag/speed)/drag:distance/speed,.035,1.7);
   const arrival=cpuLevel()===3?[GROUND-32,POST+ball.r+24,GROUND-62]:[GROUND-38,GROUND-70];
   let best=null;
   for(const target of arrival){
    const vy=clamp43((target-ball.y-.5*g*goalTime*goalTime)/goalTime,-355,110);
    let x=ball.x,y=ball.y,dx=vx,dy=vy,clear=Infinity;
    for(let t=0;t<goalTime;t+=1/60){dx*=Math.exp(-drag/60);dy+=g/60;x+=dx/60;y+=dy/60;
     if(y>GROUND-ball.r){y=GROUND-ball.r;dy=-Math.abs(dy)*settings().bounce;}
     // Predict the human's current legal motion, never their next input.
     const hx=clamp43(p1.x+p1.vx*Math.min(t,.22),LEFT+40,RIGHT-40),hp=headPose47(p1);
     const py=p1.onGround?p1.y:Math.min(GROUND,p1.y+p1.vy*t+.5*g*1.4*t*t);
     if(Math.abs(x-hx)<105){const head=Math.hypot(x-(hx+hp.x*(p1.size||1)),y-(py+hp.y*(p1.size||1)))-(G47.headR*(p1.size||1)+ball.r);clear=Math.min(clear,head);}
    }
    const valid=y>=POST+ball.r+7&&y<=GROUND+1;
    const score=(valid?1000:0)+Math.min(200,clear)-(target===GROUND-32?0:6);
    if(!best||score>best.score)best={vy,score};
   }
   if(best)ball.vy=best.vy+(cpuLevel()===2?(Math.random()-.5)*20:0);
  }
  if(active&&motion414()){
   HA46.ring(hit.x,hit.y,p.fire>0?'#ffc978':'#c1fff0',45,.21,2);
   // Three precise speed streaks; no fullscreen bloom that obscures play.
   shots414.push({x:hit.x,y:hit.y,a:Math.atan2(ball.vy,ball.vx),life:.17,total:.17,color:p.fire>0?'#ffc978':'#eafff8'});
   if(shots414.length>6)shots414.shift();
  }
  return ok;
 };
 const shots414=[],landed414=[false,false];
 const sim414=simulate;
 simulate=function(dt){
  const prev=[p1.onGround,p2.onGround];sim414(dt);
  for(let i=shots414.length-1;i>=0;i--)if((shots414[i].life-=dt)<=0)shots414.splice(i,1);
  if(state!=='playing'||!motion414())return;
  for(const [i,p] of [p1,p2].entries()){
   if(p.onGround&&!prev[i]&&!landed414[i]){HA46.ring(p.x,p.y-1,'#c9f4d9',35,.24,1.5,.19);landed414[i]=true;}
   if(!p.onGround)landed414[i]=false;
  }
 };
 const fx414=drawSkillEffects;
 drawSkillEffects=function(){fx414();if(!motion414())return;ctx.save();ctx.lineCap='round';
  for(const s of shots414){const age=1-s.life/s.total;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);ctx.globalAlpha=(1-age)*.65;ctx.strokeStyle=s.color;ctx.lineWidth=2;
   for(const offset of [-10,0,10]){ctx.beginPath();ctx.moveTo(16+age*48,offset);ctx.lineTo(38+age*65,offset*.5);ctx.stroke();}ctx.restore();}
  ctx.restore();
 };
 const reset414=resetPositions;resetPositions=function(){reset414();shots414.length=0;landed414.fill(false)};
 const page414=renderPage;renderPage=function(...args){page414(...args);const edition=document.querySelector('.brand-edition');if(edition)edition.textContent='MATCHDAY / 4.46.0';
  if(view==='world'&&world?.phase==='knockout'){
   const current=document.querySelector(`[data-ko="${world.knockRound}"]`);if(current){current.classList.add('current-round414');current.title='Babak aktif turnamen';current.setAttribute('aria-current','step');}
   const selected=document.querySelector('.knockout-tabs .active');selected?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  }
 };
}
