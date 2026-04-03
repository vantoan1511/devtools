<script setup lang="ts">
import Card from 'primevue/card'
</script>

<template>
  <div class="about-container bg-surface-50 dark:bg-surface-950 p-4 flex-1">
    <div class="max-w-7xl mx-auto">
      <Card class="border-none shadow-2">
        <template #title>About DevTool</template>
        <template #content>
          <p class="text-surface-600 dark:text-surface-400 line-height-3 mb-4">
            DevTool is a collection of common tools for developers, built with modern web technologies like Vue 3, PrimeVue, and Monaco Editor.
          </p>
          
          <h3 class="text-surface-900 dark:text-surface-0 font-bold mb-2">Features</h3>
          <ul class="list-none p-0 m-0 text-surface-600 dark:text-surface-400 line-height-3">
            <li class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-check text-green-500 font-bold"></i>
              <span>OpenAPI Editor with live preview</span>
            </li>
            <li class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-check text-green-500 font-bold"></i>
              <span>Modern and authentic UI with Aura preset</span>
            </li>
            <li class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-check text-green-500 font-bold"></i>
              <span>Dark mode support</span>
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  min-height: 100%;
}
.max-w-7xl {
  max-width: 80rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
