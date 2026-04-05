<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 text-center">
        <h1 class="mb-2 text-4xl font-bold text-surface-900 dark:text-surface-0">Welcome to DevTool</h1>
        <p class="text-xl text-surface-600 dark:text-surface-400">Common tools for your everyday development</p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div class="h-full p-1">
          <Card
            class="h-full border-none shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border hover:border-2 hover:border-primary hover:border-dashed cursor-pointer">
            <template #title>
              <div class="flex items-center gap-2">
                <i class="pi pi-code text-2xl text-primary"></i>
                <span>OpenAPI Editor</span>
              </div>
            </template>
            <template #content>
              <p class="m-0 leading-relaxed text-surface-600 dark:text-surface-400">
                Edit and preview your OpenAPI specifications with a VS Code-like editor and live Swagger UI preview.
              </p>
            </template>
            <template #footer>
              <Button label="Open Editor" icon="pi pi-external-link" class="w-full" @click="router.push('/openapi')" />
            </template>
          </Card>
        </div>

        <div class="h-full p-1">
          <Card class="h-full border-none opacity-60 shadow-sm">
            <template #title>
              <div class="flex items-center gap-2">
                <i class="pi pi-database text-2xl text-primary"></i>
                <span>JSON Formatter</span>
              </div>
            </template>
            <template #content>
              <p class="m-0 leading-relaxed text-surface-600 dark:text-surface-400">
                Coming soon: Format, validate and minify your JSON data with ease.
              </p>
            </template>
            <template #footer>
              <Button label="Coming Soon" severity="secondary" disabled class="w-full" />
            </template>
          </Card>
        </div>

        <div class="h-full p-1">
          <Card
            class="h-full border-none shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border hover:border-2 hover:border-primary hover:border-dashed cursor-pointer">
            <template #title>
              <div class="flex items-center gap-2">
                <i class="pi pi-lock text-2xl text-primary"></i>
                <span>Base64 Tool</span>
              </div>
            </template>
            <template #content>
              <p class="m-0 leading-relaxed text-surface-600 dark:text-surface-400">
                Encode and decode strings and files to/from Base64 format.
              </p>
            </template>
            <template #footer>
              <Button label="Open Tool" icon="pi pi-external-link" class="w-full" @click="router.push('/base64')" />
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.home-container {
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
