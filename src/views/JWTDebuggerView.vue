<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">JWT Debugger</h1>
        <p class="text-surface-600 dark:text-surface-400">Decode and inspect JSON Web Tokens instantly.</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Input Section -->
        <Card class="h-full border-none shadow-sm glass-card">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-key text-xl text-primary"></i>
                <span>Encoded Token</span>
              </div>
              <Button icon="pi pi-trash" severity="secondary" text rounded @click="token = ''" v-tooltip="'Clear'" />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Textarea v-model="token" rows="18" class="w-full font-mono text-sm glass-input"
                placeholder="Paste your JWT here..." />
              <div v-if="error" class="text-red-500 text-sm font-medium">
                <i class="pi pi-exclamation-circle mr-1"></i>
                {{ error }}
              </div>
            </div>
          </template>
        </Card>

        <!-- Decoded Section -->
        <div class="flex flex-col gap-6">
          <!-- Header -->
          <Card class="border-none shadow-sm glass-card">
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-surface-500">
                  <i class="pi pi-cog"></i>
                  <span>Header</span>
                </div>
                <Button icon="pi pi-copy" severity="secondary" text rounded size="small" @click="copy(header)" v-tooltip="'Copy Header'" />
              </div>
            </template>
            <template #content>
              <pre class="font-mono text-xs p-4 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 border border-white/5 overflow-auto max-h-[200px]">{{ header || 'Waiting for token...' }}</pre>
            </template>
          </Card>

          <!-- Payload -->
          <Card class="border-none shadow-sm glass-card flex-1">
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-surface-500">
                  <i class="pi pi-database"></i>
                  <span>Payload</span>
                </div>
                <Button icon="pi pi-copy" severity="secondary" text rounded size="small" @click="copy(payload)" v-tooltip="'Copy Payload'" />
              </div>
            </template>
            <template #content>
              <pre class="font-mono text-xs p-4 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 border border-white/5 overflow-auto max-h-[400px]">{{ payload || 'Waiting for token...' }}</pre>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { Buffer } from 'buffer'

const toast = useToast()
const token = ref('')
const header = ref('')
const payload = ref('')
const error = ref('')

const decodeToken = () => {
  error.value = ''
  if (!token.value) {
    header.value = ''
    payload.value = ''
    return
  }

  const parts = token.value.trim().split('.')
  if (parts.length !== 3) {
    error.value = 'Invalid JWT format. A JWT should have 3 parts separated by dots.'
    header.value = ''
    payload.value = ''
    return
  }

  try {
    const part0 = parts[0]
    const part1 = parts[1]

    if (part0 && part1) {
      const headerDecoded = Buffer.from(part0, 'base64').toString('utf8')
      const payloadDecoded = Buffer.from(part1, 'base64').toString('utf8')

      header.value = JSON.stringify(JSON.parse(headerDecoded), null, 2)
      payload.value = JSON.stringify(JSON.parse(payloadDecoded), null, 2)
    }
  } catch (e) {
    error.value = 'Error decoding token: ' + (e as Error).message
    header.value = ''
    payload.value = ''
  }
}

watch(token, decodeToken)

const copy = (text: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Copied to clipboard', life: 2000 })
}

onMounted(() => {
  if (token.value) decodeToken()
})
</script>

<style scoped>
@reference "@/assets/main.css";

.glass-card {
  @apply bg-white/40 dark:bg-surface-900/40 backdrop-blur-xl border border-white/10;
}

.glass-input {
  @apply bg-white/50 dark:bg-surface-950/50 backdrop-blur-sm border-white/10 dark:border-surface-700/50 transition-all duration-300 focus:ring-2 focus:ring-primary/50;
}
</style>
