'use strict';
// Explicit browser identity, not fingerprinting. Snapshots are client-reported.
if(!window.avatarPreview45){
 const ID48='arena-browser-v48',safeRead48=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}},hex48=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')};
 let ident48=safeRead48(ID48);if(!ident48||!/^[a-f0-9]{32}$/.test(ident48.id)||!/^[a-f0-9]{64}$/.test(ident48.token))ident48={id:hex48(16),token:hex48(32),resetVersion:0,alias:'',sharing:true};
 const remember48=()=>{try{localStorage.setItem(ID48,JSON.stringify(ident48))}catch{}};remember48();
 const session48=hex48(16);let busy48=false,timer48,resetting48=false,registered4151=false;window.browserStatus48='Belum tersambung';
 const snapshot48=()=>({coins:saved.coins,matches:saved.matches,wins:saved.wins,goals:saved.goals,cups:saved.cups,worldCups:saved.worldCups,playSeconds:Math.floor(saved.playSeconds48||0),owned:saved.owned,skillOwned:(saved.skillOwned||[]).map(id=>'skill-'+id),boot:selectedBoot().id,ball:saved.ball,gear:saved.gear,arena:saved.arena,character:ROSTER[selectedFace]?.name||String(selectedFace),lastResult:saved.lastResult48||''});

 function validGift49(g){return g&&/^[a-f0-9]{32}$/.test(g.id)&&((g.kind==='coins'&&Number.isInteger(Number(g.amount))&&Number(g.amount)>0&&Number(g.amount)<=1000000)||(g.kind==='item'&&(BOOTS.some(x=>x.id===g.item)||catalog.some(x=>x.id===g.item)||Object.hasOwn(SKILL_PRICES,g.item?.replace(/^skill-/,'')))));}
 function applyGift49(g){
  saved.giftLedger49??={};if(Object.hasOwn(saved.giftLedger49,g.id))return;
  if(g.kind==='coins'){const n=Number(saved.coins||0)+Number(g.amount);if(n>100000000)throw Error('Saldo maksimal; gunakan koin dulu agar hadiah dapat diterima');saved.coins=n;}
  else if(g.item.startsWith('skill-'))saved.skillOwned=[...new Set([...(saved.skillOwned||[]),g.item.slice(6)])];
  else saved.owned=[...new Set([...(saved.owned||[]),g.item])];
  saved.giftLedger49[g.id]={...g,received:new Date().toISOString()};
 }
 function mergeGifts49(){const disk=safeRead48(STORE);if(disk?.giftEpoch49===ident48.resetVersion&&disk.giftLedger49)for(const g of Object.values(disk.giftLedger49))if(validGift49(g))applyGift49(g);saved.giftEpoch49=ident48.resetVersion;}
 function acceptGifts49(gifts){
  if(!Array.isArray(gifts)||!gifts.length)return;
  const before=JSON.stringify(saved);try{mergeGifts49();for(const g of gifts)if(validGift49(g))applyGift49(g);const next=JSON.stringify(saved);localStorage.setItem(STORE,next);if(localStorage.getItem(STORE)!==next)throw Error('Penyimpanan belum berhasil');updateStats();}
  catch(e){Object.keys(saved).forEach(k=>delete saved[k]);Object.assign(saved,JSON.parse(before));window.browserStatus48='Hadiah menunggu: '+e.message;throw e;}
 }
 window.giftInbox49=()=>Object.values(saved.giftLedger49||{}).sort((a,b)=>b.received.localeCompare(a.received));
 function clearProgress48(version){
  if(resetting48)return;resetting48=true;ident48.resetVersion=version;remember48();
  // Only reset this game's progress and old migration backup; never browser cache.
  const keep={};for(const k of ['sound','volume','music48','controls','touchLayout','effects','quality','haptics'])if(saved[k]!==undefined)keep[k]=saved[k];
  Object.keys(saved).forEach(k=>delete saved[k]);Object.assign(saved,{coins:500,goals:0,wins:0,owned:['volt','night'],kit:'volt',arena:'night',trail:'none',photo:null,name:'',volume:.35,...keep});
  try{localStorage.setItem(STORE,JSON.stringify(saved));localStorage.removeItem(STORE+'-before-load-v1')}catch{}
  // Reload even if offline. The clean state acknowledges the reset on next sync.
  location.reload();
 }
 function persist48(){if(!resetting48)try{mergeGifts49();localStorage.setItem(STORE,JSON.stringify(saved))}catch{}}
 async function doSync48(receiveGifts=true){
  if(window.HAOnline422?.active())return;
  persist48();if(busy48||resetting48||ident48.sharing===false||document.hidden||!navigator.onLine)return;
  busy48=true;let controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
  try{const r=await fetch('/api/player/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...ident48,session:session48,snapshot:snapshot48(),giftReceipts:Object.keys(saved.giftLedger49||{}).slice(-5000),controlClient:window.controlInfo415?'4.17.0':'',controlAck:window.controlAck415?.()??-1,controlState:window.controlState415?.()??state}),signal:controller.signal});if(!r.ok){if(r.status===403)window.clearControl415?.();throw Error('sync');}const d=await r.json();registered4151=true;if(d.resetRequired){if(Number.isInteger(d.resetVersion)&&d.resetVersion>=0)clearProgress48(d.resetVersion)}else{window.receiveControl415?.(d.control);if(receiveGifts){acceptGifts49(d.gifts);if(d.gifts?.length){clearTimeout(timer48);timer48=setTimeout(sync48,900)}}window.browserStatus48='Tersinkron · '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}
  }catch(e){window.browserStatus48=e.message==='sync'?'Sinkron belum berhasil · progres tetap di browser':e.name==='AbortError'?'Koneksi lambat · mencoba lagi':('Belum tersinkron · '+e.message)}finally{clearTimeout(timeout);busy48=false}
 }
 async function sync48(){
  if(navigator.locks)return navigator.locks.request('arena-browser-gifts49',{ifAvailable:true},lock=>lock?doSync48():undefined);
  // Without a same-origin exclusive lock, don't claim rewards across tabs.
  await doSync48(false);window.browserStatus48='Progres tersinkron · gunakan HTTPS untuk menerima hadiah dengan aman';
 }
 // Fast, small control channel. Full progress/gift sync keeps its existing cadence.
 let controlBusy4151=false,controlNext4151=0,controlTimer4151;
 async function pollControl4151(){
  if(window.HAOnline422?.active())return;
  if(controlBusy4151||busy48||resetting48||!registered4151||ident48.sharing===false||document.hidden||!navigator.onLine||performance.now()<controlNext4151)return;
  controlBusy4151=true;const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),4000);let acknowledge=false;
  try{
   const before=window.controlAck415?.()??-1;
   const response=await fetch('/api/player/control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:ident48.id,token:ident48.token,resetVersion:ident48.resetVersion,controlClient:'4.17.0',controlAck:before,controlState:window.controlState415?.()??state}),signal:abort.signal});
   if(!response.ok){if(response.status===403)window.clearControl415?.();if(response.status===429)controlNext4151=performance.now()+5000;throw Error('control sync');}
   const d=await response.json();
   if(d.resetRequired){if(Number.isInteger(d.resetVersion)&&d.resetVersion>=0)clearProgress48(d.resetVersion);}
   else{window.receiveControl415?.(d.control);acknowledge=(window.controlAck415?.()??-1)!==before;}
  }catch{}finally{clearTimeout(timeout);controlBusy4151=false;if(acknowledge)setTimeout(pollControl4151,0);}
 }
 // An admin tab in the same browser can wake the poll immediately. Other browser
 // profiles/devices receive changes on the next one-second poll, without reload.
 let controlChannel4151;try{controlChannel4151=new BroadcastChannel('arena-control-4151');controlChannel4151.onmessage=e=>{if(e.data?.id===ident48.id)pollControl4151()};}catch{}
 window.addEventListener('online',pollControl4151);document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollControl4151()});
 controlTimer4151=setInterval(pollControl4151,1000);
 window.syncBrowser48=sync48;
 const oldSave48=save;save=function(){mergeGifts49();oldSave48();clearTimeout(timer48);timer48=setTimeout(sync48,1600)};
 const oldSim48=simulate;simulate=function(dt){if(state==='playing')saved.playSeconds48=(saved.playSeconds48||0)+Math.min(dt,.05);oldSim48(dt)};
 const oldFinish48=finish;finish=function(){const was=state;oldFinish48();if(was!=='finished'&&state==='finished'){saved.lastResult48=`${score[0]} : ${score[1]}`;save()}};
 const oldSettingsBrowser48=showSettings;showSettings=function(from='home'){oldSettingsBrowser48(from);const panel=document.querySelector('#screen .screen-body')||document.querySelector('#screen');const el=document.createElement('section');el.className='browser-settings48';el.innerHTML=`<h3>Profil browser</h3><p>Progres dan koin dilaporkan ke dashboard admin situs ini. Bukan identitas orang atau dompet server. Reset dan hadiah admin berlaku saat browser ini kembali online dengan berbagi progres aktif. Item hadiah masuk inventori, tidak dipasang otomatis.</p><label>Nama panggilan opsional<input id="browserAlias48" maxlength="32" placeholder="Browser ${ident48.id.slice(0,6)}"></label><label class="browser-share48"><input id="browserShare48" type="checkbox" ${ident48.sharing!==false?'checked':''}> Bagikan progres ke dashboard</label><small id="browserStatus48"></small>`;panel.append(el);const input=el.querySelector('#browserAlias48');input.value=ident48.alias||'';input.onchange=()=>{ident48.alias=input.value.trim().slice(0,32);remember48();sync48()};el.querySelector('#browserShare48').onchange=e=>{ident48.sharing=e.target.checked;if(!ident48.sharing)window.clearControl415?.();remember48();sync48()};el.querySelector('#browserStatus48').textContent=window.browserStatus48+' · ID '+ident48.id.slice(0,8);
 const inbox=document.createElement('section');inbox.className='gift-inbox49';const gifts=window.giftInbox49().slice(0,20);inbox.innerHTML='<h3>Hadiah dari admin</h3><p>Hadiah yang sudah diterima tersimpan di browser ini.</p><ul>'+gifts.map(g=>{const item=BOOTS.find(x=>x.id===g.item)||catalog.find(x=>x.id===g.item);const label=g.kind==='coins'?Number(g.amount).toLocaleString('id-ID')+' koin':item?.name||(g.item?.startsWith('skill-')?skillDef(g.item.slice(6)).name:g.item);return '<li><b>'+esc(label)+'</b>'+(g.message?'<br>'+esc(g.message):'')+'<br><small>'+esc(new Date(g.received).toLocaleString('id-ID'))+'</small></li>';}).join('')+'</ul>'+(gifts.length?'':'<small>Belum ada hadiah. Hadiah offline diterima setelah tersambung kembali.</small>');panel.append(inbox);};
 window.addEventListener('pagehide',persist48);window.addEventListener('online',sync48);document.addEventListener('visibilitychange',()=>{persist48();if(!document.hidden)sync48()});window.addEventListener('storage',e=>{if(e.key===ID48){const x=safeRead48(ID48);if(x?.id===ident48.id&&x.resetVersion>ident48.resetVersion){ident48=x;clearProgress48(x.resetVersion)}else if(x?.id===ident48.id){ident48=x;if(ident48.sharing===false)window.clearControl415?.();}}});
 setTimeout(sync48,3500);setInterval(sync48,5000);
}
