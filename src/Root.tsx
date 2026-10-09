// Remotion 根组件：注册所有 Composition（视频形态入口），由 remotion.config.ts 指向
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
    </>
  );
};
