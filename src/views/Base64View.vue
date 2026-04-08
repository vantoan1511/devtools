<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-lock text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">
            Base64 Tool
          </span>
        </div>

        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>

        <div class="flex items-center gap-2">
          <div
            class="flex items-center bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-surface-200 dark:border-surface-700">
            <Button label="Encode" icon="pi pi-lock" size="small" text @click="encode" class="hover:bg-primary/10"
              v-tooltip.bottom="'Encode to Base64'" />
            <Button label="Decode" icon="pi pi-lock-open" size="small" text severity="secondary" @click="decode"
              class="hover:bg-surface-200 dark:hover:bg-surface-700" v-tooltip.bottom="'Decode from Base64'" />
          </div>

          <Button icon="pi pi-sync" size="small" severity="secondary" text rounded @click="swap"
            v-tooltip.bottom="'Swap Input/Output'" />

          <div
            class="flex items-center gap-2 px-3 py-1 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/50">
            <span class="text-[10px] font-bold uppercase text-surface-500">URL Safe</span>
            <ToggleButton v-model="isUrlSafe" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times"
              class="url-safe-toggle" />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-6">
      <div class="max-w-7xl mx-auto h-full flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <!-- Input Card -->
          <Card
            class="flex flex-col border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden group">
            <template #title>
              <div class="flex items-center justify-between text-base px-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i class="pi pi-sign-in text-primary"></i>
                  </div>
                  <span class="font-bold">Input Source</span>
                </div>
                <FileUpload mode="basic" name="file" accept="*" :maxFileSize="50000000" @select="onFileSelect"
                  chooseLabel="Upload File" class="p-button-xs p-button-text" />
              </div>
            </template>
            <template #content>
              <div class="relative flex-1 flex flex-col gap-4 h-full" @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
                <Textarea v-model="inputText"
                  class="flex-1 min-h-[300px] w-full font-mono text-sm p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Enter text or drop any file here..." />

                <!-- Drop Overlay -->
                <div v-if="isDragging"
                  class="absolute inset-0 z-10 bg-primary/10 backdrop-blur-[2px] border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center animate-in fade-in duration-200">
                  <div class="p-6 rounded-full bg-white dark:bg-surface-900 shadow-xl mb-4 animate-bounce">
                    <i class="pi pi-cloud-upload text-4xl text-primary"></i>
                  </div>
                  <p class="font-bold text-primary">Drop to load and encode file</p>
                </div>
              </div>
            </template>
          </Card>

          <!-- Output Card -->
          <Card
            class="flex flex-col border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
            <template #title>
              <div class="flex items-center justify-between text-base px-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <i class="pi pi-sign-out text-green-500"></i>
                  </div>
                  <span class="font-bold">Result Output</span>
                </div>
                <div class="flex gap-1">
                  <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyOutput"
                    v-tooltip.bottom="'Copy'" />
                  <Button icon="pi pi-download" size="small" severity="secondary" text rounded @click="downloadOutput"
                    v-tooltip.bottom="'Download'" />
                </div>
              </div>
            </template>
            <template #content>
              <Textarea v-model="outputText" readonly
                class="flex-1 min-h-[300px] w-full font-mono text-sm p-4 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 border-none resize-none"
                placeholder="Result will appear here..." />
            </template>
          </Card>
        </div>

        <!-- File Info Message -->
        <Message v-if="selectedFile" severity="info" class="border-none shadow-sm rounded-2xl bg-primary/5">
          <div class="flex items-center gap-4 py-1">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
              <i class="pi pi-file text-primary"></i>
            </div>
            <div class="flex-1">
              <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedFile.name }}</div>
              <div class="text-[10px] uppercase tracking-wider text-surface-500 font-bold">
                {{ formatSize(selectedFile.size) }} • {{ selectedFile.type || 'Unknown Type' }}
              </div>
            </div>
            <Button icon="pi pi-times" severity="secondary" text rounded @click="clearAll" />
          </div>
        </Message>
      </div>
    </div>

    <!-- Status Bar -->
    <div
      class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500 transition-colors duration-300">
      <div class="flex items-center gap-4">
        <span>Input: {{ charCount }} chars</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>Output: {{ outputCharCount }} chars</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span class="flex items-center gap-1">
          <i :class="['pi text-[8px]', isUrlSafe ? 'pi-check-circle text-primary' : 'pi-circle text-surface-400']"></i>
          URL Safe: {{ isUrlSafe ? 'ON' : 'OFF' }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">Local Processing</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Buffer } from 'buffer'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import ToggleButton from 'primevue/togglebutton'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const toast = useToast()
const inputText = ref('')
const outputText = ref('')
const selectedFile = ref<File | null>(null)
const isUrlSafe = ref(false)
const isDragging = ref(false)

const charCount = computed(() => inputText.value.length)
const outputCharCount = computed(() => outputText.value.length)

const isBase64 = (str: string) => {
  if (str === '' || str.trim() === '') return false
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

const encode = () => {
  try {
    let result = ''
    if (selectedFile.value) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const buffer = Buffer.from(arrayBuffer)
        result = buffer.toString('base64')
        if (isUrlSafe.value) {
          result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        }
        outputText.value = result
        toast.add({ severity: 'success', summary: 'Encoded', detail: 'File encoded to Base64', life: 2000 })
      }
      reader.readAsArrayBuffer(selectedFile.value)
    } else {
      if (!inputText.value) return
      result = Buffer.from(inputText.value, 'utf-8').toString('base64')
      if (isUrlSafe.value) {
        result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
      outputText.value = result
      toast.add({ severity: 'success', summary: 'Encoded', detail: 'Text encoded to Base64', life: 2000 })
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Encoding failed', life: 3000 })
  }
}

const decode = () => {
  try {
    if (!inputText.value) return
    let input = inputText.value.trim()

    // Handle URL-safe conversion back to standard if needed
    if (input.includes('-') || input.includes('_')) {
      input = input.replace(/-/g, '+').replace(/_/g, '/')
      while (input.length % 4) {
        input += '='
      }
    }

    const buffer = Buffer.from(input, 'base64')

    // Check if it's likely a binary file or text
    const isText = isUtf8(buffer)

    if (isText) {
      outputText.value = buffer.toString('utf-8')
      toast.add({ severity: 'success', summary: 'Decoded', detail: 'Base64 decoded to text', life: 2000 })
    } else {
      // It's binary, keep it as base64 but maybe it was a data URL
      outputText.value = input
      toast.add({ severity: 'info', summary: 'Binary Data', detail: 'Decoded content appears to be binary. Use Download.', life: 3000 })
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Decoding failed. Invalid Base64.', life: 3000 })
  }
}

// Simple UTF-8 check
const isUtf8 = (buf: Buffer) => {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0) return false // Null byte usually means binary
  }
  return true
}

const swap = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  selectedFile.value = null
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
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
    inputText.value = `[File: ${file.name} - ${formatSize(file.size)}]`
    encode()
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = `[File: ${file.name} - ${formatSize(file.size)}]`
    encode()
  }
}

const downloadOutput = () => {
  if (!outputText.value) return

  let blob: Blob
  let filename = 'decoded_file'

  try {
    let base64 = outputText.value.trim()
    if (base64.includes(';base64,')) {
      const parts = base64.split(';base64,')
      const mime = (parts[0] || '').split(':')[1] || 'application/octet-stream'
      const data = parts[1] || ''
      const buffer = Buffer.from(data, 'base64')
      blob = new Blob([buffer], { type: mime })
      filename = `download.${mime.split('/')[1] || 'bin'}`
    } else {
      // Try to treat as raw base64 binary
      const buffer = Buffer.from(base64, 'base64')
      blob = new Blob([buffer], { type: 'application/octet-stream' })
      filename = 'decoded_output.bin'
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    // If all else fails, download as text
    blob = new Blob([outputText.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
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

.url-safe-toggle {
  @apply w-8 h-5;
}

:deep(.url-safe-toggle.p-togglebutton) {
  @apply bg-surface-200 dark:bg-surface-700 border-none;
}

:deep(.url-safe-toggle.p-togglebutton.p-highlight) {
  @apply bg-primary;
}

:deep(.url-safe-toggle .p-button-icon) {
  @apply text-[8px] text-white;
}

:deep(.p-card-body) {
  @apply flex-1 flex flex-col p-4 ! h-full;
}

:deep(.p-card-content) {
  @apply flex-1 flex flex-col p-0 ! h-full min-h-0;
}

.p-button-xs {
  @apply py-1 px-2 text-[10px] font-bold uppercase tracking-wider;
}
</style>
