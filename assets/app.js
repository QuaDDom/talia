/* TALIA · Pasión x la Bici: catalogue, size guide, service booking, live opening hours and motion. */
const WHATSAPP = "5493731538155";
const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const capture = params.has("captura");
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const HI = "Hola, te escribo desde la web.";

for (const a of document.querySelectorAll("[data-wa]")) a.href = wa(a.dataset.wa);

const press = (all, on) => all.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
function chipRow(host, list, onPick) {
  return list.map((item, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = item.nombre;
    b.addEventListener("click", () => onPick(i));
    host.append(b);
    return b;
  });
}

let fades = new WeakMap();
function setMessage(el, text) {
  if (el.textContent === text) return;
  if (!el.textContent || capture || calm) { el.textContent = text; return; }
  el.classList.add("is-changing");
  clearTimeout(fades.get(el));
  fades.set(el, setTimeout(() => { el.textContent = text; el.classList.remove("is-changing"); }, 180));
}

/* ---------- Opening hours (Argentina time) ---------- */
// Monday to Friday 16:30 to 20:30, Saturday 9 to 13, Sunday closed. From the shop's posts, October 2026.
const HORARIO = { 0: null, 1: [990, 1230], 2: [990, 1230], 3: [990, 1230], 4: [990, 1230], 5: [990, 1230], 6: [540, 780] };
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
function nowInArgentina() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), min: Number(get("hour")) * 60 + Number(get("minute")) };
}
function renderOpen() {
  const { day, min } = nowInArgentina();
  const today = HORARIO[day];
  const box = $("open-now");
  let text;
  if (today && min >= today[0] && min < today[1]) {
    text = `Abierto ahora · cierra a las ${hhmm(today[1])}`;
    box.classList.add("is-open");
  } else {
    box.classList.remove("is-open");
    if (today && min < today[0]) text = `Cerrado · abre hoy a las ${hhmm(today[0])}`;
    else {
      let d = (day + 1) % 7;
      while (!HORARIO[d]) d = (d + 1) % 7;
      text = `Cerrado · abre ${d === (day + 1) % 7 ? "mañana" : "el " + DIAS[d]} a las ${hhmm(HORARIO[d][0])}`;
    }
  }
  box.querySelector("span").textContent = text;
  for (const li of document.querySelectorAll(".hours li")) li.classList.toggle("is-today", li.dataset.days.split(",").includes(String(day)));
}
renderOpen();
setInterval(renderOpen, 60000);

/* ---------- Size guide ---------- */
// Approximate mountain bike frame sizes by rider height. The shop confirms it in person.
const TALLES = [
  { talle: "XS", hasta: 159, rango: "Hasta 1,59" },
  { talle: "S", hasta: 169, rango: "1,60 — 1,69" },
  { talle: "M", hasta: 177, rango: "1,70 — 1,77" },
  { talle: "L", hasta: 185, rango: "1,78 — 1,85" },
  { talle: "XL", hasta: 999, rango: "1,86 o más" },
];
const metros = (cm) => (cm / 100).toFixed(2).replace(".", ",");
const range = $("s-range");
const scale = $("s-scale");
for (const t of TALLES) scale.insertAdjacentHTML("beforeend", `<li><b>${t.talle}</b><span>${t.rango}</span></li>`);
let alturaElegida = false;
const sizeFor = (cm) => TALLES.find((t) => cm <= t.hasta);
function renderSize() {
  const cm = Number(range.value);
  const t = sizeFor(cm);
  $("s-size").textContent = t.talle;
  $("s-out").textContent = `${metros(cm)} m`;
  range.style.setProperty("--fill", `${((cm - range.min) / (range.max - range.min)) * 100}%`);
  [...scale.children].forEach((li, i) => li.classList.toggle("is-on", TALLES[i] === t));
  $("s-enviar").href = wa(`${HI} Mido ${metros(cm)} m y busco una bici de montaña. Según la guía me queda talle ${t.talle}. ¿Me ayudan a confirmarlo?`);
  renderBikes();
}
range.addEventListener("input", () => { alturaElegida = true; renderSize(); });

/* ---------- Bikes ---------- */
// Models and specs from the shop's posts (October and November 2026). Prices go by WhatsApp: they change with each promotion.
const BICIS = [
  {
    marca: "Specialized", nombre: "Chisel", tipo: "montana", tag: "Montaña · XC",
    desc: "Doble suspensión para cross country. Liviana y rápida.",
    specs: [["Suspensión", "Doble"], ["Uso", "Cross country"]],
    img: "chisel.jpg", w: 512, h: 520, tone: "#060606", dark: true,
  },
  {
    marca: "Specialized", nombre: "Epic 8 Comp", tipo: "montana", tag: "Montaña · XC",
    desc: "Doble suspensión de cross country, con transmisión inalámbrica.",
    specs: [["Transmisión", "SRAM S-1000 AXS"], ["Horquilla", "RockShox Select+"]],
    img: "epic-8-comp.jpg", w: 509, h: 275, tone: "linear-gradient(#efe9e9, #ded9d6)",
  },
  {
    marca: "Specialized", nombre: "Riprock 20", tipo: "ninos", tag: "Niños · Rodado 20",
    desc: "Bici de montaña para chicos, con frenos y cambios de verdad.",
    specs: [["Transmisión", "microSHIFT 8 vel."], ["Frenos", "Disco hidráulico"], ["Cuadro", "Aluminio A1"]],
    img: "riprock-20.jpg", w: 509, h: 267, tone: "linear-gradient(#f1e8ef, #f5ecf1)",
  },
];
const grid = $("bike-grid");
const bikeLinks = [];
BICIS.forEach((b, i) => {
  const card = document.createElement("article");
  card.className = "bike";
  card.dataset.tipo = b.tipo;
  card.setAttribute("data-reveal", "");
  card.innerHTML = `
    <div class="bike-photo${b.dark ? " cover dark" : ""}" style="--tone:${b.tone}">
      <span class="bike-tag">${b.tag}</span>
      <img src="assets/fotos/${b.img}" alt="${b.marca} ${b.nombre}" width="${b.w}" height="${b.h}" loading="lazy">
    </div>
    <div class="bike-body">
      <p class="bike-brand">${b.marca}</p>
      <h3>${b.nombre}</h3>
      <p class="bike-desc">${b.desc}</p>
      <dl class="specs">${b.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <a class="btn btn-ink" target="_blank" rel="noopener"><span>Consultar</span></a>
    </div>`;
  bikeLinks[i] = card.querySelector("a");
  grid.append(card);
});
// Last card: everything else in the shop.
grid.insertAdjacentHTML("beforeend", `
  <article class="bike bike-more" data-tipo="todas" data-reveal>
    <div class="bike-photo cover"><img src="assets/fotos/interior-2.jpg" alt="Bicis, cascos e indumentaria en el local" width="1100" height="1466" loading="lazy"></div>
    <div class="bike-body">
      <p class="bike-brand">En el local</p>
      <h3>Y muchas más</h3>
      <p class="bike-desc">Bicis importadas y nacionales, indumentaria, cascos, accesorios y repuestos.</p>
      <a class="btn btn-signal" target="_blank" rel="noopener" href="${wa(`${HI} Estoy buscando una bici. ¿Qué tienen disponible?`)}"><span>Contanos qué buscás</span></a>
    </div>
  </article>`);

function renderBikes() {
  const cm = Number(range.value);
  const talle = alturaElegida ? ` Mido ${metros(cm)} m (talle ${sizeFor(cm).talle} según la guía).` : "";
  BICIS.forEach((b, i) => {
    const kid = b.tipo === "ninos" ? "" : talle;
    bikeLinks[i].href = wa(`${HI} Me interesa la ${b.marca} ${b.nombre}.${kid} ¿Está disponible? ¿Me pasan precio y cuotas?`);
  });
}

const filterBtns = [...document.querySelectorAll("[data-filter]")];
for (const btn of filterBtns)
  btn.addEventListener("click", () => {
    press(filterBtns, btn);
    const f = btn.dataset.filter;
    for (const card of grid.children) card.classList.toggle("is-out", f !== "todas" && card.dataset.tipo !== f && card.dataset.tipo !== "todas");
  });

/* ---------- Service booking ---------- */
// Example services: the shop sets its own list.
const SERVICIOS = [
  { nombre: "Service general", texto: "un service general" },
  { nombre: "Desarmado completo", texto: "un servicio desarmado completo" },
  { nombre: "Suspensión RockShox", texto: "el service de la suspensión RockShox" },
  { nombre: "Frenos y cambios", texto: "un ajuste de frenos y cambios" },
  { nombre: "Otro arreglo", texto: "un arreglo" },
];
const TIPOS = [
  { nombre: "Montaña", texto: "mi bici de montaña" },
  { nombre: "Ruta", texto: "mi bici de ruta" },
  { nombre: "Urbana", texto: "mi bici urbana" },
  { nombre: "Niños", texto: "una bici de niños" },
];
const DIAS_TURNO = [1, 2, 3, 4, 5, 6].map((d) => ({ dia: d, nombre: DIAS[d].slice(0, 3).replace(/^./, (c) => c.toUpperCase()) }));
const booking = { servicio: 0, tipo: 0, dia: 0 };
const servChips = chipRow($("b-servicio"), SERVICIOS, (i) => { booking.servicio = i; renderBooking(); });
const tipoChips = chipRow($("b-bici"), TIPOS, (i) => { booking.tipo = i; renderBooking(); });
const diaChips = chipRow($("b-dia"), DIAS_TURNO, (i) => { booking.dia = i; renderBooking(); });
function renderBooking() {
  press(servChips, servChips[booking.servicio]);
  press(tipoChips, tipoChips[booking.tipo]);
  press(diaChips, diaChips[booking.dia]);
  const d = DIAS_TURNO[booking.dia].dia;
  const [from, to] = HORARIO[d];
  $("b-horario").textContent = `El ${DIAS[d]} atendemos de ${hhmm(from)} a ${hhmm(to)}.`;
  const text = `${HI} Quiero agendar ${SERVICIOS[booking.servicio].texto} para ${TIPOS[booking.tipo].texto}. ¿Tienen turno el ${DIAS[d]}?`;
  setMessage($("b-preview"), text);
  $("b-enviar").href = wa(text);
}

/* ---------- Prefill from the address, for the images sent to the client ----------
   ?altura=174&servicio=1&tipo=0&dia=3&filtro=montana */
const num = (key, max, fallback) => {
  const v = Number(params.get(key));
  return params.has(key) && Number.isInteger(v) && v >= 0 && v < max ? v : fallback;
};
if (params.has("altura")) {
  const cm = Number(params.get("altura"));
  if (cm >= Number(range.min) && cm <= Number(range.max)) { range.value = cm; alturaElegida = true; }
}
// The next opening day is picked by default.
const { day: today } = nowInArgentina();
const nextDay = DIAS_TURNO.findIndex((d) => d.dia >= (today === 0 ? 1 : today));
booking.servicio = num("servicio", SERVICIOS.length, 0);
booking.tipo = num("tipo", TIPOS.length, 0);
booking.dia = num("dia", DIAS_TURNO.length, nextDay < 0 ? 0 : nextDay);
renderSize();
renderBooking();
if (params.get("filtro")) filterBtns.find((b) => b.dataset.filter === params.get("filtro"))?.click();

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!capture && !calm && window.Lenis) {
  lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
const headerH = () => document.querySelector(".header").offsetHeight;
function scrollToEl(el) {
  const down = el.getBoundingClientRect().top > 0;
  if (lenis) lenis.scrollTo(el, { offset: down ? 0 : -headerH() + 1, duration: 1.6 });
  else el.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
}
for (const a of document.querySelectorAll('a[href^="#"]')) {
  a.addEventListener("click", (e) => {
    const el = document.querySelector(a.getAttribute("href"));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
  });
}

/* ---------- Header: hides going down, comes back going up ---------- */
const header = document.querySelector(".header");
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 10);
  header.classList.toggle("is-hidden", y > 400 && y > lastY && !document.documentElement.classList.contains("menu-open"));
  lastY = y;
  parallax();
  sideways();
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector(".menu-toggle");
function closeMenu() {
  document.documentElement.classList.remove("menu-open");
  toggle.setAttribute("aria-expanded", "false");
  lenis?.start();
}
toggle.addEventListener("click", () => {
  const open = !document.documentElement.classList.contains("menu-open");
  document.documentElement.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  if (open) lenis?.stop(); else lenis?.start();
});
addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

/* ---------- Gallery: vertical scroll moves it sideways on desktop ---------- */
const gallery = $("galeria");
const track = $("gallery-track");
const wide = matchMedia("(min-width: 901px)");
function sizeGallery() {
  if (!wide.matches || capture || calm) { gallery.style.height = ""; track.style.transform = ""; return; }
  gallery.style.height = `${track.scrollWidth - innerWidth + innerHeight}px`;
  sideways();
}
function sideways() {
  if (!wide.matches || capture || calm) return;
  const r = gallery.getBoundingClientRect();
  const travel = gallery.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / travel));
  track.style.transform = `translate3d(${(-p * (track.scrollWidth - innerWidth)).toFixed(1)}px,0,0)`;
}
addEventListener("resize", sizeGallery);
wide.addEventListener?.("change", sizeGallery);
addEventListener("load", sizeGallery);
sizeGallery();

/* ---------- Reveals, parallax and counters ---------- */
const parallaxImgs = [...document.querySelectorAll("[data-parallax]")];
function parallax() {
  if (capture || calm) return;
  const vh = innerHeight;
  for (const img of parallaxImgs) {
    if (!img.dataset.ready) continue;
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    const shift = (r.top + r.height / 2 - vh / 2) * Number(img.dataset.parallax);
    img.style.transform = `translateY(${shift.toFixed(1)}px) scale(1.1)`;
  }
}
for (const img of parallaxImgs)
  img.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform" || img.dataset.ready) return;
    img.dataset.ready = "1";
    img.style.transition = "none";
    parallax();
  });

function countUp(el) {
  const end = Number(el.dataset.count);
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / 1600);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function startReveals() {
  if (startReveals.done) return;
  startReveals.done = true;
  const items = [...document.querySelectorAll("[data-reveal], .split")];
  if (capture || calm || !("IntersectionObserver" in window)) {
    for (const el of items) el.classList.add("is-in");
    return;
  }
  // A photo frame starts fully clipped, and the browser never reports a fully clipped element as visible.
  // So frames are revealed when their parent enters instead.
  const viaParent = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      // Also what a fast scroll or a menu jump has already left above the screen.
      if (!entry.isIntersecting && entry.boundingClientRect.top > 0) continue;
      for (const el of viaParent.get(entry.target) || [entry.target]) {
        el.classList.add("is-in");
        const counter = el.querySelector("[data-count]");
        if (counter) countUp(counter);
      }
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  // Siblings that enter together come in one after another.
  for (const el of items) {
    if (el.hasAttribute("data-reveal") && !el.style.getPropertyValue("--d")) {
      const peers = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      el.style.setProperty("--d", `${Math.min(peers.indexOf(el), 6) * 0.08}s`);
    }
    if (el.dataset.reveal === "img") {
      const parent = el.parentElement;
      if (!viaParent.has(parent)) viaParent.set(parent, []);
      viaParent.get(parent).push(el);
      io.observe(parent);
    } else io.observe(el);
  }
}

/* ---------- Intro ---------- */
const reveal = () => requestAnimationFrame(() => {
  document.documentElement.classList.add("is-loaded");
  setTimeout(startReveals, 400);
});
if (capture || calm) { document.querySelector(".intro")?.remove(); document.documentElement.classList.add("is-loaded"); startReveals(); }
else if (document.readyState === "complete") setTimeout(reveal, 900);
else addEventListener("load", () => setTimeout(reveal, 700));
// Never leave a visitor behind the curtain if a photo is slow.
setTimeout(reveal, 2800);

/* ---------- ?captura: the page as it goes in the images sent to the client ---------- */
if (capture) {
  document.documentElement.classList.add("captura");
  document.querySelector(".demo-bar")?.remove();
  for (const img of document.querySelectorAll('img[loading="lazy"]')) img.loading = "eager";
  document.querySelector(".map iframe")?.setAttribute("loading", "eager");
  const mark = document.createElement("p");
  mark.className = "captura-mark";
  mark.textContent = "Propuesta de diseño · Mateo Quadrelli";
  document.body.append(mark);
  // &desde=ID shows the page from that element, right under the header, by hiding what comes before it.
  const target = params.get("desde") && $(params.get("desde"));
  if (target) {
    for (let el = target; el.parentElement && el.parentElement !== document.body; el = el.parentElement)
      for (let prev = el.previousElementSibling; prev; prev = prev.previousElementSibling)
        if (getComputedStyle(prev).position !== "absolute" && !prev.matches(".header, .intro")) prev.hidden = true;
    // &aire sets the space over it.
    if (params.get("aire")) {
      const section = target.closest("section") || target;
      section.style.paddingTop = "0px";
      (target === section ? section : target).style.paddingTop = params.get("aire");
      if (target !== section) target.style.marginTop = "0px";
    }
  }
  if (params.get("zoom")) document.documentElement.style.zoom = params.get("zoom");
  for (const selector of params.getAll("ocultar").join(",").split(",").filter(Boolean))
    for (const el of document.querySelectorAll(selector)) el.hidden = true;
}
