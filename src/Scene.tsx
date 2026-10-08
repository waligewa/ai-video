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
      {scene.bullets.map((bullet, i) => {
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
      })}
    </div>
  );
};

export const TRANSITION_F = TRANSITION_FRAMES;
