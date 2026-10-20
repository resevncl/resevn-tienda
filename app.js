(function () {
  const C = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  let productos = [];
  // Vista del catálogo: "inicio" (marcas + destacados), "marca" (una marca) o "todo"
  let vista = { tipo: "inicio", marca: null };
  let hashVista = "";       // hash de la vista actual, para volver a ella al cerrar una polera
  let limite = 12;          // cuántas poleras se muestran antes del botón "Ver más"
  let busqueda = "";

  const linkWhatsapp = (texto) =>
    "https://wa.me/" + C.whatsapp.replace(/\D/g, "") + (texto ? "?text=" + encodeURIComponent(texto) : "");

  // Si el precio es null (o vacío) no se muestra nada
  const formatoPrecio = (precio) =>
    precio === null || precio === undefined || precio === ""
      ? ""
      : "$" + Number(precio).toLocaleString("es-CL");
  // Precio de n poleras en promoción: de a 3 (precioTrio) y el resto de a 2 (precioPar) o sueltas
  const precioPromo = (n) => {
    const P = C.promo;
    if (P.precioTrio) return Math.floor(n / 3) * P.precioTrio + (n % 3 === 2 ? P.precioPar : (n % 3) * P.precioUnidad);
    return Math.floor(n / 2) * P.precioPar + (n % 2) * P.precioUnidad;
  };
  const textoPromo = () => "2 por " + formatoPrecio(C.promo.precioPar) + (C.promo.precioTrio ? " · 3 por " + formatoPrecio(C.promo.precioTrio) : "");

  const miniatura = (ruta) => ruta.replace(/^img\//, "img/min/");

  function crear(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
  }

  // ---------- Datos de la tienda ----------
  const instagram = C.instagram.replace(/^@/, "");
  const fono = C.whatsapp.replace(/\D/g, "");
  document.querySelectorAll("[data-tienda]").forEach((el) => (el.textContent = C.nombreTienda));
  if (C.logo) {
    $("logo-img").src = C.logo;
    $("logo-img").hidden = false;
    // El logo hace de primera letra: "R" + "ESEVN"
    if (C.logoComoInicial) {
      $("logo-texto").textContent = C.nombreTienda.slice(1);
      $("logo").setAttribute("aria-label", C.nombreTienda);
    }
  }
  $("link-instagram").href = "https://instagram.com/" + instagram;
  $("link-instagram").textContent = "@" + instagram;
  $("link-whatsapp").href = linkWhatsapp("");
  $("link-whatsapp").textContent = "+" + fono.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "$1 $2 $3 $4");
  // Abre el chat directo (DM) de Instagram; Instagram no permite prellenar el mensaje
  $("detalle-instagram").href = "https://ig.me/m/" + instagram;
  $("detalle-guia").hidden = !C.guiaTallas;
  $("anio").textContent = new Date().getFullYear();

  // Cinta de la promo sobre el catálogo: deja claro que se puede combinar cualquier polera del precio en promo
  if (C.promo && $("cinta-promo")) {
    const cinta = $("cinta-promo");
    cinta.append(crear("b", "", textoPromo()),
      crear("span", "", "1 polera " + formatoPrecio(C.promo.precioUnidad) + ". Combina modelos, marcas, tallas y colores." +
        (C.envio && C.promo.precioPar >= C.envio.gratisDesde ? " Envío gratis desde 2." : "")));
    cinta.hidden = false;
  }

  if (C.aviso) { $("aviso-promo").textContent = C.aviso; $("aviso-promo").hidden = false; }

  // La promo aplica solo a las poleras con el precio indicado en config.js
  const enPromo = (p) => !!C.promo && p.sinPromo !== true && Number(p.precio) === Number(C.promo.precioUnidad);

  // ---------- Reseñas y preguntas frecuentes ----------
  // Estrellas de una nota de 1 a 5 (las reseñas sin nota no muestran estrellas)
  function estrellas(n) {
    const nota = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    if (!nota) return null;
    const el = crear("span", "estrellas-nota", "★".repeat(nota) + "☆".repeat(5 - nota));
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", nota + " de 5 estrellas");
    return el;
  }
  function tarjetaResena(r, conPolera) {
    const caja = crear("figure", "resena");
    const nota = estrellas(r.estrellas);
    if (nota) caja.append(nota);
    caja.append(crear("blockquote", "", r.texto));
    caja.append(crear("figcaption", "", [r.nombre, conPolera && r.polera, r.fecha].filter(Boolean).join(" · ")));
    return caja;
  }
  const resenasDe = (p) => (C.resenas || []).filter((r) => r.id && r.id === p.id);
  if (C.resenas && C.resenas.length) {
    $("lista-resenas").replaceChildren(...C.resenas.map((r) => tarjetaResena(r, true)));
    $("resenas").hidden = false;
  }
  if (C.preguntas && C.preguntas.length) {
    $("lista-preguntas").replaceChildren(...C.preguntas.map((q) => {
      // En el rediseño las respuestas van siempre a la vista, como una tabla: pregunta a la izquierda, respuesta al lado
      if (document.body.classList.contains("tienda")) {
        const fila = crear("div", "pregunta-fila");
        fila.append(crear("h3", "", q.p), crear("p", "", q.r));
        return fila;
      }
      const d = crear("details", "pregunta");
      d.append(crear("summary", "", q.p), crear("p", "", q.r));
      return d;
    }));
    $("preguntas").hidden = false;
  }

  if (C.notaEntrega) {
    document.querySelectorAll("[data-entrega]").forEach((el) => { el.textContent = C.notaEntrega; el.hidden = false; });
  }

  // ---------- Grilla ----------
  // Nombre corto para la tarjeta: "Polera Hellstar Estrella" -> "Estrella" (la marca va en su propia línea)
  function nombreCorto(p) {
    if (!p.marca) return p.nombre;
    const i = p.nombre.toLowerCase().indexOf(p.marca.toLowerCase());
    return (i >= 0 && p.nombre.slice(i + p.marca.length).trim()) || p.nombre;
  }

  // Porcentaje de rebaja si la polera tiene "precioAntes" mayor que su precio (0 = sin oferta)
  const rebaja = (p) => Number(p.precioAntes) > Number(p.precio) && Number(p.precio) > 0
    ? Math.round((1 - Number(p.precio) / Number(p.precioAntes)) * 100) : 0;

  function tarjeta(p) {
    const boton = crear("button", "tarjeta");
    boton.type = "button";
    boton.addEventListener("click", () => (location.hash = "p=" + p.id));

    const foto = crear("div", "tarjeta-foto");
    p.imagenes.slice(0, 2).forEach((ruta, i) => {
      const img = crear("img", i ? "tarjeta-foto-dorso" : "");
      img.src = miniatura(ruta);
      img.onerror = () => { img.onerror = null; img.src = ruta; };
      img.alt = i ? "" : p.nombre;
      img.loading = "lazy";
      img.decoding = "async";
      foto.append(img);
    });
    if (enPromo(p) && C.promo.etiqueta) foto.append(crear("span", "tarjeta-promo", C.promo.etiqueta));
    boton.append(foto);
    if (p.marca) boton.append(crear("p", "tarjeta-marca", p.marca));
    boton.append(crear("p", "tarjeta-nombre", nombreCorto(p)));

    const precio = formatoPrecio(p.precio);
    if (precio) {
      const linea = crear("p", "tarjeta-precio", precio);
      if (rebaja(p)) { linea.append(" ", crear("s", "", formatoPrecio(p.precioAntes))); foto.append(crear("span", "tarjeta-oferta", "−" + rebaja(p) + "%")); }
      boton.append(linea);
    }
    const extra = [p.tallas.join(" · "), p.variantes.length > 1 ? p.variantes.length + " colores" : ""].filter(Boolean);
    if (extra.length) boton.append(crear("p", "tarjeta-tallas", extra.join("  |  ")));
    boton.append(crear("span", "tarjeta-comprar", "Comprar"));
    return boton;
  }

  // Marcas ordenadas de la que tiene más poleras a la que tiene menos
  function marcas() {
    const cuenta = {};
    productos.forEach((p) => { if (p.marca) cuenta[p.marca] = (cuenta[p.marca] || 0) + 1; });
    return Object.keys(cuenta).sort((a, b) => cuenta[b] - cuenta[a]);
  }

  const PASO = 12;

  // Una sección del catálogo. Con "paginar", muestra de a 12 con un botón "Ver más"
  function seccion(titulo, lista, opciones) {
    const o = opciones || {};
    const sec = crear("section", "seccion");
    const cabecera = crear("div", "catalogo-cabecera");
    cabecera.append(crear("h2", "", titulo));
    if (o.enlace) {
      const a = crear("a", "catalogo-enlace", o.enlace.texto);
      a.href = o.enlace.href;
      cabecera.append(a);
    } else {
      cabecera.append(crear("span", "", lista.length + (lista.length === 1 ? " producto" : " productos")));
    }
    const grilla = crear("div", "grilla");
    const visibles = o.paginar ? lista.slice(0, limite) : lista;
    grilla.append(...visibles.map(tarjeta));
    sec.append(cabecera, grilla);
    if (o.paginar && lista.length > visibles.length) {
      const mas = crear("button", "boton boton-borde ver-mas", "Ver más poleras");
      mas.type = "button";
      mas.addEventListener("click", () => { limite += PASO; pintarGrilla(); });
      sec.append(mas);
    }
    return sec;
  }

  // Foto que representa a una marca: un detalle del estampado de su polera con más fotos
  function fotoMarca(marca) {
    if (C.fotosMarca && C.fotosMarca[marca]) return C.fotosMarca[marca];
    const candidatas = productos.filter((p) => p.marca === marca)
      .map((p) => p.variantes[0].imagenes).sort((a, b) => b.length - a.length)[0] || [];
    return candidatas.length >= 6 ? candidatas[5] : candidatas[0] || "";
  }

  function seccionMarcas() {
    const sec = crear("section", "seccion");
    const cabecera = crear("div", "catalogo-cabecera");
    cabecera.append(crear("h2", "", "Marcas"));
    const todo = crear("a", "catalogo-enlace", "Ver todo");
    todo.href = "#todo";
    cabecera.append(todo);
    const grilla = crear("div", "marcas");
    grilla.append(...marcas().map((m) => {
      const a = crear("a", "marca");
      a.href = "#m=" + encodeURIComponent(m);
      const img = crear("img");
      img.src = miniatura(fotoMarca(m));
      img.alt = "";
      img.loading = "lazy";
      const n = productos.filter((p) => p.marca === m).length;
      const texto = crear("span", "marca-texto");
      texto.append(crear("b", "", m), crear("small", "", n + (n === 1 ? " polera" : " poleras")));
      a.append(img, texto);
      return a;
    }));
    sec.append(cabecera, grilla);
    return sec;
  }

  // Destacados: los ids de config.js o, si no hay, una polera por marca hasta juntar 8
  function destacados() {
    if (C.destacados && C.destacados.length) return C.destacados.map((id) => productos.find((p) => p.id === id)).filter(Boolean);
    const porMarca = marcas().map((m) => productos.filter((p) => p.marca === m));
    const lista = [];
    for (let vuelta = 0; lista.length < 8 && vuelta < 8; vuelta++) {
      porMarca.forEach((ps) => { if (ps[vuelta] && lista.length < 8) lista.push(ps[vuelta]); });
    }
    return lista;
  }

  const sinTildes = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function pintarGrilla() {
    $("aviso").hidden = true;
    const enInicio = vista.tipo === "inicio" && !busqueda;
    if (bannerListo) $("banner").hidden = !enInicio;
    if ($("portada")) { $("portada").hidden = !enInicio; $("como-comprar").hidden = !enInicio; }
    // La portada ya explica la promo: la cinta solo aparece al navegar marcas, "Todo" o una búsqueda
    if ($("cinta-promo") && C.promo) $("cinta-promo").hidden = enInicio;
    $("resenas").hidden = !(enInicio && C.resenas && C.resenas.length);
    $("preguntas").hidden = !(enInicio && C.preguntas && C.preguntas.length);

    if (busqueda) {
      const q = sinTildes(busqueda);
      const lista = productos.filter((p) => sinTildes(p.nombre + " " + (p.marca || "") + " " + p.variantes.map((v) => v.color).join(" ")).includes(q));
      $("secciones").replaceChildren(...(lista.length ? [seccion("Resultados", lista)] : []));
      if (!lista.length) { $("aviso").textContent = "No encontramos poleras para “" + busqueda + "”. Prueba con otra marca o nombre."; $("aviso").hidden = false; }
      return;
    }
    if (vista.tipo === "marca") {
      $("secciones").replaceChildren(seccion(vista.marca, productos.filter((p) => p.marca === vista.marca), { paginar: true }));
    } else if (vista.tipo === "todo") {
      $("secciones").replaceChildren(seccion("Todas las poleras", productos, { paginar: true }));
    } else {
      $("secciones").replaceChildren(seccionMarcas(), seccion("Destacados", destacados(), { enlace: { texto: "Ver todo", href: "#todo" } }));
    }
  }

  function pintarMenu() {
    const enlace = (texto, href, activo) => {
      const a = crear("a", "", texto);
      a.href = href;
      if (activo && !busqueda) a.setAttribute("aria-current", "page");
      return a;
    };
    const items = [
      enlace("Inicio", "#", vista.tipo === "inicio"),
      enlace("Todo", "#todo", vista.tipo === "todo"),
      ...marcas().map((m) => enlace(m, "#m=" + encodeURIComponent(m), vista.tipo === "marca" && vista.marca === m)),
    ];
    if (C.resenas && C.resenas.length) items.push(enlace("Reseñas", "#resenas"));
    if (C.preguntas && C.preguntas.length) items.push(enlace("Preguntas", "#preguntas"));
    items.push(enlace("Contacto", "#contacto"));
    $("menu").replaceChildren(...items);
    const activo = $("menu").querySelector("[aria-current]");
    if (activo && activo.scrollIntoView) activo.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function limpiarBusqueda() {
    busqueda = "";
    $("buscar").value = "";
    $("buscador").hidden = true;
    $("abrir-buscador").setAttribute("aria-expanded", "false");
  }

  // ---------- Buscador ----------
  function mostrarBuscador(ver) {
    $("buscador").hidden = !ver;
    $("abrir-buscador").setAttribute("aria-expanded", String(ver));
    if (ver) $("buscar").focus();
    else if (busqueda) { busqueda = ""; $("buscar").value = ""; pintarMenu(); pintarGrilla(); }
    else $("buscar").value = "";
  }
  $("abrir-buscador").addEventListener("click", () => mostrarBuscador($("buscador").hidden));
  $("cerrar-buscador").addEventListener("click", () => mostrarBuscador(false));
  $("buscador").addEventListener("submit", (e) => { e.preventDefault(); $("catalogo").scrollIntoView({ behavior: "smooth" }); $("buscar").blur(); });
  $("buscar").addEventListener("input", () => {
    const antes = busqueda;
    busqueda = $("buscar").value.trim();
    pintarMenu(); pintarGrilla();
    if (busqueda && !antes) window.scrollTo(0, 0);
  });

  // ---------- Banner (carrusel) ----------
  let bannerListo = false;
  function pintarBanner() {
    if (document.body.classList.contains("tienda")) return; // el rediseño usa la portada fija en vez del carrusel
    const laminas = (C.banners && C.banners.length ? C.banners : [{ imagen: C.bannerImagen || (productos[0] && productos[0].imagenes[0]), titulo: C.bannerTitulo, boton: C.bannerBoton }])
      .filter((b) => b && b.imagen);
    if (!laminas.length) return;
    let actual = 0, reloj = null;
    const pista = $("banner-pista");
    const vistas = laminas.map((b, i) => {
      const lam = crear("div", "banner-lamina");
      lam.setAttribute("aria-hidden", String(i !== 0));
      const img = crear("img");
      img.src = b.imagen;
      img.alt = "";
      if (i === 0) img.fetchPriority = "high"; else img.loading = "lazy";
      const texto = crear("div", "banner-texto");
      texto.append(crear(i === 0 ? "h1" : "p", "banner-titulo", b.titulo || ""));
      const boton = crear("button", "boton boton-claro", b.boton || "Comprar");
      boton.type = "button";
      boton.addEventListener("click", () => { location.hash = b.marca ? "m=" + encodeURIComponent(b.marca) : "todo"; });
      texto.append(boton);
      lam.append(img, texto);
      return lam;
    });
    pista.replaceChildren(...vistas);
    const mostrar = (i) => {
      actual = (i + laminas.length) % laminas.length;
      vistas.forEach((v, k) => {
        v.classList.toggle("activa", k === actual);
        v.setAttribute("aria-hidden", String(k !== actual));
        v.querySelector("button").tabIndex = k === actual ? 0 : -1;
      });
    };
    const sinAnimacion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const andar = () => { clearInterval(reloj); if (laminas.length > 1 && !sinAnimacion) reloj = setInterval(() => mostrar(actual + 1), 6000); };
    if (laminas.length > 1) {
      $("banner-controles").hidden = false;
      $("banner-izq").addEventListener("click", () => { mostrar(actual - 1); andar(); });
      $("banner-der").addEventListener("click", () => { mostrar(actual + 1); andar(); });
      // Deslizar con el dedo
      let x0 = null;
      pista.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      pista.addEventListener("touchend", (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { mostrar(actual + (dx < 0 ? 1 : -1)); andar(); }
      });
    }
    mostrar(0);
    andar();
    bannerListo = true;
  }

  // ---------- Carrito ----------
  // Se guarda en el navegador de cada visitante. Cada línea: {id, color (índice), talla, cant}
  const CLAVE = "resevn-carrito";
  let carrito = [];
  try { carrito = JSON.parse(localStorage.getItem(CLAVE) || "[]") || []; } catch (e) { carrito = []; }
  if (!Array.isArray(carrito)) carrito = [];
  const guardarCarrito = () => { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) {} };

  // Líneas del carrito con su producto (las de poleras que ya no existen se descartan)
  function lineas() {
    return carrito.map((l) => {
      const p = productos.find((x) => x.id === l.id);
      const v = p && (p.variantes[l.color] || p.variantes[0]);
      return p ? { l, p, v, precio: Number(p.precio) || 0 } : null;
    }).filter(Boolean);
  }

  // Envío: se cobra "costo" salvo que el total (ya con la promo) llegue a "gratisDesde"
  const ENVIO = C.envio || null;

  function totales() {
    const ls = lineas();
    const unidades = ls.reduce((a, x) => a + x.l.cant, 0);
    const subtotal = ls.reduce((a, x) => a + x.precio * x.l.cant, 0);
    const elegibles = ls.reduce((a, x) => a + (enPromo(x.p) ? x.l.cant : 0), 0);
    const pares = C.promo ? Math.floor(elegibles / 2) : 0;
    const descuento = C.promo ? Math.max(0, elegibles * C.promo.precioUnidad - precioPromo(elegibles)) : 0;
    const productos = subtotal - descuento;
    const envioGratis = !ENVIO || productos >= ENVIO.gratisDesde;
    const envio = ls.length && ENVIO && !envioGratis ? ENVIO.costo : 0;
    return { ls, unidades, subtotal, elegibles, pares, descuento, productos, envio, envioGratis, total: productos + envio };
  }

  function mensajePedido(t) {
    const filas = t.ls.map((x) => "• " + x.l.cant + " x " + x.p.nombre + (x.v && x.v.color ? " — " + x.v.color : "") + (x.l.talla ? " — talla " + x.l.talla : "") + (x.precio ? " (" + formatoPrecio(x.precio * x.l.cant) + ")" : ""));
    return ["Hola! Quiero hacer este pedido:", ...filas,
      t.descuento ? "Promo (" + textoPromo() + "): −" + formatoPrecio(t.descuento) : "",
      ENVIO ? "Envío: " + (t.envioGratis ? "gratis" : formatoPrecio(t.envio)) : "",
      "Total: " + formatoPrecio(t.total)].filter(Boolean).join("\n");
  }

  // Poleras para sugerir en el carrito: primero las que completan la promo, luego de las mismas marcas
  function recomendadas(t) {
    const enCarrito = new Set(t.ls.map((x) => x.p.id));
    const marcasCarrito = new Set(t.ls.map((x) => x.p.marca));
    const faltaPar = t.elegibles > 0 && t.elegibles % (C.promo && C.promo.precioTrio ? 3 : 2) !== 0;
    const puntaje = (p) => (faltaPar && enPromo(p) ? 2 : 0) + (marcasCarrito.has(p.marca) ? 1 : 0);
    return productos
      .filter((p) => !enCarrito.has(p.id) && Number(p.precio) > 0)
      .map((p, orden) => ({ p, orden, pts: puntaje(p) }))
      .sort((a, b) => b.pts - a.pts || a.orden - b.orden)
      .slice(0, 6).map((x) => x.p);
  }

  function pintarCarrito() {
    const t = totales();
    $("carrito-cuenta").textContent = t.unidades;
    $("carrito-cuenta").hidden = !t.unidades;
    $("abrir-carrito").setAttribute("aria-label", "Abrir carrito (" + t.unidades + (t.unidades === 1 ? " polera)" : " poleras)"));

    const lista = $("carrito-items");
    if (!t.ls.length) {
      const vacio = crear("div", "carrito-vacio");
      vacio.append(crear("p", "carrito-vacio-titulo", "Tu carrito está vacío"));
      const gancho = C.promo
        ? "1 polera " + formatoPrecio(C.promo.precioUnidad) + " · " + textoPromo() + (ENVIO && C.promo.precioPar >= ENVIO.gratisDesde ? ". Envío gratis desde 2." : ".")
        : ENVIO ? "Envío gratis en compras desde " + formatoPrecio(ENVIO.gratisDesde) + "." : "";
      if (gancho) vacio.append(crear("p", "", gancho));
      lista.replaceChildren(vacio);
    } else {
      lista.replaceChildren(...t.ls.map((x) => {
        const fila = crear("article", "carrito-item");
        const img = crear("img");
        img.src = miniatura((x.v && x.v.imagenes[0]) || x.p.imagenes[0] || "");
        img.alt = "";
        const info = crear("div", "carrito-info");
        info.append(crear("p", "carrito-nombre", x.p.nombre));
        info.append(crear("p", "carrito-detalle", [x.v && x.v.color, x.l.talla && "Talla " + x.l.talla].filter(Boolean).join(" · ")));
        const fila2 = crear("div", "carrito-cant");
        const boton = (texto, etiqueta, accion) => { const b = crear("button", "", texto); b.type = "button"; b.setAttribute("aria-label", etiqueta); b.addEventListener("click", accion); return b; };
        fila2.append(
          boton("−", "Quitar una", () => { x.l.cant -= 1; if (x.l.cant < 1) carrito = carrito.filter((l) => l !== x.l); guardarCarrito(); pintarCarrito(); }),
          crear("span", "", String(x.l.cant)),
          boton("+", "Agregar una", () => { x.l.cant = Math.min(20, x.l.cant + 1); guardarCarrito(); pintarCarrito(); }),
          boton("Quitar", "Quitar del carrito", () => { carrito = carrito.filter((l) => l !== x.l); guardarCarrito(); pintarCarrito(); })
        );
        fila2.lastChild.className = "carrito-quitar";
        info.append(fila2);
        fila.append(img, info, crear("p", "carrito-precio", x.precio ? formatoPrecio(x.precio * x.l.cant) : "A consultar"));
        return fila;
      }));
    }

    // Sugerencias: con el carrito vacío invitan a empezar; con poleras, a sumar otra
    const sugeridas = recomendadas(t);
    $("carrito-sugeridas").hidden = !sugeridas.length;
    $("carrito-sugeridas-titulo").textContent = !t.ls.length ? "Te pueden gustar" : ENVIO && !t.envioGratis ? "Suma otra y llega al envío gratis" : "También te puede gustar";
    $("carrito-sugeridas-lista").replaceChildren(...sugeridas.map((p) => {
      const a = crear("a", "sugerida");
      a.href = "#p=" + p.id;
      a.addEventListener("click", () => mostrarCarrito(false));
      const img = crear("img");
      img.src = miniatura(p.imagenes[0] || "");
      img.alt = "";
      img.loading = "lazy";
      a.append(img, crear("span", "sugerida-nombre", nombreCorto(p)), crear("span", "sugerida-precio", formatoPrecio(p.precio)));
      return a;
    }));

    // Barra de avance: envío gratis y promo 2x
    const barra = $("carrito-promo");
    barra.hidden = !t.ls.length || !(ENVIO || C.promo);
    if (!barra.hidden) {
      const n = C.promo ? t.elegibles : 0, ciclo = C.promo && C.promo.precioTrio ? 3 : 2;
      const otra = C.promo ? formatoPrecio(precioPromo(n + 1) - precioPromo(n)) : "";
      let texto, avance;
      if (n === 1) { texto = "Suma 1 polera más por " + otra + ": llevas 2 por " + formatoPrecio(C.promo.precioPar) + (ENVIO ? " con envío gratis" : ""); avance = 1 / ciclo; }
      else if (n > 0 && n % ciclo === ciclo - 1 && C.promo.precioTrio) { texto = "Suma 1 más por solo " + otra + ": llevas 3 por " + formatoPrecio(C.promo.precioTrio); avance = (ciclo - 1) / ciclo; }
      else if (n > 0 && n % ciclo !== 0) { texto = "Suma 1 polera más por solo " + otra; avance = (n % ciclo) / ciclo; }
      else if (ENVIO && !t.envioGratis) { texto = "Te faltan " + formatoPrecio(ENVIO.gratisDesde - t.productos) + " para el envío gratis"; avance = t.productos / ENVIO.gratisDesde; }
      else { texto = "¡Promo aplicada!" + (ENVIO ? " Tu pedido tiene envío gratis" : ""); avance = 1; }
      $("carrito-promo-texto").textContent = texto;
      $("carrito-barra").style.width = Math.round(Math.max(0.06, Math.min(1, avance)) * 100) + "%";
    }

    const fila = (dt, dd, clase) => { const d = crear("div", clase || ""); d.append(crear("dt", "", dt), crear("dd", "", dd)); return d; };
    $("carrito-totales").hidden = !t.ls.length;
    $("carrito-totales").replaceChildren(...[
      t.descuento || ENVIO ? fila("Subtotal", formatoPrecio(t.subtotal)) : null,
      t.descuento ? fila("Promo por cantidad", "−" + formatoPrecio(t.descuento)) : null,
      ENVIO && t.ls.length ? fila("Envío", t.envioGratis ? "Gratis" : formatoPrecio(t.envio)) : null,
      fila("Total", formatoPrecio(t.total), "carrito-total"),
    ].filter(Boolean));

    const pedir = $("carrito-pedir");
    // Con pago en línea no se ofrece comprar por WhatsApp; sin él, es la única forma de pedir
    pintarPar(t);
    pedir.hidden = !t.ls.length || conPago;
    if (t.ls.length) pedir.href = linkWhatsapp(mensajePedido(t));
    pasoCarrito();
  }

  // "Tu par" de la portada: se llena con las poleras en promoción que hay en el carrito
  function pintarPar(t) {
    if (!$("par") || !C.promo) return;
    const enPar = t.elegibles % 2, pares = t.pares;
    const puntos = $("par").querySelectorAll(".par-puntos span");
    puntos.forEach((s, i) => s.classList.toggle("lleno", pares > 0 && !enPar ? true : i < enPar));
    $("par").classList.toggle("completo", pares > 0 && !enPar);
    const unidad = formatoPrecio(C.promo.precioUnidad), par = formatoPrecio(C.promo.precioPar);
    $("par-texto").textContent = pares > 0 && !enPar
      ? "Par completo: " + (pares > 1 ? pares + " pares a " : "") + par + (pares > 1 ? " cada uno" : "") + " con envío gratis."
      : enPar
        ? "Llevas 1. Suma otra polera de " + unidad + " y pagas " + par + " por las dos, con envío gratis."
        : "Tu par: elige 2 poleras de " + unidad + " y pagas " + par + " con envío gratis.";
  }

  // ---------- Portada: el par de ejemplo va cambiando entre todas las poleras en promoción ----------
  function rotarPar() {
    const cajas = document.querySelectorAll(".par-polera");
    if (cajas.length !== 2 || !C.promo) return;
    const lista = productos.filter((p) => enPromo(p) && p.variantes[0] && p.variantes[0].imagenes[0]);
    if (lista.length < 4) return;
    const quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Orden revuelto, y cada par siempre con dos marcas distintas
    const mazo = lista.slice().sort(() => Math.random() - 0.5);
    let i = 0;
    const siguiente = (evitar) => {
      for (let n = 0; n < mazo.length; n++) {
        const p = mazo[i++ % mazo.length];
        if (!evitar || p.marca !== evitar.marca) return p;
      }
      return mazo[i++ % mazo.length];
    };
    const poner = (caja, p) => new Promise((listo) => {
      const ruta = p.variantes[0].imagenes[0];
      const img = new Image();
      img.onload = img.onerror = () => {
        caja.classList.add("cambiando");
        setTimeout(() => {
          const foto = caja.querySelector("img");
          foto.src = ruta;
          foto.alt = p.nombre;
          caja.href = "#p=" + p.id;
          caja.querySelector(".par-polera-nombre").textContent = nombreCorto(p);
          caja.querySelector(".par-polera-marca").textContent = p.marca || "";
          caja.classList.remove("cambiando");
          listo();
        }, 170);
      };
      img.src = ruta;
    });
    let pausa = false;
    const zona = document.querySelector(".portada-par");
    zona.addEventListener("mouseenter", () => (pausa = true));
    zona.addEventListener("mouseleave", () => (pausa = false));
    zona.addEventListener("focusin", () => (pausa = true));
    zona.addEventListener("focusout", () => (pausa = false));
    const cambiar = () => {
      if (pausa || document.hidden || $("portada").hidden) return;
      const a = siguiente(), b = siguiente(a);
      poner(cajas[0], a);
      setTimeout(() => poner(cajas[1], b), 90);
    };
    if (quieto) return;   // con "reducir movimiento" el par queda fijo
    setInterval(cambiar, 1700);
  }

  // ---------- Pago en línea ----------
  // Solo se activa si config.js tiene la dirección del servicio de pagos (pago.url).
  const conPago = !!(C.pago && C.pago.url);

  // El pago se hace en comprar.html: el carrito solo muestra el botón para ir ahí
  function pasoCarrito() {
    const hay = carrito.length > 0;
    $("carrito-pagar").hidden = !(conPago && hay);
    $("carrito-nota").hidden = conPago || !hay;
    $("carrito-seguir").textContent = hay ? "Seguir comprando" : "Ver poleras";
    $("carrito-seguir").className = "boton " + (hay ? "boton-borde" : "boton-oscuro");
  }

  function mostrarCarrito(ver) {
    $("carrito").hidden = !ver;
    document.body.classList.toggle("sin-scroll", ver || !$("detalle").hidden);
    if (ver) { pintarCarrito(); $("carrito-lista").scrollTop = 0; $("cerrar-carrito").focus(); }
  }
  $("abrir-carrito").addEventListener("click", () => mostrarCarrito(true));
  $("cerrar-carrito").addEventListener("click", () => mostrarCarrito(false));
  $("carrito-seguir").addEventListener("click", () => {
    const vacio = !carrito.length;
    mostrarCarrito(false);
    if (vacio) location.hash = "#todo";
  });
  $("carrito").addEventListener("click", (e) => { if (e.target === $("carrito")) mostrarCarrito(false); });

  // ---------- Detalle ----------
  let enDetalle = null;   // {p, color, talla} de la polera abierta

  // Galería: se desliza con el dedo, con las flechas, con los puntos o con las teclas ← →
  let irAFoto = () => {};

  function pintarFotos(p, imagenes) {
    const fotos = $("detalle-fotos");
    let actual = 0;
    fotos.replaceChildren(...imagenes.map((ruta, i) => {
      const img = crear("img");
      img.src = ruta;
      img.alt = ruta === C.guiaTallas ? "Guía de tallas" : p.nombre + " — foto " + (i + 1);
      if (i > 0) img.loading = "lazy";
      return img;
    }));

    const puntos = imagenes.length > 1 ? imagenes.map((_, i) => {
      const b = crear("button");
      b.type = "button";
      b.setAttribute("aria-label", "Foto " + (i + 1));
      b.addEventListener("click", () => irAFoto(i));
      return b;
    }) : [];
    $("detalle-puntos").replaceChildren(...puntos);

    const marcar = () => {
      puntos.forEach((b, i) => b.setAttribute("aria-current", String(i === actual)));
      $("flecha-izq").hidden = imagenes.length < 2 || actual === 0;
      $("flecha-der").hidden = imagenes.length < 2 || actual === imagenes.length - 1;
    };
    irAFoto = (i, relativo) => {
      actual = Math.max(0, Math.min(imagenes.length - 1, relativo ? actual + i : i));
      fotos.scrollTo({ left: actual * fotos.clientWidth, behavior: "smooth" });
      marcar();
    };
    // Al deslizar con el dedo, la foto visible pasa a ser la actual
    let espera;
    fotos.onscroll = () => {
      clearTimeout(espera);
      espera = setTimeout(() => { actual = Math.round(fotos.scrollLeft / fotos.clientWidth); marcar(); }, 120);
    };
    fotos.scrollLeft = 0;
    marcar();
  }

  function actualizarConsulta() {
    const { p, color, talla } = enDetalle;
    const v = p.variantes[color];
    const partes = [p.variantes.length > 1 ? "color " + v.color : "", talla ? "talla " + talla : ""].filter(Boolean);
    const consulta = p.nombre + (partes.length ? " (" + partes.join(", ") + ")" : "");
    $("detalle-whatsapp").href = linkWhatsapp(C.mensajeWhatsapp.replace("{nombre}", consulta));
  }

  // Elige un color: cambia las fotos, el texto "Color: X" y el mensaje de WhatsApp
  function elegirColor(p, indice) {
    const v = p.variantes[indice];
    enDetalle.color = indice;
    // Orden de la galería: frente, espalda, detalles y, al final, la guía de tallas
    pintarFotos(p, C.guiaTallas ? v.imagenes.concat(C.guiaTallas) : v.imagenes);
    $("detalle-color-actual").textContent = v.color;
    $("detalle-colores").querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(i === indice)));
    actualizarConsulta();
  }

  // "Guía de tallas": lleva a la última foto de la galería
  $("detalle-guia").addEventListener("click", () => {
    irAFoto(999);
    $("detalle").scrollTo({ top: 0, behavior: "smooth" });
    const caja = document.querySelector(".detalle-caja");
    if (caja) caja.scrollTo({ top: 0, behavior: "smooth" });
  });

  function elegirTalla(talla) {
    enDetalle.talla = talla;
    $("detalle-talla-actual").textContent = talla || "";
    $("detalle-tallas").querySelectorAll(".chips button").forEach((b) => b.setAttribute("aria-pressed", String(b.textContent === talla)));
    $("detalle-error").hidden = true;
    actualizarConsulta();
  }

  function abrirDetalle(p) {
    enDetalle = { p, color: 0, talla: p.tallas.length === 1 ? p.tallas[0] : "" };
    if (window.medir) medir("ver", { id: p.id, nombre: p.nombre, valor: Number(p.precio) || 0 });
    $("detalle-marca").textContent = p.marca || "";
    $("detalle-nombre").textContent = p.nombre;
    const precio = formatoPrecio(p.precio);
    $("detalle-precio").replaceChildren(precio);
    if (precio && rebaja(p)) $("detalle-precio").append(" ", crear("s", "", formatoPrecio(p.precioAntes)), " ", crear("span", "detalle-oferta", "−" + rebaja(p) + "%"));
    $("detalle-precio").hidden = !precio;
    // Secciones desplegables: descripción propia de la polera (si tiene) + las de config.js
    const info = (p.descripcion ? [{ titulo: "Descripción", texto: p.descripcion }] : []).concat(
      (C.infoProducto || []).filter((x) => !(p.descripcion && x.titulo === "Descripción")));
    $("detalle-secciones").replaceChildren(...info.map((x) => {
      const d = crear("details", "pregunta");
      d.append(crear("summary", "", x.titulo), crear("p", "", x.texto));
      return d;
    }));
    // Reseñas de esta polera: nota promedio junto al precio y una sección con los comentarios
    const rs = resenasDe(p), conNota = rs.filter((r) => Number(r.estrellas) > 0);
    const resumen = $("detalle-resenas");
    resumen.hidden = !rs.length;
    resumen.replaceChildren();
    if (rs.length) {
      const promedio = conNota.length ? conNota.reduce((a, r) => a + Number(r.estrellas), 0) / conNota.length : 0;
      if (promedio) resumen.append(estrellas(promedio), " " + promedio.toFixed(1).replace(".", ",") + " · ");
      resumen.append(rs.length === 1 ? "1 reseña" : rs.length + " reseñas");
      const d = crear("details", "pregunta detalle-opiniones");
      d.append(crear("summary", "", "Reseñas (" + rs.length + ")"), ...rs.map((r) => tarjetaResena(r, false)));
      $("detalle-secciones").append(d);
      resumen.onclick = () => { d.open = true; d.scrollIntoView({ block: "nearest" }); };
    }
    // "sinPromo": true en products.json oculta el aviso de promoción en esa polera
    $("detalle-promo").textContent = enPromo(p) ? C.promo.detalle : "";
    $("detalle-promo").hidden = !enPromo(p);
    $("detalle-error").hidden = true;
    $("detalle-agregar").textContent = "Agregar al carrito";

    const tallas = $("detalle-tallas");
    tallas.hidden = !p.tallas.length;
    tallas.querySelector("ul").replaceChildren(...p.tallas.map((t) => {
      const li = crear("li");
      const b = crear("button", "", t);
      b.type = "button";
      b.addEventListener("click", () => elegirTalla(t));
      li.append(b);
      return li;
    }));

    const colores = $("detalle-colores");
    colores.hidden = !p.variantes.some((v) => v.color);
    colores.querySelector("ul").replaceChildren(...(p.variantes.length > 1 ? p.variantes.map((v, i) => {
      const li = crear("li");
      const b = crear("button");
      b.type = "button";
      b.title = v.color;
      b.setAttribute("aria-label", v.color);
      if (v.imagenes[0]) {
        const img = crear("img");
        img.src = miniatura(v.imagenes[0]);
        img.alt = "";
        b.append(img);
      } else {
        b.textContent = v.color;
      }
      b.addEventListener("click", () => elegirColor(p, i));
      li.append(b);
      return li;
    }) : []));

    $("detalle").hidden = false;
    document.body.classList.add("sin-scroll");
    $("detalle").scrollTop = 0;
    elegirColor(p, 0);
    elegirTalla(enDetalle.talla);
  }

  // Agrega al carrito la polera abierta con el color y la talla elegidos. Devuelve false si falta la talla
  function agregarAlCarrito() {
    if (!enDetalle) return false;
    const { p, color, talla } = enDetalle;
    if (p.tallas.length && !talla) {
      $("detalle-error").textContent = "Elige una talla para continuar.";
      $("detalle-error").hidden = false;
      $("detalle-tallas").scrollIntoView({ block: "center", behavior: "smooth" });
      return false;
    }
    const igual = carrito.find((l) => l.id === p.id && l.color === color && l.talla === talla);
    if (igual) igual.cant = Math.min(20, igual.cant + 1);
    else carrito.push({ id: p.id, color, talla, cant: 1 });
    guardarCarrito();
    pintarCarrito();
    if (window.medir) medir("agregar", { id: p.id, nombre: p.nombre, valor: Number(p.precio) || 0 });
    return true;
  }
  // "Comprar ahora": agrega y abre el carrito para terminar la compra
  $("detalle-comprar").addEventListener("click", () => { if (agregarAlCarrito()) mostrarCarrito(true); });
  // "Agregar al carrito": agrega y deja seguir mirando
  let avisoAgregada;
  $("detalle-agregar").addEventListener("click", () => {
    if (!agregarAlCarrito()) return;
    $("detalle-agregar").textContent = "Agregada al carrito ✓";
    clearTimeout(avisoAgregada);
    avisoAgregada = setTimeout(() => { $("detalle-agregar").textContent = "Agregar al carrito"; }, 2200);
  });

  function cerrarDetalle() {
    $("detalle").hidden = true;
    enDetalle = null;
    document.body.classList.toggle("sin-scroll", !$("carrito").hidden);
  }

  // Todo vive en el hash, así el botón "atrás" del celular funciona y cada vista tiene su link:
  //   #p=id  una polera (se abre sobre la vista actual)   #m=Marca  una marca   #todo  todas   (vacío) inicio
  function ruta() {
    const h = location.hash;
    const mp = h.match(/^#p=(.+)$/);
    const p = mp && productos.find((x) => x.id === decodeURIComponent(mp[1]));
    if (p) return abrirDetalle(p);
    cerrarDetalle();

    const mm = h.match(/^#m=(.+)$/);
    const marca = mm && marcas().find((m) => m === decodeURIComponent(mm[1]));
    const ancla = /^#(preguntas|resenas|contacto)$/.test(h) ? h.slice(1) : "";
    if (ancla === "contacto") { $("contacto").scrollIntoView(); return; }   // el contacto está en todas las vistas

    const nueva = marca ? { tipo: "marca", marca } : h === "#todo" ? { tipo: "todo", marca: null } : { tipo: "inicio", marca: null };
    const cambio = nueva.tipo !== vista.tipo || nueva.marca !== vista.marca || !!busqueda;
    if (cambio) { vista = nueva; limite = PASO; limpiarBusqueda(); }
    hashVista = marca || h === "#todo" ? h : "";
    pintarMenu();
    pintarGrilla();
    if (ancla) $(ancla).scrollIntoView();
    else if (cambio) window.scrollTo(0, 0);
  }

  // Cierra la polera y vuelve a la vista donde estaba el visitante
  function salirDetalle() {
    history.pushState("", document.title, location.pathname + location.search + hashVista);
    cerrarDetalle();
  }

  $("detalle-cerrar").addEventListener("click", salirDetalle);
  $("detalle").addEventListener("click", (e) => { if (e.target === $("detalle")) salirDetalle(); });
  $("flecha-izq").addEventListener("click", () => irAFoto(-1, true));
  $("flecha-der").addEventListener("click", () => irAFoto(1, true));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("carrito").hidden) return mostrarCarrito(false);
    if ($("detalle").hidden) return;
    if (e.key === "Escape") salirDetalle();
    if (e.key === "ArrowLeft") irAFoto(-1, true);
    if (e.key === "ArrowRight") irAFoto(1, true);
  });
  window.addEventListener("hashchange", ruta);

  // Aparición suave de las secciones al entrar en pantalla (se omite con "reducir movimiento")
  if (document.body.classList.contains("tienda") && "IntersectionObserver" in window &&
      !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    document.documentElement.classList.add("con-aparicion");
    const vigia = new IntersectionObserver((entradas) => entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); vigia.unobserve(e.target); }
    }), { rootMargin: "0px 0px -10% 0px" });
    const observar = () => document.querySelectorAll(".seccion:not(.visible), .paso:not(.visible), .extra:not(.visible)").forEach((el) => vigia.observe(el));
    new MutationObserver(observar).observe($("secciones"), { childList: true });
    observar();
  }

  // ---------- Carga ----------
  fetch("products.json", { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((datos) => {
      productos = datos
        .filter((p) => p.visible !== false)
        .map((p) => {
          const imagenes = p.imagenes || [];
          // Sin "variantes" el producto funciona igual: un solo grupo con todas sus fotos
          const variantes = p.variantes && p.variantes.length
            ? p.variantes
            : [{ color: (p.colores || []).join(" / "), imagenes }];
          return { ...p, imagenes, tallas: p.tallas || [], variantes };
        });
      document.querySelectorAll("[data-cuenta-poleras]").forEach((el) => (el.textContent = productos.length));
      document.querySelectorAll("[data-cuenta-marcas]").forEach((el) => (el.textContent = marcas().length));
      rotarPar();
      pintarBanner();
      pintarMenu();
      pintarGrilla();
      pintarCarrito();
      if (!productos.length) { $("aviso").textContent = "Pronto nuevos productos."; $("aviso").hidden = false; }
      ruta();
    })
    .catch(() => {
      $("aviso").textContent = "No se pudo cargar el catálogo. Revisa que products.json esté bien escrito.";
      $("aviso").hidden = false;
    });
})();
