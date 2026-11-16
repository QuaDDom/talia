/* The hero bike, built in three.js from simple shapes: a full-suspension cross-country bike in the brand's colours.
   It assembles itself piece by piece when the page opens (an exploded workshop view coming together), can be turned
   by dragging, and rolls with the scroll: it swings to a side view while the wheels and cranks spin.
   Units are metres. X runs from the rear wheel to the front, Y is up, Z is the side (+Z is the drive side). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const figure = document.querySelector(".hero-bike");
const params = new URLSearchParams(location.search);
const capture = params.has("captura");
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

if (figure && webglOK()) build();

function build() {
  const canvas = document.createElement("canvas");
  canvas.className = "bike-canvas";
  canvas.setAttribute("aria-label", "Bicicleta en 3D. Arrastrá para girarla.");
  canvas.setAttribute("role", "img");
  figure.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0.74, 3.45);
  camera.lookAt(0, 0.52, 0);

  // Key light from the front, and a mint rim light from behind that outlines the bike against the green.
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7cd6a8, 3.2);
  rim.position.set(-3, 2, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xa6bdbb, 0.8);
  fill.position.set(-3, 0.5, 3);
  scene.add(fill);

  /* ---------- Materials ---------- */
  const M = {
    frame: new THREE.MeshPhysicalMaterial({ color: 0xece6d8, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.15 }),
    mint: new THREE.MeshPhysicalMaterial({ color: 0x7cd6a8, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x141a1b, roughness: 0.45, metalness: 0.2 }),
    matte: new THREE.MeshStandardMaterial({ color: 0x1b2223, roughness: 0.8 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x191c1c, roughness: 0.95 }),
    tan: new THREE.MeshStandardMaterial({ color: 0x9a7650, roughness: 0.85 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc9d0cf, roughness: 0.22, metalness: 1 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x3a4446, roughness: 0.3, metalness: 0.9 }),
    stanchion: new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: 0.25, metalness: 1 }),
  };

  /* ---------- Helpers ---------- */
  const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  function tube(points, r, mat, caps = true) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)));
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 20, false), mat));
    if (caps) for (const p of [points[0], points[points.length - 1]]) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat);
      s.position.set(...p);
      g.add(s);
    }
    return g;
  }
  // A cylinder between two points.
  function rod(a, b, r, mat, segments = 20) {
    const A = V(...a), B = V(...b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), segments), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize());
    return m;
  }
  function disc(r, depth, mat, z, segments = 48) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, segments), mat);
    m.rotation.x = Math.PI / 2;
    m.position.z = z;
    return m;
  }

  /* ---------- Geometry ---------- */
  const REAR = V(-0.56, 0.37), FRONT = V(0.6, 0.37);
  const BB = [-0.125, 0.335];
  const SEAT = [-0.27, 0.86];
  const HEAD_TOP = [0.385, 0.955], HEAD_BOT = [0.43, 0.84];

  function wheel(rear) {
    const g = new THREE.Group();
    const spin = new THREE.Group();
    g.add(spin);
    // Tyre with a tan sidewall, rim, hub.
    spin.add(new THREE.Mesh(new THREE.TorusGeometry(0.338, 0.03, 24, 140), M.rubber));
    for (const z of [-0.022, 0.022]) {
      const wall = new THREE.Mesh(new THREE.TorusGeometry(0.318, 0.012, 12, 140), M.tan);
      wall.position.z = z;
      spin.add(wall);
    }
    spin.add(new THREE.Mesh(new THREE.TorusGeometry(0.302, 0.013, 14, 140), M.black));
    // Tread knobs.
    const knob = new THREE.BoxGeometry(0.016, 0.012, 0.042);
    const knobs = new THREE.InstancedMesh(knob, M.rubber, 96);
    const o = new THREE.Object3D();
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      o.position.set(Math.cos(a) * 0.368, Math.sin(a) * 0.368, (i % 2 ? 0.008 : -0.008));
      o.rotation.set(0, 0, a);
      o.updateMatrix();
      knobs.setMatrixAt(i, o.matrix);
    }
    spin.add(knobs);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.11, 24), M.black);
    hub.rotation.x = Math.PI / 2;
    spin.add(hub);
    for (const z of [-0.036, 0.036]) spin.add(disc(0.032, 0.006, M.darkMetal, z, 24));
    // Spokes, crossed between the two flanges.
    const spokeMat = M.metal;
    for (let i = 0; i < 28; i++) {
      const side = i % 2 ? 1 : -1;
      const a = (i / 28) * Math.PI * 2;
      const b = a + side * 0.32;
      spin.add(rod([Math.cos(a) * 0.03, Math.sin(a) * 0.03, side * 0.036], [Math.cos(b) * 0.296, Math.sin(b) * 0.296, 0], 0.0016, spokeMat, 5));
    }
    // Brake rotor on the left, with its spider.
    const rotor = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.09, 64), M.metal);
    rotor.position.z = -0.05;
    rotor.material = M.metal.clone();
    rotor.material.side = THREE.DoubleSide;
    spin.add(rotor);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      spin.add(rod([Math.cos(a) * 0.02, Math.sin(a) * 0.02, -0.05], [Math.cos(a + 0.4) * 0.065, Math.sin(a + 0.4) * 0.065, -0.05], 0.005, M.darkMetal, 8));
    }
    // Cassette on the drive side of the rear wheel.
    if (rear) for (let i = 0; i < 9; i++) spin.add(disc(0.03 + i * 0.0055, 0.003, i % 2 ? M.metal : M.darkMetal, 0.028 + i * 0.0045, 40));
    g.userData.spin = spin;
    return g;
  }

  const bike = new THREE.Group();
  const parts = [];
  const part = (obj, from, rot, delay) => { bike.add(obj); parts.push({ obj, from, rot, delay }); return obj; };

  // Main frame: top, down, seat and head tubes, the shock mount and the brand on the down tube.
  const frame = new THREE.Group();
  frame.add(tube([SEAT, [0.06, 0.915], HEAD_TOP], 0.027, M.frame));
  frame.add(tube([[BB[0] + 0.02, BB[1] + 0.03], [0.15, 0.6], [HEAD_BOT[0] - 0.005, HEAD_BOT[1] + 0.01]], 0.037, M.frame));
  frame.add(tube([BB, SEAT], 0.027, M.frame));
  frame.add(rod([HEAD_BOT[0] + 0.006, HEAD_BOT[1] - 0.025], [HEAD_TOP[0] - 0.006, HEAD_TOP[1] + 0.02], 0.034, M.frame, 28));
  frame.add(rod([0.0, 0.905], [-0.005, 0.855], 0.012, M.frame));
  const bbShell = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.1, 28), M.frame);
  bbShell.rotation.x = Math.PI / 2;
  bbShell.position.set(...BB, 0);
  frame.add(bbShell);
  frame.add(brand([BB[0] + 0.02, BB[1] + 0.03], [HEAD_BOT[0] - 0.005, HEAD_BOT[1] + 0.01], 0.037));
  part(frame, V(0, 0.32, 0), V(0, 0, 0.12), 0);

  // Rear end: chain and seat stays on both sides, rocker link and shock.
  const rearEnd = new THREE.Group();
  for (const z of [-0.045, 0.045]) {
    rearEnd.add(tube([[BB[0] - 0.01, BB[1] + 0.03, z * 0.6], [-0.34, 0.36, z], [REAR.x, REAR.y, z * 1.25]], 0.014, M.frame));
    rearEnd.add(tube([[REAR.x, REAR.y, z * 1.25], [-0.42, 0.56, z], [-0.285, 0.745, z * 0.8]], 0.012, M.frame));
    rearEnd.add(tube([[-0.29, 0.745, z * 0.8], [-0.252, 0.795, z * 0.8], [-0.195, 0.79, z * 0.8]], 0.011, M.mint));
  }
  rearEnd.add(rod([-0.2, 0.79], [-0.09, 0.82], 0.019, M.black));
  rearEnd.add(rod([-0.1, 0.817], [-0.005, 0.85], 0.012, M.metal));
  rearEnd.add(rod([-0.15, 0.805], [-0.11, 0.815], 0.024, M.black));
  // Dropouts and the rear derailleur.
  const mech = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, 0.02), M.black);
  mech.position.set(REAR.x + 0.01, REAR.y - 0.07, 0.07);
  mech.rotation.z = 0.25;
  rearEnd.add(mech);
  part(rearEnd, V(-0.4, 0.12, 0), V(0, 0, -0.2), 0.12);

  // Fork: crown, gold stanchions, black lowers and the arch.
  const fork = new THREE.Group();
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.15), M.black);
  crown.position.set(0.442, 0.805, 0);
  crown.rotation.z = -0.37;
  fork.add(crown);
  for (const z of [-0.06, 0.06]) {
    fork.add(rod([0.445, 0.8, z], [0.528, 0.585, z], 0.0165, M.stanchion));
    fork.add(rod([0.515, 0.625, z], [0.598, 0.395, z], 0.022, M.black));
  }
  fork.add(tube([[0.535, 0.6, -0.06], [0.555, 0.64, 0], [0.535, 0.6, 0.06]], 0.013, M.black, false));
  part(fork, V(0.35, 0.3, 0), V(0, 0, -0.3), 0.22);

  // Wheels roll in from each side.
  const rearWheel = wheel(true);
  rearWheel.position.copy(REAR);
  part(rearWheel, V(-1.1, 0, 0), V(0, 0, 0), 0.32);
  const frontWheel = wheel(false);
  frontWheel.position.copy(FRONT);
  part(frontWheel, V(1.1, 0, 0), V(0, 0, 0), 0.4);

  // Crankset, chain and pedals.
  const drive = new THREE.Group();
  const crank = new THREE.Group();
  crank.position.set(...BB, 0);
  drive.add(crank);
  crank.add(disc(0.082, 0.006, M.black, 0.062, 48));
  const teeth = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.004, 8, 64), M.darkMetal);
  teeth.position.z = 0.062;
  crank.add(teeth);
  for (const [z, s] of [[0.075, 1], [-0.075, -1]]) {
    crank.add(rod([0, 0, z], [0, -0.17 * s, z], 0.011, M.black));
    const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.08), M.matte);
    pedal.position.set(0, -0.17 * s, z + 0.05 * Math.sign(z));
    crank.add(pedal);
  }
  drive.add(rod([BB[0], BB[1] + 0.085, 0.062], [REAR.x, REAR.y + 0.065, 0.05], 0.0045, M.darkMetal, 6));
  drive.add(rod([BB[0], BB[1] - 0.085, 0.062], [REAR.x + 0.02, REAR.y - 0.11, 0.06], 0.0045, M.darkMetal, 6));
  part(drive, V(0, -0.25, 0.45), V(0, 0, 0), 0.5);

  // Cockpit: stem, bar, grips.
  const cockpit = new THREE.Group();
  cockpit.add(rod([HEAD_TOP[0] - 0.008, HEAD_TOP[1] + 0.015], [HEAD_TOP[0] - 0.014, HEAD_TOP[1] + 0.045], 0.02, M.black));
  cockpit.add(rod([HEAD_TOP[0] - 0.014, HEAD_TOP[1] + 0.035], [0.46, 1.0], 0.017, M.black));
  cockpit.add(tube([[0.465, 1.0, -0.38], [0.47, 1.01, -0.15], [0.47, 1.0, 0], [0.47, 1.01, 0.15], [0.465, 1.0, 0.38]], 0.0115, M.black));
  for (const z of [-0.33, 0.33]) {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.12, 20), M.mint);
    grip.rotation.x = Math.PI / 2;
    grip.position.set(0.465, 1.0, z);
    cockpit.add(grip);
    cockpit.add(rod([0.47, 1.005, z * 0.78], [0.54, 0.985, z * 0.8], 0.005, M.metal, 8));
  }
  part(cockpit, V(0.15, 0.45, 0), V(0, 0, 0.3), 0.58);

  // Seatpost and saddle.
  const seat = new THREE.Group();
  seat.add(rod([SEAT[0] + 0.004, SEAT[1] - 0.02], [-0.322, 1.03], 0.0155, M.black));
  const rearPad = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), M.black);
  rearPad.scale.set(0.075, 0.022, 0.07);
  rearPad.position.set(-0.36, 1.05, 0);
  seat.add(rearPad);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), M.black);
  nose.scale.set(0.12, 0.018, 0.028);
  nose.position.set(-0.27, 1.045, 0);
  seat.add(nose);
  part(seat, V(0, 0.5, 0), V(0, 0, -0.2), 0.64);

  // Centre the bike and drop it on the floor.
  bike.position.set(-0.02, 0, 0);
  const holder = new THREE.Group();
  holder.add(bike);
  scene.add(holder);

  // Soft contact shadow.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const sc = shadowCanvas.getContext("2d");
  const grad = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(2,12,14,0.9)");
  grad.addColorStop(0.5, "rgba(2,12,14,0.45)");
  grad.addColorStop(1, "rgba(3,16,18,0)");
  sc.fillStyle = grad;
  sc.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.75), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  holder.add(shadow);

  /* ---------- The brand on the down tube ---------- */
  function brand(a, b, r) {
    const A = V(...a), B = V(...b);
    const len = A.distanceTo(B);
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 192;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0d2b2f";
    ctx.font = "900 150px Archivo, 'Arial Black', sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("TAL1A", 512, 104);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    // Lay the text along the tube: the texture is rotated a quarter turn so its width runs down the length.
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI / 2;
    const geo = new THREE.CylinderGeometry(r * 1.02, r * 1.02, len * 0.42, 32, 1, true, -0.85, 1.7);
    const mat = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, roughness: 0.32, clearcoat: 1, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(A).lerp(B, 0.52);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize());
    return m;
  }

  /* ---------- Size ---------- */
  function resize() {
    const w = figure.clientWidth, h = figure.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole bike in frame on narrow screens.
    camera.position.z = (w / h < 1.15 ? 3.45 * 1.15 / Math.max(w / h, 0.75) : 3.45) * (w < 520 ? 1.08 : 1);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(figure);
  resize();

  /* ---------- Interaction ---------- */
  const BASE_YAW = -0.5;
  let dragYaw = 0, dragVel = 0, dragging = false, lastX = 0;
  let tiltTarget = 0, tilt = 0;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); figure.classList.add("is-dragging"); });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragVel = dx * 0.008;
      dragYaw += dragVel;
    }
  });
  const stop = () => { dragging = false; figure.classList.remove("is-dragging"); };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  addEventListener("pointermove", (e) => { tiltTarget = (e.clientY / innerHeight - 0.5) * 0.12; }, { passive: true });

  // Scrolling through the hero turns the bike to a side view, and the wheels roll with it.
  const hero = figure.closest(".hero");
  let lastScroll = scrollY, roll = 0, rollVel = 0;

  /* ---------- Assembly ---------- */
  const ASSEMBLE = 1.25;
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  let t0 = null;
  const instant = capture || calm;
  function place(time) {
    let done = true;
    for (const p of parts) {
      let k = 1;
      if (!instant) {
        if (t0 === null) k = 0;
        else k = Math.min(1, Math.max(0, (time - t0) / 1000 - p.delay) / ASSEMBLE);
      }
      if (k < 1) done = false;
      const e = easeOut(k);
      const base = p.base || (p.base = p.obj.position.clone());
      p.obj.position.copy(base).addScaledVector(p.from, 1 - e);
      p.obj.rotation.set(p.rot.x * (1 - e), p.rot.y * (1 - e), p.rot.z * (1 - e));
      // Wheels spin as they roll in.
      if (p.obj.userData.spin) p.obj.userData.spin.rotation.z = -p.from.x * 4 * (1 - e);
    }
    return done;
  }
  // Start once the curtain lifts.
  const startWhenLoaded = () => {
    if (document.documentElement.classList.contains("is-loaded")) { setTimeout(() => (t0 = performance.now()), 350); return true; }
    return false;
  };
  if (!instant && !startWhenLoaded()) {
    const mo = new MutationObserver(() => { if (startWhenLoaded()) mo.disconnect(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- Loop ---------- */
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(figure);
  figure.classList.add("is-3d");

  function frameLoop(time) {
    requestAnimationFrame(frameLoop);
    if (!visible) return;
    const assembled = place(time);

    // Scroll progress through the hero, 0 at the top.
    const r = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
    const dy = scrollY - lastScroll;
    lastScroll = scrollY;
    if (!instant) rollVel += dy * 0.012;
    rollVel *= 0.9;
    roll += rollVel;

    if (!dragging) { dragVel *= 0.94; dragYaw += dragVel; }
    tilt += (tiltTarget - tilt) * 0.05;
    const idle = instant ? 0 : Math.sin(time / 1000 * 0.35) * 0.1;
    holder.rotation.y = (BASE_YAW + idle) * (1 - p) + dragYaw;
    holder.rotation.x = instant ? 0 : tilt;
    holder.position.x = p * 0.25;

    if (assembled) {
      rearWheel.userData.spin.rotation.z = -roll;
      frontWheel.userData.spin.rotation.z = -roll;
      crank.rotation.z = -roll * 0.45;
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frameLoop);
  // For the capture script: tells it the bike has been drawn.
  requestAnimationFrame(() => requestAnimationFrame(() => figure.classList.add("is-drawn")));
}
