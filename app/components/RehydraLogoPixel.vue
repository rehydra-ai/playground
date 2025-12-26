<script setup lang="ts">
const props = withDefaults(defineProps<{
  iconSize?: number
  color?: 'color' | 'black' | 'white'
}>(), {
  iconSize: 32,
  color: 'color'
})

const textColor = computed(() => {
  switch (props.color) {
    case 'black': return 'text-slate-900'
    case 'white': return 'text-white'
    default: return 'text-white'
  }
})
</script>

<template>
  <div class="flex items-center gap-2.5">
    <RehydraIconPixel :size="iconSize" :color="color" />
    <span class="font-bold text-2xl tracking-tight font-mono" :class="textColor">
      rehydra
    </span>
  </div>
</template>
