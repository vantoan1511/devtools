<template>
  <div class="__status-bar">
    <slot name="start"></slot>
    <slot name="center"></slot>
    <slot name="end"></slot>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
@reference '@/assets/main.css';

.__status-bar {
  @apply sticky bottom-0 z-10;
  @apply flex items-center justify-between;
  @apply border-t border-surface-200 dark:border-surface-800 px-4 py-1.5;
  @apply text-[11px] font-medium text-surface-500 dark:text-surface-100;
  @apply transition-colors duration-300;
  @apply backdrop-blur-md;
}
</style>