const puppeteer = require('puppeteer');
const path = require('path');

async function captureScreenshots() {
    console.log('🚀 Iniciando captura de pantallas...');

    const browser = await puppeteer.launch({
        headless: false, // Para que puedas ver el proceso
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();

        // Conectar al dashboard en el puerto 3001
        console.log('🔍 Conectando a http://localhost:3001...');
        await page.goto('http://localhost:3001', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log('✅ Conectado exitosamente!');

        // Esperar a que cargue el contenido
        await page.waitForTimeout(3000);

        const outputDir = path.join(__dirname, 'presentation-screenshots');

        // Captura 1: Vista general del dashboard
        console.log('📸 Captura 1: Vista general...');
        await page.screenshot({
            path: path.join(outputDir, '01-dashboard-hero.png'),
            fullPage: false
        });

        // Captura 2: Página completa
        console.log('📸 Captura 2: Página completa...');
        await page.screenshot({
            path: path.join(outputDir, '02-fullpage-view.png'),
            fullPage: true
        });

        // Captura 3: Scroll al centro
        console.log('📸 Captura 3: Sección media...');
        await page.evaluate(() => window.scrollTo(0, window.innerHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(outputDir, '03-middle-section.png')
        });

        // Captura 4: Zona inferior
        console.log('📸 Captura 4: Zona inferior...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(outputDir, '04-bottom-section.png')
        });

        // Captura 5: Volver arriba y capturar controles
        console.log('📸 Captura 5: Controles superiores...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(outputDir, '05-top-controls.png'),
            clip: { x: 0, y: 0, width: 1920, height: 400 }
        });

        console.log('\n✨ ¡Todas las capturas completadas!');
        console.log(`📁 Guardadas en: ${outputDir}`);
        console.log('\n📋 Capturas creadas:');
        console.log('  - 01-dashboard-hero.png (Vista inicial)');
        console.log('  - 02-fullpage-view.png (Página completa)');
        console.log('  - 03-middle-section.png (Sección media)');
        console.log('  - 04-bottom-section.png (Zona inferior)');
        console.log('  - 05-top-controls.png (Controles)');

        // Esperar 3 segundos antes de cerrar para que veas el resultado
        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

captureScreenshots()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('💥 Error fatal:', err);
        process.exit(1);
    });
