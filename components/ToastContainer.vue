<template>
  <div class="fixed bottom-5 left-4 z-[100] flex flex-col gap-2 md:left-5">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex w-72 items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-lg"
      >
        <!-- Avatar dengan dot hijau -->
        <div class="relative shrink-0">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
            :style="{ backgroundColor: toast.color }"
          >
            {{ toast.initials }}
          </div>
          <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <!-- Teks -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold leading-tight text-gray-800">{{ toast.name }}</p>
          <p class="mt-0.5 text-xs leading-snug text-gray-400">{{ toast.activity }} · {{ toast.time }}</p>
        </div>
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
.toast-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from  { opacity: 0; transform: translateY(16px) scale(0.95); }
.toast-leave-to    { opacity: 0; transform: translateY(8px); }
</style>
