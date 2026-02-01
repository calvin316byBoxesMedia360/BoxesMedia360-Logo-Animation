import "./index.css";
import { Composition } from "remotion";
import { MyComp } from "./compositions/MyComp";
import { BoxesMediaLogo } from "./compositions/BoxesMediaLogo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={720}
      />
      <Composition
        id="BoxesMediaLogo"
        component={BoxesMediaLogo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
