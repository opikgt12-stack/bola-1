'use strict';
// 4.1: per-portrait team identity, tailored kits and desktop menus without vertical scrolling.
function portraitNation(el,index,which){
 // The intro is a distinct scope: a still-open World Cup hub must never override it.
 if(el.dataset.teamNation)return el.dataset.teamNation;
 if(el.closest('#versusIntro')){
  if(mode==='world'&&activeTeams)return which==='rival'?activeTeams.right.id:activeTeams.left.id;
  return playerNation(index).id;
 }
 if(el.closest('#screen')&&['world','world-setup'].includes(view))return world?.team||saved.nation;
 return playerNation(index).id;
}
const nationalBadges={};
for(const n of NATIONS){const im=new Image();im.src='assets/flags/'+n.id.toLowerCase()+'.png';nationalBadges[n.id]=im;}
function shirtPath(c){
 c.beginPath();c.moveTo(-7,-48);c.quadraticCurveTo(-14,-48,-22,-43);
 c.lineTo(-27,-31);c.lineTo(-18,-27);c.lineTo(-16,-18);
 c.quadraticCurveTo(0,-14,16,-18);c.lineTo(18,-27);c.lineTo(27,-31);
 c.lineTo(22,-43);c.quadraticCurveTo(14,-48,7,-48);
 c.quadraticCurveTo(0,-40,-7,-48);c.closePath();
}
drawNationalKit=function(c,id){
 const pair=kitColors[id]||[nation(id).color,'#fff'];
 c.save();shirtPath(c);c.clip();c.fillStyle=pair[0];c.fillRect(-30,-50,60,36);
 c.fillStyle=pair[1];
 if(['AR','US'].includes(id)){for(let x=-17;x<24;x+=13)c.fillRect(x,-50,6,34)}
 else if(id==='HR'){for(let y=-50;y<-15;y+=8)for(let x=-28;x<28;x+=8)if((Math.floor(x/8)+Math.floor(y/8))%2===0)c.fillRect(x,y,8,8)}
 else if(['GB','EN'].includes(id)){c.fillRect(-2,-50,4,34);c.fillRect(-30,-37,60,4)}
 else if(id==='PT'){c.fillRect(-28,-50,11,36)}
 else if(id==='FR'){c.fillRect(-27,-50,7,36);c.fillStyle='#dd3b4c';c.fillRect(20,-50,7,36)}
 else if(id==='MA'){c.fillRect(-30,-34,12,4);c.fillRect(18,-34,12,4)}
 else if(id==='DE'){c.fillStyle='#1e2732';c.fillRect(-30,-32,60,3);c.fillStyle='#d33f49';c.fillRect(-30,-29,60,2);c.fillStyle='#e5be59';c.fillRect(-30,-27,60,2)}
 else{c.fillRect(-29,-33,12,3);c.fillRect(17,-33,12,3)}
 // Two broad highlights communicate fabric volume without expensive filters.
 c.fillStyle='#ffffff15';c.beginPath();c.moveTo(-13,-42);c.lineTo(-3,-44);c.lineTo(-5,-20);c.lineTo(-13,-20);c.closePath();c.fill();
 c.fillStyle='#00000024';c.beginPath();c.moveTo(13,-44);c.lineTo(22,-38);c.lineTo(17,-18);c.lineTo(10,-18);c.closePath();c.fill();
 c.strokeStyle='#0000001f';c.lineWidth=1;c.beginPath();c.moveTo(-13,-28);c.quadraticCurveTo(-3,-24,8,-27);c.stroke();
 c.restore();
 c.save();c.strokeStyle='#081c2c65';c.lineWidth=1;shirtPath(c);c.stroke();
 c.strokeStyle=pair[1];c.lineWidth=2.5;c.beginPath();c.moveTo(-7,-47);c.quadraticCurveTo(0,-38,7,-47);c.stroke();
 // Each badge is the actual local flag asset, never an Indonesia-colored placeholder.
 const flag=nationalBadges[id];if(flag?.complete&&flag.naturalWidth)c.drawImage(flag,7,-40,8,5);
 else{c.fillStyle=pair[1];rounded(c,7,-40,8,5,1)}
 c.restore();
};
const desktopMenu=matchMedia('(min-width:1000px) and (min-height:640px) and (pointer:fine)');
const menuPages={};
function addGridPager(grid,size,key){
 const cards=[...grid.children],pages=Math.ceil(cards.length/size);if(pages<=1)return;
 let current=Math.min(menuPages[key]||0,pages-1);
 const bar=document.createElement('nav');bar.className='desktop-pager';bar.setAttribute('aria-label','Halaman koleksi');
 const prev=document.createElement('button'),label=document.createElement('span'),next=document.createElement('button');
 prev.textContent='← Sebelumnya';next.textContent='Berikutnya →';prev.className=next.className='outline';
 const update=()=>{cards.forEach((el,i)=>el.hidden=Math.floor(i/size)!==current);label.textContent=`${current+1} / ${pages} · ${cards.length} item`;prev.disabled=current===0;next.disabled=current===pages-1;menuPages[key]=current};
 prev.onclick=()=>{current--;update()};next.onclick=()=>{current++;update()};bar.append(prev,label,next);grid.after(bar);update();
}
function fitDesktopMenus(){
 const screen=$('#screen');if(!desktopMenu.matches||screen.classList.contains('hidden')||screen.dataset.desktopReady)return;
 screen.dataset.desktopReady='true';
 for(const [selector,size]of [['.boot-grid',4],['.shop-grid',8],['.career-goals',6],['.challenge-grid',6],['.skill-grid',3]]){
  const grid=screen.querySelector(selector);if(grid)addGridPager(grid,size,view+'|'+shopTab+'|'+selector);
 }
 const sizes=[...screen.querySelectorAll('.size-control')];if(sizes.length){const group=document.createElement('div');group.className='desktop-size-grid';sizes[0].before(group);sizes.forEach(el=>group.append(el));}
 const lab=screen.querySelector('.prism-customizer');
 if(lab){
  const trigger=document.createElement('button');trigger.className='outline color-lab-open';trigger.textContent='Prism Color Lab · Pilih warna →';
  const dialog=document.createElement('dialog');dialog.className='color-lab-dialog';
  const close=document.createElement('button');close.className='outline';close.textContent='Tutup ×';close.onclick=()=>dialog.close();
  lab.before(trigger);dialog.append(close,lab);screen.append(dialog);trigger.onclick=()=>dialog.showModal();
 }
}
const renderBeforePolish=renderPage;
renderPage=function(...args){renderBeforePolish(...args);delete $('#screen').dataset.desktopReady;requestAnimationFrame(fitDesktopMenus)};
desktopMenu.addEventListener('change',()=>{
 // Rebuild, not hide controls, when crossing desktop/mobile layouts.
 if(state==='menu'){
  const routes={home:showHome,shop:showShop,settings:()=>showSettings(settingsFrom),modes:showModes,roster:()=>showRoster(rosterPurpose),career:showCareer,arenas:showArenas,challenges:showChallenges,world:showWorldHub,'world-setup':showWorldSetup,cup:showCup};
  routes[view]?.();
 }
});
