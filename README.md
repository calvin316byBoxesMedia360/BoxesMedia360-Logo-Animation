# Computational Cinematography MVP

**Cinematografía Computacional con Remotion + Vertex AI (Veo 3.1)**

> 🎬 Create "impossible" video transitions using AI-powered generative models and programmatic video composition.
> 
> 🎥 Crea transiciones de video "imposibles" usando modelos generativos de IA y composición programática de video.

---

## 🌐 Language / Idioma

This project supports **English** and **Spanish** throughout all documentation and code.

Este proyecto soporta **Inglés** y **Español** en toda la documentación y código.

- 📘 [English Documentation](#english-documentation)
- 📗 [Documentación en Español](#documentación-en-español)

---

## 📘 English Documentation

### What is this?

This MVP demonstrates **Phase 4** of the Advanced Computational Cinematography Methodology: **Latent Synthesis and Temporal Interpolation** using Google's Veo 3.1 model through Vertex AI.

**Key Features:**
- ✨ AI-powered "First and Last Frame" interpolation
- 🎬 Programmatic video composition with Remotion
- ☁️ Google Cloud Vertex AI integration
- 🔄 Bilingual support (EN/ES)
- 📊 Learning system with interaction logging

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Render video
npx remotion render
```

### Documentation

- 📖 **[Setup Guide (EN)](./docs/SETUP_EN.md)** - Complete Google Cloud and Vertex AI configuration
- 🔧 **[API Reference](./docs/API_REFERENCE.md)** - Full API documentation
- 🚨 **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- 📋 **[System Contract](./SYSTEM_CONTRACT.md)** - System rules and workflows

### Examples

- 🎯 **[Basic Transition](./examples/basic-transition/)** - Simple keyframe interpolation
- 🚀 **[Advanced Examples](./examples/advanced/)** - Complex multi-scene transitions

---

## 📗 Documentación en Español

### ¿Qué es esto?

Este MVP demuestra la **Fase 4** de la Metodología Avanzada de Cinematografía Computacional: **Síntesis Latente e Interpolación Temporal** usando el modelo Veo 3.1 de Google a través de Vertex AI.

**Características Principales:**
- ✨ Interpolación "Primer y Último Frame" con IA
- 🎬 Composición programática de video con Remotion
- ☁️ Integración con Google Cloud Vertex AI
- 🔄 Soporte bilingüe (EN/ES)
- 📊 Sistema de aprendizaje con registro de interacciones

### Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Renderizar video
npx remotion render
```

### Documentación

- 📖 **[Guía de Configuración (ES)](./docs/SETUP_ES.md)** - Configuración completa de Google Cloud y Vertex AI
- 🔧 **[Referencia de API](./docs/API_REFERENCE.md)** - Documentación completa de la API
- 🚨 **[Solución de Problemas](./docs/TROUBLESHOOTING.md)** - Problemas comunes y soluciones
- 📋 **[Contrato del Sistema](./SYSTEM_CONTRACT.md)** - Reglas y flujos de trabajo del sistema

### Ejemplos

- 🎯 **[Transición Básica](./examples/transicion-basica/)** - Interpolación simple de keyframes
- 🚀 **[Ejemplos Avanzados](./examples/advanced/)** - Transiciones complejas multi-escena

---

## 🏗️ Project Structure / Estructura del Proyecto

```
Computational-Cinematography-MVP/
├── src/
│   ├── compositions/       # Video compositions / Composiciones de video
│   ├── services/          # Vertex AI integration / Integración Vertex AI
│   ├── utils/             # Utilities and logging / Utilidades y logging
│   └── types/             # TypeScript definitions / Definiciones TypeScript
├── docs/                  # Detailed documentation / Documentación detallada
├── examples/              # Usage examples / Ejemplos de uso
├── README.md              # This file / Este archivo
├── SYSTEM_CONTRACT.md     # System contract / Contrato del sistema
├── LEARNING_LOG.md        # Learning log / Registro de aprendizaje
└── LEARNING_FEEDBACK.json # Structured feedback / Feedback estructurado
```

---

## 🚀 Core Concepts / Conceptos Principales

### English

**Veo 3.1 Integration**: This MVP uses Google's state-of-the-art video generation model to create seamless transitions between two keyframes, enabling "impossible" camera movements and scene morphing.

**Remotion Orchestration**: Remotion acts as the central orchestrator, managing timing, sequencing, and composition of AI-generated clips.

### Español

**Integración Veo 3.1**: Este MVP usa el modelo de generación de video de última generación de Google para crear transiciones fluidas entre dos keyframes, permitiendo movimientos de cámara "imposibles" y morfología de escenas.

**Orquestación Remotion**: Remotion actúa como el orquestador central, gestionando el timing, secuenciación y composición de clips generados por IA.

---

## 📊 Learning System / Sistema de Aprendizaje

This project includes a **continuous learning system** that logs every interaction and improves over time.

Este proyecto incluye un **sistema de aprendizaje continuo** que registra cada interacción y mejora con el tiempo.

- 📝 **[Learning Log](./LEARNING_LOG.md)** - Human-readable interaction history
- 📈 **[Learning Feedback](./LEARNING_FEEDBACK.json)** - Structured data for analysis

---

## 🤝 Contributing / Contribuir

We welcome contributions in **both English and Spanish**!

¡Aceptamos contribuciones en **Inglés y Español**!

---

## 📄 License / Licencia

MIT License - See LICENSE file for details

---

## 🔗 Links / Enlaces

- 🌐 [Remotion Documentation](https://www.remotion.dev/docs)
- ☁️ [Google Vertex AI](https://cloud.google.com/vertex-ai)
- 🎥 [Veo 3.1 Model](https://deepmind.google/technologies/veo/)
- 📚 [Full Methodology Document](../Metodologia-Tecnica-Avanzada/METODOLOGIA_ORIGINAL.md)

---

**Built with ❤️ using Remotion and Google Cloud**

**Construido con ❤️ usando Remotion y Google Cloud**
