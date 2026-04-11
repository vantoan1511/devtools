<script setup lang="ts">
import * as monaco from 'monaco-editor'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import ToggleButton from 'primevue/togglebutton'
import { useToast } from 'primevue/usetoast'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const toast = useToast()
const diffContainer = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
const viewModes = ref([
  { label: 'Split', value: 'side' },
  { label: 'Unified', value: 'inline' }
])
const selectedViewMode = ref('side')
const ignoreWhitespace = ref(true)

const CHUNK_SIZE = 1024 * 512 // 512KB chunks
const originalFile = ref<File | null>(null)
const modifiedFile = ref<File | null>(null)
const originalChunksLoaded = ref(0)
const modifiedChunksLoaded = ref(0)
const isLoading = ref(false)
const currentLanguage = ref('javascript')

const diffStats = ref({
  changes: 0,
  additions: 0,
  deletions: 0
})

let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null
const isDark = ref(document.documentElement.classList.contains('p-dark'))

const updateEditorTheme = () => {
  const dark = document.documentElement.classList.contains('p-dark')
  isDark.value = dark
  if (diffEditor) {
    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs')
  }
}

let observer: MutationObserver | null = null

const detectLanguage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    'js': 'javascript', 'ts': 'typescript', 'json': 'json', 'html': 'html',
    'css': 'css', 'md': 'markdown', 'yaml': 'yaml', 'yml': 'yaml',
    'xml': 'xml', 'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp',
    'cs': 'csharp', 'go': 'go', 'rs': 'rust', 'sh': 'shell', 'sql': 'sql', 'php': 'php'
  }
  const lang = map[ext || ''] || 'text'
  currentLanguage.value = lang
  return lang
}

const updateDiffStats = () => {
  if (!diffEditor) return
  const lineChanges = diffEditor.getLineChanges()
  if (!lineChanges) {
    diffStats.value = { changes: 0, additions: 0, deletions: 0 }
    return
  }

  let adds = 0
  let dels = 0
  lineChanges.forEach(change => {
    if (change.originalEndLineNumber === 0) {
      adds += (change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1)
    } else if (change.modifiedEndLineNumber === 0) {
      dels += (change.originalEndLineNumber - change.originalStartLineNumber + 1)
    } else {
      adds += (change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1)
      dels += (change.originalEndLineNumber - change.originalStartLineNumber + 1)
    }
  })
  
  diffStats.value = {
    changes: lineChanges.length,
    additions: adds,
    deletions: dels
  }
}

const loadFileChunk = async (file: File, startChunk: number, model: monaco.editor.ITextModel) => {
  const start = startChunk * CHUNK_SIZE
  const end = Math.min(start + CHUNK_SIZE, file.size)
  const blob = file.slice(start, end)

  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (startChunk === 0) {
        model.setValue(text)
      } else {
        const lineCount = model.getLineCount()
        const lastLineLength = model.getLineMaxColumn(lineCount)
        model.applyEdits([{
          range: new monaco.Range(lineCount, lastLineLength, lineCount, lastLineLength),
          text: text
        }])
      }
      resolve()
    }
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

const handleFileSelect = async (event: any, side: 'original' | 'modified') => {
  const file = event.files[0]
  if (!file) return

  isLoading.value = true
  const lang = detectLanguage(file.name)
  const models = diffEditor?.getModel()
  if (!models) return

  const model = side === 'original' ? models.original : models.modified
  monaco.editor.setModelLanguage(model, lang)

  if (side === 'original') {
    originalFile.value = file
    originalChunksLoaded.value = 1
  } else {
    modifiedFile.value = file
    modifiedChunksLoaded.value = 1
  }

  try {
    await loadFileChunk(file, 0, model)
    updateDiffStats()
    toast.add({ severity: 'success', summary: 'File Loaded', detail: file.name, life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Load Error', detail: (e as Error).message, life: 3000 })
  } finally {
    isLoading.value = false
  }
}

const loadMore = async (side: 'original' | 'modified') => {
  const file = side === 'original' ? originalFile.value : modifiedFile.value
  const chunksLoaded = side === 'original' ? originalChunksLoaded : modifiedChunksLoaded
  const models = diffEditor?.getModel()

  if (!file || !models) return

  const model = side === 'original' ? models.original : models.modified
  if (chunksLoaded.value * CHUNK_SIZE >= file.size) return

  isLoading.value = true
  try {
    await loadFileChunk(file, chunksLoaded.value, model)
    chunksLoaded.value++
    updateDiffStats()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Load Error', detail: (e as Error).message, life: 3000 })
  } finally {
    isLoading.value = false
  }
}

const initEditor = () => {
  if (diffContainer.value) {
    try {
      diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
        theme: isDark.value ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        renderSideBySide: selectedViewMode.value === 'side',
        originalEditable: true,
        ignoreTrimWhitespace: ignoreWhitespace.value,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        }
      })

      const originalModel = monaco.editor.createModel(
        '// Paste original text or upload a file\nconst hello = "world";\nconsole.log(hello);',
        'javascript'
      )
      const modifiedModel = monaco.editor.createModel(
        '// Paste modified text or upload a file\nconst hello = "DevTool+";\nconsole.log(hello);\n// Added a new line',
        'javascript'
      )

      diffEditor.setModel({ original: originalModel, modified: modifiedModel })
      
      diffEditor.onDidUpdateDiff(() => {
        updateDiffStats()
      })

      observer = new MutationObserver(updateEditorTheme)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      
      updateDiffStats()

    } catch (e) {
      console.error('Monaco Diff init error:', e)
      mountError.value = 'Failed to initialize diff editor.'
    }
  }
}

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (diffEditor) {
    diffEditor.dispose()
    diffEditor = null
  }
  if (observer) observer.disconnect()
})

watch(selectedViewMode, (newMode) => {
  diffEditor?.updateOptions({ renderSideBySide: newMode === 'side' })
})

watch(ignoreWhitespace, (ignore) => {
  diffEditor?.updateOptions({ ignoreTrimWhitespace: ignore })
})

const clearFile = (side: 'original' | 'modified') => {
  const models = diffEditor?.getModel()
  if (!models) return

  if (side === 'original') {
    models.original.setValue('')
    originalFile.value = null
    originalChunksLoaded.value = 0
  } else {
    models.modified.setValue('')
    modifiedFile.value = null
    modifiedChunksLoaded.value = 0
  }
  updateDiffStats()
}

const clearEditors = () => {
  const models = diffEditor?.getModel()
  if (models) {
    models.original.setValue('')
    models.modified.setValue('')
  }
  originalFile.value = null
  modifiedFile.value = null
  originalChunksLoaded.value = 0
  modifiedChunksLoaded.value = 0
  updateDiffStats()
}

const swapTexts = () => {
  const models = diffEditor?.getModel()
  if (models) {
    const originalValue = models.original.getValue()
    const modifiedValue = models.modified.getValue()
    models.original.setValue(modifiedValue)
    models.modified.setValue(originalValue)

    const tempFile = originalFile.value
    originalFile.value = modifiedFile.value
    modifiedFile.value = tempFile

    const tempChunks = originalChunksLoaded.value
    originalChunksLoaded.value = modifiedChunksLoaded.value
    modifiedChunksLoaded.value = tempChunks
    updateDiffStats()
  }
}

const copyModified = async () => {
  const models = diffEditor?.getModel()
  const content = models?.modified.getValue() || ''
  if (!content) return
  try {
    await navigator.clipboard.writeText(content)
    toast.add({ severity: 'info', summary: 'Copied', detail: 'Modified content copied', life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy', life: 2000 })
  }
}
const isDragging = ref(false)

const handleGlobalDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  if (files.length >= 2) {
    // If 2+ files, load first two as original and modified
    handleFileSelect({ files: [files[0]] }, 'original')
    handleFileSelect({ files: [files[1]] }, 'modified')
  } else {
    // If 1 file, load into the first empty slot or original if both are full
    if (!originalFile.value) {
      handleFileSelect({ files: [files[0]] }, 'original')
    } else if (!modifiedFile.value) {
      handleFileSelect({ files: [files[0]] }, 'modified')
    } else {
      handleFileSelect({ files: [files[0]] }, 'original')
    }
  }
}
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-0 dark:bg-surface-950 overflow-hidden"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleGlobalDrop">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70 gap-y-2 transition-colors duration-300">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-columns text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">
            Comparison Tool
          </span>
        </div>

        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>

        <div class="flex items-center gap-2">
          <SelectButton v-model="selectedViewMode" :options="viewModes" optionLabel="label" optionValue="value"
            :allowEmpty="false" class="custom-selectbutton" />
          
          <Button icon="pi pi-sync" size="small" severity="secondary" text rounded @click="swapTexts" 
            v-tooltip.bottom="'Swap Left/Right'" />

          <div class="flex items-center gap-2 px-3 py-1 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/50">
            <span class="text-[10px] font-bold uppercase text-surface-500">Ignore Whitespace</span>
            <ToggleButton v-model="ignoreWhitespace" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" 
              class="whitespace-toggle" />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 mr-2 border-r border-surface-200 dark:border-white/10 pr-2">
          <!-- Original File Group -->
          <div :class="['flex items-center gap-2 px-2 py-1 rounded-xl border transition-all duration-300', originalFile ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700']">
            <FileUpload mode="basic" name="original" accept="*" :auto="true" :maxFileSize="1000000000"
              @select="(e) => handleFileSelect(e, 'original')" 
              chooseLabel="Original"
              class="custom-upload-btn" />
            <span v-if="originalFile" class="text-[10px] max-w-[80px] truncate text-primary font-bold">
              {{ originalFile.name }}
            </span>
            <Button v-if="originalFile" icon="pi pi-times" size="small" text rounded class="h-5 w-5 p-0 text-[10px] hover:bg-primary/10" @click="clearFile('original')" />
          </div>

          <!-- Modified File Group -->
          <div :class="['flex items-center gap-2 px-2 py-1 rounded-xl border transition-all duration-300', modifiedFile ? 'bg-green-500/5 border-green-500/20 ring-1 ring-green-500/10' : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700']">
            <FileUpload mode="basic" name="modified" accept="*" :auto="true" :maxFileSize="1000000000"
              @select="(e) => handleFileSelect(e, 'modified')" 
              chooseLabel="Modified"
              class="custom-upload-btn" />
            <span v-if="modifiedFile" class="text-[10px] max-w-[80px] truncate text-green-600 dark:text-green-400 font-bold">
              {{ modifiedFile.name }}
            </span>
            <Button v-if="modifiedFile" icon="pi pi-times" size="small" text rounded class="h-5 w-5 p-0 text-[10px] hover:bg-green-500/10" @click="clearFile('modified')" />
          </div>
        </div>
        <Button v-tooltip.bottom="'Copy Modified'" icon="pi pi-copy" size="small" severity="secondary" text rounded
          @click="copyModified" />
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500" @click="clearEditors" />
      </div>
    </div>

    <Message v-if="mountError" severity="error" class="m-2 rounded-xl">{{ mountError }}</Message>

    <!-- Editor -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="diffContainer" class="h-full w-full"></div>

      <!-- Drop Overlay -->
      <div v-if="isDragging" 
        class="absolute inset-0 z-40 bg-primary/10 backdrop-blur-[2px] border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div class="p-6 rounded-full bg-white dark:bg-surface-900 shadow-xl mb-4 animate-bounce">
          <i class="pi pi-cloud-upload text-4xl text-primary"></i>
        </div>
        <p class="font-bold text-primary">Drop one or two files to compare</p>
      </div>
      
      <!-- Chunk Loaders Overlay -->
      <div v-if="(originalFile && originalChunksLoaded * CHUNK_SIZE < originalFile.size) || (modifiedFile && modifiedChunksLoaded * CHUNK_SIZE < modifiedFile.size)" 
        class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <Button v-if="originalFile && originalChunksLoaded * CHUNK_SIZE < originalFile.size" 
          label="Load more Original" size="small" rounded severity="info" class="shadow-lg" @click="loadMore('original')" :loading="isLoading" />
        <Button v-if="modifiedFile && modifiedChunksLoaded * CHUNK_SIZE < modifiedFile.size" 
          label="Load more Modified" size="small" rounded severity="info" class="shadow-lg" @click="loadMore('modified')" :loading="isLoading" />
      </div>

      <div v-if="isLoading" class="absolute inset-0 z-30 flex items-center justify-center bg-surface-50/20 backdrop-blur-[1px]">
         <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500 transition-colors duration-300">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5">
            <i class="pi pi-list text-[10px]"></i>
            {{ diffStats.changes }} Changes
          </span>
          <span class="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <i class="pi pi-plus text-[8px]"></i>
            {{ diffStats.additions }} Additions
          </span>
          <span class="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <i class="pi pi-minus text-[8px]"></i>
            {{ diffStats.deletions }} Deletions
          </span>
        </div>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span class="uppercase tracking-widest text-[9px] font-bold">{{ currentLanguage }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="originalFile" class="text-[10px] opacity-70">Original: {{ originalFile.name }}</span>
        <span v-if="modifiedFile" class="text-[10px] opacity-70">Modified: {{ modifiedFile.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.custom-selectbutton :deep(.p-button) {
  @apply py-1 px-2.5 text-[10px] font-bold uppercase tracking-tighter border-none bg-transparent hover:bg-surface-200 dark:hover:bg-surface-800;
}

.custom-selectbutton :deep(.p-button.p-highlight) {
  @apply bg-primary/10 text-primary shadow-none;
}

:deep(.p-selectbutton) {
  @apply bg-surface-100 dark:bg-surface-800 rounded-xl p-1 border border-surface-200 dark:border-surface-700;
}

.whitespace-toggle {
  @apply w-8 h-5;
}

:deep(.whitespace-toggle.p-togglebutton) {
  @apply bg-surface-200 dark:bg-surface-700 border-none;
}

:deep(.whitespace-toggle.p-togglebutton.p-highlight) {
  @apply bg-primary;
}

:deep(.whitespace-toggle .p-button-icon) {
  @apply text-[8px] text-white;
}

.p-button-xs {
  @apply py-1 px-2 text-[10px] font-bold uppercase tracking-wider h-auto;
}
</style>
