'use strict';
// 4.17: faster tactical tiers, reactive replanning and goal-side recovery.
{
 // Shared legal movement; higher levels plan earlier, never teleport or alter ball speed.
 const levels=[
  {name:'Santai',reaction:.38,look:.65,pace:.70,shoot:.50,error:38},
  {name:'Normal',reaction:.16,look:1.25,pace:.96,shoot:.21,error:10},
  {name:'Pro',reaction:.065,look:1.8,pace:1,shoot:.11,error:3},
  {name:'Paling Jago',reaction:.025,look:2.15,pace:1,shoot:.045,error:0}
 ];
 window.CPU410=levels;
 const difficulty=$('#difficulty');if(['easy','normal','hard','elite'].includes(saved.cpuDifficulty410))difficulty.value=saved.cpuDifficulty410;
 const clamp410=(x,a,b)=>Math.max(a,Math.min(b,x));
 function trajectory410(horizon){
  const out=[];let {x,y,vx,vy,r}=ball;const h=1/60,rules=settings(),g=rules.gravity,top=POST-r;
  for(let t=h;t<=horizon+h*.5;t+=h){
   const oldY=y;vx*=Math.exp(-rules.ballDrag*h);vy+=g*h;x+=vx*h;y+=vy*h;
   if(y>GROUND-r){y=GROUND-r;vy=-Math.abs(vy)*rules.bounce;vx*=.985;if(Math.abs(vy)<45)vy=0;}
   if(!rules.skyOpen&&y<r+8){y=r+8;vy=Math.abs(vy)*.8;}
   for(const [a,b,dir] of [[28,LEFT,1],[RIGHT,1092,-1]])if(x+r>a&&x-r<b){
    if(oldY+r<=POST+1&&y+r>=POST&&vy>0){y=top;vy=Math.abs(vy)<150?0:-Math.abs(vy)*.38;}
    if(Math.abs(y-top)<3&&Math.abs(vy)<85){y=top;vy=0;if(dir*vx<145)vx=dir*Math.min(145,dir*vx+260*h);}
    if(oldY-r>=POST+5&&y-r<POST+5&&vy<0){y=POST+5+r;vy=Math.abs(vy)*.7;}
   }
   if(x<28+r){x=28+r;vx=Math.abs(vx)*.78;}if(x>1092-r){x=1092-r;vx=-Math.abs(vx)*.78;}
   out.push({x,y,vx,vy,t});
  }return out;
 }
 window.predictTrajectory410=trajectory410;
 function roofZone413(q,r=ball.r){return q.y+r<=POST+16&&q.y>POST-160&&(q.x<LEFT+r+5||q.x>RIGHT-r-5);}
 ai=function(dt){
  if(state!=='playing'||mode==='versus'||mode==='training')return;
  const level=cpuLevel(),cfg=levels[level],p=p2,s=p.size||1,b=p.brain??={};
  p.aiAgility417=level===3?1.12:level===2?1.05:1;
  // A real contact can invalidate the old route; the top tiers replan immediately.
  if(level>=2&&b.lastTouch417!==ball.lastTouch)b.wait=0;
  b.lastTouch417=ball.lastTouch;
  b.wait=(b.wait||0)-dt;b.jumpLock=Math.max(0,(b.jumpLock||0)-dt);b.shotWait=Math.max(0,(b.shotWait||0)-dt);
  if(p.frozen>0||p.stun>0){movePlayer(p,0,false,dt);b.wait=0;return;}
  const boot=bootFor(p),g=settings().gravity*1.4;
  const speed=settings().playerSpeed*(ROSTER[p.character]?.pace||1)*boot.speed*(p.heavy>0?.55:1)/Math.sqrt(s);
  const jumpSpeed=settings().jumpSpeed*(ROSTER[p.character]?.jump||1)*boot.jump;
  const hp=headPose47({...p,face:-1,kick:0,vx:0,vy:0,onGround:true}),sum=(window.G47?.headR||38)*s+ball.r;
  const minX=LEFT+42*s,maxX=RIGHT-42*s;
  // Walk OFF either roof first; never keep jumping against the underside/crossbar.
  const onRoof=p.y<=POST+3&&(p.x<LEFT+30*s||p.x>RIGHT-30*s);
  if(onRoof){b.reason='roof-exit';b.target=p.x>560?RIGHT-135*s:LEFT+135*s;b.jump=false;b.wait=0;}
  else if(b.wait<=0||!Number.isFinite(b.target)){
   b.wait=cfg.reaction;const samples=trajectory410(cfg.look);
   const nearRoof=roofZone413(ball),roofSide=ball.x>560?'right':'left';
   const danger=level>=2?samples.find(q=>q.x>=RIGHT-ball.r-4&&q.y>=POST+ball.r+5):null;
   b.threat=!!danger;
   const exitSample=samples.find(q=>q.x>LEFT+ball.r+12&&q.x<RIGHT-ball.r-12);
   // Recovery ends as soon as the ball drops into a playable corridor, not a sticky wait flag.
   const recovery=nearRoof&&(!exitSample||exitSample.t>.13);
   let chosen=null,jump=false,target=ball.x+38*s,reason='chase';
   if(recovery){
    b.roofSide=roofSide;reason='roof-recovery';target=roofSide==='right'?RIGHT-125*s:LEFT+125*s;
    chosen=exitSample||samples.at(-1);
   }else{
    const safeJump=p.x>LEFT+65*s&&p.x<RIGHT-65*s;
    for(const q of samples){
     if(roofZone413(q)||q.x<LEFT+ball.r+5||q.x>RIGHT-ball.r-5)continue;
     const base=p.onGround?p.y:Math.min(GROUND,p.y+(p.vy||0)*q.t+.5*g*q.t*q.t);
     const footAim=q.x+36*s,headAim=q.x-hp.x*s+sum*.64;
     const reach=speed*cfg.pace*Math.max(0,q.t-(level>=2?.025:.08))+14*s;
     const foot=q.y>=base-54*s&&q.y<=base+ball.r&&Math.abs(footAim-p.x)<reach;
     const standing=Math.abs(q.y-(base+hp.y*s))<sum*.79&&Math.abs(headAim-p.x)<reach;
     const jumping=(level<2||q.t<(level===3?.48:.58)&&q.vy>(level===3?-20:-60))&&p.support==null&&ball.y<p.y+hp.y*s+15*s&&p.onGround&&safeJump&&b.jumpLock<=0&&q.t>.10&&q.t<.78&&q.y<base+hp.y*s-14*s&&Math.abs(q.y-(p.y-jumpSpeed*q.t+.5*g*q.t*q.t+hp.y*s))<sum*.72&&Math.abs(headAim-p.x)<reach;
     if(foot||standing||jumping){chosen=q;target=foot?footAim:headAim;jump=!foot&&!standing&&jumping;reason=jump?'timed-header':foot?'intercept':'head-block';break;}
    }
    if(!chosen){chosen=samples.find(q=>q.y>=GROUND-75*s&&!roofZone413(q))||samples.at(-1);if(chosen)target=chosen.x+38*s;reason='landing-cover';}
    if(danger&&p.onGround&&safeJump&&b.jumpLock<=0){
     const block=samples.find(q=>q.t<danger.t&&q.t>.09&&q.t<.64&&!roofZone413(q)&&q.x>LEFT+70*s&&q.x<RIGHT-65*s&&Math.abs(q.x-hp.x*s+sum*.45-p.x)<speed*Math.max(0,q.t-.025)+12*s&&Math.abs(q.y-(p.y-jumpSpeed*q.t+.5*g*q.t*q.t+hp.y*s))<sum*.68);
     if(block&&(!chosen||chosen.t>=danger.t||reason==='landing-cover')){chosen=block;target=block.x-hp.x*s+sum*.45;jump=true;reason='save-header';}
    }
    // Elite presses a slow dribble rather than waiting for a distant bounce.
    if(level===3&&!danger&&ball.y>GROUND-90*s&&Math.abs(ball.vx)<165&&p.x>ball.x+95*s){target=ball.x+40*s;reason='press';jump=false;}
    // Retreat to the goal-side of incoming shots instead of chasing behind them.
    if(ball.vx>120&&ball.x>p.x+22*s&&ball.y>POST+24){target=Math.max(target,Math.min(maxX,ball.x+55*s));reason='goal-cover';}
    // Stop outside the dangerous post cap; jump only after moving into clear air.
    if(!safeJump)jump=false;
    if(level<2&&jump&&Math.random()>(level===0?.40:.78))jump=false;
   }
   if(level>=2&&!recovery){
    // Do not sprint under a high ball and expose the entire goal to a counter.
    const contested=p1.x>ball.x-145&&p1.x<ball.x+60;
    if(ball.y<p.y+hp.y*s-38*s&&!danger){
     target=clamp410(Math.max(level===3?705:665,ball.x+(level===3?120:105)*s),minX,maxX);jump=false;reason='counter-cover';
    }else if(contested&&ball.y>GROUND-85*s&&ball.vx>=-100){
     target=ball.x+(level===3?60:52)*s;jump=false;reason='standing-tackle';
    }
    // An airborne keeper cannot stop a ground shot; jump only for an actual
    // approaching upper-corner save or a short, descending guaranteed header.
    if(jump&&(!chosen||chosen.t>(level===3?.48:.58)||chosen.vy<(level===3?-20:-60)))jump=false;
   }
   b.error=(Math.random()-.5)*cfg.error;
   b.target=clamp410(target+b.error,minX,maxX);b.jump=jump;b.reason=reason;b.roofWait=recovery;
   b.sample=chosen?{x:chosen.x,y:chosen.y,t:chosen.t}:null;
   // Match the human skill rules. Elite reacts to threats, rather than spending a meter blindly.
   if(level>=2&&p.power>=100&&settings().skillEnabled){
    const skill=skillFor(p).id,near=Math.abs(ball.x-p.x)<180,close=Math.abs(p1.x-p.x)<260;
    const incoming=projectiles.some(q=>q.side!==1&&Math.abs(q.x-p.x)<260);
    const use=skill==='shield'?incoming||ball.hot>0&&near||!!danger:skill==='fire'?near&&ball.y>p.y-90:skill==='freeze'||skill==='inflate'?close&&p1.frozen<=0&&p1.heavy<=0:skill==='storm'?near||close:b.jump&&near;
    if(use&&(level===3||Math.random()<.35))activateSkill(p);
   }
  }
  const gap=b.target-p.x,dead=level===3?4:level===2?7:10;
  let dir=Math.abs(gap)<=dead?0:Math.sign(gap)*cfg.pace;
  // Brake before overshooting an intercept; reduced speed is a real input, not a position snap.
  if(!onRoof&&Math.abs(gap)<48&&Math.sign(p.vx)===Math.sign(gap))dir*=Math.max(.22,Math.abs(gap)/48);
  b.blocked=Math.abs(dir)>.2&&Math.abs(p.x-(b.prevX??p.x))<.12?(b.blocked||0)+dt:Math.max(0,(b.blocked||0)-dt*2);b.prevX=p.x;
  if(!onRoof&&b.blocked>(level===3?.30:.45)&&(p.x<LEFT+85*s||p.x>RIGHT-85*s)){
   b.target=p.x>560?RIGHT-140*s:LEFT+140*s;b.reason='post-retreat';b.jump=false;b.wait=0;dir=Math.sign(b.target-p.x)*cfg.pace;
  }
  const doJump=!onRoof&&p.onGround&&b.jumpLock<=0&&b.jump&&p.x>LEFT+65*s&&p.x<RIGHT-65*s;
  if(doJump){b.jumpLock=level===0?1.05:level===1?.78:level===2?.57:.40;b.jump=false;b.jumps=(b.jumps||0)+1;b.wait=0;}
  movePlayer(p,dir,doJump,dt);
  // Keep the head on the goal-side of contact even while retreating to the right.
  p.face=-1;
  if(!onRoof&&b.shotWait<=0&&p.cool<=0){
   const dx=ball.x-p.x,dy=ball.y-p.y,soonX=ball.x+ball.vx*.055-p.x;
   const contact=footContact44({...p,face:-1});
   const imminent=(dx>-78*s&&dx<24*s||soonX>-70*s&&soonX<12*s)&&dy>-60*s&&dy<ball.r+4;
   if(contact||imminent){
    p.face=-1;
    // The standard distance-aware drive is more accurate than repeatedly sky-lobbing into roofs.
    p.aiLob=level>=2&&p1.onGround&&p1.x<p.x-65&&p.x-p1.x<230&&Math.abs(p1.y-p.y)<35&&ball.x>300;
    shoot(p);b.shotWait=cfg.shoot;b.shots=(b.shots||0)+1;
   }
  }
 };
 // Softly sloped net roof: roll inward instead of settling indefinitely at a back corner.
 if(!avatarPreview45){
  const sim410=simulate;simulate=function(dt){sim410(dt);if(state!=='playing')return;
   for(const [a,b,dir] of [[28,LEFT,1],[RIGHT,1092,-1]])if(ball.x+ball.r>a&&ball.x-ball.r<b&&Math.abs(ball.y-(POST-ball.r))<3&&Math.abs(ball.vy)<85){ball.y=POST-ball.r-.04;ball.vy=-settings().gravity*dt;if(dir*ball.vx<145)ball.vx=dir*Math.min(145,dir*ball.vx+260*dt);ball.w46=ball.vx/ball.r;}
  };
 }
 const reset410=resetPositions;resetPositions=function(){reset410();for(const p of [p1,p2])p.nation=mode==='world'&&activeTeams?(p.side===0?activeTeams.left.id:activeTeams.right.id):playerNation(p.character).id;};
 // One visible user-gesture control for the supplied MP3, in lobby and player selection.
 const render410=renderPage;renderPage=function(...args){render410(...args);if(avatarPreview45)return;const actions=document.querySelector('.header-actions');if(!actions)return;const btn=document.createElement('button');btn.id='lobbyTrack410';btn.className='lobby-track410';btn.type='button';btn.title='Musik lobby · Superman Is Dead — Bulan & Ksatria';
  const paint=()=>{const a=window.lobbyAudioInfo49?.(),on=a?.unlocked&&!a?.muted&&a?.music&&!a?.paused;btn.textContent=on?'♫ Musik aktif':'▶ Putar lagu';btn.setAttribute('aria-pressed',String(!!on));btn.setAttribute('aria-label',on?'Jeda musik lobby':'Putar musik lobby');};paint();window.paintLobbyTrack410=()=>{if(btn.isConnected)paint();};let playIntent410=null;const captureIntent410=()=>{playIntent410=btn.getAttribute('aria-pressed')!=='true';};btn.onpointerdown=captureIntent410;btn.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')captureIntent410();};btn.onclick=()=>{const play=playIntent410??(btn.getAttribute('aria-pressed')!=='true');playIntent410=null;if(play)window.playLobby410?.();else window.pauseLobby410?.();paint();};actions.prepend(btn);const sound=$('#menuSound'),soundClick=sound?.onclick;if(sound)sound.onclick=e=>{soundClick?.(e);paint();};
 };
 const modes410=showModes;showModes=function(){modes410();const sel=$('#difficultyUI');if(sel){const change=sel.onchange;sel.onchange=e=>{change?.(e);saved.cpuDifficulty410=sel.value;save();};}};
 const worldPreview410=drawWorldPreview;drawWorldPreview=function(team){const el=$('#worldPreview');if(!el)return worldPreview410(team);const c=el.getContext('2d');c.clearRect(0,0,el.width,el.height);const id=team||world?.team||saved.nation;fitAvatarCanvas473(el,{x:0,y:0,vx:0,vy:0,side:0,character:selectedFace,face:1,preview:true,nation:id,onGround:true,kick:0},headImage,{padding:7});$('#worldPreviewName').textContent=faceName(selectedFace)+' · '+nation(id).name;};
}
