<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">Base64 Encoder/Decoder</h1>
        <p class="text-surface-600 dark:text-surface-400">Encode and decode strings and files to/from Base64 format.</p>
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
              <div class="flex gap-2">
                <FileUpload mode="basic" name="file" accept="*" :maxFileSize="10000000" @select="onFileSelect"
                  chooseLabel="Load File" class="p-button-sm p-button-outlined" />
                <Button icon="pi pi-trash" severity="secondary" text rounded @click="inputText = ''"
                  v-tooltip="'Clear'" />
              </div>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Textarea v-model="inputText" rows="12" class="w-full font-mono text-sm glass-input"
                placeholder="Enter text or drop a file here..." @drop.prevent="onDrop" @dragover.prevent />
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
                <Button v-if="isOutputBase64File" label="Download File" icon="pi pi-download" severity="success"
                  class="p-button-sm" @click="downloadFile" />
                <Button icon="pi pi-copy" severity="secondary" text rounded @click="copyOutput" v-tooltip="'Copy'" />
                <Button icon="pi pi-trash" severity="secondary" text rounded @click="outputText = ''"
                  v-tooltip="'Clear'" />
              </div>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Textarea v-model="outputText" rows="12" readonly
                class="w-full font-mono text-sm glass-input bg-surface-100/50 dark:bg-surface-800/50"
                placeholder="Result will appear here..." />
              <div class="flex gap-2">
                <Button label="Swap" icon="pi pi-sync" severity="info" variant="outlined" class="w-full"
                  @click="swap" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- File Info (if applicable) -->
      <div v-if="selectedFile" class="mt-6">
        <Message severity="info" class="w-full">
          <div class="flex items-center gap-4">
            <i class="pi pi-file text-2xl"></i>
            <div>
              <div class="font-bold">Loaded File: {{ selectedFile.name }}</div>
              <div class="text-sm opacity-80">{{ formatSize(selectedFile.size) }} - {{ selectedFile.type }}</div>
            </div>
            <Button icon="pi pi-times" severity="danger" text rounded class="ml-auto" @click="clearFile" />
          </div>
        </Message>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const inputText = ref('')
const outputText = ref('')
const selectedFile = ref<File | null>(null)

const isOutputBase64File = computed(() => {
  // Simple check if output looks like a Data URL or just a large base64 string
  return outputText.value.includes(';base64,') || (outputText.value.length > 100 && !outputText.value.includes(' '))
})

const encode = () => {
  try {
    if (selectedFile.value) {
      const reader = new FileReader()
      reader.onload = (e) => {
        outputText.value = e.target?.result as string
        toast.add({ severity: 'success', summary: 'Success', detail: 'File encoded to Base64', life: 3000 })
      }
      reader.readAsDataURL(selectedFile.value)
    } else {
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
      toast.add({ severity: 'success', summary: 'Success', detail: 'Text encoded to Base64', life: 3000 })
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Encoding failed: ' + (e as Error).message, life: 3000 })
  }
}

const decode = () => {
  try {
    const input = inputText.value.trim()
    // Check if it's a data URL
    if (input.includes(';base64,')) {
      outputText.value = input // Keep as is, the download button will handle it
      toast.add({ severity: 'info', summary: 'Base64 File', detail: 'Data URL detected. Use Download to save the file.', life: 5000 })
    } else {
      outputText.value = decodeURIComponent(escape(atob(input)))
      toast.add({ severity: 'success', summary: 'Success', detail: 'Base64 decoded to text', life: 3000 })
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Decoding failed. Make sure the input is valid Base64.', life: 3000 })
  }
}

const swap = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  selectedFile.value = null
}

const copyOutput = () => {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Result copied to clipboard', life: 2000 })
}

const onFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = `[File: ${file.name}]`
  }
}

const onDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = `[File: ${file.name}]`
  }
}

const clearFile = () => {
  selectedFile.value = null
  inputText.value = ''
}

const downloadFile = () => {
  const input = outputText.value
  let base64 = input
  let fileName = 'decoded_file'
  let mimeType = 'application/octet-stream'

  if (input.includes(';base64,')) {
    const parts = input.split(';base64,') ?? ['', '']
    mimeType = parts[0]?.split(':')[1] as string || 'application/octet-stream'
    base64 = parts[1] as string
    // Try to guess extension from mime
    const ext = mimeType.split('/')[1] || 'bin'
    fileName = `download.${ext}`
  }

  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
