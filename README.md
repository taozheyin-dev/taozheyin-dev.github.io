# YTZ · 个人技术作品集

中文优先的静态作品集，记录 AI 工具、API 网关、开发环境与边缘服务中的项目实践。
当前只发布和维护 **Craft 工艺版**：墨绿色调、协议工作台、项目筛选与案例详情。

线上地址：https://taozheyin-dev.github.io/

## 预览

在项目根目录运行：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

打开 http://127.0.0.1:8765/ 。`index.html` 是正式首页，`craft.html` 保留为相同内容的直接入口。

其他设计和视觉实验已完整归档到本地 `local-versions/`，包括独立预览所需的字体、脚本和样式。
该目录由 Git 忽略，不推送、不部署，也不参与后续构建与维护。

## 内容与构建

```powershell
python scripts/build.py
python scripts/fonts.py
```

- `content.json`：六个项目的摘要与详细记录、工具体系、工作方法。
- `templates/craft.html`：唯一维护的页面模板。
- `scripts/build.py`：生成内容一致的 `index.html` 和 `craft.html`，不改动本地归档。
- `craft.css`：Craft 的布局与视觉样式。
- `shared.css`：字体、弹窗、基本导航与无障碍行为样式。
- `polish.css`：阅读字号、触控尺寸与手机布局修正。
- `portfolio.js`：项目筛选、详情、移动菜单和协议工作台。
- `assets/fonts/`：本地中文可变字体及许可证。

页面无需服务器端逻辑，没有运行时外部字体或脚本依赖。
更新文案后请重新生成字体子集，避免新增字符回退到系统字体。

字体脚本首次执行需要联网获取 Google Fonts 官方字体，后续复用 `.build/fonts/` 缓存。
字体处理依赖 `fonttools` 与 `brotli`，保留可变字重轴，并检查所有使用到的汉字及全角标点。
字体来源见 `assets/fonts/SOURCES.txt`，许可证随字体一起保留。

## 交互与可访问性

- 详情可通过项目卡片打开，也可直接访问 `#codebuddy-detail` 等链接。
- 原生 `dialog` 管理焦点和 Escape 关闭；关闭后焦点回到触发入口。
- 筛选按钮使用 `aria-pressed`，结果数量通过状态区域播报。
- 协议工作台标签支持左右方向键、Home 与 End。
- 尊重系统的减少动态效果设置。
- JavaScript 不可用时，项目链接仍可定位到静态折叠详情。
- 项目图为流程示意，不作为真实软件截图或性能证明。
- GitHub 链接明确标为个人主页。

## 验证与发布

保持本地预览服务运行，执行：

```powershell
python scripts/verify.py
```

验证需要 Python Playwright 与 Chromium。脚本检查首页和 Craft 入口在 320、390、768、1024 和 1440px 宽度下的页面溢出、筛选、六个详情弹窗、焦点返回、手机菜单、协议工作台、直接详情链接，以及无 JavaScript 的阅读回退。
截图和报告保存在 `.build/review/`。

GitHub Pages 从 `main` 分支根目录发布。提交时只包含 Craft 及其内容、源码、资源和构建脚本；旧版文件已从 Git 跟踪中移除，本地归档仍保留。

内容沿用既有项目记录，已移除缺少出处的规模与性能数字。
新增可公开的项目链接、测试结果或性能指标时，应一并记录对应来源与适用版本。
