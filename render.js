/**
 * 🛠️ MASTER RENDER BYPASS FOR WINDOWS ARM64
 * 
 * Este script aplica un "engaño" a nivel de sistema para saltarse el bloqueo
 * de arquitectura de Remotion 4.x en Windows ARM64.
 */

// 1. FORZAR ARQUITECTURA X64 (El "Truco Sucio")
// Esto hace que Remotion crea que está en una PC normal x64.
// Como Chrome x64 funciona en Windows ARM64, el renderizado funcionará.
try {
    Object.defineProperty(process, 'arch', {
        value: 'x64'
    });
    console.log("🛠️ Arquitectura emulada: " + process.arch);
} catch (e) {
    console.log("⚠️ No se pudo redefinir process.arch, intentando continuar...");
}

// Usar Edge nativo ARM64 en lugar de Chrome emulado x64
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
process.env.REMOTION_CHROME_EXECUTABLE_PATH = browserPath;

// Cargar Remotion DESPUÉS de aplicar el truco de arquitectura
const { bundle } = require("@remotion/bundler");
const { renderMedia, getCompositions } = require("@remotion/renderer");
const path = require("path");
const fs = require("fs");

async function start() {
    console.log("🚀 Iniciando renderizado con modo de COMPATIBILIDAD ARM64...");

    const entry = path.join(process.cwd(), "src/index.ts");
    const outputLocation = path.join(process.cwd(), "out/boxes-logo.mp4");

    if (!fs.existsSync(browserPath)) {
        console.error("❌ Error: No se encontró Chrome en " + browserPath);
        process.exit(1);
    }

    console.log("📦 Empaquetando proyecto...");
    const bundler = await bundle(entry);

    console.log("🎬 Buscando composiciones (usando bypass de arquitectura)...");

    let compositions;
    try {
        compositions = await getCompositions(bundler, {
            browserExecutable: browserPath,
            chromiumOptions: {
                headless: "shell",
                args: ["--headless=new"],
            },
        });
    } catch (err) {
        console.error("❌ Error al buscar composiciones:");
        console.error(err.message);
        process.exit(1);
    }

    const composition = compositions.find(c => c.id === "BoxesMediaLogo");

    if (!composition) {
        console.error("❌ Error: No se encontró la composición 'BoxesMediaLogo'");
        console.log("Composiciones disponibles:", compositions.map(c => c.id).join(", "));
        process.exit(1);
    }

    console.log("🎥 Renderizando video...");

    if (!fs.existsSync(path.join(process.cwd(), "out"))) {
        fs.mkdirSync(path.join(process.cwd(), "out"));
    }

    try {
        await renderMedia({
            composition,
            serveUrl: bundler,
            codec: "h264",
            outputLocation,
            browserExecutable: browserPath,
            chromiumOptions: {
                headless: "shell",
                args: ["--headless=new"],
            },
            onProgress: ({ progress }) => {
                process.stdout.write(`\rProcesando: ${(progress * 100).toFixed(1)}% `);
            },
        });

        console.log("\n✅ ¡LOGRADO! El video se renderizó correctamente.");
        console.log("📂 Archivo: " + outputLocation);
    } catch (err) {
        console.error("\n❌ Error durante el renderizado:");
        console.error(err);
        process.exit(1);
    }
}

start();
