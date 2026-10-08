// 时间轴估算：全部由 storyboard.json 数据推导，无硬编码时长
import storyboard from "../storyboard.json";

export const FPS = 30;
const WORDS_PER_SECOND = storyboard.meta.wordsPerSecond; // 中文每秒读 5 字
const BREATH = storyboard.meta.breathSeconds; // 每屏 1 秒呼吸感
const TRANSITION = 0.5; // 场景过渡 0.5 秒（淡入+滑动）

export type SceneTiming = {
  id: string;
  kicker: string;
  title: string;
  bullets: string[];
  startSec: number;
  durationSec: number;
  // 每条要点的入场时间（秒，相对场景起点）
  bulletStarts: number[];
};

const countChars = (s: string) => s.replace(/[，。、？！\s]/g, "").length;

const scenes: SceneTiming[] = (() => {
  let cursor = 0;
  return storyboard.scenes.map((scene) => {
    const titleChars = countChars(scene.title);
    const bulletChars = scene.bullets.map(countChars);
    // 屏显总字数决定整屏时长：5 字/秒 + 1 秒呼吸，钩子屏至少 2.5 秒
    const totalChars = titleChars + bulletChars.reduce((a, b) => a + b, 0);
    const durationSec = Math.max(
      scene.bullets.length === 0 ? 2.5 : 3,
      totalChars / WORDS_PER_SECOND + BREATH
    );
    // 要点按字数占比分配子时长（标题先给 40% 时间独占）
    const titleShare = titleChars > 0 ? 0.4 : 0;
    const bulletWindow = durationSec * (1 - titleShare);
    const bulletTotal = bulletChars.reduce((a, b) => a + b, 0);
    let bCursor = durationSec * titleShare;
    const bulletStarts = scene.bullets.map((_, i) => {
      const start = bCursor;
      bCursor += (bulletChars[i] / (bulletTotal || 1)) * bulletWindow;
      return start;
    });
    const timing: SceneTiming = {
      ...scene,
      startSec: cursor,
      durationSec,
      bulletStarts,
    };
    cursor += durationSec - TRANSITION; // 相邻场景重叠半个过渡
    return timing;
  });
})();

export const SCENES = scenes;
export const TOTAL_SECONDS = (() => {
  const last = scenes[scenes.length - 1];
  return last.startSec + last.durationSec;
})();
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);
export const TRANSITION_FRAMES = Math.round(TRANSITION * FPS);
