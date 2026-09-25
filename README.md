# Magnolias Frontend 🌸

Frontend de Magnolias: landing page pública, tienda de productos y panel de administración (pedidos, reparto, productos, catálogos, clientes, sucursales, usuarios, empleados de sucursal) construido con Nuxt 4 en modo SPA (`ssr: false`). Incluye además un **Manual de Usuario** interactivo (`/manual`) para capacitar al equipo en el uso del panel.

## 🛠️ Stack Tecnológico

- **Nuxt 4** (SPA, `ssr: false`) — framework Vue.js
- **Vue 3** — framework JavaScript reactivo
- **Tailwind CSS** — framework de CSS utility-first
- **TypeScript** — tipado estático
- **vuedraggable 4** (SortableJS) — drag-and-drop del tablero de producción del pastelero
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

## ✨ Funcionalidades del Panel

El panel cambia según el rol del usuario (`SUPER`, `ADMIN`, `EMPLOYEE`, `BAKER`, `DRIVER`). Un `ADMIN`/`SUPER` puede previsualizar la vista de pastelero o de repartidor con el toggle "Ver como" del Topbar (`useViewAs`); en ese modo la UI cambia pero las peticiones siguen usando su rol real.

### Pedidos (wizard crear/editar)
- Tipos de pedido (domicilio, en tienda, evento), canal de origen, ronda de entrega especial con costo adicional (su costo se muestra en el resumen del paso 4, y con ronda especial se ignora la alerta/bloqueo de horario).
- Cada producto agregado es una **línea nueva**, aunque sea el mismo producto (cada pastel es personalizable). Pasteles de varios pisos con forma, tamaño, pan, relleno y cobertura por piso.
- **Precio sugerido de catálogo** en el paso 4 (`useCatalogPriceSum`): para una línea simple suma pan + relleno + cobertura + decoración + fruta; con pisos suma pan/relleno/cobertura de cada piso más decoración y fruta. Forma y Tamaño no llevan precio.
- Eventos con fecha de montaje separada de la fecha del evento (`setupDate`); la hora de salida se guarda solo como `branchDepartureTime`.
- Detalle del pedido ("Ver detalle"): total de referencia con el **precio actual** del catálogo (`useOrderCatalogPriceTotal`; los precios llegan como `"$110.00"`, se parsean con `moneyToNumber`), abono rápido con PIN de empleado y asignación de repostero/repartidor.

### Estados del pedido
`CREATED` (Creado) → `IN PROCESS` (En proceso) → `DONE` (**Listo**) → `IN DELIVERY` (**En proceso de entrega**) → `DELIVERED` (Entregado), o `CANCELED`. Etiquetas y colores en `app/utils/order.ts` (`STATUS_LABELS`, `STATUS_COLORS`); el valor interno `DONE` no cambió al renombrar la etiqueta.

- Cancelar solo se habilita en estado Creado.
- "Marcar como entregado" solo se habilita en `IN DELIVERY` y con saldo en cero (admin y reparto).
- El selector de repostero se bloquea en `IN DELIVERY`/`DELIVERED`/`CANCELED` (`NON_BAKER_ASSIGNABLE_ORDER_STATUSES`); el de repartidor en `DELIVERED`/`CANCELED` (`NON_EDITABLE_ORDER_STATUSES`).

### Producción (`BAKER`)
- Tablero de tres columnas (Pendientes → En producción → Listos) con pestañas de fecha y filtro por tipo de pedido.
- **Drag-and-drop** con `vuedraggable`: solo se puede avanzar de columna (`isValidKanbanMove` en `app/utils/kanbanTransitions.ts`, aplicado en el hook `move`), y soltar una tarjeta pide confirmación antes de llamar a la API; si se cancela, la tarjeta vuelve a su columna. Los pedidos en `IN DELIVERY` no aparecen en el tablero.

### Reparto (`DRIVER`, `/admin/pedidos/reparto`)
- **Mis entregas** (con pestañas de fecha) y **Disponibles**: pedidos "Listos" de la sucursal del repartidor que puede tomar con "Tomar pedido". Si otro repartidor lo tomó antes (`409`) se muestra el aviso y se refresca la lista. La pestaña Disponibles solo existe para repartidores reales (no en "Ver como").
- Las tarjetas muestran la dirección de entrega completa (`OrderDeliveryAddressSummary`) y no navegan al detalle del pedido (el repartidor no tiene acceso a esa pantalla).
- No hay polling ni WebSockets: la lista se refresca con el botón "Actualizar" y automáticamente tras cada intento de tomar un pedido.

### Pestañas de fecha (`useDeliveryDateTabs`)
"Para mañana", "Pasado mañana", "Todas" y "Por rango" comparan el **día de calendario local** de la entrega contra el de hoy (los pedidos se guardan a mediodía UTC). Antes se comparaba el día UTC contra el local y en la tarde/noche en México un pedido de mañana caía en "Pasado mañana".

## 🧪 Pruebas

```bash
# Ejecutar la suite completa una vez
npm run test

# Modo watch
npm run test:watch

# Con reporte de cobertura
npm run test:cov
```

Cada Pull Request corre `test:cov` + `build` + un análisis de SonarQube Cloud en CI (`.github/workflows/ci.yml`) antes de poder fusionarse a `dev`/`staging`/`prod`. El Quality Gate exige ≥ 80 % de cobertura en código nuevo; `DetailModal.vue` está excluido de cobertura, así que la lógica nueva conviene extraerla a composables/componentes pequeños con su `.spec.ts`.

No hay script de lint. Las pruebas de páginas usan `useState` de Nuxt (estado compartido entre tests), por lo que cada `beforeEach` debe reiniciar `useAuthUser`, `useBranch` y `useViewAs`. Los fixtures de fechas de entrega deben usar `new Date(Date.now() + 86400000)` (mañana).

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

### Flujo de trabajo

Una rama por cambio (`feature/...` o `fix/...`) que parte de `dev`, PR contra `dev` con commits convencionales (`feat(orders): ...`), auto-merge con squash (`gh pr merge --auto --squash`) cuando CI y SonarQube pasan, y borrar la rama al mergear. La promoción `dev` → `staging` → `prod` se hace con PRs de promoción.

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
│   ├── layout/          # Sidebar, Topbar (incluye el toggle "Ver como pastelero/repartidor")
│   ├── manual/           # Piezas del Manual de Usuario (Search, Sidebar, Section, etc.)
│   ├── order/            # Wizard y detalle de pedidos: tipo, logística, pisos, asignación de
│   │                      #   repostero/repartidor, tarjeta de producción (drag-and-drop), dirección
│   │                      #   de entrega, PIN de empleado, autorización de descuento, etc.
│   ├── product/          # Alta/edición de productos
│   └── ui/                # Componentes base (modal, etc.)
├── composables/          # Lógica reutilizable (useAuth, useBranch, useCustomerLookup,
│                          #   useEmployeePin, useOrderCatalogs, useProductBuilder, useViewAs,
│                          #   useDeliveryDateTabs, useCatalogPriceCheck, useOrderCatalogPriceTotal, etc.)
├── data/                 # Contenido estático, incluye manual-content.ts (Manual de Usuario)
├── layouts/               # Layouts de página (admin, público)
├── middleware/            # Middleware de rutas (auth, roles)
├── pages/                 # Páginas (routing automático)
│   ├── admin/              # Panel administrativo
│   │   └── pedidos/        # Lista (y tablero del pastelero), crear, editar, detalle y reparto
│   └── manual/              # Manual de Usuario interactivo
├── services/               # Clientes de la API por dominio (orders, customers, products, ...)
├── types/                  # Tipos compartidos por dominio
└── utils/                  # Utilidades: order.ts (estados/etiquetas), currency.ts (moneyToNumber),
                            #   date.ts, kanbanTransitions.ts, catalog.ts, etc.
```

## 📚 Documentación

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- Manual de Usuario del panel: `/manual` (dentro de la propia app)

---

📍 **Proyecto**: Magnolias Frontend
🏢 **Desarrollado para**: devCrafters
📅 **Última actualización**: Septiembre 2026
