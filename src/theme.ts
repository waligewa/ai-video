// 全片唯一风格源：所有场景组件一律从这里取值，禁止散落硬编码
export const theme = {
  color: {
    bg: "#0B1220", // 深蓝黑背景
    bgGradientEnd: "#060A12", // 渐变底部更暗
    title: "#FFFFFF", // 白色粗体标题
    text: "rgba(255,255,255,0.85)", // 正文
    textDim: "rgba(255,255,255,0.55)", // 半暗（已看过的要点，第21篇：55% 降优先级但不藏起来）
    accent: "#22D3EE", // 青色高亮（当前要点/角标/进度）
    kicker: "#22D3EE", // 角标同高亮色
  },
  font: {
    family: '"Microsoft YaHei", "PingFang SC", sans-serif', // 中文字体栈（雅黑→苹方→系统默认）
    titleWeight: 700, // 标题字重（粗体）
    textWeight: 400, // 正文字重（常规）
  },
  size: {
    kicker: 26, // 角标（如「死因一」）
    title: 56, // 场景标题
    bullet: 34, // 屏显要点
    safe: 80, // 屏幕左右安全边距
  },
} as const;
