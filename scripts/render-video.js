const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

/**
 * Script de renderizado local de videos MP4
 * Uso: node scripts/render-video.js
 */

async function renderVideo(menuConfig) {
    console.log('🎬 Iniciando renderizado de video...\n');

    try {
        // Paso 1: Bundle del proyecto
        console.log('📦 Paso 1/3: Empaquetando proyecto Remotion...');
        const bundleLocation = await bundle({
            entryPoint: path.resolve(__dirname, '../src/index.ts'),
            webpackOverride: (config) => config,
        });
        console.log('✅ Empaquetado completo\n');

        // Paso 2: Seleccionar composición
        console.log('🎯 Paso 2/3: Seleccionando composición...');
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'PremiumMenu',
            inputProps: menuConfig,
        });
        console.log(`✅ Composición seleccionada: ${composition.width}x${composition.height}, ${composition.durationInFrames} frames\n`);

        // Paso 3: Renderizar video
        console.log('🎥 Paso 3/3: Renderizando video MP4...');
        const timestamp = Date.now();
        const outputLocation = path.resolve(__dirname, `../out/menu-${timestamp}.mp4`);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: menuConfig,
            onProgress: ({ renderedFrames, encodedFrames, totalFrames }) => {
                const progress = Math.round((renderedFrames / totalFrames) * 100);
                process.stdout.write(`\r   Progreso: ${progress}% (${renderedFrames}/${totalFrames} frames)`);
            },
        });

        console.log('\n\n✅ ¡Renderizado completo!\n');
        console.log(`📁 Archivo guardado en: ${outputLocation}`);
        console.log(`📊 Tamaño: ${(fs.statSync(outputLocation).size / 1024 / 1024).toFixed(2)} MB\n`);

        return {
            success: true,
            outputPath: outputLocation,
            filename: `menu-${timestamp}.mp4`,
        };

    } catch (error) {
        console.error('\n❌ Error durante el renderizado:', error);
        throw error;
    }
}

// Si se ejecuta directamente desde la línea de comandos
if (require.main === module) {
    // Leer configuración desde archivo o usar default
    const configPath = process.argv[2] || path.resolve(__dirname, '../menu-config.json');

    let menuConfig;
    if (fs.existsSync(configPath)) {
        console.log(`📄 Cargando configuración desde: ${configPath}\n`);
        menuConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
        console.log('⚠️  No se encontró archivo de configuración, usando menú de ejemplo\n');
        menuConfig = {
            menuItems: [
                {
                    name: 'Enchiladas Suizas',
                    description: 'Tortillas bañadas en salsa verde con crema',
                    price: '$95.00',
                    image: 'food1.jpg',
                },
                {
                    name: 'Mojarra a la Diabla',
                    description: 'Pescado frito con salsa picante',
                    price: '$145.00',
                    image: 'food2.jpg',
                },
            ],
            restaurantName: 'Los Cuates',
            accentColor: '#D4AF37',
            sceneDuration: 120,
        };
    }

    renderVideo(menuConfig)
        .then((result) => {
            console.log('🎉 Proceso completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Proceso fallido');
            process.exit(1);
        });
}

module.exports = { renderVideo };
