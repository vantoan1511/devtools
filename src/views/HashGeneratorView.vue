<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <DToolbar>
      <template #start>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-fingerprint text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">
            Hash Generator
          </span>
        </div>

        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>

        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-2 px-3 py-1 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/50">
            <span class="text-[10px] font-bold uppercase text-surface-500">Uppercase</span>
            <ToggleButton v-model="isUppercase" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times"
              class="case-toggle" />
          </div>
        </div>
      </template>

      <template #end>
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearAll" />
      </template>
    </DToolbar>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-6">
      <div class="max-w-7xl mx-auto flex flex-col gap-6">
        <!-- Input Card -->
        <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden group">
          <template #title>
            <div class="flex items-center justify-between text-base px-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i class="pi pi-pencil text-primary"></i>
                </div>
                <span class="font-bold">Message Input</span>
              </div>
              <FileUpload mode="basic" name="file" accept="*" :maxFileSize="100000000" @select="onFileSelect"
                chooseLabel="Hash File" class="p-button-xs p-button-text" />
            </div>
          </template>
          <template #content>
            <div class="relative flex flex-col gap-4" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
              <Textarea v-model="inputText"
                class="w-full font-mono text-sm p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[120px]"
                placeholder="Enter text or drop a file here to compute hashes..." />

              <!-- Drop Overlay -->
              <div v-if="isDragging"
                class="absolute inset-0 z-10 bg-primary/10 backdrop-blur-[2px] border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center animate-in fade-in duration-200">
                <div class="p-4 rounded-full bg-white dark:bg-surface-900 shadow-lg mb-2 animate-bounce">
                  <i class="pi pi-cloud-upload text-2xl text-primary"></i>
                </div>
                <p class="font-bold text-xs text-primary">Drop to hash file</p>
              </div>

              <!-- Selected File Info -->
              <div v-if="selectedFile"
                class="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3 animate-in slide-in-from-top-2">
                <i class="pi pi-file text-xl text-primary"></i>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-sm truncate text-surface-900 dark:text-surface-0">{{ selectedFile.name }}
                  </div>
                  <div class="text-[10px] uppercase font-bold text-surface-500">{{ formatSize(selectedFile.size) }} • {{
                    selectedFile.type || 'Binary' }}</div>
                </div>
                <Button icon="pi pi-times" severity="secondary" text rounded size="small" @click="clearAll" />
              </div>
            </div>
          </template>
        </Card>

        <!-- Results Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="(alg, index) in algorithms" :key="alg.name"
            class="animate-in border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm group hover:ring-2 hover:ring-primary/10 transition-all duration-300"
            :style="{ animationDelay: `${index * 50}ms` }">
            <template #content>
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-xs font-black uppercase tracking-widest text-primary">{{ alg.name }}</span>
                    <span class="text-[9px] text-surface-400 font-medium">{{ alg.description }}</span>
                  </div>
                  <Button icon="pi pi-copy" severity="secondary" text rounded size="small" @click="copyHash(alg.hash)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    v-tooltip.bottom="'Copy'" />
                </div>
                <div class="relative group/hash">
                  <div
                    class="font-mono text-[10px] break-all p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 min-h-[4rem] flex items-center leading-relaxed text-surface-700 dark:text-surface-300 transition-colors group-hover/hash:border-primary/30">
                    {{ alg.hash || 'Enter input to compute...' }}
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div
      class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500 transition-colors duration-300">
      <div class="flex items-center gap-4">
        <span>Input: {{ charCount }} chars</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span class="flex items-center gap-1">
          <i :class="['pi text-[8px]', selectedFile ? 'pi-file text-primary' : 'pi-align-left text-surface-400']"></i>
          Mode: {{ selectedFile ? 'File' : 'Text' }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">Client-side Hashing</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DToolbar from '@/components/DToolbar.vue'
import CryptoJS from 'crypto-js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FileUpload from 'primevue/fileupload'
import Textarea from 'primevue/textarea'
import ToggleButton from 'primevue/togglebutton'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref, watch } from 'vue'

const toast = useToast()
const inputText = ref('')
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isUppercase = ref(false)

const charCount = computed(() => inputText.value.length)

const algorithms = ref([
  { name: 'MD5', hash: '', description: 'Message Digest Algorithm 5' },
  { name: 'SHA-1', hash: '', description: 'Secure Hash Algorithm 1' },
  { name: 'SHA-256', hash: '', description: 'Secure Hash Algorithm 256-bit' },
  { name: 'SHA-512', hash: '', description: 'Secure Hash Algorithm 512-bit' },
  { name: 'SHA-3', hash: '', description: 'Secure Hash Algorithm 3' },
  { name: 'RIPEMD-160', hash: '', description: 'RACE Integrity Primitives Evaluation Message Digest' }
])

const generateHashes = () => {
  if (selectedFile.value) return

  const text = inputText.value
  if (!text) {
    algorithms.value.forEach(a => a.hash = '')
    return
  }

  algorithms.value.forEach(alg => {
    let hash = ''
    switch (alg.name) {
      case 'MD5': hash = CryptoJS.MD5(text).toString(); break
      case 'SHA-1': hash = CryptoJS.SHA1(text).toString(); break
      case 'SHA-256': hash = CryptoJS.SHA256(text).toString(); break
      case 'SHA-512': hash = CryptoJS.SHA512(text).toString(); break
      case 'SHA-3': hash = CryptoJS.SHA3(text).toString(); break
      case 'RIPEMD-160': hash = CryptoJS.RIPEMD160(text).toString(); break
    }
    alg.hash = isUppercase.value ? hash.toUpperCase() : hash.toLowerCase()
  })
}

const hashFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    const wa = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer) as any)

    algorithms.value.forEach(alg => {
      let hash = ''
      switch (alg.name) {
        case 'MD5': hash = CryptoJS.MD5(wa).toString(); break
        case 'SHA-1': hash = CryptoJS.SHA1(wa).toString(); break
        case 'SHA-256': hash = CryptoJS.SHA256(wa).toString(); break
        case 'SHA-512': hash = CryptoJS.SHA512(wa).toString(); break
        case 'SHA-3': hash = CryptoJS.SHA3(wa).toString(); break
        case 'RIPEMD-160': hash = CryptoJS.RIPEMD160(wa).toString(); break
      }
      alg.hash = isUppercase.value ? hash.toUpperCase() : hash.toLowerCase()
    })

    toast.add({ severity: 'success', summary: 'File Hashed', detail: `Computed hashes for ${file.name}`, life: 2000 })
  }
  reader.readAsArrayBuffer(file)
}

watch(inputText, () => {
  if (!selectedFile.value) generateHashes()
})

watch(isUppercase, () => {
  algorithms.value.forEach(alg => {
    if (alg.hash) {
      alg.hash = isUppercase.value ? alg.hash.toUpperCase() : alg.hash.toLowerCase()
    }
  })
})

const onFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = `[File: ${file.name} - ${formatSize(file.size)}]`
    hashFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    selectedFile.value = file
    inputText.value = `[File: ${file.name} - ${formatSize(file.size)}]`
    hashFile(file)
  }
}

const clearAll = () => {
  inputText.value = ''
  selectedFile.value = null
  algorithms.value.forEach(a => a.hash = '')
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

.case-toggle {
  @apply w-8 h-5;
}

:deep(.case-toggle.p-togglebutton) {
  @apply bg-surface-200 dark:bg-surface-700 border-none;
}

:deep(.case-toggle.p-togglebutton.p-highlight) {
  @apply bg-primary;
}

:deep(.case-toggle .p-button-icon) {
  @apply text-[8px] text-white;
}

.animate-in {
  animation: animate-in 0.4s ease-out forwards;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.p-button-xs {
  @apply py-1 px-2 text-[10px] font-bold uppercase tracking-wider;
}

:deep(.p-card-body) {
  @apply p-4!;
}
</style>
