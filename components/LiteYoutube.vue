<template>
  <div
    class="relative w-full cursor-pointer overflow-hidden bg-black"
    style="padding-bottom: 56.25%;"
    @click="play"
  >
    <img
      :src="`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`"
      :alt="title"
      class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
      :class="active ? 'opacity-0 pointer-events-none' : 'opacity-100'"
      @error="(e) => (e.target.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`)"
    />
    <button
      v-if="!active"
      aria-label="Play video"
      class="absolute inset-0 flex items-center justify-center"
    >
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform hover:scale-110">
        <svg class="h-7 w-7 translate-x-0.5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
    <iframe
      v-if="active"
      :src="`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`"
      :title="title"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      class="absolute inset-0 h-full w-full border-0"
    />
  </div>
</template>

<script setup>
defineProps({ id: String, title: { type: String, default: 'YouTube video' } })
const active = ref(false)
const play = () => { active.value = true }
</script>
