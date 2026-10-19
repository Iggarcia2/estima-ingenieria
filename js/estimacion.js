/* ESTIMA · js/estimacion.js · proyecto estático sin compilación */
function getMetrics(){const m={};for(const [id] of METRICS)m[id]=safeNum(state.metrics[id],0,0,1e8);return m;}
// V1: Estas son reglas de generación de ALCANCE, no ratios físicos validados de H/H.
// Los conteos inferidos están identificados como "Supuesto" en la interfaz.
function quantityGuess(r){
 const m=getMetrics(), a=m.area,co=m.concrete,st=m.steel,eq=m.equipment,li=m.lines,pid=m.pid,pw=m.power,bo=m.boards,ci=m.circuits,ins=m.instruments,lo=m.loops,io=m.io;
 const ceil=(n,den)=>n>0?Math.ceil(n/den):0;
 const map={
 n_bfd:ceil(pid,5),n_alternativas:(pid||eq)?2:0,n_pfd:ceil(pid,3),n_balances:ceil(eq,5),n_pid:pid,n_pid_detalle:pid,n_filosofias:pid>0?1:0,
 n_implantaciones:a>0?1:0,n_planos_civiles:ceil(a,calibrationDriver('m2_por_plano_civil',1500)),n_tipos_fundacion:ceil(co,calibrationDriver('m3_por_tipo_fundacion',80)),n_planos_fundacion:ceil(co,calibrationDriver('m3_por_plano_fundacion',130)),n_planos_armadura:ceil(co,calibrationDriver('m3_por_plano_armadura',200)),n_planos_arquitectura:ceil(a,1200),n_planos_drenaje:a>2000?ceil(a,2500):0,
 n_soluciones_estructurales:st>0?1:0,n_modelos_estructurales:st>0?1:0,n_planos_estructurales:ceil(st,calibrationDriver('t_por_plano_estructural',12)),n_tipos_uniones:ceil(st,calibrationDriver('t_por_tipo_union',20)),n_planos_uniones:ceil(st,calibrationDriver('t_por_plano_uniones',15)),n_listados_estructuras:st>0?1:0,n_planos_taller:ceil(st,calibrationDriver('t_por_plano_taller',5)),
 n_equipos_principales:eq,n_planos_disposicion_equipos:ceil(eq,8),n_paquetes_proveedor:eq,n_planos_montaje:ceil(eq,5),n_especificaciones_mecanicas:ceil(eq,calibrationDriver('equipos_por_especificacion',5)),n_sistemas_auxiliares:ceil(eq,12),
 n_plotplans_piping:li>0?1:0,n_planos_piping_2d:ceil(li,6),n_equipos_modelados:eq,n_lineas_modeladas:li,n_isometricos_manuales:li,n_isometricos_3d:li,n_lineas:li,n_lineas_criticas:ceil(li*0.12,1),n_clases_piping:ceil(li,35),n_tieins:ceil(li*0.05,1),n_soportes_especiales:ceil(li*.1,1),
 n_listados_carga:pw>0?1:0,n_unifilares:bo>0?bo:(pw>0?1:0),n_planos_electricos_genericos:bo>0?ceil(bo,2):0,n_planos_bandejas:bo>0?ceil(bo,2):0,n_circuitos_calculados:ci,n_tableros:bo,n_ambientes_iluminacion:ceil(a,500),n_sistemas_tierra:pw>0?1:0,
 n_filosofias_control:ins>0?1:0,n_instrumentos:ins,n_sistemas_control:ins>0?1:0,n_planos_instrumentacion_genericos:ceil(ins,25),n_lazos:lo,n_tipos_hookup:ceil(ins,12),n_instrumentos_especificados:ins,n_senales_io:io,n_matrices_causa_efecto:ceil(lo,25),
 n_hazid:(a||eq||li)?1:0,n_matrices_riesgo:(a||eq||li)?1:0,n_matrices_ambientales:(a||eq||li)?1:0,n_planos_emergencia:ceil(a,1500),n_planos_senializacion:ceil(a,1500),n_estudios_hse:(eq||li)?1:0,
 n_hh_reunion_inicial:3,n_participaciones_reuniones:6,n_documentos_rondas_extra:0,n_emisiones:10,
 n_bases_diseno:1,n_sistemas_civiles:co>0||a>0?1:0,n_estudios_suelos:co>0?1:0,n_computos_civiles:co>0?1:0,n_sistemas_estructurales:st>0?1:0,
 n_equipos_criticos:eq>0?Math.max(1,Math.ceil(eq*.15)):0,n_sistemas_piping:li>0?1:0,n_areas_piping:ceil(li,30),n_salaselectricas:pw>0?ceil(pw,1000):0,n_sistemas_electricos:pw>0?1:0,
 n_valvulas_control:ceil(ins*.12,1),n_planos_i_canales:ceil(ins,35),n_hazop_nodos:pid>0?Math.ceil(pid*2):0,n_pei:1,n_libros_finales:1,
 n_areas_3d_civil:co>0?ceil(co,300):0,n_areas_3d_est:st>0?ceil(st,50):0,n_areas_3d_elec:pw>0?ceil(pw,1200):0,n_areas_3d_ins:ins>0?ceil(ins,120):0,
 n_reviews_3d:3,n_reportes_clash:3,n_areas_3d_coord:(st||co||pw||li)?Math.max(1,ceil(a,1600)):0
 };
 return safeNum(map[r.variable_cantidad],0,0,100000000);
}
function opts(r){return state.overrides[r.id]||{};}
function qty(r,direct=0,piping=0){if(r.metodo==='fraction_of_direct')return direct;if(r.metodo==='fraction_of_piping')return piping;const o=opts(r);return state.mode==='detallado'&&o.quantity!==undefined?safeNum(o.quantity,0):quantityGuess(r);}
function stageEligible(r){return r.etapa==='basica_ext'?!!state.stages.basica&&state.basicScope==='extendida':!!state.stages[r.etapa];}
function modelEligible(r){return !r.actividad_modelado_3d||state.model3d!=='ninguno';}
function active(r){return !!state.selected[r.id]&&!!state.disc[r.disciplina]&&stageEligible(r)&&modelEligible(r);}
function lineCompute(r,q){const o=opts(r);const rate=safeNum(o.rate??effectiveRate(r),effectiveRate(r),0,1e6);const fc=safeNum(o.complexity??1,1,0,20);const fr=safeNum(o.repetition??1,1,0,20);const lodFactor=lodMultiplier(r);const h=q*rate*fc*fr*lodFactor;const hhBase=Number.isFinite(h)?h:0;
 const rounds=state.clientRounds||0;const rr=state.roundFactor||0;const revisionExtra=(r.disciplina==='GES'||r.metodo!=='quantity')?0:hhBase*rounds*rr;
 const hh=hhBase+revisionExtra;return {r,q,rate,fc,fr,lodFactor,hhBase,revisionExtra,hh};}
function calculate(){
 const rows=[],byDisc=Object.fromEntries(DISC.map(d=>[d.id,0])),byRole=Object.fromEntries(Object.keys(ROLE_LABEL).map(k=>[k,0]));let direct=0,piping=0,indirect=0;
 for(const r of RATIOS.filter(r=>r.disciplina!=='GES')){if(!active(r))continue;const row=lineCompute(r,qty(r));rows.push(row);direct+=row.hh;byDisc[r.disciplina]+=row.hh;if(r.disciplina==='PIP')piping+=row.hh;}
 // Aportes FÍSICOS COMPLEMENTARIOS explícitos. Por defecto son 0 para prevenir doble cómputo.
 // Cada aporte aparece como fila auditable, con participación y tarifa por unidad en calibración.
 if(STAGE_ORDER.some(k=>state.stages[k]))for(const d of PHYSICAL_DRIVERS){
  if(!state.disc[d.disc])continue;
  const rate=safeNum(CALIBRATION?.physicalHH?.[d.id],0,0,1e5),q=safeNum(state.metrics[d.id],0,0,1e9);
  if(!rate||!q)continue;
  const phase=state.stages.basica?'basica':state.stages.detalle?'detalle':'conceptual';
  const r={id:'FIS-'+d.id,disciplina:d.disc,etapa:phase,entregable:'Aporte paramétrico adicional · '+d.label,unidad:d.unit,metodo:'quantity',hh_unitarias:rate,clasificacion:'C',reparto_perfiles_propuesto:{ingeniero:0.65,proyectista:0.25,revisor:0.10},contenido_referencia:'Ajuste complementario explícito; verificar que no duplique documentación incluida.',incluye:'Solo esfuerzo adicional definido por el estimador; no representa un ratio normalizado.',no_incluye:'Horas ya valoradas en otros entregables.'};
  const row={r,q,rate,fc:1,fr:1,hhBase:q*rate,revisionExtra:0,hh:q*rate};
  rows.push(row);direct+=row.hh;byDisc[d.disc]+=row.hh;
  if(d.disc==='PIP')piping+=row.hh;
 }
 for(const r of RATIOS.filter(r=>r.disciplina==='GES')){if(!active(r))continue;const row=lineCompute(r,qty(r,direct,piping));rows.push(row);indirect+=row.hh;byDisc.GES+=row.hh;}
 for(const row of rows){const parts=row.r.reparto_perfiles_propuesto||{};const totalPct=Object.values(parts).reduce((acc,val)=>acc+safeNum(val,0),0)||1;for(const [role,pct] of Object.entries(parts)){if(role in byRole)byRole[role]+=row.hhBase*(safeNum(pct,0)/totalPct);}
 // Extra rondas de cliente: horas INCREMENTALES; reparto a ingeniero/revisor para no duplicar QA estándar.
 if(row.revisionExtra){byRole.revisor+=row.revisionExtra*0.5;byRole.ingeniero+=row.revisionExtra*0.5;} }
 const total=direct+indirect, byClass={C:0,'B-caso':0,'B-practica':0};for(const x of rows)byClass[x.r.clasificacion]=(byClass[x.r.clasificacion]||0)+1;
 const warnings=[];
 const extraRevisionHH=rows.reduce((t,x)=>t+x.revisionExtra,0), baseHH=rows.reduce((t,x)=>t+x.hhBase,0);
 const byStage=Object.fromEntries(['conceptual','basica','basica_ext','detalle'].map(k=>[k,0]));for(const x of rows)byStage[x.r.etapa]+=x.hh;
 if(state.clientRounds>0&&rows.some(x=>x.r.id==='GES-004'))warnings.push('Las rondas de cliente se agregaron por factor y también está activo GES-004: confirmar que no exista superposición.');
 if(state.basicScope==='extendida'&&!state.stages.basica)warnings.push('Básica extendida no se aplica porque la etapa Básica no está seleccionada.');
 if(state.model3d==='integral'&&!rows.some(x=>x.r.actividad_modelado_3d))warnings.push('Modelo 3D integral seleccionado, pero no hay actividades 3D activas. Revisar matriz y habilitar entregables de modelado.');
 if(state.model3d!=='ninguno'&&state.lod==='definir'&&rows.some(x=>x.r.actividad_modelado_3d))warnings.push('Definir contractual y técnicamente el nivel de desarrollo (LOD) del modelo 3D.');
 if(rows.some(x=>GEOMETRY_3D_IDS.has(x.r.id)))warnings.push('Los factores LOD de las horas de modelado geométrico son hipótesis ajustables en Calibración, no coeficientes oficiales CAI ni BIM.');
 if(rows.some(x=>x.r.id==='PRO-006')&&!rows.some(x=>x.r.id==='PRO-005')&&state.baseline!=='basica')warnings.push('El P&ID de detalle está valorizado como revisión incremental: verificar que exista un P&ID previo utilizable o incorporar las horas de base.');
 if(rows.some(x=>x.r.id==='PIP-002')&&rows.some(x=>x.r.id==='PIP-004'))warnings.push('Revisar superposición: dibujo de piping 2D y modelado 3D pueden incluir el mismo trabajo de diseño.');
 if(rows.some(x=>x.r.id==='PIP-005')&&rows.some(x=>x.r.id==='PIP-006'))warnings.push('ATENCIÓN: isométricos manuales y extracción 3D incluidos. Si corresponden a las mismas líneas, se están duplicando H/H. Elegir el método apropiado o repartir cantidades explícitamente.');
 if(rows.some(x=>x.r.id==='PIP-011')&&rows.some(x=>x.r.id==='PIP-012'))warnings.push('ATENCIÓN: MTO manual y MTO desde CAD incluidos. Si corresponden al mismo alcance, se están duplicando H/H. Elegir un método o dividir cantidades explícitamente.');
 if(rows.some(x=>x.r.id==='GES-003')&&rows.some(x=>x.r.id==='GES-006'))warnings.push('Coordinación global y supervisión específica de piping podrían solaparse.');
 if(!state.disc.GES)warnings.push('Gestión desactivada: no se están imputando reuniones, coordinación ni emisiones generales.');
 if(state.stages.detalle&&!state.stages.basica&&state.baseline!=='basica')warnings.push('Detalle sin básica incluida: confirmar que la ingeniería básica esté disponible y sea suficiente. Si no existe, completar las actividades requeridas manualmente.');
 if(state.stages.basica&&!state.stages.conceptual&&state.baseline==='ninguna')warnings.push('Básica sin conceptual incluida: verificar que los criterios y alternativas iniciales estén definidos o incorporar el trabajo faltante.');
 if(state.stageSelection==='manual')warnings.push('Etapas seleccionadas manualmente: validar dependencias y documentación de partida; no se añadieron etapas de forma automática.');
 if(state.baseline!=='ninguna')warnings.push('La estimación supone que la ingeniería '+STAGE_LABEL[state.baseline]+' existente es suficiente, está aprobada y es reutilizable. Verificarla antes de contratar.');
 if(!state.stages.detalle&&state.disc.GES&&state.selected['GES-003'])warnings.push('La coordinación porcentual (GES-003) se imputa actualmente en la etapa de detalle; si cotizás solo conceptual o básica, presupuestá la coordinación adicional en la matriz.');
 if(rows.some(x=>x.r.id.startsWith('FIS-')))warnings.push('Aportes físicos complementarios activos: confirmar que NO se superponen con las H/H de documentos y cálculos ya seleccionados. Los ratios son hipótesis editables, no valores normalizados.');
 if(!rows.length)warnings.push('No hay entregables activos con las etapas y disciplinas seleccionadas.');
 if(rows.some(x=>x.r.clasificacion==='C'))warnings.push('El cálculo incluye actividades con H/H categoría C: hipótesis de arranque sin calibración empírica.');
 if(rows.some(x=>x.r.disciplina==='CIV'||x.r.disciplina==='EST')&&getMetrics().area>0&&getMetrics().steel===0&&state.disc.EST)warnings.push('Revisar magnitudes: hay superficie civil pero el tonelaje estructural es cero.');
 return {rows,direct,indirect,total,budget:total*state.rate,byDisc,byRole,byClass,byStage,baseHH,extraRevisionHH,warnings};
}
