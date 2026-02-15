# Usar la imagen base oficial de Node.js
FROM node:20-bullseye-slim

# Instalar dependencias necesarias para Remotion y navegadores headless
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-freefont-ttf \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Establecer variable de entorno para que Remotion use el Chromium instalado
ENV REMOTION_PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDeps para el build)
RUN npm install

# Copiar el resto del código del servidor y scripts
COPY server.js ./
COPY scripts/ ./scripts/
COPY src/ ./src/
COPY public/ ./public/
COPY remotion.config.ts ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./

# Crear carpeta de salida para los renders
RUN mkdir -p out

# Exponer el puerto que usará Cloud Run
EXPOSE 8080

# Definir el puerto por defecto
ENV PORT=8080

# Comando para iniciar el servidor
CMD ["node", "server.js"]
