/* ESTIMA V6 · Cotización guiada en 5 pasos. No cambia el motor V5.
   Vista avanzada accesible en cualquier momento; el mismo state alimenta ambas. */
let wizardActive=true;
let wizardStep=1;
let wizardEditRatios=false;
const WIZARD_STEPS=[
 {name:'Proyecto',subtitle:'Qué vamos a desarrollar',glyph:'01'},
 {name:'Dimensiones',subtitle:'Qué tamaño tiene',glyph:'02'},
 {name:'Alcance',subtitle:'Qué trabajos incluimos',glyph:'03'},
 {name:'Horas y tarifa',subtitle:'Cómo se presupuestará',glyph:'04'},
 {name:'Propuesta',subtitle:'Revisar y exportar',glyph:'05'}
];
try{const last=Number(sessionStorage.getItem('estima_wizard_step'));if(last>=1&&last<=5)wizardStep=last;}catch{}
const renderV5=render;
function wizardNavTo(step){
 wizardStep=Math.min(5,Math.max(1,Number(step)||1));
 try{sessionStorage.setItem('estima_wizard_step',String(wizardStep));}catch{}
 render();
 const dashboard=document.getElementById('dashboard');if(dashboard)dashboard.scrollTop=0;
 if(window.innerWidth<850)document.querySelector('.wizardProgress')?.scrollIntoView({block:'start',behavior:'instant'});
}
function wizardField(name,value,field,help=''){
 return `<label class="wField"><span class="wFieldTitle">${name}</span>${field}${help?`<small>${help}</small>`:''}</label>`;
}
function wHelp(item){return `<span class="wInfo" title="${esc(item)}" aria-label="${esc(item)}">?</span>`;}
function wizStep1(){
 const stageInputs=STAGE_ORDER.map(k=>`<label class="wChoice"><input type="checkbox" data-check="stage" data-id="${k}" ${state.stages[k]?'checked':''}><span><strong>${STAGE_LABEL[k]}</strong><small>${esc(STAGE_EXPLAIN[k].purpose)}</small></span></label>`).join('');
 return `<div class="wHeading"><div class="wEyebrow">PASO 1 / 5</div><h1>Contanos qué proyecto vamos a cotizar</h1><p>Elegí el tipo de trabajo y las etapas de ingeniería. La calculadora sugiere un alcance que después podés ajustar.</p></div>
 <div class="wCard"><h2>Datos generales</h2><div class="wTwo">${wizardField('Nombre del proyecto',state.project,`<input class="textField" data-key="project" maxlength="140" value="${esc(state.project)}">`)}
 ${wizardField('Tipo de proyecto',state.family,`<select class="selectField" data-select="family">${Object.entries(FAMILIES).map(([id,c])=>`<option value="${id}" ${id===state.family?'selected':''}>${esc(c.label)}</option>`).join('')}</select>`,'Al cambiarlo se cargan cantidades de ejemplo y se actualizan las disciplinas sugeridas.')}</div>
 ${detailTag('wizard-description','Descripción del trabajo (opcional)',`<textarea class="textArea" data-key="description" maxlength="1400">${esc(state.description)}</textarea>`)}
 </div><div class="wCard"><h2>¿Qué ingeniería está disponible?</h2><p class="wMuted">Estas selecciones completan automáticamente las etapas. Podés modificarlas a mano.</p><div class="wTwo">
 ${wizardField('Documentación previa validada',state.baseline,`<select class="selectField" data-select="baseline">${Object.entries(BASELINE_LABEL).map(([id,txt])=>`<option value="${id}" ${id===state.baseline?'selected':''}>${esc(txt)}</option>`).join('')}</select>`)}
 ${wizardField('Etapa hasta la que se debe desarrollar',state.target,`<select class="selectField" data-select="target">${STAGE_ORDER.filter(x=>STAGE_ORDER.indexOf(x)>STAGE_ORDER.indexOf(state.baseline)).map(id=>`<option value="${id}" ${id===state.target?'selected':''}>${STAGE_LABEL[id]}</option>`).join('')}</select>`)}
 </div><div class="wChoiceGrid">${stageInputs}</div>
 ${state.stages.basica?wizardField('Nivel de ingeniería básica',state.basicScope,`<select class="selectField" data-select="basicScope"><option value="convencional" ${state.basicScope==='convencional'?'selected':''}>Básica convencional</option><option value="extendida" ${state.basicScope==='extendida'?'selected':''}>Básica extendida</option></select>`,'La básica extendida agrega documentos de mayor definición, no sustituye las horas de la básica convencional.'):''}
 <div class="wMiniNote">${state.stageSelection==='manual'?'Has ajustado las etapas manualmente.': 'Etapas propuestas automáticamente según la documentación disponible.'} ${STAGE_ORDER.filter(k=>state.stages[k]).length===0?'⚠ No hay ninguna etapa activa.':'Se puede seleccionar una sola o varias etapas.'}</div>
 ${detailTag('wizard-stageguide','¿Qué incluye cada etapa?',`<div class="wGuide">${Object.entries(STAGE_EXPLAIN).map(([id,info])=>`<p><strong>${esc(STAGE_LABEL[id])}:</strong> ${esc(info.purpose)}. ${esc(info.items)}</p>`).join('')}</div>`)}
 </div>`;
}
function wizMetric(id){const m=METRICS.find(x=>x[0]===id);if(!m||!metricVisible(id))return '';
 const helper=METRIC_HELP[id]||'';
 return `<label class="wMetric"><span>${esc(m[1])} ${wHelp(helper)}</span><div class="wNumber"><input type="number" min="0" step="any" class="numberField" data-key="metric:${id}" value="${esc(state.metrics[id]??0)}" aria-label="${esc(m[1])}"><span>${esc(m[2])}</span></div></label>`;}
function wizStep2(){
 const core=coreMetricIds.filter(metricVisible).map(wizMetric).join('');const others=extraMetricIds.filter(metricVisible).map(wizMetric).join('');
 return `<div class="wHeading"><div class="wEyebrow">PASO 2 / 5</div><h1>¿Qué dimensiones tiene?</h1><p>Completá solamente las magnitudes que conozcas. El programa estima cantidades de planos y actividades usando estas referencias.</p></div>
 <div class="wCaution">Los valores precargados son <b>ejemplos para probar</b>, no datos verificados de tu proyecto. Reemplazalos antes de presupuestar.</div>
 <div class="wCard"><div class="wBetween"><h2>Magnitudes principales</h2><button type="button" class="wTextBtn" data-wizard-action="clear-metrics">Poner cantidades en cero</button></div><div class="wMetricGrid">${core||'<p class="wMuted">Activá alguna disciplina para definir sus magnitudes.</p>'}</div>
 ${others?detailTag('wizard-moremetrics','Más cantidades (P&IDs, tableros e instrumentos)',`<div class="wMetricGrid">${others}</div>`):''}</div>
 <div class="wCard"><h2>¿Qué disciplinas participan?</h2><p class="wMuted">Están preseleccionadas según el tipo de proyecto. Desmarcá las que no correspondan.</p><div class="wDiscGrid">${DISC.map(d=>`<label class="wDisc"><input type="checkbox" data-check="disc" data-id="${d.id}" ${state.disc[d.id]?'checked':''}><span class="dot" style="background:${d.color}"></span>${esc(d.name)}</label>`).join('')}</div></div>
 <div class="wMiniNote">Las magnitudes sirven para sugerir trabajos de ingeniería, no horas de fabricación o de construcción. Si algo no aplica, colocá cero.</div>`;
}
function wizardScopeDisc(d,result){
 const all=RATIOS.filter(r=>r.disciplina===d.id&&stageEligible(r)&&modelEligible(r));
 if(!all.length)return '';
 const selected=all.filter(r=>state.selected[r.id]);const extra=all.filter(r=>!state.selected[r.id]);
 const byId=Object.fromEntries(result.rows.map(x=>[x.r.id,x]));
 const row=(r)=>{const x=byId[r.id];const q=x?.q??qty(r);return `<div class="wDocRow"><label class="wDocCheck"><input type="checkbox" data-check="selected" data-id="${r.id}" ${state.selected[r.id]?'checked':''}><span><strong>${esc(r.entregable)}</strong><small>${esc(STAGE_LABEL[r.etapa])} · ${format(q,2)} ${esc(r.unidad)} · ${r.clasificacion==='C'?'ratio provisional':'referencia B'}</small></span></label><span class="wDocHours">${format(x?.hh||0,1)} H/H</span></div>`;};
 const content=`${selected.map(row).join('')}${extra.length?detailTag('wizard-extra-'+d.id,`+ ${extra.length} trabajos opcionales no incluidos`,extra.map(row).join('')):''}`;
 return detailTag('wizard-disc-'+d.id,`<span class="wDiscSummary"><span class="dot" style="background:${d.color}"></span><b>${esc(d.name)}</b><small>${selected.length} seleccionados</small><strong>${format(result.byDisc[d.id]||0,1)} H/H</strong></span>`,content,'wDiscBlock');
}
function wizStep3(result){
 const disciplines=DISC.filter(d=>state.disc[d.id]);const selected3d=state.model3d!=='ninguno';
 return `<div class="wHeading"><div class="wEyebrow">PASO 3 / 5</div><h1>Definamos qué trabajos incluimos</h1><p>ESTIMA sugiere documentos por especialidad. Abrí cada disciplina para revisar o quitar trabajos que no formen parte de la propuesta.</p></div>
 <div class="wCard"><div class="wBetween"><h2>Entregables de ingeniería</h2><span class="wSubCounter">${result.rows.length} actividades · ${format(result.direct,1)} H/H directas</span></div>
 <div class="wMiniNote">Las tareas mostradas pueden pertenecer a distintas etapas. <b>Marcar o desmarcar modifica las horas inmediatamente.</b></div>
 ${disciplines.map(d=>wizardScopeDisc(d,result)).join('')||'<p class="wMuted">No hay disciplinas activas. Volvé al paso 2.</p>'}
 <div class="wBetween wDetailSwitch"><div><b>Ajustar cantidades y horas por documento</b><p class="wMuted">Para afinar la propuesta profesionalmente.</p></div><button type="button" class="button ${wizardEditRatios?'buttonPrimary':''}" data-wizard-action="detail">${wizardEditRatios?'Ocultar edición':'Editar H/H y cantidades'}</button></div>
 ${wizardEditRatios?`<div class="wDetailArea">${state.mode==='detallado'?'':`<p class="wCaution">Activá la edición detallada para usar valores distintos a los sugeridos.</p>`}${simpleMatrix(result)}</div>`:''}</div>
 <div class="wCard"><h2>¿Se requiere modelado 3D?</h2><p class="wMuted">Es opcional. Elegí el alcance y presioná Aplicar; el precio no cambia hasta esa confirmación.</p>${simple3D()}</div>`;
}
function wizStep4(result){
 const discColors=Object.fromEntries(DISC.map(d=>[d.id,d.color]));
 const roles=Object.fromEntries(Object.keys(ROLE_LABEL).map((id,i)=>[id,['#4a93b1','#749cc4','#5eae9c','#9489c4','#ddb26f','#b69791'][i]]));
 return `<div class="wHeading"><div class="wEyebrow">PASO 4 / 5</div><h1>Revisemos las horas y el precio</h1><p>Las horas se calculan a partir de documentos y actividades. Solo tenés que definir la tarifa promedio de ingeniería.</p></div>
 <div class="wCard"><h2>Tarifa y presupuesto</h2><div class="wTwo"><label class="wField"><span class="wFieldTitle">Precio promedio por H/H</span><input type="number" min="0" step="any" class="numberField" data-key="rate" value="${esc(state.rate)}"></label><label class="wField"><span class="wFieldTitle">Moneda</span><select class="selectField" data-select="currency"><option value="USD" ${state.currency==='USD'?'selected':''}>USD</option><option value="ARS" ${state.currency==='ARS'?'selected':''}>ARS</option></select></label></div><div class="wStats"><div><span>Horas directas</span><strong>${format(result.direct,1)}</strong></div><div><span>Gestión / indirectas</span><strong>${format(result.indirect,1)}</strong></div><div><span>Total H/H</span><strong>${format(result.total,1)}</strong></div><div><span>Presupuesto</span><strong>${money(result.budget)}</strong></div></div><p class="wMuted">Cambiar USD por ARS modifica solo la etiqueta; no convierte tipos de cambio. El presupuesto no incluye margen ni impuestos.</p></div>
 <div class="wTwoCol">${barPanel('Horas por disciplina',result.byDisc,discColors,result.total)}${barPanel('Horas por perfil',result.byRole,roles,result.total)}</div>
 <div class="wCard"><h2>Ajustes opcionales</h2>${detailTag('wizard-reviews','Rondas extra de comentarios del cliente',`<p class="wMuted">Las revisiones internas ya están contempladas en las H/H base. Estas rondas son adicionales.</p><div class="wTwo"><label class="wField"><span class="wFieldTitle">Cantidad de rondas</span>${fieldNum('clientRounds',state.clientRounds,0,1,'max="10"')}</label><label class="wField"><span class="wFieldTitle">Porcentaje por ronda (ej. 0,12 = 12%)</span>${fieldNum('roundFactor',state.roundFactor,0,0.01,'max="2"')}</label></div>`)}
 ${detailTag('wizard-calibration','Calibración de ratios y factores (avanzado)',`<p class="wMuted">Los ajustes generales se guardan en este navegador. Para publicarlos en todos los equipos exportá data/calibracion.json y subilo a GitHub.</p><button type="button" class="button" data-wizard-action="advanced-cal">Abrir calibración completa →</button>`)}
 </div>`;
}
function wizStep5(result){
 const byDisc=DISC.filter(d=>result.byDisc[d.id]>0);
 const levels=STAGE_ORDER.filter(id=>state.stages[id]).map(id=>STAGE_LABEL[id]).join(', ');
 const most=result.rows.filter(r=>r.hh>0).sort((a,b)=>b.hh-a.hh).slice(0,6);
 const summaryItems=[['Proyecto',state.project],['Tipo',FAMILIES[state.family]?.label||state.family],['Etapas',levels+(state.basicScope==='extendida'&&state.stages.basica?' + básica extendida':'')],['Disciplinas',`${byDisc.length} con horas valorizadas`],['Modelado 3D',MODEL_SCOPES[state.model3d]||'Sin modelado'],['Modalidad de horas',state.mode==='detallado'?'Cantidades y ratios ajustables':'Ratios de referencia / cantidades sugeridas']];
 return `<div class="wHeading"><div class="wEyebrow">PASO 5 / 5</div><h1>Tu presupuesto preliminar</h1><p>Verificá los datos, los principales trabajos y los avisos antes de enviar una propuesta comercial.</p></div>
 <div class="wFinalStats"><div><span>HORAS HOMBRE TOTALES</span><strong>${format(result.total,1)}</strong><small>${format(result.direct,1)} directas + ${format(result.indirect,1)} indirectas</small></div><div><span>PRESUPUESTO ESTIMADO</span><strong>${money(result.budget)}</strong><small>${money(state.rate)} / H/H · sin impuestos ni margen</small></div></div>
 <div class="wCard"><div class="wBetween"><h2>Alcance cotizado</h2><button type="button" data-wizard-step="1" class="wTextBtn">Editar proyecto</button></div><div class="wSummaryGrid">${summaryItems.map(([key,val])=>`<div><small>${esc(key)}</small><strong>${esc(val)}</strong></div>`).join('')}</div></div>
 <div class="wCard"><div class="wBetween"><h2>Horas por disciplina</h2><button type="button" class="wTextBtn" data-wizard-step="3">Modificar alcance</button></div><div class="wFinalTable">${byDisc.map(d=>`<div><span><span class="dot" style="background:${d.color}"></span>${esc(d.name)}</span><strong>${format(result.byDisc[d.id],1)} H/H</strong><b>${format(result.total?result.byDisc[d.id]/result.total*100:0,1)}%</b></div>`).join('')}</div><div class="wFinalTable wFinalTotal"><div><span>H/H totales</span><strong>${format(result.total,1)} H/H</strong><b>100%</b></div></div></div>
 <div class="wCard"><h2>Principales entregables incluidos</h2><p class="wMuted">Los trabajos que más horas explican de este presupuesto.</p><div class="wFinalTable">${most.map(x=>`<div><span>${esc(x.r.entregable)}</span><strong>${format(x.hh,1)} H/H</strong></div>`).join('')}</div>${detailTag('wizard-fullscope',`Ver listado completo (${result.rows.length} actividades)`,`<div class="wFullScope">${result.rows.map(x=>`<div><span>${esc(x.r.entregable)}</span><strong>${format(x.hh,1)} H/H</strong></div>`).join('')}</div>`)}</div>
 ${result.warnings.length?`<div class="wCard"><h2>Antes de emitir la propuesta</h2><div class="wCaution">La herramienta detectó ${result.warnings.length} observaciones técnicas. Revisá las principales.</div>${result.warnings.slice(0,3).map(x=>`<p class="wIssue">• ${esc(x)}</p>`).join('')}${result.warnings.length>3?detailTag('wizard-warnings',`Ver todas las observaciones (${result.warnings.length})`,result.warnings.map(x=>`<p class="wIssue">• ${esc(x)}</p>`).join('')):''}</div>`:''}
 <div class="wCard"><h2>Exportar y guardar</h2><p class="wMuted">Podés guardar los datos para reabrir el proyecto, descargar la matriz de entregables o generar una propuesta PDF mediante impresión.</p><div class="wExportButtons"><button class="button buttonPrimary" type="button" data-action="print">⎙ Imprimir / Guardar PDF</button><button class="button" type="button" data-action="csv">↧ Descargar matriz CSV</button><button class="button" type="button" data-action="save">↧ Guardar proyecto JSON</button></div><p class="wMuted">No incluye costos de construcción, montaje, materiales, impuestos ni margen comercial. La estimación usa ratios provisionales que deben validarse.</p></div>`;
}
function wRightContent(res){return [wizStep1,wizStep2,wizStep3,wizStep4,wizStep5][wizardStep-1](res);}
function renderWizard(){
 preserveSimpleOpen();
 const host=document.getElementById('dashboard'),oldScroll=host?.scrollTop||0;
 const focused=document.activeElement,key=focused?.dataset?.key;
 let selectStart=null,selectEnd=null;try{selectStart=focused.selectionStart;selectEnd=focused.selectionEnd;}catch{}
 const res=calculate();
 document.getElementById('sidebar').innerHTML=`<div class="wizardProgress"><div class="wProgressEyebrow">COTIZACIÓN GUIADA</div><h2>5 pasos, una propuesta</h2><p>Podés volver a cualquier paso sin perder los datos.</p><div class="wStepList">${WIZARD_STEPS.map((t,i)=>`<button class="wStep ${wizardStep===i+1?'current':''} ${wizardStep>i+1?'visited':''}" type="button" data-wizard-step="${i+1}" ${wizardStep===i+1?'aria-current="step"':''}><span class="wStepNum">${wizardStep>i+1?'✓':t.glyph}</span><span><b>${t.name}</b><small>${t.subtitle}</small></span></button>`).join('')}</div></div><div class="wSideFooter"><div><span>HORAS ESTIMADAS</span><strong>${format(res.total,1)} H/H</strong></div><div><span>PRESUPUESTO ACTUAL</span><strong class="wGreen">${money(res.budget)}</strong></div><p>Los cálculos se actualizan mientras cargás el proyecto.</p></div><input type="file" id="loadJsonFile" accept=".json,application/json" hidden><input type="file" id="loadCalFile" accept=".json,application/json" hidden>`;
 host.innerHTML=`<div class="wMain" id="wizardMain">${wRightContent(res)}</div><div class="wFooterNav"><div class="wFooterSubtotal"><small>${wizardStep} de 5 · ${WIZARD_STEPS[wizardStep-1].name}</small><strong>${format(res.total,1)} H/H · ${money(res.budget)}</strong></div><div class="wFooterButtons">${wizardStep>1?'<button type="button" data-wizard-step="'+(wizardStep-1)+'" class="button">← Atrás</button>':''}<button type="button" class="button buttonPrimary" data-wizard-step="${wizardStep===5?1:wizardStep+1}">${wizardStep===5?'↺ Volver al inicio':'Continuar →'}</button></div></div>`;
 host.scrollTop=oldScroll;
 if(key){const newEl=[...document.querySelectorAll('[data-key]')].find(el=>el.dataset.key===key);if(newEl){try{newEl.focus({preventScroll:true});if(selectStart!==null)newEl.setSelectionRange(selectStart,selectEnd);}catch{}}}
 document.getElementById('calcStatus').textContent='● '+format(res.total,1)+' H/H · '+res.rows.length+' actividades';
 window.__ultimaEstimacion={hh_directas:res.direct,hh_indirectas:res.indirect,hh_totales:res.total,presupuesto:res.budget,actividades:res.rows.length};
 const mini=document.getElementById('mobileTotals');if(mini){mini.innerHTML=`<span><small>H/H</small><b>${format(res.total,1)}</b></span><span><small>Presupuesto</small><b>${money(res.budget)}</b></span>`;}
}
render=function(){if(wizardActive){document.body.classList.add('guidedMode');renderWizard();}else{document.body.classList.remove('guidedMode');renderV5();}};
function wizardToggle(){wizardActive=!wizardActive;const btn=document.querySelector('[data-wizard-action="toggle"]');if(btn){btn.textContent=wizardActive?'⚙ Vista avanzada':'↩ Volver al asistente';btn.setAttribute('aria-pressed',String(wizardActive));}render();}
// Tratar los controles del asistente por separado para no interferir con los eventos generales.
document.addEventListener('click',event=>{
 const btn=event.target.closest('[data-wizard-step]');if(btn){event.preventDefault();wizardNavTo(btn.dataset.wizardStep);return;}
 const act=event.target.closest('[data-wizard-action]');if(!act)return;
 event.preventDefault();const action=act.dataset.wizardAction;
 if(action==='toggle'){wizardToggle();return;}
 if(action==='clear-metrics'){
  if(!confirm('¿Poner en cero las cantidades físicas cargadas? Los entregables y los ratios no se borrarán.'))return;
  mutate(()=>{for(const m of METRICS)state.metrics[m[0]]=0;});return;
 }
 if(action==='detail'){wizardEditRatios=!wizardEditRatios;if(wizardEditRatios&&state.mode!=='detallado'){mutate(()=>state.mode='detallado');}else render();return;}
 if(action==='advanced-cal'){wizardActive=false;activeSimpleResult='avanzado';simpleOpened.ratios=true;const t=document.querySelector('[data-wizard-action="toggle"]');if(t){t.textContent='↩ Volver al asistente';t.setAttribute('aria-pressed','false');}render();return;}
});
// Si el catálogo ya terminó de cargar antes que este módulo (p. ej. pruebas offline), dibujar el modo guiado.
if(typeof LIB!=='undefined'&&LIB&&typeof RATIOS!=='undefined'&&RATIOS?.length&&typeof state!=='undefined'&&state)render();
