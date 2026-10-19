/* ESTIMA · js/app.js · proyecto estático sin compilación */
function downloadCalibration(){
 downloadText('calibracion.json',JSON.stringify({...CALIBRATION,updatedAt:new Date().toISOString()},null,2),'application/json;charset=utf-8');
}
function promoteProjectRates(){
 let count=0;
 for(const [id,o] of Object.entries(state.overrides)){
  if(!Object.hasOwn(BY_ID,id)||o.rate===undefined)continue;
  CALIBRATION.rateOverrides[id]=safeNum(o.rate,0,0,1e6);
  delete o.rate; if(!Object.keys(o).length)delete state.overrides[id];count++;
 }
 persistCalibration();persist();render();
 alert(count?`Se fijaron ${count} ratios unitarios como calibración general en ESTE navegador. Para usarlos como predeterminados en GitHub, descargá calibracion.json y actualizá data/calibracion.json.`:'No hay ratios unitarios particulares para convertir en generales. En modo detallado, editá la columna H/H unitarias primero.');
}
function restorePublishedCalibration(){
 if(!confirm('¿Volver a los valores de calibración publicados en GitHub? Esto reemplazará los ajustes globales de este navegador; no cambiará las cantidades del proyecto.'))return;
 CALIBRATION=mergeCalibration(PUBLISHED_CALIBRATION);persistCalibration();render();
}
function handleAction(action){if(action==='cal-export'){downloadCalibration();return;}if(action==='cal-import'){document.getElementById('loadCalFile').click();return;}if(action==='cal-publish-rates'){promoteProjectRates();return;}if(action==='cal-reset'){restorePublishedCalibration();return;}if(action==='print'){printReport();return;}if(action==='csv'){exportCSV();return;}if(action==='save'){exportJSON();return;}if(action==='load'){document.getElementById('loadJsonFile').click();return;}if(action==='reset'){if(confirm('¿Restablecer el proyecto, las selecciones y las tarifas a valores de ejemplo?')){state=initialState();persist();render();}return;}
 if(action==='activar-3d'){
  // Agregar modelado NO debe sustituir entregables manuales: esa sustitución
  // puede bajar las H/H cotizadas sin que el usuario lo advierta.
  mutate(()=>{
    if(state.model3d==='ninguno')state.model3d='parcial';
    for(const r of RATIOS){
      if(!r.actividad_modelado_3d||!state.disc[r.disciplina]||!stageEligible(r))continue;
      // Son rutas alternativas para emitir el mismo documento. Si ya existe
      // el método manual, lo respetamos y omitimos la alternativa automática.
      if(r.id==='PIP-006'&&state.selected['PIP-005'])continue;
      if(r.id==='PIP-011'&&state.selected['PIP-012'])continue;
      state.selected[r.id]=true;
    }
  });
  activeResultTab='entregables';render();return;
 }
 if(action==='clear-overrides'){if(confirm('¿Restablecer todas las cantidades, ratios y factores editados?'))mutate(()=>{state.overrides={};});return;}
 if(action==='all-visible'){mutate(()=>{for(const r of visibleRatios())toggleSelected(r.id,true);});return;}
 if(action==='none-visible'){mutate(()=>{for(const r of visibleRatios())toggleSelected(r.id,false);});return;}
 if(action.startsWith('mode:')){activeResultTab=action.endsWith('detallado')?'entregables':'resumen';mutate(()=>{state.mode=action.slice(5);});return;}
}
document.addEventListener('input',e=>{const el=e.target;if(!el.matches('[data-key]'))return;if(el.type==='checkbox')return;const key=el.dataset.key;if(key.startsWith('calphys:')||key.startsWith('caldriver:'))return;mutate(()=>updateKey(key,el.value));});
document.addEventListener('change',e=>{const el=e.target;
 if(el.dataset?.key&&(el.dataset.key.startsWith('calphys:')||el.dataset.key.startsWith('caldriver:'))){mutate(()=>updateKey(el.dataset.key,el.value));return;}
 if(el.id==='loadCalFile'){const f=el.files?.[0];if(!f)return;f.text().then(t=>{try{
 const obj=JSON.parse(t);if(obj.schema!=='estima_calibracion_v1')throw Error('Archivo no es una calibración ESTIMA válida');
 if(!confirm('¿Cargar esta calibración y sustituir los valores generales de este navegador?'))return;
 CALIBRATION=mergeCalibration(obj);persistCalibration();render();
 }catch(err){alert('Error al importar calibración: '+err.message);}finally{el.value='';}});return;}
 if(el.id==='loadJsonFile'){const f=el.files?.[0];if(!f)return;f.text().then(t=>{try{const data=JSON.parse(t);if(data.app!=='estimador_ingenieria_v1'||!data.state)throw Error('Formato de proyecto no reconocido');if(data.libraryVersion!==LIB.version&&!confirm('La versión de la biblioteca no coincide. ¿Querés abrir igual la configuración?'))return;state=mergeState(initialState(),data.state);persist();render();}catch(err){alert('No se pudo abrir el archivo: '+err.message);}el.value='';});return;}
 if(el.dataset.check){const type=el.dataset.check,id=el.dataset.id;mutate(()=>{if(type==='disc')state.disc[id]=el.checked;else if(type==='stage'&&STAGE_ORDER.includes(id)){state.stages[id]=el.checked;state.stageSelection='manual';}else if(type==='selected')toggleSelected(id,el.checked);else if(type==='onlySelected')state.onlySelected=el.checked;});return;}
 if(el.dataset.select==='family'){mutate(()=>{const choice=el.value,config=FAMILIES[choice];if(!config)return;state.family=choice;state.metrics={...config.metrics};state.disc=Object.fromEntries(DISC.map(d=>[d.id,config.disc.includes(d.id)]));});return;}
 if(el.dataset.select==='baseline'){mutate(()=>{state.baseline=el.value in BASELINE_LABEL?el.value:'ninguna';if(STAGE_ORDER.indexOf(state.target)<=STAGE_ORDER.indexOf(state.baseline))state.target=STAGE_ORDER[STAGE_ORDER.indexOf(state.baseline)+1]||'detalle';updateStages();});return;}
 if(el.dataset.select==='target'){mutate(()=>{const t=el.value;if(STAGE_ORDER.includes(t)&&STAGE_ORDER.indexOf(t)>STAGE_ORDER.indexOf(state.baseline)){state.target=t;updateStages();}});return;}
 if(el.dataset.select==='basicScope'){mutate(()=>{state.basicScope=el.value==='extendida'?'extendida':'convencional';});return;}
 if(el.dataset.select==='model3d'){mutate(()=>{state.model3d=Object.hasOwn(MODEL_SCOPES,el.value)?el.value:'ninguno';});return;}
 if(el.dataset.select==='lod'){mutate(()=>{state.lod=['definir','200','300','350','400'].includes(el.value)?el.value:'definir';});return;}
 if(el.dataset.select==='currency'){mutate(()=>{state.currency=el.value==='ARS'?'ARS':'USD';});return;}
});
document.addEventListener('click',e=>{const btn=e.target.closest('[data-action]');if(btn)handleAction(btn.dataset.action);});
async function startApp(){
 const response=await fetch('./data/biblioteca_ratios.json',{cache:'no-cache'});
 if(!response.ok)throw new Error('No se pudo abrir la biblioteca de ratios (HTTP '+response.status+').');
 const library=await response.json();
 if(!library||!Array.isArray(library.ratios)||!library.fuentes)throw new Error('La biblioteca de ratios no tiene un formato válido.');
 LIB=library; RATIOS=LIB.ratios; BY_ID=Object.fromEntries(RATIOS.map(r=>[r.id,r]));
 let published=defaultCalibration();
 try {const calResponse=await fetch('./data/calibracion.json',{cache:'no-cache'});
  if(calResponse.ok)published=mergeCalibration(await calResponse.json());
  else console.warn('No se encontró data/calibracion.json: se usarán valores originales.');
 }catch(err){console.warn('No se pudo leer calibración publicada:',err);}
 PUBLISHED_CALIBRATION=structuredClone(published);CALIBRATION=published;
 try {const stored=localStorage.getItem(CALIBRATION_KEY);if(stored)CALIBRATION=mergeCalibration(JSON.parse(stored));}
 catch(err){console.warn('No se pudo recuperar calibración local:',err);}

 state=initialState();
 try{const saved=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('estimador_ingenieria_v1_estado');if(saved)state=mergeState(initialState(),JSON.parse(saved));}
 catch(err){console.warn('No se pudo cargar el proyecto guardado',err);}
 render();
}
startApp().catch(error=>{
 console.error(error);
 const errorMarkup='<div style="max-width:750px;margin:48px auto;padding:24px;background:#18181b;border:1px solid #f59e0b;border-radius:8px"><h2 style="color:#f59e0b">No se pudo iniciar ESTIMA</h2><p>'+esc(error.message)+'</p><p>Para trabajar con archivos separados, abrí el sitio con un servidor HTTP (por ejemplo, GitHub Pages o <code>python -m http.server 8000</code>). No funciona abriendo <code>index.html</code> directamente con <code>file://</code>.</p></div>';
 document.getElementById('screen').innerHTML=errorMarkup;
 document.getElementById('calcStatus').textContent='Error de carga';
});
