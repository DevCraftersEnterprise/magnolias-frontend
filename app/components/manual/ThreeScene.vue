<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const canvasContainer = ref<HTMLDivElement | null>(null);

let renderer: any = null;
let scene: any = null;
let camera: any = null;
let animationId: number | null = null;
let THREE: any = null;

async function loadThree() {
  if (typeof window === "undefined") return null;
  return await import("three");
}

async function initScene() {
  if (!canvasContainer.value) return;
  THREE = await loadThree();
  if (!THREE) return;

  const container = canvasContainer.value;
  const W = container.clientWidth;
  const H = container.clientHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0.9, 6.8);
  camera.lookAt(0, 0.25, 0);

  // ── Lights ──────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xfff0f8, 0.75));

  const dirLight = new THREE.DirectionalLight(0xffd0e8, 1.4);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  const fillLight = new THREE.PointLight(0xd4a0f0, 0.9, 25);
  fillLight.position.set(-4, 3, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffe8f4, 0.45);
  rimLight.position.set(-2, 1, -5);
  scene.add(rimLight);

  // ── Materials ────────────────────────────────────────────────────────
  const cakePink = new THREE.MeshStandardMaterial({ color: 0xf5bfcd, roughness: 0.65 });
  const cakeCream = new THREE.MeshStandardMaterial({ color: 0xfde8c5, roughness: 0.65 });
  const frostingMat = new THREE.MeshStandardMaterial({
    color: 0xfffcfa,
    roughness: 0.22,
    metalness: 0.04,
    emissive: 0x200810,
    emissiveIntensity: 0.08,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xfef4ee,
    roughness: 0.28,
    metalness: 0.2,
  });
  const pearlMat = new THREE.MeshStandardMaterial({
    color: 0xf8e8d8,
    roughness: 0.18,
    metalness: 0.35,
  });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.35 });

  const cakeGroup = new THREE.Group();
  scene.add(cakeGroup);

  // Plate
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.07, 64), plateMat);
  plate.position.y = -1.0;
  plate.castShadow = true;
  plate.receiveShadow = true;
  cakeGroup.add(plate);

  // ── Tier coordinates ─────────────────────────────────────────────────
  const PLATE_TOP = -0.965;

  // Tier 1 (bottom — pink)
  const T1R = 1.15, T1H = 0.65;
  const T1CY = PLATE_TOP + T1H / 2;
  const T1TOP = PLATE_TOP + T1H;

  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(T1R, T1R, T1H, 64), cakePink);
  tier1.position.y = T1CY;
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  cakeGroup.add(tier1);

  // Frosting ring 1
  const FR1H = 0.07, FR1R = T1R + 0.02;
  const FR1TOP = T1TOP + FR1H;
  const frost1 = new THREE.Mesh(new THREE.CylinderGeometry(FR1R, FR1R, FR1H, 64), frostingMat);
  frost1.position.y = T1TOP + FR1H / 2;
  cakeGroup.add(frost1);

  // Tier 2 (middle — cream)
  const T2R = 0.87, T2H = 0.58;
  const T2CY = FR1TOP + T2H / 2;
  const T2TOP = FR1TOP + T2H;

  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(T2R, T2R, T2H, 64), cakeCream);
  tier2.position.y = T2CY;
  tier2.castShadow = true;
  tier2.receiveShadow = true;
  cakeGroup.add(tier2);

  // Frosting ring 2
  const FR2H = 0.07, FR2R = T2R + 0.02;
  const FR2TOP = T2TOP + FR2H;
  const frost2 = new THREE.Mesh(new THREE.CylinderGeometry(FR2R, FR2R, FR2H, 64), frostingMat);
  frost2.position.y = T2TOP + FR2H / 2;
  cakeGroup.add(frost2);

  // Tier 3 (top — pink)
  const T3R = 0.62, T3H = 0.52;
  const T3CY = FR2TOP + T3H / 2;
  const T3TOP = FR2TOP + T3H;

  const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(T3R, T3R, T3H, 64), cakePink);
  tier3.position.y = T3CY;
  tier3.castShadow = true;
  tier3.receiveShadow = true;
  cakeGroup.add(tier3);

  // Top frosting cap
  const CAP_H = 0.06, CAP_R = T3R + 0.02;
  const CAP_TOP = T3TOP + CAP_H;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(CAP_R, CAP_R, CAP_H, 64), frostingMat);
  cap.position.y = T3TOP + CAP_H / 2;
  cakeGroup.add(cap);

  // ── Frosting drip helper ──────────────────────────────────────────────
  function addDrips(radius: number, topY: number, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const len = 0.08 + (i % 4) * 0.03;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.012, len, 6),
        frostingMat,
      );
      body.position.set(cx, topY - len / 2, cz);
      cakeGroup.add(body);

      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.017, 7, 7), frostingMat);
      drop.position.set(cx, topY - len - 0.012, cz);
      cakeGroup.add(drop);
    }
  }

  addDrips(FR1R, FR1TOP, 16);
  addDrips(FR2R, FR2TOP, 12);
  addDrips(CAP_R, CAP_TOP, 9);

  // ── Pearl rings on each tier side ────────────────────────────────────
  function addPearls(tierCY: number, tierR: number, count: number) {
    const geo = new THREE.SphereGeometry(0.04, 8, 8);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pearl = new THREE.Mesh(geo, pearlMat);
      pearl.position.set(
        Math.cos(angle) * (tierR + 0.01),
        tierCY,
        Math.sin(angle) * (tierR + 0.01),
      );
      cakeGroup.add(pearl);
    }
  }

  addPearls(T1CY, T1R, 18);
  addPearls(T2CY, T2R, 14);
  addPearls(T3CY, T3R, 10);

  // Accent dots on top cap
  const dotGeo = new THREE.SphereGeometry(0.042, 8, 8);
  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((angle) => {
    const dot = new THREE.Mesh(dotGeo, accentMat);
    dot.position.set(Math.cos(angle) * 0.37, CAP_TOP + 0.042, Math.sin(angle) * 0.37);
    cakeGroup.add(dot);
  });

  // ── Candles with animated flames ─────────────────────────────────────
  const candleMat = new THREE.MeshStandardMaterial({ color: 0xfffde7, roughness: 0.5 });
  const wickMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xff9840,
    emissive: 0xff5810,
    emissiveIntensity: 1.3,
    transparent: true,
    opacity: 0.88,
    roughness: 0.5,
  });
  const flameTipMat = new THREE.MeshStandardMaterial({
    color: 0xffee88,
    emissive: 0xffcc00,
    emissiveIntensity: 1.6,
    transparent: true,
    opacity: 0.95,
  });

  type FlameRef = { mesh: any; offset: number };
  const flames: FlameRef[] = [];

  const CANDLE_H = 0.28;
  const CANDLE_BASE = CAP_TOP;

  const candleSlots = [
    { r: 0, a: 0 },
    { r: 0.3, a: 0 },
    { r: 0.3, a: Math.PI / 2 },
    { r: 0.3, a: Math.PI },
    { r: 0.3, a: (3 * Math.PI) / 2 },
  ];

  candleSlots.forEach(({ r, a }, i) => {
    const cx = Math.cos(a) * r;
    const cz = Math.sin(a) * r;

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.034, CANDLE_H, 12),
      candleMat,
    );
    candle.position.set(cx, CANDLE_BASE + CANDLE_H / 2, cz);
    cakeGroup.add(candle);

    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.055, 6),
      wickMat,
    );
    wick.position.set(cx, CANDLE_BASE + CANDLE_H + 0.027, cz);
    cakeGroup.add(wick);

    const flameBaseY = CANDLE_BASE + CANDLE_H + 0.062;

    const flameBody = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 8), flameMat);
    flameBody.position.set(cx, flameBaseY + 0.045, cz);
    cakeGroup.add(flameBody);
    flames.push({ mesh: flameBody, offset: i * 1.5 });

    const flameTip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), flameTipMat);
    flameTip.position.set(cx, flameBaseY + 0.097, cz);
    cakeGroup.add(flameTip);
    flames.push({ mesh: flameTip, offset: i * 1.5 + 0.7 });
  });

  // ── Floating spheres ──────────────────────────────────────────────────
  const sphereData = [
    { x: -2.4, y: 0.5,  z: -0.5, r: 0.17, color: 0xf9c6d0, speed: 0.80 },
    { x:  2.5, y: 0.2,  z: -0.4, r: 0.13, color: 0xe8d5f5, speed: 1.10 },
    { x: -1.9, y: -0.9, z:  0.2, r: 0.21, color: 0xfce4ec, speed: 0.65 },
    { x:  2.1, y: -0.6, z:  0.3, r: 0.15, color: 0xdde8ff, speed: 0.90 },
    { x:  0.7, y:  1.5, z: -0.9, r: 0.11, color: 0xffd6e7, speed: 1.30 },
    { x: -0.8, y: -1.4, z: -0.3, r: 0.14, color: 0xf3e0f7, speed: 0.75 },
    { x:  1.5, y:  1.2, z:  0.5, r: 0.09, color: 0xffe0b2, speed: 1.00 },
    { x: -2.6, y: -0.3, z: -0.6, r: 0.10, color: 0xd4f0f0, speed: 0.85 },
  ];

  type SphereRef = { mesh: any; baseY: number; speed: number; offset: number };
  const spheres: SphereRef[] = [];

  sphereData.forEach(({ x, y, z, r, color, speed }, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    spheres.push({ mesh, baseY: y, speed, offset: i * 0.7 });
  });

  // ── Rotating star sparkles ────────────────────────────────────────────
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xf8bbd0,
    roughness: 0.2,
    metalness: 0.45,
    emissive: 0xf0a0c0,
    emissiveIntensity: 0.3,
  });
  const starPositions: [number, number, number][] = [
    [-2.9, 1.3, -0.2],
    [ 2.8, 0.8,  0.1],
    [-1.3, 1.9,  0.4],
    [ 2.0, -1.3, -0.5],
    [-0.5, 2.0, -0.7],
    [ 1.2, -1.8, 0.6],
  ];

  type StarRef = { mesh: any; offset: number };
  const stars: StarRef[] = [];

  starPositions.forEach(([sx, sy, sz], i) => {
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), starMat);
    mesh.position.set(sx, sy, sz);
    scene.add(mesh);
    stars.push({ mesh, offset: i * 1.1 });
  });

  cakeGroup.position.y = 0;

  // ── Resize ────────────────────────────────────────────────────────────
  function onResize() {
    if (!container || !renderer || !camera) return;
    const W2 = container.clientWidth;
    const H2 = container.clientHeight;
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    renderer.setSize(W2, H2);
  }
  window.addEventListener("resize", onResize);
  (canvasContainer.value as any)._onResize = onResize;

  // ── Animation loop ────────────────────────────────────────────────────
  let t = 0;
  function animate() {
    animationId = requestAnimationFrame(animate);
    t += 0.012;

    cakeGroup.position.y = Math.sin(t * 0.65) * 0.07;
    cakeGroup.rotation.y = t * 0.15;

    spheres.forEach(({ mesh, baseY, speed, offset }) => {
      mesh.position.y = baseY + Math.sin(t * speed + offset) * 0.12;
    });

    flames.forEach(({ mesh, offset }) => {
      const f = 0.88 + Math.sin(t * 9 + offset) * 0.09 + Math.cos(t * 13 + offset) * 0.05;
      mesh.scale.set(f, f + Math.sin(t * 11 + offset) * 0.08, f);
    });

    stars.forEach(({ mesh, offset }) => {
      mesh.rotation.y = t * 0.8 + offset;
      mesh.rotation.x = t * 0.5 + offset;
    });

    renderer.render(scene, camera);
  }
  animate();
}

// ─── Lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (scene) {
    scene.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
        else obj.material.dispose();
      }
    });
    scene = null;
  }

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }

  if (canvasContainer.value && (canvasContainer.value as any)._onResize) {
    window.removeEventListener("resize", (canvasContainer.value as any)._onResize);
  }

  camera = null;
  THREE = null;
});
</script>

<template>
  <div
    ref="canvasContainer"
    class="relative w-full overflow-hidden rounded-2xl"
    style="
      height: 360px;
      background: linear-gradient(
        135deg,
        #fff0f5 0%,
        #fdf4ff 50%,
        #f0f9ff 100%
      );
    "
    aria-hidden="true"
  />
</template>
