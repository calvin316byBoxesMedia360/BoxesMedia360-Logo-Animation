const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { renderVideo } = require('./scripts/render-video');

// Inicializar Firebase Admin
// Nota: Se usará la configuración por defecto (Application Default Credentials)
// Si encuentras errores de permisos, asegúrate de estar logueado o proveer un Service Account
const firebaseApp = admin.initializeApp({
    projectId: "boxesos-crmtest",
    storageBucket: "boxesos-crmtest.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware — allow all origins (required for Firebase Hosting → Cloud Run)
app.use(cors({ origin: true }));
app.use(express.json());

// Servir archivos estáticos de la carpeta out
app.use('/videos', express.static(path.join(__dirname, 'out')));

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
        firebase: firebaseApp.name ? 'connected' : 'error',
        port: PORT,
    });
});

app.listen(PORT, () => {
    console.log('\n🚀 Servidor de Renderizado PRO v2');
    console.log(`📡 Escuchando en: http://localhost:${PORT}`);
    console.log(`☁️ Firebase Project: ${firebaseApp.options.projectId}`);
    console.log(`🗂️ Bucket: ${firebaseApp.options.storageBucket}\n`);
});
