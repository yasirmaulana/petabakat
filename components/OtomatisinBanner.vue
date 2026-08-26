<template>
  <section
    class="relative flex w-full items-center justify-center overflow-hidden bg-cover bg-center px-4 py-10"
    :style="{ backgroundImage: 'url(/otomatisinwebid.png)' }"
  >
    <div class="absolute inset-0 bg-black/40" />
    <div class="relative z-10 flex max-w-5xl flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
      <div class="space-y-2">
        <p class="text-lg font-semibold text-white md:text-xl">
          Punya ide bisnis digital tapi terkendala biaya IT?
        </p>
        <p class="text-base font-bold text-yellow-400 md:text-lg">
          Mulai Bangun Produk Digitalmu Gratis Bersama Otomatisin!
        </p>
      </div>
      <a
        href="https://wa.me/6281586245143"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-yellow-300"
      >
        Konsultasi Gratis →
      </a>
    </div>
  </section>
</template>
