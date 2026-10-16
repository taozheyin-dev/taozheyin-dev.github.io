# 🚀 AI Agent 工具实践之旅 | taozheyin.dev

> **个人技术作品集与知识库**：深度记录 8 款主流 AI Agent 工具的开发实践、20+ 实战工程落地、高可用 API 网关自建与多模型生态治理经验。

🌐 **在线站点**: [https://taozheyin-dev.github.io](https://taozheyin-dev.github.io)

---

## 🎨 6 大高质感个人网站风格矩阵 (6 Available Styles)

本作品集提供 6 种独立完整的技术主页设计风格，涵盖你最开始交付的经典原版以及 5 大对标全球顶级技术团队的明亮风格，全系告别沉闷压抑的纯黑界面，支持页面顶端一键无缝切换：

1. **🏛️ 原版经典风格 (Original Classic)** - [classic.html](https://taozheyin-dev.github.io/classic.html)
   - *设计特色*：最开始交付的原汁原味经典版，柔和白紫渐变 Hero、卡片式布局、平滑滚动、完整的工具分类与技术栈展示。
2. **✨ 苹果 / Raycast 便当盒风格 (Flagship Bento Grid)** - [index.html / bento.html](https://taozheyin-dev.github.io/)
   - *设计灵感*：Apple 官网与 Raycast 招牌 Bento Grid，圆角卡片、柔和微点背景、信息分块鲜明、模块化排版。
3. **🌿 极简主义风格 (Lee Robinson / Vercel Minimal)** - [minimal.html](https://taozheyin-dev.github.io/minimal.html)
   - *设计灵感*：Vercel 副总裁 Lee Robinson 个人主页，克制留白、清晰无衬线排版、经典下划线与无杂音阅读体验。
4. **⚡ 工艺极客风格 (Linear / Rauno Craft)** - [craft.html](https://taozheyin-dev.github.io/craft.html)
   - *设计灵感*：Linear 团队与著名界面工艺师 Rauno Freiberg，1px 精工细线、交互式 Segmented Control 选项卡、细腻微交互。
5. **📑 经典双栏风格 (Brittany Chiang Split-Screen)** - [split.html](https://taozheyin-dev.github.io/split.html)
   - *设计灵感*：全球被学习最多的开发者主页 Brittany Chiang，左侧固定视口信息锚点、右侧沉浸式长流阅读、动态伸缩指示线。
6. **📰 科技期刊研报风格 (Stripe Tech Editorial)** - [editorial.html](https://taozheyin-dev.github.io/editorial.html)
   - *设计灵感*：Stripe Press 与 Stripe 官方技术年报，Stripe 经典 Navy 蓝与紫罗兰基调、技术案例研报、量化对比矩阵大表。

---

## 🎯 核心量化指标 (Impact Metrics)

- **8 款 AI Agent 深度矩阵**：Claude Code、ZCode、ChatGPT (Codex)、Kimi Code、CodeBuddy、Hermes、OpenCode、Pi
- **20+ 工程实战落地**：覆盖 API 协议网关、多模型环境治理、边缘 Serverless 与开发工具
- **34 渠道 / 81 模型全接入**：主流商用与垂直开源模型参数全校准
- **273 项精选活跃技能**：经 5 轮严格筛选治理，淘汰率达 82.6%
- **478 Keys 动态对冲密钥池**：NIM Proxy 负载均衡，覆盖 33 个独立账号
- **100% 关键工程测试覆盖**：GitHub 账号管理器 70 项、NIM 并发竞速 378 项测试全绿

---

## 🏗️ 核心实战项目 (Featured Projects)

### 1. 🌉 CodeBuddy2API 协议转换网关
- **定位**：将闭源订阅生态转换为标准 OpenAI 和 Anthropic 协议的高性能代理网关。
- **亮点**：
  - 支持 Chat Completions、Responses 与 Messages 三协议互转；
  - 重构内部流式管道，实现 Realtime Chunk 边收边解，显著降低 TTFT 首字延迟；
  - 主导跨版本 v1.2.7 → v1.3.6 数据迁移与稳定性维护；
  - 向官方核心库提交 **PR #52（国际化日常活动原生支持）**，成功合并上游主干。

### 2. ⚙️ ZCode 工业级多模型协同环境
- **定位**：企业级高定制化 AI 智能体开发工作区。
- **亮点**：
  - 接入 34 个 Provider，覆盖 81 款主流大模型；
  - 精细校准上下文窗口、Max Output Tokens 与思考档位；
  - 设计路由防环规则，杜绝中转站兜底死循环；
  - 5 轮严格筛选，从 1572 项社区技能沉淀为 273 项生产级技能。

### 3. 🔌 NIM Proxy 高性能多密钥对冲网关
- **定位**：面向高并发 NVIDIA NIM 服务的自愈型反向代理。
- **亮点**：
  - 维护 478 个 API Key 密钥池，覆盖 33 个独立账号自动健康轮转；
  - 修复多协程模型竞速（Race Condition）Bug，378 个并发单元测试全绿；
  - 全链路深度工程汉化，默认 zh-CN 友好交互。

### 4. 📧 Cloudflare Serverless 极低成本临时邮箱
- **定位**：基于全球边缘计算的高可用动态邮箱接收与验证服务。
- **亮点**：
  - 架构：Cloudflare Workers + D1 SQLite + KV 缓存；
  - 突破顶级 AI 平台严苛的域名风控，注册成功率从 0/17 提升至 90% (9/10)；
  - 月度 D1 资源配额仅耗费 0.09%，近乎零成本运行。

### 5. 👥 GitHub 多账号凭证隔离管理器
- **定位**：解决单机并发多身份（个人/组织/工作）的自动化凭证管理器。
- **亮点**：
  - 安全托管 6 个活跃 GitHub 账号凭证；
  - 基于 Git `includeIf` 实现按工作目录自动化隔离 SSH Key 与 Commit 身份；
  - 终端集成 OAuth Device Code 授权，免网页鉴权；
  - 70 项 P0 级别测试全部通过。

### 6. 🌐 公益 AI 服务聚合导航平台
- **定位**：公益模型与高质量 AI 服务的开发者导航平台。
- **亮点**：
  - 坚守纯原生 HTML5/CSS3/ES6+ 零依赖极速架构；
  - 部署于 Cloudflare Pages 边缘节点（nav.freellmapi.cc.cd）。

---

## 💡 6 大工程实战洞察 (Battle-tested Insights)

1. **工具选择的“解耦与卡位”原则**：不同 Agent 各司其职，架构推理用 Claude，敏捷打样用 Codex，长文审查用 Kimi。
2. **自建 API 网关的“主权价值”**：协议统一、流式体验重构、多账号自动对冲限流。
3. **大规模配置的“代码化治理”**：34 渠道 81 模型纳入 Git 版本控制，脚本自动化回归校验。
4. **诊断调试的“日志驱动与变量隔离”**：拒绝凭感觉猜测，依托 logs.sqlite3 真实载荷排障，单变量严密隔离。
5. **开源协作的“敬畏心与交付标准”**：干净代码、单元测试、场景文档三位一体，用数据说话。
6. **持续迭代的“量化指标意识”**：紧盯 TTFB、流式 Chunk 延迟与边缘算力成本，定期清理技术债务。

---

## ⚡ 性能优化与技术特性 (Performance & Tech Stack)

- **零延迟启动**：消除传统人为 1.5s 遮罩，静态资源毫秒级直出；
- **双模主题系统**：默认极客深色极光模式，支持深浅色无缝平滑切换，本地记住状态；
- **高帧率渲染**：全面采用原生 `IntersectionObserver` 替代高频 scroll 读取，消除 Layout Thrashing；
- **自适应响应式**：桌面端/平板/移动端自适应布局，移动端抽屉导航与防误触手势；
- **阅读体验**：吸顶阅读进度条 + SVG 环形进度回到顶部按钮。

---

## 📂 项目结构

```
personal_sites/
├── index.html      # 语义化主页面（含工具矩阵、项目实战、成果看板、经验洞察）
├── style.css       # 现代双模态设计系统（CSS Tokens、Grid底纹、磨砂微质感）
├── script.js       # 高性能原生 JS（零阻塞调度、Observer 监听、平滑分类筛选）
└── README.md       # 官方工程文档
```

---

## 📧 联系与交流

- **GitHub**: [@taozheyin-dev](https://github.com/taozheyin-dev)
- **Website**: [taozheyin-dev.github.io](https://taozheyin-dev.github.io)

---

*Crafted with Engineering Discipline & Powered by AI Agents.*
