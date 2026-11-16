// Saves the images that are sent to the client instead of the working site.
// Drives headless Edge (or Chrome) over the DevTools protocol and waits in real time before each shot,
// so photos and the embedded Google map have time to draw. Needs Node 22+ and the demo served over http:
//   python -m http.server 8795 --directory .
//   node tools/capturas.mjs [base_url] [name_filter]
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8795";
const ONLY = process.argv[3] || "";
const OUT = new URL("../capturas/", import.meta.url);
const PORT = 9334;
const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const q = (text) => encodeURIComponent(text);
// The part of a title between asterisks is set in orange. Both frames carry the signature under them,
// so the in-page one is hidden.
const phone = (title, query) => `${BASE}/tools/mockup.html?t=${q(title)}&q=${q(query + "&ocultar=.wa-float,.captura-mark")}`;
const desktop = (title, query) => `${BASE}/tools/navegador.html?t=${q(title)}&q=${q(query + "&ocultar=.wa-float,.captura-mark")}`;
// No "#" in these queries: inside the frame it would start the URL fragment and drop what follows.
const BOOKING = "servicio=1&tipo=0&dia=3";

const SHOTS = [
  ["01-celular-inicio", 600, 1110, 2, phone("Así se ve *en el celular*", "captura")],
  ["02-celular-bicis", 600, 1110, 2, phone("Tus bicis, *con sus datos*", "captura&desde=bicis&aire=40px")],
  ["03-celular-talle", 600, 1110, 2, phone("Su talle, *en un toque*", "captura&desde=talle&aire=34px&altura=176")],
  ["04-celular-turnos", 600, 1110, 2, phone("Turnos del taller *por WhatsApp*", `captura&desde=booking&aire=30px&${BOOKING}`)],
  ["05-escritorio-inicio", 1500, 1100, 1.5, desktop("Así se ve *en la computadora*", "captura")],
  ["06-escritorio-bicis", 1500, 1100, 1.5, desktop("Las bicis, *en tu web*", "captura&desde=bicis&aire=50px&zoom=0.8")],
  ["07-escritorio-talle", 1500, 1100, 1.5, desktop("Guía de talles, *como las grandes marcas*", "captura&desde=talle&aire=90px&altura=176")],
  ["08-escritorio-taller", 1500, 1100, 1.5, desktop("Taller oficial, *turnos online*", `captura&desde=taller&aire=50px&zoom=0.74&${BOOKING}`)],
  ["09-escritorio-historia", 1500, 1100, 1.5, desktop("Tu historia, *bien contada*", "captura&desde=historia&aire=60px&zoom=0.85")],
  ["10-escritorio-club", 1500, 1100, 1.5, desktop("El club *y el local*", "captura&desde=club&zoom=0.8")],
  ["11-escritorio-local", 1500, 1100, 1.5, desktop("Reseñas *y horario en vivo*", "captura&desde=resenas&zoom=0.72")],
  ["12-logo", 1600, 1000, 1, `${BASE}/tools/logo.html`],
];

const binary = BROWSERS.find(existsSync);
if (!binary) throw new Error("No Edge or Chrome found");
const profile = mkdtempSync(join(tmpdir(), "talia-capturas-"));
// The hero bike is WebGL: headless Edge draws it in software with SwiftShader.
const browser = spawn(binary, ["--headless=new", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--hide-scrollbars", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function devtools() {
  for (let i = 0; i < 50; i++) {
    try {
      return await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
    } catch {
      await wait(200);
    }
  }
  throw new Error("The browser did not open its DevTools port");
}

const target = await devtools();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const listeners = new Set();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else for (const listen of listeners) listen(message);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, (message) => (message.error ? reject(new Error(method + ": " + message.error.message)) : resolve(message.result)));
    socket.send(JSON.stringify({ id, method, params }));
  });
const loaded = () =>
  new Promise((resolve) => {
    const listen = (message) => {
      if (message.method !== "Page.loadEventFired") return;
      listeners.delete(listen);
      resolve();
    };
    listeners.add(listen);
  });

await send("Page.enable");
mkdirSync(OUT, { recursive: true });
for (const [name, width, height, scale, url] of SHOTS.filter(([name]) => name.includes(ONLY))) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
  const ready = loaded();
  await send("Page.navigate", { url });
  await ready;
  // Fonts, photos and the Google map arrive after the load event.
  await wait(7000);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(new URL(name + ".png", OUT), Buffer.from(data, "base64"));
  console.log(`capturas/${name}.png`);
}
socket.close();
browser.kill();
await wait(500);
// Edge can keep the profile open for a moment after it exits; a leftover temp folder is harmless.
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
} catch {}
