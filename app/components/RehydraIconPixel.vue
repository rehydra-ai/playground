<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: number
  color?: 'color' | 'black' | 'white'
}>(), {
  size: 32,
  color: 'color'
})

const gradientId = `rehydra-pixel-gradient-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
    class="shrink-0 [image-rendering:pixelated]">
    <defs v-if="color === 'color'">
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#06b6d4" />
        <stop offset="100%" style="stop-color:#14b8a6" />
      </linearGradient>
    </defs>
    <!-- Pixel art droplet - teardrop shape -->
    <rect x="15" y="2" width="2" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="14" y="4" width="4" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="13" y="6" width="6" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="12" y="8" width="8" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="10" y="10" width="12" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="8" y="12" width="16" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="6" y="14" width="20" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="6" y="16" width="20" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="6" y="18" width="20" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="6" y="20" width="20" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="8" y="22" width="16" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="10" y="24" width="12" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <rect x="12" y="26" width="8" height="2"
      :fill="color === 'color' ? `url(#${gradientId})` : color === 'black' ? '#0f172a' : 'white'" />
    <!-- Inner highlight pixels -->
    <template v-if="color === 'color'">
      <rect x="10" y="16" width="2" height="2" fill="white" opacity="0.5" />
      <rect x="10" y="18" width="2" height="2" fill="white" opacity="0.3" />
    </template>
    <template v-else-if="color === 'black'">
      <rect x="10" y="16" width="2" height="2" fill="white" opacity="0.4" />
      <rect x="10" y="18" width="2" height="2" fill="white" opacity="0.25" />
    </template>
    <template v-else>
      <rect x="10" y="16" width="2" height="2" fill="#0f172a" opacity="0.15" />
      <rect x="10" y="18" width="2" height="2" fill="#0f172a" opacity="0.1" />
    </template>
  </svg>
</template>
