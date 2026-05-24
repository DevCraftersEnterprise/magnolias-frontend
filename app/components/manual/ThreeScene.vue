<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const canvasContainer = ref<HTMLDivElement | null>(null);

// Three.js references — kept in module scope to avoid reactivity overhead
let renderer: any = null;
let scene: any = null;
let camera: any = null;
let animationId: number | null = null;
let THREE: any = null;

// ─── Utility: load Three.js only on client ───────────────────────────
async function loadThree() {
  if (typeof window === "undefined") return null;
  const mod = await import("three");
  return mod;
}

// ─── Build scene ─────────────────────────────────────────────────────
async function initScene() {
  if (!canvasContainer.value) return;
  THREE = await loadThree();
  if (!THREE) return;

  const container = canvasContainer.value;
  const W = container.clientWidth;
  const H = container.clientHeight;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 1.2, 6);
  camera.lookAt(0, 0, 0);

  // ── Lights ──────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff0f8, 0.9);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffd6e8, 1.2);
  dirLight.position.set(4, 6, 4);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.PointLight(0xe8d4f0, 0.6, 20);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  // ── Materials ────────────────────────────────────────────────────────
  const cakeMat = new THREE.MeshStandardMaterial({
    color: 0xf5c6d0, // rosa pastel suave
    roughness: 0.5,
    metalness: 0.05,
  });
  const frostingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xfef9e7,
    roughness: 0.4,
    metalness: 0.15,
  });
  const cherryStemMat = new THREE.MeshStandardMaterial({
    color: 0x5a3a1a,
    roughness: 0.8,
  });
  const cherryMat = new THREE.MeshStandardMaterial({
    color: 0xd63384,
    roughness: 0.3,
    metalness: 0.1,
  });

  // ── Cake group ───────────────────────────────────────────────────────
  const cakeGroup = new THREE.Group();
  scene.add(cakeGroup);

  // Plate
  const plateGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.08, 48);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.84;
  plate.castShadow = true;
  plate.receiveShadow = true;
  cakeGroup.add(plate);

  // Bottom layer
  const layer1Geo = new THREE.CylinderGeometry(1.05, 1.05, 0.55, 48);
  const layer1 = new THREE.Mesh(layer1Geo, cakeMat);
  layer1.position.y = -0.525;
  layer1.castShadow = true;
  cakeGroup.add(layer1);

  // Middle frosting band
  const frost1Geo = new THREE.CylinderGeometry(1.07, 1.07, 0.1, 48);
  const frost1 = new THREE.Mesh(frost1Geo, frostingMat);
  frost1.position.y = -0.245;
  cakeGroup.add(frost1);

  // Top layer
  const layer2Geo = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 48);
  const layer2 = new THREE.Mesh(layer2Geo, cakeMat);
  layer2.position.y = 0.275;
  layer2.castShadow = true;
  cakeGroup.add(layer2);

  // Top frosting band
  const frost2Geo = new THREE.CylinderGeometry(0.87, 0.87, 0.08, 48);
  const frost2 = new THREE.Mesh(frost2Geo, frostingMat);
  frost2.position.y = 0.554;
  cakeGroup.add(frost2);

  // Top frosting flat cap
  const capGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.04, 48);
  const cap = new THREE.Mesh(capGeo, frostingMat);
  cap.position.y = 0.62;
  cakeGroup.add(cap);

  // Cherry stem
  const stemGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8);
  const stem = new THREE.Mesh(stemGeo, cherryStemMat);
  stem.position.set(0, 0.78, 0);
  stem.rotation.z = 0.3;
  cakeGroup.add(stem);

  // Cherry
  const cherryGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const cherry = new THREE.Mesh(cherryGeo, cherryMat);
  cherry.position.set(0.065, 0.9, 0);
  cakeGroup.add(cherry);

  // Decorative dots on top layer using SphereGeometry
  const dotMat = new THREE.MeshStandardMaterial({
    color: 0xf9b3cc,
    roughness: 0.4,
  });
  const dotGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const dotAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  dotAngles.forEach((angle) => {
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(Math.cos(angle) * 0.55, 0.63, Math.sin(angle) * 0.55);
    cakeGroup.add(dot);
  });

  cakeGroup.position.y = 0.0;

  // ── Floating spheres ─────────────────────────────────────────────────
  const sphereData = [
    { x: -2.2, y: 0.6, z: -0.5, r: 0.18, color: 0xf9c6d0, speed: 0.8 },
    { x: 2.4, y: 0.3, z: -0.4, r: 0.13, color: 0xe8d5f5, speed: 1.1 },
    { x: -1.8, y: -0.8, z: 0.2, r: 0.22, color: 0xfce4ec, speed: 0.65 },
    { x: 2.0, y: -0.5, z: 0.3, r: 0.16, color: 0xdde8ff, speed: 0.9 },
    { x: 0.6, y: 1.4, z: -0.8, r: 0.11, color: 0xffd6e7, speed: 1.3 },
    { x: -0.7, y: -1.3, z: -0.3, r: 0.14, color: 0xf3e0f7, speed: 0.75 },
    { x: 1.4, y: 1.1, z: 0.5, r: 0.09, color: 0xffe0b2, speed: 1.0 },
    { x: -2.5, y: -0.2, z: -0.6, r: 0.1, color: 0xd4f0f0, speed: 0.85 },
  ];

  const spheres: Array<{
    mesh: any;
    baseY: number;
    speed: number;
    offset: number;
  }> = [];

  sphereData.forEach(({ x, y, z, r, color, speed }, i) => {
    const geo = new THREE.SphereGeometry(r, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = false;
    scene.add(mesh);
    spheres.push({ mesh, baseY: y, speed, offset: i * 0.7 });
  });

  // ── Small star sparkles using OctahedronGeometry ─────────────────────
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xf8bbd0,
    roughness: 0.2,
    metalness: 0.4,
  });
  const starPositions = [
    [-2.8, 1.2, -0.2],
    [2.7, 0.9, 0.1],
    [-1.2, 1.8, 0.4],
    [1.9, -1.2, -0.5],
  ];
  starPositions.forEach(([sx, sy, sz]) => {
    const geo = new THREE.OctahedronGeometry(0.065, 0);
    const mesh = new THREE.Mesh(geo, starMat);
    mesh.position.set(sx, sy, sz);
    scene.add(mesh);
  });

  // ── Resize handler ───────────────────────────────────────────────────
  function onResize() {
    if (!container || !renderer || !camera) return;
    const W2 = container.clientWidth;
    const H2 = container.clientHeight;
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    renderer.setSize(W2, H2);
  }
  window.addEventListener("resize", onResize);

  // ── Animation loop ───────────────────────────────────────────────────
  let t = 0;
  function animate() {
    animationId = requestAnimationFrame(animate);
    t += 0.012;

    // Cake gentle float + rotation
    cakeGroup.position.y = Math.sin(t * 0.7) * 0.08;
    cakeGroup.rotation.y = t * 0.18;

    // Spheres float independently
    spheres.forEach(({ mesh, baseY, speed, offset }) => {
      mesh.position.y = baseY + Math.sin(t * speed + offset) * 0.12;
    });

    renderer.render(scene, camera);
  }
  animate();

  // Store resize handler for cleanup
  (canvasContainer.value as any)._onResize = onResize;
}

// ─── Lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  // Stop animation loop
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Dispose Three.js resources
  if (scene) {
    scene.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material))
          obj.material.forEach((m: any) => m.dispose());
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

  // Remove resize listener
  if (canvasContainer.value && (canvasContainer.value as any)._onResize) {
    window.removeEventListener(
      "resize",
      (canvasContainer.value as any)._onResize,
    );
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
      height: 320px;
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
