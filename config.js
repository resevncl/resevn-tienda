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

  // Correo de contacto que se muestra en la página (pie, fichas, políticas y página de gracias)
  correo: "contacto@resevn.cl",

  // WhatsApp: "" = no se muestra en ninguna parte. Solo se usaría si se apaga el pago en línea.
  whatsapp: "",

  // Mensaje prellenado de WhatsApp. {nombre} se reemplaza por el nombre de la polera
  mensajeWhatsapp: "Hola! Quiero consultar por la polera: {nombre}",

  // Franja negra arriba del sitio, para un aviso general. "" = no mostrar nada.
  aviso: "",

  // Promoción 2x: aplica solo a las poleras cuyo precio es "precioUnidad"
  // (y que no tengan "sinPromo": true en products.json). null = sin promoción.
  promo: {
    precioUnidad: 29990,
    precioPar: 54990,   // lo que se paga por 2 poleras en promoción
    precioTrio: 79990,  // lo que se paga por 3 poleras en promoción (null = solo promo de 2)
    etiqueta: "",   // texto sobre la foto en el catálogo, ej: "2 x $54.990". "" = sin etiqueta
    detalle: "2 por $54.990 · 3 por $79.990 · Envío gratis llevando 2 o más",
  },

  // Envío: se cobra "costo" cuando el total de poleras (ya con la promo) es menor que "gratisDesde".
  // null = no se muestra ni se cobra envío. Si cambias estos valores, cámbialos también en pagos/worker.js.
  envio: { costo: 4990, gratisDesde: 54990 },

  // Pago en línea con Mercado Pago. "url" es la dirección del servicio de pagos
  // (ej: "https://pagos.resevn.cl"). Si se deja vacío (""), el sitio vuelve a vender solo por WhatsApp.
  pago: { url: "https://pagos.resevn.cl" },

  // Plazo de entrega: se muestra en el detalle de cada polera y en el footer. "" = no mostrar.
  notaEntrega: "Productos por encargo · Entrega estimada de 2 a 3 semanas",

  // Poleras en stock: se anotan en stock.json (id de products.json -> color -> tallas).
  // Esas tallas muestran este texto en vez del plazo por encargo. Al venderse una, sácala de stock.json.
  notaStock: "Entrega inmediata · Llega en 1 a 4 días hábiles",

  // Guía de tallas: se agrega sola como última foto de todas las poleras. null = no mostrar.
  guiaTallas: "img/guia-de-tallas.webp",

  // Secciones desplegables que aparecen en el detalle de todas las poleras.
  // Una polera puede tener su propia "descripcion" en products.json, que reemplaza la de aquí.
  infoProducto: [
    { titulo: "Descripción",
      texto: "Polera unisex de corte oversize. Mira todas las fotos para ver el estampado y los detalles, y revisa la guía de tallas antes de elegir." },
    { titulo: "Cuidado y lavado",
      texto: "Lávala del revés, con agua fría y en ciclo suave o a mano. No uses secadora ni cloro, y no planches sobre el estampado ni las aplicaciones." },
    { titulo: "Envíos y devoluciones",
      texto: "Despachamos a todo Chile. El envío cuesta $4.990 y es gratis llevando 2 poleras o más. Las poleras con Entrega inmediata llegan en 1 a 4 días hábiles; el resto es por encargo, con entrega estimada de 2 a 3 semanas. No hacemos cambios de talla, así que revisa la guía de medidas antes de comprar. Si te arrepientes, tienes 10 días desde que la recibes para devolverla sin uso." },
  ],

  // Reseñas de clientes. Solo reseñas reales: copia lo que te escribió el cliente.
  // Mientras la lista esté vacía, la sección no se muestra.
  // Las reseñas que dejan los clientes en resevn.cl/opinar.html llegan a tu correo con la línea lista para pegar aquí.
  // Formato: { nombre: "Camila R.", texto: "Llegó antes de lo esperado…", polera: "Hellstar Logo", id: "mlc123", estrellas: 5, fecha: "Octubre 2026" },
  // "id" es el código de la polera: con él la reseña aparece también en la ficha de esa polera. "estrellas" va de 1 a 5.
  resenas: [
  ],

  // Preguntas frecuentes: p = pregunta, r = respuesta
  preguntas: [
    { p: "¿Cómo compro?",
      r: "Elige tu polera, su talla y color, y toca “Comprar ahora”. Se abre tu carrito con el total y el envío: desde ahí finalizas tu compra. Si prefieres preguntar antes, usa los botones de consulta de cada polera." },
    { p: "¿Cuánto demora en llegar?",
      r: "Las poleras marcadas como Entrega inmediata están en stock y llegan en 1 a 4 días hábiles. El resto lo traemos por encargo: la entrega estimada es de 2 a 3 semanas desde que confirmas tu pedido." },
    { p: "¿Hacen envíos a todo Chile?",
      r: "Sí, despachamos a todo Chile. El envío cuesta $4.990 y es gratis llevando 2 poleras o más." },
    { p: "¿Cuánto cuestan y cómo funciona la promo?",
      r: "Todas las poleras cuestan lo mismo: 1 a $29.990, 2 por $54.990 y 3 por $79.990. Desde 2 poleras el envío es gratis. Puedes combinar modelos, marcas, tallas y colores, y si llevas más de 3 la promo se repite." },
    { p: "¿Qué talla elijo?",
      r: "Las poleras son de corte oversize y vienen en S, M, L y XL. Si prefieres un calce más ajustado, elige una talla menos que la que usas normalmente. En cada polera, la última foto es la guía de tallas con las medidas en centímetros. Si tienes dudas, escríbenos y te ayudamos a elegir." },
    { p: "¿Qué pasa si mi polera llega con una falla?",
      r: "Escríbenos apenas la recibas, con una foto, y lo solucionamos." },
    { p: "¿Tienes otra duda?",
      r: "Escríbenos por Instagram a @resevn.cl o al correo contacto@resevn.cl y te respondemos." },
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

  // Píxeles de publicidad. Pega aquí el número de cada píxel para activarlo; "" = apagado.
  // meta: número del píxel de Meta (Facebook e Instagram). tiktok: código del píxel de TikTok.
  medicion: { meta: "1601540231706008", tiktok: "" },

  // Foto de cada marca en el inicio (opcional). Ej: { "Hellstar": "img/polera-hellstar-logo-negro-05.webp" }
  fotosMarca: {},
};
