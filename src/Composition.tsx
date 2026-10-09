import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL_FRAMES } from "./timeline";

// 两套形态共用同一时间轴与组件：横版为主，竖版备份
export const MyComposition: React.FC = () => {
  return (
    <>
      {/* preview-h＝横版 1920×1080（主力形态） */}
      <Composition
        id="preview-h"
        component={Video}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* preview-v＝竖版 1080×1920（手机全屏形态） */}
      <Composition
        id="preview-v"
        component={Video}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
