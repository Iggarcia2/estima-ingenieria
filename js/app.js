/* ESTIMA · js/app.js · proyecto estático sin compilación */
function handleAction(action){if(action==='print'){printReport();return;}if(action==='csv'){exportCSV();return;}if(action==='save'){exportJSON();return;}if(action==='load'){document.getElementById('loadJsonFile').click();return;}if(action==='reset'){if(confirm('¿Restablecer el proyecto, las selecciones y las tarifas a valores de ejemplo?')){state=initialState();persist();render();}return;}
 if(action==='clear-overrides'){if(confirm('¿Restablecer todas las cantidades, ratios y factores editados?'))mutate(()=>{state.overrides={};});return;}
 if(action==='all-visible'){mutate(()=>{for(const r of visibleRatios())toggleSelected(r.id,true);});return;}
 if(action==='none-visible'){mutate(()=>{for(const r of visibleRatios())toggleSelected(r.id,false);});return;}
 if(action.startsWith('mode:')){activeResultTab=action.endsWith('detallado')?'entregables':'resumen';mutate(()=>{state.mode=action.slice(5);});return;}
}
document.addEventListener('input',e=>{const el=e.target;if(!el.matches('[data-key]'))return;if(el.type==='checkbox')return;const key=el.dataset.key;mutate(()=>updateKey(key,el.value));});
document.addEventListener('change',e=>{const el=e.target;
 if(el.id==='loadJsonFile'){const f=el.files?.[0];if(!f)return;f.text().then(t=>{try{const data=JSON.parse(t);if(data.app!=='estimador_ingenieria_v1'||!data.state)throw Error('Formato de proyecto no reconocido');if(data.libraryVersion!==LIB.version&&!confirm('La versión de la biblioteca no coincide. ¿Querés abrir igual la configuración?'))return;state=mergeState(initialState(),data.state);persist();render();}catch(err){alert('No se pudo abrir el archivo: '+err.message);}el.value='';});return;}
 if(el.dataset.check){const type=el.dataset.check,id=el.dataset.id;mutate(()=>{if(type==='disc')state.disc[id]=el.checked;else if(type==='stage'&&STAGE_ORDER.includes(id)){state.stages[id]=el.checked;state.stageSelection='manual';}else if(type==='selected')toggleSelected(id,el.checked);else if(type==='onlySelected')state.onlySelected=el.checked;});return;}
 if(el.dataset.select==='family'){mutate(()=>{const choice=el.value,config=FAMILIES[choice];if(!config)return;state.family=choice;state.metrics={...config.metrics};state.disc=Object.fromEntries(DISC.map(d=>[d.id,config.disc.includes(d.id)]));});return;}
 if(el.dataset.select==='baseline'){mutate(()=>{state.baseline=el.value in BASELINE_LABEL?el.value:'ninguna';if(STAGE_ORDER.indexOf(state.target)<=STAGE_ORDER.indexOf(state.baseline))state.target=STAGE_ORDER[STAGE_ORDER.indexOf(state.baseline)+1]||'detalle';updateStages();});return;}
 if(el.dataset.select==='target'){mutate(()=>{const t=el.value;if(STAGE_ORDER.includes(t)&&STAGE_ORDER.indexOf(t)>STAGE_ORDER.indexOf(state.baseline)){state.target=t;updateStages();}});return;}
 if(el.dataset.select==='currency'){mutate(()=>{state.currency=el.value==='ARS'?'ARS':'USD';});return;}
});
document.addEventListener('click',e=>{const btn=e.target.closest('[data-action]');if(btn)handleAction(btn.dataset.action);});
async function startApp(){
 const response=await fetch('./data/biblioteca_ratios.json',{cache:'no-cache'});
 if(!response.ok)throw new Error('No se pudo abrir la biblioteca de ratios (HTTP '+response.status+').');
 const library=await response.json();
 if(!library||!Array.isArray(library.ratios)||!library.fuentes)throw new Error('La biblioteca de ratios no tiene un formato válido.');
 LIB=library; RATIOS=LIB.ratios; BY_ID=Object.fromEntries(RATIOS.map(r=>[r.id,r]));
 state=initialState();
 try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)state=mergeState(initialState(),JSON.parse(saved));}
 catch(err){console.warn('No se pudo cargar el proyecto guardado',err);}
 render();
}
startApp().catch(error=>{
 console.error(error);
 const errorMarkup='<div style="max-width:750px;margin:48px auto;padding:24px;background:#18181b;border:1px solid #f59e0b;border-radius:8px"><h2 style="color:#f59e0b">No se pudo iniciar ESTIMA</h2><p>'+esc(error.message)+'</p><p>Para trabajar con archivos separados, abrí el sitio con un servidor HTTP (por ejemplo, GitHub Pages o <code>python -m http.server 8000</code>). No funciona abriendo <code>index.html</code> directamente con <code>file://</code>.</p></div>';
 document.getElementById('screen').innerHTML=errorMarkup;
 document.getElementById('calcStatus').textContent='Error de carga';
});
