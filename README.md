# Magnolias Frontend 🌸

Frontend de Magnolias: landing page pública, tienda de productos y panel de administración (pedidos, productos, catálogos, clientes, sucursales, usuarios, empleados de sucursal) construido con Nuxt 4 en modo SPA (`ssr: false`). Incluye además un **Manual de Usuario** interactivo (`/manual`) para capacitar al equipo en el uso del panel.

## 🛠️ Stack Tecnológico

- **Nuxt 4** (SPA, `ssr: false`) — framework Vue.js
- **Vue 3** — framework JavaScript reactivo
- **Tailwind CSS** — framework de CSS utility-first
- **TypeScript** — tipado estático
- **Vitest** + `@nuxt/test-utils` + `@vue/test-utils` + `happy-dom` — pruebas unitarias de composables y componentes

## 📦 Instalación

Instala las dependencias:

```bash
npm install
```

Copia `.env.example` a `.env` y completa la URL de la API (ver [Configuración](#-configuración)).

## 🚀 Desarrollo

Inicia el servidor de desarrollo en `http://localhost:3000`:

```bash
npm run dev
```

## 🧪 Pruebas

```bash
# Ejecutar la suite completa una vez
npm run test

# Modo watch
npm run test:watch

# Con reporte de cobertura
npm run test:cov
```

Cada Pull Request corre `test:cov` + `build` + un análisis de SonarQube Cloud en CI (`.github/workflows/ci.yml`) antes de poder fusionarse a `dev`/`staging`/`prod`.

## 🏗️ Build

Compila la aplicación (SSR/Node):

```bash
npm run build
```

Previsualiza la build localmente:

```bash
npm run preview
```

Genera el sitio como export estático (lo que usa el pipeline de despliegue):

```bash
npm run generate
```

## 🌐 Despliegue

El despliegue a producción es **automático vía GitHub Actions** (`.github/workflows/deploy.yml`): cada push a la rama `prod` corre las pruebas, genera el sitio estático (`npm run generate`) y lo sube por FTP a Hostinger (`public_html/`), con notificación a Discord al finalizar. No requiere pasos manuales ni scripts locales.

Flujo de ramas: `dev` → `staging` → `prod`, con reglas de protección de rama estrictas en los tres ambientes (sin bypass). El deploy automático solo está configurado para `prod`; `dev`/`staging` se usan para desarrollo y pruebas antes de promover.

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
NUXT_PUBLIC_API_BASE=https://magnolias-rest-api.onrender.com
```

En el pipeline de despliegue, este valor se inyecta desde el secret `NUXT_PUBLIC_API_BASE` del repositorio (uno distinto por ambiente en Render para el backend).

### API Backend

Este frontend consume la API de [`magnolias-backend`](../magnolias-backend) (NestJS). Asegúrate de que `NUXT_PUBLIC_API_BASE` apunte al ambiente correcto (`dev`/`staging`/`prod` en Render).

## 📁 Estructura del Proyecto

Nuxt 4 usa `app/` como `srcDir`; todo el código de la aplicación vive ahí dentro.

```
app/
├── components/          # Componentes Vue reutilizables
│   ├── admin/           # Controles del panel (buscador, etc.)
│   ├── branch-employee/ # Alta de empleados de sucursal (PIN)
│   ├── customer/        # Modales de cliente
│   ├── layout/          # Sidebar, Topbar (incluye el toggle "ver como pastelero")
│   ├── manual/           # Piezas del Manual de Usuario (Search, Sidebar, Section, etc.)
│   ├── order/            # Wizard de pedidos: tipo, logística, pisos, asignación,
│   │                      #   PIN de empleado, autorización de descuento, etc.
│   ├── product/          # Alta/edición de productos
│   └── ui/                # Componentes base (modal, etc.)
├── composables/          # Lógica reutilizable (useAuth, useBranch, useCustomerLookup,
│                          #   useEmployeePin, useOrderCatalogs, useProductBuilder, etc.)
├── data/                 # Contenido estático, incluye manual-content.ts (Manual de Usuario)
├── layouts/               # Layouts de página (admin, público)
├── middleware/            # Middleware de rutas (auth, roles)
├── pages/                 # Páginas (routing automático)
│   ├── admin/              # Panel administrativo
│   │   └── pedidos/        # Lista, crear, editar, detalle de pedidos
│   └── manual/              # Manual de Usuario interactivo
├── services/               # Clientes de la API por dominio (orders, customers, products, ...)
├── types/                  # Tipos compartidos por dominio
└── utils/                  # Utilidades generales
```

## 📚 Documentación

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- Manual de Usuario del panel: `/manual` (dentro de la propia app)

---

📍 **Proyecto**: Magnolias Frontend
🏢 **Desarrollado para**: devCrafters
📅 **Última actualización**: Agosto 2026
