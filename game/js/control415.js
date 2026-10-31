'use strict';
// Live modifiers are session-only. Server-issued settings expire and fail closed offline.
if (!avatarPreview45) {
 const defaults415=()=>({enabled:false,autoPlay:false,teleport:true,autoWin:false,speed:1,shot:1,jump:1,infiniteSkill:false,shield:false,troll:'off'});
 let config415=defaults415(),revision415=-1,deadline415=0,lease415=0,winClock415=0,skillClock415=-10;
 const active415=()=>config415.enabled&&performance.now()<deadline415&&performance.now()<lease415;
 function valid415(s){return s&&['enabled','autoPlay','autoWin','infiniteSkill','shield'].every(k=>typeof s[k]==='boolean')&&(s.teleport===undefined||typeof s.teleport==='boolean')&&['speed','shot','jump'].every(k=>Number.isFinite(s[k])&&s[k]>=1&&s[k]<=(k==='jump'?2:3))&&['off','slowRival','reverseRival','chaosBall'].includes(s.troll);}
 window.receiveControl415=function(d){
  if(!d||!Number.isInteger(d.version)||!valid415(d.settings)){window.clearControl415();return;}
  if(d.version<revision415)return;
  const next=d.version!==revision415;revision415=d.version;config415={...defaults415(),...d.settings};
  deadline415=performance.now()+Math.max(0,Math.min(7200,Number(d.expiresAt)-Number(d.serverTime)))*1000;
  lease415=performance.now()+30000;if(next){winClock415=0;skillClock415=-10;autoBrain415={};}
 };
 window.controlAck415=()=>revision415;
 window.controlState415=()=>state;
 window.clearControl415=()=>{config415=defaults415();lease415=0;winClock415=0;autoBrain415={};};
 window.controlInfo415=()=>({active:active415(),version:revision415,settings:{...config415}});
 // Dashboard-only controls: no game overlay, toast, badge, or local stop UI.
 window.addEventListener('offline',()=>{lease415=0;});
 // Gear multipliers are computed, never written into the equipped item or save.
 const boot415=bootFor;let cachedBoot415=null,cachedKey415='',cachedResult415=null;
 bootFor=function(p){const base=boot415(p);if(!active415())return base;
  if(p===p1&&!p.preview){const key=revision415+':'+config415.speed+':'+config415.jump+':'+config415.troll+':'+config415.autoPlay;if(base!==cachedBoot415||key!==cachedKey415){cachedBoot415=base;cachedKey415=key;cachedResult415={...base,speed:base.speed*(config415.autoPlay?Math.max(2.2,config415.speed):config415.speed)*(config415.troll==='slowRival'?.25:1),cooldown:config415.autoPlay?base.cooldown*.62:base.cooldown,jump:base.jump*(config415.autoPlay?Math.max(1.2,config415.jump):config415.jump)*(config415.troll==='slowRival'?.7:1)};}return cachedResult415;}
  return base;
 };
 // A mirrored trajectory planner controls P1 through legal move/jump/shoot APIs.
 let autoBrain415={};
 function plan415(p,dt){
  const b=autoBrain415,sideX=1120-p.x,bx=1120-ball.x,bvx=-ball.vx,s=p.size||1,boot=bootFor(p),g=settings().gravity*1.4;
  b.wait=(b.wait||0)-dt;b.lock=Math.max(0,(b.lock||0)-dt);b.shoot=Math.max(0,(b.shoot||0)-dt);
  const speed=settings().playerSpeed*(ROSTER[p.character]?.pace||1)*boot.speed*(p.heavy>0?.55:1)/Math.sqrt(s),jumpSpeed=settings().jumpSpeed*(ROSTER[p.character]?.jump||1)*boot.jump;
  const hp=headPose47({...p,face:1,kick:0,vx:0,vy:0,onGround:true}),hx=-hp.x,sum=G47.headR*s+ball.r;
  const roof=p.y<=POST+3&&(p.x<LEFT+30*s||p.x>RIGHT-30*s),safe=sideX>LEFT+65*s&&sideX<RIGHT-65*s;
  if(roof){b.target=sideX>560?RIGHT-135*s:LEFT+135*s;b.jump=false;b.wait=0;}
  else if(b.wait<=0||!Number.isFinite(b.target)){
   b.wait=.025;const samples=predictTrajectory410(2.15).map(q=>({...q,x:1120-q.x,vx:-q.vx}));
   const danger=samples.find(q=>q.x>=RIGHT-ball.r-4&&q.y>=POST+ball.r+5);
   const roofBall=ball.y+ball.r<=POST+16&&(bx<LEFT+ball.r+5||bx>RIGHT-ball.r-5);
   let target=bx+40*s,jump=false,chosen=null,fallback=null;
   for(const q of samples){
    if(q.x<LEFT+ball.r+5||q.x>RIGHT-ball.r-5||q.y+ball.r<=POST+10&&(q.x<LEFT+30||q.x>RIGHT-30))continue;
    const base=p.onGround?p.y:Math.min(GROUND,p.y+p.vy*q.t+.5*g*q.t*q.t),reach=speed*Math.max(0,q.t-.025)+14*s;
    const foot=q.y>=base-54*s&&q.y<=base+ball.r&&Math.abs(q.x+38*s-sideX)<reach;
    const head=Math.abs(q.y-(base+hp.y*s))<sum*.79&&Math.abs(q.x-hx*s+sum*.64-sideX)<reach;
    const airborne=q.t>.10&&q.t<.53&&q.vy>-35&&p.onGround&&p.support==null&&safe&&b.lock<=0&&Math.abs(q.y-(p.y-jumpSpeed*q.t+.5*g*q.t*q.t+hp.y*s))<sum*.67&&Math.abs(q.x-hx*s+sum*.60-sideX)<reach;
    // Prefer a controllable boot strike. A passive header often gifts possession.
    if(foot){chosen=q;target=q.x+38*s;jump=false;break;}
    if(head||airborne){
     const candidate={q,target:q.x-hx*s+sum*.64,jump:!head&&airborne};
     if(!fallback)fallback=candidate;
     if(danger&&q.t<danger.t){chosen=q;target=candidate.target;jump=candidate.jump;break;}
    }
   }
   if(!chosen&&fallback){chosen=fallback.q;target=fallback.target;jump=fallback.jump;}
   if(!chosen){const q=samples.find(q=>q.y>GROUND-75*s)||samples.at(-1);if(q)target=q.x+40*s;}
   if(roofBall){target=bx>560?RIGHT-125*s:LEFT+125*s;jump=false;}
   else if(ball.y<p.y+hp.y*s-38*s&&!danger){target=Math.max(675,bx+105*s);jump=false;}
   else if(1120-p2.x>bx-145&&1120-p2.x<bx+60&&ball.y>GROUND-85*s&&bvx>=-100){target=bx+60*s;jump=false;}
   if(bvx>120&&bx>sideX+22*s&&ball.y>POST+24)target=Math.max(target,Math.min(RIGHT-42*s,bx+55*s));
   b.target=clamp43(target,LEFT+42*s,RIGHT-42*s);b.jump=jump;
  }
  // Re-engage a slow ball immediately, without walking through a dangerous post cap.
  if(!roof&&ball.y>GROUND-75*s&&Math.abs(bvx)<190&&bx<sideX-82*s){b.target=clamp43(bx+38*s,LEFT+42*s,RIGHT-42*s);b.jump=false;}
  const gap=b.target-sideX;let dir=Math.abs(gap)<3?0:-Math.sign(gap);
  if(!roof&&Math.abs(gap)<48&&Math.sign(-p.vx)===Math.sign(gap))dir*=Math.max(.15,Math.abs(gap)/48);
  let j=!roof&&p.onGround&&b.lock<=0&&b.jump&&safe;if(j){b.lock=.38;b.jump=false;b.wait=0;}
  b.blocked=Math.abs(dir)>.2&&Math.abs(p.x-(b.prevX??p.x))<.15?(b.blocked||0)+dt:Math.max(0,(b.blocked||0)-dt*2);b.prevX=p.x;
  // Leave post traps, or jump a close defender only when the ball is actually reachable.
  if(!roof&&b.blocked>.32&&p.onGround&&b.lock<=0){
   if(!safe){dir=p.x<560?1:-1;b.wait=0;}
   else if(Math.abs(ball.x-p.x)<170&&ball.y>p.y-155*s){j=true;b.jump=false;b.lock=.38;b.wait=0;}
  }
  p.face=1;
  if(!roof&&b.shoot<=0&&p.cool<=0&&Math.abs(ball.x-p.x)<92*s&&ball.y>p.y-70*s){const old=keys.x;keys.x=false;try{shoot(p);}finally{keys.x=old;}b.shoot=.065;}
  if(p.power>=100&&simTime-skillClock415>1&&settings().skillEnabled){
   const id=skillFor(p).id,near=Math.abs(ball.x-p.x)<200,close=Math.abs(p2.x-p.x)<260;
   const incoming=projectiles.some(q=>q.side!==0&&Math.abs(q.x-p.x)<280);
   const use=id==='titan'?near&&ball.y<p.y-160*s&&ball.x>350&&ball.x<760&&p.giant<=0:id==='shield'?incoming||near&&ball.hot>0:id==='fire'?near&&ball.y>p.y-110*s:id==='freeze'||id==='inflate'?close:id==='storm'?near||close:window.premiumSkill419?.(id)?(near||close)&&!p.premium419:false;
   if(use)activateSkill(p);
  }
  return {dir,j};
 }
 const move415=movePlayer;
 movePlayer=function(p,dir,j,dt){
  const on=active415();if(p===p1)p.controlAgility417=on&&config415.autoPlay?1.55:1;if(on&&p===p1&&config415.autoPlay&&state==='playing'&&p.frozen<=0&&p.stun<=0){const a=plan415(p,dt);dir=a.dir;j=a.j;}
  // Legacy wire keys retained for compatibility; every troll targets P1 only.
  if(on&&p===p1&&state==='playing'){
   if(config415.troll==='reverseRival'){dir=-dir;j=false;}
   if(config415.troll==='chaosBall'){const phase=simTime%1.8;if(phase<.28){dir=0;j=false;}else if(phase<.52)dir=-dir;}
  }
  move415(p,dir,j,dt);if(on&&p===p1&&config415.autoPlay)p.face=1;
 };
 const shot415=drive44;
 drive44=function(p,hit,active){
  const ok=shot415(p,hit,active);if(!ok||!active415()||p!==p1||!active)return ok;
  if(config415.shot>1||config415.autoPlay){ball.vx=clamp43(ball.vx*Math.max(config415.shot,config415.autoPlay?2.8:1),-2400,2400);ball.vy=clamp43(ball.vy,-1250,600);ball.hot=Math.max(ball.hot,1.1);HA46.ring(hit.x,hit.y,'#ffd27d',65,.28,3);}
  // Aim only after real boot contact; choose low/high placement around P2.
  if(config415.autoPlay&&ball.vx>0){
   const g=settings().gravity,drag=settings().ballDrag,distance=Math.max(1,RIGHT-ball.r-3-ball.x);
   if(ball.y<POST+ball.r+20){const descent=(POST+ball.r+32-ball.y)/1000+.065;ball.vx=Math.min(ball.vx,Math.max(260,distance/descent));}
   const v=Math.max(200,ball.vx);
   const flight=clamp43(drag>0&&distance*drag<v?-Math.log(1-distance*drag/v)/drag:distance/v,.025,1.6);
   let best=null;const hp=headPose47(p2),size=p2.size||1;
   for(const target of [GROUND-32,POST+ball.r+22,GROUND-62]){
    const vy=clamp43((target-ball.y-.5*g*flight*flight)/flight,-900,1100);
    let x=ball.x,y=ball.y,dx=ball.vx,dy=vy,clear=180;
    for(let t=0;t<flight;t+=1/120){dx*=Math.exp(-drag/120);dy+=g/120;x+=dx/120;y+=dy/120;
     if(y>GROUND-ball.r){y=GROUND-ball.r;dy=-Math.abs(dy)*settings().bounce;}
     const px=clamp43(p2.x+p2.vx*Math.min(t,.22),LEFT+40,RIGHT-40),py=p2.onGround?p2.y:Math.min(GROUND,p2.y+p2.vy*t+.5*g*1.4*t*t);
     if(Math.abs(x-px)<100)clear=Math.min(clear,Math.hypot(x-(px+hp.x*size),y-(py+hp.y*size))-(G47.headR*size+ball.r));
    }
    const score=(y>=POST+ball.r+7&&y<=GROUND+1?1000:0)+clear-(target===GROUND-32?0:4);
    if(!best||score>best.score)best={vy,score};
   }
   if(best)ball.vy=best.vy;
  }
  return ok;
 };
 const skill415=activateSkill;
 activateSkill=function(p){if(active415()&&p===p1&&config415.infiniteSkill){if(simTime-skillClock415<.7)return;skillClock415=simTime;const result=skill415(p);p.power=100;return result;}if(p===p1)skillClock415=simTime;return skill415(p);};
 const tick415=tickSkills;
 tickSkills=function(dt){tick415(dt);if(active415()){if(config415.infiniteSkill)p1.power=100;if(config415.shield){p1.frozen=0;p1.stun=0;p1.heavy=0;}}};
 let teleportClock416=0;
 function superPosition416(dt){
  teleportClock416=Math.max(0,teleportClock416-dt);
  if(teleportClock416>0||p1.frozen>0||p1.stun>0||config415.troll!=='off')return;
  const s=p1.size||1;
  const danger=ball.vx<-180&&ball.x<450&&ball.y>POST+ball.r;
  const intercept=clamp43(ball.x,LEFT+85*s,RIGHT-35*s);
  const target=clamp43(intercept-52*s,LEFT+50*s,RIGHT-55*s);
  const gap=Math.abs(target-p1.x),speed=Math.hypot(ball.vx,ball.vy);
  const airborne=ball.y<GROUND-100*s&&ball.y>90;
  if((gap<(danger?55:airborne?70:150)&&!airborne)||ball.y<65||speed<35)return;
  const targetY=clamp43(ball.y+18*s,110,GROUND);
  // Attack through real boot contact, including aerial interception.
  let x=target;
  if(Math.abs(x-p2.x)<82*s&&Math.abs(targetY-p2.y)<100)x=p2.x-86*s;
  x=clamp43(x,LEFT+50*s,RIGHT-55*s);
  if(Math.abs(x-p2.x)<72*s&&Math.abs(targetY-p2.y)<100)return;
  const fromX=p1.x,fromY=p1.y;
  p1.x=x;p1.y=targetY;p1.vx=0;p1.vy=Math.min(0,ball.vy*.2);p1.onGround=targetY>=GROUND;p1.support=null;
  p1.prevX=x;p1.prevY=targetY;p1.face=1;
  teleportClock416=danger?.3:.48;autoBrain415={};
  if(p1.cool<=0){const lob=keys.x;keys.x=false;try{shoot(p1);}finally{keys.x=lob;}}
  if(saved.effects!==false&&!reducedMotion.matches){
   window.HA46?.ring(fromX,fromY-35,'#8cdfff',55,.24,2);
   window.HA46?.ring(x,targetY-35,'#b8ffe6',65,.28,3);
  }
 }
 const sim415=simulate;
 simulate=function(dt){
  const on=active415();if(state==='playing'&&on){matchMetrics.adminAssisted=true;
   if(config415.autoPlay&&config415.teleport)superPosition416(dt);
   if(config415.infiniteSkill)p1.power=100;
   if(config415.autoWin&&mode!=='training'){winClock415+=dt;if(winClock415>=.7){score[0]=Math.max(score[0],score[1]+3);time=0;sudden=false;clearPresentation();finish();updateHud();return;}}
  }else if(!on)winClock415=0;
  sim415(dt);
 };
 const reset415=resetPositions;resetPositions=function(){reset415();autoBrain415={};teleportClock416=0;winClock415=0;skillClock415=-10;};
}
