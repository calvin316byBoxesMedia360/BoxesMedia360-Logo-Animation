import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { PremiumMenuProps } from '../compositions/PremiumMenu';

/**
 * SERVICIO DE FIREBASE
 * Maneja la persistencia de menús y el alojamiento de videos
 */

// --- FIRESTORE: GESTIÓN DE MENÚS ---

/**
 * Guarda la configuración del menú en Firestore
 * @param userId ID del usuario (o restaurante)
 * @param menuProps Configuración del menú
 */
export async function saveMenuConfig(userId: string, menuProps: PremiumMenuProps) {
    try {
        const menuRef = doc(db, 'menus', userId);
        await setDoc(menuRef, {
            ...menuProps,
            updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('✅ Configuración guardada en Firestore');
    } catch (error) {
        console.error('❌ Error guardando en Firestore:', error);
        throw error;
    }
}

/**
 * Recupera la configuración del menú desde Firestore
 * @param userId ID del usuario (o restaurante)
 */
export async function getMenuConfig(userId: string): Promise<PremiumMenuProps | null> {
    try {
        const menuRef = doc(db, 'menus', userId);
        const docSnap = await getDoc(menuRef);

        if (docSnap.exists()) {
            return docSnap.data() as PremiumMenuProps;
        }
        return null;
    } catch (error) {
        console.error('❌ Error recuperando de Firestore:', error);
        throw error;
    }
}

// --- STORAGE: GESTIÓN DE VIDEOS ---

/**
 * Sube una imagen de platillo a Firebase Storage
 * @param userId ID del usuario
 * @param file Archivo Blob/File de la imagen
 * @param filename Nombre del archivo
 */
export async function uploadMenuItemImage(userId: string, file: Blob, filename: string): Promise<string> {
    try {
        const imageRef = ref(storage, `menus/${userId}/items/${Date.now()}_${filename}`);
        await uploadBytes(imageRef, file);
        const downloadUrl = await getDownloadURL(imageRef);
        console.log('✅ Imagen subida exitosamente:', downloadUrl);
        return downloadUrl;
    } catch (error) {
        console.error('❌ Error subiendo imagen a Storage:', error);
        throw error;
    }
}

/**
 * Sube un video MP4 a Firebase Storage y guarda sus metadatos
 * @param userId ID del usuario
 * @param file Archivo Blob/File del video
 * @param filename Nombre del archivo
 */
export async function uploadVideo(userId: string, file: Blob, filename: string) {
    try {
        // 1. Subir a Storage
        const videoRef = ref(storage, `videos/${userId}/${filename}`);
        await uploadBytes(videoRef, file);
        const downloadUrl = await getDownloadURL(videoRef);

        // 2. Guardar metadatos en Firestore
        await addDoc(collection(db, 'exports'), {
            userId,
            filename,
            url: downloadUrl,
            status: 'completed',
            createdAt: serverTimestamp(),
        });

        return downloadUrl;
    } catch (error) {
        console.error('❌ Error subiendo a Storage:', error);
        throw error;
    }
}

/**
 * Lista los videos exportados del usuario
 * @param userId ID del usuario
 */
export async function listUserExports(userId: string) {
    try {
        const q = query(
            collection(db, 'exports'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        // Sort on client side to avoid missing index error
        return results.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error('❌ Error listando exportaciones:', error);
        return [];
    }
}
