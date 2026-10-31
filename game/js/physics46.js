'use strict';
// Matchday 4.6: natural ball, anti-stuck rescue, net goals and light match FX.
// Loaded last. Every addition shares the existing 120 Hz loop and bounded pools.
if(!avatarPreview45){
 const S46={rings:[],puffs:[],flash:0,flashColor:'#ffffff',postShake:[0,0],quality:1,ema:16.7,slow:0,fast:0,lastDraw:0,roofBeep:0};
 const BALL_SCALE46=1.2;
 const fxOn46=()=>saved.effects!==false&&!reducedMotion.matches;
 const ballRadius46=()=>clamp43((Number(settings().ballRadius)||14)*BALL_SCALE46,12,26);
 const goalIndex46=x=>x<560?0:1;
 function ring46(x,y,color,max=46,life=.32,width=3,flat=1){
  if(!fxOn46()||S46.quality<1&&max<60)return;
  S46.rings.push({x,y,color,max,life,total:life,width,flat});if(S46.rings.length>12)S46.rings.shift();
 }
 function puff46(x,y,n,color,force=70,life=.35){
  if(!fxOn46())return;n=Math.round(n*(S46.quality?1:.5));
  for(let i=0;i<n;i++){const a=Math.PI+Math.random()*Math.PI,s=force*(.4+Math.random()*.6);S46.puffs.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.45,size:3+Math.random()*4,life,total:life,color})}
  if(S46.puffs.length>48)S46.puffs.splice(0,S46.puffs.length-48);
 }
 // Glow sprite is rendered once; drawing it is a single drawImage.
 const glow46=document.createElement('canvas');glow46.width=glow46.height=64;
 {const g=glow46.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.35,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}
 const tint46={};
 function glowSprite46(color){
  if(tint46[color])return tint46[color];
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.drawImage(glow46,0,0);g.globalCompositeOperation='source-in';g.fillStyle=color;g.fillRect(0,0,64,64);return tint46[color]=c;
 }

 // ---------- Ball size ----------
 const reset46=resetPositions;
 resetPositions=function(){reset46();ball.r=ballRadius46();ball.w46=0;ball.squash46=0;ball.pinch46=0;ball.pass46=0;ball.popCool46=0;ball.rest46=0;S46.rings.length=0;S46.puffs.length=0};
 ball.r=ballRadius46();

 // ---------- Collisions skip briefly while a squeezed ball escapes ----------
 const boot46=collideBoot,head46=collideHead;
 collideBoot=function(p){if(ball.pass46>simTime){p.bootCool=Math.max(0,(p.bootCool||0)-1/120);return}boot46(p)};
 collideHead=function(p){if(ball.pass46>simTime)return;head46(p)};

 // Shots add spin and a pressure ring on hard strikes.
 const drive46=drive44;
 drive44=function(p,hit,active){
  const ok=drive46(p,hit,active);
  if(ok){
   const speed=Math.hypot(ball.vx,ball.vy),lob=ball.vy<-500;
   ball.w46=(ball.vx/ball.r)*(lob?-.35:.55);
   if(active&&speed>780){ring46(hit.x,hit.y,p.fire>0?'#ffc070':'#e8fff6',38+speed*.02,.26,2.5);puff46(hit.x,GROUND-2,5,'#cfe5bf',90,.32)}
  }
  return ok;
 };

 // The post cap must not act as a wall for a ball sliding along the roof toward the pitch.
 const post46=postCollision;
 postCollision=function(x){const left=x===LEFT;if(ball.y<POST&&(left?ball.x<x:ball.x>x))return;post46(x)};

 // ---------- Roof beeps: once per real impact, never while the ball rests ----------
 const beep46=beep;
 beep=function(f=440,d=.1,type='sine',vol=.2){
  if(f===520&&d===.06){const now=performance.now();if(Math.abs(ball.vy)<70||now-S46.roofBeep<180)return;S46.roofBeep=now}
  beep46(f,d,type,vol);
 };
 const sfx46=sfx;
 sfx=function(name,volume=1){
  if(name==='post'&&state==='playing'){const i=goalIndex46(ball.x);S46.postShake[i]=Math.min(1,.55+Math.hypot(ball.vx,ball.vy)/1400);if(S46.quality)ring46(i?RIGHT:LEFT,POST,'#fff2c2',30,.22,2)}
  sfx46(name,volume);
 };

 // ---------- Natural ball behaviour ----------
 function natural46(dt,pre){
  const r=ball.r,g=settings().gravity,floor=GROUND-r,onGround=ball.y>=floor-.6;
  ball.w46=Number.isFinite(ball.w46)?ball.w46:0;
  // Ground impacts: softer at high speed, friction couples spin and travel.
  if(pre.vy>110&&pre.y<floor-.01&&onGround&&ball.vy<=0){
   const impact=pre.vy+g*dt,e=settings().bounce*(1.05-.17*Math.min(1,impact/1000));
   ball.vy=-impact*e;if(ball.vy>-62)ball.vy=0;
   const slip=ball.vx-ball.w46*r,k=Math.min(.5,impact/900);
   ball.vx-=slip*k*.3;ball.w46+=slip*k*.7/r;
   ball.squash46=Math.max(ball.squash46||0,Math.min(.24,impact/2600));ball.squashAxis46=Math.PI/2;
   if(impact>430){puff46(ball.x,GROUND-1,impact>800?7:4,'#d6eccb',60+impact*.06,.34);if(impact>760)ring46(ball.x,GROUND-1,'#e6fff0',r*2.6,.28,2,.22)}
  }
  // Wall impacts.
  if(Math.sign(pre.vx)!==Math.sign(ball.vx)&&Math.abs(pre.vx)>160&&(ball.x<=28+r+.5||ball.x>=1092-r-.5)){
   ball.squash46=Math.max(ball.squash46||0,Math.min(.2,Math.abs(pre.vx)/2800));ball.squashAxis46=0;ball.w46*=-.45;
  }
  if(onGround&&Math.abs(ball.vy)<1){
   // Rolling resistance: the ball slows and settles instead of gliding forever.
   const roll=Math.min(Math.abs(ball.vx),30*dt);ball.vx-=Math.sign(ball.vx)*roll;ball.vx*=Math.exp(-.32*dt);
   if(Math.abs(ball.vx)<4)ball.vx=0;
   ball.w46+=(ball.vx/r-ball.w46)*Math.min(1,dt*14);
  }else ball.w46*=Math.exp(-.22*dt);
  // Replace the engine's rolling-only rotation with the tracked spin.
  ball.spin+=(ball.w46-ball.vx/r)*dt;
  ball.squash46=Math.max(0,(ball.squash46||0)-dt*1.6);
 }

 // ---------- Goal roofs act like net: soft bounce, then a slow slide off ----------
 function roof46(dt,pre){
  const r=ball.r,top=POST-r;
  for(const [a,b,dir,i] of [[28,LEFT,1,0],[RIGHT,1092,-1,1]]){
   if(!(ball.x+r>a&&ball.x-r<b))continue;
   if(Math.abs(ball.y-top)>1.6)continue;
   if(pre.vy>0&&ball.vy<0){
    const impact=pre.vy+settings().gravity*dt;ball.vy=impact<150?0:-impact*.38;ball.vx*=.82;ball.w46*=.6;
    netWaves[i]=Math.max(netWaves[i],Math.min(.55,impact/1000));
    if(impact>260)puff46(ball.x,POST,3,'#e9f6f2',50,.28);
   }
   if(Math.abs(ball.vy)<75){
    // Resting on the roof: hold the ball on the net surface and let it slide toward the pitch.
    ball.y=top;ball.vy=-settings().gravity*dt;
    if(dir*ball.vx<150)ball.vx=dir*Math.min(150,dir*ball.vx+260*dt);
    ball.w46=ball.vx/r;
   }
  }
 }

 // Physical random choices are replayable online and separate from visual FX randomness.
 function ballRandom445(){
  if(!window.HAOnline422?.active())return Math.random();
  const seed=Number.isInteger(ball.rng445)?ball.rng445>>>0:0;
  ball.rng445=(Math.imul(seed,1664525)+1013904223)>>>0;return ball.rng445/4294967296;
 }

 // ---------- Ball squeezed between bodies or a body and a wall ----------
 function bodyNear46(p){const s=p.size||1;return Math.abs(ball.x-p.x)<38*s+ball.r+6&&ball.y>p.y-112*s-ball.r&&ball.y<p.y+6}
 function pinch46(dt){
  if(ball.pass46>simTime)return;
  const a=bodyNear46(p1),b=bodyNear46(p2),r=ball.r;
  let pinched=false,push=0;
  if(a&&b&&((ball.x-p1.x)*(ball.x-p2.x)<=0||Math.abs(p1.x-p2.x)<(37*((p1.size||1)+(p2.size||1))+r*1.2)))pinched=true;
  for(const p of [p1,p2])if(bodyNear46(p)){
   if(ball.x-r<=28+5&&p.x>ball.x){pinched=true;push=1}
   if(ball.x+r>=1092-5&&p.x<ball.x){pinched=true;push=-1}
  }
  // A ball sitting dead-centre on a head would balance forever; nudge it off naturally.
  for(const p of [p1,p2]){
   const s=p.size||1,hp=window.headPose47?headPose47(p):{x:0,y:window.G47?.headY??-79},hx=ball.x-(p.x+hp.x*s),hy=ball.y-(p.y+hp.y*s);
   if(hy<0&&Math.abs(hx)<4&&Math.hypot(hx,hy)<(window.G47?.headR??32)*s+r+3&&Math.abs(ball.vx-p.vx)<25&&Math.abs(ball.vy)<120){ball.rest46=(ball.rest46||0)+dt;if(ball.rest46>.35){ball.vx+=(hx>=0?1:-1)*(55+ballRandom445()*30);ball.rest46=0}}
  }
  const slow=Math.hypot(ball.vx,ball.vy)<520;
  ball.pinch46=pinched&&slow?(ball.pinch46||0)+dt:Math.max(0,(ball.pinch46||0)-dt*3);
  if(ball.pinch46<.16||ball.popCool46>simTime)return;
  ball.y=Math.min(ball.y,GROUND-r-2);
  ball.vy=-(610+ballRandom445()*90);
  ball.vx=push?push*(150+ballRandom445()*60):(ballRandom445()-.5)*170+ball.vx*.15;
  ball.w46=ball.vx/r;ball.pinch46=0;ball.pass46=simTime+.3;ball.popCool46=simTime+.55;ball.stuckTime=0;ball.strikeGuard43=null;
  ball.squash46=.2;ball.squashAxis46=0;
  ring46(ball.x,ball.y,'#f3fff9',42,.3,2.5);puff46(ball.x,ball.y+r,6,'#dcefd9',90,.3);
  sfx46('bounce',.55);
 }

 const sim46=simulate;
 simulate=function(dt){
  if(state==='playing'||state==='countdown')ball.r=ballRadius46();
  const playing=state==='playing',pre=playing?{x:ball.x,y:ball.y,vx:ball.vx,vy:ball.vy}:null;
  sim46(dt);
  if(playing&&state==='playing'){natural46(dt,pre);roof46(dt,pre);pinch46(dt)}
  else if(state==='goal'){ball.w46=(ball.w46||0)*Math.exp(-2*dt)}
  for(let i=S46.rings.length-1;i>=0;i--)if((S46.rings[i].life-=dt)<=0)S46.rings.splice(i,1);
  for(let i=S46.puffs.length-1;i>=0;i--){const f=S46.puffs[i];if((f.life-=dt)<=0){S46.puffs.splice(i,1);continue}f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.exp(-4*dt);f.vy-=20*dt}
  S46.flash=Math.max(0,S46.flash-dt);
  for(let i=0;i<2;i++)S46.postShake[i]=Math.max(0,S46.postShake[i]-dt*3.2);
 };

 // ---------- Goal moments ----------
 const score46=scoreGoal;
 scoreGoal=function(side){
  score46(side);
  if(!fxOn46())return;
  const x=side===0?RIGHT:LEFT,color=side===0?'#c3ff53':'#ff9aa8';
  S46.flash=.24;S46.flashColor=color;
  ring46(x,(POST+GROUND)/2,color,150,.55,5,.85);ring46(x,(POST+GROUND)/2,'#ffffff',95,.4,3,.85);
  S46.postShake[side===0?1:0]=.7;
 };

 // ---------- Ball renderer ----------
 drawBall=function(){
  const r=ball.r,fx=fxOn46(),h=Math.max(0,GROUND-(ball.y+r)),k=clamp43(1-h/300,.22,1);
  ctx.save();
  ctx.globalAlpha=.45*k;ctx.fillStyle='#03101b';ctx.beginPath();ctx.ellipse(ball.x,GROUND+1,r*(.55+.75*k),1.5+3*k,0,0,7);ctx.fill();ctx.globalAlpha=1;
  if(fx){
   for(const f of S46.puffs){ctx.globalAlpha=f.life/f.total*.45;ctx.fillStyle=f.color;ctx.beginPath();ctx.ellipse(f.x,f.y,f.size*1.6,f.size,0,0,7);ctx.fill()}
   for(const q of S46.rings){const t=1-q.life/q.total,rad=q.max*(.25+.75*Math.sqrt(t));ctx.globalAlpha=(1-t)*.85;ctx.strokeStyle=q.color;ctx.lineWidth=q.width*(1-t*.6);ctx.beginPath();ctx.ellipse(q.x,q.y,rad,rad*q.flat,0,0,7);ctx.stroke()}
   ctx.globalAlpha=1;
   const speed=Math.hypot(ball.vx,ball.vy);
   if(S46.quality&&trail.length>2&&(speed>430||ball.hot>0)){
    const hot=ball.hot>0;ctx.lineCap='round';
    for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i],t=i/trail.length;ctx.globalAlpha=t*(hot?.5:.22);ctx.strokeStyle=hot?(i%2?'#ffcf6a':'#ff6a3d'):'#dffbf4';ctx.lineWidth=r*(hot?1.5:1.1)*t;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
    ctx.globalAlpha=1;
   }
   if(ball.hot>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55+Math.sin(simTime*30)*.1;const s=r*4.2;ctx.drawImage(glowSprite46('#ff8a3c'),ball.x-s/2,ball.y-s/2,s,s);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
  }
  // Squash on impact, slight stretch at speed.
  ctx.translate(ball.x,ball.y);
  const sq=ball.squash46||0,speed=Math.hypot(ball.vx,ball.vy),st=fx&&!sq?Math.min(.07,Math.max(0,speed-500)/9000):0;
  if(sq>.005){const ax=ball.squashAxis46||0;if(ax){ctx.translate(0,r*sq*.8)}ctx.rotate(ax);ctx.scale(1-sq,1+sq*.75);ctx.rotate(-ax)}
  else if(st>.005){const ax=Math.atan2(ball.vy,ball.vx);ctx.rotate(ax);ctx.scale(1+st,1-st*.6);ctx.rotate(-ax)}
  ctx.save();ctx.rotate(ball.spin);
  const cupBall=mode==='world'&&activeTeams,palette=cupBall?['#fff7de','#c5ad7a','#153e4c']:BALL_PALETTES[saved.ball]||BALL_PALETTES.classicball;
  ctx.fillStyle=palette[0];ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.save();ctx.clip();
  ctx.fillStyle=palette[2];ctx.strokeStyle=cupBall?'#d8aa50':palette[2];ctx.lineWidth=1.1;
  if(cupBall){for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.beginPath();ctx.moveTo(-3,-r);ctx.bezierCurveTo(-r,0,-3,r*.7,7,r);ctx.lineTo(11,r);ctx.bezierCurveTo(0,r*.25,-6,-3,1,-r);ctx.fill();ctx.stroke();ctx.restore()}}
  else if(window.drawBallSkin48){drawBallSkin48(ctx,saved.ball,r)}
  else{ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;ctx.lineTo(Math.cos(a)*r*.42,Math.sin(a)*r*.42)}ctx.closePath();ctx.fill();for(let i=0;i<5;i++){ctx.save();ctx.rotate(i*Math.PI*2/5);ctx.beginPath();ctx.moveTo(0,-r*.4);ctx.lineTo(0,-r);ctx.stroke();ctx.beginPath();ctx.arc(0,-r,r*.27,0,7);ctx.fill();ctx.restore()}}
  ctx.restore();ctx.restore();
  // Fixed lighting (does not rotate with the ball): shade, rim and highlight.
  const g=ctx.createRadialGradient(-r*.38,-r*.42,r*.1,0,0,r);g.addColorStop(0,'rgba(255,255,255,.28)');g.addColorStop(.55,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(10,30,50,.42)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
  ctx.strokeStyle='rgba(8,24,40,.35)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(-r*.38,-r*.45,r*.26,r*.15,-.6,0,7);ctx.fill();
  ctx.restore();
  // Contact flash from the 4.3/4.4 shot code.
  if(fx&&impact43){const age=simTime-impact43.t;if(age>=0&&age<.16){ctx.save();ctx.globalAlpha=1-age/.16;ctx.strokeStyle=impact43.color;ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*1.047+.3,rr=r*.6+age*110;ctx.beginPath();ctx.moveTo(impact43.x+Math.cos(a)*rr,impact43.y+Math.sin(a)*rr);ctx.lineTo(impact43.x+Math.cos(a)*(rr+9),impact43.y+Math.sin(a)*(rr+9));ctx.stroke()}ctx.restore()}}
 };

 // ---------- Goals: cached frame + net layers ----------
 const GOAL46={};
 function goalGeom46(left){return{left,front:left?LEFT:RIGHT,back:left?28:1092,dir:left?-1:1,ox:left?0:980,oy:POST-26,w:140,h:GROUND-POST+44}}
 function layer46(gm){const c=document.createElement('canvas');c.width=gm.w;c.height=gm.h;const g=c.getContext('2d');g.translate(-gm.ox,-gm.oy);return[c,g]}
 function boxPath46(g,gm,dx=0,dy=0){g.beginPath();g.moveTo(gm.front+dx,POST+dy);g.lineTo(gm.back+dx,POST+dy);g.lineTo(gm.back+dx,GROUND);g.lineTo(gm.front+dx,GROUND);g.closePath()}
 function mesh46(g,gm,dx,dy,color,width){
  g.save();boxPath46(g,gm,dx,dy);g.clip();g.strokeStyle=color;g.lineWidth=width;g.beginPath();
  const x0=Math.min(gm.front,gm.back)-140,x1=Math.max(gm.front,gm.back)+10;
  for(let x=x0;x<x1;x+=11){g.moveTo(x,POST-4);g.lineTo(x+150,POST+146);g.moveTo(x+150,POST-4);g.lineTo(x,POST+146)}
  g.stroke();
  // Sag: the netting droops a little below the roof and bellies near the back.
  g.strokeStyle=color;g.lineWidth=width*1.4;g.beginPath();g.moveTo(gm.front,POST+3+dy);g.quadraticCurveTo((gm.front+gm.back)/2+dx,POST+15+dy,gm.back+dx,POST+4+dy);g.stroke();
  g.restore();
 }
 function metal46(g,x0,x1){const m=g.createLinearGradient(x0,0,x1,0);m.addColorStop(0,'#8ea5b0');m.addColorStop(.3,'#ffffff');m.addColorStop(.6,'#e9f2f5');m.addColorStop(1,'#6f8994');return m}
 function makeGoal46(left){
  const gm=goalGeom46(left),depth={x:gm.dir*10,y:-10};
  // Base: shadow, interior shade and the far-side frame.
  const [base,b]=layer46(gm);
  b.fillStyle='rgba(2,14,22,.35)';b.beginPath();b.ellipse((gm.front+gm.back)/2,GROUND+3,62,8,0,0,7);b.fill();
  const shade=b.createLinearGradient(0,POST,0,GROUND);shade.addColorStop(0,'rgba(4,16,28,.42)');shade.addColorStop(1,'rgba(4,16,28,.68)');
  b.fillStyle=shade;boxPath46(b,gm);b.fill();
  const side=b.createLinearGradient(gm.front,0,gm.back,0);side.addColorStop(0,'rgba(255,255,255,0)');side.addColorStop(1,'rgba(0,10,20,.25)');b.fillStyle=side;boxPath46(b,gm);b.fill();
  // No offset far post or second mesh: these read as a ghost/old goal.
  // Roof panel seen slightly from above: gives the box goal real depth.
  b.save();b.beginPath();b.moveTo(gm.front,POST);b.lineTo(gm.back,POST);b.lineTo(gm.back+depth.x*.4,POST+depth.y);b.lineTo(gm.front+depth.x,POST+depth.y);b.closePath();
  b.fillStyle='rgba(225,240,245,.10)';b.fill();b.clip();b.strokeStyle='rgba(235,248,250,.45)';b.lineWidth=.7;b.beginPath();
  for(let x=Math.min(gm.front,gm.back)-20;x<Math.max(gm.front,gm.back)+20;x+=8){b.moveTo(x,POST+2);b.lineTo(x+gm.dir*-8,POST+depth.y-2);b.moveTo(x,POST+2);b.lineTo(x+gm.dir*8,POST+depth.y-2)}b.stroke();b.restore();
  // Net: the part that bulges when struck.
  const [net,n]=layer46(gm);
  mesh46(n,gm,0,0,'rgba(240,250,252,.52)',.85);
  n.strokeStyle='rgba(255,255,255,.35)';n.lineWidth=1;n.beginPath();for(let y=POST+20;y<GROUND;y+=23){n.moveTo(gm.back,y);n.lineTo(gm.back-gm.dir*3,y+11)}n.stroke();
  // Front: one solid near-side frame drawn over the ball.
  const [front,f]=layer46(gm);
  // The single net is behind the players; only the solid frame is foreground.
  f.lineCap='round';f.lineJoin='round';
  f.strokeStyle='rgba(3,18,30,.4)';f.lineWidth=9;f.beginPath();f.moveTo(gm.back,GROUND);f.lineTo(gm.back,POST+2);f.lineTo(gm.front,POST+2);f.stroke();
  f.strokeStyle='#c9d7dd';f.lineWidth=4;f.beginPath();f.moveTo(gm.back,GROUND);f.lineTo(gm.back,POST);f.stroke();
  f.strokeStyle='#b5c7cf';f.lineWidth=2;f.beginPath();f.moveTo(gm.back,GROUND-1);f.lineTo(gm.front,GROUND-1);f.stroke();
  f.strokeStyle='#eef6f8';f.lineWidth=5;f.beginPath();f.moveTo(gm.front,POST);f.lineTo(gm.back,POST);f.stroke();
  f.strokeStyle='rgba(255,255,255,.9)';f.lineWidth=1.2;f.beginPath();f.moveTo(gm.front,POST-1.6);f.lineTo(gm.back,POST-1.6);f.stroke();
  f.fillStyle='#ffffff';for(let x=Math.min(gm.front,gm.back)+8;x<Math.max(gm.front,gm.back)-4;x+=12){f.beginPath();f.arc(x,POST+3.5,1.1,0,7);f.fill()}
  // Main post: shadow, metallic body, stripes and base plate.
  f.strokeStyle='rgba(3,16,26,.45)';f.lineWidth=12;f.beginPath();f.moveTo(gm.front-gm.dir*2,GROUND);f.lineTo(gm.front-gm.dir*2,POST+2);f.stroke();
  f.strokeStyle=metal46(f,gm.front-4.5,gm.front+4.5);f.lineWidth=9;f.beginPath();f.moveTo(gm.front,GROUND-1);f.lineTo(gm.front,POST);f.stroke();
  f.fillStyle='rgba(20,40,60,.22)';for(let y=POST+18;y<GROUND-8;y+=28)f.fillRect(gm.front-4.5,y,9,2);
  f.fillStyle='rgba(255,255,255,.95)';f.fillRect(gm.front-2.6,POST+4,1.3,GROUND-POST-10);
  f.fillStyle='#f6fbfd';f.beginPath();f.arc(gm.front,POST,5.4,0,7);f.fill();f.fillStyle='#9fb3bc';f.beginPath();f.arc(gm.front+1.5,POST+1.5,2.4,0,7);f.fill();
  // Accent LED strip along the goal line and a little glow under the frame.
  const led=f.createLinearGradient(gm.front,0,gm.back,0);led.addColorStop(0,'rgba(120,255,214,.95)');led.addColorStop(1,'rgba(120,255,214,.15)');
  f.strokeStyle='rgba(120,255,214,.18)';f.lineWidth=6;f.beginPath();f.moveTo(gm.front,GROUND+2);f.lineTo(gm.back,GROUND+2);f.stroke();
  f.strokeStyle=led;f.lineWidth=1.6;f.beginPath();f.moveTo(gm.front,GROUND+2);f.lineTo(gm.back,GROUND+2);f.stroke();
  f.fillStyle='#d9e5e9';f.fillRect(gm.front-8,GROUND-3,16,5);f.fillStyle='#55707b';f.fillRect(gm.front-7,GROUND+1,14,1.5);
  return{gm,base,net,front};
 }
 drawGoal=function(left,front=false){
  const key=left?'L':'R',goal=GOAL46[key]??=makeGoal46(left),gm=goal.gm,i=left?0:1;
  if(!front){
   ctx.drawImage(goal.base,gm.ox,gm.oy);
   const wave=fxOn46()?netWaves[i]:0;
   if(wave>.02){
    const b=wave*(.05+.035*Math.sin(simTime*26));
    ctx.save();boxPath46(ctx,gm);ctx.clip();ctx.translate(gm.front,0);ctx.scale(1+b,1);ctx.translate(-gm.front,0);ctx.drawImage(goal.net,gm.ox,gm.oy);ctx.restore();
   }else ctx.drawImage(goal.net,gm.ox,gm.oy);
   return;
  }
  const shake=fxOn46()?S46.postShake[i]:0,off=shake>.01?Math.sin(simTime*70)*shake*1.6:0;
  ctx.drawImage(goal.front,gm.ox+off,gm.oy);
  const glow=fxOn46()?Math.max(netWaves[i]*.9,shake*.5):0;
  if(glow>.04&&S46.quality){
   const s=60;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(.5,glow*.55);
   for(let y=POST;y<=GROUND;y+=34)ctx.drawImage(glowSprite46(i===lastScorerSide46()?'#ffd07a':'#bff3ff'),gm.front-s/2+off,y-s/2,s,s);
   ctx.restore();
  }
 };
 function lastScorerSide46(){return typeof lastScorer==='number'?(lastScorer===0?1:0):-1}

 // ---------- Screen overlay + adaptive quality ----------
 const draw46=draw;
 draw=function(){
  const now=performance.now();
  if(S46.lastDraw){const ms=Math.min(100,now-S46.lastDraw);S46.ema+=(ms-S46.ema)*.05;
   if(S46.ema>23){S46.slow+=ms;S46.fast=0;if(S46.slow>1800){S46.quality=0;S46.slow=0}}
   else if(S46.ema<18.5){S46.fast+=ms;S46.slow=0;if(S46.fast>4000){S46.quality=1;S46.fast=0}}}
  S46.lastDraw=now;
  draw46();
  if(S46.flash>0&&fxOn46()){ctx.save();ctx.globalAlpha=S46.flash/.24*.22;ctx.fillStyle=S46.flashColor;ctx.fillRect(0,0,worldViewWidth428(),worldViewHeight428());ctx.restore()}
 };
 document.addEventListener('visibilitychange',()=>{S46.lastDraw=0});
 window.HA46={state:S46,ballRadius:ballRadius46,ring:ring46,puff:puff46};
}
