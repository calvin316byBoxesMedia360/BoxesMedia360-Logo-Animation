const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function upload() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Uso: node upload-to-storage-action.js <path-to-file>');
        process.exit(1);
    }

    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
        console.log('Skipping upload: FIREBASE_SERVICE_ACCOUNT env var not set.');
        return;
    }

    const serviceAccount = JSON.parse(serviceAccountStr);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "digitalmenu-db.firebasestorage.app"
    });

    const bucket = admin.storage().bucket();
    const filename = path.basename(filePath);
    const destination = `exports/${filename}`;

    console.log(`📤 Subiendo ${filename} a ${destination}...`);

    await bucket.upload(filePath, {
        destination,
        metadata: {
            contentType: 'video/mp4',
        },
    });

    const file = bucket.file(destination);
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    console.log(`✅ ¡Video disponible en la nube!: ${publicUrl}`);
}

upload().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
});
