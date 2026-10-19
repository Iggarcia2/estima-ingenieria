"""Prueba funcional navegador Chromium para ESTIMA V6 sin red ni servidor.
python tests/verificar_asistente_v6.py
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
lib=json.loads((root/'data/biblioteca_ratios.json').read_text())
cal=json.loads((root/'data/calibracion.json').read_text())
html=(root/'index.html').read_text()
html=re.sub(r'<script[^>]*src=[^>]+></script>','',html)
html=re.sub(r'<link[^>]*>','',html)

def load(page):
 page.goto('about:blank');page.set_content(html)
 page.evaluate('''data=>{window._saved={};Object.defineProperty(window,'localStorage',{configurable:true,value:{setItem(k,v){window._saved[k]=v},getItem(k){return window._saved[k]||null}}});window.fetch=async url=>({ok:true,json:async()=>url.includes('calibracion')?data.cal:data.lib});}''',{'lib':lib,'cal':cal})
 for css in ['base.css','hydra.css','simple.css','wizard.css']:
  page.add_style_tag(content=(root/'css'/css).read_text())
 for js in ['config.js','estimacion.js','interfaz.js','exportacion.js','app.js','simple.js','wizard.js']:
  page.add_script_tag(content=(root/'js'/js).read_text())
 page.wait_for_function('typeof state!=="undefined" && !!window.__ultimaEstimacion',timeout=15000)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 desktop=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 errors=[];desktop.on('pageerror',lambda e:errors.append(str(e)))
 load(desktop)
 assert desktop.locator('.guidedMode').count()==1
 assert desktop.locator('.wStep').count()==5
 assert desktop.locator('.wHeading h1').is_visible()
 assert desktop.locator('[data-wizard-step="2"]').count()>=1
 print('✓ 5 pasos renderizados')
 firstHH=desktop.evaluate('calculate().total')
 desktop.locator('.wMain [data-key="project"]').fill('Galpón piloto')
 desktop.locator('.wMain [data-select="family"]').select_option('galpon')
 desktop.locator('[data-check="stage"][data-id="conceptual"]').uncheck()
 assert desktop.evaluate('state.stageSelection')=='manual'
 assert desktop.evaluate('state.project')=='Galpón piloto'
 desktop.locator('.wFooterNav [data-wizard-step="2"]').click()
 assert desktop.locator('h1').first.inner_text()=='¿Qué dimensiones tiene?'
 assert desktop.locator('[data-key="metric:area"]').count()==1
 assert desktop.locator('[data-key="metric:pid"]').count()==0
 desktop.locator('[data-key="metric:area"]').fill('2400')
 assert desktop.evaluate('state.metrics.area')==2400
 desktop.locator('.wFooterNav [data-wizard-step="3"]').click()
 assert desktop.locator('.wDocRow').count()>0
 assert desktop.evaluate('state.project')=='Galpón piloto'
 print('✓ datos, etapas y métricas condicionadas por tipología')
 disc=desktop.locator('.wDiscBlock').first
 disc.locator('summary').first.click()
 candidate=disc.locator('.wDocCheck input').first
 wasChecked=candidate.is_checked();b=desktop.evaluate('calculate().total')
 if wasChecked:candidate.uncheck()
 else:candidate.check()
 c=desktop.evaluate('calculate().total')
 assert b!=c,(b,c)
 desktop.locator('[data-wizard-action="detail"]').click()
 assert desktop.evaluate('state.mode')=='detallado'
 assert desktop.locator('.wDetailArea [data-key^="unit:"]').count()>0
 desktop.screenshot(path='/mnt/data/ESTIMA_V6_preview_alcance.png',full_page=False)
 print('✓ checkboxes y ajuste detallado de H/H')
 d0=desktop.evaluate('calculate().total')
 desktop.locator('[data-3d-select="model3d"]').select_option('integral')
 desktop.locator('[data-3d-select="lod"]').select_option('400')
 pre=desktop.evaluate('preview3d()')
 assert desktop.evaluate('calculate().total')==d0
 desktop.locator('[data-action="3d-apply"]').click()
 d1=desktop.evaluate('calculate().total')
 assert abs(d1-pre['next']['total'])<0.0001,(d1,pre)
 assert d1>=d0-0.001,(d1,d0)
 print('✓ modelado 3D aplica de forma explícita, sin bajar horas inesperadamente')
 desktop.locator('.wFooterNav [data-wizard-step="4"]').click()
 desktop.locator('.wMain [data-key="rate"]').fill('47')
 assert desktop.evaluate('state.rate')==47
 desktop.locator('.wFooterNav [data-wizard-step="5"]').click()
 assert desktop.locator('.wFinalStats').is_visible()
 budget=desktop.evaluate('calculate().budget')
 assert budget>0
 with desktop.expect_download() as saved:
  desktop.locator('.wExportButtons [data-action="save"]').click()
 assert saved.value.suggested_filename.endswith('.json')
 desktop.evaluate('window.print=()=>window.__printCalled=true')
 desktop.locator('.wExportButtons [data-action="print"]').click()
 assert desktop.evaluate('!!window.__printCalled')
 print('✓ totales, tarifa, presupuesto, JSON y PDF/impresión')
 desktop.locator('[data-wizard-step="2"]').first.click()
 assert desktop.evaluate('state.metrics.area')==2400
 assert desktop.evaluate('state.model3d')=='integral'
 desktop.locator('[data-wizard-action="toggle"]').click()
 assert desktop.locator('.simpleKpi').count()==2
 desktop.locator('[data-wizard-action="toggle"]').click()
 assert desktop.locator('.guidedMode').count()==1
 assert desktop.evaluate('state.project')=='Galpón piloto'
 print('✓ atrás, vista avanzada, regreso sin pérdida')
 desktop.locator('[data-wizard-step="5"]').first.click()
 desktop.screenshot(path='/mnt/data/ESTIMA_V6_preview_resumen.png',full_page=False)
 desktop.locator('[data-wizard-step="1"]').first.click()
 desktop.screenshot(path='/mnt/data/ESTIMA_V6_preview_paso1.png',full_page=False)
 assert not errors,errors
 mobile=browser.new_page(viewport={'width':390,'height':844},accept_downloads=True)
 merr=[];mobile.on('pageerror',lambda e:merr.append(str(e)))
 load(mobile)
 assert mobile.locator('.wStep').count()==5
 mobile.screenshot(path='/mnt/data/ESTIMA_V6_preview_movil.png',full_page=True)
 dims=mobile.evaluate('({doc:document.documentElement.scrollWidth,w:innerWidth})')
 assert dims['doc']<=dims['w']+2,dims
 mobile.locator('.wFooterNav [data-wizard-step="2"]').click()
 mobile.locator('[data-key="metric:area"]').fill('2300')
 assert mobile.evaluate('state.metrics.area')==2300
 assert not merr,merr
 print('✓ responsive sin scroll horizontal',dims)
 browser.close()
