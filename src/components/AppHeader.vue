<template>
  <header v-spotlight class="__header">
    <div class="flex items-center gap-4">
      <Button class="hover:rotate-90 transition-transform duration-300" icon="pi pi-bars" rounded severity="secondary"
              text @click="$emit('toggle-sidebar')"/>
      <div class="group flex items-center group cursor-pointer" @click="$router.push('/')">
          <span class="__logo">
            DevTools+
          </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <Button v-tooltip.bottom="'Star on GitHub'" aria-label="Star on GitHub" as="a"
              class="hover:bg-primary/10 transition-colors duration-300"
              href="https://github.com/vantoan1511/devtools" icon="pi pi-github" rel="noopener noreferrer" rounded
              severity="secondary"
              target="_blank" text/>

      <Button :icon="themeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" aria-label="Toggle Dark Mode"
              rounded severity="secondary" text
              @click="themeStore.toggleDarkMode()"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import {useThemeStore} from "@/stores/themeStore.ts";

defineEmits(['toggle-sidebar'])

const themeStore = useThemeStore()
</script>

<style scoped>
@reference '@/assets/main.css';

.__header {
  @apply sticky top-0 z-60 h-15;
  @apply flex items-center justify-between;
  @apply border-b border-white/10 px-6 backdrop-blur-md;
  @apply bg-primary-50/75 dark:bg-surface-900 shadow-lg;
  @apply transition-all duration-300;
}

.__logo {
  @apply text-xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-primary-emphasis group-hover:scale-110 transition-all duration-300;
}
</style>