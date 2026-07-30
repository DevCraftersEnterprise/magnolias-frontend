export interface ManualSubsection {
    id: string
    title: string
    content: string
    tip?: string
    warning?: string
    tableHeaders?: string[]
    tableRows?: string[][]
    steps?: string[]
}

export interface ManualSection {
    id: string
    title: string
    icon: string
    description: string
    badge?: string
    roleAccess?: string[]
    isNew?: boolean
    subsections: ManualSubsection[]
}

export const manualSections: ManualSection[] = [
    // ──────────────────────────────────────────────
    // SECCIÓN 1: INTRODUCCIÓN
    // ──────────────────────────────────────────────
    {
        id: 'introduccion',
        title: 'Introducción',
        icon: '📖',
        description: 'Conoce el Panel de Administración de Magnolias, cómo acceder y la navegación general del sistema.',
        roleAccess: ['SUPER', 'ADMIN', 'EMPLOYEE', 'BAKER'],
        subsections: [
            {
                id: 'que-es',
                title: '¿Qué es este sistema?',
                content:
                    'El Panel de Administración de Magnolias es la herramienta interna de gestión que permite a los colaboradores registrar y dar seguimiento a pedidos, administrar el catálogo de productos, gestionar clientes, sucursales y usuarios del sistema. Está diseñado para ser utilizado desde una computadora o tablet y se accede a través del navegador web.',
            },
            {
                id: 'como-ingresar',
                title: '¿Cómo ingresar al sistema?',
                content:
                    'Abre tu navegador y accede a la dirección del panel: https://pasteleriamagnolias.mx/login',
                steps: [
                    'Abre tu navegador web (Chrome, Firefox, Edge, etc.).',
                    'Escribe la dirección del panel en la barra de navegación.',
                    'Ingresa tu nombre de usuario y contraseña en la pantalla de inicio.',
                    'Presiona el botón "Iniciar sesión".',
                ],
                tip: 'Si no recuerdas tu contraseña o no tienes acceso, contacta al administrador del sistema para que restablezca tus credenciales.',
            },
            {
                id: 'navegacion-general',
                title: 'Navegación general',
                content:
                    'Una vez dentro, verás dos elementos principales en la interfaz:',
                steps: [
                    'Barra lateral (menú izquierdo): contiene los accesos a cada sección del sistema. En dispositivos móviles, se abre con el botón de menú (☰) en la esquina superior izquierda.',
                    'Barra superior: muestra el título de la sección actual, el selector de sucursal (para administradores) y el nombre del usuario activo.',
                    'Para cerrar sesión, haz clic en el ícono de tu perfil en la barra superior.',
                ],
            },
            {
                id: 'roles-usuario',
                title: 'Roles de usuario',
                content:
                    'El sistema maneja 4 roles. Cada rol tiene acceso únicamente a las secciones que le corresponden:',
                tableHeaders: ['Rol', 'Nombre', 'Acceso'],
                tableRows: [
                    ['SUPER', 'Superadministrador', 'Acceso completo a todo el sistema'],
                    ['ADMIN', 'Administrador', 'Acceso completo a todo el sistema'],
                    ['EMPLOYEE', 'Empleado', 'Pedidos y Clientes'],
                    ['BAKER', 'Pastelero', 'Solo pedidos asignados a él/ella'],
                ],
                tip: 'Los usuarios con rol Pastelero tienen una vista simplificada del módulo de pedidos. Solo pueden ver los pedidos que les han sido asignados y avanzar su estado de producción.',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 2: PROCESO DE INICIO (NUEVA)
    // ──────────────────────────────────────────────
    {
        id: 'proceso-inicio',
        title: 'Proceso de inicio del sistema',
        icon: '🚀',
        description: 'Antes de capacitar a tu equipo, el administrador debe completar estos 3 pasos fundamentales para que el sistema funcione correctamente.',
        badge: 'Nuevo',
        isNew: true,
        roleAccess: ['SUPER', 'ADMIN'],
        subsections: [
            {
                id: 'paso1-sucursal',
                title: 'Paso 1 — Crear una sucursal',
                content:
                    'Lo primero que debe hacer el administrador o superadministrador es crear al menos una sucursal. Cada sucursal representa un punto físico de venta o producción de la pastelería. Sin una sucursal activa, no es posible asignar usuarios ni registrar pedidos.',
                steps: [
                    'Ve al menú lateral y haz clic en "Sucursales".',
                    'Haz clic en el botón "+ Agregar sucursal" en la parte superior derecha.',
                    'En el Paso 1, ingresa el nombre de la sucursal y su dirección completa.',
                    'En el Paso 2, ingresa el teléfono principal (obligatorio). Opcionalmente agrega teléfono secundario y WhatsApp.',
                    'Haz clic en "Guardar". La sucursal aparecerá de inmediato en la cuadrícula.',
                ],
                tip: 'La sucursal debe tener nombre, dirección y teléfono principal. Esta información es necesaria porque los pedidos, usuarios y estadísticas dependen de la sucursal. Puedes registrar varias sucursales si la pastelería tiene múltiples puntos de venta.',
            },
            {
                id: 'paso2-catalogos',
                title: 'Paso 2 — Llenar los catálogos',
                content:
                    'Una vez creada la sucursal, debes llenar los catálogos del sistema. Los catálogos son las listas de opciones que se usan al personalizar productos dentro de un pedido. Sin catálogos cargados, los empleados no podrán registrar pedidos completos.',
                steps: [
                    'Ve al menú lateral y haz clic en "Catálogos".',
                    'Verás 6 bloques: Tipo de pan, Rellenos, Cubiertas, Forma, Flores y Colores.',
                    'En cada bloque, haz clic en el botón "+ Agregar" para agregar opciones.',
                    'Ingresa el nombre y una descripción para cada opción y haz clic en "Guardar".',
                    'Repite el proceso en cada bloque hasta tener las opciones básicas cargadas.',
                    'Para los colores, usa el selector visual o escribe el código hexadecimal (#RRGGBB).',
                ],
                tableHeaders: ['Catálogo', '¿Para qué se usa?', 'Ejemplos'],
                tableRows: [
                    ['Tipo de pan', 'Base y sabor del pastel', 'Vainilla, Chocolate, Zanahoria, Moka, Fresa'],
                    ['Rellenos', 'Interior del pastel', 'Crema pastelera, Dulce de leche, Nutella'],
                    ['Cubiertas', 'Decoración exterior', 'Fondant, Buttercream, Ganache'],
                    ['Forma', 'Forma decorativa', 'Clásico, Moderno, Corazón'],
                    ['Flores', 'Pedidos tipo Flor', 'Girasol, Rosa, Tulipán'],
                    ['Colores', 'Colores disponibles', 'Rosa pastel, Blanco, Azul cielo'],
                ],
                tip: 'Esto es importante para que los empleados puedan crear pedidos completos sin necesidad de capturar datos manualmente cada vez. Cuantas más opciones cargues, más detallados y precisos serán los pedidos.',
            },
            {
                id: 'paso3-usuarios',
                title: 'Paso 3 — Crear usuarios para cada sucursal',
                content:
                    'Con la sucursal activa y los catálogos cargados, el siguiente paso es crear los usuarios que utilizarán el sistema. Cada usuario debe tener asignado un rol y, dependiendo del rol, una o varias sucursales.',
                steps: [
                    'Ve al menú lateral y haz clic en "Usuarios".',
                    'Haz clic en el botón "+" junto al título Usuarios.',
                    'Llena los campos: Nombre, Apellido, Usuario (sin espacios), Contraseña y Rol.',
                    'Para Empleado: selecciona la sucursal única a la que pertenece.',
                    'Para Pastelero: puedes asignar varias sucursales, además de su área y especialidad.',
                    'Haz clic en "Guardar" para crear el usuario.',
                ],
                tableHeaders: ['Rol', 'Nombre', 'Acceso al sistema', 'Sucursales'],
                tableRows: [
                    ['SUPER', 'Superadministrador', 'Todo el sistema', 'Todas'],
                    ['ADMIN', 'Administrador', 'Todo el sistema', 'Todas'],
                    ['EMPLOYEE', 'Empleado', 'Pedidos y Clientes', 'Una sola'],
                    ['BAKER', 'Pastelero', 'Solo sus pedidos asignados', 'Una o varias'],
                ],
                tip: 'Los empleados normalmente pertenecen a una sucursal específica, mientras que los pasteleros pueden pertenecer a varias. Esto permite controlar correctamente los permisos y asignar pedidos de manera eficiente.',
                warning: 'Antes de capacitar a los empleados, el administrador debe asegurarse de que exista al menos una sucursal activa, que los catálogos principales estén cargados y que cada usuario tenga su rol y sucursal asignados correctamente.',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 3: DASHBOARD
    // ──────────────────────────────────────────────
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: '📊',
        description: 'La pantalla principal del sistema. Muestra un resumen visual del estado actual de los pedidos en tiempo real.',
        roleAccess: ['SUPER', 'ADMIN', 'EMPLOYEE'],
        subsections: [
            {
                id: 'dashboard-intro',
                title: '¿Qué es el Dashboard?',
                content:
                    'El Dashboard es la primera pantalla que verás al iniciar sesión como Administrador o Empleado. Desde aquí puedes tener una visión general y rápida del estado actual de los pedidos en el sistema.',
                tip: 'Los usuarios con rol Pastelero son redirigidos automáticamente a la sección de Pedidos y no tienen acceso a esta pantalla.',
            },
            {
                id: 'resumen-pedidos',
                title: '2.1 Resumen general de pedidos',
                content:
                    'En la parte superior del Dashboard encontrarás el bloque "Resumen general de pedidos". Este muestra 5 tarjetas, una por cada estado posible de un pedido:',
                tableHeaders: ['Tarjeta', 'Color', 'Descripción'],
                tableRows: [
                    ['Creados', 'Verde', 'Pedidos que acaban de registrarse y aún no han iniciado producción'],
                    ['En proceso', 'Amarillo', 'Pedidos que ya están siendo preparados por el pastelero'],
                    ['Terminados', 'Azul', 'Pedidos que ya están listos para ser recogidos o entregados'],
                    ['Entregados', 'Naranja', 'Pedidos que ya fueron entregados al cliente'],
                    ['Cancelados', 'Rojo', 'Pedidos que fueron cancelados'],
                ],
            },
            {
                id: 'resumen-tipo',
                title: '2.2 Resumen por tipo de pedido',
                content:
                    'Debajo del resumen de estados, encontrarás un segundo bloque con el conteo de pedidos agrupados por tipo:',
                tableHeaders: ['Tarjeta', 'Color', 'Descripción'],
                tableRows: [
                    ['En tienda', 'Gris', 'Pedidos para recoger en tienda'],
                    ['Evento', 'Azul claro', 'Pedidos para eventos especiales'],
                    ['Domicilio', 'Morado', 'Pedidos con entrega a domicilio'],
                    ['Flor', 'Rosa', 'Pedidos con arreglos florales'],
                ],
            },
            {
                id: 'filtro-sucursal',
                title: '2.3 Filtro por sucursal',
                content:
                    'Si tienes rol Administrador o Superadministrador, en la barra superior verás un selector de sucursal. Al cambiar la sucursal seleccionada, todas las estadísticas del Dashboard se actualizan automáticamente para mostrar únicamente los datos de esa sucursal. Si no seleccionas ninguna (o dejas la opción general), el sistema mostrará los datos de todas las sucursales combinadas.',
                tip: 'Usa el Dashboard al inicio de cada turno para revisar cuántos pedidos están pendientes de producción (estado Creados) y cuántos están listos para entrega (estado Terminados).',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 4: PEDIDOS
    // ──────────────────────────────────────────────
    {
        id: 'pedidos',
        title: 'Gestión de Pedidos',
        icon: '🧁',
        description: 'El corazón del sistema. Registra, consulta, asigna y da seguimiento a todos los pedidos de la pastelería.',
        roleAccess: ['SUPER', 'ADMIN', 'EMPLOYEE', 'BAKER'],
        subsections: [
            {
                id: 'lista-pedidos',
                title: '3.1 Lista de pedidos',
                content:
                    'Al ingresar a la sección Pedidos desde el menú lateral, verás una tabla con todos los pedidos registrados en la sucursal seleccionada. Cada fila muestra: código del pedido, tipo, nombre del cliente y teléfono, total y saldo pendiente, estado actual, pastelero asignado, y fechas de creación y actualización.',
                steps: [
                    'Usa la barra de búsqueda para filtrar por nombre del cliente en tiempo real.',
                    'Usa el selector de Estado para filtrar: Todos, Creado, En proceso, Finalizado, Entregado o Cancelado.',
                    'Si hay más de 15 pedidos, usa los botones Anterior y Siguiente para navegar entre páginas.',
                ],
            },
            {
                id: 'crear-pedido',
                title: '3.2 Crear un nuevo pedido',
                content:
                    'Para registrar un pedido, haz clic en el botón "+" junto al título "Pedidos Registrados". Serás llevado a un formulario de 4 pasos.',
                steps: [
                    'Paso 1 — Cliente: busca al cliente por teléfono o regístralo si es nuevo.',
                    'Paso 2 — Tipo y logística: elige En tienda, Domicilio, Flor o Evento. Ingresa fecha, hora y dirección según el tipo.',
                    'Paso 3 — Productos: busca y agrega los productos. Configura precio, cantidad, tamaño, color, tipo de pan, relleno, cubierta, forma, texto e imagen de referencia.',
                    'Paso 4 — Pago: elige la forma de pago (Efectivo, Tarjeta o Transferencia) y el modo (Pago completo o Anticipo). Haz clic en "Registrar pedido".',
                ],
                warning: 'El sistema solo permite registrar pedidos con hora entre las 8:00 AM y las 7:59 PM. La fecha mínima de entrega es el día siguiente al actual.',
            },
            {
                id: 'tipos-pedido',
                title: 'Tipos de pedido disponibles',
                content: 'Cada tipo de pedido tiene sus propios campos de logística:',
                tableHeaders: ['Tipo', 'Descripción', 'Requiere dirección', 'Requiere sucursal'],
                tableRows: [
                    ['EN TIENDA', 'Recogida en tienda', 'No', 'Sí'],
                    ['DOMICILIO', 'Entrega a domicilio', 'Sí', 'No'],
                    ['FLOR', 'Arreglo floral (en tienda o domicilio)', 'Depende del modo', 'Depende del modo'],
                    ['EVENTO', 'Evento especial con servicios adicionales', 'Sí', 'No'],
                ],
            },
            {
                id: 'detalle-pedido',
                title: '3.3 Ver el detalle de un pedido',
                content:
                    'Desde la tabla de pedidos, haz clic en cualquier fila para abrir el modal de detalle. Verás: información del cliente y dirección, tipo/fecha/hora de entrega, lista de productos con personalizaciones, imágenes de referencia, datos de pago (total, abono y saldo), pastelero asignado, y usuario que creó el pedido.',
                steps: [
                    'Si el pedido tiene saldo pendiente, verás una sección para registrar un abono.',
                    'Ingresa el monto del abono y haz clic en "Guardar abono".',
                    'El saldo restante se actualizará automáticamente.',
                ],
            },
            {
                id: 'acciones-pedido',
                title: '3.4 Acciones sobre un pedido',
                content: 'En la tabla de pedidos, el menú de acciones de cada pedido permite:',
                steps: [
                    'Asignar pastelero: selecciona al pastelero disponible en la sucursal y confirma.',
                    'Marcar como entregado: confirma la entrega. Esta acción no se puede deshacer.',
                    'Cancelar pedido: ingresa el motivo de cancelación y confirma.',
                    'Editar pedido: abre el formulario de 4 pasos con toda la información precargada.',
                ],
            },
            {
                id: 'vista-pastelero',
                title: '3.5 Vista del Pastelero',
                content:
                    'Los usuarios con rol Pastelero ven un tablero de producción organizado por fecha de entrega, dividido en tres columnas: Pendientes (Creado), En proceso y Listos (Finalizado).',
                steps: [
                    'Usa las pestañas: Mañana, Pasado mañana o Rango para filtrar por fecha.',
                    'Para iniciar un pedido: haz clic en "Iniciar producción" → pasa a En proceso.',
                    'Para terminar un pedido: haz clic en "Marcar como listo" → pasa a Listo.',
                    'Haz clic en el código del pedido para ver su detalle completo con imágenes de referencia.',
                ],
                tip: 'Cada cambio de estado requiere confirmación. Las imágenes de referencia tienen zoom y desplazamiento para ver los detalles del diseño.',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 5: PRODUCTOS
    // ──────────────────────────────────────────────
    {
        id: 'productos',
        title: 'Gestión de Productos',
        icon: '🎂',
        description: 'Administra el catálogo completo de productos: categorías, fotografías, estado y visibilidad.',
        roleAccess: ['SUPER', 'ADMIN'],
        subsections: [
            {
                id: 'categorias',
                title: '4.1 Organización por categorías',
                content:
                    'Todos los productos están agrupados en categorías (por ejemplo: Pasteles, Cupcakes, Pays, etc.). Al entrar a la sección, verás las categorías listadas en orden alfabético. Las primeras dos aparecen abiertas por defecto; el resto pueden expandirse haciendo clic en su nombre.',
            },
            {
                id: 'crear-categoria',
                title: '4.2 Crear una categoría',
                content: 'Para crear una nueva categoría:',
                steps: [
                    'Haz clic en el botón "Nueva categoría" en la parte superior de la página.',
                    'Ingresa el nombre y una descripción para la categoría.',
                    'Haz clic en Guardar.',
                    'La nueva categoría aparecerá en la lista y estará lista para recibir productos.',
                ],
            },
            {
                id: 'crear-producto',
                title: '4.3 Crear un producto',
                content: 'Para agregar un producto a una categoría:',
                steps: [
                    'Despliega la categoría donde quieres agregar el producto.',
                    'Haz clic en "+ Agregar producto" dentro de esa categoría.',
                    'Ingresa el Nombre del producto (obligatorio) y su Descripción (obligatorio).',
                    'Haz clic en "Siguiente". El sistema abrirá automáticamente el modal de carga de fotografías.',
                ],
            },
            {
                id: 'fotografias',
                title: '4.4 Subir fotografías a un producto',
                content:
                    'Las fotografías son fundamentales para identificar visualmente cada producto. Puedes subir varias imágenes por producto.',
                steps: [
                    'Arrastra y suelta archivos sobre el área marcada con línea punteada, O',
                    'Haz clic en "Elegir archivos" para seleccionarlos desde tu computadora.',
                    'Se aceptan formatos PNG y JPG. Puedes seleccionar varias imágenes a la vez.',
                    'Cuando estés listo, haz clic en "Subir fotos" para guardarlas en el sistema.',
                ],
            },
            {
                id: 'editar-producto',
                title: '4.5 Editar un producto',
                content:
                    'Haz clic sobre el nombre o tarjeta del producto para abrir el modal de edición. Puedes modificar: nombre, descripción, categoría (reasignar a otra), estado activo/inactivo, imágenes (agregar o eliminar) y marcarlo como producto favorito.',
                tip: 'Al eliminar una imagen, la acción no se puede deshacer.',
            },
            {
                id: 'producto-favorito',
                title: '4.6 Producto favorito',
                content:
                    'El sistema permite marcar un único producto como favorito. Este se muestra de forma destacada en la página pública de la tienda.',
                warning: 'Solo puede existir un producto favorito a la vez. Al marcar uno nuevo como favorito, el anterior perderá esa condición automáticamente.',
            },
            {
                id: 'activar-desactivar',
                title: '4.7 Activar o desactivar un producto',
                content:
                    'Si un producto ya no está disponible temporalmente, puedes desactivarlo sin eliminarlo. Los productos inactivos dejan de aparecer en el buscador al crear pedidos. Para volverlos a habilitar, simplemente activa el interruptor nuevamente y guarda.',
                steps: [
                    'Abre el modal de edición del producto.',
                    'Desactiva el interruptor "Activo".',
                    'Confirma el cambio y haz clic en Guardar.',
                ],
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 6: CATÁLOGOS
    // ──────────────────────────────────────────────
    {
        id: 'catalogos',
        title: 'Catálogos',
        icon: '📋',
        description: 'Listas de opciones para personalizar productos en los pedidos: tipos de pan, rellenos, cubiertas, formas, flores y colores.',
        roleAccess: ['SUPER', 'ADMIN'],
        subsections: [
            {
                id: 'bloques-catalogo',
                title: 'Bloques de catálogo disponibles',
                content:
                    'La sección está dividida en 7 bloques independientes. Mantener los catálogos actualizados es fundamental para que los empleados puedan registrar pedidos correctamente.',
                tableHeaders: ['Bloque', '¿Para qué se usa?'],
                tableRows: [
                    ['Tipo de pan', 'Base y sabor del pastel (ej: vainilla, chocolate, zanahoria)'],
                    ['Relleno', 'Tipo de relleno interior del pastel'],
                    ['Cubierta', 'Tipo de decoración exterior (ej: fondant, buttercream)'],
                    ['Forma', 'Forma decorativa del pastel'],
                    ['Flor', 'Tipos de flores disponibles para pedidos tipo Flor'],
                    ['Colores', 'Paleta de colores seleccionables en los productos'],
                ],
            },
            {
                id: 'operaciones-catalogo',
                title: 'Operaciones comunes',
                content: 'Todos los bloques comparten las mismas tres operaciones:',
                steps: [
                    'Agregar: haz clic en "+ Agregar" dentro del bloque, ingresa nombre y descripción, y guarda.',
                    'Editar: haz clic en el ícono de lápiz junto a la opción, modifica los datos y guarda.',
                    'Desactivar: haz clic en el ícono de desactivar, confirma la acción. La opción se oculta pero no se elimina.',
                ],
                tip: 'Los pedidos ya registrados que tenían una opción desactivada no se ven afectados. Si un bloque tiene muchas opciones, usa el botón "Cargar más" al final de la lista.',
            },
            {
                id: 'colores',
                title: '5.8 Agregar Colores',
                content:
                    'Los colores tienen un formulario especial con selector visual. Ingresa el nombre descriptivo y el código hexadecimal (#RRGGBB). El sistema validará el formato automáticamente.',
                warning: 'El código hexadecimal debe tener exactamente el formato #RRGGBB (con el símbolo # y 6 caracteres).',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 7: CLIENTES
    // ──────────────────────────────────────────────
    {
        id: 'clientes',
        title: 'Gestión de Clientes',
        icon: '👥',
        description: 'Registra, consulta y edita la información de los clientes. Tener clientes bien registrados agiliza la creación de pedidos.',
        roleAccess: ['SUPER', 'ADMIN', 'EMPLOYEE'],
        subsections: [
            {
                id: 'buscar-cliente',
                title: '6.1 Buscar un cliente',
                content:
                    'La búsqueda de clientes se realiza por número de teléfono. El sistema filtra automáticamente los resultados mientras escribes.',
                steps: [
                    'Escribe el número de teléfono en la barra de búsqueda (solo dígitos, sin guiones).',
                    'Los resultados se filtran en tiempo real.',
                    'Si no hay resultados, el cliente aún no está registrado.',
                    'Si hay más de 10 clientes, usa los botones Anterior y Siguiente para navegar.',
                ],
            },
            {
                id: 'registrar-cliente',
                title: '6.2 Registrar un nuevo cliente',
                content: 'Haz clic en "+ Nuevo cliente" para abrir el formulario de registro.',
                tableHeaders: ['Campo', 'Obligatorio', 'Descripción'],
                tableRows: [
                    ['Nombre completo', 'Sí', 'Nombre y apellidos del cliente'],
                    ['Teléfono', 'Sí', 'Número de contacto principal'],
                    ['Teléfono alternativo', 'No', 'Segundo número de contacto'],
                    ['Correo electrónico', 'No', 'Dirección de correo del cliente'],
                    ['Notas', 'No', 'Observaciones generales sobre el cliente'],
                ],
                tip: 'Registrar la dirección del cliente desde el inicio facilitará mucho el proceso al crear pedidos de tipo Domicilio, ya que el sistema la ofrecerá automáticamente.',
            },
            {
                id: 'editar-cliente',
                title: '6.3 Editar un cliente',
                content: 'Para modificar los datos de un cliente existente:',
                steps: [
                    'Localiza al cliente en la tabla (búscalo por teléfono si es necesario).',
                    'Haz clic en el ícono de edición (lápiz) en su fila.',
                    'Realiza los cambios necesarios y haz clic en Guardar.',
                ],
                warning: 'Si un cliente tenía dirección registrada y desactivas el interruptor de dirección al editar, la dirección será eliminada al guardar. El sistema mostrará un aviso antes de que confirmes.',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 8: SUCURSALES
    // ──────────────────────────────────────────────
    {
        id: 'sucursales',
        title: 'Gestión de Sucursales',
        icon: '🏪',
        description: 'Registra y administra los puntos físicos de venta o producción de la pastelería.',
        roleAccess: ['SUPER', 'ADMIN'],
        subsections: [
            {
                id: 'vista-sucursales',
                title: '7.1 Vista de sucursales',
                content:
                    'Las sucursales se muestran en una cuadrícula de tarjetas. Cada tarjeta muestra: nombre, dirección, teléfonos registrados, estado (Activa/Inactiva) y botón de edición.',
            },
            {
                id: 'crear-sucursal',
                title: '7.2 Crear una nueva sucursal',
                content: 'El proceso de creación se divide en 2 pasos:',
                steps: [
                    'Paso 1: Haz clic en "+ Agregar sucursal". Ingresa el nombre y la dirección completa. Haz clic en "Siguiente".',
                    'Paso 2: Ingresa el teléfono principal (obligatorio). Opcionalmente agrega teléfono secundario y WhatsApp.',
                    'Haz clic en "Guardar". La nueva sucursal aparecerá de inmediato en la cuadrícula.',
                ],
            },
            {
                id: 'editar-sucursal',
                title: '7.3 Editar una sucursal',
                content:
                    'Haz clic en el botón Editar de la tarjeta de la sucursal. Puedes modificar: nombre, dirección, los tres teléfonos y el estado (Activa/Inactiva).',
                tip: 'Al desactivar una sucursal, esta dejará de aparecer como opción disponible al crear nuevos pedidos.',
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 9: USUARIOS
    // ──────────────────────────────────────────────
    {
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        icon: '👤',
        description: 'Administra las cuentas de acceso al panel: crea usuarios, asigna roles y sucursales, o desactiva cuentas.',
        roleAccess: ['SUPER', 'ADMIN'],
        subsections: [
            {
                id: 'buscar-usuarios',
                title: '8.1 Buscar y filtrar usuarios',
                content:
                    'En la parte superior de la tabla encontrarás un buscador por nombre de usuario y un filtro por rol.',
                tableHeaders: ['Columna', 'Descripción'],
                tableRows: [
                    ['Nombre', 'Nombre y apellido del usuario'],
                    ['Usuario', 'Nombre de usuario para iniciar sesión'],
                    ['Rol', 'Rol asignado con su etiqueta de color'],
                    ['Área', 'Área o especialidad (aplica para Pastelero)'],
                    ['Estado', 'Activo o Inactivo'],
                ],
            },
            {
                id: 'crear-usuario',
                title: '8.2 Crear un nuevo usuario',
                content: 'Haz clic en "+" junto al título Usuarios. Llena los campos y haz clic en Guardar.',
                tableHeaders: ['Campo', 'Obligatorio', 'Descripción'],
                tableRows: [
                    ['Nombre', 'Sí', 'Nombre de pila'],
                    ['Apellido', 'Sí', 'Apellido'],
                    ['Usuario', 'Sí', 'Nombre de usuario (sin espacios)'],
                    ['Contraseña', 'Sí', 'Contraseña inicial de acceso'],
                    ['Rol', 'Sí', 'Tipo de usuario'],
                ],
                steps: [
                    'Para Empleado: selecciona la única sucursal a la que pertenece.',
                    'Para Pastelero: puedes asignar varias sucursales (selección múltiple), su área y especialidad.',
                ],
            },
            {
                id: 'editar-usuario',
                title: '8.3 Editar un usuario',
                content:
                    'Haz clic en el ícono de edición en la fila del usuario. Puedes modificar cualquier campo. Si deseas cambiar la contraseña, escríbela; si lo dejas en blanco, la contraseña no cambiará.',
                tip: 'Para desactivar un usuario, desactiva el interruptor "Activo" y guarda. Un usuario inactivo ya no podrá iniciar sesión en el sistema.',
            },
            {
                id: 'tabla-roles',
                title: '8.4 Tabla de roles y permisos',
                content: 'Resumen de accesos por rol:',
                tableHeaders: ['Rol', 'Secciones accesibles'],
                tableRows: [
                    ['SUPER', 'Todo el sistema'],
                    ['ADMIN', 'Todo el sistema'],
                    ['EMPLOYEE', 'Pedidos y Clientes'],
                    ['BAKER', 'Solo sus pedidos asignados (tablero de producción)'],
                ],
            },
        ],
    },

    // ──────────────────────────────────────────────
    // SECCIÓN 10: APÉNDICE
    // ──────────────────────────────────────────────
    {
        id: 'apendice',
        title: 'Apéndice y Preguntas Frecuentes',
        icon: '❓',
        description: 'Glosario de términos, estados de pedidos, tipos de pedido y respuestas a las dudas más comunes.',
        roleAccess: ['SUPER', 'ADMIN', 'EMPLOYEE', 'BAKER'],
        subsections: [
            {
                id: 'glosario',
                title: '9.1 Glosario de términos',
                content: 'Definiciones de los términos más utilizados en el sistema:',
                tableHeaders: ['Término', 'Definición'],
                tableRows: [
                    ['Pedido', 'Solicitud registrada por un cliente para la compra de uno o más productos'],
                    ['En tienda', 'Tipo de pedido en el que el cliente recoge en sucursal'],
                    ['Domicilio', 'Tipo de pedido con entrega en el domicilio del cliente'],
                    ['Flor', 'Pedido de arreglos florales; puede ser para recoger o a domicilio'],
                    ['Evento', 'Pedido para celebraciones con posibles servicios adicionales'],
                    ['Anticipo / Abono', 'Pago parcial registrado al crear el pedido o posteriormente'],
                    ['Saldo restante', 'Monto que el cliente aún debe liquidar'],
                    ['Pastelero', 'Usuario encargado de la producción de los pedidos en cocina'],
                    ['Asignación', 'Acción de vincular un pedido a un pastelero específico'],
                    ['Catálogo', 'Conjunto de opciones para personalizar un producto'],
                    ['Cubierta', 'Tipo de decoración exterior de un pastel'],
                    ['Manga', 'Estilo de borde decorativo con manga pastelera'],
                    ['Sucursal', 'Punto físico de venta o producción de la pastelería'],
                    ['Tablero Kanban', 'Vista de pedidos del pastelero organizada por estado de producción'],
                    ['Favorito', 'Producto destacado que se muestra en la tienda pública'],
                    ['Desactivar', 'Ocultar temporalmente un elemento sin eliminarlo permanentemente'],
                ],
            },
            {
                id: 'estados-pedido',
                title: '9.2 Estados de un pedido',
                content: 'Un pedido pasa por los siguientes estados:',
                tableHeaders: ['Estado', 'Color', 'Descripción', '¿Quién lo asigna?'],
                tableRows: [
                    ['Creado', 'Verde', 'Registrado, en espera de producción', 'Sistema al crear'],
                    ['En proceso', 'Amarillo', 'El pastelero ya inició la elaboración', 'Pastelero'],
                    ['Finalizado', 'Azul', 'Listo para entrega o recogida', 'Pastelero'],
                    ['Entregado', 'Naranja', 'Fue entregado al cliente', 'Admin / Empleado'],
                    ['Cancelado', 'Rojo', 'Cancelado; requiere motivo', 'Admin / Empleado'],
                ],
                tip: 'Un pedido puede ser cancelado desde cualquier estado antes de ser entregado.',
            },
            {
                id: 'faq',
                title: '9.4 Preguntas frecuentes',
                content: 'Respuestas a las dudas más comunes del sistema:',
                steps: [
                    '¿Puedo crear un pedido sin que el cliente esté registrado? No directamente. Pero en el Paso 1 del formulario puedes registrar al cliente nuevo de forma rápida sin salir del proceso.',
                    '¿Puedo cambiar el tipo de pedido una vez creado? Sí, usando la opción de Editar pedido.',
                    '¿Qué pasa si ingreso una hora fuera del horario? El sistema mostrará una advertencia y no permitirá avanzar (rango permitido: 8:00 AM – 7:59 PM).',
                    '¿Puedo registrar varios abonos para el mismo pedido? Sí. Desde el modal de detalle puedes registrar múltiples abonos en distintos momentos.',
                    '¿Qué sucede si desactivo un producto? Deja de aparecer en el buscador al crear pedidos. Los pedidos ya registrados no se ven afectados.',
                    '¿Puedo tener más de un producto favorito? No. Solo un favorito a la vez; al marcar uno nuevo, el anterior pierde esa condición.',
                    '¿Un pastelero puede ver todos los pedidos? No. Solo ve los pedidos que le han sido asignados explícitamente.',
                    '¿Cómo cambio la contraseña de un usuario? En Usuarios, abre el modal de edición y escribe la nueva contraseña. Si lo dejas vacío, no cambiará.',
                    '¿Puedo eliminar una sucursal, producto o usuario? El sistema no elimina registros permanentemente. Solo puedes desactivarlos, lo que los oculta sin borrar su historial.',
                ],
            },
        ],
    },
]

// ──────────────────────────────────────────────
// CHECKLIST INICIAL PARA ADMINISTRADORES
// ──────────────────────────────────────────────
export interface ChecklistItem {
    id: string
    label: string
    description: string
    section: string
}

export const adminChecklist: ChecklistItem[] = [
    {
        id: 'sucursal',
        label: 'Sucursal creada',
        description: 'Al menos una sucursal activa registrada con nombre, dirección y teléfono.',
        section: 'sucursales',
    },
    {
        id: 'catalogos',
        label: 'Catálogos cargados',
        description: 'Tipos de pan, rellenos, cubiertas, formas, flores y colores disponibles.',
        section: 'catalogos',
    },
    {
        id: 'usuarios',
        label: 'Usuarios creados',
        description: 'Cada colaborador tiene su cuenta con rol y sucursal asignados.',
        section: 'usuarios',
    },
    {
        id: 'productos',
        label: 'Productos registrados',
        description: 'El catálogo de productos está cargado con nombres, descripciones y fotografías.',
        section: 'productos',
    },
    {
        id: 'pedido-prueba',
        label: 'Primer pedido de prueba realizado',
        description: 'Se realizó un pedido de prueba para verificar que el flujo completo funciona correctamente.',
        section: 'pedidos',
    },
]

// ──────────────────────────────────────────────
// CARDS POR ROL
// ──────────────────────────────────────────────
export interface RoleCard {
    role: string
    name: string
    color: string
    bgColor: string
    permissions: string[]
    icon: string
}

export const roleCards: RoleCard[] = [
    {
        role: 'SUPER',
        name: 'Super usuario',
        color: '#1a1a2e',
        bgColor: '#e8e8f0',
        icon: '👑',
        permissions: [
            'Acceso completo a todo el sistema',
            'Gestión de todas las sucursales',
            'Creación y edición de usuarios',
            'Configuración de catálogos',
            'Ver estadísticas globales',
        ],
    },
    {
        role: 'ADMIN',
        name: 'Administrador',
        color: '#d63384',
        bgColor: '#fce4ec',
        icon: '🛡️',
        permissions: [
            'Acceso completo a todo el sistema',
            'Gestión de sucursales propias',
            'Creación y edición de usuarios',
            'Configuración de catálogos',
            'Ver estadísticas por sucursal',
        ],
    },
    {
        role: 'EMPLOYEE',
        name: 'Empleado',
        color: '#0d6efd',
        bgColor: '#e7f1ff',
        icon: '💼',
        permissions: [
            'Registrar y gestionar pedidos',
            'Buscar y registrar clientes',
            'Marcar pedidos como entregados',
            'Registrar abonos de pago',
            'Cancelar pedidos con motivo',
        ],
    },
    {
        role: 'BAKER',
        name: 'Pastelero',
        color: '#fd7e14',
        bgColor: '#fff3cd',
        icon: '🎂',
        permissions: [
            'Ver solo los pedidos asignados',
            'Acceso al tablero de producción',
            'Iniciar producción de pedidos',
            'Marcar pedidos como listos',
            'Ver detalles e imágenes de referencia',
        ],
    },
]