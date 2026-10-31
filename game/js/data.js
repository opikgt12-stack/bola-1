'use strict';
const FACE_SOURCES=['assets/face0.png','assets/face1.png'];
const ROSTER=[
{name:'Custom 01',skin:'#dca979',hair:'#302822',style:0,pace:1,shot:1,jump:1,tag:'CUSTOM'},
{name:'Custom 02',skin:'#d7b28d',hair:'#202831',style:0,pace:1,shot:1,jump:1,tag:'CUSTOM'},
{name:'ACE',skin:'#e8bc93',hair:'#202b3c',style:0,pace:1.04,shot:1.02,jump:.98,tag:'STRIKER'},
{name:'BOLT',skin:'#986744',hair:'#171d28',style:1,pace:1.08,shot:.98,jump:1.01,tag:'SPEEDSTER'},
{name:'KAI',skin:'#edc7a6',hair:'#e9e1ce',style:2,pace:1.01,shot:1.02,jump:1.07,tag:'AERIAL'},
{name:'NEO',skin:'#d5a17b',hair:'#243e56',style:3,pace:1.03,shot:1.06,jump:.97,tag:'POWER'},
{name:'LUNA',skin:'#e1b490',hair:'#9b6cbc',style:4,pace:1.04,shot:1,jump:1.05,tag:'TECHNICAL'},
{name:'RIO',skin:'#b77950',hair:'#272729',style:5,pace:1.07,shot:1.02,jump:.99,tag:'DRIBBLER'},
{name:'AXEL',skin:'#f0ccad',hair:'#c16a35',style:1,pace:.98,shot:1.08,jump:1.02,tag:'POWER'},
{name:'VEGA',skin:'#b68d6e',hair:'#2e2444',style:4,pace:1,shot:1.05,jump:1.04,tag:'ALL-ROUNDER'},
{name:'NOAH',skin:'#dfb58d',hair:'#c8a565',style:2,pace:1.02,shot:1,jump:1.08,tag:'AERIAL'},
{name:'ZANE',skin:'#865c40',hair:'#171d27',style:3,pace:1.06,shot:1.04,jump:.99,tag:'STRIKER'},
{name:'LEO',skin:'#e8b494',hair:'#564032',style:5,pace:1.03,shot:1.07,jump:.98,tag:'FINISHER'},
{name:'SORA',skin:'#edc9b2',hair:'#3d3755',style:0,pace:1.07,shot:.98,jump:1.06,tag:'SPEEDSTER'},
{name:'KODA',skin:'#c6926e',hair:'#c6cbd8',style:1,pace:.99,shot:1.08,jump:1.03,tag:'POWER'},
{name:'NOVA',skin:'#e6b69a',hair:'#c36386',style:4,pace:1.02,shot:1.02,jump:1.08,tag:'AERIAL'},
{name:'ATLAS',skin:'#8b654c',hair:'#252d36',style:5,pace:1,shot:1.07,jump:1.03,tag:'DEFENDER'},
{name:'JUNO',skin:'#d6a88d',hair:'#6b4b39',style:2,pace:1.05,shot:1.04,jump:1.01,tag:'PLAYMAKER'}];
const ARENAS=[
{id:'night',name:'Nightfall',sky:['#0c1934','#344d6e'],pitch:'#34736c',color:'#91b8ff',weather:'clear'},
{id:'sunset',name:'Sunset Bay',sky:['#653d65','#edac7c'],pitch:'#44786c',color:'#ffb780',weather:'clear'},
{id:'ice',name:'Arctic Park',sky:['#254b69','#91becd'],pitch:'#74aeb3',color:'#a7edff',weather:'snow'},
{id:'neon',name:'Neon District',sky:['#1c123c','#543c7c'],pitch:'#365578',color:'#cb9cff',weather:'rain'},
{id:'desert',name:'Desert Dome',sky:['#926051','#eac38b'],pitch:'#818f60',color:'#f5cf8d',weather:'clear'},
{id:'world',name:'World Final',sky:['#0b2242','#516c91'],pitch:'#317656',color:'#f4d27a',weather:'clear'}];
const NATIONS=[
['ID','Indonesia','#ef5b65'],['BR','Brasil','#f3d35e'],['AR','Argentina','#91d4ef'],['FR','Prancis','#6384ec'],['ES','Spanyol','#e96a55'],['DE','Jerman','#e0e5ed'],['PT','Portugal','#ce4e61'],['GB','Inggris','#eceff4'],['NL','Belanda','#ff9b50'],['IT','Italia','#5896f2'],['BE','Belgia','#e05f60'],['HR','Kroasia','#d96875'],['UY','Uruguay','#84c7f0'],['CO','Kolombia','#f4d45f'],['US','Amerika Serikat','#b5c7ea'],['MX','Meksiko','#4cb68c'],['JP','Jepang','#6a96f1'],['KR','Korea Selatan','#ed6a78'],['AU','Australia','#efcd59'],['MA','Maroko','#d85861'],['SN','Senegal','#5cbc80'],['NG','Nigeria','#75cf99'],['GH','Ghana','#e6d473'],['CM','Kamerun','#5ebc82'],['EG','Mesir','#de7166'],['SA','Arab Saudi','#6eb995'],['IR','Iran','#e8edf0'],['CA','Kanada','#ec6871'],['CH','Swiss','#e7666d'],['DK','Denmark','#d45969'],['SE','Swedia','#e8ca63'],['TR','Turki','#e46470']].map(([id,name,color],i)=>({id,name,color,avatar:2+i%16,flag:String.fromCodePoint(...id.split('').map(c=>127397+c.charCodeAt(0)))}));
const WC_ROUNDS=['16 BESAR','PEREMPAT FINAL','SEMI-FINAL','FINAL'];
