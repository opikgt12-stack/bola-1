'use strict';
const {makeContext}=require('./runtime.cjs'),{loadImage}=require('@napi-rs/canvas'),path=require('path');
let street;const actions=()=>({j:0,s:0,c:0,l:0}),neutral=()=>({x:0,j:false,s:false,c:false,l:false,actions:actions(),tick:0});
async function createWorld(claims){
 street??=await loadImage(path.join(__dirname,'game/assets/boots/street.png'));
 const {context:c,vm}=makeContext();c.__street446=street;c.__room446=claims.room;c.__config446=claims.config;
 vm.runInContext(`
 managedConfig=__config446;normalizeMatchdayConfig(managedConfig);window.GAME_CONFIG=managedConfig;
 ROSTER.splice(0,ROSTER.length,...managedConfig.players);ARENAS.splice(0,ARENAS.length,...managedConfig.arenas);
 saved.effects=false;saved.haptics=false;saved.sound=false;muted=true;saved.arena=__room446.options.arena;saved.ball='classicball';saved.face=__room446.host.player;rivalIndex=__room446.guest.player;selectedFace=saved.face;
 bootImages.street=__street446;bootFor=()=>BOOTS[0];skillFor=p=>skillDef(ROSTER[p.character]?.skill||'titan');ballSpeedLimit=()=>1250;
 window.HAOnline422={active:()=>true};
 presentationTick=goalAnimation=updateHud=announce=celebrateGoal=burst=sfx=beep=skillFX=()=>{};
 const resetServer446=resetPositions;resetPositions=function(){resetServer446();p1.character=__room446.host.player;p2.character=__room446.guest.player;p1.neutralBoot=p2.neutralBoot=true;ball.rng445=0};
 finish=function(){state='finished';keys={}};
 scoreGoal=function(side){if(state!=='playing')return;score[side]++;lastScorer=side;state='goal';goalTimer=2;goalFlash=.6};
 mode='versus';challenge=null;score=[0,0];sudden=false;simTime=weatherTime=0;time=__room446.options.duration;state='countdown';startTimer=1.4;introRemaining=0;resetPositions();
 let inputs446=[{x:0,actions:{}},{x:0,actions:{}}],used446=[{j:0,s:0,c:0,l:0},{j:0,s:0,c:0,l:0}];
 const moveServer446=movePlayer;movePlayer=function(p,x,...args){return moveServer446(p,inputs446[p.side].x,...args)};
 const primitive446=o=>{const out={};for(const[k,v]of Object.entries(o))if(typeof v==='number'&&Number.isFinite(v)||typeof v==='boolean'||typeof v==='string'&&v.length<100)out[k]=typeof v==='number'?Math.round(v*1000)/1000:v;if(o.premium419)out.premium419={...o.premium419};return out};
 window.__world446={
 step(dt,inputs){inputs446=inputs;const [h,g]=inputs;keys={a:h.x<-.12,d:h.x>.12,w:h.j,' ':h.s,q:h.c,x:h.l,ArrowLeft:g.x<-.12,ArrowRight:g.x>.12,ArrowUp:g.j,Enter:g.s,Shift:g.c,ArrowDown:g.l};analog.active=false;analog.jump=false;
  if(state==='playing')for(let side=0;side<2;side++){const p=side?p2:p1,i=inputs[side];for(const key of ['j','s','c','l']){const n=i.actions[key]||0;if(n>used446[side][key]){if(key==='j')jump(p);else if(key==='c')shoot(p,true);else{const old=side?keys.ArrowDown:keys.x;if(side)keys.ArrowDown=key==='l';else keys.x=key==='l';shoot(p);if(side)keys.ArrowDown=old;else keys.x=old}used446[side][key]=n}}}
  simulate(dt);
 },
 snapshot(side,clock,hold){return {clock,ackTick:inputs446[side].tick||0,ackElapsed:0,ackJ:used446[side].j,ackS:used446[side].s,ackL:used446[side].l,ackC:used446[side].c,hostInput:inputs446[0],guestInput:inputs446[1],p:[primitive446(p1),primitive446(p2)],ball:{...primitive446(ball),strikeGuard43:ball.strikeGuard43?{...ball.strikeGuard43}:null},projectiles:projectiles.slice(0,24).map(primitive446),waves:skillWaves.slice(0,12).map(primitive446),score:[...score],time,phase:state,simTime,startTimer,goalTimer,sudden,lastScorer,goalFlash,hold}},
 state(){return {phase:state,score:[...score]}},
 testBall(x,y,vx,vy){ball.x=x;ball.y=y;ball.vx=vx;ball.vy=vy},
 dispose(){state='menu';particles=[];trail=[]}
 };`,c,{timeout:5000});
 return c.__world446;
}
module.exports={createWorld,neutral};
