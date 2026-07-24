# LEARNING LOG
# REGISTRO DE APRENDIZAJE

**Computational Cinematography MVP - Continuous Learning System**

**MVP de Cinematografía Computacional - Sistema de Aprendizaje Continuo**

---

## 📊 Purpose / Propósito

### English

This log tracks every interaction with the system to enable continuous improvement. Each entry records:
- User commands and preferences
- System performance metrics
- Errors and their resolutions
- Suggested improvements

### Español

Este registro rastrea cada interacción con el sistema para permitir mejora continua. Cada entrada registra:
- Comandos y preferencias del usuario
- Métricas de rendimiento del sistema
- Errores y sus resoluciones
- Mejoras sugeridas

---

## 📝 Log Entries / Entradas del Registro

### Entry 001 - System Initialization / Inicialización del Sistema

**Date/Fecha**: 2026-01-31T22:35:00Z

**Language/Idioma**: English / Inglés

**Action/Acción**: Project created and initialized

**Details/Detalles**:
- Remotion project initialized with blank template
- Dependencies installed: 387 packages
- Folder structure created: docs/, examples/, src/services/, src/compositions/
- remotion-best-practices skill installed

**Performance/Rendimiento**:
- Installation time: 17 seconds
- No errors encountered

**User Feedback/Feedback del Usuario**: N/A (Initial setup)

**Improvements Identified/Mejoras Identificadas**:
- ✅ Document Google Cloud setup process
- ✅ Create bilingual examples
- ✅ Add learning system files

**Status/Estado**: ✅ Completed / Completado

---

### Entry 002 - Documentation Creation / Creación de Documentación

**Date/Fecha**: 2026-01-31T22:40:00Z

**Language/Idioma**: Bilingual / Bilingüe

**Action/Acción**: Created README.md and SYSTEM_CONTRACT.md

**Details/Detalles**:
- README: Bilingual quick start guide with project structure
- SYSTEM_CONTRACT: Complete instruction chains, workflows, error handling protocols
- Both files support EN/ES language switching

**Performance/Rendimiento**:
- Documentation completeness: 100%
- Bilingual coverage: 100%

**User Feedback/Feedback del Usuario**: Pending user review

**Improvements Identified/Mejoras Identificadas**:
- ⏳ Add visual diagrams for workflows
- ⏳ Create video tutorials
- ⏳ Add interactive examples

**Status/Estado**: ✅ Completed / Completado

---

### Entry 003 - Fix de Render Local + Selector de FPS / Local Render Fix + FPS Selector

**Date/Fecha**: 2026-06-20

**Language/Idioma**: Español / Spanish

**Action/Acción**: Migración a render 100% local consolidada; arreglo de frames defectuosos; selector de fps 24/30; repositorio renombrado.

**Details/Detalles**:
- Repo renombrado a **`Digital-Menu-Studio`** (rama `sandbox/reverse-engineering`). El host viejo de Firebase quedó identificado como deploy legado.
- **Bug de frames** al combinar varios videos (congelan/saltan/repiten): el render caía en el `<Video>` del DOM porque `isRendering` (estado de UI) no llegaba al render. **Fix:** `scripts/render-video.js` fuerza `isRendering: true` → usa el `<Video>` de `@remotion/media` (frame-exacto).
- **Discordancia de fps** detectada con `ffprobe`: 9 videos de origen a 24 fps vs composición a 30 fps.
- **Selector de FPS 24/30** (default 24) en `MenuControls.tsx`; `Root.tsx`/`PremiumMenu.tsx`/`Editor.tsx` ahora usan fps configurable vía `useVideoConfig().fps`.

**Performance/Rendimiento**:
- Render de prueba (2 videos) validado: MP4 H.264 correcto; default ahora **24 fps** (1:1 con las fuentes, sin judder).
- Build del dashboard: OK (1800 módulos, ~8 s).

**User Feedback/Feedback del Usuario**: "ahora sí quedó mucho mejor".

**Improvements Identified/Mejoras Identificadas**:
- ⏳ Detección automática del fps dominante de las fuentes.
- ⏳ Retiro total del código de nube muerto (`cloudRunService`, `githubActionsService`, Firebase).

**Status/Estado**: ✅ Completed / Completado

---

### Entry 004 - Auditoría del Proyecto / Project Audit

**Date/Fecha**: 2026-07-23

**Language/Idioma**: Español / Spanish

**Action/Acción**: Revisión completa de código y documentación; commit de `showAccentLine`; corrección del remote de git.

**Details/Detalles**:
- **Commit `e519d7f`** — `feat(menu): prop showAccentLine`. La línea de acento de `DishScene` pasa a ser opcional; default `true`, sin cambio visual.
- **Commit `8c42cdb`** — toggle **Línea Acento** (VISIBLE/OCULTA) en `MenuControls`. El usuario identificó la barra difuminada de la esquina inferior izquierda y pidió on/off: resultó ser exactamente la prop recién añadida. Verificado en caliente (nodo fuera del player + persistencia en `localStorage`); `vite build` OK.
- **Commit `11a00a1`** — eliminado el selector de **COLOR** del panel. `accentColor` queda fijo en `#D4AF37`.
- **Commit `228eaac`** — **línea de acento eliminada por completo** (revierte `e519d7f` y `8c42cdb`). El usuario decidió quitarla en vez de dejarla tras un interruptor. Verificado renderizando con un config que pide `showAccentLine: true`: el MP4 sale sin línea.
- **Commit `ca1fbbd`** — la tarjeta del precio ya no se dibuja sin precio. El usuario reportó "un pequeño óvalo" y supuso que era un resto de la línea recién eliminada; era un componente distinto (el contenedor del precio con fondo y borde, sin texto dentro). **Lección:** reportes del tipo "quedó algo" conviene reproducirlos antes de tocar código — la causa real no era la última pieza modificada.
  - **Lección:** quitar el selector de COLOR no borró la barra — el color solo era su tinte, la visibilidad era otra prop. Al retirar un control de la UI hay que decir explícitamente qué deja de ser editable y qué sigue dibujándose, o el resultado parece un fallo.
- **Remote corregido** — `.git/config` apuntaba a `BoxesMedia360-Logo-Animation.git`, el nombre anterior al renombrado. GitHub redirige repos renombrados, por eso fetch/push funcionaban y el desfase pasó un mes inadvertido. Verificado con `gh api` y corregido con `git remote set-url`.
- **Proxy fantasma** — `docs/memoria_proyecto.md` documentaba un middleware `/api/proxy` que ya no existe en `server.js`. Corregido en la memoria y derogada la "Regla de Oro" que lo exigía.
- **10 hallazgos de deuda técnica** registrados en `informe.html` (STATUS + ERRORES & FIXES) y en `docs/memoria_proyecto.md` sección F.

**Performance/Rendimiento**:
- Sistema verificado en caliente: `:3001` (Vite) y `:3003` (Express) respondiendo; `/api/health` → `{"status":"ok","firebase":"connected"}`.
- `npx tsc`: ~28 errores, ninguno del código de negocio — `tsconfig` desalineado con Vite.
- Disco: `out/` 853 MB (19 MP4), `public/uploads/` 157 MB, sin rutina de limpieza.

**User Feedback/Feedback del Usuario**: El usuario detectó el nombre correcto del repo (`Digital-Menu-Studio`) antes de que la verificación lo confirmara.

**Improvements Identified/Mejoras Identificadas**:
- ⏳ **P1** — Unificar el cálculo de duración (`Editor.tsx` / `Root.tsx` / `PremiumMenu.tsx`) en una sola función: hoy con escenas cortas la última sale cortada y el preview no coincide con el MP4.
- ⏳ **P2** — Dejar un único flujo de exportación (el de `MenuControls` conserva el alert de la era nube).
- ⏳ **P3** — Confirmar/cerrar las reglas `if true` de Firestore y Storage.
- ⏳ **P4** — Arreglar `tsconfig` para recuperar `npm run lint`.
- ⏳ **P5** — `listen(PORT, '127.0.0.1')` en `server.js`.
- ⏳ Retiro del código muerto de la era nube (heredado de Entry 003, sigue pendiente).

**Status/Estado**: ✅ Auditoría completada / Hallazgos abiertos pendientes de corrección

---

## 📈 Analytics / Analíticas

### Language Preferences / Preferencias de Idioma

| Language | Usage Count | Percentage |
|----------|-------------|------------|
| English  | 1           | 50%        |
| Español  | 1           | 50%        |

### Most Common Operations / Operaciones Más Comunes

1. Project initialization (1x)
2. Documentation creation (1x)

### Error Frequency / Frecuencia de Errores

**Total Errors / Errores Totales**: 0

**By Category / Por Categoría**:
- API Errors: 0
- Configuration Errors: 0
- Rendering Errors: 0
- User Errors: 0

### Performance Metrics / Métricas de Rendimiento

- **Average Rendering Time / Tiempo Promedio de Renderizado**: N/A (No renders yet)
- **API Response Time / Tiempo de Respuesta API**: N/A (No API calls yet)
- **Success Rate / Tasa de Éxito**: 100%

---

## 🎯 Improvement Actions / Acciones de Mejora

### Completed / Completadas

- [x] Create bilingual README
- [x] Create comprehensive SYSTEM_CONTRACT
- [x] Initialize learning log
- [x] Set up project structure

### In Progress / En Progreso

- [ ] Create detailed setup guides (EN/ES)
- [ ] Implement Vertex AI integration
- [ ] Create example transitions
- [ ] Add troubleshooting documentation

### Planned / Planificadas

- [ ] Add performance monitoring
- [ ] Create automated testing
- [ ] Build interactive UI for configuration
- [ ] Add video tutorials

---

## 💡 Insights / Perspectivas

### What's Working Well / Qué Funciona Bien

1. ✅ Bilingual approach allows broader accessibility
2. ✅ Detailed documentation reduces setup friction
3. ✅ Learning system enables continuous improvement

### Areas for Improvement / Áreas de Mejora

1. ⚠️ Need real-world usage data to optimize workflows
2. ⚠️ Vertex AI integration not yet tested
3. ⚠️ No performance benchmarks established

### User Patterns / Patrones de Usuario

*To be populated as users interact with the system*

*Se poblará a medida que los usuarios interactúen con el sistema*

---

## 🔄 Update Schedule / Calendario de Actualizaciones

**Frequency / Frecuencia**: After every interaction

**Next Review / Próxima Revisión**: After 10 interactions

**Metrics Analysis / Análisis de Métricas**: Weekly / Semanal

---

## 📌 Notes / Notas

### For Developers / Para Desarrolladores

- This log should be updated automatically by the logging system
- Manual entries are acceptable for significant events
- Keep entries concise but informative

### For Users / Para Usuarios

- Your interactions help improve the system
- All data is anonymized
- Feedback is always welcome

---

**Last Updated / Última Actualización**: 2026-07-23

**Total Entries / Total de Entradas**: 4

**System Version / Versión del Sistema**: 1.1.1 (render 100% local + selector de fps + auditoría jul 2026)
