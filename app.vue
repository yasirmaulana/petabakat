<template>
  <div class="min-h-screen bg-cream text-stone-800">
    <NuxtPage />
  </div>
</template>

<style>
:root {
  --color-cream: #FDFBF7;
  --color-green: #2F5D4E;
  --color-gold: #C9A227;
}
.bg-cream { background-color: var(--color-cream); }
.text-green { color: var(--color-green); }
.bg-green { background-color: var(--color-green); }
.text-gold { color: var(--color-gold); }
.bg-gold { background-color: var(--color-gold); }
.border-gold { border-color: var(--color-gold); }
</style>
