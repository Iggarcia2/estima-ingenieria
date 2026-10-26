"""ESTIMA v5.1: regresión del cursor y pantallas de diferentes tamaños.
Ejecutar: python tests/verificar_entrada_y_responsive.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re

ROOT=Path(__file__).resolve().parents[1]
lib=json.loads((ROOT/'data/biblioteca_ratios.json').read_text())
cal=json.loads((ROOT/'data/calibracion.json').read_text())
html=(ROOT/'index.html').read_text()
html=re.sub(r'<script[^>]*src=[^>]+></script>','',html)
html=re.sub(r'<link[^>]*>', '',html)

def load(pg):
 pg.goto('about:blank')
 pg.set_content(html)
 pg.evaluate("""data=>{window._saved={};Object.defineProperty(window,'localStorage',{configurable:true,value:{setItem(k,v){window._saved[k]=v},getItem(k){return window._saved[k]||null}}});window.fetch=async url=>({ok:true,json:async()=>url.includes('calibracion')?data.cal:data.lib});}""",{'lib':lib,'cal':cal})
 for css in ['base.css','hydra.css','simple.css','responsive.css']:
  pg.add_style_tag(content=(ROOT/'css'/css).read_text())
 for js in ['config.js','estimacion.js','interfaz.js','exportacion.js','app.js','simple.js']:
  pg.add_script_tag(content=(ROOT/'js'/js).read_text())
 pg.wait_for_function('window.__ultimaEstimacion?.hh_totales > 0',timeout=15000)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':1440,'height':900},accept_downloads=True,locale='es-AR')
 pg=ctx.new_page()
 errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 load(pg)

 def typer(selector,value,key):
  inp=pg.locator(selector).first
  inp.click()
  inp.press('ControlOrMeta+A')
  inp.press('Backspace')
  inp.type(value,delay=60)
  actual=inp.input_value()
  assert actual==value,(key,actual,value)
  assert pg.evaluate('document.activeElement?.dataset.key')==key,(key,'focus lost')
  return actual

 # El mismo teclado, no fill: reproduce exactamente el bug 125 -> 521.
 typer('[data-key="metric:area"]','125','metric:area')
 assert pg.evaluate('state.metrics.area')==125
 assert pg.locator('.simpleKpi').first.locator('strong').inner_text()==pg.evaluate('format(calculate().total,1)')
 typer('[data-key="rate"]','125','rate')
 assert pg.evaluate('state.rate')==125
 typer('[data-key="metric:concrete"]','125','metric:concrete')
 assert pg.evaluate('state.metrics.concrete')==125
 pg.locator('[data-simple-tab="entregables"]').first.click()
 pg.locator('[data-action="mode:detallado"]').click()
 d=pg.locator('.simpleDiscDetails').first
 d.locator('summary').first.click()
 field=d.locator('[data-key^="unit:"]').first
 key=field.get_attribute('data-key')
 typer(f'[data-key="{key}"]','125',key)
 assert pg.evaluate('(key)=>state.overrides[key.split(":")[1]].rate',key)==125
 # El filtro debe reaccionar en tiempo real, sin mover el cursor.
 inp=pg.locator('[data-key="filter"]')
 inp.fill('')
 inp.type('memoria',delay=30)
 assert inp.input_value()=='memoria'
 assert pg.evaluate('state.filter')=='memoria'
 pg.locator('[data-simple-tab="avanzado"]').first.click()
 cal=pg.locator('[data-stay="ratios"]')
 cal.locator('summary').first.click()
 # Espacios de calibración permanecen editables sin invertir la escritura.
 typer('[data-key="calphys:concrete"]','125','calphys:concrete')
 assert pg.evaluate('CALIBRATION.physicalHH.concrete')==125
 # Al salir del campo se completa la actualización sin borrar el resultado ni el ajuste.
 pg.locator('[data-simple-tab="resumen"]').first.click()
 pg.wait_for_timeout(300)
 assert pg.evaluate('state.rate')==125
 assert pg.evaluate('CALIBRATION.physicalHH.concrete')==125
 assert not errors,errors
 print('✓ teclado continuo 125, sin inversión (métricas, tarifa, entregables, calibración y búsqueda)')

 # Casos de escritorio, tablet, celular vertical, celular muy angosto y horizontal.
 variants=[(1920,1080),(1440,900),(1280,720),(1100,800),(1024,768),(900,650),(768,1024),(680,800),(430,932),(390,844),(375,667),(320,568),(844,390)]
 for w,h in variants:
  page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
  perrors=[];page.on('pageerror',lambda e:perrors.append(str(e)))
  load(page)
  dims=page.evaluate('''()=>({doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,view:innerWidth,grid:getComputedStyle(document.querySelector('.gridMain')).display,cols:getComputedStyle(document.querySelector('.gridMain')).gridTemplateColumns,bar:getComputedStyle(document.getElementById('mobileTotals')).display})''')
  assert dims['doc']<=w+2,(w,h,'overflow',dims)
  assert dims['body']<=w+2,(w,h,'body overflow',dims)
  if w<=1100:assert dims['bar']!='none',(w,'totals unavailable')
  if w>1100:assert dims['bar']=='none',(w,'totals on desktop')
  if w==390:
   page.screenshot(path='/mnt/data/ESTIMA_V5_1_movil.png',full_page=True)
   page.locator('[data-simple-tab="entregables"]').first.click()
   detail=page.locator('.simpleDiscDetails').first
   detail.locator('summary').first.click()
   assert page.locator('.simpleMatrixTable .estTable thead').first.evaluate('el=>getComputedStyle(el).display')=='none'
   page.screenshot(path='/mnt/data/ESTIMA_V5_1_tarjetas.png',full_page=True)
  if w==1024:page.screenshot(path='/mnt/data/ESTIMA_V5_1_tablet.png',full_page=True)
  if w==1440:page.screenshot(path='/mnt/data/ESTIMA_V5_1_escritorio.png',full_page=False)
  assert not perrors,(w,perrors)
  print('✓',f'{w}×{h}',dims)
  page.close()
 browser.close()
print('✓ Todas las pruebas V5.1 terminadas')
