<template>
  <div class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex max-w-xs items-center gap-3 rounded-lg border border-brand-200 bg-white px-4 py-3 shadow-lg"
      >
        <span class="text-lg">🎯</span>
        <p class="text-sm font-medium text-gray-900">{{ toast.message }}</p>
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
