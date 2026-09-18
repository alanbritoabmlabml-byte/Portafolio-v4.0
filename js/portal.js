/* ==========================================================================
   Portada de Sistemas y Tableros · Plásticos Carmen
   Sin backend: apariencia, saludo, cifras del Portafolio, buscador de
   tarjetas y navegación por secciones.
   ========================================================================== */
(function () {
'use strict';

var raiz = document.documentElement;
var el = function (id) { return document.getElementById(id); };
var todos = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

/* ---------- Apariencia: claro → oscuro → según el sistema ---------- */
var ORDEN = ['claro', 'oscuro', 'sistema'];
var ETIQUETA = { claro: 'claro', oscuro: 'oscuro', sistema: 'según el sistema' };

function aplicaTema(pref) {
  raiz.dataset.temaPref = pref;
  var oscuro = pref === 'oscuro' ||
    (pref === 'sistema' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.dataset.tema = oscuro ? 'oscuro' : 'claro';
  var b = el('btnTema');
  if (b) {
    b.title = 'Apariencia: ' + ETIQUETA[pref];
    b.setAttribute('aria-label', 'Cambiar apariencia (ahora: ' + ETIQUETA[pref] + ')');
  }
  try { localStorage.setItem('pc-tema', pref); } catch (e) {}
}

var btn = el('btnTema');
if (btn) {
  btn.addEventListener('click', function () {
    var i = ORDEN.indexOf(raiz.dataset.temaPref || 'sistema');
    aplicaTema(ORDEN[(i + 1) % ORDEN.length]);
  });
  aplicaTema(raiz.dataset.temaPref || 'sistema');
}
if (window.matchMedia) {
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var alCambiar = function () { if ((raiz.dataset.temaPref || 'sistema') === 'sistema') aplicaTema('sistema'); };
  if (mq.addEventListener) mq.addEventListener('change', alCambiar);
  else if (mq.addListener) mq.addListener(alCambiar);
}

/* ---------- Fecha, saludo y año ---------- */
var hoy = new Date();
var f = el('fecha');
if (f) {
  try { f.textContent = hoy.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  catch (e) { f.textContent = hoy.toLocaleDateString(); }
}
var sal = el('saludo');
if (sal) {
  var hh = hoy.getHours();
  sal.textContent = hh < 12 ? 'Buenos días' : (hh < 19 ? 'Buenas tardes' : 'Buenas noches');
}
var anio = el('anio');
if (anio) anio.textContent = String(hoy.getFullYear());

/* ---------- Pulso del Portafolio ----------
   Las cifras vienen de portafolio/resumen.js, que se regenera junto con la
   instantánea del tablero. Si no está, el panel se retira sin romper nada. */
(function pulso() {
  var caja = el('pulsoRejilla');
  if (!caja) return;
  var R = window.PC_RESUMEN;
  if (!R) { var p = caja.closest('.pulso'); if (p) p.hidden = true; return; }

  var pct = function (a, b) { return b > 0 ? Math.round(100 * a / b) : 0; };
  var datos = [
    { n: R.iniciativas, r: 'iniciativas en cartera' },
    { n: R.actividades, r: 'actividades registradas' },
    { n: pct(R.actCerradas, R.actividades) + ' %', r: 'actividades cerradas' },
    { n: R.avanceMedio + ' %', r: 'avance medio de las que están en marcha' }
  ];
  datos.forEach(function (d) {
    var w = document.createElement('div');
    w.className = 'pulso-dato';
    var b = document.createElement('b'); b.textContent = String(d.n);
    var s = document.createElement('span'); s.textContent = d.r;
    w.appendChild(b); w.appendChild(s);
    caja.appendChild(w);
  });

  var pf = el('pulsoFecha');
  if (pf && R.fecha) {
    var d = new Date(R.fecha + 'T00:00:00');
    pf.textContent = 'Datos al ' + d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
  }
})();

/* ---------- Contadores por sección ---------- */
function cuentaSecciones() {
  todos('[data-cuenta]').forEach(function (c) {
    var sec = document.getElementById(c.dataset.cuenta);
    if (!sec) return;
    c.textContent = String(sec.querySelectorAll('[data-tarjeta]:not([hidden])').length);
  });
}
cuentaSecciones();

/* ---------- Buscador ---------- */
function normaliza(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

var caja = el('buscar-tarjetas');
var vacio = el('sin-resultados');
if (caja) {
  var buscar = function () {
    var q = normaliza(caja.value.trim());
    var vistas = 0;
    todos('[data-tarjeta]').forEach(function (t) {
      var ok = !q || normaliza(t.dataset.buscar).indexOf(q) >= 0 ||
        normaliza(t.textContent).indexOf(q) >= 0;
      t.hidden = !ok;
      if (ok) vistas++;
    });
    todos('.seccion').forEach(function (s) {
      s.hidden = !!q && !s.querySelectorAll('[data-tarjeta]:not([hidden])').length;
    });
    if (vacio) vacio.hidden = !q || vistas > 0;
    cuentaSecciones();
  };
  caja.addEventListener('input', buscar);
  caja.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { caja.value = ''; buscar(); caja.blur(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== caja &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) {
      e.preventDefault(); caja.focus();
    }
  });
}

/* ---------- Navegación: marca la sección visible ---------- */
(function navegacion() {
  var enlaces = todos('.nav-secciones a');
  if (!enlaces.length || !window.IntersectionObserver) return;
  var porId = {};
  enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });

  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      var a = porId[e.target.id];
      if (!a) return;
      if (e.isIntersecting) {
        enlaces.forEach(function (x) { x.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-96px 0px -60% 0px', threshold: 0 });

  Object.keys(porId).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) obs.observe(s);
  });
})();

})();
