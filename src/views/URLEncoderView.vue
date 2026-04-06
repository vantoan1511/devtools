<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">URL Encoder/Decoder</h1>
        <p class="text-surface-600 dark:text-surface-400">Safely encode or decode URLs and parameters for web development.</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Input Section -->
        <Card class="h-full border-none shadow-sm glass-card">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-sign-in text-xl text-primary"></i>
                <span>Input</span>
              </div>
              <Button icon="pi pi-trash" severity="secondary" text rounded @click="inputText = ''" v-tooltip="'Clear'" />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Textarea v-model="inputText" rows="12" class="w-full font-mono text-sm glass-input"
                placeholder="Enter text to encode or decode..." />
              <div class="flex gap-2">
                <Button label="Encode" icon="pi pi-lock" class="flex-1" @click="encode" />
                <Button label="Decode" icon="pi pi-lock-open" severity="secondary" class="flex-1" @click="decode" />
              </div>
            </div>
          </template>
        </Card>

        <!-- Output Section -->
        <Card class="h-full border-none shadow-sm glass-card">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-sign-out text-xl text-primary"></i>
                <span>Output</span>
              </div>
              <div class="flex gap-2">
                <Button icon="pi pi-copy" severity="secondary" text rounded @click="copyOutput" v-tooltip="'Copy'" />
                <Button icon="pi pi-trash" severity="secondary" text rounded @click="outputText = ''" v-tooltip="'Clear'" />
              </div>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Textarea v-model="outputText" rows="12" readonly
                class="w-full font-mono text-sm glass-input bg-surface-100/50 dark:bg-surface-800/50"
                placeholder="Result will appear here..." />
              <div class="flex gap-2">
                <Button label="Swap" icon="pi pi-sync" severity="info" variant="outlined" class="w-full" @click="swap" />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const inputText = ref('')
const outputText = ref('')

const encode = () => {
  try {
    outputText.value = encodeURIComponent(inputText.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'URL encoded successfully', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Encoding failed: ' + (e as Error).message, life: 3000 })
  }
}

const decode = () => {
  try {
    outputText.value = decodeURIComponent(inputText.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'URL decoded successfully', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Decoding failed: ' + (e as Error).message, life: 3000 })
  }
}

const swap = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
}

const copyOutput = () => {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Result copied to clipboard', life: 2000 })
}
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
