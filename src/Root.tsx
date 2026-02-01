import "./index.css";
import { Composition } from "remotion";
import { MyComp } from "./compositions/MyComp";
import { BoxesMediaLogo } from "./compositions/BoxesMediaLogo";
import { HolographicParticles } from "./compositions/HolographicParticles";
import { HolographicParticlesV2 } from "./compositions/HolographicParticlesV2";

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
      <Composition
        id="HolographicParticles"
        component={HolographicParticles}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HolographicParticlesV2"
        component={HolographicParticlesV2}
        durationInFrames={300}  // 10 segundos
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
