/* ESTIMA · js/interfaz.js · proyecto estático sin compilación */
function labelForMetric(id){return METRICS.find(m=>m[0]===id)?.[1]||id;}
function fieldNum(id,value,min=0,step=1,extra=''){return `<input class="numberField" type="number" min="${min}" step="${step}" value="${esc(value)}" data-key="${esc(id)}" ${extra}>`;}
// Vista previa y confirmación explícita: los controles 3D NO alteran el presupuesto hasta aplicar.
const THREE_D_GROUPS=[
 {disc:'PIP',name:'Cañerías y equipos (3D)',ids:['PIP-003','PIP-004']},
 {disc:'CIV',name:'Fundaciones / obra civil',ids:['BIM-001']},
 {disc:'EST',name:'Estructuras metálicas',ids:['BIM-002']},
 {disc:'ELE',name:'Electricidad',ids:['BIM-003']},
 {disc:'INS',name:'Instrumentación',ids:['BIM-004']},
 {disc:'GES',name:'Revisiones, interferencias y coordinación 3D',ids:['BIM-005','BIM-006','BIM-007']}
];
let model3dDraft=null;
function new3dDraft(){
 const groups={};for(const group of THREE_D_GROUPS){
   const existing=group.ids.some(id=>!!state.selected[id]);
   groups[group.disc]=existing;
 }
 // Primera configuración parcial: solo proponer disciplinas con magnitudes de trabajo.
 if(!Object.values(groups).some(Boolean))for(const g of THREE_D_GROUPS){
   groups[g.disc]=!!state.disc[g.disc]&&g.ids.some(id=>BY_ID[id]&&quantityGuess(BY_ID[id])>0);
 }
 return {model3d:state.model3d,lod:state.lod,groups};
}
function get3dDraft(){return model3dDraft||(model3dDraft=new3dDraft());}
function draft3dState(){
 const d=get3dDraft(),s={...state,selected:{...state.selected},model3d:d.model3d,lod:d.lod};
 for(const group of THREE_D_GROUPS){
   const chosen=d.model3d==='integral'||(d.model3d==='parcial'&&!!d.groups[group.disc]);
   for(const id of group.ids){if(BY_ID[id])s.selected[id]=!!chosen;}
 }
 // Las extracciones CAD/3D son alternativas a documentos manuales. No se cambian aquí.
 return s;
}
function preview3d(){
 const prior=calculate(),original=state;
 let next;
 try{state=draft3dState();next=calculate();}finally{state=original;}
 const delta=next.total-prior.total;
 const threeD=next.rows.filter(x=>x.r.actividad_modelado_3d);
 const threeDHH=threeD.reduce((n,x)=>n+x.hh,0);
 const positive=delta>=-0.00001;
 return {prior,next,delta,threeD,threeDHH,positive};
}
function render3DControls(){
 const d=get3dDraft(),p=preview3d();
 const groupControls=THREE_D_GROUPS.filter(g=>state.disc[g.disc]).map(g=>{
  const active=d.model3d==='integral'||(d.model3d==='parcial'&&!!d.groups[g.disc]);
  const groupRows=p.threeD.filter(x=>g.ids.includes(x.r.id));
  const h=groupRows.reduce((v,x)=>v+x.hh,0);
  return `<label class="threeDChoice"><input type="checkbox" data-3d-disc="${g.disc}" ${active?'checked':''} ${d.model3d!=='parcial'?'disabled':''}><span>${esc(g.name)}</span><strong>${format(h,1)} H/H</strong></label>`;
 }).join('');
 const diff=p.delta;const sign=diff>0.001?'+':diff<-.001?'−':'';
 const changed=Math.abs(diff)>0.001||d.model3d!==state.model3d||d.lod!==state.lod;
 const ledge=(d.model3d==='ninguno'?'Se quita de la cotización la actividad geométrica 3D seleccionada por este panel.':d.model3d==='integral'?'Se incluyen todas las especialidades de modelado disponibles (según etapas y disciplinas activas).':'Marcá abajo las especialidades que realmente vas a modelar.');
 return `<div class="threeDWork">
  <div class="scopeNotice" style="margin:0 0 10px"><strong>Elegí el alcance, comprobá las horas y aplicá.</strong> Cambiar estos selectores por sí solo no modifica el presupuesto.</div>
  <div class="fieldWrap"><label class="fieldLabel">TIPO DE MODELO</label><select class="selectField" data-3d-select="model3d">${Object.entries(MODEL_SCOPES).map(([k,v])=>`<option value="${k}" ${d.model3d===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
  <p class="hint" style="margin:5px 0 12px">${esc(ledge)}</p>
  ${d.model3d!=='ninguno'?`<div class="fieldWrap"><label class="fieldLabel">NIVEL DE DETALLE (LOD)</label><select class="selectField" data-3d-select="lod">${[['definir','A definir'],['200','LOD 200'],['300','LOD 300'],['350','LOD 350'],['400','LOD 400']].map(([k,v])=>`<option value="${k}" ${d.lod===k?'selected':''}>${v}</option>`).join('')}</select></div>
  <div class="threeDLodHint">${esc(LOD_GUIDE[d.lod])}<div>Factor provisional de modelado geométrico: <strong>× ${format(CALIBRATION.lodFactors[d.lod]||1,2)}</strong>. Ajustable en <b>Calibración</b>.</div></div>
  <div class="threeDQuickApply"><div><span>Cambio previsto al aplicar</span><strong class="${p.positive?'posChange':'negChange'}">${sign}${format(Math.abs(diff),1)} H/H · ${sign}${money(Math.abs(diff*state.rate))}</strong></div><button type="button" class="button buttonPrimary" data-action="3d-apply">✓ Aplicar al presupuesto</button></div>
  <div class="fieldLabel" style="margin-top:12px">ESPECIALIDADES DE MODELADO Y ACTIVIDADES ASOCIADAS</div><div class="threeDChoices">${groupControls||'<p class="hint">No hay disciplinas disponibles: habilitalas en la pestaña Disciplinas.</p>'}</div>`:''}
  <div class="threeDPreview"><div class="threeDPreviewHead">VISTA PREVIA ANTES DE APLICAR</div>
  <div class="threeDPreviewGrid"><div><span>Presupuesto actual</span><strong>${money(p.prior.budget)}</strong></div><div><span>Presupuesto propuesto</span><strong>${money(p.next.budget)}</strong></div><div class="${p.positive?'posChange':'negChange'}"><span>Cambio</span><strong>${sign}${money(Math.abs(diff*state.rate))}</strong><small>${sign}${format(Math.abs(diff),1)} H/H</small></div></div>
  <div class="threeDTotal">H/H por actividades 3D en la propuesta: <strong>${format(p.threeDHH,1)}</strong> · ${p.threeD.length} actividades con horas</div>
  ${!state.stages.detalle&&d.model3d!=='ninguno'?`<div class="warning">Para que los entregables 3D actuales se computen, activá la etapa <strong>Detalle</strong>. El catálogo 3D está actualmente clasificado en esa etapa; no se agregan etapas sin tu permiso.</div>`:''}
  ${p.threeDHH===0&&d.model3d!=='ninguno'?`<div class="warning">No hay H/H 3D a sumar. Revisá las métricas del proyecto, la etapa Detalle y las disciplinas activas.</div>`:''}
  <button class="button buttonPrimary threeDApply" data-action="3d-apply" type="button">✓ Aplicar cambios 3D al presupuesto</button><div class="threeDApplied" id="model3dApplied" role="status" aria-live="polite"></div>
  <div class="hint">No se borran entregables manuales ni se reemplazan isométricos/MTO. Si hay solapamientos, revisalos en la Matriz. El cambio se guarda con tu proyecto.</div>
  ${changed?'':`<div class="hint">La configuración propuesta no cambia las H/H actuales.</div>`}
  </div></div>`;
}

function renderSidebar(){
 const stage=`<div class="scopeBlock">
  <div class="fieldWrap"><label class="fieldLabel" for="startingPoint">SITUACIÓN PREVIA · INGENIERÍA DISPONIBLE</label><select class="selectField" id="startingPoint" data-select="baseline">${Object.entries(BASELINE_LABEL).map(([k,label])=>`<option value="${k}" ${state.baseline===k?'selected':''}>${label}</option>`).join('')}</select></div>
  <div class="fieldWrap"><label class="fieldLabel" for="deliveryTarget">OBJETIVO DE LA PROPUESTA</label><select class="selectField" id="deliveryTarget" data-select="target">${STAGE_ORDER.filter(k=>STAGE_ORDER.indexOf(k)>STAGE_ORDER.indexOf(state.baseline)).map(k=>`<option value="${k}" ${state.target===k?'selected':''}>${STAGE_LABEL[k]}</option>`).join('')}</select></div>
  <label class="fieldLabel">ETAPAS A COTIZAR · SELECCIÓN INDEPENDIENTE</label>
  <div class="phaseChoices">${STAGE_ORDER.map(k=>`<label class="checkTile phaseChoice"><input type="checkbox" data-check="stage" data-id="${k}" ${state.stages[k]?'checked':''}><span>${STAGE_LABEL[k]}</span></label>`).join('')}</div>
  ${state.stages.basica?`<div class="fieldWrap"><label class="fieldLabel">ALCANCE DE INGENIERÍA BÁSICA</label><select class="selectField" data-select="basicScope">${Object.entries(BASIC_SCOPES).map(([id,t])=>`<option value="${id}" ${state.basicScope===id?'selected':''}>${t}</option>`).join('')}</select><span class="hint">La básica extendida agrega trabajo específico sin marcar una cuarta etapa independiente.</span></div>`:''}
  <div class="scopeNotice">${state.stageSelection==='manual'?'<strong>Selección personalizada.</strong> Podés combinar cualquier etapa; los selectores superiores siguen disponibles para volver a aplicar una situación automática.':'<strong>Selección automática.</strong> Las dos situaciones de arriba marcaron las etapas; podés cambiar cada casilla libremente.'}<br><strong>Etapas incluidas:</strong> ${esc(stageInfoText())}.</div>
  <details class="scopeDetails"><summary>ⓘ ¿Qué incluye cada etapa de ingeniería?</summary>${["conceptual","basica","basica_ext","detalle"].map(k=>`<div class="scopeGuide"><strong>${STAGE_LABEL[k]} — ${STAGE_EXPLAIN[k].purpose}</strong><div>${STAGE_EXPLAIN[k].items}</div><small>Ejemplos: ${STAGE_EXPLAIN[k].examples}</small></div>`).join('')}<div class="scopeNotice">La selección de una etapa no presupone automáticamente las otras. Los entregables contractuales son los seleccionados en la <strong>Matriz</strong>. Verificar el nivel de definición previo y posibles superposiciones.</div></details>
 </div>`;
 const dtiles=DISC.map(d=>`<label class="discTile"><input type="checkbox" data-check="disc" data-id="${d.id}" ${state.disc[d.id]?'checked':''}><span class="dot" style="background:${d.color}"></span><span>${esc(d.name)}</span></label>`).join('');
 const metricFields=METRICS.map(([id,label,unit])=>`<div class="fieldWrap"><label class="fieldLabel" for="metric-${id}">${label} <span class="metricUnit">(${unit})</span></label><input class="numberField" id="metric-${id}" type="number" min="0" step="any" value="${esc(state.metrics[id]??0)}" data-key="metric:${id}"></div>`).join('');
 return `<section class="section"><div class="sectionHead">01 &nbsp; Proyecto y alcance</div><div class="sectionBody">
 <div class="fieldWrap"><label class="fieldLabel" for="projectName">NOMBRE DEL PROYECTO</label><input class="textField" id="projectName" maxlength="140" data-key="project" value="${esc(state.project)}"></div>
 <div class="fieldWrap"><label class="fieldLabel" for="family">TIPOLOGÍA DE PROYECTO</label><select class="selectField" id="family" data-select="family">${Object.entries(FAMILIES).map(([id,x])=>`<option value="${id}" ${state.family===id?'selected':''}>${esc(x.label)}</option>`).join('')}</select><div class="hint" style="margin-top:5px">Al cambiar la tipología se cargan sus magnitudes y disciplinas de ejemplo.</div></div>
 <div class="fieldWrap"><label class="fieldLabel" for="description">DESCRIPCIÓN DEL ALCANCE</label><textarea class="textArea" id="description" maxlength="1400" data-key="description">${esc(state.description)}</textarea></div>
 <span class="fieldLabel">DESARROLLO Y ANTECEDENTES</span>${stage}</div></section>
 <section class="section"><div class="sectionHead">02 &nbsp; Disciplinas activas <span class="count">${DISC.filter(d=>state.disc[d.id]).length} de 9</span></div><div class="sectionBody"><div class="discGrid">${dtiles}</div><div class="hint" style="margin-top:10px">Gestión se computa por separado para no duplicar el esfuerzo técnico.</div></div></section>
 <section class="section"><div class="sectionHead">03 &nbsp; Métricas físicas <span class="count">Datos preliminares</span></div><div class="sectionBody"><div class="metricGrid">${metricFields}</div><div class="warning" style="margin-top:13px">Las reglas que predicen cantidades de planos desde m², m³ y tonelaje son <strong>supuestos de la V1</strong>, no ratios de ingeniería validados.</div></div></section>
 <section class="section"><div class="sectionHead">04 &nbsp; Tarifa y moneda</div><div class="sectionBody"><div class="inlineRow"><div><label class="fieldLabel">MONEDA</label><select class="selectField" data-select="currency"><option value="USD" ${state.currency==='USD'?'selected':''}>USD</option><option value="ARS" ${state.currency==='ARS'?'selected':''}>ARS</option></select></div><div><label class="fieldLabel">TARIFA POR H/H</label>${fieldNum('rate',state.rate,0,'any')}</div></div><div class="hint" style="margin-top:10px">Tarifa única para todos los perfiles. Cambiar moneda no convierte automáticamente la tarifa. Sin margen, impuestos ni materiales.</div></div></section>
 <section class="section"><div class="sectionHead">05 &nbsp; Modelado 3D · presupuestar</div><div class="sectionBody">
  ${render3DControls()}
  <div class="fieldWrap" style="margin-top:14px"><label class="fieldLabel">RONDAS ADICIONALES DE COMENTARIOS DEL CLIENTE</label>${fieldNum('clientRounds',state.clientRounds,0,1,'max="10"')}</div>
  <div class="fieldWrap"><label class="fieldLabel">FACTOR H/H ADICIONAL POR RONDA</label>${fieldNum('roundFactor',state.roundFactor,0,0.01,'max="2"')}</div>
  <div class="hint">Son rondas externas adicionales. Ejemplo: 1 ronda × 0,12 = 12% adicional sobre trabajos directos elegibles. La revisión interna estándar ya está incluida.</div>
  <div class="buttons" style="margin-top:10px"><button type="button" class="button" data-action="open-guide">ⓘ Guía de todos los campos</button></div>
 </div></section>
 <section class="section"><div class="sectionHead">06 &nbsp; Archivos y exportación</div><div class="sectionBody"><div class="buttons"><button class="button buttonPrimary" type="button" data-action="print">⎙ &nbsp; Imprimir propuesta</button><button class="button" type="button" data-action="csv">↓ &nbsp; CSV</button><button class="button buttonSoft" type="button" data-action="save">↓ &nbsp; Guardar JSON</button><button class="button" type="button" data-action="load">↑ &nbsp; Abrir JSON</button><button class="button" type="button" data-action="reset">↺ &nbsp; Restablecer</button></div><input id="loadJsonFile" type="file" accept="application/json,.json" style="display:none"><div class="hint" style="margin-top:10px">El proyecto se guarda también en este navegador, cuando el almacenamiento local está disponible.</div></div></section>`;
}
function barPanel(title,values,colors,mainTotal){const entries=Object.entries(values).filter(([,v])=>v>0.0001).sort((a,b)=>b[1]-a[1]);return `<section class="section"><div class="sectionHead">${title}</div><div class="sectionBody">${entries.length?entries.map(([id,v])=>`<div class="barRow"><div class="barName" title="${esc((DISC.find(d=>d.id===id)?.name)||ROLE_LABEL[id]||id)}">${esc((DISC.find(d=>d.id===id)?.short)||ROLE_LABEL[id]||id)}</div><div class="barTrack"><div class="barFill" style="width:${mainTotal?100*v/mainTotal:0}%;background:${colors[id]||'#7195b4'}"></div></div><div class="barValue">${format(v,1)}</div></div>`).join(''):'<div class="empty">No hay horas para mostrar.</div>'}</div></section>`;}
function scopeReference(r){const ref=r.referencia_alcance;if(!ref)return '';return `<span class="scopeTag" title="${esc(LIB.fuentes[ref.fuente_id]?.title||'Fuente de alcance')} · ${esc(ref.seccion)}. La fuente NO proporciona las H/H unitarias.">CAI · alcance</span>`;}
function deliverableDetails(r){const msg=r.contenido_referencia||r.incluye||'Contenido sujeto a pliego';const src=r.referencia_alcance;return `<details class="deliverableInfo"><summary>Ficha de alcance y referencias</summary><div><strong>Contenido:</strong> ${esc(msg)}</div><div><strong>Incluye:</strong> ${esc(r.incluye||'—')}</div><div><strong>Exclusiones:</strong> ${esc(r.no_incluye||'—')}</div><div><strong>Ratio H/H:</strong> ${r.clasificacion==='C'?'Hipótesis C no validada':'Referencia B de alcance específico; no universal'}. No procede de CAI/CEPSI.</div>${src?`<div><strong>Alcance técnico:</strong> ${esc(LIB.fuentes[src.fuente_id]?.title||src.fuente_id)}, ${esc(src.seccion)}</div>`:''}${r.grupo_documental?`<div><strong>Familia documental:</strong> ${esc(r.grupo_documental)} · ${r.ciclo_documental==='actualizacion'?'Trabajo incremental / actualización':'Producción del documento'}</div>`:''}</details>`;}
function sourceLabel(r){return r.clasificacion==='C'?'<span class="tinyBadge c" title="Hipótesis editable: sin validación externa">C · sup.</span>':`<a class="sourceLink" target="_blank" rel="noopener noreferrer" href="${esc(LIB.fuentes[r.fuente_id]?.url||'#')}" title="${esc(LIB.fuentes[r.fuente_id]?.scope_note||'Referencia publicada')}"><span class="tinyBadge b">${r.clasificacion==='B-caso'?'B · caso':'B · prác.'}</span></a>`;}
function ratioRow(r,resultById){const activeNow=active(r),eligible=state.disc[r.disciplina]&&stageEligible(r)&&modelEligible(r),o=opts(r),isDetail=state.mode==='detallado';const comp=lineCompute(r,qty(r)),computed=resultById[r.id];const valHH=activeNow?(computed?.hh||0):0;const q=activeNow&&r.metodo!=='quantity'?(computed?.q||0):qty(r);const original=r.hh_unitarias;
 const qHTML=r.metodo==='quantity'?(isDetail?`<input class="numEdit" type="number" min="0" step="any" value="${esc(q)}" data-key="qty:${r.id}" aria-label="Cantidad para ${esc(r.entregable)}"><span class="subCell">${o.quantity!==undefined?'manual':'supuesto'}</span>`:`<span class="numRead">${format(q,2)}</span><span class="subCell">supuesto</span>`):`<span class="numRead">${activeNow?format(q,2):'—'}</span><span class="subCell">base H/H</span>`;
 const rateHTML=isDetail?`<input class="numEdit small" type="number" min="0" step="any" value="${esc(o.rate??original)}" data-key="unit:${r.id}" aria-label="Horas unitarias para ${esc(r.entregable)}">`:`<span class="numRead">${format(o.rate??original,2)}</span>`;
 const factorHTML=isDetail?`<div style="display:flex;gap:5px;justify-content:flex-end"><input class="numEdit small" type="number" min="0" max="20" step="0.05" value="${esc(o.complexity??1)}" data-key="fc:${r.id}" title="Factor complejidad" aria-label="Complejidad ${esc(r.entregable)}"><input class="numEdit small" type="number" min="0" max="20" step="0.05" value="${esc(o.repetition??1)}" data-key="fr:${r.id}" title="Factor repetición" aria-label="Repetición ${esc(r.entregable)}"></div>`:`<span class="numRead">${format(o.complexity??1,2)} / ${format(o.repetition??1,2)}</span>`;
 return `<tr class="${!activeNow?'deselected':''}"><td style="width:34px;text-align:center"><input class="delCheck" type="checkbox" data-check="selected" data-id="${r.id}" ${state.selected[r.id]?'checked':''} ${!eligible?'disabled':''} aria-label="Incluir ${esc(r.entregable)}"></td><td class="labelCell"><div class="delName">${esc(r.entregable)}</div>${deliverableDetails(r)}<div class="delDescription">${r.id} · <span class="tinyBadge stage">${STAGE_LABEL[r.etapa]}</span> · ${esc(r.unidad)}</div></td><td style="text-align:right">${qHTML}</td><td style="text-align:right">${rateHTML}</td><td style="text-align:right">${factorHTML}</td><td class="cellNumber">${format(valHH,1)}${activeNow&&computed?.lodFactor!==1?`<span class="subCell">LOD ×${format(computed.lodFactor,2)}</span>`:''}${activeNow&&computed?.revisionExtra?`<span class="subCell">+ ${format(computed.revisionExtra,1)} rev.</span>`:""}</td><td class="sourceCell">${sourceLabel(r)}${scopeReference(r)}</td></tr>`;
}
function renderMatrix(result){const byId=Object.fromEntries(result.rows.map(x=>[x.r.id,x]));const term=(state.filter||'').trim().toLowerCase();const parts=[];
 for(const d of DISC){if(!state.disc[d.id])continue;const all=RATIOS.filter(r=>r.disciplina===d.id&&stageEligible(r)&&modelEligible(r));const filtered=all.filter(r=>(!state.onlySelected||state.selected[r.id])&&(!term||(`${r.entregable} ${r.id} ${r.unidad}`).toLowerCase().includes(term)));
 if(!filtered.length)continue;const nSelected=all.filter(r=>active(r)).length;
 parts.push(`<div class="discSection"><div class="discSectionHead"><span class="dot" style="width:10px;height:10px;background:${d.color}"></span><h3>${esc(d.name)}</h3><small>${nSelected} de ${all.length} seleccionados</small><span class="hrs">${format(result.byDisc[d.id],1)} H/H</span></div><div class="tableScroll"><table class="estTable"><thead><tr><th style="width:34px"></th><th>Entregable / etapa</th><th style="text-align:right">Cantidad</th><th style="text-align:right">H/H unit.</th><th style="text-align:right">Fc / Fr</th><th style="text-align:right">H/H</th><th>Fuente</th></tr></thead><tbody>${filtered.map(r=>ratioRow(r,byId)).join('')}</tbody></table></div></div>`);
 }
 return parts.join('')||'<div class="section"><div class="empty">No hay entregables con los filtros actuales. Activá disciplinas o etapas, o limpiá la búsqueda.</div></div>';
}
function renderDashboard(result){const numActive=result.rows.length,sourceCount=result.byClass.C||0;const roleColors=Object.fromEntries(Object.keys(ROLE_LABEL).map((id,i)=>[id,['#315e87','#628eae','#7ba196','#8399c1','#c6a77a','#9c88ad'][i]]));const discColors=Object.fromEntries(DISC.map(d=>[d.id,d.color]));const estimateKind=state.mode==='rapido'?'Cantidades inferidas por reglas preliminares':'Cantidades editables por entregable';
 return `<section class="section"><div class="sectionHead" style="justify-content:space-between;flex-wrap:wrap"><span>01 &nbsp; Modalidad de estimación</span><span class="count">${estimateKind}</span></div><div class="sectionBody"><div class="modeTabs"><button class="modeBtn ${state.mode==='rapido'?'active':''}" data-action="mode:rapido" type="button">⚡ &nbsp; Modo rápido</button><button class="modeBtn ${state.mode==='detallado'?'active':''}" data-action="mode:detallado" type="button">▤ &nbsp; Modo detallado</button></div><div class="hint" style="margin-top:10px">${state.mode==='rapido'?'Calcula cantidades aproximadas a partir de datos físicos. Podés activar o desactivar entregables; para editar cantidades, pasá a modo detallado.':'Modificá cantidades, H/H unitarias y factores por documento. Fc = complejidad; Fr = repetición. Los cambios quedan guardados en el proyecto.'}</div></div></section>
 <div class="kpiGrid">
 <div class="kpi"><div class="kpiLabel">H/H directas</div><div class="kpiNumber">${format(result.direct,1)}</div><div class="kpiSub">Producción técnica</div></div>
 <div class="kpi"><div class="kpiLabel">H/H indirectas</div><div class="kpiNumber">${format(result.indirect,1)}</div><div class="kpiSub">Gestión y coordinación</div></div>
 <div class="kpi emph"><div class="kpiLabel">H/H totales</div><div class="kpiNumber">${format(result.total,1)}</div><div class="kpiSub">${numActive} actividades activas</div></div>
 <div class="kpi dark"><div class="kpiLabel">Presupuesto estimado</div><div class="kpiNumber">${money(result.budget)}</div><div class="kpiSub">${money(state.rate)} / H/H · sin margen</div></div>
 </div>
 <div class="miniMetricBand"><div><span>H/H base con revisión interna</span><strong>${format(result.baseHH,1)}</strong></div><div><span>H/H por rondas extra de cliente</span><strong>${format(result.extraRevisionHH,1)}</strong></div><div><span>Alcance 3D</span><strong>${esc(MODEL_SCOPES[state.model3d])}</strong></div></div>
 <div class="twoPanels">${barPanel('02 &nbsp; Horas por disciplina',result.byDisc,discColors,result.total)}${barPanel('03 &nbsp; Horas por perfil',result.byRole,roleColors,result.total)}</div>
 <section class="section"><div class="sectionHead">04 &nbsp; Alcance técnico y control de calidad</div><div class="sectionBody"><div class="gridMain" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px"><div><div class="miniCaption">Composición de ratios seleccionados</div><div class="legend"><span class="tinyBadge b">B · publicados: ${(result.byClass['B-caso']||0)+(result.byClass['B-practica']||0)}</span><span class="tinyBadge c">C · supuestos: ${sourceCount}</span><span class="pillCount">${numActive} filas activas</span></div></div><div><div class="miniCaption">Alcance de la cotización</div><div class="quality">Base disponible: ${esc(BASELINE_LABEL[state.baseline])}<br>Objetivo: ${STAGE_LABEL[state.target]}<br>Trabajo a cotizar: ${stageInfoText()} · Básica ${state.basicScope} · ${DISC.filter(d=>state.disc[d.id]).length} disciplinas.</div></div></div>${result.warnings.length?`<div class="noticeStack" style="margin-top:14px">${result.warnings.map(w=>`<div class="alertSmall">⚠ ${esc(w)}</div>`).join('')}</div>`:''}</div></section>
 <section class="section"><div class="sectionHead" style="justify-content:space-between;flex-wrap:wrap"><span>05 &nbsp; Matriz de entregables</span><span class="count">H/H = cantidad × H/H unit. × Fc × Fr</span></div><div class="sectionBody"><div class="matrixTop"><div class="rightControls"><input class="textField" style="max-width:260px;min-width:180px" placeholder="Buscar entregable o código…" value="${esc(state.filter)}" data-key="filter" aria-label="Buscar entregables"><label class="checkTile" style="padding:7px 10px"><input type="checkbox" data-check="onlySelected" ${state.onlySelected?'checked':''}>Solo seleccionados</label></div><div class="buttons"><button class="button buttonTiny" data-action="all-visible" type="button">✓ Seleccionar visibles</button><button class="button buttonTiny" data-action="none-visible" type="button">✕ Quitar visibles</button>${state.mode==='detallado'?'<button class="button buttonTiny" data-action="clear-overrides" type="button">↺ Ratios originales</button>':''}</div></div><div class="hint" style="margin-top:10px">B: valor publicado ilustrativo o de práctica, no universal. C: hipótesis para ensayar. Los factores y la distribución por perfiles son inicialmente propuestos. CAI sólo fundamenta el contenido de entregables y etapas, no sus H/H; desplegá las fichas para ver la referencia. Los ítems desactivados no se suman.</div>${renderMatrix(result)}</div></section>
 <section class="section"><div class="sectionHead">06 &nbsp; Base de la estimación</div><div class="sectionBody"><div class="quality">La V1 calcula únicamente ingeniería. Las cantidades derivadas de superficie, hormigón, tonelaje, equipos, líneas y potencia son reglas orientativas, NO correlaciones estadísticas verificadas. Las revisiones internas están dentro de las horas directas; los servicios generales figuran en Gestión. No se incluyen visitas, licencias, materiales, construcción, impuestos, margen comercial ni honorarios de terceros. El exponente 0,70 no se aplica globalmente sin calibración.</div><div class="buttons" style="margin-top:12px"><button class="button buttonPrimary" type="button" data-action="print">⎙ &nbsp; Imprimir propuesta</button><button class="button" type="button" data-action="csv">↓ &nbsp; Exportar matriz CSV</button></div></div></section>`;
}

function renderCalibration(res){
 const physical=PHYSICAL_DRIVERS.map(d=>{
  const hh=safeNum(state.metrics[d.id],0)*safeNum(CALIBRATION.physicalHH[d.id],0),pct=res.total?hh/res.total*100:0;
  return `<tr><td><strong>${esc(d.label)}</strong><small class="calHelp">${esc(d.hint)}</small></td>
  <td class="calNum">${format(state.metrics[d.id]||0,2)} ${esc(d.unit)}</td>
  <td class="calNum"><input class="numberField calInput" type="number" min="0" step="any" value="${esc(CALIBRATION.physicalHH[d.id])}" data-key="calphys:${d.id}" aria-label="H/H adicionales por ${esc(d.unit)} de ${esc(d.label)}"></td>
  <td class="calNum">${format(hh,2)} H/H</td><td class="calNum">${format(pct,2)}%</td></tr>`;
 }).join('');
 const qtyDrivers=QUANTITY_DRIVERS.map(d=>`<div class="calDriver"><label class="fieldLabel">${esc(d.label)}</label><div class="calDriverBody"><input type="number" class="numberField" min="0.01" step="any" data-key="caldriver:${d.id}" value="${esc(CALIBRATION.quantityDrivers[d.id])}"><span>${esc(d.unit)}</span></div></div>`).join('');
 const rateCount=Object.keys(CALIBRATION.rateOverrides).length;
 return `<section class="section"><div class="sectionHead">07 &nbsp; Calibración persistente de ingeniería <span class="count">Valores generales</span></div>
 <div class="sectionBody"><div class="scopeNotice">Los cambios se <strong>guardan automáticamente en este navegador</strong>, incluso después de cerrar la pestaña. Para dejarlos fijos en la web publicada, descargá el archivo y reemplazá <code>data/calibracion.json</code> en GitHub. No cambia el HTML ni el servidor por sí mismo.</div>
 <div class="calHeadline">01 · H/H físicas complementarias por unidad</div>
 <div class="warning">Estos aportes son <b>adicionales</b> a las horas por documentos. Comienzan en cero: usalos solo para trabajos no contabilizados en los entregables. Si dos factores cubren el mismo esfuerzo, habrá doble cómputo.</div>
 <div class="tableWrap"><table class="estTable calibrationTable"><thead><tr><th>Magnitud física</th><th>Valor del proyecto</th><th>H/H extra / unidad</th><th>Aporte extra</th><th>% del total</th></tr></thead><tbody>${physical}</tbody></table></div>
 <p class="hint">El porcentaje es <b>la participación de ese complemento físico sobre las H/H totales</b>, no el porcentaje total de la disciplina. Las horas provenientes de planos y entregables siguen registradas en la matriz.</p>
 <div class="calHeadline">02 · Conversión física → cantidad de entregables</div>
 <p class="hint">Estos parámetros controlan cuántos documentos se proponen en modo rápido. Por ejemplo, un valor menor de m³ por plano de fundación suele generar más planos y H/H; sus efectos son escalonados por el redondeo hacia arriba.</p>
 <div class="calDriverGrid">${qtyDrivers}</div>
 <div class="calHeadline">03 · Factores LOD de modelado 3D</div>
 <p class="hint">Ajustan únicamente las horas de geometría 3D (modelado de equipos, cañerías, estructuras y otras disciplinas). NO multiplican las reuniones ni la extracción de isométricos/MTO. <b>Son hipótesis de partida, no valores oficiales CAI/BIM.</b> Se guardan automáticamente como calibración global.</p>
 <div class="calDriverGrid">${Object.entries(LOD_DEFAULTS).map(([id,base])=>`<div class="calDriver"><label class="fieldLabel">LOD ${id==='definir'?'sin definir':id}</label><small class="calHelp">${esc(LOD_GUIDE[id])}</small><div class="calDriverBody"><span>×</span><input type="number" class="numberField" min="0.1" max="3" step="0.05" data-key="callod:${id}" value="${esc(CALIBRATION.lodFactors[id])}" aria-label="Factor de escala LOD ${id}"></div></div>`).join('')}</div>
 <div class="calHeadline">04 · Ratios H/H unitarias generales</div>
 <p class="hint">${rateCount} ratios guardados como valores generales. Para afinarlos, editá las H/H unitarias en <b>Modo detallado → Matriz</b> y luego hacé clic en “Usar las H/H de la matriz como valores generales”. Las cantidades y otros factores seguirán siendo específicos del proyecto.</p>
 <div class="buttons"><button class="button buttonPrimary" data-action="cal-publish-rates">↗ Usar H/H de matriz como valores generales</button><button class="button" data-action="cal-export">↓ Descargar calibración definitiva</button><button class="button" data-action="cal-import">↑ Importar calibración</button><button class="button buttonSoft" data-action="cal-reset">↺ Restaurar versión publicada</button></div>
 <input id="loadCalFile" type="file" accept=".json,application/json" style="display:none">
 <div class="scopeNotice">Guardar en GitHub: entrar a <code>data/calibracion.json</code> → editar o subir reemplazo → confirmar cambios. Los valores publicados se usan en otros navegadores; los ajustes locales existentes tienen prioridad hasta que se restauren.</div>
 </div></section>`;
}
const METRIC_HELP={
 area:'Superficie de galpones, naves o edificios a proyectar. No es automáticamente superficie de terreno.',
 concrete:'Volumen estimado de hormigón de fundaciones y obras civiles. No incluye la mano de obra para hormigonar.',
 steel:'Peso total estimado de estructuras metálicas (no el peso de máquinas).',
 equipment:'Cantidad de equipos principales distintos o unidades a integrar en el diseño.',
 mass:'Peso total de equipos en toneladas. Separarlo del tonelaje estructural.',
 lines:'Cantidad de líneas de piping, preferentemente obtenida o estimada desde un listado de líneas.',
 pid:'Número de hojas/diagramas P&ID previstos; no es el número de cañerías.',
 power:'Potencia eléctrica instalada aproximada (kW), no energía mensual consumida (kWh).',
 boards:'Cantidad de tableros eléctricos, MCC y tableros principales dentro del alcance.',
 circuits:'Cantidad de alimentadores o circuitos eléctricos que hay que diseñar.',
 instruments:'Cantidad de instrumentos y válvulas instrumentadas que requieren ingeniería.',
 loops:'Cantidad de lazos de control a documentar. Un lazo puede involucrar varios instrumentos.',
 io:'Cantidad total de señales de entrada/salida que se conectan al sistema de control.'
};
function renderFieldGuide(){
 const metrics=METRICS.map(([id,label,unit])=>`<tr><td><b>${esc(label)}</b><small class="helpCode">${esc(unit)}</small></td><td>${esc(METRIC_HELP[id])}</td><td>${format(state.metrics[id]||0,2)}</td></tr>`).join('');
 const guidance=[
 ['Tipo de proyecto','Carga una propuesta inicial de disciplinas y magnitudes. Son ejemplos; revisá los datos antes de cotizar.'],
 ['Ingeniería disponible','Indicá qué documentación fue desarrollada, aprobada y realmente puede reutilizarse.'],
 ['Objetivo de la propuesta','Sugiere automáticamente qué etapas cotizar hasta llegar al nivel pedido.'],
 ['Etapas independientes','Podés activar Conceptual, Básica y Detalle por separado. La sugerencia automática no obliga a incluir las anteriores.'],
 ['Básica extendida','Profundiza la etapa Básica para definir mejor alcance, compras y cómputos de inversión.'],
 ['Disciplinas','Solo suman documentos de las especialidades marcadas. Gestión incluye coordinación y tareas indirectas.'],
 ['Tarifa H/H y moneda','Todos los perfiles utilizan la misma tarifa promedio. Cambiar USD a ARS NO convierte automáticamente el importe.'],
 ['Modo rápido','Calcula cantidades de entregables a partir de magnitudes usando hipótesis editables.'],
 ['Modo detallado','Permite editar manualmente cantidades, H/H por unidad, complejidad y repetición de cada entregable.'],
 ['Cantidad','Número de unidades del trabajo: planos, memorias, equipos, líneas, documentos o paquetes.'],
 ['H/H unitarias','Horas requeridas por unidad, antes de multiplicadores. Algunas son referencias de alcance limitado y otras hipótesis.'],
 ['Fc (complejidad)','Multiplicador del esfuerzo: 1,00 = normal; 1,25 = +25% de horas; 0,80 = −20%.'],
 ['Fr (repetición)','Multiplicador por reutilización: 1,00 = sin ahorro; 0,75 = −25%. Requiere elementos repetibles.'],
 ['Rondas de cliente','Número de tandas extra de comentarios externos. No duplicar revisiones ya consideradas en las H/H.'],
 ['Factor por ronda','0,12 significa un 12% adicional por ronda sobre las horas base de las actividades elegibles.'],
 ['Aportes por m², m³, t, etc.','Son COMPLEMENTOS adicionales a las H/H de documentos; por defecto valen 0 para no sumar dos veces.'],
 ['Conversión física a documentos','Ejemplo: 100 m³/planos con 200 m³ de hormigón predice 2 planos. Los coeficientes son hipótesis.'],
 ['% del total','Porción de las H/H globales aportadas por un factor, no participación total de toda la disciplina.'],
 ['Calibración definitiva','Los ajustes locales se guardan en tu navegador. Descargá calibracion.json y subilo a GitHub para publicar valores base.']
 ];
 return `<section class="section"><div class="sectionHead">GUÍA · ¿Qué significa cada dato y cómo completarlo?</div><div class="sectionBody">
 <div class="scopeNotice"><b>Orden recomendado:</b> 1. Elegir proyecto → 2. Marcar etapas y disciplinas → 3. Cargar magnitudes → 4. Definir 3D y aplicar → 5. Revisar matriz → 6. Calibrar → 7. Exportar.</div>
 <div class="helpIntro">Podés dejar una magnitud en <strong>0</strong> cuando no aplica. Si todavía no la conocés, anotá en la descripción del alcance que es una hipótesis pendiente de confirmar. Los importes cotizados son por trabajo de <b>ingeniería</b>, no por construcción ni fabricación.</div>
 <div class="calHeadline">01 · Campos de proyecto, cálculo y presupuesto</div>
 <div class="helpList">${guidance.map(([name,what])=>`<div class="helpItem"><strong>${esc(name)}</strong><p>${esc(what)}</p></div>`).join('')}</div>
 <div class="calHeadline">02 · Cada magnitud física</div>
 <div class="tableWrap"><table class="estTable helpTable"><thead><tr><th>Campo</th><th>Qué tenés que introducir</th><th>Valor actual</th></tr></thead><tbody>${metrics}</tbody></table></div>
 <div class="calHeadline">03 · Modelado 3D y LOD, con efecto en el presupuesto</div>
 <div class="helpList"><div class="helpItem"><strong>Sin modelo 3D</strong><p>No se contratan tareas de modelado geométrico 3D. Al aplicar, se quitan del total las actividades 3D administradas por el panel.</p></div>
 <div class="helpItem"><strong>Modelo parcial</strong><p>Elegís exactamente cuáles disciplinas se modelan: cañerías/equipos, civil, estructuras, electricidad, instrumentación y/o coordinación.</p></div>
 <div class="helpItem"><strong>Modelo multidisciplinario</strong><p>Se cotizan las especialidades activas con trabajo 3D asociado y las actividades de coordinación, siempre que existan cantidades y etapa habilitada.</p></div>
 <div class="helpItem"><strong>Aplicar cambios</strong><p>Los selectores preparan una simulación, no modifican el precio. El botón Aplicar cambios 3D confirma la selección; verás horas e importe antes de hacerlo.</p></div>
 <div class="helpItem"><strong>Cómo se calculan las horas 3D</strong><p>Cantidad × H/H unitarias × Fc × Fr × factor LOD para geometría. Los factores LOD son hipótesis editables en Calibración, no porcentajes certificados.</p></div></div>
 <div class="tableWrap"><table class="estTable helpTable"><thead><tr><th>LOD</th><th>Alcance orientativo</th><th>Factor propuesto</th></tr></thead><tbody>${Object.keys(LOD_DEFAULTS).map(id=>`<tr><td>${id==='definir'?'A definir':id}</td><td>${esc(LOD_GUIDE[id])}</td><td>×${format(CALIBRATION.lodFactors[id],2)}</td></tr>`).join('')}</tbody></table></div>
 <div class="warning">El LOD se debe especificar contractualmente por elemento y disciplina. Los factores propuestos son una ayuda inicial para presupuestar, NO una tabla publicada por CAI ni por BIM Forum.</div>
 <div class="calHeadline">04 · Cómo comprobar el resultado</div>
 <p class="hint">La Matriz muestra qué documentos están incluidos, las cantidades y sus H/H. Las columnas Fc/Fr afectan las horas de cada fila. El resumen distribuye las H/H por disciplina y perfil. Antes de emitir, revisá las advertencias de <b>Control de alcance</b> para detectar solapamientos de trabajo manual/3D.</p>
 </div></section>`;
}
let activeSBTab='proyecto',activeResultTab='resumen';
const SB_KEYS=['proyecto','disciplinas','metricas','modelado','costos'];
const RESULT_KEYS=['resumen','entregables','calibracion','guia','calidad','base'];
function setAppTab(which,key){
 const isSB=which==='sb';const keys=isSB?SB_KEYS:RESULT_KEYS;
 if(!keys.includes(key))return;
 if(isSB)activeSBTab=key;else activeResultTab=key;
 const scope=document.getElementById(isSB?'sidebar':'dashboard');
 scope.querySelectorAll(isSB?'.sbPane':'.resultPane').forEach(el=>el.classList.toggle('active',el.dataset.tab===key));
 scope.querySelectorAll(isSB?'.panelTab':'.resultTab').forEach(el=>{const on=el.dataset.tab===key;el.classList.toggle('active',on);el.setAttribute('aria-selected',String(on));});
}

function renderInsights(result){
 const byStage=Object.fromEntries(Object.keys(STAGE_LABEL).map(k=>[k,0]));
 const classHH={'B-caso':0,'B-practica':0,C:0};
 for(const row of result.rows){byStage[row.r.etapa]+=row.hh;classHH[row.r.clasificacion]=(classHH[row.r.clasificacion]||0)+row.hh;}
 const steps=Object.keys(STAGE_LABEL).map(k=>`<div class="insightLine"><span class="insightLabel">${STAGE_LABEL[k]}</span><span class="insightTrack"><span class="insightFill" style="display:block;width:${result.total?100*byStage[k]/result.total:0}%;background:${({conceptual:'#60a5fa',basica:'#a78bfa',basica_ext:'#f59e0b',detalle:'#2dd4bf'})[k]}"></span></span><span class="insightVal">${format(byStage[k],1)} H/H</span></div>`).join('');
 const hypothesisHH=classHH.C;
 const top=result.rows.filter(x=>x.hh>0).sort((a,b)=>b.hh-a.hh).slice(0,6);
 const drivers=top.map((x,i)=>`<div class="driverRow"><span class="drId">${String(i+1).padStart(2,'0')}</span><span class="driverText" title="${esc(x.r.entregable)}">${esc(x.r.entregable)} <span class="drId">[${x.r.id}]</span></span><span class="driverHH">${format(x.hh,1)} H/H</span></div>`).join('');
 return `<div class="insightGrid"><section class="section"><div class="sectionHead">04 &nbsp; Esfuerzo por etapa</div><div class="sectionBody">${steps}<div class="insightTip">${format(result.total?100*hypothesisHH/result.total:0,1)}% de las H/H provienen de hipótesis C no calibradas. La clasificación mide procedencia del ratio, no exactitud de la estimación.</div></div></section><section class="section"><div class="sectionHead">05 &nbsp; Entregables que más horas consumen</div><div class="sectionBody">${drivers||'<span class="hint">Sin actividades activas.</span>'}<div class="insightTip">Revisá primero estas cantidades y horas unitarias en el modo detallado.</div></div></section></div>`;
}
function enhanceInterface(result){
 const side=document.getElementById('sidebar'),sects=[...side.children].filter(x=>x.classList.contains('section'));
 const sbnav=document.createElement('nav');sbnav.className='panelTabs';sbnav.setAttribute('aria-label','Configuración');
 for(const [id,txt] of [['proyecto','Proyecto'],['disciplinas','Disciplinas'],['metricas','Métricas'],['modelado','Modelo 3D'],['costos','Tarifa']]){
  const b=document.createElement('button');b.type='button';b.className='panelTab';b.textContent=txt;b.dataset.tab=id;b.setAttribute('role','tab');b.onclick=()=>setAppTab('sb',id);sbnav.appendChild(b);
 }
 const panes={};for(const id of SB_KEYS){const c=document.createElement('div');c.className='sbPane';c.dataset.tab=id;panes[id]=c;}
 const destination=['proyecto','disciplinas','metricas','costos','modelado','costos'];sects.forEach((s,i)=>panes[destination[i]].appendChild(s));
 side.replaceChildren(sbnav,...Object.values(panes));
 const dash=document.getElementById('dashboard');const elements=[...dash.children];
 const mode=elements.find(x=>x.classList.contains('section'));
 const kpis=elements.find(x=>x.classList.contains('kpiGrid'));
 const two=elements.find(x=>x.classList.contains('twoPanels'));
 const mini=elements.find(x=>x.classList.contains('miniMetricBand'));
 const sections=elements.filter(x=>x.classList.contains('section'));
 if(!mode||!kpis||!two||sections.length!==4)return;
 mode.classList.add('modeSection');
 const resnav=document.createElement('nav');resnav.className='resultTabs';resnav.setAttribute('aria-label','Secciones de resultados');
 for(const [id,txt] of [['resumen','Resumen'],['entregables','Matriz de entregables'],['calibracion','Calibración'],['guia','Guía de campos'],['calidad','Control de alcance'],['base','Metodología']]){
  const b=document.createElement('button');b.type='button';b.className='resultTab';b.dataset.tab=id;b.setAttribute('role','tab');b.textContent=txt;b.onclick=()=>setAppTab('result',id);resnav.appendChild(b);
 }
 const resPanes={};for(const id of RESULT_KEYS){const c=document.createElement('div');c.className='resultPane';c.dataset.tab=id;resPanes[id]=c;}
 if(mini)resPanes.resumen.appendChild(mini);resPanes.resumen.appendChild(two);const extras=document.createElement('div');extras.innerHTML=renderInsights(result);resPanes.resumen.appendChild(extras);resPanes.calidad.appendChild(sections[1]);resPanes.entregables.appendChild(sections[2]);const calHost=document.createElement('div');calHost.innerHTML=renderCalibration(result);resPanes.calibracion.appendChild(calHost);const helpHost=document.createElement('div');helpHost.innerHTML=renderFieldGuide();resPanes.guia.appendChild(helpHost);resPanes.base.appendChild(sections[3]);
 dash.replaceChildren(mode,kpis,resnav,...Object.values(resPanes));
 setAppTab('sb',activeSBTab);setAppTab('result',activeResultTab);
}
function getPaneScroll(){const s={};document.querySelectorAll('.sbPane,.resultPane').forEach(el=>{s[(el.classList.contains('sbPane')?'s':'r')+el.dataset.tab]=el.scrollTop;});return s;}
function restorePaneScroll(s){document.querySelectorAll('.sbPane,.resultPane').forEach(el=>{const key=(el.classList.contains('sbPane')?'s':'r')+el.dataset.tab;if(key in s)el.scrollTop=s[key];});}
function render(){const oldScroll=getPaneScroll();const activeEl=document.activeElement;const focusKey=activeEl?.dataset?.key;let start=null,end=null;try{if(focusKey&&activeEl.selectionStart!==undefined){start=activeEl.selectionStart;end=activeEl.selectionEnd;}}catch(e){}
 const result=calculate();document.getElementById('sidebar').innerHTML=renderSidebar();document.getElementById('dashboard').innerHTML=renderDashboard(result);enhanceInterface(result);restorePaneScroll(oldScroll);const status=document.getElementById('calcStatus');if(status)status.textContent='● '+format(result.total,1)+' H/H · '+result.rows.length+' ítems';
 if(focusKey){const newEl=[...document.querySelectorAll('[data-key]')].find(e=>e.dataset.key===focusKey);if(newEl){newEl.focus({preventScroll:true});if(start!==null){try{newEl.setSelectionRange(start,end);}catch(e){}}}}
 window.__ultimaEstimacion={hh_directas:result.direct,hh_indirectas:result.indirect,hh_totales:result.total,presupuesto:result.budget,actividades:result.rows.length};
}
function mutate(fn){fn();persist();render();}
function setOverride(id,key,value){const obj=state.overrides[id]||{};obj[key]=safeNum(value,0);state.overrides[id]=obj;}
// Ninguna selección debe desactivar silenciosamente otros entregables.
// Cuando dos métodos son alternativos (p. ej. isométricos manuales y extraídos del
// modelo 3D), se muestran advertencias; el usuario define explícitamente cantidades.
function toggleSelected(id,val){state.selected[id]=Boolean(val);}
function updateKey(key,value){if(key==='project')state.project=value;if(key==='description')state.description=value;if(key==='filter')state.filter=value;if(key==='rate')state.rate=safeNum(value,0,0,1e9);if(key.startsWith('calphys:')){CALIBRATION.physicalHH[key.slice(8)]=safeNum(value,0,0,1e5);persistCalibration();}if(key.startsWith('caldriver:')){const id=key.slice(10);CALIBRATION.quantityDrivers[id]=safeNum(value,1,0.01,1e9);persistCalibration();}if(key.startsWith('callod:')){const id=key.slice(7);if(Object.hasOwn(LOD_DEFAULTS,id))CALIBRATION.lodFactors[id]=safeNum(value,LOD_DEFAULTS[id],0.1,3);persistCalibration();}if(key==='clientRounds')state.clientRounds=safeNum(value,0,0,10);if(key==='roundFactor')state.roundFactor=safeNum(value,0,0,2);if(key.startsWith('metric:'))state.metrics[key.split(':')[1]]=safeNum(value,0);if(key.startsWith('qty:'))setOverride(key.slice(4),'quantity',value);if(key.startsWith('unit:'))setOverride(key.slice(5),'rate',value);if(key.startsWith('fc:'))setOverride(key.slice(3),'complexity',value);if(key.startsWith('fr:'))setOverride(key.slice(3),'repetition',value);}
function visibleRatios(){const term=(state.filter||'').trim().toLowerCase();return RATIOS.filter(r=>state.disc[r.disciplina]&&stageEligible(r)&&modelEligible(r)&&(!state.onlySelected||state.selected[r.id])&&(!term||`${r.entregable} ${r.id} ${r.unidad}`.toLowerCase().includes(term)));}
