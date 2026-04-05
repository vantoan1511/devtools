<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">Hash Generator</h1>
        <p class="text-surface-600 dark:text-surface-400">Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or
          files.</p>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- Input Section -->
        <Card class="border-none shadow-sm glass-card">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-pencil text-xl text-primary"></i>
                <span>Input</span>
              </div>
              <div class="flex gap-2">
                <FileUpload mode="basic" name="file" accept="*" :maxFileSize="100000000" @select="onFileSelect"
                  chooseLabel="Load File" class="p-button-sm p-button-outlined" />
                <Button icon="pi pi-trash" severity="secondary" text rounded @click="clearInput" v-tooltip="'Clear'" />
              </div>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Textarea v-model="inputText" rows="6" class="w-full font-mono text-sm glass-input"
                placeholder="Enter text or drop a file here to generate hashes..." @drop.prevent="onDrop"
                @dragover.prevent />

              <div v-if="selectedFile"
                class="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4 animate-fade-in">
                <i class="pi pi-file text-2xl text-primary"></i>
                <div class="flex-1 overflow-hidden">
                  <div class="font-bold truncate">{{ selectedFile.name }}</div>
                  <div class="text-xs text-surface-500">{{ formatSize(selectedFile.size) }} - {{ selectedFile.type ||
                    'unknown' }}</div>
                </div>
                <Button icon="pi pi-times" severity="danger" text rounded @click="clearFile" />
              </div>
            </div>
          </template>
        </Card>

        <!-- Results Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card v-for="alg in algorithms" :key="alg.name" class="border-none shadow-sm glass-card h-full">
            <template #title>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold uppercase tracking-wider text-surface-500">{{ alg.name }}</span>
                <Button icon="pi pi-copy" severity="secondary" text rounded size="small" @click="copyHash(alg.hash)"
                  v-tooltip="'Copy Hash'" />
              </div>
            </template>
            <template #content>
              <div
                class="font-mono text-xs break-all p-3 rounded-lg bg-surface-100/50 dark:bg-surface-800/50 border border-white/5 min-h-[3rem] flex items-center">
                {{ alg.hash || '...' }}
              </div>
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
import FileUpload from 'primevue/fileupload'
import { useToast } from 'primevue/usetoast'
import CryptoJS from 'crypto-js'

const toast = useToast()
const inputText = ref('')
const selectedFile = ref<File | null>(null)

const algorithms = ref([
  { name: 'MD5', hash: '' },
  { name: 'SHA-1', hash: '' },
  { name: 'SHA-256', hash: '' },
  { name: 'SHA-512', hash: '' }
])

const generateHashes = () => {
  if (selectedFile.value) {
    // File hashing is handled by the file reader
    return
  }

  const text = inputText.value
  if (!text) {
    algorithms.value.forEach(a => a.hash = '')
    return
  }

  if (algorithms.value[0]) algorithms.value[0].hash = CryptoJS.MD5(text).toString()
  if (algorithms.value[1]) algorithms.value[1].hash = CryptoJS.SHA1(text).toString()
  if (algorithms.value[2]) algorithms.value[2].hash = CryptoJS.SHA256(text).toString()
  if (algorithms.value[3]) algorithms.value[3].hash = CryptoJS.SHA512(text).toString()
  }

  const hashFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    const wa = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer) as any)

    if (algorithms.value[0]) algorithms.value[0].hash = CryptoJS.MD5(wa).toString()
    if (algorithms.value[1]) algorithms.value[1].hash = CryptoJS.SHA1(wa).toString()
    if (algorithms.value[2]) algorithms.value[2].hash = CryptoJS.SHA256(wa).toString()
    if (algorithms.value[3]) algorithms.value[3].hash = CryptoJS.SHA512(wa).toString()

    toast.add({ severity: 'success', summary: 'File Hashed', detail: `Computed hashes for ${file.name}`, life: 2000 })
  }
  reader.readAsArrayBuffer(file)
  }
watch(inputText, () => {
  if (!selectedFile.value) {
    generateHashes()
  }
})

const onFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = ''
    hashFile(file)
  }
}

const onDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = ''
    hashFile(file)
  }
}

const clearInput = () => {
  inputText.value = ''
  selectedFile.value = null
  algorithms.value.forEach(a => a.hash = '')
}

const clearFile = () => {
  selectedFile.value = null
  generateHashes()
}

const copyHash = (hash: string) => {
  if (!hash) return
  navigator.clipboard.writeText(hash)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Hash copied to clipboard', life: 2000 })
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  generateHashes()
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
