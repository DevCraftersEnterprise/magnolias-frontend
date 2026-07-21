<template>
  <div
    class="relative min-h-screen overflow-hidden grid place-items-center p-6 bg-[radial-gradient(1200px_700px_at_50%_45%,#ffe6f2_0%,#f8cfe0_40%,#f1b6cf_70%,#eaa6c6_100%)]"
  >
    <!-- Flores -->
    <img
      class="absolute pointer-events-none opacity-[0.35] w-[460px] max-w-[55vw] z-[1] top-[-120px] left-[-160px] -rotate-[8deg] max-[860px]:w-[260px] max-[860px]:max-w-[70vw] max-[860px]:opacity-[0.22] max-[860px]:top-[-70px] max-[860px]:left-[-90px]"
      src="/svg/flower-tl.svg"
      alt=""
    />
    <img
      class="absolute pointer-events-none opacity-[0.35] w-[460px] max-w-[55vw] z-[1] bottom-[-170px] right-[-160px] rotate-[185deg] max-[860px]:w-[260px] max-[860px]:max-w-[70vw] max-[860px]:opacity-[0.22] max-[860px]:bottom-[-90px] max-[860px]:right-[-90px]"
      src="/svg/flower-br.svg"
      alt=""
    />

    <div
      class="w-[min(980px,100%)] bg-white rounded-[18px] overflow-hidden relative z-[5] grid grid-cols-[1.08fr_0.92fr] shadow-[0_18px_60px_rgba(0,0,0,0.14)] border border-black/[0.06] max-[860px]:grid-cols-1 max-[860px]:rounded-2xl"
    >
      <div class="px-12 py-[44px] max-[860px]:px-6 max-[860px]:py-[34px]">
        <slot />
      </div>

      <div
        class="relative min-h-[520px] grid place-items-center bg-[linear-gradient(135deg,#ffb7df_0%,#ff8fd3_55%,#ff77c8_100%)] max-[860px]:min-h-[320px] max-[640px]:hidden"
      >
        <div class="w-full h-full relative">
          <img
            class="absolute w-[96%] max-w-[560px] left-[2%] top-[4%] origin-center animate-floaty drop-shadow-[0_14px_25px_rgba(0,0,0,0.25)] max-[860px]:w-[92%] max-[860px]:max-w-[420px] max-[860px]:left-[4%] max-[860px]:top-[8%]"
            src="/img/cupcakes.png"
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
</template>
