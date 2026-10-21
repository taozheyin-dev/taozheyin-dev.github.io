"""Generate local CJK variable font subsets after building the HTML."""
from pathlib import Path
import urllib.request
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.build' / 'fonts'
OUTPUT = ROOT / 'assets' / 'fonts'


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = list(ROOT.glob('*.html')) + list(ROOT.glob('*.css')) + [ROOT / 'portfolio.js']
    text = ''.join(path.read_text(encoding='utf-8') for path in paths)
    # Future Latin content and common punctuation remain supported.
    characters = set(map(ord, text)) | set(range(32, 127))
    for family, slug in [('NotoSansSC', 'notosanssc'), ('NotoSerifSC', 'notoserifsc')]:
        source = CACHE / f'{family}.ttf'
        url = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/{family}%5Bwght%5D.ttf'
        if not source.exists():
            print(f'Downloading {family} from Google Fonts…', flush=True)
            urllib.request.urlretrieve(url, source)
        font = TTFont(source)
        available = set(font.getBestCmap())
        cjk = {c for c in characters if 0x3000 <= c <= 0x9fff or 0xff00 <= c <= 0xffef}
        missing = cjk - available
        if missing:
            raise ValueError(f'{family} missing: {"".join(map(chr, sorted(missing)))}')
        options = subset.Options()
        options.flavor = 'woff2'
        options.hinting = False
        sub = subset.Subsetter(options=options)
        sub.populate(unicodes=characters & available)
        sub.subset(font)
        font.flavor = 'woff2'
        target = OUTPUT / ('noto-sans-sc.woff2' if family == 'NotoSansSC' else 'noto-serif-sc.woff2')
        font.save(target)
        check = TTFont(target)
        assert not cjk - set(check.getBestCmap())
        print(f'{target.name}: {target.stat().st_size:,} bytes, all {len(cjk)} CJK characters covered.', flush=True)


if __name__ == '__main__':
    main()
