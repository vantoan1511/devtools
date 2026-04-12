<template>
  <Toolbar class="__toolbar">
    <template #start>
      <div
          class="__toolbar-start">
        <slot name="start"></slot>
      </div>
    </template>

    <template #center>
      <div class="flex items-center gap-2">
        <slot name="center"></slot>
      </div>
    </template>

    <template #end>
      <div class="__toolbar-end">
        <slot name="end"></slot>
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
</script>

<style scoped>
@reference '@/assets/main.css';

.__toolbar {
  @apply sticky top-0 w-full h-fit z-10 bg-transparent border-none;
}

.__toolbar-start, .__toolbar-end {
  @apply flex flex-wrap items-center gap-3 px-2 py-4 rounded-md bg-primary-300/10 backdrop-grayscale-25 backdrop-blur-xs border border-surface-200/25 dark:border-surface-800;
}

</style>
