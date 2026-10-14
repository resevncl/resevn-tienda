// Medición de visitas y ventas para publicidad (píxel de Meta y píxel de TikTok).
// Solo se activa si config.js tiene el número de cada píxel en "medicion". Sin número, no carga nada.
// El resto del sitio avisa con  medir("ver" | "agregar" | "pagar" | "compra", { id, nombre, valor, cantidad, pedido }).
(function () {
  var M = (window.CONFIG && window.CONFIG.medicion) || {};
  var meta = String(M.meta || "").replace(/\D/g, ""), tiktok = String(M.tiktok || "").replace(/[^A-Za-z0-9]/g, "");

  if (meta) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", meta);
    fbq("track", "PageView");
  }

  if (tiktok) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) {
        var n = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = n + "?sdkid=" + e + "&lib=" + t;
        var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(tiktok); ttq.page();
    }(window, document, "ttq");
  }

  var NOMBRES = {
    ver: ["ViewContent", "ViewContent"],
    agregar: ["AddToCart", "AddToCart"],
    pagar: ["InitiateCheckout", "InitiateCheckout"],
    compra: ["Purchase", "CompletePayment"],
  };

  window.medir = function (evento, d) {
    var n = NOMBRES[evento]; if (!n) return;
    d = d || {};
    var valor = Math.round(Number(d.valor) || 0), cantidad = Number(d.cantidad) || 1;
    try {
      if (meta && window.fbq) {
        var m = { currency: "CLP", value: valor, content_type: "product", num_items: cantidad };
        if (d.id) m.content_ids = [].concat(d.id);
        if (d.nombre) m.content_name = d.nombre;
        // El número de pedido evita contar dos veces la misma compra
        fbq("track", n[0], m, d.pedido ? { eventID: d.pedido } : undefined);
      }
      if (tiktok && window.ttq) {
        ttq.track(n[1], { currency: "CLP", value: valor, quantity: cantidad, content_type: "product",
          content_id: d.id ? String([].concat(d.id)[0]) : undefined, content_name: d.nombre || undefined }, d.pedido ? { event_id: d.pedido } : undefined);
      }
    } catch (e) {}
  };
})();
