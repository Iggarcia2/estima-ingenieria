/* ESTIMA V4 · Exportaciones; no requiere librerías de pago */
function downloadText(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function csvCell(v){return '"'+String(v??'').replaceAll('"','""')+'"';}
function exportCSV(){
 const data=calculate();const cols=['Código','Disciplina','Etapa','Entregable','Contenido de referencia','Familia documental','Unidad','Cantidad','Ratio H/H unit.','Complejidad','Repetición','Factor LOD 3D','H/H base','H/H revisión adicional','H/H total','Tipo de ratio','Referencia ratio','Referencia alcance CAI','Ubicación CAI','Incluye','No incluye',...Object.values(ROLE_LABEL)];
 const table=[cols.map(csvCell).join(';')];
 for(const x of data.rows){const r=x.r;const p=r.reparto_perfiles_propuesto||{},denom=Object.values(p).reduce((a,b)=>a+safeNum(b),0)||1;const ar=r.referencia_alcance;
 const row=[r.id,r.disciplina,STAGE_LABEL[r.etapa],r.entregable,r.contenido_referencia||'',r.grupo_documental||'',r.unidad,x.q,x.rate,x.fc,x.fr,x.lodFactor||1,x.hhBase,x.revisionExtra,x.hh,r.clasificacion,LIB.fuentes[r.fuente_id]?.title||'Hipótesis C sin respaldo de H/H',ar?LIB.fuentes[ar.fuente_id]?.title:'',ar?.seccion||'',r.incluye||'',r.no_incluye||'',...Object.keys(ROLE_LABEL).map(role=>x.hhBase*safeNum(p[role])/denom+(x.revisionExtra&&role==='ingeniero'||x.revisionExtra&&role==='revisor'?x.revisionExtra*.5:0))];
 table.push(row.map(csvCell).join(';'));
 }
 table.push(['','','','TOTAL H/H','','','','','','','','','',data.extraRevisionHH,data.total].map(csvCell).join(';'));
 table.push(['','','','PRESUPUESTO '+state.currency,'','','','','','','','','','',data.budget].map(csvCell).join(';'));
 downloadText('ESTIMA_V4_4_matriz_ingenieria.csv','\ufeff'+table.join('\r\n'),'text/csv;charset=utf-8');
}
function exportJSON(){downloadText('ESTIMA_V4_4_proyecto.json',JSON.stringify({app:'estimador_ingenieria_v1',libraryVersion:LIB.version,exportedAt:new Date().toISOString(),state},null,2),'application/json;charset=utf-8');}
function printReport(){
 const res=calculate(), now=new Date().toLocaleDateString('es-AR');const activeDisc=DISC.filter(d=>state.disc[d.id]);
 const stages=STAGE_ORDER.filter(k=>state.stages[k]).map(k=>STAGE_LABEL[k]).join(' / ')||'Sin etapas activas';
 const byRoles=Object.entries(ROLE_LABEL).map(([k,l])=>`<tr><td>${esc(l)}</td><td style="text-align:right">${format(res.byRole[k],1)}</td></tr>`).join('');
 let out=`<div class="prHead"><h1>ESTIMA · Propuesta de ingeniería</h1><p>Estimación técnica preliminar | ${esc(now)} | Biblioteca ${esc(LIB.version)}</p></div>
 <h2 style="font-size:16pt;margin:0 0 6px;color:#1c3759">${esc(state.project)}</h2><p>${esc(state.description)}</p>
 <p><strong>Tipología:</strong> ${esc(FAMILIES[state.family]?.label)}<br><strong>Base existente:</strong> ${esc(BASELINE_LABEL[state.baseline])}<br>
 <strong>Etapas contratadas:</strong> ${esc(stages)}${state.stages.basica?' · '+esc(BASIC_SCOPES[state.basicScope]):''}<br>
 <strong>Modelado:</strong> ${esc(MODEL_SCOPES[state.model3d])}${state.model3d==='ninguno'?'':' · LOD '+esc(state.lod)+' · factor geométrico provisional ×'+format(CALIBRATION.lodFactors[state.lod],2)}<br>
 <strong>Disciplinas:</strong> ${esc(activeDisc.map(d=>d.name).join(' · '))}</p>
 <div class="prSummary"><div class="prBox"><small>H/H técnicas + rondas</small><strong>${format(res.direct,1)}</strong></div><div class="prBox"><small>H/H gestión</small><strong>${format(res.indirect,1)}</strong></div><div class="prBox"><small>H/H totales</small><strong>${format(res.total,1)}</strong></div><div class="prBox"><small>Presupuesto</small><strong>${money(res.budget)}</strong></div></div>
 <p><strong>Composición documental:</strong> ${format(res.baseHH,1)} H/H base (revisión interna normal incluida) + ${format(res.extraRevisionHH,1)} H/H por ${format(state.clientRounds,0)} ronda(s) extra de comentarios del cliente (factor de ${format(state.roundFactor*100,0)}% por ronda en actividades técnicas).</p>`;
 out+='<h2 class="prTitle">Horas por disciplina</h2><table class="prTable"><thead><tr><th>Especialidad</th><th style="text-align:right">H/H</th><th style="text-align:right">%</th></tr></thead><tbody>'+activeDisc.map(d=>`<tr><td>${esc(d.name)}</td><td style="text-align:right">${format(res.byDisc[d.id],1)}</td><td style="text-align:right">${format(res.total?100*res.byDisc[d.id]/res.total:0,1)}%</td></tr>`).join('')+'</tbody></table>';
 out+='<h2 class="prTitle">Horas por perfil</h2><table class="prTable"><thead><tr><th>Perfil</th><th style="text-align:right">H/H</th></tr></thead><tbody>'+byRoles+'</tbody></table>';
 out+='<h2 class="prTitle">Matriz contractual de entregables seleccionados</h2><table class="prTable"><thead><tr><th>ID / Etapa</th><th>Alcance incluido</th><th>Un.</th><th>Cant.</th><th style="text-align:right">H/H</th></tr></thead><tbody>'+
 res.rows.map(x=>`<tr><td>${esc(x.r.id)}<div>${esc(STAGE_LABEL[x.r.etapa])}</div></td><td><strong>${esc(x.r.entregable)}</strong><div style="font-size:9px;color:#65758b">${esc(x.r.contenido_referencia||x.r.incluye||'')}</div><div style="font-size:8px;color:#87929f">${esc(x.r.referencia_alcance?.seccion||'Alcance específico por definir')}</div></td><td>${esc(x.r.unidad)}</td><td>${format(x.q,1)}</td><td style="text-align:right">${format(x.hh,1)}</td></tr>`).join('')+'</tbody></table>';
 out+=`<h2 class="prTitle">Bases de la estimación, exclusiones y limitaciones</h2>
 <div class="prNote">La referencia CAI/CEPSI define el alcance y contenido documental, pero <strong>NO las horas unitarias de ingeniería</strong>. Las H/H de categoría C son hipótesis iniciales no calibradas; las B son referencias de casos o práctica de alcance limitado, no benchmarks universales. Las cantidades automáticas son reglas orientativas sin calibración estadística. No se incluye construcción, materiales, gastos de viaje, impuestos, márgenes ni honorarios de terceros; los adicionales dependen del contrato. No se utiliza un exponente 0,70 generalizado. Los factores LOD utilizados en la geometría 3D son hipótesis de calibración, no coeficientes oficiales. La tarifa es ${money(state.rate)} por H/H. <strong>Requiere validación por responsable técnico.</strong></div>
 <h2 class="prTitle">Observaciones del control de alcance</h2><div class="prNote">${res.warnings.length?res.warnings.map(esc).join(' · '):'No se emitieron advertencias automáticas.'}</div>
 <div class="prFoot">ESTIMA V4.4 · Fuente documental: CAI/CEPSI, Alcances de Ingeniería (SC01-01-0), Gestión Básica de Ingeniería en Proyectos y Modelo 3D, aportadas por el usuario. H/H no certificadas.</div>`;
 document.getElementById('printReport').innerHTML=out;
 window.print();
}
