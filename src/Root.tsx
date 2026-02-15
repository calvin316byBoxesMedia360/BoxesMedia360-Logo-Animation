import "./index.css";
import { Composition } from "remotion";
import { MyComp } from "./compositions/MyComp";
import { BoxesMediaLogo } from "./compositions/BoxesMediaLogo";
import { HolographicParticles } from "./compositions/HolographicParticles";
import { HolographicParticlesV2 } from "./compositions/HolographicParticlesV2";
import { BiblicalScenes } from "./compositions/BiblicalScenes";
import { PremiumMenu, PremiumMenuDynamic, PremiumMenuProps } from "./compositions/PremiumMenu";

// Datos de ejemplo para el menú dinámico
const sampleMenuData: PremiumMenuProps = {
  menuItems: [
    { image: 'food1.jpg', name: 'Enchiladas Suizas', description: 'Bañadas en salsa cremosa', price: '$14.99' },
    { image: 'food2.jpg', name: 'Mojarra a la Diabla', description: 'Pescado con camarones', price: '$24.99' },
    { image: 'food3.jpg', name: 'Micheladas Premium', description: 'Con camarones frescos', price: '$12.99' },
    { image: 'food4.jpg', name: 'Pupusas Tradicionales', description: 'Con curtido casero', price: '$9.99' },
  ],
  restaurantName: 'Los Cuates',
  accentColor: '#D4AF37',
  sceneDuration: 120,
};

// Función para calcular duración basada en props
const calculateMenuDuration = (props: PremiumMenuProps) => {
  const sceneDuration = props.sceneDuration || 120;
  const transitionFrames = 25;
  const itemCount = props.menuItems?.length || 4;
  return itemCount * (sceneDuration - transitionFrames) + transitionFrames;
};

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
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BiblicalScenes"
        component={BiblicalScenes}
        durationInFrames={280}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Versión original (hardcoded) */}
      <Composition
        id="PremiumMenu"
        component={PremiumMenu}
        durationInFrames={380}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 🆕 Versión dinámica con Props */}
      <Composition<PremiumMenuProps>
        id="PremiumMenuDynamic"
        component={PremiumMenuDynamic}
        durationInFrames={calculateMenuDuration(sampleMenuData)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={sampleMenuData}
      />
    </>
  );
};
