# 六类打法验证 storyboard 方案

目的：一支片子把 11 种 play 节点全部跑一遍，渲出来逐帧抽查渲染效果，重点看 stat 大数字、table 表格、timeline 时间线、clip 素材。

## 总体设计

- 文件名：`storyboards/playbook-test.json`，videoId＝`playbook-test`。
- 主题选「AI 编程工具 2026 年度盘点」这类数据＋观点混合题材，天然能塞进全部节点；文案全部自拟，不引用 stormzhang 原文。
- 11 种节点分两支验证太散，合一支共 12 个场景（含开场钩子），每场景挂一种节点，总时长预计 50～60s。
- clip 场景用现有 `public/` 素材；没有现成 mp4 就先用 stormzhang-3ways-h.mp4 当占位素材（数据验证用，不发布）。

## 场景清单

| # | playbook | play 节点 | 场景内容 |
|---|---|---|---|
| 01 | — | 无（bullets 空，纯钩子屏） | 「2026 年，AI 编程变了」 |
| 02 | terms | term | 词条卡：Agent＝会自己干活的 AI |
| 03 | terms | grid | 进度网格：Agent / MCP / RAG / Token 四词一览 |
| 04 | data | stat | 超大数字：85%（降幅）＋划线原价 |
| 05 | data | table | 表格：三模型价格＋跑分，红框主角行 |
| 06 | data | compare | 对比双卡：云端付费 vs 本地 0 元 |
| 07 | trust | quote | 引用卡：开发者原话 |
| 08 | opinion | timeline | 时间线：2023→2026 四节点 |
| 09 | opinion | person | 人物卡：某工具创始人 |
| 10 | showcase | clip | 全屏素材（占位 mp4，seconds 手动） |
| 11 | compare | beforeAfter | 前后对比：翻文档 3 小时 vs 一句话问出 |
| 12 | compare | fit | 适合／不适合双卡收尾 |

## 验证方式

1. `npm run use -- playbook-test` 切入。
2. `npm run render` 出横版，用渲帧脚本抽 stat／table／timeline／clip 四个场景的关键帧存 out/ 逐个看图。
3. 节点渲染有问题的回 Scene.tsx 修，通过后更新 ROADMAP。

## 风险点

- clip 若用成片 mp4 当素材，文件大渲染慢；只给 3～4 秒。
- 12 场景全靠自动估时，若某屏字太少停留过短，个别场景补 `seconds`。
