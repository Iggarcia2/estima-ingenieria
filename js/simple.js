/* ESTIMA V5 — interfaz simplificada. Motor, calibración y formatos V4.4 intactos. */
let simpleOpened={};
let simpleShowFactors=false;
const KEEP_IDS=['contexto','otrosdatos','avanzadas','description','3d','disciplinas','rondas','ratios','guia','alertas','metodologia',...DISC.map(d=>'docs-'+d.id)];
function preserveSimpleOpen(){for(const el of document.querySelectorAll('details[data-stay]'))simpleOpened[el.dataset.stay]=el.open;}
function detailTag(id,label,inside,cls=''){
 return `<details class="simpleDetails ${cls}" data-stay="${esc(id)}" ${simpleOpened[id]?'open':''}><summary>${label}</summary><div class="simpleDetailsInner">${inside}</div></details>`;
}
const coreMetricIds=['area','concrete','steel','equipment','mass','lines','power'];
const extraMetricIds=['pid','boards','circuits','instruments','loops','io'];
const neededDiscs={area:['CIV','EST'],concrete:['CIV'],steel:['EST'],equipment:['MEC','PRO'],mass:['MEC'],lines:['PIP'],pid:['PRO','PIP'],power:['ELE'],boards:['ELE'],circuits:['ELE'],instruments:['INS'],loops:['INS'],io:['INS']};
function metricVisible(id){return neededDiscs[id]?.some(d=>state.disc[d]);}
function simpleMetricField(id){let m=METRICS.find(x=>x[0]===id);if(!m)return '';
 return `<label class="simpleMetric"><span>${esc(m[1])} <small>${esc(m[2])}</small></span><input class="numberField" type="number" min="0" step="any" data-key="metric:${id}" value="${esc(state.metrics[id]??0)}" title="${esc(METRIC_HELP[id]||'')}"></label>`;
}
function simple3D(){const d=get3dDraft(),p=preview3d(),dv=p.delta;
 const possible=THREE_D_GROUPS.filter(x=>state.disc[x.disc]);
 const checkboxes=d.model3d==='parcial'?`<div class="simpleCheckGrid">${possible.map(g=>`<label class="simpleCheck"><input type="checkbox" data-3d-disc="${g.disc}" ${d.groups[g.disc]?'checked':''}>${esc(g.name)}</label>`).join('')}</div>`:'';
 return `<p class="simpleHint">El modelado 3D es opcional. Solo modifica el presupuesto después de hacer clic en <b>Aplicar</b>.</p>
  <label class="fieldWrap"><span class="fieldLabel">¿Qué se modelará?</span><select class="selectField" data-3d-select="model3d">${Object.entries(MODEL_SCOPES).map(([k,v])=>`<option value="${k}" ${d.model3d===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
  ${d.model3d!=='ninguno'?`<label class="fieldWrap"><span class="fieldLabel">Nivel de detalle del modelo (LOD)</span><select class="selectField" data-3d-select="lod">${[['definir','A definir'],['200','LOD 200 (aproximado)'],['300','LOD 300 (diseño)'],['350','LOD 350 (interfaces)'],['400','LOD 400 (fabricación)']].map(([k,v])=>`<option value="${k}" ${d.lod===k?'selected':''}>${v}</option>`).join('')}</select></label><p class="simpleHint">${esc(LOD_GUIDE[d.lod])}. Factor horario provisional ×${format(CALIBRATION.lodFactors[d.lod]||1,2)}.</p>${checkboxes}`:''}
  <div class="simplePreview"><span>Diferencia prevista</span><strong class="${dv<-0.01?'simpleNegative':'simplePositive'}">${dv>=0?'+':'−'}${format(Math.abs(dv),1)} H/H · ${dv>=0?'+':'−'}${money(Math.abs(dv*state.rate))}</strong></div>
  <button class="button buttonPrimary simpleFullBtn" data-action="3d-apply" type="button">✓ Aplicar 3D al presupuesto</button><div id="model3dApplied" role="status" aria-live="polite" class="simpleHint"></div>
  <p class="simpleHint">No sustituye automáticamente trabajos manuales. Revisá posibles solapamientos en Entregables.</p>`;
}
// Solo cuatro bloques visibles para presupuestar. Todo lo avanzado se abre bajo demanda.
renderSidebar=function(){
 const stageSel=`<div class="fieldWrap"><label class="fieldLabel">Ingeniería disponible</label><select class="selectField" data-select="baseline">${Object.entries(BASELINE_LABEL).map(([k,v])=>`<option value="${k}" ${state.baseline===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
 <div class="fieldWrap"><label class="fieldLabel">Hasta qué etapa querés llegar</label><select class="selectField" data-select="target">${STAGE_ORDER.filter(k=>STAGE_ORDER.indexOf(k)>STAGE_ORDER.indexOf(state.baseline)).map(k=>`<option value="${k}" ${state.target===k?'selected':''}>${STAGE_LABEL[k]}</option>`).join('')}</select></div>
 <div class="fieldLabel">Etapas a cobrar (podés cambiarlas)</div><div class="phaseChoices">${STAGE_ORDER.map(k=>`<label class="checkTile phaseChoice"><input type="checkbox" data-check="stage" data-id="${k}" ${state.stages[k]?'checked':''}>${STAGE_LABEL[k]}</label>`).join('')}</div>
 ${state.stages.basica?`<div class="fieldWrap" style="margin-top:10px"><label class="fieldLabel">Nivel de la básica</label><select class="selectField" data-select="basicScope"><option value="convencional" ${state.basicScope==='convencional'?'selected':''}>Convencional</option><option value="extendida" ${state.basicScope==='extendida'?'selected':''}>Extendida</option></select></div>`:''}
 <p class="simpleHint">${state.stageSelection==='manual'?'Etapas seleccionadas manualmente.':'Selección sugerida automáticamente según la ingeniería disponible.'} <a href="#" data-simple-help="guia">¿Qué incluye cada etapa?</a></p>`;
 const core=coreMetricIds.filter(metricVisible).map(simpleMetricField).join('');
 const extra=extraMetricIds.filter(metricVisible).map(simpleMetricField).join('');
 const disciplines=DISC.map(x=>`<label class="simpleCheck"><input type="checkbox" data-check="disc" data-id="${x.id}" ${state.disc[x.id]?'checked':''}><span class="dot" style="background:${x.color}"></span>${esc(x.name)}</label>`).join('');
 return `<section class="section simpleSection"><div class="sectionHead">01 · Proyecto y alcance</div><div class="sectionBody">
 <label class="fieldWrap"><span class="fieldLabel">Nombre del proyecto</span><input class="textField" maxlength="140" data-key="project" value="${esc(state.project)}"></label>
 <label class="fieldWrap"><span class="fieldLabel">Tipo de proyecto</span><select class="selectField" data-select="family">${Object.entries(FAMILIES).map(([id,c])=>`<option value="${id}" ${state.family===id?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label>
 <p class="simpleHint">La tipología propone cantidades y disciplinas de ejemplo. Modificá lo que no corresponda.</p>
 ${stageSel}</div></section>
 <section class="section simpleSection"><div class="sectionHead">02 · Magnitudes principales</div><div class="sectionBody"><p class="simpleHint" style="margin-bottom:11px">Cargá cantidades físicas aproximadas; no son horas de construcción. Poné 0 si no aplica.</p>
 <div class="simpleMetricGrid">${core||'<p class="simpleHint">Activá disciplinas en Opciones adicionales.</p>'}</div>
 ${extra?detailTag('otrosdatos','Otros datos (tableros, instrumentos, P&ID...)',`<div class="simpleMetricGrid">${extra}</div>`):''}</div></section>
 <section class="section simpleSection"><div class="sectionHead">03 · Precio de ingeniería</div><div class="sectionBody"><div class="inlineRow"><label class="fieldWrap"><span class="fieldLabel">Tarifa por hora</span>${fieldNum('rate',state.rate,0,'any')}</label><label class="fieldWrap"><span class="fieldLabel">Moneda</span><select class="selectField" data-select="currency"><option value="USD" ${state.currency==='USD'?'selected':''}>USD</option><option value="ARS" ${state.currency==='ARS'?'selected':''}>ARS</option></select></label></div><p class="simpleHint">Precio = H/H × tarifa promedio. Cambiar la moneda no convierte el importe.</p></div></section>
 ${detailTag('avanzadas','⚙ Opciones adicionales',`
   ${detailTag('disciplinas','Disciplinas que intervienen',`<div class="simpleCheckGrid">${disciplines}</div><p class="simpleHint">Desmarcar una disciplina excluye sus H/H.</p>`)}
   ${detailTag('3d','Modelado 3D (opcional)',simple3D())}
   ${detailTag('rondas','Revisiones del cliente',`<div class="simpleMetricGrid"><label><span class="fieldLabel">Rondas adicionales</span>${fieldNum('clientRounds',state.clientRounds,0,1,'max="10"')}</label><label><span class="fieldLabel">Fracción de H/H por ronda</span>${fieldNum('roundFactor',state.roundFactor,0,0.01,'max="2"')}</label></div><p class="simpleHint">Ejemplo: 0,12 agrega 12% por ronda a las tareas elegibles, no a toda la cotización.</p>`)}
   ${detailTag('description','Descripción adicional del proyecto',`<textarea class="textArea" data-key="description" maxlength="1400">${esc(state.description)}</textarea>`)}
  `,'simpleAdvanced')}
 <input type="file" id="loadJsonFile" accept=".json,application/json" hidden><input type="file" id="loadCalFile" accept=".json,application/json" hidden>`;
};

function simpleMatrix(result){
 const rowsById=Object.fromEntries(result.rows.map(x=>[x.r.id,x]));
 const query=(state.filter||'').toLowerCase().trim();
 let blocks=[];
 for(const disc of DISC){
  if(!state.disc[disc.id])continue;
  const pool=RATIOS.filter(r=>r.disciplina===disc.id&&stageEligible(r)&&modelEligible(r));
  const matching=pool.filter(r=>(!state.onlySelected||state.selected[r.id])&&(!query||`${r.entregable} ${r.id}`.toLowerCase().includes(query)));
  if(!matching.length)continue;
  const activeCount=pool.filter(active).length;
  const body=`<div class="tableScroll simpleMatrixTable"><table class="estTable"><thead><tr><th></th><th>Documento / actividad</th><th>Cantidad</th><th>H/H unit.</th><th class="simpleFactorColumn">Fc / Fr</th><th>H/H total</th><th class="simpleSourceColumn">Fuente</th></tr></thead><tbody>${matching.map(r=>ratioRow(r,rowsById)).join('')}</tbody></table></div>`;
  blocks.push(detailTag('docs-'+disc.id,`<span class="simpleDiscTitle"><span class="dot" style="background:${disc.color}"></span>${esc(disc.name)}</span><span class="simpleDiscValue">${activeCount} trabajos · ${format(result.byDisc[disc.id],1)} H/H</span>`,body,'simpleDiscDetails'));
 }
 return blocks.join('')||'<p class="simpleHint">No hay documentos con los filtros actuales.</p>';
}

// Búsqueda instantánea mientras el campo mantiene su foco y posición de cursor.
function refreshSimpleMatrixFilter(result){
 const root=document.getElementById('simpleMatrixResults');
 if(!root)return;
 preserveSimpleOpen();
 root.innerHTML=simpleMatrix(result);
}

renderDashboard=function(result){
 const discColors=Object.fromEntries(DISC.map(d=>[d.id,d.color]));
 const roleColors=Object.fromEntries(Object.keys(ROLE_LABEL).map((x,i)=>[x,['#315e87','#628eae','#7ba196','#8399c1','#c6a77a','#9c88ad'][i]]));
 const top=[...result.rows].filter(x=>x.hh>0).sort((a,b)=>b.hh-a.hh).slice(0,4);
 const quality=`<div class="simpleNotice">${result.warnings.length} puntos para revisar antes de enviar la propuesta. ${result.byClass.C||0} actividades utilizan hipótesis C de H/H.</div>`;
 return `<div class="simpleHeader"><div><span class="simpleEyebrow">PRESUPUESTO DE INGENIERÍA</span><h2>Resultado en tiempo real</h2></div><div class="simpleResultActions"><button type="button" class="button buttonPrimary" data-action="print">↗ PDF / Propuesta</button></div></div>
 <div class="simpleKpis"><div class="simpleKpi"><span>HORAS HOMBRE</span><strong>${format(result.total,1)}</strong><small>${format(result.direct,1)} directas · ${format(result.indirect,1)} coordinación</small></div><div class="simpleKpi simpleKpiAccent"><span>PRESUPUESTO</span><strong>${money(result.budget)}</strong><small>${money(state.rate)} por H/H · sin margen ni impuestos</small></div></div>
 <nav class="simpleResultTabs" aria-label="Secciones"><button data-simple-tab="resumen" class="simpleResultTab">Resumen</button><button data-simple-tab="entregables" class="simpleResultTab">Entregables</button><button data-simple-tab="avanzado" class="simpleResultTab">Ayuda y calibración</button></nav>
 <div class="resultPane" data-tab="resumen">${barPanel('Horas por especialidad',result.byDisc,discColors,result.total)}
 ${detailTag('contexto','Ver reparto por perfiles profesionales',barPanel('Horas por perfil',result.byRole,roleColors,result.total))}
 <section class="section"><div class="sectionHead">Trabajo que más horas consume</div><div class="sectionBody simpleContributors">${top.map(x=>`<div><span>${esc(x.r.entregable)}</span><strong>${format(x.hh,1)} H/H</strong></div>`).join('')}</div></section>
 <p class="simpleHint simpleSummaryHint">Etapas seleccionadas: ${esc(stageInfoText())}. Los resultados son preliminares; revisá la matriz antes de ofertar.</p><button class="button simpleFullBtn" type="button" data-simple-tab="entregables">Revisar entregables →</button></div>
 <div class="resultPane" data-tab="entregables"><div class="simpleDocTop"><div><h3>Documentos incluidos</h3><p class="simpleHint">Podés marcar o quitar documentos; para editar las horas pasá a «Editar cantidades».</p></div><div class="modeTabs"><button class="modeBtn ${state.mode==='rapido'?'active':''}" data-action="mode:rapido">Vista rápida</button><button class="modeBtn ${state.mode==='detallado'?'active':''}" data-action="mode:detallado">Editar cantidades</button></div></div>
 <div class="simpleTools"><input class="textField" placeholder="Buscar documento…" data-key="filter" value="${esc(state.filter)}" aria-label="Buscar documentos"><label class="simpleCheck"><input type="checkbox" data-check="onlySelected" ${state.onlySelected?'checked':''}>Solo incluidos</label><button class="button buttonTiny" data-action="simple-factors">${simpleShowFactors?'Ocultar factores':'Ver Fc/Fr y fuentes'}</button></div>
 <div id="simpleMatrixResults">${simpleMatrix(result)}</div><p class="simpleHint" style="margin-top:12px">H/H = cantidad × horas unitarias × complejidad × repetición. La fuente del alcance no certifica el ratio horario.</p></div>
 <div class="resultPane" data-tab="avanzado"><div class="simpleAdvancedIntro"><h3>Opciones avanzadas y ayuda</h3><p class="simpleHint">No necesitás configurar esto para obtener un presupuesto inicial.</p></div>
 ${detailTag('guia','ⓘ Qué significa cada campo',`<div class="simpleStageGuide">${Object.entries(STAGE_EXPLAIN).map(([k,v])=>`<p><b>${STAGE_LABEL[k]}:</b> ${esc(v.purpose)}. ${esc(v.items)}</p>`).join('')}</div>${renderFieldGuide()}`)}
 ${detailTag('alertas',`⚠ Avisos para revisar (${result.warnings.length})`,result.warnings.map(w=>`<div class="simpleAlert">${esc(w)}</div>`).join('')||'<p class="simpleHint">Sin advertencias.</p>')}
 ${detailTag('ratios','⚙ Calibrar ratios y valores predeterminados',renderCalibration(result))}
 ${detailTag('metodologia','Metodología y alcance de la estimación',`<p class="simpleHint">Solo H/H de ingeniería; se excluyen mano de obra de obra, equipos y materiales. La mayoría de las cantidades sugeridas no están validadas con datos de proyectos. CAI/CEPSI aporta alcance técnico, no coeficientes H/H.</p><p class="simpleHint">Los cambios locales se guardan en este navegador. Para publicar calibraciones para todos, exportá calibracion.json y reemplazá data/calibracion.json en GitHub.</p><div class="buttons"><button class="button" data-action="csv">Exportar CSV</button><button class="button" data-action="reset">Reiniciar proyecto</button></div>`)}
 </div>`;
};

let activeSimpleResult='resumen';
enhanceInterface=function(result){
 const panes=document.querySelectorAll('#dashboard .resultPane');
 for(const el of panes)el.classList.toggle('active',el.dataset.tab===activeSimpleResult);
 document.querySelectorAll('.simpleResultTab').forEach(b=>{b.classList.toggle('active',b.dataset.simpleTab===activeSimpleResult);b.setAttribute('aria-selected',String(b.dataset.simpleTab===activeSimpleResult));});
 document.getElementById('dashboard')?.classList.toggle('simpleFactorsVisible',simpleShowFactors);
 const mini=document.getElementById('mobileTotals');if(mini&&result){mini.innerHTML=`<span><small>H/H</small><b>${format(result.total,1)}</b></span><span><small>Presupuesto</small><b>${money(result.budget)}</b></span><span class="mobileArrow">↑ Ver</span>`;}
};
setAppTab=function(which,key){
 if(which==='result'){
  if(key==='guia'){simpleOpened.guia=true;key='avanzado';}
  if(key==='calibracion'){simpleOpened.ratios=true;key='avanzado';}
  if(key==='calidad'){simpleOpened.alertas=true;key='avanzado';}
  if(!['resumen','entregables','avanzado'].includes(key))return;
  activeSimpleResult=key;
  enhanceInterface();
  document.querySelector('#dashboard .resultPane.active')?.scrollTo({top:0});
 }
};
getPaneScroll=function(){return {dash:document.querySelector('#dashboard .resultPane.active')?.scrollTop||0,sidebar:document.querySelector('#sidebar')?.scrollTop||0};};
restorePaneScroll=function(scroll){const a=document.querySelector('#dashboard .resultPane.active');if(a)a.scrollTop=scroll?.dash||0;const b=document.getElementById('sidebar');if(b)b.scrollTop=scroll?.sidebar||0;};
const _renderSimpleOrig=render;
render=function(){preserveSimpleOpen();_renderSimpleOrig();};
const _handleActionSimpleOrig=handleAction;
handleAction=function(action){if(action==='simple-factors'){simpleShowFactors=!simpleShowFactors;enhanceInterface();const b=document.querySelector('[data-action="simple-factors"]');if(b)b.textContent=simpleShowFactors?'Ocultar factores':'Ver Fc/Fr y fuentes';return;}if(action==='mode:detallado')activeSimpleResult='entregables';else if(action==='mode:rapido')activeSimpleResult='resumen';_handleActionSimpleOrig(action);};
// New navigation. Reuse existing delegated data-key, data-check and data-action handlers.
document.addEventListener('click',event=>{
 const mobile=event.target.closest('[data-simple-go]');if(mobile){document.querySelector('#dashboard')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
 const help=event.target.closest('[data-simple-help]');if(help){event.preventDefault();simpleOpened[help.dataset.simpleHelp]=true;activeSimpleResult='avanzado';render();return;}
 const btn=event.target.closest('[data-simple-tab]');if(!btn)return;event.preventDefault();setAppTab('result',btn.dataset.simpleTab);
});

startApp().catch(error=>{
 console.error(error);
 const errorMarkup='<div style="max-width:750px;margin:48px auto;padding:24px;background:#18181b;border:1px solid #f59e0b;border-radius:8px"><h2 style="color:#f59e0b">No se pudo iniciar ESTIMA</h2><p>'+esc(error.message)+'</p><p>Para trabajar con archivos separados, abrí el sitio con un servidor HTTP (por ejemplo, GitHub Pages o <code>python -m http.server 8000</code>). No funciona abriendo <code>index.html</code> directamente con <code>file://</code>.</p></div>';
 document.getElementById('screen').innerHTML=errorMarkup;
 document.getElementById('calcStatus').textContent='Error de carga';
});
