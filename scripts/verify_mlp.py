"""Browser checks for the MLP lab. Run against a local static server."""
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.build' / 'review'
BASE = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:8765')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    report = {'errors': [], 'layouts': [], 'interactions': []}
    with sync_playwright() as p:
        executable = Path(p.chromium.executable_path)
        if not executable.exists():
            options = sorted((Path(os.environ['LOCALAPPDATA']) / 'ms-playwright').glob('chromium-*/chrome-win64/chrome.exe'))
            if options:
                executable = options[-1]
        browser = p.chromium.launch(headless=True, executable_path=str(executable) if executable.exists() else None, args=['--no-proxy-server'])
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        page.on('pageerror', lambda error: report['errors'].append(str(error)))
        page.on('response', lambda response: report['errors'].append(f'{response.status} {response.url}') if response.status >= 400 else None)
        page.goto(f'{BASE}/mlp.html', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        expect(page.locator('#m-loss')).to_have_text('0.0279')
        expect(page.locator('#m-acc')).to_have_text('100% (4/4)')
        assert page.locator('.param-card').count() == 9
        ids = page.locator('[id]').evaluate_all('(els) => els.map(e => e.id)')
        assert len(ids) == len(set(ids))
        assert not page.locator('a[href^="#"]').evaluate_all('(els) => els.map(e => e.hash.slice(1)).filter(id => !document.getElementById(id))')

        for width in [320, 390, 700, 768, 1024, 1440, 1920]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.evaluate('window.scrollTo(0,0)')
            layout = page.evaluate('''() => ({width: innerWidth, scroll: document.documentElement.scrollWidth,
                panels: [...document.querySelectorAll('.lab-plot')].map(e => {
                    const r=e.getBoundingClientRect(); return {left:r.left, right:r.right, width:r.width};
                })})''')
            assert layout['scroll'] <= width, layout
            assert all(panel['left'] >= 0 and panel['right'] <= width for panel in layout['panels']), layout
            if width >= 768:
                assert len(set(round(panel['left']) for panel in layout['panels'])) == 3
            report['layouts'].append(layout)
            if width in [390, 1440]:
                name = 'mobile' if width == 390 else 'desktop'
                page.screenshot(path=str(OUT / f'mlp-{name}.png'))
                page.locator('#stage').screenshot(path=str(OUT / f'mlp-stage-{name}.png'))
                page.locator('#lab-params').screenshot(path=str(OUT / f'mlp-params-{name}.png'))
                page.locator('#lab-code').screenshot(path=str(OUT / f'mlp-code-{name}.png'))
            if width == 390:
                page.evaluate('window.scrollTo(0,0)')
                expect(page.locator('.menu-toggle')).to_be_visible()
                page.locator('.menu-toggle').click()
                expect(page.locator('#main-nav')).to_be_visible()
                page.locator('#main-nav a[href="#lab-params"]').click()
                expect(page.locator('#main-nav')).not_to_be_visible()
                page.evaluate('window.scrollTo(0,0)')
                page.locator('.menu-toggle').click()
                page.keyboard.press('Escape')
                expect(page.locator('.menu-toggle')).to_be_focused()
                expect(page.locator('.menu-toggle')).to_have_attribute('aria-expanded', 'false')
        report['interactions'].append('responsive layouts, mobile navigation and Escape focus')

        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.locator('#reset-btn').click()
        expect(page.locator('#epoch-num')).to_have_text('0')
        expect(page.locator('#m-loss')).to_have_text('0.5620')
        page.locator('#step-fwd').click()
        expect(page.locator('#epoch-num')).to_have_text('1')
        page.locator('#step-back').click()
        expect(page.locator('#epoch-num')).to_have_text('0')
        page.locator('#play-btn').click()
        expect(page.locator('#play-label')).to_have_text('暂停训练')
        page.wait_for_function('Number(document.getElementById("epoch-num").textContent) > 1')
        page.locator('#play-btn').click()
        epoch = page.locator('#epoch-num').inner_text()
        page.wait_for_timeout(150)
        expect(page.locator('#epoch-num')).to_have_text(epoch)
        expect(page.locator('#play-label')).to_have_text('播放训练')
        slider = page.locator('#epoch-range')
        slider.focus()
        page.keyboard.press('End')
        expect(page.locator('#epoch-num')).to_have_text('300')
        expect(page.locator('#m-loss')).to_have_text('0.0279')
        assert page.locator('.tl-track').evaluate('(e) => getComputedStyle(e).outlineStyle') == 'solid'
        page.keyboard.press('Home')
        expect(page.locator('#epoch-num')).to_have_text('0')
        report['interactions'].append('reset, play/pause, step and keyboard timeline; default numeric results preserved')

        page.locator('[data-option="lr"] [data-value="0.03"]').focus()
        page.keyboard.press('ArrowRight')
        expect(page.locator('[data-option="lr"] [data-value="0.1"]')).to_have_attribute('aria-checked', 'true')
        page.locator('[data-option="opt"] [data-value="sgd"]').click()
        page.locator('[data-option="act"] [data-value="tanh"]').click()
        page.locator('[data-option="preset"] [data-value="random"]').click()
        page.locator('#speed-btn').click()
        expect(page.locator('#speed-btn')).to_have_text('2×')
        page.locator('#reset-btn').click()
        for option, value in [('lr', '0.03'), ('opt', 'adam'), ('act', 'sigmoid'), ('preset', 'textbook')]:
            expect(page.locator(f'[data-option="{option}"] [data-value="{value}"]')).to_have_attribute('aria-checked', 'true')
        expect(page.locator('#speed-btn')).to_have_text('1×')
        page.locator('.sample-chip[data-sample="3"]').click()
        expect(page.locator('.sample-chip[data-sample="3"]')).to_have_attribute('aria-pressed', 'true')
        assert page.locator('.sample-chip[aria-pressed="true"]').count() == 1
        page.locator('#toggle-lines').click()
        expect(page.locator('#toggle-lines')).to_have_attribute('aria-pressed', 'false')
        page.locator('[data-view="netMode"] [data-value="backward"]').click()
        expect(page.locator('#net-legend-note')).to_contain_text('偏导数')
        report['interactions'].append('hyperparameters, keyboard choice groups, reset defaults, samples and graph modes')

        for step in range(1, 6):
            page.locator(f'[data-step="{step}"]').click()
            expect(page.locator('#insp-title')).to_contain_text(f'0{step}')
            assert page.locator('.code-line.is-active').count() > 0
        page.locator('[data-step="5"]').focus()
        page.keyboard.press('Home')
        expect(page.locator('[data-step="1"]')).to_have_attribute('aria-selected', 'true')
        for framework in ['pytorch', 'tensorflow', 'numpy']:
            page.locator(f'[data-fw="{framework}"]').click()
            href = page.locator('#code-dl').get_attribute('href')
            assert page.request.get(f'{BASE}/{href}').ok
        report['interactions'].append('five code steps, keyboard tabs and three script downloads')

        no_js = browser.new_context(java_script_enabled=False, viewport={'width':390,'height':900})
        fallback = no_js.new_page()
        fallback.goto(f'{BASE}/mlp.html')
        expect(fallback.locator('.lab-noscript')).to_be_visible()
        assert fallback.locator('.math-card').count() == 4
        no_js.close()
        browser.close()
    (OUT / 'mlp-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    assert not report['errors'], report['errors']
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
