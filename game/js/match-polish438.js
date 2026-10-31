'use strict';
// Bounded display-only accents. No physics changes, frame loops, or replay-generated effects.
if(!avatarPreview45){
 const impacts438=[],reduced438=matchMedia('(prefers-reduced-motion:reduce)');let goalTimer438=null;
 const fx438=()=>saved.effects!==false&&!reduced438.matches;
 const drive438=drive44;drive44=function(p,hit,active){const ok=drive438(p,hit,active);if(ok&&active&&fx438()){impacts438.push({x:hit.x,y:hit.y,t:performance.now(),color:p.side===0?'#a1efde':'#ffe1a8'});if(impacts438.length>10)impacts438.shift()}return ok};
 const ball438=drawBall;drawBall=function(){
  if(fx438()){
   const now=performance.now();while(impacts438.length&&now-impacts438[0].t>260)impacts438.shift();ctx.save();
   for(const f of impacts438){const k=(now-f.t)/260;if(k<0||k>1)continue;ctx.globalAlpha=(1-k)*.65;ctx.strokeStyle=f.color;ctx.lineWidth=1.5*(1-k)+.5;ctx.beginPath();ctx.arc(f.x,f.y,8+k*32,0,Math.PI*2);ctx.stroke();for(let j=0;j<5;j++){const a=j*Math.PI*2/5+.3,r=12+k*30;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r);ctx.lineTo(f.x+Math.cos(a)*(r+4),f.y+Math.sin(a)*(r+4));ctx.stroke()}}
   ctx.restore();
  }ball438();
 };
 const celebrate438=celebrateGoal;celebrateGoal=function(...args){const r=celebrate438(...args);if(fx438()){document.querySelector('#app').classList.add('goal-accent438');clearTimeout(goalTimer438);goalTimer438=setTimeout(()=>document.querySelector('#app').classList.remove('goal-accent438'),700)}return r};
 // Immediate tactile feedback on the same trusted gesture; never another shot.
 document.querySelectorAll('#touchControls [data-key]').forEach(button=>button.addEventListener(window.PointerEvent?'pointerdown':'touchstart',()=>{if(saved.haptics!==false&&state==='playing'&&!document.querySelector('dialog[open]'))navigator.vibrate?.(6)},{passive:true}));
 window.ArenaChatInMatch438=()=>['playing','countdown','goal','paused'].includes(state);
}
