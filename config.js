// ============================================================
//  CONFIGURACIÓN DE LA TIENDA — edita solo los valores entre comillas
// ============================================================
window.CONFIG = {
  // Nombre que aparece en el header, el footer y la pestaña del navegador
  nombreTienda: "RESEVN",

  // Logo que acompaña al nombre en el header (null = solo el nombre en texto)
  logo: "img/logo.png",

  // true = el logo reemplaza la primera letra del nombre (logo + "ESEVN")
  logoComoInicial: true,

  // Usuario de Instagram, sin el @
  instagram: "resevn.cl",

  // Número de WhatsApp con código de país, sin + ni espacios (Chile: 569XXXXXXXX)
  whatsapp: "56956638840",

  // Mensaje prellenado de WhatsApp. {nombre} se reemplaza por el nombre de la polera
  mensajeWhatsapp: "Hola! Quiero consultar por la polera: {nombre}",

  // Franja negra arriba del sitio, para un aviso general. "" = no mostrar nada.
  aviso: "",

  // Promoción 2x: aplica solo a las poleras cuyo precio es "precioUnidad"
  // (y que no tengan "sinPromo": true en products.json). null = sin promoción.
  promo: {
    precioUnidad: 26990,
    precioPar: 49990,   // lo que se paga por 2 poleras en promoción
    etiqueta: "",   // texto sobre la foto en el catálogo, ej: "2 x $49.990". "" = sin etiqueta
    detalle: "Promo: lleva 2 poleras de $26.990 por $49.990 · Envío gratis",
  },

  // Envío: se cobra "costo" cuando el total de poleras (ya con la promo) es menor que "gratisDesde".
  // null = no se muestra ni se cobra envío. Si cambias estos valores, cámbialos también en pagos/worker.js.
  envio: { costo: 4990, gratisDesde: 49990 },

  // Pago en línea con Mercado Pago. "url" es la dirección del servicio de pagos
  // (ej: "https://pagos.resevn.cl"). Mientras esté vacío, el sitio solo vende por WhatsApp.
  pago: { url: "" },

  // Plazo de entrega: se muestra en el detalle de cada polera y en el footer. "" = no mostrar.
  notaEntrega: "Productos por encargo · Entrega estimada de 1 a 2 semanas",

  // Guía de tallas: se agrega sola como última foto de todas las poleras. null = no mostrar.
  guiaTallas: "img/guia-de-tallas.webp",

  // Secciones desplegables que aparecen en el detalle de todas las poleras.
  // Una polera puede tener su propia "descripcion" en products.json, que reemplaza la de aquí.
  infoProducto: [
    { titulo: "Descripción",
      texto: "Polera unisex de corte oversize. Mira todas las fotos para ver el estampado y los detalles, y revisa la guía de tallas antes de elegir." },
    { titulo: "Cuidado y lavado",
      texto: "Lávala del revés, con agua fría y en ciclo suave o a mano. No uses secadora ni cloro, y no planches sobre el estampado ni las aplicaciones." },
    { titulo: "Envíos y cambios",
      texto: "Despachamos a todo Chile. El envío cuesta $4.990 y es gratis en compras desde $49.990. Trabajamos por encargo: la entrega estimada es de 1 a 2 semanas. Tienes 10 días desde que la recibes para pedir un cambio de talla o devolución." },
  ],

  // Reseñas de clientes. Solo reseñas reales: copia lo que te escribió el cliente.
  // Mientras la lista esté vacía, la sección no se muestra.
  // Formato: { nombre: "Camila R.", texto: "Llegó antes de lo esperado…", polera: "Hellstar Logo", fecha: "Octubre 2026" },
  resenas: [
  ],

  // Preguntas frecuentes: p = pregunta, r = respuesta
  preguntas: [
    { p: "¿Cómo compro?",
      r: "Elige tu polera, su talla y color, y toca “Comprar ahora”. Se abre tu carrito con el total y el envío: desde ahí finalizas tu compra. Si prefieres preguntar antes, usa los botones de consulta de cada polera." },
    { p: "¿Cuánto demora en llegar?",
      r: "Trabajamos por encargo. La entrega estimada es de 1 a 2 semanas desde que confirmas tu pedido." },
    { p: "¿Hacen envíos a todo Chile?",
      r: "Sí, despachamos a todo Chile. El envío cuesta $4.990 y es gratis en compras desde $49.990; por ejemplo, llevando 2 poleras en promoción." },
    { p: "¿Cómo funciona la promo 2 x $49.990?",
      r: "Aplica al llevar 2 poleras de $26.990: pagas $49.990 por las dos, con envío gratis. Puedes combinar modelos, tallas y colores. Las poleras con otro precio no entran en la promoción." },
    { p: "¿Qué talla elijo?",
      r: "Las poleras son de corte oversize y vienen en S, M, L y XL. En cada polera, la última foto es la guía de tallas con las medidas en centímetros. Si tienes dudas, escríbenos y te ayudamos a elegir." },
    { p: "¿Qué pasa si mi polera llega con una falla?",
      r: "Escríbenos apenas la recibas, con una foto, y lo solucionamos." },
    { p: "¿Tienes otra duda?",
      r: "Escríbenos por WhatsApp o Instagram con los botones de más abajo y te respondemos." },
  ],

  // Fotos grandes del inicio (carrusel). Cada una: imagen, título, texto del botón y,
  // opcionalmente, la marca que abre el botón (sin "marca", abre todas las poleras).
  banners: [
    { imagen: "img/polera-valley-dreams-ufo-negro-06.webp", titulo: "Nueva colección", boton: "Comprar ahora" },
    { imagen: "img/polera-life-hustlers-astronauta-negro-06.webp", titulo: "Life Hustlers", boton: "Comprar", marca: "Life Hustlers" },
    { imagen: "img/polera-supply-aliens-negro-06.webp", titulo: "Supply", boton: "Comprar", marca: "Supply" },
    { imagen: "img/polera-mixed-emotion-alas-rojas-negro-05.webp", titulo: "Mixed Emotion", boton: "Comprar", marca: "Mixed Emotion" },
  ],

  // Poleras destacadas en el inicio: lista de "id" de products.json.
  // Vacío = se elige sola una polera por marca.
  destacados: [],

  // Foto de cada marca en el inicio (opcional). Ej: { "Hellstar": "img/polera-hellstar-logo-negro-05.webp" }
  fotosMarca: {},
};
