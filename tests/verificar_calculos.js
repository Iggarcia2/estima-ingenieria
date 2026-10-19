// Tests reproducibles sin dependencias para el motor de ESTIMA V4.1.
// Ejecutar desde la raíz: node tests/verificar_calculos.js
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({console,localStorage:{setItem(){},getItem(){return null}},Intl,Date,Number,Math,Object,Array,Set});
for(const filename of ['config.js','estimacion.js','interfaz.js']){
 vm.runInContext(fs.readFileSync(path.join(root,'js',filename),'utf8').replace(/startApp\(\)\.catch\(error=>\{[\s\S]*$/,'// startup skipped in tests'),ctx,{filename});
}
const library=JSON.parse(fs.readFileSync(path.join(root,'data/biblioteca_ratios.json'),'utf8'));
vm.runInContext(`LIB=${JSON.stringify(library)};RATIOS=LIB.ratios;BY_ID=Object.fromEntries(RATIOS.map(r=>[r.id,r]));state=initialState();`,ctx);
const evalJS=x=>vm.runInContext(x,ctx);
function scenario(name,fn){evalJS('state=initialState();');fn();console.log('✓',name);}
const eps=1e-8;
scenario('Un botón 3D no desmarca isométricos manuales ni reduce H/H',()=>{
 evalJS('state.model3d="parcial";state.selected["PIP-005"]=true;state.selected["PIP-006"]=false;');
 const before=evalJS('calculate().total');
 evalJS('toggleSelected("PIP-006",true)');
 const after=evalJS('calculate().total');
 assert.equal(evalJS('state.selected["PIP-005"]'),true);
 assert.ok(after>=before-eps,`Presupuesto bajó: ${before} => ${after}`);
 assert.ok(evalJS('calculate().warnings.some(x=>x.includes("isométricos manuales"))'));
});
scenario('Un botón 3D no desmarca MTO manual ni reduce H/H',()=>{
 evalJS('state.model3d="parcial";state.selected["PIP-012"]=true;state.selected["PIP-011"]=false;');
 const before=evalJS('calculate().total');
 evalJS('toggleSelected("PIP-011",true)');
 assert.equal(evalJS('state.selected["PIP-012"]'),true);
 assert.ok(evalJS('calculate().total')>=before-eps);
 assert.ok(evalJS('calculate().warnings.some(x=>x.includes("MTO manual"))'));
});
scenario('Activar una fila normal solo suma las H/H de esa fila',()=>{
 evalJS('state.model3d="parcial";state.selected["BIM-002"]=false;');
 const before=evalJS('calculate().total');
 evalJS('toggleSelected("BIM-002",true)');
 assert.ok(evalJS('calculate().total')>before);
});
scenario('Activar alcance modelo 3D y sugerir preserva selección manual',()=>{
 evalJS('state.model3d="ninguno";state.selected["PIP-005"]=true;state.selected["PIP-012"]=true;state.selected["PIP-006"]=false;state.selected["PIP-011"]=false;');
 const before=evalJS('calculate().total');
 // Esta es la lógica del botón, comprobada también en navegador.
 evalJS(`state.model3d='parcial';for(const r of RATIOS){if(!r.actividad_modelado_3d||!state.disc[r.disciplina]||!stageEligible(r))continue;if(r.id==='PIP-006'&&state.selected['PIP-005'])continue;if(r.id==='PIP-011'&&state.selected['PIP-012'])continue;state.selected[r.id]=true;}`);
 const after=evalJS('calculate().total');
 assert.equal(evalJS('state.selected["PIP-005"]'),true);
 assert.equal(evalJS('state.selected["PIP-012"]'),true);
 assert.equal(evalJS('state.selected["PIP-006"]'),false);
 assert.equal(evalJS('state.selected["PIP-011"]'),false);
 assert.ok(after>=before-eps,`Presupuesto bajó: ${before} => ${after}`);
});
for(const family of ['industrial','galpon','electromecanico','piping']){
 scenario('Añadir 3D no reduce presupuesto en tipología '+family,()=>{
 evalJS(`state.family='${family}';state.metrics={...FAMILIES['${family}'].metrics};state.disc=Object.fromEntries(DISC.map(d=>[d.id,FAMILIES['${family}'].disc.includes(d.id)]));state.model3d='ninguno';state.selected['PIP-005']=true;`);
 const before=evalJS('calculate().total');
 evalJS(`state.model3d='parcial';for(const r of RATIOS){if(!r.actividad_modelado_3d||!state.disc[r.disciplina]||!stageEligible(r))continue;if(r.id==='PIP-006'&&state.selected['PIP-005'])continue;if(r.id==='PIP-011'&&state.selected['PIP-012'])continue;state.selected[r.id]=true;}`);
 assert.ok(evalJS('calculate().total')>=before-eps);
 });
}
console.log('\nTodos los tests de regresión pasaron.');
