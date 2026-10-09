# ROADMAP.md

「文档 → 视频」工程化流水线，按第 19 篇七步流程推进。

## 当前阶段

stormzhang 版式模板组件已落地并成为当前 storyboard（storyboards/stormzhang-3ways.json）。demo-01 菜谱已归档至 storyboards/demo-01.json 不再使用。一键换菜：npm run use -- <name>（scripts/use-storyboard.mjs，Windows 下用读写不用 cpSync）；一键渲染 npm run render（横版）/npm run render:v（竖版），成片自动按 videoId 命名（scripts/render.mjs），已实测出 out/stormzhang-3ways-h.mp4（945 帧/31.5s/3MB）。

## 已完成（均验证过）

- 2026-10-09 六类打法落地：基于 v2-v9 全部精拆（8 份报告在 F:\精神食粮\video-analysis\reports\），timeline.ts 新增 Playbook 六类标记（terms/data/trust/opinion/showcase/compare）＋scene.play 打法节点（11 种：term/grid/stat/table/compare/timeline/quote/person/clip/beforeAfter/fit）＋scene.seconds 手动时长；Scene.tsx 按节点渲染对应组件（P5 clip 走 OffthreadVideo 全屏）；storyboard.字段说明.md 全中文对照表＋各节点示例。lint 0 错误（3 个弹簧动画 warning 为原有模式）、stormzhang-3ways 渲染回归通过（945 帧/3MB）；现有 storyboard 不带 play 字段行为零变化
- 2026-10-09 项目已推送 GitHub https://github.com/waligewa/ai-video.git （main 分支）

- 2026-10-08 深夜 stormzhang 版式组件落地：Scene 新增 4 种 layout（statement 大字观点/cards 卡片横排青色描边高亮/diagram mac三圆点线框窗口+侧栏条目/demo 录屏占位），timeline 新增字幕轨 SUBTITLES＋meta.subtitleBar 开关，Video 挂全局底部 SubtitleBar；stormzhang-3ways.json 换入实测渲帧 30/185/265 验证三种页型正常、字幕条出字正确，验后已恢复 demo storyboard；tsc 通过。demo-01 原 storyboard 无 layout 字段，行为零变化

- 2026-10-08 按第21篇第12节做质感实验：改前/改后同帧对照存 out/cmp/（228/285/330/855 四时刻）；改动=旧要点 55% 降级、要点弹簧 damping16/stiffness100、双色光斑呼吸背景（振幅 0.012、周期 12.6s）、片尾 0.8s 停留＋20 帧整体淡出；tsc 通过、Studio 构建 150ms

- 2026-10-08 第 1 步搭骨架：create-video 脚手架初始化（Remotion 4.0.534 + React 19 + TS），依赖已装，git 已 init；remotion studio 启动验证 http://localhost:3000 返回 200，构建 688ms
- 2026-10-08 第 2 步定风格：src/theme.ts（深蓝黑 #0B1220 背景、白色粗体标题、青色 #22D3EE 高亮，微软雅黑，字号三级 26/56/34，安全边距 80），全片组件统一引用
- 2026-10-08 第 3 步拆解：demo 文案 → storyboard.json，6 场景；已按文章实录预改两处（钩子收紧 21 字、收尾要点拆短）
- 2026-10-08 第 4 步审核：作者口头通过（「进行第5步吧」），未逐条细审
- 2026-10-08 第 5 步组装：timeline.ts（5 字/秒 + 1s 呼吸、要点按字数占比、场景重叠 0.5s 过渡）、Scene.tsx（入场淡入+右滑、要点逐条入场当前全亮前条半暗）、Video.tsx（渐变背景 + 青色进度条 + BGM 自动检测挂载）、1080×1920@30fps；tsc 通过、Studio 热更新构建 133ms；修复 Scene 全局帧号 bug

- 2026-10-09 playbook-test 验证片：storyboards/playbook-test.json（12 场景覆盖 11 种 play 节点＋钩子屏），渲染 out/playbook-test-h.mp4（831 帧/27.7s/4MB），抽 12 场景中点帧＋grid/timeline 末尾帧目检（out/playbook-check/）：11 种节点全部正常渲染，grid/timeline 逐个点亮动效正常（中点帧半亮是中途态非 bug），table 白底高亮行红框正常，clip 场景正常播放占位素材（public/placeholder-clip.mp4，由成片复制）；文案自拟仅验证用

## 进行中

- 无

## 待办

- [x] 用六类打法各写一支实战 storyboard 验证节点渲染效果（尤其 stat 大数字/表格/timeline/clip）——playbook-test 已验证
- [ ] 换真 BGM 覆盖 public/bgm.mp3 后重渲（现为静音占位）
- [ ] 接第 20 篇声音克隆做带旁白完整版（可选，Windows 无 N 卡建议走 MiniMax 云端）

## 阻塞

- 无

- [ ] 用真实题材＋真实数据写一支可发布的 storyboard（当前 playbook-test 文案为占位）

## 最近验证

- 2026-10-09 playbook-test：npm run render 成功（831 帧/4MB），11 种 play 节点抽帧目检全部通过
- 2026-10-09 六类打法改动后 lint 0 错误、npm run render 回归通过（stormzhang-3ways-h.mp4 945 帧/3MB）
- 2026-10-08 22:xx 成片双版渲染成功：preview-h.mp4 / preview-v.mp4 均 34.1s（1023 帧）与时间轴一致，2.8MB/2.7MB；第 21 篇改动经作者对照帧验收「都比之前好」后应用全片
- 2026-10-08 Studio 启动正常，3000 端口 200
