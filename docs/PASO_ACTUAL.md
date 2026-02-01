# 🎯 Siguiente Paso: Crear Cuenta de Servicio

## 📍 Dónde Estás

Estás en la pantalla **"Create credentials"** → **"Credential Type"**

Veo que ya:
- ✅ Creaste el proyecto: `proyecto-cinemamkr`
- ✅ Habilitaste Vertex AI API
- ✅ Estás en la sección correcta para crear credenciales

---

## 🔵 Acción Inmediata (EN LA PANTALLA ACTUAL)

### En la pregunta: "What data will you be accessing?"

**Selecciona:** 
```
⚪ User data
🔵 Application data  ← SELECCIONA ESTE
```

**¿Por qué "Application data"?**
- Esto crea una **Service Account** (cuenta de servicio)
- Es lo que necesitas para que tu aplicación acceda a Vertex AI
- Es más seguro que usar credenciales de usuario

### Después de seleccionar:

1. Haz clic en el botón **"Next"** (abajo a la izquierda)
2. Te llevará a la siguiente pantalla: **"Service account details"**

---

## 📋 Siguiente Pantalla (Service Account Details)

Cuando llegues ahí, completa:

**Service account name:**
```
vertex-ai-user
```

**Service account ID:** (se genera automático, déjalo)

**Service account description:**
```
Usuario para Vertex AI - Cinematografia Computacional MVP
```

Luego haz clic en **"Create and Continue"**

---

## 🎬 Resumen Visual

```
Pantalla Actual:
┌─────────────────────────────────────┐
│ Create credentials                  │
├─────────────────────────────────────┤
│ 1️⃣ Credential Type                  │
│                                     │
│ Which API are you using?            │
│ ✅ Vertex AI API                    │
│                                     │
│ What data will you be accessing?    │
│ ⚪ User data                        │
│ 🔵 Application data  ← SELECCIONA  │
│                                     │
│ [Next]                              │
└─────────────────────────────────────┘

Siguiente Pantalla:
┌─────────────────────────────────────┐
│ 2️⃣ Service account details          │
│                                     │
│ Service account name:               │
│ vertex-ai-user                      │
│                                     │
│ [Create and Continue]               │
└─────────────────────────────────────┘
```

---

## ⏭️ Después de Esto

Una vez que completes la creación de la cuenta de servicio, necesitarás:

1. **Asignar el rol "Vertex AI User"**
2. **Crear una clave JSON**
3. **Descargar la clave a tu proyecto**
4. **Configurar el archivo `.env`**

Te guiaré paso a paso en cada uno.

---

## 🆘 ¿Necesitas Ayuda?

Avísame cuando:
- ✅ Hayas seleccionado "Application data" y dado clic en "Next"
- ❓ Tengas alguna duda en la pantalla actual
- 📸 Quieras que revise una captura de la siguiente pantalla

---

**👉 Acción:** Selecciona "Application data" y haz clic en "Next"
