# 🎬 Cómo Exportar Videos MP4 - Guía Rápida

## ✅ Lo que ya está listo:

1. ✅ **Script de renderizado**: `scripts/render-video.js`
2. ✅ **Servidor API**: `server.js`
3. ✅ **Botón en el dashboard**: Al final de la página
4. ✅ **Dependencias instaladas**: Express, CORS, @remotion/renderer

---

## 🚀 Cómo Usar (3 Pasos)

### Paso 1: Iniciar el Servidor de Renderizado

Abre una **nueva terminal** y ejecuta:

```bash
npm run server
```

Deberías ver:
```
🚀 Servidor de renderizado iniciado
📡 Escuchando en: http://localhost:3003
🎥 Endpoint de renderizado: http://localhost:3003/api/render
```

**IMPORTANTE**: Deja esta terminal abierta mientras uses la exportación.

---

### Paso 2: Abrir el Dashboard

En **otra terminal** (o si ya lo tienes corriendo, déjalo así):

```bash
npm run dashboard -- --port 3002
```

Abre: http://localhost:3002

---

### Paso 3: Exportar Video

1. Edita tu menú en el dashboard
2. Haz scroll hasta el final
3. Haz clic en el botón dorado **"EXPORTAR VIDEO MP4"**
4. Espera 30-60 segundos (verás la barra de progreso)
5. El video se descargará automáticamente

---

## 📁 Dónde se Guardan los Videos

Los videos se guardan en:
```
Computational-Cinematography-MVP/out/menu-[timestamp].mp4
```

Ejemplo:
```
out/menu-1707350400000.mp4
```

---

## 🔧 Solución de Problemas

### Error: "No se pudo conectar con el servidor"

**Causa**: El servidor de renderizado no está corriendo.

**Solución**:
```bash
# En una terminal nueva:
npm run server
```

---

### Error: "Cannot find module @remotion/bundler"

**Causa**: Falta instalar dependencias.

**Solución**:
```bash
npm install
```

---

### El video no se descarga automáticamente

**Solución**:
1. Revisa la consola del navegador (F12)
2. Busca el archivo manualmente en la carpeta `out/`
3. O visita: http://localhost:3003/api/videos para ver todos los videos

---

## 🎯 Comandos Útiles

### Ver todos los videos renderizados:
```bash
# En el navegador:
http://localhost:3003/api/videos
```

### Renderizar desde la línea de comandos:
```bash
node scripts/render-video.js
```

### Renderizar con configuración personalizada:
```bash
node scripts/render-video.js menu-config.json
```

---

## 📊 Tiempos de Renderizado Estimados

| Platillos | Duración por escena | Tiempo de renderizado |
|-----------|---------------------|----------------------|
| 2-3       | 3 segundos          | ~30 segundos         |
| 4-6       | 4 segundos          | ~60 segundos         |
| 7-10      | 5 segundos          | ~90 segundos         |

**Nota**: Los tiempos varían según tu hardware (CPU, RAM).

---

## 🔮 Próximos Pasos (Opcional)

### Opción 1: Desplegar en un VPS
- Sube el proyecto a un servidor (DigitalOcean, AWS, etc.)
- Ejecuta `npm run server` en el servidor
- Cambia la URL en `MenuControls.tsx` de `localhost:3003` a tu dominio

### Opción 2: Usar Remotion Lambda (AWS)
- Más rápido pero con costo (~$0.10-0.50 por video)
- Documentación: https://www.remotion.dev/docs/lambda

---

## ✅ Checklist de Verificación

Antes de exportar, asegúrate de:

- [ ] El servidor está corriendo (`npm run server`)
- [ ] El dashboard está abierto (`npm run dashboard`)
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Tienes espacio en disco (videos pesan ~5-20 MB)

---

**¿Listo para exportar tu primer video? ¡Dale clic al botón dorado! 🎬**
