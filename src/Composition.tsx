import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL_FRAMES } from "./timeline";

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="preview"
      component={Video}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
