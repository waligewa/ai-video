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
  layout?: "statement" | "cards" | "diagram" | "demo"; // 版式页类型（缺省＝角标+标题+要点列表）
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
      layout: (scene as { layout?: SceneTiming["layout"] }).layout,
      startSec: cursor,
      durationSec,
      bulletStarts,
    };
    cursor += durationSec - TRANSITION; // 相邻场景重叠半个过渡
    return timing;
  });
})();

export const SCENES = scenes;

// 字幕轨：标题先念、要点按各自入场时间顺序念（stormzhang 式底部常驻字幕条的语料源）
export type SubtitleCue = { text: string; startSec: number; endSec: number };
export const SUBTITLES: SubtitleCue[] = (() => {
  const cues: SubtitleCue[] = [];
  for (const sc of scenes) {
    const titleStart = sc.startSec;
    if (sc.bullets.length === 0) {
      cues.push({ text: sc.title, startSec: titleStart, endSec: sc.startSec + sc.durationSec });
      continue;
    }
    cues.push({ text: sc.title, startSec: titleStart, endSec: sc.startSec + sc.bulletStarts[0] });
    sc.bullets.forEach((b, i) => {
      const end = sc.bulletStarts[i + 1] ?? sc.startSec + sc.durationSec;
      cues.push({ text: b, startSec: sc.startSec + sc.bulletStarts[i], endSec: end });
    });
  }
  return cues;
})();
export const SUBTITLE_ON = (storyboard.meta as { subtitleBar?: boolean }).subtitleBar === true;
export const TOTAL_SECONDS = (() => {
  const last = scenes[scenes.length - 1];
  return last.startSec + last.durationSec;
})();
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS) + 24; // 末动作后至少留 0.8s（第21篇停留规则）
export const TRANSITION_FRAMES = Math.round(TRANSITION * FPS);
