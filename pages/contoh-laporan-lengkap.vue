<template>
  <div />
</template>

<script setup lang="ts">
const { public: { demoResultId } } = useRuntimeConfig()
await navigateTo(`/results/${demoResultId}`, { replace: true })
</script>
