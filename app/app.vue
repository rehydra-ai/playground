<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#3a6ea5' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'SCRUBBER - PII Anonymization Tool'
const description = 'Anonymize sensitive data before sending to ChatGPT, then restore it in the response.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp :toaster="{ position: 'bottom-right' }">
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
