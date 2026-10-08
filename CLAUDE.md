# CLAUDE.md

「文档 → 视频」工程化视频流水线（参照知识星球 AI 学习之路第 19 篇七步流程搭建）。

## 技术栈

Remotion 4（React + TypeScript）+ FFmpeg。1080×1920 竖屏（后续按需定）。

## 目录结构

```
src/               # Remotion 工程（Composition.tsx 画面、Root.tsx 入口）
public/            # 静态资源（音频、封面、背景图）
storyboard.json    # 每支视频的生产单（场景、标题、要点）——放根目录，待建
```

## 命令

```bash
npx remotion studio   # 浏览器预览 http://localhost:3000
npx remotion render   # 渲染出 MP4
```

## 约定

- 换视频只改 storyboard 数据，模板组件不动。
- 大 JSON 不走 defaultProps，组件内 require（ai-mv 项目踩过的坑）。
- 背景图预生成，不用实时 CSS blur（核显扛不住）。
- 屏显要点每条 ≤20 字，中文按 5 字/秒估时长。

## 当前进度

见 ROADMAP.md。
