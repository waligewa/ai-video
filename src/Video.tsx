// 全片：背景渐变 + 各场景按时轴轮换 + 青色进度条；BGM 存在时自动挂载
import React from "react";
import fs from "fs";
import path from "path";
import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from "remotion";
import { Scene } from "./Scene";
import { theme } from "./theme";
import { FPS, SCENES, TOTAL_FRAMES } from "./timeline";

const bgmPath = path.join(__dirname, "..", "public", "bgm.mp3");
const hasBgm = fs.existsSync(bgmPath);

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

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${theme.color.bgGradientEnd} 0%, ${theme.color.bg} 45%, ${theme.color.bgGradientEnd} 100%)`,
        fontFamily: theme.font.family,
      }}
    >
      {hasBgm && <Audio src={require("./../public/bgm.mp3")} volume={(f) => interpolate(f, [0, 30, TOTAL_FRAMES - 30, TOTAL_FRAMES], [0, 0.35, 0.35, 0], { extrapolateRight: "clamp" })} />}
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
