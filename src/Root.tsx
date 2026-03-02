import "./index.css";
import { Composition, getInputProps } from "remotion";
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
  sceneDuration: 4.0, // Ahora en segundos
};

// Función para calcular duración basada en props
const calculateMenuDuration = (props: PremiumMenuProps) => {
  const transitionFrames = 25;

  // Salvaguarda: si sceneDuration > 100, es probable que se guardó en frames accidentalmente
  let sceneDurationSec = props.sceneDuration || 4.0;
  if (sceneDurationSec > 100) sceneDurationSec = sceneDurationSec / 30;

  const sceneDurationFrames = Math.round(sceneDurationSec * 30);

  const safeItems = props.menuItems && props.menuItems.length > 0
    ? props.menuItems
    : sampleMenuData.menuItems;

  const itemsToRender = props.isSeamlessLoop ? [...safeItems, safeItems[0]] : safeItems;

  let totalFrames = 0;
  itemsToRender.forEach((item, index) => {
    // Lo mismo para duraciones individuales
    let itemDurSec = item.duration;
    if (itemDurSec && itemDurSec > 100) itemDurSec = itemDurSec / 30;

    let itemDurationFrames = itemDurSec
      ? Math.round(itemDurSec * 30)
      : sceneDurationFrames;

    // Si es el último item y es un loop sin fin, solo lo necesitamos 
    // lo suficiente para que termine la transición (fadeIn del primero)
    if (props.isSeamlessLoop && index === itemsToRender.length - 1) {
      itemDurationFrames = transitionFrames;
    }

    const offset = (index === itemsToRender.length - 1)
      ? 0
      : transitionFrames;

    totalFrames += (itemDurationFrames - offset);
  });

  return Math.max(totalFrames, 1);
};

export const RemotionRoot: React.FC = () => {
  // Obtener props de entrada para renderizado dinámico
  const inputProps = getInputProps() as any;
  const hasValidProps = inputProps && inputProps.menuItems && inputProps.menuItems.length > 0;
  const currentDuration = calculateMenuDuration(hasValidProps ? inputProps : sampleMenuData);

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
        defaultProps={sampleMenuData}
      />
      {/* 🆕 Versión dinámica con Props */}
      <Composition
        id="PremiumMenuDynamic"
        component={PremiumMenuDynamic}
        durationInFrames={currentDuration}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={sampleMenuData}
      />
    </>
  );
};
