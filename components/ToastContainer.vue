<template>
  <div class="fixed left-1/2 top-16 z-[100] flex -translate-x-1/2 flex-col gap-2 md:bottom-6 md:left-auto md:right-4 md:top-auto md:translate-x-0">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex w-[calc(100vw-2rem)] max-w-sm items-center gap-4 rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 px-5 py-4 shadow-2xl ring-2 ring-yellow-200/50 md:w-auto"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xl shadow-md">
          🎯
        </div>
        <p class="text-sm font-bold text-amber-900">{{ toast.message }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

defineProps<{
  toasts: readonly Toast[]
}>()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
