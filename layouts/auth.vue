<template>
    <div class="auth-shell">
      <!-- Flores -->
      <img class="flower flower--tl" src="/svg/flower-tl.svg" alt="" />
      <img class="flower flower--br" src="/svg/flower-br.svg" alt="" />
  
      <div class="card">
        <div class="left">
          <slot />
        </div>
  
        <div class="right">
          <div class="cupcakes-wrap">
            <img class="cupcake" src="/img/cupcakes.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style>
  .auth-shell {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    display: grid;
    place-items: center;
    padding: 24px;
    background: radial-gradient(1200px 700px at 50% 45%, #ffe6f2 0%, #f8cfe0 40%, #f1b6cf 70%, #eaa6c6 100%);
  }
  
  /* 🔥 Esto asegura el orden de capas */
  .flower {
  position: absolute;
  pointer-events: none;
  opacity: 0.35;
  width: 460px;
  max-width: 55vw;
  z-index: 1;
}

@media (max-width: 860px) {
  .flower {
    width: 260px;
    max-width: 70vw;
    opacity: 0.22;
  }
  .flower--tl { top: -70px; left: -90px; }
  .flower--br { bottom: -90px; right: -90px; }
}

  
  .flower--tl {
    top: -120px;
    left: -160px;
    transform: rotate(-8deg);
  }
  
  .flower--br {
    bottom: -170px;
    right: -160px;
    transform: rotate(185deg);
  }
  
  .card {
  width: min(980px, 100%);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;

  display: grid;
  grid-template-columns: 1.08fr 0.92fr;

  position: relative;
  z-index: 5;
}

/* ✅ MÓVIL: se apila */
@media (max-width: 860px) {
  .card {
    grid-template-columns: 1fr;
    border-radius: 16px;
  }
}

  
.left {
  padding: 44px 48px;
}


  
.right {
  position: relative;
  min-height: 520px;
  background: linear-gradient(135deg, #ffb7df 0%, #ff8fd3 55%, #ff77c8 100%);
  display: grid;
  place-items: center;
}

/* 📱 Móvil: ocultar panel cupcakes */
@media (max-width: 640px) {
  .right {
    display: none;
  }

  .card {
    grid-template-columns: 1fr;
  }
}


  
  .cupcakes-wrap {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  /* 🍰 Cupcakes MÁS grandes */
  .cupcake {
  position: absolute;
  width: 96%;
  max-width: 560px;
  left: 2%;
  top: 4%;
  filter: drop-shadow(0 14px 25px rgba(0, 0, 0, 0.25));
  transform-origin: center;
  animation: floaty 4.8s ease-in-out infinite;
}

/* ✅ MÓVIL: que quepan */
@media (max-width: 860px) {
  .cupcake {
    width: 92%;
    max-width: 420px;
    left: 4%;
    top: 8%;
  }
}

  
  @keyframes floaty {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
  }
  
  /* Responsive */
  @media (max-width: 860px) {
    .card { grid-template-columns: 1fr; }
    .right { min-height: 320px; }
    .left { padding: 34px 24px; }
    .flower { width: 360px; }
  }
  </style>
  