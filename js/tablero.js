/* ==========================================================================
   Tablero Gerencial y de Directorio · Portafolio de Transformación
   Plásticos Carmen S.R.L. — Departamento de IT

   Sin dependencias: todo se calcula y se dibuja aquí, en el navegador.
   Los datos vienen de datos.js (instantánea del export) y pueden
   reemplazarse en caliente con «Cargar export».
   ========================================================================== */
(function () {
'use strict';

/* ======================================================================
   0 · Utilidades
   ====================================================================== */

var SVGNS = 'http://www.w3.org/2000/svg';
var el = function (id) { return document.getElementById(id); };
var HOY = new Date(); HOY.setHours(0, 0, 0, 0);

function n0(v) { return (v === null || v === undefined || !isFinite(v)) ? '—' : Math.round(v).toLocaleString('es-BO'); }
function n1(v) { return (v === null || v === undefined || !isFinite(v)) ? '—' : v.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
function pc(a, b) { return b > 0 ? Math.round(100 * a / b) : 0; }
function fecha(s) { return s ? new Date(s + 'T00:00:00') : null; }
function fechaCorta(s) {
  if (!s) return '—';
  var d = fecha(s);
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }).replace('.', '');
}
function fechaLarga(s) {
  if (!s) return 'sin fecha';
  return fecha(s).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}
function dias(a, b) { return Math.round((b - a) / 86400000); }
function sinAcentos(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

/* Crea un elemento SVG con atributos. */
function sv(tag, attrs) {
  var e = document.createElementNS(SVGNS, tag);
  for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
  return e;
}
/* Crea un elemento HTML; el texto va como nodo de texto, nunca como innerHTML. */
function h(tag, attrs, texto) {
  var e = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    if (k === 'clase') e.className = attrs[k];
    else if (k === 'texto') e.textContent = attrs[k];
    else if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
  }
  if (texto !== undefined && texto !== null) e.textContent = texto;
  return e;
}
function vaciar(nodo) { while (nodo.firstChild) nodo.removeChild(nodo.firstChild); }
function css(nombre) { return getComputedStyle(document.body).getPropertyValue(nombre).trim(); }

function ancho() { return window.innerWidth || document.documentElement.clientWidth || 360; }
function esTelefono() { return ancho() < 640; }
function esAngosto() { return ancho() < 980; }

/* Icono en línea, reutilizable. Devuelve un <svg> nuevo cada vez. */
var TRAZOS = {
  clip: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5',
  campana: 'M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M13.7 20a2 2 0 0 1-3.4 0',
  doc: 'M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z',
  fuera: 'M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6',
  aviso: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  reloj: 'M12 7v5l3 2',
  vacio: 'M3 7h18M3 12h18M3 17h10'
};
function icono(nombre, tam) {
  var s = sv('svg', {
    xmlns: SVGNS, viewBox: '0 0 24 24', width: tam || 14, height: tam || 14,
    fill: 'none', stroke: 'currentColor', 'stroke-width': 1.9,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', class: 'icono'
  });
  if (nombre === 'reloj') s.appendChild(sv('circle', { cx: 12, cy: 12, r: 9 }));
  s.appendChild(sv('path', { d: TRAZOS[nombre] }));
  return s;
}

/* ======================================================================
   1 · Diccionarios de estado
   Los cuatro estados forman una escala ordinal. Cada uno lleva SIEMPRE
   glifo + etiqueta, así que nunca dependen sólo del color.
   ====================================================================== */

var ACT_ESTADOS = [
  { k: 'Vencido', clase: 'vencido', glifo: '▲', v: '--d-vencido' },
  { k: 'Abierto', clase: 'abierto', glifo: '○', v: '--d-abierto' },
  { k: 'En curso', clase: 'curso', glifo: '◐', v: '--d-curso' },
  { k: 'Cerrado', clase: 'cerrado', glifo: '●', v: '--d-cerrado' }
];
var INI_ESTADOS = [
  { k: 'Atrasado', clase: 'vencido', glifo: '▲', v: '--d-vencido' },
  { k: 'No iniciado', clase: 'abierto', glifo: '○', v: '--d-abierto' },
  { k: 'En proceso', clase: 'curso', glifo: '◐', v: '--d-curso' },
  { k: 'Concluido', clase: 'cerrado', glifo: '●', v: '--d-cerrado' }
];
/* Orden real del ciclo de vida de una iniciativa, para el embudo. */
var ETAPAS = ['Identificado', 'Priorizado', 'En diseño', 'En implementación', 'En validación', 'Cerrado'];
var RAMPA = ['--r1', '--r2', '--r3', '--r4', '--r5', '--r6'];

function defEstado(lista, k) {
  for (var i = 0; i < lista.length; i++) if (lista[i].k === k) return lista[i];
  return { k: k, clase: 'abierto', glifo: '○', v: '--d-abierto' };
}
function insignia(lista, k) {
  var d = defEstado(lista, k);
  var s = h('span', { clase: 'insignia insignia--' + d.clase });
  s.appendChild(h('span', { clase: 'glifo', 'aria-hidden': 'true' }, d.glifo));
  s.appendChild(document.createTextNode(k));
  return s;
}

/* ======================================================================
   2 · Datos y estado de la aplicación
   ====================================================================== */

var D = { ini: [], act: [], porIni: {}, fuente: '' };

var F = {
  texto: '', area: '', macro: '', etapa: '', prio: '', lider: '',
  areaAct: '', resp: '', origen: '', estadoAct: '', tipo: ''
};
var ETIQ_F = {
  area: 'Área', macro: 'Macroproceso', etapa: 'Etapa', prio: 'Prioridad',
  lider: 'Líder', areaAct: 'Área de actividad', resp: 'Responsable',
  origen: 'Origen', estadoAct: 'Estado de actividad', tipo: 'Tipo'
};
var VISTA = 'directorio';
var ordenIni = { col: 'avance', desc: false };
var ordenAct = { col: 'compromiso', desc: false };

/* ---------- Preparación ---------- */
function prepara(datos) {
  D.ini = datos.iniciativas.slice();
  D.act = datos.actividades.slice();
  D.fuente = datos.fuente || '';
  D.porIni = {};
  D.act.forEach(function (a) {
    (D.porIni[a.iniId] || (D.porIni[a.iniId] = [])).push(a);
    a.fc = fecha(a.compromiso);
    a.atraso = (a.estado !== 'Cerrado' && a.fc) ? dias(a.fc, HOY) : null;
    a.busca = sinAcentos(a.nombre + ' ' + a.resp + ' ' + a.area + ' ' + a.comentario + ' ' + a.iniRaw);
  });
  D.ini.forEach(function (i) {
    var A = D.porIni[i.id] || [];
    i.acts = A;
    i.nAct = A.length;
    i.nCerradas = A.filter(function (a) { return a.estado === 'Cerrado'; }).length;
    i.nVencidas = A.filter(function (a) { return a.estado === 'Vencido'; }).length;
    /* El avance de una iniciativa se calcula desde sus actividades; el campo
       del export sólo se usa cuando todavía no tiene ninguna. */
    i.avanceCalc = A.length
      ? A.reduce(function (s, a) { return s + (a.avance || 0); }, 0) / A.length
      : (i.avance === null ? null : i.avance);
    i.di = fecha(i.ini); i.df = fecha(i.fin);
    /* Consumo del plazo: qué fracción de la ventana planificada ya transcurrió. */
    i.consumo = (i.di && i.df && i.df > i.di)
      ? Math.max(0, Math.min(1.35, dias(i.di, HOY) / dias(i.di, i.df)))
      : null;
    i.brecha = (i.consumo !== null && i.avanceCalc !== null)
      ? (i.avanceCalc / 100) - Math.min(1, i.consumo) : null;
    i.docs = i.enlaces.slice();
    A.forEach(function (a) { a.enlaces.forEach(function (u) { if (i.docs.indexOf(u) < 0) i.docs.push(u); }); });
    i.busca = sinAcentos(i.nombre + ' ' + i.lider + ' ' + i.area + ' ' + i.macro + ' ' +
      i.tipo + ' ' + i.nota + ' ' + i.equipo + ' ' + i.etapa + ' ' + i.estado);
  });
}

/* ---------- Filtrado ---------- */
function filtra() {
  var porActivo = F.areaAct || F.resp || F.origen || F.estadoAct;
  var ini = D.ini.filter(function (i) {
    return (!F.area || i.area === F.area) &&
           (!F.macro || i.macro === F.macro) &&
           (!F.etapa || i.etapa === F.etapa) &&
           (!F.prio || i.prio === F.prio) &&
           (!F.tipo || i.tipo === F.tipo) &&
           (!F.lider || i.lider === F.lider);
  });
  var ids = {};
  ini.forEach(function (i) { ids[i.id] = 1; });

  var act = D.act.filter(function (a) {
    return ids[a.iniId] &&
           (!F.areaAct || a.area === F.areaAct) &&
           (!F.resp || a.resp === F.resp) &&
           (!F.origen || a.origen === F.origen) &&
           (!F.estadoAct || a.estado === F.estadoAct);
  });

  if (porActivo) {
    var conAct = {};
    act.forEach(function (a) { conAct[a.iniId] = 1; });
    ini = ini.filter(function (i) { return conAct[i.id]; });
  }

  if (F.texto) {
    var q = sinAcentos(F.texto);
    var actCoincide = {};
    act.forEach(function (a) { if (a.busca.indexOf(q) >= 0) actCoincide[a.iniId] = 1; });
    ini = ini.filter(function (i) { return i.busca.indexOf(q) >= 0 || actCoincide[i.id]; });
    var ids2 = {}; ini.forEach(function (i) { ids2[i.id] = 1; });
    act = act.filter(function (a) { return ids2[a.iniId] && (a.busca.indexOf(q) >= 0 || sinAcentos(a.iniRaw).indexOf(q) >= 0); });
  }
  return { ini: ini, act: act };
}

/* ======================================================================
   3 · Sugerencia flotante (tooltip)
   ====================================================================== */

var globo = null;
function globoMostrar(ev, titulo, filas) {
  if (!globo) globo = el('globo');
  vaciar(globo);
  globo.appendChild(h('b', null, titulo));
  (filas || []).forEach(function (f) {
    var fila = h('div', { clase: 'fila' });
    if (f.color) {
      var p = h('span', { clase: 'punto' }); p.style.background = f.color; fila.appendChild(p);
    }
    fila.appendChild(document.createTextNode(f.k));
    fila.appendChild(h('span', { clase: 'n' }, f.v));
    globo.appendChild(fila);
  });
  globo.setAttribute('data-visible', '');
  globoMover(ev);
}
function globoMover(ev) {
  if (!globo || !globo.hasAttribute('data-visible')) return;
  var r = globo.getBoundingClientRect();
  var x = (ev.clientX || 0) + 14, y = (ev.clientY || 0) + 16;
  if (x + r.width > window.innerWidth - 8) x = (ev.clientX || 0) - r.width - 14;
  if (y + r.height > window.innerHeight - 8) y = (ev.clientY || 0) - r.height - 14;
  globo.style.left = Math.max(8, x) + 'px';
  globo.style.top = Math.max(8, y) + 'px';
}
function globoOcultar() { if (globo) globo.removeAttribute('data-visible'); }

/* Conecta una marca al globo y, opcionalmente, a un filtro al hacer clic. */
function interactiva(nodo, titulo, filas, alClic) {
  nodo.addEventListener('mouseenter', function (ev) { globoMostrar(ev, titulo, filas); });
  nodo.addEventListener('mousemove', globoMover);
  nodo.addEventListener('mouseleave', globoOcultar);
  if (alClic) {
    nodo.style.cursor = 'pointer';
    nodo.addEventListener('click', function () { globoOcultar(); alClic(); });
  }
  return nodo;
}

/* ======================================================================
   4 · Fichas de KPI
   ====================================================================== */

function fichaKpi(cfg) {
  var k = h('div', { clase: 'kpi' + (cfg.tono ? ' kpi--' + cfg.tono : '') });
  k.appendChild(h('div', { clase: 'kpi-rotulo' }, cfg.rotulo));
  var c = h('div', { clase: 'kpi-cifra' }, cfg.cifra);
  if (cfg.unidad) c.appendChild(h('small', null, cfg.unidad));
  k.appendChild(c);
  if (cfg.medidor !== undefined && cfg.medidor !== null) {
    var m = h('div', { clase: 'medidor' + (cfg.tono ? ' medidor--' + cfg.tono : '') });
    var s = h('span'); s.style.width = Math.max(2, Math.min(100, cfg.medidor)) + '%';
    m.appendChild(s); k.appendChild(m);
  }
  if (cfg.pie) {
    var p = h('div', { clase: 'kpi-pie' });
    p.appendChild(document.createTextNode(cfg.pie));
    k.appendChild(p);
  }
  return k;
}

function tono(v, bien, mal, masEsMejor) {
  if (v === null || !isFinite(v)) return null;
  if (masEsMejor) return v >= bien ? 'bien' : (v <= mal ? 'mal' : 'ojo');
  return v <= bien ? 'bien' : (v >= mal ? 'mal' : 'ojo');
}

function pintaKpisDirectorio(d) {
  var c = el('kpisDirectorio'); vaciar(c);
  var nIni = d.ini.length;
  var conPlan = d.ini.filter(function (i) { return i.nAct > 0; }).length;
  var cerradas = d.ini.filter(function (i) { return i.etapa === 'Cerrado'; }).length;
  var conAvance = d.ini.filter(function (i) { return i.avanceCalc !== null; });
  var avMedio = conAvance.length ? conAvance.reduce(function (s, i) { return s + i.avanceCalc; }, 0) / conAvance.length : null;
  var vencidas = d.act.filter(function (a) { return a.estado === 'Vencido'; }).length;
  var cumpl = d.act.length ? pc(d.act.filter(function (a) { return a.estado === 'Cerrado'; }).length, d.act.length) : 0;
  var enRiesgo = d.ini.filter(function (i) { return i.estado === 'Atrasado' || i.nVencidas > 0; }).length;

  [
    { rotulo: 'Iniciativas en cartera', cifra: n0(nIni), pie: cerradas + ' cerradas · ' + (nIni - cerradas) + ' vivas' },
    { rotulo: 'Con plan de ejecución', cifra: pc(conPlan, nIni), unidad: '%', medidor: pc(conPlan, nIni),
      tono: tono(pc(conPlan, nIni), 70, 40, true), pie: conPlan + ' de ' + nIni + ' tienen actividades' },
    { rotulo: 'Avance medio', cifra: avMedio === null ? '—' : n0(avMedio), unidad: avMedio === null ? '' : '%',
      medidor: avMedio, tono: tono(avMedio, 70, 40, true), pie: 'sobre ' + conAvance.length + ' iniciativas medibles' },
    { rotulo: 'Actividades cerradas', cifra: cumpl, unidad: '%', medidor: cumpl,
      tono: tono(cumpl, 75, 50, true), pie: d.act.length + ' actividades en total' },
    { rotulo: 'Actividades vencidas', cifra: n0(vencidas), medidor: d.act.length ? 100 * vencidas / d.act.length : 0,
      tono: tono(d.act.length ? 100 * vencidas / d.act.length : 0, 5, 15, false),
      pie: d.act.length ? pc(vencidas, d.act.length) + ' % del total' : 'sin actividades' },
    { rotulo: 'Iniciativas en riesgo', cifra: n0(enRiesgo), medidor: nIni ? 100 * enRiesgo / nIni : 0,
      tono: tono(nIni ? 100 * enRiesgo / nIni : 0, 8, 20, false), pie: 'atrasadas o con actividades vencidas' }
  ].forEach(function (k) { c.appendChild(fichaKpi(k)); });
}

function pintaKpisGerencial(d) {
  var c = el('kpisGerencial'); vaciar(c);
  var A = d.act;
  var abiertas = A.filter(function (a) { return a.estado !== 'Cerrado'; });
  var venc = A.filter(function (a) { return a.estado === 'Vencido'; });
  var atrasoMedio = venc.length ? venc.reduce(function (s, a) { return s + (a.atraso || 0); }, 0) / venc.length : null;
  var sinFecha = A.filter(function (a) { return !a.compromiso; }).length;
  var alta = A.filter(function (a) { return a.prio === 'Alta' && a.estado !== 'Cerrado'; }).length;
  var areas = {}; A.forEach(function (a) { areas[a.area] = 1; });
  var cerr30 = A.filter(function (a) { return a.estado === 'Cerrado' && a.fc && dias(a.fc, HOY) <= 30 && a.fc <= HOY; }).length;

  [
    { rotulo: 'Actividades abiertas', cifra: n0(abiertas.length), pie: A.length + ' registradas en total' },
    { rotulo: 'De prioridad alta sin cerrar', cifra: n0(alta), medidor: abiertas.length ? 100 * alta / abiertas.length : 0,
      tono: tono(abiertas.length ? 100 * alta / abiertas.length : 0, 40, 70, false), pie: 'sobre el trabajo abierto' },
    { rotulo: 'Atraso medio de lo vencido', cifra: atrasoMedio === null ? '—' : n0(atrasoMedio), unidad: atrasoMedio === null ? '' : ' d',
      tono: tono(atrasoMedio, 15, 45, false), pie: venc.length + ' actividades vencidas' },
    { rotulo: 'Cerradas en los últimos 30 días', cifra: n0(cerr30), pie: 'ritmo de cierre reciente' },
    { rotulo: 'Sin fecha de compromiso', cifra: n0(sinFecha), medidor: A.length ? 100 * sinFecha / A.length : 0,
      tono: tono(A.length ? 100 * sinFecha / A.length : 0, 5, 20, false), pie: 'no se pueden vencer ni seguir' },
    { rotulo: 'Áreas con trabajo activo', cifra: n0(Object.keys(areas).length), pie: 'áreas distintas con actividades' }
  ].forEach(function (k) { c.appendChild(fichaKpi(k)); });
}

function pintaKpisPersonas(d) {
  var c = el('kpisPersonas'); vaciar(c);
  var porResp = agrupa(d.act, function (a) { return a.resp || '(sin responsable)'; });
  var gente = Object.keys(porResp);
  var cargas = gente.map(function (k) { return porResp[k].length; }).sort(function (a, b) { return b - a; });
  var total = d.act.length;
  var top3 = cargas.slice(0, 3).reduce(function (s, v) { return s + v; }, 0);
  var lideres = {}; d.ini.forEach(function (i) { if (i.lider) lideres[i.lider] = 1; });
  var sinNadie = d.act.filter(function (a) { return !a.resp; }).length;
  var mediana = cargas.length ? cargas[Math.floor(cargas.length / 2)] : 0;

  [
    { rotulo: 'Personas con actividades', cifra: n0(gente.length), pie: 'responsables distintos' },
    { rotulo: 'Líderes de iniciativa', cifra: n0(Object.keys(lideres).length), pie: 'sobre ' + d.ini.length + ' iniciativas' },
    { rotulo: 'Concentración en 3 personas', cifra: pc(top3, total), unidad: '%',
      medidor: pc(top3, total), tono: tono(pc(top3, total), 45, 65, false), pie: top3 + ' de ' + total + ' actividades' },
    { rotulo: 'Carga mediana', cifra: n0(mediana), pie: 'actividades por persona' },
    { rotulo: 'Carga máxima', cifra: n0(cargas[0] || 0), pie: 'de una sola persona' },
    { rotulo: 'Sin responsable asignado', cifra: n0(sinNadie), tono: sinNadie ? 'ojo' : 'bien', pie: 'actividades huérfanas' }
  ].forEach(function (k) { c.appendChild(fichaKpi(k)); });
}

/* ======================================================================
   5 · Utilidades de agregación
   ====================================================================== */

function agrupa(arr, clave) {
  var m = {};
  arr.forEach(function (x) { var k = clave(x); (m[k] || (m[k] = [])).push(x); });
  return m;
}
function conteoEstados(arr, lista, campo) {
  return lista.map(function (d) {
    return { def: d, n: arr.filter(function (x) { return x[campo || 'estado'] === d.k; }).length };
  });
}

/* ======================================================================
   6 · Embudo de maduración
   ====================================================================== */

function pintaEmbudo(d) {
  var c = el('embudo'); vaciar(c);
  var porEtapa = agrupa(d.ini, function (i) { return i.etapa; });

  /* Acumulado hacia adelante: cuántas iniciativas alcanzaron esta etapa o
     una posterior. Eso es lo que convierte la lista en un embudo. */
  var alcanzo = ETAPAS.map(function (e, idx) {
    var n = 0;
    for (var j = idx; j < ETAPAS.length; j++) n += (porEtapa[ETAPAS[j]] || []).length;
    return { etapa: e, alcanzo: n, aqui: (porEtapa[e] || []).length };
  });
  var tope = alcanzo[0].alcanzo || 1;

  alcanzo.forEach(function (x, idx) {
    var fila = h('div', { clase: 'embudo-fila', role: 'button', tabindex: '0',
      'aria-pressed': F.etapa === x.etapa ? 'true' : 'false' });

    var cab = h('div', { clase: 'embudo-cab' });
    var nom = h('div', { clase: 'embudo-nombre' });
    var pt = h('span'); pt.style.cssText = 'width:9px;height:9px;border-radius:3px;flex:none;background:' + css(RAMPA[idx]);
    nom.appendChild(pt);
    nom.appendChild(document.createTextNode(x.etapa));
    cab.appendChild(nom);
    var cif = h('div', { clase: 'embudo-cifra' }, n0(x.alcanzo));
    cif.appendChild(h('small', null, pc(x.alcanzo, tope) + ' %'));
    cab.appendChild(cif);
    fila.appendChild(cab);

    var barra = h('div', { clase: 'embudo-barra' });
    var s = h('span');
    s.style.width = Math.max(1.5, 100 * x.alcanzo / tope) + '%';
    s.style.background = css(RAMPA[idx]);
    barra.appendChild(s);
    fila.appendChild(barra);

    if (idx < alcanzo.length - 1) {
      var sig = alcanzo[idx + 1].alcanzo;
      var caida = x.alcanzo - sig;
      var pie = h('div', { clase: 'embudo-caida' });
      var paso = pc(sig, x.alcanzo || 1);
      pie.appendChild(document.createTextNode(x.aqui + ' se quedan aquí · pasan a la siguiente '));
      var b = h('b', null, paso + ' %');
      if (paso >= 50) b.style.color = 'var(--texto)';
      pie.appendChild(b);
      fila.appendChild(pie);
    }

    interactiva(fila, x.etapa, [
      { k: 'Alcanzaron esta etapa', v: n0(x.alcanzo) },
      { k: 'Detenidas aquí', v: n0(x.aqui) },
      { k: 'Del total de la cartera', v: pc(x.alcanzo, tope) + ' %' }
    ], function () { ponFiltro('etapa', F.etapa === x.etapa ? '' : x.etapa); });
    fila.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ponFiltro('etapa', F.etapa === x.etapa ? '' : x.etapa); }
    });
    c.appendChild(fila);
  });

  /* Lectura en una frase: el salto más grande del embudo. */
  var peor = null;
  for (var i = 0; i < alcanzo.length - 1; i++) {
    var caida = alcanzo[i].aqui;
    if (!peor || caida > peor.caida) peor = { etapa: alcanzo[i].etapa, caida: caida, base: alcanzo[i].alcanzo };
  }
  var L = el('lecturaEmbudo'); vaciar(L);
  if (peor && peor.base) {
    L.appendChild(document.createTextNode('El cuello de botella está en '));
    L.appendChild(h('b', null, peor.etapa.toLowerCase()));
    L.appendChild(document.createTextNode(': ' + peor.caida + ' iniciativas (' +
      pc(peor.caida, tope) + ' % de la cartera) no han pasado de ahí.'));
  } else {
    L.textContent = 'Sin iniciativas que mostrar con los filtros actuales.';
  }
}

/* ======================================================================
   7 · Salud de la planificación (medidores)
   ====================================================================== */

function pintaSalud(d) {
  var c = el('salud'); vaciar(c);
  var n = d.ini.length || 1;
  var filas = [
    { r: 'Con actividades definidas', v: d.ini.filter(function (i) { return i.nAct > 0; }).length, bien: 70, mal: 40 },
    { r: 'Con fecha de inicio y fin', v: d.ini.filter(function (i) { return i.ini && i.fin; }).length, bien: 70, mal: 40 },
    { r: 'Con responsable líder', v: d.ini.filter(function (i) { return !!i.lider; }).length, bien: 95, mal: 80 },
    { r: 'Con resultado esperado escrito', v: d.ini.filter(function (i) { return !!i.nota; }).length, bien: 60, mal: 25 },
    { r: 'Con documento adjunto', v: d.ini.filter(function (i) { return i.docs.length > 0; }).length, bien: 40, mal: 10 }
  ];
  filas.forEach(function (f) {
    var p = pc(f.v, n);
    var fila = h('div');
    fila.style.cssText = 'display:flex;flex-direction:column;gap:4px;padding:9px 0;border-top:1px solid var(--borde)';
    var top = h('div');
    top.style.cssText = 'display:flex;justify-content:space-between;gap:10px;align-items:baseline';
    top.appendChild(h('span', { style: 'font-size:12.5px;color:var(--texto)' }, f.r));
    top.appendChild(h('b', { style: 'font-size:13px;color:var(--tinta);font-variant-numeric:tabular-nums' }, f.v + ' · ' + p + ' %'));
    fila.appendChild(top);
    var t = tono(p, f.bien, f.mal, true);
    var m = h('div', { clase: 'medidor medidor--' + t });
    var s = h('span'); s.style.width = Math.max(1.5, p) + '%'; m.appendChild(s);
    fila.appendChild(m);
    c.appendChild(fila);
  });
  var nota = h('p');
  nota.style.cssText = 'font-size:11.5px;color:var(--texto-suave);margin-top:10px;line-height:1.55';
  nota.textContent = 'Sobre las ' + d.ini.length + ' iniciativas que cumplen los filtros actuales.';
  c.appendChild(nota);
}

/* ======================================================================
   8 · Curva S · compromisos acumulados contra cierres acumulados
   ====================================================================== */

function semanaDe(d) {
  /* Lunes de la semana de esa fecha. */
  var x = new Date(d.getTime());
  var dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow); x.setHours(0, 0, 0, 0);
  return x;
}

function pintaCurvaS(d) {
  var c = el('curvaS'); vaciar(c);
  var conFecha = d.act.filter(function (a) { return a.fc; });
  if (conFecha.length < 2) { c.appendChild(estadoVacio('Ninguna actividad filtrada tiene fecha de compromiso.')); vaciar(el('leyendaCurva')); return; }

  var fechas = conFecha.map(function (a) { return a.fc; });
  var min = semanaDe(new Date(Math.min.apply(null, fechas)));
  var max = semanaDe(new Date(Math.max.apply(null, fechas)));
  var semanas = [];
  for (var t = new Date(min.getTime()); t <= max; t.setDate(t.getDate() + 7)) semanas.push(new Date(t.getTime()));

  var serieC = [], serieK = [], accC = 0, accK = 0;
  semanas.forEach(function (s) {
    var fin = new Date(s.getTime()); fin.setDate(fin.getDate() + 7);
    conFecha.forEach(function (a) {
      if (a.fc >= s && a.fc < fin) { accC++; if (a.estado === 'Cerrado') accK++; }
    });
    serieC.push(accC); serieK.push(accK);
  });

  var W = Math.max(semanas.length * (esTelefono() ? 46 : 62) + 70, esAngosto() ? 560 : 780);
  var H = 280, M = { t: 34, r: 16, b: 40, i: 48 };
  var pw = W - M.i - M.r, ph = H - M.t - M.b;
  var tope = Math.max(accC, 1);
  var escY = function (v) { return M.t + ph - (v / tope) * ph; };
  var escX = function (i) { return M.i + (semanas.length === 1 ? pw / 2 : (i / (semanas.length - 1)) * pw); };

  var s = sv('svg', { class: 'grafico', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H,
    role: 'img', 'aria-label': 'Curva S de actividades comprometidas contra cerradas' });
  s.style.width = W + 'px'; s.style.minWidth = W + 'px'; s.style.height = H + 'px';

  /* Malla y eje Y */
  var pasos = 4;
  for (var g = 0; g <= pasos; g++) {
    var v = Math.round(tope * g / pasos), y = escY(v);
    s.appendChild(sv('line', { class: 'malla', x1: M.i, x2: W - M.r, y1: y, y2: y }));
    var tx = sv('text', { x: M.i - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 10.5 });
    tx.textContent = n0(v); s.appendChild(tx);
  }

  /* Eje X: una etiqueta cada N semanas para que no se pisen */
  var cada = esTelefono() ? 3 : (semanas.length > 10 ? 2 : 1);
  semanas.forEach(function (sem, i) {
    if (i % cada) return;
    var tx = sv('text', { x: escX(i), y: H - 22, 'text-anchor': 'middle', 'font-size': 10 });
    tx.textContent = sem.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' });
    s.appendChild(tx);
  });
  s.appendChild(sv('line', { class: 'eje', x1: M.i, x2: W - M.r, y1: M.t + ph, y2: M.t + ph }));

  /* Marca de «hoy» */
  var iHoy = -1;
  semanas.forEach(function (sem, i) { if (sem <= HOY) iHoy = i; });
  if (iHoy >= 0 && iHoy < semanas.length) {
    var xh = escX(iHoy);
    s.appendChild(sv('line', { x1: xh, x2: xh, y1: M.t, y2: M.t + ph,
      stroke: css('--eje'), 'stroke-width': 1, 'stroke-dasharray': '3 4' }));
    var th = sv('text', { x: xh, y: M.t - 4, 'text-anchor': 'middle', 'font-size': 9.5 });
    th.textContent = 'hoy'; s.appendChild(th);
  }

  /* Área entre las dos curvas: la deuda de ejecución */
  var dCom = '', dCer = '';
  semanas.forEach(function (_, i) {
    dCom += (i ? 'L' : 'M') + escX(i) + ' ' + escY(serieC[i]);
    dCer += (i ? 'L' : 'M') + escX(i) + ' ' + escY(serieK[i]);
  });
  var brecha = dCom;
  for (var i = semanas.length - 1; i >= 0; i--) brecha += 'L' + escX(i) + ' ' + escY(serieK[i]);
  brecha += 'Z';
  s.appendChild(sv('path', { d: brecha, fill: css('--d-vencido'), 'fill-opacity': .1, stroke: 'none' }));

  s.appendChild(sv('path', { d: dCom, fill: 'none', stroke: css('--d-abierto'), 'stroke-width': 2,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  s.appendChild(sv('path', { d: dCer, fill: 'none', stroke: css('--d-cerrado'), 'stroke-width': 2,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));

  /* Punto final de cada serie, con anillo del color del papel */
  [[serieC, '--d-abierto'], [serieK, '--d-cerrado']].forEach(function (par) {
    var iF = semanas.length - 1;
    s.appendChild(sv('circle', { cx: escX(iF), cy: escY(par[0][iF]), r: 5,
      fill: css(par[1]), stroke: css('--papel'), 'stroke-width': 2 }));
  });
  /* Etiqueta directa sólo en los extremos */
  var yC = Math.max(M.t + 12, escY(accC) - 12), yK = escY(accK) + 18;
  if (yK - yC < 16) yK = yC + 18;
  var lc = sv('text', { x: escX(semanas.length - 1) - 10, y: yC, 'text-anchor': 'end', class: 'val', 'font-size': 11.5 });
  lc.textContent = n0(accC) + ' comprometidas'; s.appendChild(lc);
  var lk = sv('text', { x: escX(semanas.length - 1) - 10, y: yK, 'text-anchor': 'end', class: 'val', 'font-size': 11.5 });
  lk.textContent = n0(accK) + ' cerradas'; s.appendChild(lk);

  /* Capa de cruz: una banda invisible por semana */
  semanas.forEach(function (sem, i) {
    var bw = pw / Math.max(1, semanas.length - 1);
    var r = sv('rect', { x: escX(i) - bw / 2, y: M.t, width: bw, height: ph, fill: 'transparent', class: 'marca' });
    interactiva(r, 'Semana del ' + sem.toLocaleDateString('es-BO', { day: '2-digit', month: 'long' }), [
      { k: 'Comprometidas', v: n0(serieC[i]), color: css('--d-abierto') },
      { k: 'Cerradas', v: n0(serieK[i]), color: css('--d-cerrado') },
      { k: 'Brecha', v: n0(serieC[i] - serieK[i]) }
    ]);
    s.appendChild(r);
  });

  c.appendChild(s);

  var L = el('leyendaCurva'); vaciar(L);
  [['--d-abierto', 'Comprometidas (acumulado)'], ['--d-cerrado', 'Cerradas (acumulado)']].forEach(function (p) {
    var b = h('span'); b.style.cssText = 'display:inline-flex;align-items:center;gap:6px';
    var pt = h('span', { clase: 'punto' }); pt.style.background = css(p[0]);
    b.appendChild(pt); b.appendChild(document.createTextNode(p[1]));
    L.appendChild(b);
  });

  var LC = el('lecturaCurva'); vaciar(LC);
  var deuda = accC - accK;
  LC.appendChild(document.createTextNode('Al cierre del periodo hay '));
  LC.appendChild(h('b', null, n0(deuda) + ' actividades'));
  LC.appendChild(document.createTextNode(' comprometidas y no cerradas — el ' + pc(deuda, accC) +
    ' % de todo lo que se comprometió.'));
}

/* ======================================================================
   9 · Mapa de calor · área impactada × etapa
   ====================================================================== */

function pintaCalor(d) {
  var c = el('calor'); vaciar(c);
  var porArea = agrupa(d.ini, function (i) { return i.area; });
  var areas = Object.keys(porArea).sort(function (a, b) { return porArea[b].length - porArea[a].length; });
  if (!areas.length) { c.appendChild(estadoVacio('Sin iniciativas para cruzar.')); vaciar(el('leyendaCalor')); return; }

  var max = 0;
  areas.forEach(function (a) {
    ETAPAS.forEach(function (e) {
      var n = porArea[a].filter(function (i) { return i.etapa === e; }).length;
      if (n > max) max = n;
    });
  });

  var t = h('table', { clase: 'calor' });
  var thead = h('thead'), trh = h('tr');
  trh.appendChild(h('th', null, ''));
  ETAPAS.forEach(function (e) {
    var th = h('th', { title: e });
    th.textContent = esAngosto() ? e.slice(0, 3) + '.' : e.replace('En implementación', 'Implem.').replace('En validación', 'Validac.').replace('En diseño', 'Diseño');
    trh.appendChild(th);
  });
  trh.appendChild(h('th', null, 'Total'));
  thead.appendChild(trh); t.appendChild(thead);

  var tb = h('tbody');
  areas.forEach(function (a) {
    var tr = h('tr');
    tr.appendChild(h('th', { title: a }, a));
    ETAPAS.forEach(function (e) {
      var lista = porArea[a].filter(function (i) { return i.etapa === e; });
      var td = h('td');
      if (!lista.length) { td.className = 'vacia'; td.textContent = '0'; }
      else {
        /* Rampa secuencial de un solo tono: más iniciativas, más oscuro. */
        var paso = Math.min(RAMPA.length - 1, Math.floor((lista.length / max) * (RAMPA.length - 1) + .5));
        td.style.background = css(RAMPA[paso]);
        /* La rampa se invierte en modo noche, así que el texto se elige por
           la claridad real del relleno, no por la posición en la escala. */
        td.style.color = claro(css(RAMPA[paso])) ? css('--tinta') : '#fff';
        td.textContent = lista.length;
        interactiva(td, a + ' · ' + e, [
          { k: 'Iniciativas', v: n0(lista.length) },
          { k: 'Avance medio', v: medio(lista) === null ? '—' : n0(medio(lista)) + ' %' }
        ], function () {
          ponFiltro('area', F.area === a && F.etapa === e ? '' : a);
          ponFiltro('etapa', F.area === a && F.etapa === e ? '' : e);
        });
      }
      tr.appendChild(td);
    });
    var tot = h('td');
    tot.style.cssText = 'background:transparent;color:var(--texto);font-weight:700';
    tot.textContent = porArea[a].length;
    tr.appendChild(tot);
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  c.appendChild(t);

  var L = el('leyendaCalor'); vaciar(L);
  L.appendChild(h('span', null, 'Menos'));
  RAMPA.forEach(function (v) {
    var p = h('span', { clase: 'punto' }); p.style.background = css(v); L.appendChild(p);
  });
  L.appendChild(h('span', null, 'Más iniciativas (máx. ' + max + ')'));
}

/* ¿El relleno es lo bastante claro como para llevar texto oscuro encima? */
function claro(hex) {
  var m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return true;
  var v = parseInt(m[1], 16);
  var L = (0.2126 * (v >> 16 & 255) + 0.7152 * (v >> 8 & 255) + 0.0722 * (v & 255)) / 255;
  return L > 0.58;
}

function medio(lista) {
  var c = lista.filter(function (i) { return i.avanceCalc !== null; });
  return c.length ? c.reduce(function (s, i) { return s + i.avanceCalc; }, 0) / c.length : null;
}

function estadoVacio(txt) {
  var v = h('div', { clase: 'vacio' });
  v.appendChild(icono('vacio', 38));
  v.appendChild(h('p', null, txt));
  return v;
}

/* ======================================================================
   10 · Dispersión · avance real contra plazo consumido
   Codificación DIVERGENTE: atrasada (rojo) ↔ en línea (gris neutro) ↔
   adelantada (azul). La posición respecto de la diagonal ya dice lo mismo,
   así que el color sólo refuerza.
   ====================================================================== */

function pintaDispersion(d) {
  var c = el('dispersion'); vaciar(c);
  var pts = d.ini.filter(function (i) { return i.consumo !== null && i.avanceCalc !== null; });
  if (!pts.length) {
    c.appendChild(estadoVacio('Ninguna iniciativa filtrada tiene fechas y avance a la vez.'));
    vaciar(el('leyendaDisp')); return;
  }

  var W = esAngosto() ? 330 : 380, H = 300, M = { t: 14, r: 16, b: 40, i: 42 };
  var pw = W - M.i - M.r, ph = H - M.t - M.b;
  var ex = function (v) { return M.i + Math.min(1, v) * pw; };
  var ey = function (v) { return M.t + ph - (v / 100) * ph; };

  var s = sv('svg', { class: 'grafico', viewBox: '0 0 ' + W + ' ' + H,
    preserveAspectRatio: 'xMidYMid meet', role: 'img',
    'aria-label': 'Dispersión de avance contra plazo consumido' });
  s.style.maxWidth = W + 'px'; s.style.margin = '0 auto';

  for (var g = 0; g <= 4; g++) {
    var y = ey(g * 25), x = ex(g / 4);
    s.appendChild(sv('line', { class: 'malla', x1: M.i, x2: M.i + pw, y1: y, y2: y }));
    var ty = sv('text', { x: M.i - 7, y: y + 4, 'text-anchor': 'end', 'font-size': 10 });
    ty.textContent = (g * 25) + '%'; s.appendChild(ty);
    var tx = sv('text', { x: x, y: H - 22, 'text-anchor': 'middle', 'font-size': 10 });
    tx.textContent = (g * 25) + '%'; s.appendChild(tx);
  }
  s.appendChild(sv('line', { class: 'eje', x1: M.i, x2: M.i + pw, y1: M.t + ph, y2: M.t + ph }));
  s.appendChild(sv('line', { class: 'eje', x1: M.i, x2: M.i, y1: M.t, y2: M.t + ph }));

  /* Diagonal de referencia: avance = plazo consumido */
  s.appendChild(sv('line', { x1: ex(0), y1: ey(0), x2: ex(1), y2: ey(100),
    stroke: css('--dv-medio'), 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
  var td = sv('text', { x: ex(1) - 4, y: ey(100) + 14, 'text-anchor': 'end', 'font-size': 9.5 });
  td.textContent = 'al día'; s.appendChild(td);

  var ejeX = sv('text', { x: M.i + pw / 2, y: H - 6, 'text-anchor': 'middle', 'font-size': 10.5 });
  ejeX.textContent = 'Plazo consumido'; s.appendChild(ejeX);
  var ejeY = sv('text', { x: 12, y: M.t + ph / 2, 'text-anchor': 'middle', 'font-size': 10.5,
    transform: 'rotate(-90 12 ' + (M.t + ph / 2) + ')' });
  ejeY.textContent = 'Avance real'; s.appendChild(ejeY);

  var cuenta = { atras: 0, linea: 0, adel: 0 };
  pts.forEach(function (i) {
    var b = i.brecha;
    var col = b < -0.15 ? '--dv-atras' : (b > 0.15 ? '--dv-adel' : '--dv-medio');
    if (b < -0.15) cuenta.atras++; else if (b > 0.15) cuenta.adel++; else cuenta.linea++;
    /* Radio por tamaño de la iniciativa (nº de actividades), mínimo 4px. */
    var r = Math.max(4, Math.min(9, 4 + Math.sqrt(i.nAct)));
    var p = sv('circle', { cx: ex(i.consumo), cy: ey(i.avanceCalc), r: r,
      fill: css(col), 'fill-opacity': .85, stroke: css('--papel'), 'stroke-width': 2, class: 'marca' });
    interactiva(p, i.nombre, [
      { k: 'Avance', v: n0(i.avanceCalc) + ' %', color: css(col) },
      { k: 'Plazo consumido', v: Math.round(i.consumo * 100) + ' %' },
      { k: 'Actividades', v: n0(i.nAct) },
      { k: 'Fin planificado', v: fechaCorta(i.fin) }
    ], function () { abreIniciativa(i); });
    s.appendChild(p);
  });
  c.appendChild(s);

  var L = el('leyendaDisp'); vaciar(L);
  [['--dv-atras', 'Atrasada (' + cuenta.atras + ')'], ['--dv-medio', 'En línea (' + cuenta.linea + ')'],
   ['--dv-adel', 'Adelantada (' + cuenta.adel + ')']].forEach(function (p) {
    var b = h('span'); b.style.cssText = 'display:inline-flex;align-items:center;gap:6px';
    var pt = h('span', { clase: 'punto' }); pt.style.cssText = 'border-radius:50%;background:' + css(p[0]);
    b.appendChild(pt); b.appendChild(document.createTextNode(p[1]));
    L.appendChild(b);
  });
  L.appendChild(h('span', { style: 'color:var(--texto-suave)' }, '· el tamaño del punto es el número de actividades'));
}

/* ======================================================================
   11 · Barras apiladas horizontales por estado
   Un hueco de 2px del color del papel separa los segmentos; cada estado
   lleva su glifo en la leyenda, así que nunca depende sólo del color.
   ====================================================================== */

function barrasApiladas(contenedor, filas, lista, opciones) {
  var c = el(contenedor); vaciar(c);
  if (!filas.length) { c.appendChild(estadoVacio('Nada que mostrar con los filtros actuales.')); return; }
  opciones = opciones || {};

  var etiqW = esTelefono() ? 96 : 152;
  var valW = opciones.valorAncho || 74;
  var W = esAngosto() ? Math.max(330, Math.min(ancho() - 74, 640)) : 700;
  var alto = esTelefono() ? 26 : 28, hueco = 9;
  var H = filas.length * (alto + hueco) + 8;
  var pw = W - etiqW - valW;
  var max = Math.max.apply(null, filas.map(function (f) { return f.total; })) || 1;

  var s = sv('svg', { class: 'grafico', viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H,
    preserveAspectRatio: 'xMinYMin meet', role: 'img', 'aria-label': opciones.titulo || 'Barras apiladas por estado' });

  filas.forEach(function (f, idx) {
    var y = idx * (alto + hueco) + 4;
    var te = sv('text', { x: etiqW - 10, y: y + alto / 2 + 4, 'text-anchor': 'end', 'font-size': esTelefono() ? 10.5 : 11.5 });
    var lim = esTelefono() ? 15 : 24;
    te.textContent = f.etiqueta.length > lim ? f.etiqueta.slice(0, lim - 1) + '…' : f.etiqueta;
    var tt = sv('title'); tt.textContent = f.etiqueta; te.appendChild(tt);
    s.appendChild(te);

    var x = etiqW, largoTotal = (f.total / max) * pw;
    var segs = f.segmentos.filter(function (g) { return g.n > 0; });
    segs.forEach(function (g, j) {
      var w = (g.n / f.total) * largoTotal;
      var esPrimero = j === 0, esUltimo = j === segs.length - 1;
      /* Hueco de 2px en el color de la superficie entre segmentos vecinos. */
      var wDib = Math.max(1, w - (esUltimo ? 0 : 2));
      var r = sv('path', {
        d: sendaBarra(x, y, wDib, alto, esPrimero ? 4 : 0, esUltimo ? 4 : 0),
        fill: css(g.def.v), class: 'marca'
      });
      interactiva(r, f.etiqueta + ' · ' + g.def.k, [
        { k: 'Actividades', v: n0(g.n), color: css(g.def.v) },
        { k: 'Del total de la fila', v: pc(g.n, f.total) + ' %' }
      ], opciones.alClic ? function () { opciones.alClic(f, g); } : null);
      s.appendChild(r);
      x += w;
    });

    var tv = sv('text', { x: etiqW + largoTotal + 9, y: y + alto / 2 + 4, class: 'val', 'font-size': 11.5 });
    tv.textContent = opciones.valor ? opciones.valor(f) : n0(f.total);
    s.appendChild(tv);
  });
  c.appendChild(s);
}

function leyendaEstados(contenedor, lista) {
  var L = el(contenedor); if (!L) return; vaciar(L);
  lista.forEach(function (d) {
    var b = h('button', { type: 'button', 'aria-pressed': F.estadoAct === d.k ? 'true' : 'false' });
    var pt = h('span', { clase: 'punto' }); pt.style.background = css(d.v);
    b.appendChild(pt);
    b.appendChild(h('span', { clase: 'glifo', 'aria-hidden': 'true' }, d.glifo));
    b.appendChild(document.createTextNode(d.k));
    b.addEventListener('click', function () { ponFiltro('estadoAct', F.estadoAct === d.k ? '' : d.k); });
    L.appendChild(b);
  });
}

/* Senda de barra horizontal con esquinas redondeadas sólo en los extremos
   de dato: el arranque en la línea base queda recto, como manda la norma. */
function sendaBarra(x, y, w, hgt, rIzq, rDer) {
  rIzq = Math.min(rIzq, w / 2, hgt / 2); rDer = Math.min(rDer, w / 2, hgt / 2);
  return 'M' + (x + rIzq) + ' ' + y +
    'H' + (x + w - rDer) + (rDer ? 'a' + rDer + ' ' + rDer + ' 0 0 1 ' + rDer + ' ' + rDer : '') +
    'V' + (y + hgt - rDer) + (rDer ? 'a' + rDer + ' ' + rDer + ' 0 0 1 ' + (-rDer) + ' ' + rDer : '') +
    'H' + (x + rIzq) + (rIzq ? 'a' + rIzq + ' ' + rIzq + ' 0 0 1 ' + (-rIzq) + ' ' + (-rIzq) : '') +
    'V' + (y + rIzq) + (rIzq ? 'a' + rIzq + ' ' + rIzq + ' 0 0 1 ' + rIzq + ' ' + (-rIzq) : '') + 'Z';
}

/* ======================================================================
   12 · Paneles de la vista Gerencial
   ====================================================================== */

function pintaBarrasArea(d) {
  var porArea = agrupa(d.act, function (a) { return a.area || '(sin área)'; });
  var filas = Object.keys(porArea).map(function (k) {
    return { etiqueta: k, total: porArea[k].length, segmentos: conteoEstados(porArea[k], ACT_ESTADOS), clave: k };
  }).sort(function (a, b) { return b.total - a.total; });
  barrasApiladas('barrasArea', filas, ACT_ESTADOS, {
    titulo: 'Actividades por área y estado',
    alClic: function (f) { ponFiltro('areaAct', F.areaAct === f.clave ? '' : f.clave); }
  });
  leyendaEstados('leyendaEstados', ACT_ESTADOS);
}

function pintaBarrasTipo(d) {
  var porTipo = agrupa(d.ini, function (i) { return i.tipo || '(sin tipo)'; });
  var filas = Object.keys(porTipo).map(function (k) {
    return { etiqueta: k, total: porTipo[k].length, segmentos: conteoEstados(porTipo[k], INI_ESTADOS), clave: k };
  }).sort(function (a, b) { return b.total - a.total; });
  barrasApiladas('barrasTipo', filas, INI_ESTADOS, {
    titulo: 'Iniciativas por tipo de elemento y estado',
    alClic: function (f) { ponFiltro('tipo', F.tipo === f.clave ? '' : f.clave); }
  });
  var L = el('leyendaEstadosIni'); vaciar(L);
  INI_ESTADOS.forEach(function (def) {
    var b = h('span'); b.style.cssText = 'display:inline-flex;align-items:center;gap:6px';
    var pt = h('span', { clase: 'punto' }); pt.style.background = css(def.v);
    b.appendChild(pt);
    b.appendChild(h('span', { clase: 'glifo', 'aria-hidden': 'true' }, def.glifo));
    b.appendChild(document.createTextNode(def.k));
    L.appendChild(b);
  });
}

/* Origen: categorías NOMINALES, así que van todas del mismo tono; la
   longitud de la barra ya codifica la magnitud. */
function pintaBarrasSimples(contenedor, filas, opciones) {
  var c = el(contenedor); vaciar(c);
  if (!filas.length) { c.appendChild(estadoVacio('Nada que mostrar.')); return; }
  opciones = opciones || {};
  var etiqW = opciones.etiquetaAncho || (esTelefono() ? 104 : 168);
  var valW = 62;
  var W = esAngosto() ? Math.max(310, Math.min(ancho() - 74, 620)) : (opciones.ancho || 420);
  var alto = 22, hueco = 9;
  var H = filas.length * (alto + hueco) + 6;
  var pw = W - etiqW - valW;
  var max = Math.max.apply(null, filas.map(function (f) { return f.v; })) || 1;

  var s = sv('svg', { class: 'grafico', viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H,
    preserveAspectRatio: 'xMinYMin meet', role: 'img', 'aria-label': opciones.titulo || 'Barras' });

  filas.forEach(function (f, idx) {
    var y = idx * (alto + hueco) + 3;
    var te = sv('text', { x: etiqW - 10, y: y + alto / 2 + 4, 'text-anchor': 'end', 'font-size': esTelefono() ? 10.5 : 11.5 });
    var corto = esTelefono() ? 16 : (opciones.corto || 30);
    te.textContent = f.etiqueta.length > corto ? f.etiqueta.slice(0, corto - 1) + '…' : f.etiqueta;
    var tt = sv('title'); tt.textContent = f.etiqueta; te.appendChild(tt);
    s.appendChild(te);

    var w = Math.max(2, (f.v / max) * pw);
    var col = f.color ? css(f.color) : css('--r4');
    var r = sv('path', { d: sendaBarra(etiqW, y, w, alto, 0, 4), fill: col, class: 'marca' });
    interactiva(r, f.etiqueta, f.detalle || [{ k: opciones.unidad || 'Total', v: n0(f.v) }],
      opciones.alClic ? function () { opciones.alClic(f); } : null);
    s.appendChild(r);

    var tv = sv('text', { x: etiqW + w + 9, y: y + alto / 2 + 4, class: 'val', 'font-size': 11.5 });
    tv.textContent = f.texto || n0(f.v);
    s.appendChild(tv);
  });
  c.appendChild(s);
}

function pintaOrigen(d) {
  var por = agrupa(d.act, function (a) { return a.origen || '(sin origen)'; });
  var filas = Object.keys(por).map(function (k) {
    var lista = por[k];
    return {
      etiqueta: k, v: lista.length, clave: k,
      texto: lista.length + '  ·  ' + pc(lista.length, d.act.length) + ' %',
      detalle: [
        { k: 'Actividades', v: n0(lista.length) },
        { k: 'Cerradas', v: pc(lista.filter(function (a) { return a.estado === 'Cerrado'; }).length, lista.length) + ' %' },
        { k: 'Vencidas', v: n0(lista.filter(function (a) { return a.estado === 'Vencido'; }).length) }
      ]
    };
  }).sort(function (a, b) { return b.v - a.v; });
  pintaBarrasSimples('origen', filas, {
    titulo: 'Origen de las actividades', etiquetaAncho: esTelefono() ? 104 : 124, ancho: 380,
    alClic: function (f) { ponFiltro('origen', F.origen === f.clave ? '' : f.clave); }
  });
}

/* Antigüedad de lo vencido: tramos ORDINALES → rampa de un solo tono. */
function pintaAntiguedad(d) {
  var c = el('antiguedad'); vaciar(c);
  var venc = d.act.filter(function (a) { return a.estado === 'Vencido' && a.atraso !== null; });
  if (!venc.length) {
    var ok = h('div', { clase: 'vacio' });
    ok.appendChild(icono('reloj', 34));
    ok.appendChild(h('p', null, 'No hay actividades vencidas con los filtros actuales.'));
    c.appendChild(ok); return;
  }
  var tramos = [
    { et: '1 a 7 días', min: 0, max: 7, col: '--rr1' },
    { et: '8 a 15 días', min: 8, max: 15, col: '--rr2' },
    { et: '16 a 30 días', min: 16, max: 30, col: '--rr3' },
    { et: 'más de 30 días', min: 31, max: 1e9, col: '--rr4' }
  ];
  var filas = tramos.map(function (t) {
    var lista = venc.filter(function (a) { return a.atraso >= t.min && a.atraso <= t.max; });
    return {
      etiqueta: t.et, v: lista.length, color: t.col,
      texto: lista.length ? String(lista.length) : '0',
      detalle: [{ k: 'Actividades vencidas', v: n0(lista.length) },
                { k: 'Del total vencido', v: pc(lista.length, venc.length) + ' %' }]
    };
  });
  pintaBarrasSimples('antiguedad', filas, { titulo: 'Antigüedad del vencimiento', etiquetaAncho: 108, ancho: 360 });

  var viejas = venc.filter(function (a) { return a.atraso > 30; }).length;
  var p = h('p');
  p.style.cssText = 'font-size:11.5px;color:var(--texto-suave);margin-top:10px;line-height:1.55';
  p.textContent = viejas
    ? viejas + ' de ' + venc.length + ' actividades vencidas llevan más de un mes sin cerrarse.'
    : 'Ninguna actividad vencida supera el mes de atraso.';
  c.appendChild(p);
}

function pintaMacro(d) {
  var por = agrupa(d.ini, function (i) { return i.macro || '(sin macroproceso)'; });
  var filas = Object.keys(por).map(function (k) {
    var lista = por[k], av = medio(lista);
    return {
      etiqueta: k, v: lista.length, clave: k,
      texto: lista.length + '  ·  ' + (av === null ? 'sin avance' : n0(av) + ' % avance'),
      detalle: [
        { k: 'Iniciativas', v: n0(lista.length) },
        { k: 'Avance medio', v: av === null ? '—' : n0(av) + ' %' },
        { k: 'Con actividades', v: n0(lista.filter(function (i) { return i.nAct > 0; }).length) }
      ]
    };
  }).sort(function (a, b) { return b.v - a.v; });
  pintaBarrasSimples('macro', filas, {
    titulo: 'Iniciativas por macroproceso', etiquetaAncho: esTelefono() ? 116 : 300, corto: 36, ancho: 900,
    alClic: function (f) { ponFiltro('macro', F.macro === f.clave ? '' : f.clave); }
  });
}

/* ======================================================================
   13 · Vista Personas
   ====================================================================== */

function pintaPersonas(d) {
  var por = agrupa(d.act, function (a) { return a.resp || '(sin responsable)'; });
  var filas = Object.keys(por).map(function (k) {
    var lista = por[k];
    return {
      etiqueta: k, clave: k, total: lista.length,
      segmentos: conteoEstados(lista, ACT_ESTADOS),
      cierre: pc(lista.filter(function (a) { return a.estado === 'Cerrado'; }).length, lista.length)
    };
  }).sort(function (a, b) { return b.total - a.total; });

  /* La cola de quienes llevan una sola actividad se dobla en una fila:
     más series no aportan lectura y estiran el panel sin fin. */
  var TOPE = 16;
  if (filas.length > TOPE + 2) {
    var cola = filas.slice(TOPE);
    var suma = ACT_ESTADOS.map(function (d) { return { def: d, n: 0 }; });
    var tot = 0, cerr = 0;
    cola.forEach(function (f) {
      tot += f.total;
      f.segmentos.forEach(function (g, j) { suma[j].n += g.n; });
      cerr += Math.round(f.cierre * f.total / 100);
    });
    filas = filas.slice(0, TOPE).concat([{
      etiqueta: 'Otras ' + cola.length + ' personas', clave: null,
      total: tot, segmentos: suma, cierre: pc(cerr, tot)
    }]);
  }

  barrasApiladas('personas', filas, ACT_ESTADOS, {
    titulo: 'Carga y cumplimiento por responsable',
    valorAncho: 112,
    valor: function (f) { return f.total + '  ·  ' + f.cierre + ' % cerrado'; },
    alClic: function (f) { if (f.clave) ponFiltro('resp', F.resp === f.clave ? '' : f.clave); }
  });
  leyendaEstados('leyendaEstadosP', ACT_ESTADOS);

  var L = el('lecturaPersonas'); vaciar(L);
  if (filas.length) {
    var top = filas[0];
    var flojo = filas.filter(function (f) { return f.total >= 5; })
      .sort(function (a, b) { return a.cierre - b.cierre; })[0];
    L.appendChild(document.createTextNode('La carga más alta es de '));
    L.appendChild(h('b', null, top.etiqueta));
    L.appendChild(document.createTextNode(' con ' + top.total + ' actividades (' + top.cierre + ' % cerradas)'));
    if (flojo && flojo.etiqueta !== top.etiqueta) {
      L.appendChild(document.createTextNode('; la tasa de cierre más baja entre quienes llevan 5 o más es de '));
      L.appendChild(h('b', null, flojo.etiqueta));
      L.appendChild(document.createTextNode(' con ' + flojo.cierre + ' %.'));
    } else { L.appendChild(document.createTextNode('.')); }
  } else { L.textContent = 'Sin actividades que mostrar.'; }
}

function pintaLideres(d) {
  var c = el('lideres'); vaciar(c);
  var por = agrupa(d.ini, function (i) { return i.lider || '(sin líder)'; });
  var filas = Object.keys(por).map(function (k) {
    var lista = por[k], av = medio(lista);
    return {
      lider: k, n: lista.length, avance: av,
      sinPlan: lista.filter(function (i) { return i.nAct === 0; }).length,
      cerradas: lista.filter(function (i) { return i.etapa === 'Cerrado'; }).length,
      acts: lista.reduce(function (s, i) { return s + i.nAct; }, 0)
    };
  }).sort(function (a, b) { return b.n - a.n; });

  if (!filas.length) { c.appendChild(estadoVacio('Sin iniciativas que mostrar.')); return; }

  var t = h('table', { clase: 'datos' });
  var thead = h('thead'), tr = h('tr');
  ['Líder', 'Iniciativas', 'Actividades', 'Sin plan', 'Cerradas', 'Avance medio'].forEach(function (x, i) {
    tr.appendChild(h('th', { clase: i ? 'num' : '' }, x));
  });
  thead.appendChild(tr); t.appendChild(thead);
  var tb = h('tbody');
  filas.forEach(function (f) {
    var r = h('tr');
    r.appendChild(h('td', { clase: 'nombre', 'data-rotulo': 'Líder' }, f.lider));
    r.appendChild(h('td', { clase: 'num', 'data-rotulo': 'Iniciativas' }, n0(f.n)));
    r.appendChild(h('td', { clase: 'num', 'data-rotulo': 'Actividades' }, n0(f.acts)));
    var sp = h('td', { clase: 'num', 'data-rotulo': 'Sin plan' });
    sp.appendChild(f.sinPlan ? insignia(ACT_ESTADOS, 'Vencido') : document.createTextNode('0'));
    if (f.sinPlan) sp.lastChild.lastChild.textContent = f.sinPlan + ' sin plan';
    r.appendChild(sp);
    r.appendChild(h('td', { clase: 'num', 'data-rotulo': 'Cerradas' }, n0(f.cerradas)));
    var av = h('td', { clase: 'num', 'data-rotulo': 'Avance medio' });
    av.appendChild(barraAvance(f.avance));
    r.appendChild(av);
    r.addEventListener('click', function () { ponFiltro('lider', F.lider === f.lider ? '' : f.lider); });
    tb.appendChild(r);
  });
  t.appendChild(tb); c.appendChild(t);
}

function barraAvance(v) {
  var w = h('div', { clase: 'avance' });
  var p = h('div', { clase: 'avance-pista' });
  var s = h('span');
  s.style.width = (v === null ? 0 : Math.max(2, v)) + '%';
  s.style.background = v === null ? css('--borde-fuerte')
    : (v >= 100 ? css('--d-cerrado') : (v >= 50 ? css('--d-abierto') : css('--d-curso')));
  p.appendChild(s); w.appendChild(p);
  w.appendChild(h('span', { clase: 'avance-cifra' }, v === null ? '—' : n0(v) + '%'));
  return w;
}

/* ======================================================================
   14 · Marcas de enlace y comentario
   El clip aparece cuando el registro trae una dirección web; la campana,
   cuando trae comentario o resultado esperado. Ambos son botones reales,
   con etiqueta accesible, y abren el panel lateral en la ficha que toca.
   ====================================================================== */

function marcas(registro, tipo) {
  var enlaces = registro.enlaces || [];
  var nota = tipo === 'ini' ? registro.nota : registro.comentario;
  if (!enlaces.length && !nota) return null;

  var caja = h('span', { clase: 'marcas' });
  if (enlaces.length) {
    var be = h('button', { type: 'button', clase: 'marca-btn marca-btn--enlace',
      title: enlaces.length > 1 ? enlaces.length + ' documentos enlazados' : 'Ver el documento enlazado',
      'aria-label': 'Ver el documento enlazado' });
    be.appendChild(icono('clip', 14));
    be.addEventListener('click', function (ev) {
      ev.stopPropagation();
      tipo === 'ini' ? abreIniciativa(registro, 'docs') : abreActividad(registro, 'docs');
    });
    caja.appendChild(be);
  }
  if (nota) {
    var bn = h('button', { type: 'button', clase: 'marca-btn marca-btn--nota',
      title: tipo === 'ini' ? 'Tiene resultado esperado escrito' : 'Tiene comentario',
      'aria-label': tipo === 'ini' ? 'Ver el resultado esperado' : 'Ver el comentario' });
    bn.appendChild(icono('campana', 14));
    bn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      tipo === 'ini' ? abreIniciativa(registro, 'nota') : abreActividad(registro, 'nota');
    });
    caja.appendChild(bn);
  }
  return caja;
}

/* ======================================================================
   15 · Tablas del explorador
   ====================================================================== */

function cabeceraOrden(tr, cols, estado, alOrdenar) {
  cols.forEach(function (c) {
    var th = h('th', { clase: (c.num ? 'num ' : '') + 'orden' });
    th.appendChild(document.createTextNode(c.et));
    if (estado.col === c.k) th.appendChild(h('span', { clase: 'flecha' }, estado.desc ? '▼' : '▲'));
    th.addEventListener('click', function () {
      if (estado.col === c.k) estado.desc = !estado.desc; else { estado.col = c.k; estado.desc = !!c.descPorDefecto; }
      alOrdenar();
    });
    tr.appendChild(th);
  });
}

function ordena(arr, col, desc, valor) {
  var c = arr.slice().sort(function (a, b) {
    var x = valor(a, col), y = valor(b, col);
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    if (typeof x === 'string') return x.localeCompare(y, 'es');
    return x - y;
  });
  return desc ? c.reverse() : c;
}

function pintaTablaIniciativas(d) {
  var c = el('tablaIniciativas'); vaciar(c);
  el('cuentaExplorador').textContent = d.ini.length;
  if (!d.ini.length) { c.appendChild(estadoVacio('Ninguna iniciativa cumple los filtros actuales.')); return; }

  var cols = [
    { k: 'nombre', et: 'Iniciativa' },
    { k: 'area', et: 'Área' },
    { k: 'etapa', et: 'Estado y etapa' },
    { k: 'lider', et: 'Líder' },
    { k: 'nAct', et: 'Act.', num: true, descPorDefecto: true },
    { k: 'fin', et: 'Fin plan.', num: true },
    { k: 'avance', et: 'Avance', num: true, descPorDefecto: true }
  ];
  var valor = function (i, k) {
    if (k === 'avance') return i.avanceCalc;
    if (k === 'fin') return i.fin || null;
    return i[k];
  };

  var t = h('table', { clase: 'datos' });
  var thead = h('thead'), tr = h('tr');
  cabeceraOrden(tr, cols, ordenIni, function () { pintaTablaIniciativas(d); });
  thead.appendChild(tr); t.appendChild(thead);

  var tb = h('tbody');
  ordena(d.ini, ordenIni.col, ordenIni.desc, valor).forEach(function (i) {
    var r = h('tr', { tabindex: '0' });

    var tdN = h('td', { clase: 'nombre', 'data-rotulo': 'Iniciativa' });
    var lin = h('span');
    lin.appendChild(document.createTextNode('#' + i.id + '  ' + i.nombre));
    var m = marcas(i, 'ini'); if (m) lin.appendChild(m);
    tdN.appendChild(lin);
    tdN.appendChild(h('span', { clase: 'sec' }, i.tipo + ' · ' + i.macro));
    r.appendChild(tdN);

    r.appendChild(h('td', { 'data-rotulo': 'Área' }, i.area));
    var tdE = h('td', { 'data-rotulo': 'Estado y etapa' });
    tdE.appendChild(insignia(INI_ESTADOS, i.estado));
    tdE.appendChild(h('span', { clase: 'sec' }, i.etapa));
    r.appendChild(tdE);
    r.appendChild(h('td', { 'data-rotulo': 'Líder' }, i.lider || '—'));

    var tdA = h('td', { clase: 'num', 'data-rotulo': 'Actividades' });
    tdA.appendChild(document.createTextNode(i.nAct ? String(i.nAct) : '—'));
    if (i.nVencidas) tdA.appendChild(h('span', { clase: 'sec', style: 'color:var(--d-vencido)' }, i.nVencidas + ' vencidas'));
    r.appendChild(tdA);

    r.appendChild(h('td', { clase: 'num', 'data-rotulo': 'Fin planificado' }, fechaCorta(i.fin)));

    var tdV = h('td', { clase: 'num', 'data-rotulo': 'Avance' });
    tdV.appendChild(barraAvance(i.avanceCalc));
    r.appendChild(tdV);

    r.addEventListener('click', function () { abreIniciativa(i); });
    r.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); abreIniciativa(i); }
    });
    tb.appendChild(r);
  });
  t.appendChild(tb); c.appendChild(t);
}

function pintaTablaActividades(d) {
  var c = el('tablaActividades'); vaciar(c);
  if (!d.act.length) { c.appendChild(estadoVacio('Ninguna actividad cumple los filtros actuales.')); return; }

  var cols = [
    { k: 'nombre', et: 'Actividad' },
    { k: 'resp', et: 'Responsable' },
    { k: 'area', et: 'Área' },
    { k: 'origen', et: 'Origen' },
    { k: 'compromiso', et: 'Compromiso', num: true },
    { k: 'estado', et: 'Estado' },
    { k: 'avance', et: 'Avance', num: true, descPorDefecto: true }
  ];
  var valor = function (a, k) { return k === 'compromiso' ? (a.compromiso || null) : a[k]; };

  var t = h('table', { clase: 'datos' });
  var thead = h('thead'), tr = h('tr');
  cabeceraOrden(tr, cols, ordenAct, function () { pintaTablaActividades(d); });
  thead.appendChild(tr); t.appendChild(thead);

  var tb = h('tbody');
  var lista = ordena(d.act, ordenAct.col, ordenAct.desc, valor);
  var recorte = lista.length > 250 ? lista.slice(0, 250) : lista;
  recorte.forEach(function (a) {
    var r = h('tr', { tabindex: '0' });
    var tdN = h('td', { clase: 'nombre', 'data-rotulo': 'Actividad' });
    var lin = h('span');
    lin.appendChild(document.createTextNode(a.nombre.length > 150 ? a.nombre.slice(0, 149) + '…' : a.nombre));
    var m = marcas(a, 'act'); if (m) lin.appendChild(m);
    tdN.appendChild(lin);
    tdN.appendChild(h('span', { clase: 'sec' }, a.iniRaw));
    r.appendChild(tdN);
    r.appendChild(h('td', { 'data-rotulo': 'Responsable' }, a.resp || '—'));
    r.appendChild(h('td', { 'data-rotulo': 'Área' }, a.area));
    r.appendChild(h('td', { 'data-rotulo': 'Origen' }, a.origen));
    var tdF = h('td', { clase: 'num', 'data-rotulo': 'Compromiso' });
    tdF.appendChild(document.createTextNode(fechaCorta(a.compromiso)));
    if (a.estado === 'Vencido' && a.atraso !== null)
      tdF.appendChild(h('span', { clase: 'sec', style: 'color:var(--d-vencido)' }, '+' + a.atraso + ' d'));
    r.appendChild(tdF);
    var tdE = h('td', { 'data-rotulo': 'Estado' });
    tdE.appendChild(insignia(ACT_ESTADOS, a.estado));
    r.appendChild(tdE);
    var tdV = h('td', { clase: 'num', 'data-rotulo': 'Avance' });
    tdV.appendChild(barraAvance(a.avance));
    r.appendChild(tdV);
    r.addEventListener('click', function () { abreActividad(a); });
    r.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); abreActividad(a); } });
    tb.appendChild(r);
  });
  t.appendChild(tb); c.appendChild(t);
  if (lista.length > recorte.length) {
    var p = h('p');
    p.style.cssText = 'font-size:11.5px;color:var(--texto-suave);padding:10px 2px';
    p.textContent = 'Mostrando las primeras 250 de ' + lista.length + ' actividades. Afina los filtros para ver el resto.';
    c.appendChild(p);
  }
}

/* ======================================================================
   16 · Panel lateral: detalle, comentario y vista previa del documento
   ====================================================================== */

var cajon, velo, ultimoFoco = null;

function abreCajon(titulo, subtitulo) {
  cajon = cajon || el('cajon'); velo = velo || el('velo');
  ultimoFoco = document.activeElement;
  el('cajonTitulo').textContent = titulo;
  el('cajonSub').textContent = subtitulo || '';
  vaciar(el('cajonCuerpo'));
  cajon.setAttribute('data-abierto', ''); cajon.setAttribute('aria-hidden', 'false');
  velo.setAttribute('data-abierto', '');
  document.body.style.overflow = 'hidden';
  el('cajonCerrar').focus();
  return el('cajonCuerpo');
}
function cierraCajon() {
  if (!cajon) return;
  cajon.removeAttribute('data-abierto'); cajon.setAttribute('aria-hidden', 'true');
  velo.removeAttribute('data-abierto');
  document.body.style.overflow = '';
  vaciar(el('cajonCuerpo'));
  if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
}

function ficha(titulo, iconoNombre) {
  var f = h('section', { clase: 'ficha' });
  var t = h('h4');
  if (iconoNombre) t.appendChild(icono(iconoNombre, 13));
  t.appendChild(document.createTextNode(titulo));
  f.appendChild(t);
  return f;
}
function pares(lista) {
  var dl = h('dl', { clase: 'datos-par' });
  lista.forEach(function (p) {
    if (p[1] === null || p[1] === undefined || p[1] === '') return;
    var w = h('div');
    w.appendChild(h('dt', null, p[0]));
    var dd = h('dd');
    if (typeof p[1] === 'string' || typeof p[1] === 'number') dd.textContent = p[1];
    else dd.appendChild(p[1]);
    w.appendChild(dd); dl.appendChild(w);
  });
  return dl;
}

/* ---------- Conversión a dirección incrustable ----------
   Cada servicio tiene su propia forma de permitir la vista previa dentro de
   un marco. Cuando no se reconoce, se intenta tal cual y si el sitio la
   rechaza cae sola a la tarjeta con los datos del enlace. */
function urlIncrustable(u) {
  try {
    var x = new URL(u);
    var host = x.hostname.toLowerCase();
    if (host.indexOf('sharepoint.com') >= 0 || host.indexOf('1drv.ms') >= 0 || host.indexOf('onedrive.live.com') >= 0) {
      x.searchParams.set('action', 'embedview');
      return x.toString();
    }
    if (host.indexOf('drive.google.com') >= 0) {
      var m = u.match(/\/d\/([^/]+)/);
      if (m) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    }
    if (host.indexOf('docs.google.com') >= 0) return u.replace(/\/(edit|view)(\?|#|$).*/, '/preview');
    if (host.indexOf('youtube.com') >= 0 || host.indexOf('youtu.be') >= 0) {
      var v = host.indexOf('youtu.be') >= 0 ? x.pathname.slice(1) : x.searchParams.get('v');
      if (v) return 'https://www.youtube-nocookie.com/embed/' + v;
    }
    if (/\.(docx?|xlsx?|pptx?)($|\?)/i.test(x.pathname))
      return 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(u);
    return u;
  } catch (e) { return u; }
}

/* Los enlaces de SharePoint traen un identificador ilegible en la ruta; en su
   lugar se nombra el documento por su tipo y el sitio del que viene. */
var TIPO_SP = { ':b:': 'Documento', ':w:': 'Documento de Word', ':x:': 'Hoja de Excel',
  ':p:': 'Presentación', ':f:': 'Carpeta', ':i:': 'Imagen', ':v:': 'Video', ':o:': 'Bloc de notas' };

function nombreDocumento(u) {
  try {
    var x = new URL(u);
    var partes = x.pathname.split('/').filter(Boolean);
    if (x.hostname.indexOf('sharepoint.com') >= 0) {
      var tipo = TIPO_SP[partes[0]] || 'Archivo';
      var iSitio = partes.indexOf('s');
      var sitio = iSitio >= 0 && partes[iSitio + 1] ? decodeURIComponent(partes[iSitio + 1]) : '';
      return sitio ? tipo + ' · ' + sitio : tipo + ' de SharePoint';
    }
    var ult = decodeURIComponent(partes[partes.length - 1] || x.hostname);
    ult = ult.replace(/[?#].*$/, '');
    if (!ult || ult.length > 60 || /^[A-Za-z0-9_-]{24,}$/.test(ult)) return x.hostname;
    return ult;
  } catch (e) { return u; }
}
function hostDe(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

function visorDocumento(u) {
  var caja = h('div', { clase: 'doc' });

  var cab = h('div', { clase: 'doc-cab' });
  var ic = h('div', { clase: 'doc-icono' }); ic.appendChild(icono('doc', 17));
  cab.appendChild(ic);
  var tit = h('div', { clase: 'doc-tit' });
  tit.appendChild(h('b', null, nombreDocumento(u)));
  tit.appendChild(h('span', null, hostDe(u)));
  cab.appendChild(tit);
  caja.appendChild(cab);

  var marco = h('div', { clase: 'doc-marco' });
  var iframe = h('iframe', {
    src: urlIncrustable(u), loading: 'lazy', title: 'Vista previa de ' + nombreDocumento(u),
    referrerpolicy: 'no-referrer',
    sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-downloads'
  });
  var espera = h('div', { clase: 'doc-espera' });
  espera.appendChild(h('div', { clase: 'girando' }));
  espera.appendChild(h('p', { style: 'font-size:12px;color:var(--texto-suave)' }, 'Cargando la vista previa…'));

  marco.appendChild(iframe); marco.appendChild(espera);
  caja.appendChild(marco);

  var listo = false;
  iframe.addEventListener('load', function () { listo = true; espera.remove(); });
  /* Si el sitio no permite incrustarse, el marco se queda en blanco y no
     avisa. A los 6 segundos se cambia por la tarjeta de datos del enlace. */
  setTimeout(function () {
    if (listo) return;
    espera.remove(); iframe.remove();
    var caido = h('div', { clase: 'doc-caido' });
    caido.appendChild(icono('aviso', 26));
    caido.appendChild(h('p', null,
      'Este sitio no permite mostrarse dentro del tablero. Ábrelo en una pestaña nueva; si te pide iniciar sesión, usa tu cuenta de Plásticos Carmen.'));
    marco.appendChild(caido);
    marco.style.height = '190px';
  }, 6000);

  var pie = h('div', { clase: 'doc-pie' });
  var abrir = h('a', { clase: 'btn btn--primario btn--sm', href: u, target: '_blank', rel: 'noopener' });
  abrir.appendChild(document.createTextNode('Abrir en pestaña nueva '));
  abrir.appendChild(icono('fuera', 13));
  pie.appendChild(abrir);
  var copiar = h('button', { type: 'button', clase: 'btn btn--fantasma btn--sm' }, 'Copiar enlace');
  copiar.addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { copiar.textContent = 'Copiado'; });
  });
  pie.appendChild(copiar);
  var aviso = h('span');
  aviso.style.cssText = 'font-size:11px;color:var(--texto-suave);line-height:1.5;flex:1 0 100%;padding-top:2px';
  aviso.textContent = '¿No se ve nada arriba? Algunos sitios no permiten mostrarse dentro de otra página, ' +
    'o piden iniciar sesión primero. Ábrelo en una pestaña nueva con tu cuenta de Plásticos Carmen.';
  pie.appendChild(aviso);
  caja.appendChild(pie);
  return caja;
}

function bloqueDocs(enlaces, vacio) {
  var f = ficha(enlaces.length > 1 ? 'Documentos enlazados (' + enlaces.length + ')' : 'Documento enlazado', 'clip');
  if (!enlaces.length) {
    f.appendChild(h('p', { style: 'font-size:12.5px;color:var(--texto-suave);line-height:1.6' }, vacio));
    return f;
  }
  enlaces.forEach(function (u) {
    var w = h('div'); w.style.marginBottom = '12px';
    w.appendChild(visorDocumento(u));
    f.appendChild(w);
  });
  return f;
}

function abreIniciativa(i, foco) {
  var cuerpo = abreCajon(i.nombre, 'Iniciativa #' + i.id + ' · ' + i.pilar);

  var fResumen = ficha('Resumen');
  var cab = h('div');
  cab.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px';
  cab.appendChild(insignia(INI_ESTADOS, i.estado));
  cab.appendChild(h('span', { clase: 'insignia insignia--abierto' }, i.etapa));
  if (i.prio) cab.appendChild(h('span', { clase: 'insignia insignia--' + (i.prio === 'Alta' ? 'curso' : 'abierto') }, 'Prioridad ' + i.prio));
  fResumen.appendChild(cab);
  fResumen.appendChild(barraAvance(i.avanceCalc));
  fResumen.appendChild(pares([
    ['Área impactada', i.area], ['Macroproceso', i.macro], ['Tipo de elemento', i.tipo],
    ['Responsable líder', i.lider], ['Equipo', i.equipo], ['Complejidad', i.compl],
    ['Impacto', i.impacto], ['Inicio planificado', fechaLarga(i.ini)],
    ['Fin planificado', fechaLarga(i.fin)],
    ['Actividades', i.nAct ? i.nAct + ' · ' + i.nCerradas + ' cerradas · ' + i.nVencidas + ' vencidas' : 'sin actividades definidas'],
    ['Requiere capacitación', i.cap ? 'Sí' : 'No'], ['Impacto económico', i.eco ? 'Sí' : 'No'],
    ['Registró', i.registro], ['Creado', fechaLarga(i.creado)]
  ]));
  cuerpo.appendChild(fResumen);

  var fNota = ficha('Resultado esperado', 'campana');
  if (i.nota) fNota.appendChild(h('p', { clase: 'nota' }, i.nota));
  else fNota.appendChild(h('p', { style: 'font-size:12.5px;color:var(--texto-suave)' }, 'Sin resultado esperado escrito en el Portafolio.'));
  cuerpo.appendChild(fNota);

  cuerpo.appendChild(bloqueDocs(i.enlaces, 'Esta iniciativa no tiene ninguna dirección web registrada.'));

  if (i.acts.length) {
    var fAct = ficha('Actividades (' + i.acts.length + ')', 'doc');
    i.acts.slice().sort(function (a, b) { return (a.compromiso || '9') < (b.compromiso || '9') ? -1 : 1; })
      .forEach(function (a) {
        var it = h('button', { type: 'button' });
        it.style.cssText = 'display:block;width:100%;text-align:left;border:1px solid var(--borde);' +
          'border-radius:10px;padding:10px 12px;margin-bottom:7px;background:var(--papel);cursor:pointer;font-family:inherit';
        var top = h('div');
        top.style.cssText = 'display:flex;gap:8px;align-items:flex-start;justify-content:space-between';
        var nm = h('span', { style: 'font-size:12.5px;font-weight:600;color:var(--tinta);line-height:1.4' },
          a.nombre.length > 110 ? a.nombre.slice(0, 109) + '…' : a.nombre);
        top.appendChild(nm);
        var mm = marcas(a, 'act'); if (mm) top.appendChild(mm);
        it.appendChild(top);
        var sub = h('div', { style: 'display:flex;gap:8px;align-items:center;margin-top:7px;flex-wrap:wrap' });
        sub.appendChild(insignia(ACT_ESTADOS, a.estado));
        sub.appendChild(h('span', { style: 'font-size:11.5px;color:var(--texto-suave)' },
          (a.resp || 'sin responsable') + ' · ' + fechaCorta(a.compromiso)));
        it.appendChild(sub);
        it.addEventListener('click', function () { abreActividad(a); });
        fAct.appendChild(it);
      });
    cuerpo.appendChild(fAct);
  }

  if (foco === 'docs' || foco === 'nota') {
    var destino = foco === 'docs' ? cuerpo.children[2] : cuerpo.children[1];
    if (destino) destino.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

function abreActividad(a, foco) {
  var cuerpo = abreCajon(a.nombre, 'Actividad #' + a.id + ' · ' + a.iniRaw);

  var f = ficha('Resumen');
  var cab = h('div');
  cab.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px';
  cab.appendChild(insignia(ACT_ESTADOS, a.estado));
  cab.appendChild(h('span', { clase: 'insignia insignia--' + (a.prio === 'Alta' ? 'curso' : 'abierto') }, 'Prioridad ' + a.prio));
  if (a.estado === 'Vencido' && a.atraso !== null)
    cab.appendChild(h('span', { clase: 'insignia insignia--vencido' }, a.atraso + ' días de atraso'));
  f.appendChild(cab);
  f.appendChild(barraAvance(a.avance));
  f.appendChild(pares([
    ['Responsable', a.resp], ['Área', a.area], ['Origen', a.origen],
    ['Fecha de compromiso', fechaLarga(a.compromiso)],
    ['Registró', a.registro], ['Creado', fechaLarga(a.creado)]
  ]));
  cuerpo.appendChild(f);

  var fc = ficha('Comentario', 'campana');
  if (a.comentario) fc.appendChild(h('p', { clase: 'nota' }, a.comentario));
  else fc.appendChild(h('p', { style: 'font-size:12.5px;color:var(--texto-suave)' }, 'Esta actividad no tiene comentarios.'));
  cuerpo.appendChild(fc);

  cuerpo.appendChild(bloqueDocs(a.enlaces, 'Esta actividad no tiene ninguna dirección web registrada.'));

  var ini = D.ini.filter(function (i) { return i.id === a.iniId; })[0];
  if (ini) {
    var fi = ficha('Iniciativa');
    var b = h('button', { type: 'button', clase: 'btn btn--fantasma btn--sm' }, ini.nombre);
    b.style.cssText += ';white-space:normal;text-align:left;line-height:1.4';
    b.addEventListener('click', function () { abreIniciativa(ini); });
    fi.appendChild(b);
    cuerpo.appendChild(fi);
  }

  if (foco === 'docs') { var dd = cuerpo.children[2]; if (dd) dd.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  if (foco === 'nota') { var nn = cuerpo.children[1]; if (nn) nn.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
}

/* ======================================================================
   17 · Filtros, vistas y orquestación
   ====================================================================== */

function opciones(sel, valores, etiqueta) {
  var s = el(sel); vaciar(s);
  s.appendChild(h('option', { value: '' }, 'Todas · ' + etiqueta));
  valores.forEach(function (v) { s.appendChild(h('option', { value: v }, v)); });
}

function distintos(arr, campo) {
  var m = {};
  arr.forEach(function (x) { if (x[campo]) m[x[campo]] = 1; });
  return Object.keys(m).sort(function (a, b) { return a.localeCompare(b, 'es'); });
}

function montaFiltros() {
  opciones('f-area', distintos(D.ini, 'area'), 'las áreas');
  opciones('f-macro', distintos(D.ini, 'macro'), 'los macroprocesos');
  opciones('f-etapa', ETAPAS.filter(function (e) { return distintos(D.ini, 'etapa').indexOf(e) >= 0; }), 'las etapas');
  opciones('f-prio', ['Alta', 'Media', 'Baja'], 'las prioridades');
  opciones('f-lider', distintos(D.ini, 'lider'), 'los líderes');

  [['f-area', 'area'], ['f-macro', 'macro'], ['f-etapa', 'etapa'], ['f-prio', 'prio'], ['f-lider', 'lider']]
    .forEach(function (p) {
      el(p[0]).addEventListener('change', function () { F[p[1]] = this.value; pinta(); });
    });

  var t = null;
  el('f-texto').addEventListener('input', function () {
    var v = this.value;
    clearTimeout(t);
    t = setTimeout(function () { F.texto = v.trim(); pinta(); }, 220);
  });
  el('btnLimpiar').addEventListener('click', function () {
    for (var k in F) F[k] = '';
    sincronizaControles(); pinta();
  });
}

function sincronizaControles() {
  el('f-area').value = F.area; el('f-macro').value = F.macro; el('f-etapa').value = F.etapa;
  el('f-prio').value = F.prio; el('f-lider').value = F.lider; el('f-texto').value = F.texto;
}

function ponFiltro(k, v) { F[k] = v; sincronizaControles(); pinta(); }

/* El resumen plegado avisa cuántos filtros hay puestos. */
function marcaFiltrosActivos() {
  var n = Object.keys(F).filter(function (k) { return F[k]; }).length;
  var c = el('cuentaFiltros');
  if (!c) return;
  c.textContent = String(n);
  c.hidden = n === 0;
}

function pintaCintillo(d) {
  marcaFiltrosActivos();
  var c = el('cintillo'); vaciar(c);
  var activos = Object.keys(F).filter(function (k) { return F[k]; });
  c.appendChild(h('span', null,
    d.ini.length + ' de ' + D.ini.length + ' iniciativas · ' + d.act.length + ' de ' + D.act.length + ' actividades'));
  activos.forEach(function (k) {
    if (k === 'texto') return;
    var chip = h('span', { clase: 'chip' });
    chip.appendChild(document.createTextNode(ETIQ_F[k] + ': ' + F[k]));
    var b = h('button', { type: 'button', 'aria-label': 'Quitar el filtro ' + ETIQ_F[k] }, '×');
    b.addEventListener('click', function () { ponFiltro(k, ''); });
    chip.appendChild(b);
    c.appendChild(chip);
  });
  if (F.texto) {
    var chipT = h('span', { clase: 'chip' });
    chipT.appendChild(document.createTextNode('Texto: “' + F.texto + '”'));
    var bt = h('button', { type: 'button', 'aria-label': 'Quitar la búsqueda' }, '×');
    bt.addEventListener('click', function () { ponFiltro('texto', ''); });
    chipT.appendChild(bt);
    c.appendChild(chipT);
  }
}

function cambiaVista(v) {
  VISTA = v;
  ['directorio', 'gerencial', 'personas', 'explorador'].forEach(function (x) {
    var tab = el('tab-' + x), panel = el('v-' + x);
    tab.setAttribute('aria-selected', x === v ? 'true' : 'false');
    panel.hidden = x !== v;
  });
  try { localStorage.setItem('pc-portafolio-vista', v); } catch (e) {}
  pinta();
}

var pintando = false;
function pinta() {
  if (pintando) return;
  pintando = true;
  var d = filtra();
  pintaCintillo(d);
  el('cuentaExplorador').textContent = d.ini.length;

  if (VISTA === 'directorio') {
    pintaKpisDirectorio(d); pintaEmbudo(d); pintaSalud(d);
    pintaCurvaS(d); pintaCalor(d); pintaDispersion(d);
  } else if (VISTA === 'gerencial') {
    pintaKpisGerencial(d); pintaBarrasArea(d); pintaOrigen(d);
    pintaBarrasTipo(d); pintaAntiguedad(d); pintaMacro(d);
  } else if (VISTA === 'personas') {
    pintaKpisPersonas(d); pintaPersonas(d); pintaLideres(d);
  } else {
    pintaTablaIniciativas(d); pintaTablaActividades(d);
  }
  pintando = false;
}

/* ======================================================================
   19 · Tema y arranque
   ====================================================================== */

function montaTema() {
  var raiz = document.documentElement;
  el('btnTema').addEventListener('click', function () {
    var orden = ['sistema', 'claro', 'oscuro'];
    var actual = raiz.dataset.temaPref || 'sistema';
    var sig = orden[(orden.indexOf(actual) + 1) % 3];
    raiz.dataset.temaPref = sig;
    try { localStorage.setItem('pc-tema', sig); } catch (e) {}
    var oscuro = sig === 'oscuro' ||
      (sig === 'sistema' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    raiz.dataset.tema = oscuro ? 'oscuro' : 'claro';
    pinta();   /* los gráficos leen los colores del tema, hay que repintarlos */
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var alCambiar = function () {
      if ((raiz.dataset.temaPref || 'sistema') !== 'sistema') return;
      raiz.dataset.tema = mq.matches ? 'oscuro' : 'claro';
      pinta();
    };
    if (mq.addEventListener) mq.addEventListener('change', alCambiar);
    else if (mq.addListener) mq.addListener(alCambiar);
  }
}

/* Los datos llegan del servidor, no de un archivo incrustado: el lector de
   los export del Portafolio vive en PHP y esta pantalla sólo los dibuja. */
function pideDatos() {
  var url = (window.PC_TABLERO && window.PC_TABLERO.datos) || 'tablero/datos';
  return fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('El servidor respondió ' + r.status);
      return r.json();
    });
}

function arrancaCon(datos) {
  prepara(datos);
  el('pieFuente').textContent = datos.fuente || '';
  montaFiltros();
  montaTema();

  /* En pantallas anchas los filtros van siempre desplegados. */
  var caja = el('cajaFiltros');
  if (caja) {
    var ajusta = function () { if (window.innerWidth >= 980) caja.open = true; };
    ajusta();
    window.addEventListener('resize', ajusta);
  }

  document.querySelectorAll('.vistas button').forEach(function (b) {
    b.addEventListener('click', function () { cambiaVista(b.dataset.vista); });
  });
  try {
    var v = localStorage.getItem('pc-portafolio-vista');
    if (v && el('v-' + v)) VISTA = v;
  } catch (e) {}
  cambiaVista(VISTA);

  el('cajonCerrar').addEventListener('click', cierraCajon);
  el('velo').addEventListener('click', cierraCajon);
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') cierraCajon();
    if (ev.key === '/' && document.activeElement.tagName !== 'INPUT') { ev.preventDefault(); el('f-texto').focus(); }
  });

  var r = null;
  window.addEventListener('resize', function () { clearTimeout(r); r = setTimeout(pinta, 180); });
}

function arranca() {
  var espera = el('cargando');

  pideDatos().then(function (datos) {
    if (espera) espera.remove();
    arrancaCon(datos);
  }).catch(function (e) {
    if (espera) espera.remove();
    var aviso = estadoVacio('No se pudieron cargar los datos del Portafolio: ' + e.message);
    var destino = el('v-directorio') || document.body;
    destino.appendChild(aviso);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca);
else arranca();

})();
