# Magnolias Frontend 🌸

Frontend de Magnolias - Landing page y panel administrativo construido con Nuxt 4.

## 🛠️ Stack Tecnológico

- **Nuxt 4** - Framework Vue.js para producción
- **Vue 3** - Framework JavaScript reactivo
- **Tailwind CSS** - Framework de CSS utility-first
- **TypeScript** - Tipado estático para JavaScript

## 📦 Instalación

Instala las dependencias:

```bash
npm install
```

## 🚀 Desarrollo

Inicia el servidor de desarrollo en `http://localhost:3000`:

```bash
npm run dev
```

## 🏗️ Producción

### Para VPS/Cloud con Node.js

Compila la aplicación para producción:

```bash
npm run build
```

Previsualiza la build de producción localmente:

```bash
npm run preview
```

### Para Hosting Compartido (Sitio Estático)

Genera sitio estático:

```bash
npm run generate
```

O usa el script automatizado:

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🌐 Despliegue en Hostinger

Consulta la guía completa de despliegue: **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Resumen Rápido

**Opción 1: VPS/Cloud con Node.js** (Recomendado)
1. Conecta via SSH a tu servidor
2. Clona el proyecto o sube via SFTP
3. Ejecuta `npm install && npm run build`
4. Inicia con PM2: `pm2 start ecosystem.config.js`
5. Configura Nginx como reverse proxy

**Opción 2: Hosting Compartido**
1. Ejecuta `deploy.bat` (Windows) o `deploy.sh` (Linux/Mac)
2. Sube el contenido de la carpeta `deploy/` via FTP a `public_html/`

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
NUXT_PUBLIC_API_BASE=https://magnolias-rest-api.onrender.com
```

### API Backend

Este frontend se conecta a una API NestJS. Asegúrate de que la URL de la API esté correctamente configurada en:
- Variables de entorno (`.env`)
- O en `nuxt.config.ts`

## 📁 Estructura del Proyecto

```
├── components/          # Componentes Vue reutilizables
│   ├── layout/         # Componentes de layout (Sidebar, Topbar)
│   └── decor/          # Componentes decorativos
├── composables/        # Composables de Vue (lógica reutilizable)
├── layouts/            # Layouts de página
├── middleware/         # Middleware de rutas
├── pages/              # Páginas de la aplicación (routing automático)
│   └── admin/          # Panel administrativo
├── services/           # Servicios de API
├── public/             # Archivos estáticos
├── .htaccess           # Configuración para hosting compartido
├── ecosystem.config.js # Configuración para PM2
└── nuxt.config.ts      # Configuración de Nuxt
```

## 📚 Documentación

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

📍 **Proyecto**: Magnolias Frontend  
🏢 **Desarrollado para**: devCrafters  
📅 **Última actualización**: Marzo 2026

