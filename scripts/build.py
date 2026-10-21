"""Build the Craft portfolio from a single, reviewable content source."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
e = html.escape


def diagram(project):
    def label(x, y, text, color='var(--ink)', size=12):
        return f'<text x="{x}" y="{y}" text-anchor="middle" fill="{color}" font-size="{size}">{e(text)}</text>'

    def node(x, y, w, h, text, active=False):
        fill, color = ('var(--accent)', 'white') if active else ('var(--surface)', 'var(--ink)')
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{fill}" stroke="currentColor" stroke-opacity=".4"/>' + label(x + w / 2, y + h / 2 + 4, text, color)

    def line(path, dashed=False):
        dash = 'stroke-dasharray="4 5" opacity=".45"' if dashed else 'opacity=".65"'
        return f'<path d="{path}" stroke="currentColor" stroke-width="1.2" {dash}/>'

    kind = project['visual']
    shapes = ''
    if kind == 'activity':
        shapes += line('M113 120H132M228 120H247')
        shapes += node(17, 99, 96, 42, '按日预留')
        shapes += node(132, 84, 96, 72, 'ACP 会话', True)
        shapes += node(247, 99, 96, 42, '状态核验')
        shapes += label(180, 182, '已发送但未确认的请求不重放', size=10)
    elif kind == 'gateway':
        shapes += line('M113 58H132V180H113M132 120H151M241 120H266')
        for y, title in [(39, 'Chat'), (101, 'Responses'), (163, 'Messages')]:
            shapes += node(17, y, 96, 38, title)
        shapes += node(151, 84, 90, 72, '协议适配', True) + node(266, 100, 80, 40, '服务')
        shapes += label(196, 180, '流式事件逐步输出', size=10)
    elif kind == 'config':
        shapes += line('M180 70V94M180 140V165M72 165H288M72 165V181M288 165V181')
        shapes += node(116, 28, 128, 42, '版本化配置') + node(126, 94, 108, 46, '路由规则', True)
        shapes += node(17, 181, 110, 36, '模型与渠道') + node(233, 181, 110, 36, '技能与上下文')
        shapes += label(56, 123, '输入约束', size=10) + label(299, 123, '输出边界', size=10)
    elif kind == 'race':
        shapes += line('M81 120H102V52H126M102 120H126M102 120V188H126')
        shapes += line('M230 120H270') + line('M230 52H250V120M230 188H250V120', True)
        shapes += node(10, 99, 71, 42, '请求') + node(126, 32, 104, 40, '同模型尝试 A')
        shapes += node(126, 99, 104, 42, '响应裁决', True) + node(126, 168, 104, 40, '同模型尝试 B')
        shapes += node(270, 99, 80, 42, '输出') + label(302, 169, '清理 / 取消', size=10)
    elif kind == 'mail':
        shapes += '<rect x="20" y="94" width="62" height="46" rx="4" stroke="currentColor"/><path d="M20 96L51 119L82 96" stroke="currentColor"/>'
        shapes += line('M82 117H123M225 117H248V65H270M248 117V177H270')
        shapes += node(123, 90, 102, 54, 'Worker', True) + node(270, 45, 76, 40, 'D1') + node(270, 157, 76, 40, 'KV')
        shapes += label(51, 163, '邮件接收', size=11) + label(174, 175, '接收与查询', size=10)
    elif kind == 'identity':
        shapes += line('M104 65H126M230 65H253M104 171H126M230 171H253')
        shapes += line('M180 88V147', True)
        for y, path, name, key in [(42, '~/work', '工作身份', 'SSH A'), (148, '~/personal', '个人身份', 'SSH B')]:
            shapes += node(9, y, 95, 46, path) + node(126, y, 104, 46, name, True) + node(253, y, 98, 46, key)
        shapes += label(180, 124, '按目录匹配 · includeIf', size=10)
    else:
        shapes += '<rect x="33" y="24" width="294" height="195" rx="6" fill="var(--surface)" stroke="currentColor" stroke-opacity=".4"/>'
        shapes += line('M33 54H327') + label(83, 44, '资源导航', size=10)
        shapes += node(52, 70, 78, 29, '全部', True) + node(141, 70, 78, 29, 'API') + node(230, 70, 78, 29, '工具')
        for x in [53, 142, 231]:
            for y in [116, 167]:
                shapes += f'<rect x="{x}" y="{y}" width="76" height="35" rx="3" stroke="currentColor" stroke-opacity=".25"/>'
                shapes += f'<circle cx="{x+13}" cy="{y+17}" r="4" fill="var(--accent)" opacity=".7"/>'
                shapes += line(f'M{x+26} {y+13}H{x+61}M{x+26} {y+22}H{x+51}')
    return f'<svg class="project-diagram" viewBox="0 0 360 240" fill="none" aria-hidden="true">{shapes}</svg>'


def project_card(p, index):
    tags = "".join(f"<span>{e(t)}</span>" for t in p["tags"])
    return f'''<article class="project-card project-{p['id']}" data-categories="{' '.join(p['filters'])}">
      <a class="project-trigger" href="#{p['id']}-detail" data-project="{p['id']}" aria-haspopup="dialog" aria-label="查看 {e(p['title'])}：{e(p['subtitle'])}">
        <div class="project-visual visual-{p['visual']}">{diagram(p)}</div>
        <div class="project-info"><span class="project-index">{index:02}</span><span class="project-category">{e(p['category'])}</span>
          <h3 class="project-title">{e(p['title'])}</h3><p class="project-role">{e(p['role'])}</p><p class="project-summary">{e(p['summary'])}</p>
          <p class="project-result">{e(p['result'])}</p><div class="project-tags">{tags}</div>
          <span class="project-open">查看项目 <span aria-hidden="true">↗</span></span>
        </div>
      </a>
    </article>'''


def project_details(p):
    contributions = "".join(f"<li>{e(t)}</li>" for t in p["contribution"])
    links = "".join(f'<a href="{e(link["url"])}" target="_blank" rel="noopener noreferrer">{e(link["label"])} <span aria-hidden="true">↗</span></a>' for link in p['links'])
    return f'''<details class="project-detail" id="{p['id']}-detail"><summary>{e(p['title'])} · {e(p['subtitle'])}</summary>
      <div class="detail-content"><p class="detail-kicker">{e(p['category'])} / 工程实践</p><h2>{e(p['title'])}</h2><p class="detail-subtitle">{e(p['subtitle'])}</p>
        <p class="detail-role">{e(p['role'])}</p><p class="detail-context">{e(p['context'])}</p>
        <nav class="project-links" aria-label="项目相关链接">{links}</nav>
        <div class="detail-diagram">{diagram(p)}<span>系统流程示意</span></div>
        <section><h3>要解决的问题</h3><p>{e(p['problem'])}</p></section>
        <section><h3>我的贡献</h3><ul>{contributions}</ul></section>
        <section><h3>实现结果</h3><p>{e(p['outcome'])}</p></section>
        <section><h3>工程取舍</h3><p>{e(p['tradeoff'])}</p></section>
      </div></details>'''


def build():
    data = json.loads((ROOT / "content.json").read_text(encoding="utf-8"))
    cards = "\n".join(project_card(p, i) for i, p in enumerate(data["projects"], 1))
    tools = '<div class="tool-list">' + "".join(
        f'<article class="tool-item"><span class="tool-number">{i:02}</span><h3 class="tool-name">{e(t["name"])}</h3><p class="tool-role">{e(t["role"])}</p><p class="tool-description">{e(t["description"])}</p></article>'
        for i, t in enumerate(data["tools"], 1)) + '</div>'
    learning = '<div class="learning-grid">' + "".join(
        f'<article class="learning-item" id="{e(item["id"])}-practice"><span class="section-eyebrow">{e(item["kind"])}</span><h3>{e(item["title"])}</h3><p>{e(item["description"])}</p></article>'
        for item in data['learning']) + '</div>'
    principles = '<div class="principle-list">' + "".join(
        f'<article class="principle"><span class="principle-number">{i:02}</span><h3>{e(p["title"])}</h3><p>{e(p["description"])}</p></article>'
        for i, p in enumerate(data["principles"], 1)) + '</div>'
    header = '''<a class="skip-link" href="#main">跳到主要内容</a><header class="site-header"><div class="header-inner">
      <a class="logo" href="#main" aria-label="YTZ，回到顶部"><span class="logo-mark" aria-hidden="true">↗</span><span class="logo-name">YTZ<span aria-hidden="true">.</span></span></a>
      <nav class="main-nav" id="main-nav" aria-label="主导航"><a href="#projects">项目实践</a><a href="#learning">学习与实践</a><a href="#tools">工具体系</a><a href="#approach">工作方法</a></nav>
      <div class="header-actions"><button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false">菜单 <span aria-hidden="true">+</span></button></div>
    </div></header>'''
    footer = '''<footer class="site-footer"><div class="footer-inner"><p>YTZ · 个人技术作品集</p><p class="footer-note">在实践中构建，在使用中打磨。</p><div class="footer-links"><a href="https://github.com/taozheyin-dev" target="_blank" rel="noopener noreferrer">GitHub 主页 ↗</a><a href="#main">回到顶部 ↑</a></div></div></footer>'''
    details = '<section class="project-detail-library" aria-label="项目详细记录">' + "\n".join(project_details(p) for p in data["projects"]) + '</section>'
    # The dialog clone receives a distinct heading id; static fallbacks stay valid.
    dialogs = f'''{details}<dialog id="project-dialog" aria-labelledby="detail-title"><div class="dialog-toolbar"><span>项目记录</span><button type="button" data-close-dialog aria-label="关闭项目详情">关闭 ×</button></div><div id="project-dialog-content"></div></dialog>'''
    head = '''<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>YTZ | 个人技术作品集</title><meta name="description" content="YTZ 的个人技术作品集：记录 AI 工具、API 网关、开发环境和边缘服务中的项目实现与个人贡献。"><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/fonts/noto-sans-sc.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="shared.css"><script src="portfolio.js" defer></script>'''
    template = (ROOT / 'templates' / 'craft.html').read_text(encoding='utf-8')
    replacements = dict(head=head, header=header, footer=footer, dialogs=dialogs, projects=cards, learning=learning, tools=tools, principles=principles, data='')
    for key, value in replacements.items():
        template = template.replace('{{' + key + '}}', value)
    template = template.replace('</head>', '<link rel="stylesheet" href="polish.css">\n</head>')
    if '{{' in template:
        raise ValueError('Unresolved placeholder in Craft template')
    template = '\n'.join(line.rstrip() for line in template.splitlines()) + '\n'
    for entry in ['index.html', 'craft.html']:
        (ROOT / entry).write_text(template, encoding='utf-8')
    print('Built Craft as index.html and craft.html from content.json.')


if __name__ == '__main__':
    build()
