/* ESTIMA · js/config.js · proyecto estático sin compilación */
"use strict";
let LIB;
let RATIOS;
let BY_ID;
const STORAGE_KEY = 'estimador_ingenieria_v1_estado';
const DISC = [
 {id:'PRO',name:'Procesos',short:'Procesos',color:'#467ca9'},
 {id:'CIV',name:'Civil y arquitectura',short:'Civil',color:'#628da8'},
 {id:'EST',name:'Estructuras',short:'Estructuras',color:'#426f8d'},
 {id:'MEC',name:'Mecánica y equipos',short:'Mecánica',color:'#608a70'},
 {id:'PIP',name:'Cañerías / piping',short:'Piping',color:'#b78e56'},
 {id:'ELE',name:'Electricidad',short:'Electricidad',color:'#b3a14c'},
 {id:'INS',name:'Instrumentación y control',short:'Control',color:'#8f7cb5'},
 {id:'HSE',name:'Seguridad y medio ambiente',short:'HSE',color:'#c07470'},
 {id:'GES',name:'Gestión de ingeniería',short:'Gestión',color:'#65798e'}
];
const STAGE_LABEL={conceptual:'Conceptual',basica:'Básica',detalle:'Detalle'};
const STAGE_ORDER=['conceptual','basica','detalle'];
const BASELINE_LABEL={ninguna:'No hay ingeniería previa aprobada',conceptual:'Conceptual existente y validada',basica:'Básica existente y validada'};
const STAGE_EXPLAIN={
 conceptual:{purpose:'Definir qué conviene hacer',items:'Criterios iniciales, alternativas, esquemas, implantación y predimensionamiento.',examples:'BFD, estudio de alternativas, implantación conceptual, HAZID preliminar.'},
 basica:{purpose:'Definir cómo será el proyecto',items:'Bases de diseño, memorias principales, diagramas, selección técnica y disposiciones generales.',examples:'PFD, P&ID preliminar, cálculo estructural global, hojas de datos, unifilar preliminar.'},
 detalle:{purpose:'Definir cómo ejecutar el diseño',items:'Cálculos finales, planos para construcción, especificaciones definitivas y documentación de montaje.',examples:'Planos de fundaciones, detalles de uniones, isométricos, lazos, planos eléctricos finales.'}
};
function computeStageSet(baseline,target){const b=baseline==='ninguna'?-1:STAGE_ORDER.indexOf(baseline),t=STAGE_ORDER.indexOf(target);return Object.fromEntries(STAGE_ORDER.map((k,i)=>[k,i>b&&i<=t]));}
function updateStages(){state.stages=computeStageSet(state.baseline,state.target);state.stageSelection='auto';}
function stageInfoText(){const included=STAGE_ORDER.filter(k=>state.stages[k]).map(k=>STAGE_LABEL[k]);return included.length?included.join(' + '):'Ninguna (punto de partida igual o superior al objetivo)';}

const ROLE_LABEL={lider:'Líder / senior',ingeniero:'Ingeniero',proyectista:'Proyectista',cad:'CAD / BIM',revisor:'Revisión / QA',gestion:'Coordinación'};
const METRICS=[
 ['area','Nave / galpón','m²'],['concrete','Hormigón / fundaciones','m³'],['steel','Estructura metálica','t'],
 ['equipment','Equipos principales','unid.'],['mass','Peso de equipos','t'],['lines','Líneas de tubería','unid.'],
 ['pid','P&IDs estimados','unid.'],['power','Potencia instalada','kW'],['boards','Tableros eléctricos','unid.'],
 ['circuits','Circuitos eléctricos','unid.'],['instruments','Instrumentos','unid.'],['loops','Lazos de control','unid.'],['io','Señales I/O','unid.']
];
const FAMILIES={
 industrial:{label:'Planta industrial multidisciplinaria',disc:['PRO','CIV','EST','MEC','PIP','ELE','INS','HSE','GES'],metrics:{area:1500,concrete:200,steel:35,equipment:15,mass:55,lines:40,pid:6,power:500,boards:4,circuits:40,instruments:70,loops:28,io:100}},
 galpon:{label:'Galpón / estructura industrial',disc:['CIV','EST','ELE','HSE','GES'],metrics:{area:1800,concrete:180,steel:90,equipment:0,mass:0,lines:0,pid:0,power:120,boards:2,circuits:16,instruments:0,loops:0,io:0}},
 electromecanico:{label:'Ampliación electromecánica',disc:['CIV','EST','MEC','PIP','ELE','INS','HSE','GES'],metrics:{area:400,concrete:50,steel:12,equipment:12,mass:35,lines:25,pid:3,power:300,boards:3,circuits:24,instruments:35,loops:14,io:50}},
 piping:{label:'Instalación de cañerías y servicios',disc:['PRO','MEC','PIP','INS','HSE','GES'],metrics:{area:0,concrete:0,steel:0,equipment:4,mass:6,lines:20,pid:3,power:0,boards:0,circuits:0,instruments:12,loops:5,io:18}},
 personalizado:{label:'Proyecto personalizado',disc:['CIV','EST','GES'],metrics:{area:600,concrete:60,steel:20,equipment:0,mass:0,lines:0,pid:0,power:0,boards:0,circuits:0,instruments:0,loops:0,io:0}}
};
const DEFAULT_SELECTED = new Set(('PRO-001 PRO-003 PRO-004 PRO-005 PRO-006 PRO-007 PRO-008 CIV-001 CIV-003 CIV-004 CIV-005 CIV-006 CIV-007 EST-001 EST-002 EST-003 EST-004 EST-005 EST-006 MEC-001 MEC-002 MEC-003 MEC-004 MEC-005 PIP-001 PIP-003 PIP-004 PIP-006 PIP-007 PIP-008 PIP-009 PIP-010 PIP-011 ELE-001 ELE-002 ELE-004 ELE-005 ELE-006 ELE-008 INS-001 INS-002 INS-003 INS-005 INS-006 INS-007 INS-008 INS-009 HSE-001 HSE-002 HSE-003 HSE-004 GES-001 GES-002 GES-003 GES-005').split(' '));
function initialState(){return {project:'Proyecto industrial — estimación preliminar',description:'Desarrollo de ingeniería de instalaciones industriales. Alcance preliminar sujeto a validación.',family:'industrial',mode:'rapido',currency:'USD',rate:35,baseline:'ninguna',target:'detalle',stages:{conceptual:true,basica:true,detalle:true},disc:Object.fromEntries(DISC.map(d=>[d.id,true])),metrics:{...FAMILIES.industrial.metrics},selected:Object.fromEntries(RATIOS.map(r=>[r.id,DEFAULT_SELECTED.has(r.id)])),overrides:{},filter:'',onlySelected:false,qualityInfo:false,stageSelection:'auto',created:new Date().toISOString()};}
function mergeState(base,raw){
 if(!raw||typeof raw!=='object')return base;
 const s={...base,...raw};
 s.disc={...base.disc,...(raw.disc&&typeof raw.disc==='object'?raw.disc:{})};
 s.baseline=['ninguna','conceptual','basica'].includes(raw.baseline)?raw.baseline:'ninguna';
 s.target=STAGE_ORDER.includes(raw.target)?raw.target:'detalle';
 if(STAGE_ORDER.indexOf(s.target)<=STAGE_ORDER.indexOf(s.baseline))s.target=STAGE_ORDER[STAGE_ORDER.indexOf(s.baseline)+1]||'detalle';
 // Preserve manual independent choices, including non-contiguous stages.
 s.stages=raw.stages&&typeof raw.stages==='object'
   ?Object.fromEntries(STAGE_ORDER.map(k=>[k,!!raw.stages[k]]))
   :computeStageSet(s.baseline,s.target);
 s.stageSelection=raw.stageSelection==='manual'?'manual':'auto';
 s.metrics={...base.metrics,...(raw.metrics&&typeof raw.metrics==='object'?raw.metrics:{})};
 s.selected={...base.selected,...(raw.selected&&typeof raw.selected==='object'?raw.selected:{})};
 s.overrides=raw.overrides&&typeof raw.overrides==='object'?raw.overrides:{};
 s.family=FAMILIES[s.family]?s.family:'industrial';
 s.mode=s.mode==='detallado'?'detallado':'rapido';
 s.currency=s.currency==='ARS'?'ARS':'USD';
 s.rate=safeNum(s.rate,35,0,1000000000);
 return s;
}
let state; // initialized after fetching data/biblioteca_ratios.json
function safeNum(v,fallback=0,min=0,max=10000000){const n=typeof v==='string'?Number(v.replace(',','.')):Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function format(v,d=1){return new Intl.NumberFormat('es-AR',{maximumFractionDigits:d,minimumFractionDigits:0}).format(Number(v)||0);}
function money(v){const sym=state.currency==='USD'?'US$':'ARS $';return sym+' '+format(v,0);}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.warn('Sin guardado local',e);}}
