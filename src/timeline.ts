// 时间轴估算：全部由 storyboard.json 数据推导，无硬编码时长
import storyboard from "../storyboard.json";

export const FPS = 30; // 帧率（每秒 30 帧）
const WORDS_PER_SECOND = storyboard.meta.wordsPerSecond; // 中文每秒读 5 字
const BREATH = storyboard.meta.breathSeconds; // 每屏 1 秒呼吸感
const TRANSITION = 0.5; // 场景过渡 0.5 秒（淡入+滑动）

// ── 六类叙事打法（整支视频的叙事套路，源自 stormzhang 9 支精拆归纳）─────────
// terms    = P1 术语科普流   （v2：一词一卡三拍轮播，卡片网格兼进度条）
// data     = P2 数据轰炸     （v3/v7：超大数字＋价格/跑分表格＋对比卡三连击）
// trust    = P3 开源种草信任链（v4：录屏实证→能力卡→榜单背书→成本打消→实跑收尾）
// opinion  = P4 时间线＋观点  （v5/v8：时间线节点高亮＋引用卡＋人物卡＋大字判断页）
// showcase = P5 素材直给     （v6：无版式页，全屏素材快切＋字幕条断言）
// compare  = P6 功能前后对比 （v9：线框＋录屏交替→前后对比双栏→适合/不适合→判断）
export type Playbook = "terms" | "data" | "trust" | "opinion" | "showcase" | "compare";

// 整支视频的打法标记（storyboard.json 里 meta.playbook，可省略）
export const PLAYBOOK: Playbook | undefined = (storyboard.meta as { playbook?: Playbook }).playbook;

// ── 打法数据节点：挂在单个场景上的专用内容，有啥节点就渲染啥，全部可选 ─────────
// 对比卡通用结构（左右两张卡，各一行标签 + 一行大字）
export type CompareCard = { label: string; value: string };

export type PlayNode =
  | { kind: "term"; term: string; subtitle?: string; metaphor?: string } // P1 词条三拍：术语名＋一句定义＋比喻图示
  | { kind: "grid"; terms: string[] } // P1 进度网格：全部词条一览，当前词青色点亮
  | { kind: "stat"; value: string; unit?: string; caption?: string; was?: string } // P2 超大数字：数值＋单位小字＋说明＋划线原价(was)
  | { kind: "table"; headers: string[]; rows: string[][]; highlightRow?: number } // P2 数据表格：表头＋行数据，highlightRow＝红框主角行(0 起)
  | { kind: "compare"; left: CompareCard; right: CompareCard } // 对比双卡（P2 价格对比 / P6 能力对比通用）
  | { kind: "timeline"; points: { time: string; text: string }[] } // P4 时间线：横向节点按入场时间逐个点亮
  | { kind: "quote"; text: string; source?: string } // P4 引用卡：大引号引文＋出处（英文原文＋中文字幕同步）
  | { kind: "person"; name: string; title?: string } // P4 人物卡：圆头像位＋中文名＋头衔
  | { kind: "clip"; src: string } // P5 全屏素材：public/ 下的视频文件名，整屏播放
  | { kind: "beforeAfter"; before: string; after: string } // P6 前后对比：左「之前」右「之后」双栏
  | { kind: "fit"; good: string[]; bad: string[] }; // P6 边界卡：左「适合」(青)右「不适合」(红) 两组要点

export type SceneTiming = {
  id: string; // 场景编号（如 "01"）
  kicker: string; // 左上角角标（章节小标签）
  title: string; // 场景大标题
  layout?: "statement" | "cards" | "diagram" | "demo"; // 版式页类型（缺省＝角标+标题+要点列表）
  bullets: string[]; // 要点列表（逐条入场，也是字幕语料）
  play?: PlayNode; // 打法数据节点（可选，见上方 PlayNode 各分支的中文说明）
  seconds?: number; // 手动指定本场景时长（秒），不给则按字数自动估算（clip 素材场景必填）
  startSec: number; // 本场景在全片中的起始秒（自动算出）
  durationSec: number; // 本场景时长（自动算出或 seconds 指定）
  // 每条要点的入场时间（秒，相对场景起点）
  bulletStarts: number[];
};

// 统计有效字数：去掉标点和空白，只数汉字/字母
const countChars = (s: string) => s.replace(/[，。、？！\s]/g, "").length;

const scenes: SceneTiming[] = (() => {
  let cursor = 0;
  return storyboard.scenes.map((scene) => {
    const raw = scene as Partial<SceneTiming>;
    const titleChars = countChars(scene.title);
    const bulletChars = scene.bullets.map(countChars);
    // 屏显总字数决定整屏时长：5 字/秒 + 1 秒呼吸，钩子屏至少 2.5 秒
    const totalChars = titleChars + bulletChars.reduce((a, b) => a + b, 0);
    const autoDuration = Math.max(
      scene.bullets.length === 0 ? 2.5 : 3,
      totalChars / WORDS_PER_SECOND + BREATH
    );
    // 手动 seconds 优先（全屏素材等字数估不准的场景用）
    const durationSec = raw.seconds ?? autoDuration;
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
      layout: raw.layout,
      play: raw.play,
      seconds: raw.seconds,
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
// 是否显示底部字幕条（storyboard.json 里 meta.subtitleBar: true 开启）
export const SUBTITLE_ON = (storyboard.meta as { subtitleBar?: boolean }).subtitleBar === true;
// 全片总秒数（最后一个场景的起点＋时长）
export const TOTAL_SECONDS = (() => {
  const last = scenes[scenes.length - 1];
  return last.startSec + last.durationSec;
})();
// 全片总帧数：末动作后至少留 0.8s（第21篇停留规则）
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS) + 24;
// 场景过渡的帧数（0.5 秒 × 30 帧）
export const TRANSITION_FRAMES = Math.round(TRANSITION * FPS);
