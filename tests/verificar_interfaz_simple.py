"""Pruebas funcionales de ESTIMA V5 con navegador Chromium local, sin servidor HTTP.
Ejecutar: python tests/verificar_interfaz_simple.py
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json, re
root=Path(__file__).resolve().parents[1]
lib=json.loads((root/'data/biblioteca_ratios.json').read_text())
cal=json.loads((root/'data/calibracion.json').read_text())
html=(root/'index.html').read_text()
html=re.sub(r'<script[^>]*src=[^>]+></script>','',html)
html=re.sub(r'<link[^>]*>', '',html)
def load(page):
 page.goto('about:blank');page.set_content(html)
 page.evaluate('''data=>{window._saved={};Object.defineProperty(window,'localStorage',{configurable:true,value:{setItem(k,v){window._saved[k]=v},getItem(k){return window._saved[k]||null}}});window.fetch=async url=>({ok:true,json:async()=>url.includes('calibracion')?data.cal:data.lib});}''',{'lib':lib,'cal':cal})
 for css in ['base.css','hydra.css','simple.css']:
  page.add_style_tag(content=(root/'css'/css).read_text())
 for js in ['config.js','estimacion.js','interfaz.js','exportacion.js','app.js','simple.js']:
  page.add_script_tag(content=(root/'js'/js).read_text())
 page.wait_for_function('typeof state!=="undefined" && !!window.__ultimaEstimacion',timeout=10000)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 pg=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 load(pg)
 assert pg.locator('.simpleSection').count()==3
 assert pg.locator('.simpleKpi').count()==2
 before=pg.evaluate('calculate().total')
 pg.locator('[data-key="metric:area"]').fill('2100')
 after=pg.evaluate('calculate().total')
 assert before!=after,(before,after)
 assert pg.evaluate('state.metrics.area')==2100
 # Independencia de etapas
 pg.locator('[data-check="stage"][data-id="conceptual"]').uncheck()
 assert pg.evaluate('state.stages.conceptual') is False
 pg.locator('[data-simple-tab="entregables"]').first.click()
 assert pg.locator('.resultPane[data-tab="entregables"]').is_visible()
 pg.locator('.simpleDiscDetails').first.locator('summary').first.click()
 assert pg.locator('.simpleDiscDetails').first.get_attribute('open') is not None
 pg.locator('[data-action="mode:detallado"]').click()
 assert pg.evaluate('state.mode')=='detallado'
 assert pg.locator('.simpleDiscDetails').first.get_attribute('open') is not None, 'se colapsó al recalcular'
 input_rate=pg.locator('.simpleDiscDetails[open] [data-key^="unit:"]').first
 rate_key=input_rate.get_attribute('data-key')
 current=float(input_rate.input_value())
 input_rate.fill(str(current+3))
 assert pg.evaluate('(k)=>state.overrides[k.split(":")[1]].rate',rate_key)==current+3
 print('✓ cambio métricas, etapas y H/H unitarias')
 # Opciones 3D
 adv=pg.locator('[data-stay="avanzadas"]');adv.locator('summary').first.click()
 model=pg.locator('[data-stay="3d"]');model.locator('summary').first.click()
 pg.locator('[data-3d-select="model3d"]').select_option('integral')
 pg.locator('[data-3d-select="lod"]').select_option('400')
 assert pg.locator('[data-stay="avanzadas"]').get_attribute('open') is not None
 assert pg.locator('[data-stay="3d"]').get_attribute('open') is not None
 prev=pg.evaluate('preview3d()'); start=pg.evaluate('calculate().total')
 assert prev['delta']>=-0.001,prev['delta']
 pg.locator('[data-action="3d-apply"]').click()
 end=pg.evaluate('calculate().total')
 assert abs(end-prev['next']['total'])<1e-4,(end,prev['next']['total'])
 assert end>=start-.0001
 print('✓ 3D + LOD se aplican explícitamente, deltas correctos',round(end-start,2))
 # ayuda y calibración avanzada
 pg.locator('[data-simple-tab="avanzado"]').first.click()
 guide=pg.locator('[data-stay="guia"]'); guide.locator('summary').first.click()
 assert guide.locator('.simpleStageGuide').is_visible()
 pg.locator('[data-stay="ratios"] > summary').click()
 calInput=pg.locator('[data-key="calphys:concrete"]')
 calInput.fill('0.8')
 calInput.press('Tab')
 assert pg.evaluate('CALIBRATION.physicalHH.concrete')==0.8
 assert pg.evaluate('JSON.parse(window._saved[CALIBRATION_KEY]).physicalHH.concrete')==0.8
 print('✓ guía y calibración guardada localmente')
 # volver a docs y comprobar que funciona descargar JSON
 with pg.expect_download() as result:
  pg.locator('.topbar [data-action="save"]').click()
 assert result.value.suggested_filename.endswith('.json')
 pg.evaluate('window.print=()=>{window._printCalled=true}')
 pg.locator('.simpleResultActions [data-action="print"]').click()
 assert pg.evaluate('!!window._printCalled')
 assert pg.locator('#printReport').inner_text().strip()!=''
 print('✓ PDF/impresión genera reporte')
 pg.locator('[data-simple-tab="resumen"]').first.click()
 pg.screenshot(path='/mnt/data/ESTIMA_V5_preview_desktop.png',full_page=False)
 assert not errors,errors
 print('✓ sin errores JS desktop')
 mb=browser.new_page(viewport={'width':390,'height':844})
 merr=[];mb.on('pageerror',lambda e:merr.append(str(e)))
 load(mb)
 mb.screenshot(path='/mnt/data/ESTIMA_V5_preview_movil.png',full_page=True)
 dims=mb.evaluate('({page:document.documentElement.scrollWidth,viewport:innerWidth})')
 assert dims['page']<=dims['viewport']+2,dims
 assert mb.locator('#mobileTotals').is_visible()
 mb.locator('[data-key="metric:area"]').fill('2250')
 assert mb.locator('#mobileTotals').inner_text().strip()!=''
 assert not merr,merr
 print('✓ visualización móvil sin desbordamiento',dims)
 browser.close()
