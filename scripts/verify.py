"""Validate navigation and core interactions in a real browser; save review images."""
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.build' / 'review'
OUT.mkdir(parents=True, exist_ok=True)
PAGES = ['index', 'craft']
BASE = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:8765')


def main():
    assert (ROOT / 'index.html').read_bytes() == (ROOT / 'craft.html').read_bytes()
    report = {'errors': [], 'layouts': [], 'interactions': []}
    with sync_playwright() as p:
        # Prefer the package browser, with a locally installed Chromium fallback.
        executable = Path(p.chromium.executable_path)
        if not executable.exists():
            options = list((Path(os.environ['LOCALAPPDATA']) / 'ms-playwright').glob('chromium-*/chrome-win64/chrome.exe'))
            if options:
                executable = sorted(options)[-1]
        browser = p.chromium.launch(headless=True, executable_path=str(executable) if executable.exists() else None)
        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page()
        page.on('pageerror', lambda error: report['errors'].append(str(error)))
        page.on('response', lambda response: report['errors'].append(f'{response.status} {response.url}') if response.status >= 400 else None)
        for name in PAGES:
            page.set_viewport_size({'width': 1440, 'height': 1000})
            page.goto(f'{BASE}/{name}.html', wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            assert page.locator('body.theme-craft').count() == 1
            assert page.locator('[data-open-views], #views-dialog').count() == 0
            assert page.locator('h1').count() == 1
            assert page.locator('.project-card').count() == 3
            assert page.locator('.project-detail').count() == 3
            assert page.locator('#learning .learning-item').count() == 4
            ids = page.locator('[id]').evaluate_all('(els) => els.map(e => e.id)')
            assert len(ids) == len(set(ids)), f'Duplicate id: {name}'
            broken_links = page.locator('a[href^="#"]').evaluate_all('(els) => els.map(e=>e.getAttribute("href").slice(1)).filter(id=>id && !document.getElementById(id))')
            assert not broken_links, (name, broken_links)
            assets = page.locator('[src],link[href]').evaluate_all('(els) => els.map(e => e.getAttribute("src") || e.getAttribute("href"))')
            for asset in assets:
                if not urlparse(asset).scheme:
                    assert (ROOT / asset).exists(), asset
            page.screenshot(path=str(OUT / f'{name}-desktop.png'))
            page.locator('#projects').scroll_into_view_if_needed()
            page.screenshot(path=str(OUT / f'{name}-projects.png'))
            for key, count in [('api', 2), ('web', 1), ('all', 3)]:
                page.locator(f'[data-filter="{key}"]').click()
                assert page.locator('.project-card:visible').count() == count, (name, key)
                assert page.locator(f'[data-filter="{key}"]').get_attribute('aria-pressed') == 'true'
            for project_id in ['codebuddy', 'nim', 'navigation']:
                trigger = page.locator(f'[data-project="{project_id}"]')
                trigger.click()
                assert page.locator('#project-dialog').is_visible()
                assert page.locator('#project-dialog h3').all_text_contents() == ['要解决的问题', '我的贡献', '实现结果', '工程取舍']
                assert page.locator('#project-dialog li').count() == 3
                source_links = page.locator('#project-dialog .project-links a')
                assert source_links.count() >= 2
                assert all(source_links.nth(i).get_attribute('href').startswith('https://') for i in range(source_links.count()))
                if project_id == 'codebuddy':
                    page.screenshot(path=str(OUT / f'{name}-detail.png'))
                    page.keyboard.press('Shift+Tab')
                    assert page.evaluate('document.activeElement.closest("dialog")?.id') == 'project-dialog'
                page.keyboard.press('Escape')
                assert not page.locator('#project-dialog').is_visible()
                assert trigger.evaluate('(e) => e === document.activeElement')
            tab = page.locator('[data-demo-step="0"]')
            tab.click()
            page.keyboard.press('ArrowRight')
            assert page.locator('#demo-panel-1').is_visible()
            page.keyboard.press('End')
            assert page.locator('#demo-panel-2').is_visible()
            page.keyboard.press('Home')
            assert page.locator('#demo-panel-0').is_visible()
            for width in [320, 390, 768, 1024, 1440]:
                page.set_viewport_size({'width': width, 'height': 900})
                page.evaluate('window.scrollTo(0,0)')
                layout = page.evaluate('''() => ({width: innerWidth, scroll: document.documentElement.scrollWidth,
                  overflow: [...document.querySelectorAll('main *')].filter(e => {
                    const r=e.getBoundingClientRect();return r.width && (r.right > innerWidth+1 || r.left < -1) && getComputedStyle(e).position !== 'absolute';
                  }).map(e=>e.className?.baseVal ?? e.className).slice(0,10)})''')
                layout.update(page=name)
                report['layouts'].append(layout)
                if layout['scroll'] > width:
                    report['errors'].append(f'{name} horizontal overflow at {width}: {layout}')
                clipped_art = page.locator('.project-visual').evaluate_all('(els) => els.filter(e => {const r=e.getBoundingClientRect(); return r.right > innerWidth+1 || r.left < -1;}).length')
                if clipped_art:
                    report['errors'].append(f'{name}: {clipped_art} project illustrations clipped at {width}')
                if width == 390:
                    assert page.locator('.tool-role').first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize) >= 12')
                    assert page.locator('.tool-description').first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize) >= 14')
                    page.screenshot(path=str(OUT / f'{name}-mobile.png'))
                    page.locator('.menu-toggle').click()
                    assert page.locator('#main-nav').is_visible()
                    page.locator('#main-nav a[href="#projects"]').click()
                    assert not page.locator('#main-nav').is_visible()
                    page.locator('[data-project="codebuddy"]').click()
                    page.screenshot(path=str(OUT / f'{name}-mobile-detail.png'))
                    assert page.locator('#project-dialog').evaluate('(e) => e.scrollWidth <= e.clientWidth + 1')
                    page.locator('#project-dialog [data-close-dialog]').click()
            report['interactions'].append(f'{name}: Craft entry, filters, three project details with source links, learning section, focus restoration, protocol tabs, mobile menu passed')
            print(report['interactions'][-1], flush=True)
        page.goto(f'{BASE}/#nim-detail', wait_until='networkidle')
        assert page.locator('#project-dialog').is_visible()
        assert page.locator('#detail-title').inner_text() == 'NIM Proxy'
        page.keyboard.press('Escape')
        (OUT / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
        nojs = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        fallback = nojs.new_page()
        fallback.goto(f'{BASE}/', wait_until='networkidle')
        fallback.locator('[data-project="codebuddy"]').click()
        fallback.locator('#codebuddy-detail summary').click()
        assert fallback.locator('#codebuddy-detail .detail-content').is_visible()
        nojs.close()
        context.close()
        browser.close()
    (OUT / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'layout_checks': len(report['layouts']), 'errors': report['errors']}, ensure_ascii=False))
    assert not report['errors'], report['errors']


if __name__ == '__main__':
    main()
