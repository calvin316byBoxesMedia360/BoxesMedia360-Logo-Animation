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

// Función para calcular duración basada en props con mayor robustez
const calculateMenuDuration = (props: PremiumMenuProps) => {
  const transitionFrames = 25;
  const FPS = 30;

  // Asegurar que los booleanos que llegan por CLI sean booleanos reales
  const isSeamlessLoop = props.isSeamlessLoop === true || props.isSeamlessLoop === 'true';

  console.log('--- Calculando Duración del Menú ---');
  console.log('Props recibidas:', JSON.stringify({
    restaurantName: props.restaurantName,
    itemsCount: props.menuItems?.length,
    sceneDuration: props.sceneDuration,
    isSeamlessLoop: isSeamlessLoop
  }));

  // Salvaguarda: si sceneDuration > 100, es probable que se guardó en frames accidentalmente
  let sceneDurationSec = props.sceneDuration || 4.0;
  if (sceneDurationSec > 100) sceneDurationSec = sceneDurationSec / FPS;
  // Mínimo absoluto para evitar números negativos en la resta del gap
  sceneDurationSec = Math.max(sceneDurationSec, 1.0);

  const sceneDurationFrames = Math.round(sceneDurationSec * FPS);

  const safeItems = props.menuItems && props.menuItems.length > 0
    ? props.menuItems
    : sampleMenuData.menuItems;

  const itemsToRender = isSeamlessLoop ? [...safeItems, safeItems[0]] : safeItems;
  console.log(`Analizando ${itemsToRender.length} escenas (Seamless: ${isSeamlessLoop ? 'SI' : 'NO'})`);

  let totalFrames = 0;
  itemsToRender.forEach((item, index) => {
    let itemDurSec = item.duration;
    if (itemDurSec && itemDurSec > 100) itemDurSec = itemDurSec / FPS;

    let itemDurationFrames = itemDurSec
      ? Math.round(itemDurSec * FPS)
      : sceneDurationFrames;

    // Si es el último item y es un loop sin fin, solo lo necesitamos 
    // lo suficiente para que termine la transición (fadeIn del primero)
    if (isSeamlessLoop && index === itemsToRender.length - 1) {
      itemDurationFrames = transitionFrames;
    }

    // El offset es lo que "robamos" del siguiente para el fade
    const isLast = (index === itemsToRender.length - 1);
    const offset = isLast ? 0 : transitionFrames;

    // Aseguramos que el item dure al menos un poco más que la transición
    const effectiveDuration = Math.max(itemDurationFrames - offset, 1);
    totalFrames += effectiveDuration;

    console.log(`Escena ${index}: dur=${itemDurationFrames}, offset=${offset}, acumulado=${totalFrames}`);
  });

  const finalDuration = Math.max(totalFrames, 30); // Al menos 1 segundo
  console.log(`Duración final calculada: ${finalDuration} frames (${(finalDuration / FPS).toFixed(2)}s)`);
  console.log('-----------------------------------');

  return finalDuration;
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
