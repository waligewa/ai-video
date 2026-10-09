# storyboard.json 字段说明（中文对照）

改分镜只动 `storyboard.json`（或 `storyboards/` 里的源文件），改完 `npm run use -- <名字>` 切换、`npm run render` 出片。JSON 本身不支持注释，所以字段的中文说明都放本文件。

## meta（片头信息）

| 字段 | 中文含义 | 说明 |
|---|---|---|
| `title` | 视频标题 | 仅作记录，不上屏 |
| `videoId` | 视频编号 | 渲染输出文件名用它：`out/<videoId>-h.mp4`（横）/-v.mp4（竖） |
| `wordsPerSecond` | 读字速度 | 中文每秒读几个字，决定每屏停留时长，常用 5 |
| `breathSeconds` | 呼吸秒数 | 每屏额外停留的秒数，给观众反应时间，常用 1 |
| `subtitleBar` | 字幕条开关 | `true`＝底部常驻白色大字字幕条 |
| `playbook` | 打法标记（可选） | 六类之一，见下表；省略＝不标记 |

### playbook 六类打法（源自 stormzhang 9 支精拆）

| 值 | 中文名 | 代表支 | 核心结构 |
|---|---|---|---|
| `terms` | P1 术语科普流 | v2 | 一词一卡三拍轮播（定义→比喻→演示），卡片网格兼进度条 |
| `data` | P2 数据轰炸 | v3 / v7 | 超大数字＋价格/跑分表格＋对比卡三连击 |
| `trust` | P3 开源种草信任链 | v4 | 录屏实证→能力卡→榜单背书→成本打消→实跑收尾 |
| `opinion` | P4 时间线＋观点输出 | v5 / v8 | 时间线节点＋引用卡＋人物卡＋大字判断页 |
| `showcase` | P5 素材直给 | v6 | 无版式页，全屏素材快切＋字幕条断言 |
| `compare` | P6 功能前后对比 | v9 | 线框＋录屏交替→前后对比→适合/不适合→判断 |

## scenes[]（场景列表，按顺序播）

| 字段 | 中文含义 | 说明 |
|---|---|---|
| `id` | 场景编号 | 如 `"01"`，仅作标识 |
| `kicker` | 角标 | 左上角小字章节标签，可空字符串 |
| `title` | 场景标题 | 大字标题，也是字幕第一句 |
| `bullets` | 要点列表 | 逐条入场；空数组 `[]`＝纯标题钩子屏 |
| `layout` | 版式（可选） | `statement`＝大字观点页（缺省）；`cards`＝卡片页；`diagram`＝线框示意页；`demo`＝录屏占位页 |
| `play` | 打法节点（可选） | 挂了就优先渲染打法内容，见下节；和 `layout` 二选一即可 |
| `seconds` | 手动时长（可选） | 本场景固定几秒；不给则按字数自动估算。`clip` 素材场景必填 |

## play 打法节点（scene.play，按 kind 区分）

每个场景最多挂一个 `play` 节点，「有啥节点渲染啥」。

### `term`（P1 词条卡）
```json
{ "kind": "term", "term": "RAG", "subtitle": "检索增强生成", "metaphor": "给实习生配一个资料员" }
```

### `grid`（P1 进度网格，全部词条一览）
```json
{ "kind": "grid", "terms": ["LLM", "RAG", "MCP", "Agent"] }
```

### `stat`（P2 超大数字；`was`＝划线原价）
```json
{ "kind": "stat", "value": "60", "unit": "%", "caption": "降价幅度", "was": "原价 ¥2" }
```

### `table`（P2 数据表格；`highlightRow`＝红框主角行，从 0 数）
```json
{ "kind": "table", "headers": ["模型", "价格", "跑分"], "rows": [["Opus", "¥40", "90"], ["GLM", "¥2", "85"]], "highlightRow": 1 }
```

### `compare`（对比双卡，左右各「标签＋大字」）
```json
{ "kind": "compare", "left": { "label": "云端", "value": "按 token 付费" }, "right": { "label": "本地", "value": "0 元" } }
```

### `timeline`（P4 时间线，节点逐个点亮）
```json
{ "kind": "timeline", "points": [ { "time": "2023", "text": "恩怨开始" }, { "time": "2025", "text": "彻底闹翻" } ] }
```

### `quote`（P4 引用卡，大引号＋出处）
```json
{ "kind": "quote", "text": "The gentle singularity has begun.", "source": "Sam Altman" }
```

### `person`（P4 人物卡，头像位自动取名字首字）
```json
{ "kind": "person", "name": "达里奥", "title": "Anthropic CEO" }
```

### `clip`（P5 全屏素材；文件放 `public/` 下，`seconds` 必填）
```json
{ "kind": "clip", "src": "demo-clip.mp4" }
```

### `beforeAfter`（P6 前后对比双栏）
```json
{ "kind": "beforeAfter", "before": "翻 3 小时文档", "after": "一句话问出答案" }
```

### `fit`（P6 适合/不适合双卡）
```json
{ "kind": "fit", "good": ["团队内部文档多", "不想花钱买 SaaS"], "bad": ["机密数据不能外传的场景", "需要公网访问"] }
```
