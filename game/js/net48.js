'use strict';
// Continuous goal geometry: one authoritative mouth sensor and swept net/crossbar.
{
 function hitBox48(x,y,dx,dy,b){
  if(x>b.l+1e-5&&x<b.r-1e-5&&y>b.t+1e-5&&y<b.b-1e-5){
   const e=[[x-b.l,-1,0],[b.r-x,1,0],[y-b.t,0,-1],[b.b-y,0,1]].sort((a,b)=>a[0]-b[0])[0];
   return{t:0,nx:e[1],ny:e[2],depth:e[0]};
  }
  let lo=-Infinity,hi=Infinity,nx=0,ny=0;
  for(const [v,d,a,z,xx,yy]of [[x,dx,b.l,b.r,1,0],[y,dy,b.t,b.b,0,1]]){
   if(Math.abs(d)<1e-9){if(v<a||v>z)return null;continue}
   let t1=(a-v)/d,t2=(z-v)/d,sign=-1;if(t1>t2){[t1,t2]=[t2,t1];sign=1}
   if(t1>lo){lo=t1;nx=xx*sign;ny=yy*sign}hi=Math.min(hi,t2);if(lo>hi)return null;
  }
  if(lo<-.00001||lo>1||hi<0||dx*nx+dy*ny>=0)return null;
  return{t:Math.max(0,lo),nx,ny,depth:0};
 }
 function trace48(ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,r=ball.r;
  for(const [front,dir,side]of [[LEFT,-1,1],[RIGHT,1,0]]){
   if(dir*(bx-front)<=0){if(ball.entry48===side)ball.entry48=null;continue}
   if(dir*(ax-front)<=0&&Math.abs(dx)>1e-8){const t=(front-ax)/dx,y=ay+dy*t;if(t>=0&&t<=1&&y-r>=POST+5-.01&&y+r<=GROUND+.1)ball.entry48=side;}
   const line=front+dir*(r+2),da=dir*(ax-line),db=dir*(bx-line);
   if(ball.entry48===side&&db>=0){const t=da<0&&Math.abs(dx)>1e-8?clamp43((line-ax)/dx,0,1):0,y=ay+dy*t;if(y-r>=POST+5-.05&&y+r<=GROUND+.2){ball.x=line;ball.y=y;goal(side);return true}}
  }
  return false;
 }
 window.netStep48=function(prevX,prevY){
  if(state!=='playing')return false;
  const r=ball.r,boxes=[{l:28-r,r:LEFT+r,t:POST-r,b:POST+5+r},{l:RIGHT-r,r:1092+r,t:POST-r,b:POST+5+r}];
  let x=prevX,y=prevY,dx=ball.x-x,dy=ball.y-y;
  for(let n=0;n<6;n++){
   let hit=null;
   for(const box of boxes){const h=hitBox48(x,y,dx,dy,box);if(h&&(!hit||h.t<hit.t))hit=h;}
   // Back boundaries are checked after a valid mouth crossing, never before scoring.
   if(dx<0&&x+dx<28+r){const t=(28+r-x)/dx;if(t>=0&&t<=1&&(!hit||t<hit.t))hit={t,nx:1,ny:0,depth:0,back:true};}
   if(dx>0&&x+dx>1092-r){const t=(1092-r-x)/dx;if(t>=0&&t<=1&&(!hit||t<hit.t))hit={t,nx:-1,ny:0,depth:0,back:true};}
   const t=hit?hit.t:1,ex=x+dx*t,ey=y+dy*t;
   if(trace48(x,y,ex,ey))return true;
   if(!hit){x=ex;y=ey;break}
   x=ex+hit.nx*(hit.depth+.025);y=ey+hit.ny*(hit.depth+.025);
   const incoming=ball.vx*hit.nx+ball.vy*hit.ny;
   if(incoming<0){const restitution=hit.back?.78:hit.ny<0?.38:.7;ball.vx-=(1+restitution)*incoming*hit.nx;ball.vy-=(1+restitution)*incoming*hit.ny;}
   const v=dx*hit.nx+dy*hit.ny;if(v<0){const e=hit.ny<0?.38:.7;dx-=(1+e)*v*hit.nx;dy-=(1+e)*v*hit.ny;}dx*=1-t;dy*=1-t;
   if(Math.abs(incoming)>140&&simTime-(ball.netSound48||-10)>.14){sfx('post',.3);ball.netSound48=simTime}
   if(Math.abs(dx)+Math.abs(dy)<.001)break;
  }
  ball.x=clamp43(x,28+r,1092-r);ball.y=Math.min(y,GROUND-r);
  // Recover an unregistered penetration, never award a goal from a roof/back leak.
  for(const [front,dir,side]of [[LEFT,-1,1],[RIGHT,1,0]])if(dir*(ball.x-front)>r+2&&ball.y-r>=POST+5&&ball.entry48!==side){ball.x=front-dir*(r+6);ball.vx=-dir*Math.max(120,Math.abs(ball.vx)*.5);ball.vy=Math.min(ball.vy,-80);ball.entry48=null;}
  return false;
 };
 window.NET48={hitBox:hitBox48,trace:trace48};
 if(!avatarPreview45){const originalGoal48=goal;goal=function(side){if(state!=='playing')return;originalGoal48(side)};}
}
