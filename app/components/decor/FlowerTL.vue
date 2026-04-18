<template>
    <svg
      class="flower flower--tl"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- ⬇️ Pega aquí el contenido de tu SVG de Figma (paths, lines, etc.) -->
      <!-- EJEMPLO (borra esto cuando pegues el tuyo) -->
      <path d="M50 80 C120 20 200 20 260 80" stroke="#8A8A8A" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </template>
  
  <style scoped>
  .flower {
    position: absolute;
    pointer-events: none;
    opacity: 0.75;
    filter: drop-shadow(0 10px 24px rgba(0,0,0,0.08));
    width: 420px;              /* 🔥 tamaño */
    max-width: 55vw;
    z-index: 0;
  }
  
  /* esquina sup izq */
  .flower--tl {
    top: -40px;
    left: -40px;
    transform: rotate(-8deg);
  }
  
  /* ✅ trazado */
  .flower :deep(path),
  .flower :deep(line),
  .flower :deep(polyline),
  .flower :deep(circle),
  .flower :deep(rect) {
    stroke-dasharray: 1200;
    stroke-dashoffset: 1200;
    animation: draw 2.2s ease forwards;
  }
  
  @keyframes draw {
    to { stroke-dashoffset: 0; }
  }
  </style>
  