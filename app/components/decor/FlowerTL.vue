<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-hidden="true"
    class="absolute pointer-events-none opacity-75 w-[420px] max-w-[55vw] z-0 drop-shadow-[0_10px_24px_rgba(0,0,0,0.08)] top-[-40px] left-[-40px] -rotate-[8deg]"
    viewBox="0 0 500 500"
  >
    <path
      stroke="#8a8a8a"
      stroke-linecap="round"
      stroke-width="2"
      d="M50 80c70-60 150-60 210 0"
    />
  </svg>
</template>

<style scoped>
:deep(path),
:deep(line),
:deep(polyline),
:deep(circle),
:deep(rect) {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: draw 2.2s ease forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
