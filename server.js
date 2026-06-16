const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { renderVideo } = require('./scripts/render-video');

// Inicializar Firebase Admin (OPCIONAL — no requerido para el render LOCAL)
// Nota: Se usará la configuración por defecto (Application Default Credentials)
// Si encuentras errores de permisos, asegúrate de estar logueado o proveer un Service Account.
// En el flujo de render LOCAL (sin nube) no se necesita; por eso la init no es fatal.
let firebaseApp = null;
let db = null;
let bucket = null;
try {
    firebaseApp = admin.initializeApp({
        projectId: "boxesos-crmtest",
        storageBucket: "boxesos-crmtest.firebasestorage.app"
    });
    db = admin.firestore();
    bucket = admin.storage().bucket();
} catch (err) {
    console.warn('⚠️  Firebase no inicializado (modo local sin nube):', err.message);
}

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware — allow all origins (required for Firebase Hosting → Cloud Run)
app.use(cors({ origin: true }));
app.use(express.json());

// Servir archivos estáticos de la carpeta out
app.use('/videos', express.static(path.join(__dirname, 'out')));

// Carpeta local de assets subidos (imágenes/videos de platillos) — reemplaza Firebase Storage
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

/**
 * POST /api/upload-asset
 * Guarda una imagen/video en disco local (public/uploads) y devuelve su URL local.
 * Recibe el binario crudo en el body; el nombre va en el header x-filename.
 */
app.post('/api/upload-asset', express.raw({ type: '*/*', limit: '200mb' }), (req, res) => {
    try {
        const original = (req.headers['x-filename'] || 'asset').toString();
        const safe = `${Date.now()}_${original.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const dest = path.join(UPLOADS_DIR, safe);
        fs.writeFileSync(dest, req.body);
        const host = `${req.protocol}://${req.get('host')}`;
        const url = `${host}/uploads/${safe}`;
        console.log(`📥 Asset guardado localmente: ${url}`);
        res.json({ success: true, url, filename: safe });
    } catch (error) {
        console.error('❌ Error guardando asset:', error);
        res.status(500).json({ success: false, error: error.message || String(error) });
    }
});

/**
 * Función para subir archivo a Firebase Storage
 */
async function uploadToFirebase(filePath, destination, metadata) {
    try {
        console.log(`📤 Subiendo a Firebase Storage: ${destination}...`);
        const [file] = await bucket.upload(filePath, {
            destination,
            metadata: {
                contentType: 'video/mp4',
                ...metadata
            },
        });

        // Hacer el archivo público (opcional, dependiendo de la política)
        await file.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        console.log(`✅ Subida exitosa: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('❌ Error subiendo a Storage:', error);
        throw error;
    }
}

/**
 * POST /api/render
 * Renderiza un video MP4 y lo sube a Firebase Storage
 */
app.post('/api/render', async (req, res) => {
    // Frontend sends: { projectId, menuConfig, quality }
    // Extract menuConfig properly — fallback to entire body for backwards compat
    const body = req.body;
    const menuConfig = body.menuConfig || body;
    const projectId = body.projectId || `export-${Date.now()}`;
    const userId = menuConfig.userId || menuConfig._userId || 'anonymous';

    console.log('\n🎬 Nueva solicitud de renderizado recibida');
    console.log(`   Usuario: ${userId}`);
    console.log(`   Platillos: ${menuConfig.menuItems?.length || 0}`);
    console.log(`   Restaurante: ${menuConfig.restaurantName || 'Sin nombre'}\n`);

    try {
        // 1. Renderizar video localmente
        const result = await renderVideo(menuConfig);

        // 2. Subir a Firebase Storage
        const destination = `videos/${userId}/${result.filename}`;
        const cloudUrl = await uploadToFirebase(result.outputPath, destination, {
            restaurantName: menuConfig.restaurantName,
            userId: userId
        });

        // 3. Registrar en Firestore
        await db.collection('exports').add({
            userId: userId || null,
            projectId: projectId || null,
            restaurantName: menuConfig.restaurantName || menuConfig.name || null,
            filename: result.filename || null,
            url: cloudUrl || null,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({
            success: true,
            message: 'Video renderizado y subido exitosamente',
            videoUrl: cloudUrl,
            downloadUrl: cloudUrl,
            filename: result.filename,
            renderId: projectId,
        });

    } catch (error) {
        console.error('❌ Error en el proceso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el video',
            error: error.message || String(error),
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        });
    }
});

/**
 * POST /api/render-local
 * Renderiza un video MP4 100% LOCAL (sin Firebase / sin nube).
 * Devuelve la URL local servida por este mismo servidor (/videos).
 * Pensado para el flujo del Asus ROG: render en el equipo y descarga directa.
 */
app.post('/api/render-local', async (req, res) => {
    const body = req.body;
    const menuConfig = body.menuConfig || body;
    const projectId = body.projectId || `local-${Date.now()}`;
    const startedAt = Date.now();

    console.log('\n🖥️  Render LOCAL solicitado (sin nube)');
    console.log(`   Platillos: ${menuConfig.menuItems?.length || 0}`);
    console.log(`   Restaurante: ${menuConfig.restaurantName || 'Sin nombre'}\n`);

    try {
        const result = await renderVideo(menuConfig);

        // URL local servida desde la carpeta out/ por este servidor
        const host = `${req.protocol}://${req.get('host')}`;
        const videoUrl = `${host}/videos/${result.filename}`;

        res.json({
            success: true,
            message: 'Video renderizado localmente',
            videoUrl,
            downloadUrl: videoUrl,
            filename: result.filename,
            localPath: result.outputPath,
            renderId: projectId,
            quality: body.quality || '1080p',
            durationMs: Date.now() - startedAt,
        });
    } catch (error) {
        console.error('❌ Error en render local:', error);
        res.status(500).json({
            success: false,
            message: 'Error al renderizar localmente',
            error: error.message || String(error),
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        });
    }
});

/**
 * GET /api/videos
 * Lista videos locales (para depuración)
 */
app.get('/api/videos', (req, res) => {
    const outDir = path.join(__dirname, 'out');
    if (!fs.existsSync(outDir)) return res.json({ videos: [] });

    const files = fs.readdirSync(outDir)
        .filter(file => file.endsWith('.mp4'))
        .map(file => ({
            filename: file,
            size: fs.statSync(path.join(outDir, file)).size,
            created: fs.statSync(path.join(outDir, file)).birthtime,
        }))
        .sort((a, b) => b.created - a.created);

    res.json({ videos: files });
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        firebase: firebaseApp ? 'connected' : 'local-only',
        port: PORT,
    });
});

app.listen(PORT, () => {
    console.log('\n🚀 Servidor de Renderizado PRO v2');
    console.log(`📡 Escuchando en: http://localhost:${PORT}`);
    if (firebaseApp) {
        console.log(`☁️ Firebase Project: ${firebaseApp.options.projectId}`);
        console.log(`🗂️ Bucket: ${firebaseApp.options.storageBucket}`);
    } else {
        console.log('🖥️ Modo LOCAL (sin Firebase)');
    }
    console.log('🎬 Render local: POST /api/render-local\n');
});
