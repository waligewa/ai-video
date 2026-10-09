// 单个场景：角标 + 标题 + 要点逐条入场（当前条全亮、前一条半暗）
// 挂了打法数据节点（scene.play）的场景优先渲染节点内容，六类打法见 timeline.ts 的 PlayNode
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile } from "remotion";
import { theme } from "./theme";
import { TRANSITION_FRAMES } from "./timeline";
import type { SceneTiming } from "./timeline";

export const Scene: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
  const globalFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = globalFrame - Math.round(scene.startSec * 30);

  // 场景入场：0.5 秒淡入 + 从右滑入
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const slideX = interpolate(enter, [0, 1], [60, 0]);
  // 场景出场：最后 0.3 秒淡出
  const outStart = scene.durationSec * 30 - 9;
  const outOpacity = frame >= outStart ? interpolate(frame, [outStart, outStart + 9], [1, 0], { extrapolateRight: "clamp" }) : 1;

  const sceneSec = frame / 30;
  if (frame < 0 || frame >= scene.durationSec * 30) return null;

  // P5 全屏素材：不走角标/标题框架，整屏播视频＋字幕条即全部
  if (scene.play?.kind === "clip") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity: opacity * outOpacity }}>
        <OffthreadVideo src={staticFile(scene.play.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: `0 ${theme.size.safe}px`,
        opacity: opacity * outOpacity,
        transform: `translateX(${slideX}px)`,
      }}
    >
      {scene.kicker && (
        <div
          style={{
            color: theme.color.kicker,
            fontSize: theme.size.kicker,
            fontWeight: 600,
            letterSpacing: 4,
            marginBottom: 18,
          }}
        >
          {scene.kicker}
        </div>
      )}
      <div
        style={{
          color: theme.color.title,
          fontSize: scene.bullets.length === 0 ? 48 : theme.size.title,
          fontWeight: theme.font.titleWeight,
          lineHeight: 1.4,
          marginBottom: scene.bullets.length === 0 ? 0 : 56,
          textShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {scene.title}
      </div>
      {scene.play ? (
        <PlayBlock scene={scene} sceneSec={sceneSec} />
      ) : scene.layout === "cards" ? (
        <CardsBlock scene={scene} sceneSec={sceneSec} />
      ) : scene.layout === "diagram" ? (
        <DiagramBlock scene={scene} sceneSec={sceneSec} />
      ) : scene.layout === "demo" ? (
        <DemoBlock scene={scene} sceneSec={sceneSec} />
      ) : (
        scene.bullets.map((bullet, i) => {
        const startSec = scene.bulletStarts[i];
        const nextStart = scene.bulletStarts[i + 1] ?? Infinity;
        const appeared = sceneSec >= startSec;
        // 当前条全亮（青色标记），后面的条出现后自己降为半暗
        const isCurrent = sceneSec >= startSec && sceneSec < nextStart;
        const itemEnter = appeared
          ? spring({ frame: frame - Math.round(startSec * 30), fps, config: { damping: 16, stiffness: 100 } })
          : 0;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 34,
              opacity: appeared ? interpolate(itemEnter, [0, 1], [0, 1]) : 0,
              transform: `translateY(${interpolate(itemEnter, [0, 1], [16, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: isCurrent ? theme.color.accent : theme.color.textDim,
                boxShadow: isCurrent ? `0 0 12px ${theme.color.accent}` : "none",
              }}
            />
            <div
              style={{
                fontSize: theme.size.bullet,
                fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? theme.color.text : theme.color.textDim,
                transition: "none",
              }}
            >
              {bullet}
            </div>
          </div>
        );
        })
      )}
    </div>
  );
};

export const TRANSITION_F = TRANSITION_FRAMES;

// B 型·卡片页：1-3 张圆角卡片横排，图标点+标签，当前张青色描边（stormzhang 卡片信息页）
const CardsBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => (
  <div style={{ display: "flex", gap: 40, width: "100%" }}>
    {scene.bullets.map((bullet, i) => {
      const startSec = scene.bulletStarts[i];
      const isCurrent = sceneSec >= startSec && (scene.bulletStarts[i + 1] ?? Infinity) > sceneSec;
      const dim = sceneSec >= (scene.bulletStarts[i + 1] ?? Infinity);
      return (
        <div
          key={i}
          style={{
            flex: 1,
            border: `2px solid ${isCurrent ? theme.color.accent : "rgba(255,255,255,0.18)"}`,
            borderRadius: 24,
            padding: "44px 36px",
            background: "rgba(255,255,255,0.04)",
            opacity: sceneSec >= startSec ? 1 : 0,
            transform: `translateY(${sceneSec >= startSec ? 0 : 20}px)`,
            boxShadow: isCurrent ? `0 0 24px rgba(34,211,238,0.25)` : "none",
            transition: "none",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, marginBottom: 24, background: dim ? theme.color.textDim : theme.color.accent }} />
          <div style={{ fontSize: 32, fontWeight: 600, color: dim ? theme.color.textDim : theme.color.text, lineHeight: 1.5 }}>{bullet}</div>
        </div>
      );
    })}
  </div>
);

// C 型·线框示意页：macOS 三圆点窗口，左侧栏＝要点条目，当前条青色高亮（stormzhang 线框示意图页）
const DiagramBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => (
  <div
    style={{
      width: "100%",
      maxWidth: 1080,
      border: "2px solid rgba(255,255,255,0.22)",
      borderRadius: 20,
      background: "rgba(255,255,255,0.03)",
      overflow: "hidden",
    }}
  >
    <div style={{ display: "flex", gap: 10, padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
      ))}
    </div>
    <div style={{ display: "flex", padding: 32, gap: 40, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, minWidth: 320 }}>
        {scene.bullets.map((bullet, i) => {
          const startSec = scene.bulletStarts[i];
          const isCurrent = sceneSec >= startSec && (scene.bulletStarts[i + 1] ?? Infinity) > sceneSec;
          const dim = sceneSec >= (scene.bulletStarts[i + 1] ?? Infinity);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: sceneSec >= startSec ? 1 : 0,
                border: `2px solid ${isCurrent ? theme.color.accent : "transparent"}`,
                borderRadius: 14,
                padding: "14px 20px",
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 3, background: dim ? theme.color.textDim : theme.color.accent }} />
              <div style={{ fontSize: 30, fontWeight: isCurrent ? 600 : 400, color: dim ? theme.color.textDim : theme.color.text }}>{bullet}</div>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, height: 320, border: "2px dashed rgba(255,255,255,0.18)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: theme.color.textDim, fontSize: 26 }}>
        图示区
      </div>
    </div>
  </div>
);

// D 型·录屏演示页：虚线大框占位，后续接真实录屏素材（stormzhang 录屏演示页）
const DemoBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = () => (
  <div
    style={{
      width: "100%",
      height: 520,
      border: "2px dashed rgba(34,211,238,0.5)",
      borderRadius: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      background: "rgba(34,211,238,0.04)",
    }}
  >
    <div style={{ fontSize: 26, color: theme.color.textDim }}>录屏位：替换为真实操作素材</div>
  </div>
);

// ── 打法数据节点渲染：按 scene.play.kind 分发到下方各组件 ─────────────────────
const PlayBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play!;
  switch (play.kind) {
    case "term": return <TermBlock scene={scene} sceneSec={sceneSec} />;
    case "grid": return <GridBlock scene={scene} sceneSec={sceneSec} />;
    case "stat": return <StatBlock scene={scene} sceneSec={sceneSec} />;
    case "table": return <TableBlock scene={scene} sceneSec={sceneSec} />;
    case "compare": return <CompareBlock scene={scene} sceneSec={sceneSec} />;
    case "timeline": return <TimelineBlock scene={scene} sceneSec={sceneSec} />;
    case "quote": return <QuoteBlock scene={scene} sceneSec={sceneSec} />;
    case "person": return <PersonBlock scene={scene} sceneSec={sceneSec} />;
    case "beforeAfter": return <BeforeAfterBlock scene={scene} sceneSec={sceneSec} />;
    case "fit": return <FitBlock scene={scene} sceneSec={sceneSec} />;
    default: return null; // clip 已在 Scene 主组件里全屏处理
  }
};

// P1 词条卡：术语名超大＋一句定义＋比喻卡（stormzhang「一词一卡放大」）
const TermBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "term"; term: string; subtitle?: string; metaphor?: string };
  const appear = spring({ frame: Math.round(sceneSec * 30), fps: 30, config: { damping: 16, stiffness: 100 } });
  return (
    <div style={{ width: "100%", opacity: interpolate(appear, [0, 1], [0, 1]) }}>
      <div style={{ fontSize: 96, fontWeight: 700, color: theme.color.title, marginBottom: 20 }}>{play.term}</div>
      {play.subtitle && <div style={{ fontSize: 34, color: theme.color.text, marginBottom: 36 }}>{play.subtitle}</div>}
      {play.metaphor && (
        <div style={{ border: `2px solid ${theme.color.accent}`, borderRadius: 24, padding: "32px 36px", background: "rgba(255,255,255,0.04)", maxWidth: 900 }}>
          <div style={{ fontSize: 26, color: theme.color.kicker, letterSpacing: 4, marginBottom: 14 }}>打个比方</div>
          <div style={{ fontSize: 32, color: theme.color.text, lineHeight: 1.6 }}>{play.metaphor}</div>
        </div>
      )}
    </div>
  );
};

// P1 进度网格：全部词条一览，讲到的词青色点亮（v2 的「卡片网格兼章节进度条」）
const GridBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "grid"; terms: string[] };
  const step = scene.durationSec / (play.terms.length + 1); // 每个词条的点亮间隔
  const litCount = Math.min(play.terms.length, Math.floor(sceneSec / step));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "100%", maxWidth: 1080 }}>
      {play.terms.map((term, i) => {
        const lit = i < litCount;
        return (
          <div
            key={term}
            style={{
              border: `2px solid ${lit ? theme.color.accent : "rgba(255,255,255,0.18)"}`,
              borderRadius: 18,
              padding: "22px 34px",
              fontSize: 32,
              fontWeight: lit ? 600 : 400,
              color: lit ? theme.color.text : theme.color.textDim,
              background: lit ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.03)",
              boxShadow: lit ? "0 0 20px rgba(34,211,238,0.2)" : "none",
            }}
          >
            {term}
          </div>
        );
      })}
    </div>
  );
};

// P2 超大数字：数值特写＋单位小字＋划线原价（v3/v7「数据轰炸」页）
const StatBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "stat"; value: string; unit?: string; caption?: string; was?: string };
  const scale = spring({ frame: Math.round(sceneSec * 30), fps: 30, config: { damping: 14, stiffness: 120 } });
  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {play.was && (
        <div style={{ fontSize: 40, color: theme.color.textDim, textDecoration: "line-through", marginBottom: 12 }}>{play.was}</div>
      )}
      <div
        style={{
          fontSize: 200,
          fontWeight: 800,
          color: theme.color.accent,
          lineHeight: 1.1,
          textShadow: `0 0 60px rgba(34,211,238,0.35)`,
          transform: `scale(${interpolate(scale, [0, 1], [0.6, 1])})`,
        }}
      >
        {play.value}
        {play.unit && <span style={{ fontSize: 56, fontWeight: 600, color: theme.color.text, marginLeft: 16 }}>{play.unit}</span>}
      </div>
      {play.caption && <div style={{ fontSize: 32, color: theme.color.text, marginTop: 28 }}>{play.caption}</div>}
    </div>
  );
};

// P2 数据表格：白底卡＋主角行红框高亮（v3 跑分表 / v7 价格表）
const TableBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene }) => {
  const play = scene.play as { kind: "table"; headers: string[]; rows: string[][]; highlightRow?: number };
  return (
    <div style={{ width: "100%", maxWidth: 1000, borderRadius: 20, overflow: "hidden", background: "rgba(255,255,255,0.95)", color: "#111" }}>
      <div style={{ display: "flex", padding: "20px 28px", borderBottom: "2px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: 28 }}>
        {play.headers.map((h, i) => <div key={i} style={{ flex: 1 }}>{h}</div>)}
      </div>
      {play.rows.map((row, r) => {
        const hl = r === play.highlightRow;
        return (
          <div
            key={r}
            style={{
              display: "flex",
              padding: "18px 28px",
              fontSize: 28,
              alignItems: "center",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              outline: hl ? "3px solid #E11D2E" : "none",
              outlineOffset: hl ? "-3px" : "0",
              background: hl ? "rgba(225,29,46,0.06)" : "transparent",
              fontWeight: hl ? 700 : 400,
            }}
          >
            {row.map((cell, c) => <div key={c} style={{ flex: 1 }}>{cell}</div>)}
          </div>
        );
      })}
    </div>
  );
};

// 对比双卡：左右两张，标签＋大字（P2 价格对比 / P6 能力对比通用）
const CompareBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "compare"; left: { label: string; value: string }; right: { label: string; value: string } };
  return (
    <div style={{ display: "flex", gap: 40, width: "100%" }}>
      {[play.left, play.right].map((card, i) => {
        const appear = spring({ frame: Math.round(sceneSec * 30) - i * 15, fps: 30, config: { damping: 16, stiffness: 100 } });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              border: `2px solid ${i === 1 ? theme.color.accent : "rgba(255,255,255,0.18)"}`,
              borderRadius: 24,
              padding: "48px 40px",
              background: "rgba(255,255,255,0.04)",
              opacity: interpolate(appear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 28, color: theme.color.kicker, letterSpacing: 3, marginBottom: 20 }}>{card.label}</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: i === 1 ? theme.color.accent : theme.color.text }}>{card.value}</div>
          </div>
        );
      })}
    </div>
  );
};

// P4 时间线：水平轴＋节点按入场时间逐个点亮（v5 马斯克/OpenAI 恩怨线 / v7 事件回顾）
const TimelineBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "timeline"; points: { time: string; text: string }[] };
  const step = scene.durationSec / (play.points.length + 1);
  const litCount = Math.min(play.points.length, Math.floor(sceneSec / step));
  return (
    <div style={{ width: "100%", maxWidth: 1080 }}>
      <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 2, margin: "120px 0 60px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(litCount / play.points.length) * 100}%`, background: theme.color.accent, borderRadius: 2, transition: "none" }} />
        {play.points.map((p, i) => {
          const lit = i < litCount;
          return (
            <div key={i} style={{ position: "absolute", left: `${((i + 0.5) / play.points.length) * 100}%`, top: -8, transform: "translateX(-50%)" }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: lit ? theme.color.accent : "rgba(255,255,255,0.25)", boxShadow: lit ? `0 0 16px ${theme.color.accent}` : "none" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {play.points.map((p, i) => {
          const lit = i < litCount;
          return (
            <div key={i} style={{ flex: 1, opacity: lit ? 1 : 0.25, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: lit ? theme.color.accent : theme.color.textDim, marginBottom: 10 }}>{p.time}</div>
              <div style={{ fontSize: 24, color: lit ? theme.color.text : theme.color.textDim, lineHeight: 1.5 }}>{p.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// P4 引用卡：大引号＋引文＋出处（v5 Altman 博客 / v8 大佬互怼）
const QuoteBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "quote"; text: string; source?: string };
  const appear = spring({ frame: Math.round(sceneSec * 30), fps: 30, config: { damping: 16, stiffness: 100 } });
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1000,
        opacity: interpolate(appear, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(appear, [0, 1], [20, 0])}px)`,
      }}
    >
      <div style={{ fontSize: 120, color: theme.color.accent, lineHeight: 0.6, marginBottom: 24, fontFamily: "Georgia, serif" }}>“</div>
      <div style={{ fontSize: 44, fontWeight: 600, color: theme.color.title, lineHeight: 1.6, marginBottom: 28 }}>{play.text}</div>
      {play.source && <div style={{ fontSize: 26, color: theme.color.kicker, letterSpacing: 2 }}>—— {play.source}</div>}
    </div>
  );
};

// P4 人物卡：圆头像位＋中文名＋头衔（v8 达里奥/马斯克/山姆摆阵营）
const PersonBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "person"; name: string; title?: string };
  const appear = spring({ frame: Math.round(sceneSec * 30), fps: 30, config: { damping: 16, stiffness: 100 } });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        opacity: interpolate(appear, [0, 1], [0, 1]),
      }}
    >
      {/* 头像占位：后续接真实头像图（public/ 下放 avatar-<name>.png 自动匹配） */}
      <div style={{ width: 200, height: 200, borderRadius: 100, border: `3px solid ${theme.color.accent}`, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: theme.color.textDim }}>
        {play.name.slice(0, 1)}
      </div>
      <div style={{ fontSize: 48, fontWeight: 700, color: theme.color.title }}>{play.name}</div>
      {play.title && <div style={{ fontSize: 28, color: theme.color.kicker, letterSpacing: 2 }}>{play.title}</div>}
    </div>
  );
};

// P6 前后对比：左「之前」灰暗右「之后」青亮双栏（v9 企业知识库对比页）
const BeforeAfterBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "beforeAfter"; before: string; after: string };
  return (
    <div style={{ display: "flex", gap: 40, width: "100%" }}>
      {[
        { label: "之前", text: play.before, accent: false },
        { label: "之后", text: play.after, accent: true },
      ].map((side, i) => {
        const appear = spring({ frame: Math.round(sceneSec * 30) - i * 15, fps: 30, config: { damping: 16, stiffness: 100 } });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              border: `2px solid ${side.accent ? theme.color.accent : "rgba(255,255,255,0.18)"}`,
              borderRadius: 24,
              padding: "48px 40px",
              background: side.accent ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.03)",
              opacity: interpolate(appear, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(appear, [0, 1], [i === 0 ? -24 : 24, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 28, color: side.accent ? theme.color.kicker : theme.color.textDim, letterSpacing: 4, marginBottom: 20 }}>{side.label}</div>
            <div style={{ fontSize: 36, lineHeight: 1.6, color: side.accent ? theme.color.text : theme.color.textDim }}>{side.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// P6 适合/不适合：左「适合」青右「不适合」红，各一组要点（v9 边界页，收判断前的自我设限）
const FitBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene, sceneSec }) => {
  const play = scene.play as { kind: "fit"; good: string[]; bad: string[] };
  return (
    <div style={{ display: "flex", gap: 40, width: "100%" }}>
      {[
        { label: "适合", items: play.good, color: theme.color.accent },
        { label: "不适合", items: play.bad, color: "#E11D2E" },
      ].map((side, i) => {
        const appear = spring({ frame: Math.round(sceneSec * 30) - i * 15, fps: 30, config: { damping: 16, stiffness: 100 } });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              border: `2px solid ${side.color}`,
              borderRadius: 24,
              padding: "44px 40px",
              background: "rgba(255,255,255,0.04)",
              opacity: interpolate(appear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: side.color, marginBottom: 28 }}>{side.label}</div>
            {side.items.map((item, j) => (
              <div key={j} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18, fontSize: 28, color: theme.color.text }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: side.color }} />
                {item}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
