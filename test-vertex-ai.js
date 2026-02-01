const { execSync } = require('child_process');

console.log('🔍 Probando conexión a Vertex AI con gcloud CLI...\n');

// Verificar variables de entorno
require('dotenv').config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const region = process.env.GOOGLE_CLOUD_REGION;

console.log('📋 Configuración / Configuration:');
console.log(`   Project ID: ${projectId}`);
console.log(`   Region: ${region}`);
console.log(`   Auth Method: gcloud CLI\n`);

// Verificar gcloud CLI
try {
    const version = execSync('gcloud --version', { encoding: 'utf-8' });
    console.log('✅ gcloud CLI instalado');
    console.log('✅ gcloud CLI installed\n');
} catch (error) {
    console.error('❌ gcloud CLI no está instalado');
    console.error('❌ gcloud CLI not installed');
    console.error('Descarga: https://cloud.google.com/sdk/docs/install');
    process.exit(1);
}

// Verificar autenticación
try {
    const token = execSync('gcloud auth print-access-token', {
        encoding: 'utf-8'
    }).trim();

    if (token && token.length > 0) {
        console.log('✅ Autenticación válida');
        console.log('✅ Authentication valid\n');
    }
} catch (error) {
    console.error('❌ No autenticado');
    console.error('❌ Not authenticated');
    console.error('\nEjecuta / Run:');
    console.error('  gcloud auth application-default login');
    process.exit(1);
}

// Verificar proyecto configurado
try {
    const currentProject = execSync('gcloud config get-value project', {
        encoding: 'utf-8'
    }).trim();

    if (currentProject === projectId) {
        console.log(`✅ Proyecto configurado: ${currentProject}`);
        console.log(`✅ Project configured: ${currentProject}\n`);
    } else {
        console.warn(`⚠️  Proyecto actual: ${currentProject}`);
        console.warn(`⚠️  Esperado: ${projectId}`);
        console.warn('\nEjecuta / Run:');
        console.warn(`  gcloud config set project ${projectId}`);
    }
} catch (error) {
    console.error('❌ No se pudo verificar proyecto');
}

console.log('🎉 ¡Configuración correcta! / Configuration successful!');
console.log('🚀 Listo para generar videos con Veo\n');
