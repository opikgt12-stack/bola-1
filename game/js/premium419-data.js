'use strict';
window.PREMIUM419=[
 {id:'vector',name:'Thunderstep',price:10000,color:'#68edda',duration:4,speed:1.22,shot:1.30,jump:1.08,reach:1.08,recovery:.90,radius:130,tag:'OVERDRIVE',description:'Dash listrik beruntun dan tendangan bermuatan. Ledakan akselerasi membantumu merebut bola.'},
 {id:'resonance',name:'Sonic Rupture',price:18000,color:'#70c8ff',duration:5,speed:1.34,shot:1.50,jump:1.13,reach:1.13,recovery:.82,radius:165,tag:'RESONANSI',description:'Gelombang sonik berkala mendorong dan memperlambat lawan terdekat. Tekanan area untuk membuka ruang.'},
 {id:'chrono',name:'Chrono Eclipse',price:28000,color:'#c4a1ff',duration:6,speed:1.46,shot:1.75,jump:1.18,reach:1.18,recovery:.74,radius:200,tag:'DISTORSI WAKTU',description:'Medan waktu menghambat lawan dan memperlambat bola yang mendekat. Kendalikan tempo sebelum menyerang.'},
 {id:'gravity',name:'Event Horizon',price:42000,color:'#fa8fca',duration:7,speed:1.58,shot:2.00,jump:1.23,reach:1.23,recovery:.66,radius:235,tag:'GRAVITASI',description:'Vortex menarik bola secara bertahap ke area kaki. Akhiri penguasaan dengan tendangan gravitasi yang kuat.'},
 {id:'bastion',name:'Aegis Solaris',price:65000,color:'#ffd67d',duration:8,speed:1.70,shot:2.35,jump:1.28,reach:1.28,recovery:.58,radius:270,tag:'BENTENG ASTRAL',description:'Perisai surya memantulkan bola masuk dari jarak dekat. Gravitasi dan tendangan api memperkuat serangan balik.'},
 {id:'singularity',name:'Omega Singularity',price:100000,color:'#f0fbff',duration:9,speed:1.85,shot:2.80,jump:1.34,reach:1.34,recovery:.50,radius:310,tag:'ULTIMATE',description:'Gravitasi, distorsi waktu, perisai, dan denyut orbit bergabung. Tembakan ultimate dilepaskan melalui kontak bola.'}
].map((s,i)=>({...s,tier:i+1,icon:'assets/skills/'+s.id+'420.webp',enabled:true}));
