'use strict';
// One bounded poll chain, active only in visible tabs. Dashboard never loads this file.
(()=>{if(new URLSearchParams(location.search).get('avatarPreview45')==='1')return;
 const showing=document.body.dataset.maintenance==='true';let busy=false,timer;
 async function check(){if(busy||document.hidden)return;busy=true;clearTimeout(timer);const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(),8000);
  try{const r=await fetch('api.php?action=status',{cache:'no-store',credentials:'same-origin',signal:controller.signal});if(!r.ok)return;const d=await r.json();if(typeof d.maintenance?.enabled!=='boolean')return;
   if(d.maintenance.enabled!==showing){if(!showing&&typeof state!=='undefined'){state='paused';keys={};}location.reload();}
  }catch{}finally{clearTimeout(deadline);busy=false;timer=setTimeout(check,15000);}
 }
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});check();
})();
