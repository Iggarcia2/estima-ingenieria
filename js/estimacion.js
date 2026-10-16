/* ESTIMA · js/estimacion.js · proyecto estático sin compilación */
function getMetrics(){const m={};for(const [id] of METRICS)m[id]=safeNum(state.metrics[id],0,0,1e8);return m;}
// V1: Estas son reglas de generación de ALCANCE, no ratios físicos validados de H/H.
// Los conteos inferidos están identificados como "Supuesto" en la interfaz.
function quantityGuess(r){
 const m=getMetrics(), a=m.area,co=m.concrete,st=m.steel,eq=m.equipment,li=m.lines,pid=m.pid,pw=m.power,bo=m.boards,ci=m.circuits,ins=m.instruments,lo=m.loops,io=m.io;
 const ceil=(n,den)=>n>0?Math.ceil(n/den):0;
 const map={
 n_bfd:ceil(pid,5),n_alternativas:(pid||eq)?2:0,n_pfd:ceil(pid,3),n_balances:ceil(eq,5),n_pid:pid,n_pid_detalle:pid,n_filosofias:pid>0?1:0,
 n_implantaciones:a>0?1:0,n_planos_civiles:ceil(a,1500),n_tipos_fundacion:ceil(co,80),n_planos_fundacion:ceil(co,130),n_planos_armadura:ceil(co,200),n_planos_arquitectura:ceil(a,1200),n_planos_drenaje:a>2000?ceil(a,2500):0,
 n_soluciones_estructurales:st>0?1:0,n_modelos_estructurales:st>0?1:0,n_planos_estructurales:ceil(st,12),n_tipos_uniones:ceil(st,20),n_planos_uniones:ceil(st,15),n_listados_estructuras:st>0?1:0,n_planos_taller:ceil(st,5),
 n_equipos_principales:eq,n_planos_disposicion_equipos:ceil(eq,8),n_paquetes_proveedor:eq,n_planos_montaje:ceil(eq,5),n_especificaciones_mecanicas:ceil(eq,5),n_sistemas_auxiliares:ceil(eq,12),
 n_plotplans_piping:li>0?1:0,n_planos_piping_2d:ceil(li,6),n_equipos_modelados:eq,n_lineas_modeladas:li,n_isometricos_manuales:li,n_isometricos_3d:li,n_lineas:li,n_lineas_criticas:ceil(li*0.12,1),n_clases_piping:ceil(li,35),n_tieins:ceil(li*0.05,1),n_soportes_especiales:ceil(li*.1,1),
 n_listados_carga:pw>0?1:0,n_unifilares:bo>0?bo:(pw>0?1:0),n_planos_electricos_genericos:bo>0?ceil(bo,2):0,n_planos_bandejas:bo>0?ceil(bo,2):0,n_circuitos_calculados:ci,n_tableros:bo,n_ambientes_iluminacion:ceil(a,500),n_sistemas_tierra:pw>0?1:0,
 n_filosofias_control:ins>0?1:0,n_instrumentos:ins,n_sistemas_control:ins>0?1:0,n_planos_instrumentacion_genericos:ceil(ins,25),n_lazos:lo,n_tipos_hookup:ceil(ins,12),n_instrumentos_especificados:ins,n_senales_io:io,n_matrices_causa_efecto:ceil(lo,25),
 n_hazid:(a||eq||li)?1:0,n_matrices_riesgo:(a||eq||li)?1:0,n_matrices_ambientales:(a||eq||li)?1:0,n_planos_emergencia:ceil(a,1500),n_planos_senializacion:ceil(a,1500),n_estudios_hse:(eq||li)?1:0,
 n_hh_reunion_inicial:3,n_participaciones_reuniones:6,n_documentos_rondas_extra:0,n_emisiones:10
 };
 return safeNum(map[r.variable_cantidad],0,0,100000000);
}
function opts(r){return state.overrides[r.id]||{};}
function qty(r,direct=0,piping=0){if(r.metodo==='fraction_of_direct')return direct;if(r.metodo==='fraction_of_piping')return piping;const o=opts(r);return state.mode==='detallado'&&o.quantity!==undefined?safeNum(o.quantity,0):quantityGuess(r);}
function active(r){return !!state.selected[r.id]&&!!state.disc[r.disciplina]&&!!state.stages[r.etapa];}
function lineCompute(r,q){const o=opts(r);const rate=safeNum(o.rate??r.hh_unitarias,r.hh_unitarias,0,1e6);const fc=safeNum(o.complexity??1,1,0,20);const fr=safeNum(o.repetition??1,1,0,20);const h=q*rate*fc*fr;return {r,q,rate,fc,fr,hh:Number.isFinite(h)?h:0};}
function calculate(){
 const rows=[],byDisc=Object.fromEntries(DISC.map(d=>[d.id,0])),byRole=Object.fromEntries(Object.keys(ROLE_LABEL).map(k=>[k,0]));let direct=0,piping=0,indirect=0;
 for(const r of RATIOS.filter(r=>r.disciplina!=='GES')){if(!active(r))continue;const row=lineCompute(r,qty(r));rows.push(row);direct+=row.hh;byDisc[r.disciplina]+=row.hh;if(r.disciplina==='PIP')piping+=row.hh;}
 for(const r of RATIOS.filter(r=>r.disciplina==='GES')){if(!active(r))continue;const row=lineCompute(r,qty(r,direct,piping));rows.push(row);indirect+=row.hh;byDisc.GES+=row.hh;}
 for(const row of rows){const parts=row.r.reparto_perfiles_propuesto||{};const total=Object.values(parts).reduce((acc,val)=>acc+safeNum(val,0),0)||1;for(const [role,pct] of Object.entries(parts)){if(role in byRole)byRole[role]+=row.hh*(safeNum(pct,0)/total);}}
 const total=direct+indirect, byClass={C:0,'B-caso':0,'B-practica':0};for(const x of rows)byClass[x.r.clasificacion]=(byClass[x.r.clasificacion]||0)+1;
 const warnings=[];
 if(rows.some(x=>x.r.id==='PRO-006')&&!rows.some(x=>x.r.id==='PRO-005')&&state.baseline!=='basica')warnings.push('El P&ID de detalle está valorizado como revisión incremental: verificar que exista un P&ID previo utilizable o incorporar las horas de base.');
 if(rows.some(x=>x.r.id==='PIP-002')&&rows.some(x=>x.r.id==='PIP-004'))warnings.push('Revisar superposición: dibujo de piping 2D y modelado 3D pueden incluir el mismo trabajo de diseño.');
 if(rows.some(x=>x.r.id==='GES-003')&&rows.some(x=>x.r.id==='GES-006'))warnings.push('Coordinación global y supervisión específica de piping podrían solaparse.');
 if(!state.disc.GES)warnings.push('Gestión desactivada: no se están imputando reuniones, coordinación ni emisiones generales.');
 if(state.stages.detalle&&!state.stages.basica&&state.baseline!=='basica')warnings.push('Detalle sin básica incluida: confirmar que la ingeniería básica esté disponible y sea suficiente. Si no existe, completar las actividades requeridas manualmente.');
 if(state.stages.basica&&!state.stages.conceptual&&state.baseline==='ninguna')warnings.push('Básica sin conceptual incluida: verificar que los criterios y alternativas iniciales estén definidos o incorporar el trabajo faltante.');
 if(state.stageSelection==='manual')warnings.push('Etapas seleccionadas manualmente: validar dependencias y documentación de partida; no se añadieron etapas de forma automática.');
 if(state.baseline!=='ninguna')warnings.push('La estimación supone que la ingeniería '+STAGE_LABEL[state.baseline]+' existente es suficiente, está aprobada y es reutilizable. Verificarla antes de contratar.');
 if(!state.stages.detalle&&state.disc.GES&&state.selected['GES-003'])warnings.push('La coordinación porcentual (GES-003) se imputa actualmente en la etapa de detalle; si cotizás solo conceptual o básica, presupuestá la coordinación adicional en la matriz.');
 if(!rows.length)warnings.push('No hay entregables activos con las etapas y disciplinas seleccionadas.');
 if(rows.some(x=>x.r.clasificacion==='C'))warnings.push('El cálculo incluye actividades con H/H categoría C: hipótesis de arranque sin calibración empírica.');
 if(rows.some(x=>x.r.disciplina==='CIV'||x.r.disciplina==='EST')&&getMetrics().area>0&&getMetrics().steel===0&&state.disc.EST)warnings.push('Revisar magnitudes: hay superficie civil pero el tonelaje estructural es cero.');
 return {rows,direct,indirect,total,budget:total*state.rate,byDisc,byRole,byClass,warnings};
}
