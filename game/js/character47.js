'use strict';
// Matchday 4.7.3: editable face offsets and full-image portrait fitting.
{
 const G47={headY:-69,headR:38,headK:1.16,pivotX:-10,pivotY:-29,socketX:-18,socketY:-9};
 window.G47=G47;
 // Jerseys belong to menu portraits only. Live head/contact share the compact socket.
 const jersey411=p=>p.preview===true;
 const socketY411=p=>jersey411(p)?-89:G47.socketY;
 const socketX412=p=>jersey411(p)?0:G47.socketX;
 const headK412=p=>jersey411(p)?1:G47.headK;
 window.avatarHeadScale412=headK412;
 window.avatarJersey411=jersey411;
 const fx47=()=>saved.effects!==false&&!reducedMotion.matches;
 const anim47=new Map();
 function procHead47(c,p,d,bodySkin){
    c.fillStyle = "#0e1b2f";
    c.beginPath();
    c.ellipse(0, 1, 32, 33, 0, 0, 7);
    c.fill();
    c.fillStyle = bodySkin;
    c.beginPath();
    c.ellipse(0, 0, 30, 31, 0, 0, 7);
    c.fill();
    c.beginPath();
    c.ellipse(-28, 3, 6, 9, 0, 0, 7);
    c.ellipse(28, 3, 6, 9, 0, 0, 7);
    c.fill();
    c.fillStyle = "#ffffff15";
    c.beginPath();
    c.ellipse(-11, -4, 12, 20, -0.3, 0, 7);
    c.fill();
    c.fillStyle = d.hair;
    if (d.style === 0) {
      c.beginPath();
      c.moveTo(-29, -4);
      c.lineTo(-28, -24);
      c.lineTo(-12, -34);
      c.lineTo(7, -38);
      c.lineTo(29, -22);
      c.lineTo(29, -7);
      c.lineTo(18, -16);
      c.lineTo(10, -24);
      c.lineTo(-18, -19);
      c.lineTo(-23, -2);
      c.fill();
    }
    if (d.style === 1) {
      c.beginPath();
      c.moveTo(-28, -13);
      for (let i = 0; i < 7; i++) c.lineTo(-28 + i * 9, -30 - (i % 2) * 10);
      c.lineTo(30, -8);
      c.lineTo(16, -19);
      c.lineTo(-22, -16);
      c.fill();
    }
    if (d.style === 2) {
      c.beginPath();
      c.arc(0, -10, 29, Math.PI, Math.PI * 2);
      c.lineTo(25, -6);
      c.quadraticCurveTo(6, -5, -15, -22);
      c.lineTo(-26, -1);
      c.fill();
    }
    if (d.style === 3) {
      c.beginPath();
      c.moveTo(-26, -10);
      c.lineTo(-23, -27);
      c.lineTo(22, -27);
      c.lineTo(28, -9);
      c.lineTo(23, -19);
      c.lineTo(-20, -19);
      c.fill();
      c.fillStyle = "#f4dd8d";
      c.fillRect(-29, -18, 58, 5);
    }
    if (d.style === 4) {
      c.beginPath();
      c.arc(0, -7, 31, Math.PI, Math.PI * 2);
      c.lineTo(31, 16);
      c.lineTo(23, 22);
      c.lineTo(21, -14);
      c.quadraticCurveTo(0, -4, -17, -22);
      c.lineTo(-23, 22);
      c.lineTo(-32, 14);
      c.fill();
      c.beginPath();
      c.arc(27, -22, 10, 0, 7);
      c.fill();
    }
    if (d.style === 5) {
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        c.arc(-23 + (i % 5) * 12, -20 - Math.floor(i / 5) * 10, 9, 0, 7);
        c.fill();
      }
    }
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(-11, -1, 7.5, 8, 0, 0, 7);
    c.ellipse(12, -1, 7.5, 8, 0, 0, 7);
    c.fill();
    c.fillStyle = "#1b2b40";
    c.beginPath();
    c.arc(-10 + p.face * 1.7, -1, 3.7, 0, 7);
    c.arc(12 + p.face * 1.7, -1, 3.7, 0, 7);
    c.fill();
    c.strokeStyle = d.hair;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-19, -13);
    c.lineTo(-5, -10);
    c.moveTo(5, -10);
    c.lineTo(19, -13);
    c.stroke();
    c.strokeStyle = "#754d3b";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(1, 2);
    c.lineTo(-1, 9);
    c.lineTo(4, 9);
    c.stroke();
    c.beginPath();
    c.arc(1, 11, 10, 0.2, 2.8);
    c.stroke();
    if ([5, 11, 16].includes(p.character)) {
      c.fillStyle = d.hair;
      c.globalAlpha = 0.6;
      c.beginPath();
      c.arc(0, 12, 24, 0.15, 3);
      c.lineTo(-19, 14);
      c.quadraticCurveTo(0, 27, 20, 12);
      c.fill();
      c.globalAlpha = 1;
    }
 }
 function kitColor47(p){return (kitColors[nationalId410(p)]||['#e5f0f8'])[0]}
 function nationalId410(p){return p.nation||playerNation(p.character??(p.side===0?selectedFace:rivalIndex)).id}
 window.nationalId410=nationalId410;
 // One clean menu outfit: the national-kit renderer already draws sleeves and collar.
 function nationalBody410(c,p,d,skin){
  if(!jersey411(p))return;
  const id=nationalId410(p),pair=kitColors[id]||[nation(id).color,'#fff'];
  c.save();socketTransform47(c,p);c.translate(socketX412(p),socketY411(p));c.scale(p.face<0?-1:1,1);
  // Neck, arms and legs are behind ONE shirt, not a second sleeve/body layer.
  c.fillStyle=skin;c.beginPath();c.roundRect(-5,0,10,15,4);c.fill();
  for(const side of [-1,1]){
   c.fillStyle=skin;c.beginPath();c.roundRect(side*23-4,19,8,18,4);c.fill();
   c.fillStyle=skin;c.beginPath();c.roundRect(side*11-5,49,10,17,3);c.fill();
   c.fillStyle='#f0f4f8';c.beginPath();c.roundRect(side*11-5,60,10,19,2);c.fill();
   c.fillStyle=pair[0];c.fillRect(side*11-5,62,10,2);
  }
  c.fillStyle=['ID','DE'].includes(id)?'#edf3f6':['BR','FR','AR','GB','US','JP'].includes(id)?'#193759':'#162a3b';
  c.beginPath();c.moveTo(-18,36);c.lineTo(18,36);c.lineTo(19,53);c.lineTo(4,53);c.lineTo(0,44);c.lineTo(-4,53);c.lineTo(-19,53);c.closePath();c.fill();
  c.fillStyle=pair[1];c.fillRect(-18,39,2,10);c.fillRect(16,39,2,10);
  c.save();c.translate(0,54);drawNationalKit(c,id);c.restore();
  c.fillStyle=['DE','GB','US','HR','IR','CA','CH'].includes(id)?'#172a43':'#fff';
  c.textAlign='center';c.font='bold 6px Arial';c.fillText(id,0,25);c.font='bold 8px Arial';c.fillText(String((p.character??0)%18+1),0,34);
  c.restore();
 }
 function menuShoes412(c,p){
  const f=bootFrame(bootFor(p));c.save();
  for(const side of [-1,1]){c.save();c.translate(side*12,-9);c.scale(side,1);
   if(f.a){c.drawImage(f.a,-11,-6,32,15.5);if(f.b){c.globalAlpha=f.mix;c.drawImage(f.b,-11,-6,32,15.5);}}
   else{c.fillStyle='#eaf1f7';c.beginPath();c.roundRect(-10,-5,30,12,4);c.fill();}
   c.restore();
  }c.restore();
 }
 window.nationalBody410=nationalBody410;
 function kickPhase47(p){return p.kick>0?Math.sin(clamp43((.26-p.kick)/.26,0,1)*Math.PI):0}
 function walk47(p){return p.onGround?Math.min(1,Math.abs(p.vx||0)/300):0}
 // One shared pose: drawing and contact use the same numbers.
 function shoePose47(p){
  if(jersey411(p))return{a:0,x:0,y:0,flip:p.face<0?-1:1,phase:0};
  const w=walk47(p),t=simTime*(12+3*w)+(p.side||0)*1.7,phase=kickPhase47(p);
  const animated=!!window.HAOnline422?.active()||fx47(),stride=animated?Math.sin(t):0;
  const air=animated&&!p.onGround?clamp43((p.vy||0)/2300,-.09,.09):0;
  const rock=stride*.105*w+air,lift=Math.max(0,stride)*5*w+phase*6;
  return{a:-(phase*.72)+rock,x:G47.pivotX*(p.face<0?-1:1),y:G47.pivotY-lift,flip:p.face<0?-1:1,phase};
 }
 window.shoePose47=shoePose47;
 // All layers use one local shoe transform; the head cannot drift on a turn.
 function socketTransform47(c,p){
  const z=shoePose47(p);c.translate(z.x,z.y);c.scale(z.flip,1);c.rotate(z.a);return z;
 }
 // The chin is fixed to the opening, not to the middle/toe of the shoe.
 function headPose47(p){
  const z=shoePose47(p),co=Math.cos(z.a),si=Math.sin(z.a);
  const ax=z.x+(socketX412(p)*co-socketY411(p)*si)*z.flip;
  const ay=z.y+socketX412(p)*si+socketY411(p)*co;
  const tilt=Math.atan2(z.flip*si,co);
  const rise=31*headK412(p)-5;
  const d=ROSTER[p.character??(p.side===0?selectedFace:rivalIndex)],cfg=d?.image?headDefaults(d):{x:0,y:0};
  const ox=cfg.x*headK412(p),oy=cfg.y*headK412(p)-rise,ct=Math.cos(tilt),st=Math.sin(tilt);
  return{x:ax+ct*ox-st*oy,y:ay+st*ox+ct*oy,ax,ay,tilt};
 }
 window.headPose47=headPose47;
 // Measure the actual head, including its full image, tilt and manual offsets.
 // Menu canvases must fit these bounds rather than assuming an old 100px body.
 function avatarBounds473(p,photo,override=null){
  const d=override||ROSTER[p.character??selectedFace]||ROSTER[0],cfg=headDefaults(d),z=shoePose47(p),co=Math.cos(z.a),si=Math.sin(z.a),points=[];
  const shoePoint=(x,y)=>({x:z.x+(x*co-y*si)*z.flip,y:z.y+x*si+y*co});
  if(jersey411(p)){for(const x of [-34,34])for(const y of [-17,3])points.push({x,y});}
  else for(const x of [-42,72])for(const y of [-26,31])points.push(shoePoint(x,y));
  let corners;
  if(photo){const f=headSurface(photo,d),k=Math.min(68/f.height,70/f.width)*cfg.scale,t=cfg.tilt*Math.PI/180,ct=Math.cos(t),st=Math.sin(t);
   corners=[];for(const x of [-f.chin*k,(f.width-f.chin)*k])for(const y of [-f.height*k,0])corners.push({x:cfg.x+x*ct-y*st,y:31+cfg.y+x*st+y*ct});
  }else{corners=[];for(const x of [-38,38])for(const y of [-44,34])corners.push({x,y});}
  if(window.headAccessoryPoints48)corners.push(...headAccessoryPoints48(p,photo,d));
  for(const pt of corners){const x=socketX412(p)+pt.x*headK412(p)*z.flip,y=socketY411(p)+5-31*headK412(p)+pt.y*headK412(p);points.push(shoePoint(x,y));}
  if(jersey411(p))for(const x of [-32,32])for(const y of [0,90])points.push(shoePoint(socketX412(p)+x*z.flip,socketY411(p)+y));
  const size=p.size||1;
  return{minX:Math.min(...points.map(q=>q.x))*size-3,maxX:Math.max(...points.map(q=>q.x))*size+3,minY:Math.min(...points.map(q=>q.y))*size-3,maxY:Math.max(...points.map(q=>q.y))*size+3};
 }
 window.avatarBounds473=avatarBounds473;
 function fitAvatarCanvas473(el,p,photo,options={}){
  const c=el.getContext('2d'),b=options.bounds||avatarBounds473(p,photo),pad=options.padding??14;
  const sc=Math.min((el.width-2*pad)/(b.maxX-b.minX),(el.height-2*pad)/(b.maxY-b.minY),options.maxScale??Infinity);
  const v=options.view||{scale:sc,x:el.width/2-(b.minX+b.maxX)*sc/2,y:el.height/2-(b.minY+b.maxY)*sc/2};
  c.save();c.translate(v.x,v.y);c.scale(v.scale,v.scale);drawPlayer(c,{...p,x:0,y:0},photo,true);c.restore();return v;
 }
 window.fitAvatarCanvas473=fitAvatarCanvas473;

 function socketLayer47(c,p,front=false){
  const z=shoePose47(p),f=bootFrame(bootFor(p));
  c.save();socketTransform47(c,p);
  if(!front){
   c.fillStyle='#081526';c.beginPath();c.ellipse(socketX412(p),socketY411(p),21,6,0,0,Math.PI*2);c.fill();
  }else{
   // Repaint only the front lip: the lower chin is tucked inside the shoe.
   c.beginPath();c.moveTo(-40,-8);c.quadraticCurveTo(-22,1,-5,-8);c.lineTo(8,-18);c.lineTo(72,36);c.lineTo(-44,36);c.closePath();c.clip();
   if(f.a){c.drawImage(f.a,-40,-24,110,53);if(f.b){c.globalAlpha=f.mix;c.drawImage(f.b,-40,-24,110,53);c.globalAlpha=1}}
   else{c.fillStyle='#f6f9fc';c.beginPath();c.ellipse(-18,-4,23,7,0,0,Math.PI);c.fill()}
  }
  c.restore();
 }

 function drawShoe47(c,p,mini){
  const pose=shoePose47(p),frame=bootFrame(bootFor(p)),kit=kitColor47(p);
  c.save();socketTransform47(c,p);
  // Sock cuff in team colour: identifies the side without needing a body.
  if(frame.a){c.drawImage(frame.a,-40,-24,110,53);if(frame.b){c.globalAlpha=frame.mix;c.drawImage(frame.b,-40,-24,110,53);c.globalAlpha=1}}
  else{const k=kitColor47(p);c.fillStyle='#f6f9fc';c.beginPath();c.moveTo(-30,20);c.lineTo(-30,-12);c.quadraticCurveTo(-28,-20,-14,-20);c.lineTo(4,-18);c.quadraticCurveTo(14,-4,40,0);c.quadraticCurveTo(60,4,60,16);c.lineTo(60,20);c.closePath();c.fill();
   c.fillStyle=k;c.beginPath();c.moveTo(-6,-6);c.quadraticCurveTo(14,4,44,4);c.lineTo(40,10);c.quadraticCurveTo(10,10,-10,2);c.closePath();c.fill();
   c.fillStyle='#24364a';rounded(c,-31,18,92,6,3);for(let i=0;i<5;i++)c.fillRect(-24+i*18,23,7,4);
   c.strokeStyle='#24364a';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-8+i*7,-14+i*3);c.lineTo(-2+i*7,-12+i*3);c.stroke()}}
  if(!mini&&pose.phase>.35&&fx47()){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();c.arc(10,4,56+i*6,-.9-pose.phase*.3,-.25);c.stroke()}}
  c.restore();
 }
 drawBasePlayer=function(c,p,photo=null,mini=false){
  const d=ROSTER[p.character??(p.side===0?selectedFace:rivalIndex)]||ROSTER[2];
  const bodySkin=photo&&d.autoSkin!==false?(headSurface(photo,d).skin||d.skin):d.skin;
  const live=!mini&&!p.preview&&!p.ceremony47,key=p.side;
  let st=live?anim47.get(key):null;if(live&&!st){st={ground:true,land:0,last:simTime};anim47.set(key,st)}
  if(st){const dt=clamp43(simTime-st.last,0,.05);st.last=simTime;if(p.onGround&&!st.ground)st.land=Math.min(1,.55+Math.abs(st.vy||0)/1400);st.ground=p.onGround;st.vy=p.vy;st.land=Math.max(0,st.land-dt*5)}
  const w=walk47(p),phase=kickPhase47(p),fx=fx47();
  let sx=1,sy=1;
  if(fx&&!mini){
   const breathe=Math.sin(simTime*3.2+(p.side||0))*.018;sx-=breathe;sy+=breathe;
   if(!p.onGround){const s=clamp43(-(p.vy||0)/2600,-.07,.09);sy+=s;sx-=s*.7}
   if(st&&st.land>0){const q=st.land*.16;sy-=q;sx+=q*.8}
  }
  c.save();c.translate(p.x,p.y);
  if(!mini){c.fillStyle='#07152250';c.beginPath();c.ellipse(8*(p.face||1),-1,46,8,0,0,7);c.fill();
   // Team-colour ring under the player identifies the side without needing a body.
   c.strokeStyle=kitColor47(p);c.globalAlpha=.7;c.lineWidth=2.5;c.beginPath();c.ellipse(8*(p.face||1),-1,46,8,0,0,7);c.stroke();c.globalAlpha=1}
  if(jersey411(p)){nationalBody410(c,p,d,bodySkin);menuShoes412(c,p);}
  else{drawShoe47(c,p,mini);socketLayer47(c,p,false);}
  // Attach in SHOE-local coordinates, then undo only the portrait reflection.
  // Right/left turns, rocking and kicks therefore share the exact same socket.
  c.save();const socketPose=socketTransform47(c,p);
  c.translate(socketX412(p),socketY411(p));c.scale(socketPose.flip,1);c.scale(sx,sy);
  c.translate(0,5-31*headK412(p));c.scale(headK412(p),headK412(p));
  if(photo){
   // Dashboard X/Y offsets are intentional and must not be cancelled.
   drawIntegratedHead(c,p,d,photo);
  }else procHead47(c,p,d,bodySkin);
  if(live&&fx&&p.bruiseUntil416>simTime)drawBruise416(c,p);
  if(window.drawHeadwear48)drawHeadwear48(c,p,d,photo);
  c.restore();
  if(!jersey411(p))socketLayer47(c,p,true);
  c.restore();
 };

 // ---------- Contact geometry that matches the art ----------
 const SHOE_BOXES47=[[-36,2,68,28],[-31,-19,30,4]];
 footContact44=function(p){
  const s=p.size||1;
  if(Math.abs(ball.x-p.x)>80*s+ball.r||ball.y<p.y-70*s-ball.r||ball.y>p.y+ball.r+4)return null;
  const pose=shoePose47(p),rad=ball.r/s;
  const pressed=p.side===0?keys[' ']||keys.x:mode==='versus'?keys.Enter:false;
  const grow=(pressed||p.shotBuffer43>simTime)?5:0;
  const dx=(ball.x-p.x)/s-pose.x,dy=(ball.y-p.y)/s-pose.y,u=dx*pose.flip,co=Math.cos(pose.a),si=Math.sin(pose.a);
  const lx=u*co+dy*si,ly=-u*si+dy*co;let best=null;
  for(const [x0,y0,x1,y1]of SHOE_BOXES47){
   const qx=clamp43(lx,x0-grow,x1+grow),qy=clamp43(ly,y0-grow,y1+grow),d2=(lx-qx)**2+(ly-qy)**2;
   if(d2>rad*rad||best&&d2>=best.d2)continue;
   // Back to world space.
   const wx=p.x+(pose.x+(qx*co-qy*si)*pose.flip)*s,wy=p.y+(pose.y+qx*si+qy*co)*s;
   const dist=Math.sqrt(d2)*s;let nx,ny;
   if(dist>.001){nx=(ball.x-wx)/dist;ny=(ball.y-wy)/dist}else{nx=p.face>0?.6:-.6;ny=-.8}
   best={d2,dist2:d2,dist,nx,ny,x:wx,y:wy,side:0,penetration:Math.max(0,ball.r-dist)};
  }
  return best;
 };
 const pass47=()=>ball.pass46>simTime;
 collideHead=function(p){
  if(pass47()||ownStrikeGuard43(p))return;
  const s=p.size||1,hp=headPose47(p),cx=p.x+hp.x*s,cy=p.y+hp.y*s,dx=ball.x-cx,dy=ball.y-cy,dist=Math.hypot(dx,dy),radius=G47.headR*s+ball.r;
  if(dist>=radius)return;
  const nx=dist?dx/dist:0,ny=dist?dy/dist:-1,depth=radius-dist;
  ball.x+=nx*(depth+.02);ball.y+=ny*(depth+.02);
  const incoming=(ball.vx-p.vx)*nx+(ball.vy-p.vy)*ny;
  if(incoming<-520&&simTime>(p.bruiseHit416??-1)+.35){p.bruiseHit416=simTime;p.bruiseUntil416=simTime+5;p.bruisePower416=clamp43((-incoming-420)/950,.25,1);}
  if(incoming<0){ball.vx-=1.6*incoming*nx;ball.vy-=1.6*incoming*ny;ball.vx+=p.vx*.18;ball.lastTouch=p.side;sfx('bounce',.3);
   if(p.fire>0){ball.hot=1.5;ball.vx+=p.face*140}
   if(incoming<-260)window.HA46?.ring(ball.x-nx*ball.r,ball.y-ny*ball.r,'#ffffff',26,.18,2);
  }
 };
 bodyDuel=function(dt){
  duelCooldown=Math.max(0,duelCooldown-dt);
  for(const [rider,base]of [[p1,p2],[p2,p1]]){
   const hp=headPose47(base),top=base.y+(hp.y-G47.headR+2)*(base.size||1),reach=30*(base.size||1);
   const aligned=Math.abs(rider.x-(base.x+hp.x*(base.size||1)))<reach,supported=rider.support===base.side&&rider.vy>=0;
   const landing=rider.vy>=base.vy&&(rider.prevY??rider.y)<=top+10&&rider.y>=top-3;
   if(aligned&&(supported||landing)&&rider.y<base.y-60){rider.y=top;rider.vy=0;rider.onGround=true;rider.support=base.side;rider.x+=base.x-(base.prevX??base.x);return}
   rider.support=null;
  }
  const min=37*((p1.size||1)+(p2.size||1)),dx=p2.x-p1.x;
  if(Math.abs(dx)<min&&Math.abs(p1.y-p2.y)<80){
   const sign=dx>=0?1:-1,overlap=min-Math.abs(dx);
   p1.x-=sign*overlap/2;p2.x+=sign*overlap/2;
   p1.x=Math.max(61,Math.min(1059,p1.x));p2.x=Math.max(61,Math.min(1059,p2.x));
   if(Math.abs(p1.vx-p2.vx)>160&&duelCooldown===0){duelCooldown=.5;sfx('body',.25);matchMetrics.bodyHits++}
  }
 };

 // Landing and sprint dust.
 const sim47=simulate;
 simulate=function(dt){
  const g=[p1?.onGround,p2?.onGround],v=[p1?.vy,p2?.vy];
  sim47(dt);
  if(state!=='playing'||!fx47()||!window.HA46)return;
  [p1,p2].forEach((p,i)=>{if(p.onGround&&!g[i]&&v[i]>260)HA46.puff(p.x,GROUND-1,6,'#d9ecd0',90,.32)});
 };

 // ---------- Trophy ceremony ----------
 let cer47=null;
 const ceremonyStyle47=document.createElement('style');
 ceremonyStyle47.textContent='#app.ceremony47>*:not(#game):not(#overlay):not(#toast):not(#screen),#app.ceremony47 .goal-moment{opacity:0!important;visibility:hidden!important;pointer-events:none!important}#app.ceremony47 #game{cursor:pointer}';
 document.head.append(ceremonyStyle47);
 const finish47=finish;
 finish=function(){
  const was=state;finish47();
  if(was==='finished'||state!=='finished')return;
  if(!$('#splash').classList.contains('champion'))return;
  const world=mode==='world';
  cer47={t:0,last:performance.now(),confetti:[],sparks:[],fireT:0,shown:false,notes:0,
   title:'JUARA!',sub:world?(typeof nation==='function'&&activeTeams?nation(activeTeams.left.id).name.toUpperCase()+' · WORLD CHAMPION':'WORLD CHAMPION'):'ARENA CUP CHAMPION',
   who:{x:560,y:430,vx:0,vy:0,side:0,character:p1.character,face:1,onGround:true,size:1.5,kick:0,nation:p1.nation,ceremony47:true}};
  $('#overlay').classList.add('hidden');$('#app').classList.add('ceremony47');
 };
 function endCeremony47(){if(!cer47||cer47.shown)return;cer47.shown=true;$('#app').classList.remove('ceremony47');$('#overlay').classList.remove('hidden')}
 canvas.addEventListener('pointerdown',()=>{if(cer47&&!cer47.shown&&cer47.t>.6)endCeremony47()});
 window.addEventListener('keydown',e=>{if(cer47&&!cer47.shown&&cer47.t>.6&&(e.key==='Enter'||e.key===' '||e.key==='Escape'))endCeremony47()});
 const ease=t=>1-Math.pow(1-clamp43(t,0,1),3),back=t=>{t=clamp43(t,0,1);const k=1.7;return 1+(k+1)*Math.pow(t-1,3)+k*Math.pow(t-1,2)};
 function firework47(x,y){
  const colors=['#ffd25e','#9df7d0','#ff8fb0','#a9d4ff','#ffffff'],col=colors[Math.random()*colors.length|0],n=S47q()?34:18;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,s=150+Math.random()*120;cer47.sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1.1,total:1.1,color:col})}
  if(cer47.sparks.length>160)cer47.sparks.splice(0,cer47.sparks.length-160);
 }
 const S47q=()=>window.HA46?HA46.state.quality:1;
 function tickCeremony47(dt){
  const c=cer47,t0=c.t;c.t+=dt;const t=c.t,fx=fx47();
  // Fanfare notes timed with the lift.
  const notes=[[1.55,523],[1.7,659],[1.85,784],[2.05,1046]];
  while(c.notes<notes.length&&t>=notes[c.notes][0]){beep(notes[c.notes][1],.18,'triangle',.25);c.notes++}
  if(t0<1.9&&t>=1.9){sfx('goal',.9);if(fx){for(let i=0;i<3;i++)firework47(300+i*260,140+Math.random()*60)}}
  if(fx&&t>1.9){c.fireT-=dt;if(c.fireT<=0){c.fireT=.55+Math.random()*.35;firework47(200+Math.random()*720,90+Math.random()*120)}
   const want=S47q()?110:50;for(let i=0;i<3&&c.confetti.length<want;i++)c.confetti.push({x:Math.random()*1120,y:-10,vx:(Math.random()-.5)*60,vy:60+Math.random()*90,a:Math.random()*6,va:(Math.random()-.5)*10,w:5+Math.random()*5,h:3+Math.random()*3,color:['#ffd25e','#9df7d0','#ff8fb0','#a9d4ff','#ffffff','#c3ff53'][Math.random()*6|0]})}
  for(let i=c.confetti.length-1;i>=0;i--){const q=c.confetti[i];q.x+=(q.vx+Math.sin(t*3+q.a)*25)*dt;q.y+=q.vy*dt;q.a+=q.va*dt;if(q.y>580)c.confetti.splice(i,1)}
  for(let i=c.sparks.length-1;i>=0;i--){const q=c.sparks[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.exp(-1.6*dt);q.vy=q.vy*Math.exp(-1.6*dt)+140*dt;if((q.life-=dt)<=0)c.sparks.splice(i,1)}
  if(t>5.4)endCeremony47();
 }
 function trophy47(c,x,y,k,shine){
  c.save();c.translate(x,y);c.scale(k,k);
  const gold=c.createLinearGradient(-30,0,30,0);gold.addColorStop(0,'#a8701c');gold.addColorStop(.3,'#ffe28a');gold.addColorStop(.55,'#ffd04d');gold.addColorStop(1,'#9a6114');
  c.fillStyle=gold;c.strokeStyle='#7a4c0e';c.lineWidth=2;
  // handles
  c.lineWidth=6;c.strokeStyle='#e7b440';for(const s of [-1,1]){c.beginPath();if(s>0)c.arc(30,-54,12,-Math.PI/2,Math.PI/2);else c.arc(-30,-54,12,Math.PI/2,Math.PI*1.5);c.stroke()}
  c.lineWidth=2;c.strokeStyle='#7a4c0e';
  // bowl
  c.beginPath();c.moveTo(-32,-72);c.lineTo(32,-72);c.quadraticCurveTo(30,-30,6,-22);c.lineTo(-6,-22);c.quadraticCurveTo(-30,-30,-32,-72);c.closePath();c.fill();c.stroke();
  c.fillStyle='#fff3c0';c.beginPath();c.ellipse(0,-72,32,6,0,0,7);c.fill();c.fillStyle='#b8801f';c.beginPath();c.ellipse(0,-71,26,3.5,0,0,7);c.fill();
  // stem + base
  c.fillStyle=gold;c.fillRect(-5,-24,10,16);c.beginPath();c.ellipse(0,-9,12,4,0,0,7);c.fill();
  c.fillStyle='#2b3550';c.beginPath();c.moveTo(-20,-6);c.lineTo(20,-6);c.lineTo(24,8);c.lineTo(-24,8);c.closePath();c.fill();
  c.fillStyle=gold;c.fillRect(-24,6,48,5);c.fillStyle='#ffe28a';c.fillRect(-12,-2,24,3);
  // star
  c.fillStyle='#fffbe6';c.beginPath();for(let i=0;i<10;i++){const r=i%2?4:9,a=i*Math.PI/5-Math.PI/2;c.lineTo(Math.cos(a)*r,-48+Math.sin(a)*r)}c.closePath();c.fill();
  // moving shine
  if(shine){c.save();c.beginPath();c.moveTo(-32,-72);c.lineTo(32,-72);c.quadraticCurveTo(30,-30,6,-22);c.lineTo(-6,-22);c.quadraticCurveTo(-30,-30,-32,-72);c.clip();
   const sx=-60+((simTime*90)%160);c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.moveTo(sx,-80);c.lineTo(sx+12,-80);c.lineTo(sx-8,-15);c.lineTo(sx-20,-15);c.closePath();c.fill();c.restore()}
  c.restore();
 }
 function glove47(c,x,y,flip,k){c.save();c.translate(x,y);c.scale(flip*k,k);c.fillStyle='#ffffff';c.strokeStyle='#1d2c40';c.lineWidth=2;c.beginPath();c.ellipse(0,0,12,10,0,0,7);c.fill();c.stroke();c.beginPath();c.ellipse(-9,-6,5,4,-.6,0,7);c.fill();c.stroke();c.fillStyle='#dfe7ee';c.fillRect(-4,8,12,5);c.restore()}
 function drawCeremony47(){
  const c=cer47,t=c.t,fx=fx47(),W=worldViewWidth428(),H=worldViewHeight428();
  ctx.save();ctx.translate((W-1120)/2,0);
  drawStadium();
  ctx.fillStyle=`rgba(3,8,20,${.72*ease(t/.6)})`;ctx.fillRect(-200,0,1520,H);
  const cx=560,podY=470;
  // Rotating light rays behind the champion.
  if(fx){ctx.save();ctx.translate(cx,250);ctx.rotate(simTime*.25);ctx.globalCompositeOperation='lighter';
   for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.fillStyle=i%2?'rgba(255,214,110,.07)':'rgba(160,240,220,.05)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-60,-520);ctx.lineTo(60,-520);ctx.closePath();ctx.fill()}
   ctx.restore()}
  // Spotlights.
  for(const [x,s] of [[160,1],[960,-1]]){const sweep=Math.sin(simTime*1.3+s)*60;const g=ctx.createLinearGradient(x,0,cx,podY);g.addColorStop(0,'rgba(255,250,220,.25)');g.addColorStop(1,'rgba(255,250,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-10,0);ctx.lineTo(x+10,0);ctx.lineTo(cx+sweep*s+90,podY);ctx.lineTo(cx+sweep*s-90,podY);ctx.closePath();ctx.fill()}
  // Podium.
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(cx,podY+50,170,16,0,0,7);ctx.fill();
  const pg=ctx.createLinearGradient(0,podY,0,podY+52);pg.addColorStop(0,'#ffe08a');pg.addColorStop(1,'#a8701c');
  ctx.fillStyle=pg;ctx.beginPath();ctx.roundRect(cx-120,podY,240,52,10);ctx.fill();
  ctx.fillStyle='#fff6d0';ctx.fillRect(cx-120,podY,240,5);ctx.fillStyle='#7a4c0e';ctx.font='900 30px Arial';ctx.textAlign='center';ctx.fillText('1',cx,podY+40);
  // Champion: drops in, then celebrates with hops.
  const drop=ease(t/.7),hop=t>2.2?Math.abs(Math.sin((t-2.2)*5.2))*26:0,land=t>.55&&t<.85?Math.sin((t-.55)/.3*Math.PI)*.12:0;
  const who=c.who;who.y=podY-(1-drop)*420-hop;who.onGround=t>2.2?hop<3:drop>=1;who.vy=t>2.2?(Math.cos((t-2.2)*5.2)>0?-300:300):0;
  ctx.save();ctx.translate(cx,podY);ctx.scale(1+land,1-land);ctx.translate(-cx,-podY);
  drawPlayer(ctx,who,headImage);
  ctx.restore();
  // Trophy flies in, gets grabbed, and is lifted overhead.
  const s=who.size,headTop=who.y+(headPose47(who).y-G47.headR)*s;
  const arrive=ease((t-.7)/.8),lift=back((t-1.5)/.5);
  const k=1.3,restY=headTop+4,upY=headTop-34;
  const ty=t<1.5?(-160+(restY+160)*arrive):restY+(upY-restY)*lift,tx=cx+headPose47(who).x*s+Math.sin(t*2)*2;
  if(t>.7){
   if(fx&&t>1.5){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55+.15*Math.sin(simTime*6);const gs=glowSprite47('#ffd06a'),z=240*lift;ctx.drawImage(gs,tx-z/2,ty-50*k-z/2,z,z);ctx.restore()}
   trophy47(ctx,tx,ty,k,fx);
   if(t>1.3){const ga=clamp43((t-1.3)/.2,0,1);ctx.globalAlpha=ga;glove47(ctx,tx-32*k-10,ty-46*k,1,1.25);glove47(ctx,tx+32*k+10,ty-46*k,-1,1.25);ctx.globalAlpha=1}
  }
  // Effects.
  if(fx){for(const q of c.sparks){ctx.globalAlpha=q.life/q.total;ctx.fillStyle=q.color;ctx.fillRect(q.x-1.5,q.y-1.5,3,3)}
   for(const q of c.confetti){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.a);ctx.globalAlpha=.9;ctx.fillStyle=q.color;ctx.fillRect(-q.w/2,-q.h/2,q.w,q.h*Math.abs(Math.cos(q.a*1.7))+1);ctx.restore()}
   ctx.globalAlpha=1}
  // Title.
  if(t>1.9){const pop=back((t-1.9)/.45),wob=Math.sin(simTime*3)*.03;
   ctx.save();ctx.translate(cx,92);ctx.scale(pop*(1+wob),pop*(1+wob));ctx.rotate(-.04);
   ctx.font='italic 900 80px Arial';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=14;ctx.strokeStyle='#3a1f02';ctx.strokeText(c.title,0,0);
   const tg=ctx.createLinearGradient(0,-70,0,10);tg.addColorStop(0,'#fff6c4');tg.addColorStop(.5,'#ffd04d');tg.addColorStop(1,'#d88b16');ctx.fillStyle=tg;ctx.fillText(c.title,0,0);
   ctx.font='800 22px Arial';ctx.lineWidth=6;ctx.strokeStyle='#04101f';ctx.strokeText(c.sub,0,36);ctx.fillStyle='#ffffff';ctx.fillText(c.sub,0,36);ctx.restore()}
  if(t>2.6&&!c.shown){ctx.globalAlpha=.6+.4*Math.sin(simTime*4);ctx.font='700 14px Arial';ctx.textAlign='center';ctx.fillStyle='#e9fff6';ctx.fillText('KETUK UNTUK LANJUT',cx,548);ctx.globalAlpha=1}
  ctx.restore();
 }
 const glow47={};
 function glowSprite47(color){if(glow47[color])return glow47[color];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,color);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return glow47[color]=c}
 const draw47=draw;
 draw=function(){
  if(cer47&&state!=='finished')cer47=null;
  if(!cer47){draw47();return}
  const now=performance.now(),dt=clamp43((now-cer47.last)/1000,0,.05);cer47.last=now;
  tickCeremony47(dt);drawCeremony47();
 };
}
