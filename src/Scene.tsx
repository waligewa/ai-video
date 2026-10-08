// 单个场景：角标 + 标题 + 要点逐条入场（当前条全亮、前一条半暗）
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
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
      {scene.layout === "cards" ? (
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
const DemoBlock: React.FC<{ scene: SceneTiming; sceneSec: number }> = ({ scene }) => (
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
