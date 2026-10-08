// 全片：背景渐变 + 各场景按时轴轮换 + 青色进度条；BGM 存在时自动挂载
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Scene } from "./Scene";
import { theme } from "./theme";
import { FPS, SCENES, TOTAL_FRAMES } from "./timeline";

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;

  // 当前场景：startSec <= sec 且还在其（含过渡重叠）窗口内
  const current = [...SCENES]
    .reverse()
    .find((s) => sec >= s.startSec && sec < s.startSec + s.durationSec + 0.5);

  const progress = interpolate(frame, [0, TOTAL_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 片尾整体淡出 20 帧（内容展示完成后才收尾）
  const endingFade =
    frame > TOTAL_FRAMES - 20
      ? interpolate(frame, [TOTAL_FRAMES - 20, TOTAL_FRAMES], [1, 0], { extrapolateRight: "clamp" })
      : 1;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${theme.color.bgGradientEnd} 0%, ${theme.color.bg} 45%, ${theme.color.bgGradientEnd} 100%)`,
        fontFamily: theme.font.family,
        opacity: endingFade,
      }}
    >
      <Audio src={staticFile("bgm.mp3")} volume={(f) => interpolate(f, [0, 30, TOTAL_FRAMES - 30, TOTAL_FRAMES], [0, 0.35, 0.35, 0], { extrapolateRight: "clamp" })} />
      {/* 呼吸光斑背景：两个径向光斑缓慢漂移＋明暗呼吸（第21篇：装饰给内容让位，振幅极小） */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -200 + Math.sin(sec / 4) * 60,
          top: -150 + Math.cos(sec / 5) * 40,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(34,211,238,${0.06 + 0.012 * Math.sin((sec * 2 * Math.PI) / 12.6)}) 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          right: -250 + Math.cos(sec / 6) * 50,
          bottom: -200 + Math.sin(sec / 5) * 45,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(59,130,246,${0.05 + 0.012 * Math.sin((sec * 2 * Math.PI) / 12.6 + 1)}) 0%, transparent 70%)`,
        }}
      />
      {current && (
        <Scene
          key={current.id}
          scene={{ ...current, durationSec: current.durationSec }}
        />
      )}
      {/* 进度条：已播青色 / 未播白 20% */}
      <div
        style={{
          position: "absolute",
          left: theme.size.safe,
          right: theme.size.safe,
          bottom: 70,
          height: 3,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: theme.color.accent,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
