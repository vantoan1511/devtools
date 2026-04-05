<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Message from 'primevue/message'
import FileUpload from 'primevue/fileupload'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const toast = useToast()
const diffContainer = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
const viewModes = ref([
  { label: 'Side-by-Side', value: 'side' },
  { label: 'Inline', value: 'inline' }
])
const selectedViewMode = ref('side')

const CHUNK_SIZE = 1024 * 512 // 512KB chunks for smoother loading
const originalFile = ref<File | null>(null)
const modifiedFile = ref<File | null>(null)
const originalChunksLoaded = ref(0)
const modifiedChunksLoaded = ref(0)
const isLoading = ref(false)

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
    'js': 'javascript',
    'ts': 'typescript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'sh': 'shell',
    'log': 'text',
    'txt': 'text',
    'sql': 'sql',
    'php': 'php'
  }
  return map[ext || ''] || 'text'
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
    toast.add({ severity: 'success', summary: 'File Loaded', detail: `${file.name} (First chunk)`, life: 2000 })
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
  if (chunksLoaded.value * CHUNK_SIZE >= file.size) {
    toast.add({ severity: 'info', summary: 'End of File', detail: 'Entire file already loaded.', life: 2000 })
    return
  }

  isLoading.value = true
  try {
    await loadFileChunk(file, chunksLoaded.value, model)
    chunksLoaded.value++
    toast.add({ severity: 'success', summary: 'More Loaded', detail: `Loaded chunk ${chunksLoaded.value}`, life: 1500 })
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
      })

      const originalModel = monaco.editor.createModel(
        '// Paste original text or upload a file\nconst hello = "world";\nconsole.log(hello);',
        'javascript'
      )
      const modifiedModel = monaco.editor.createModel(
        '// Paste modified text or upload a file\nconst hello = "DevTool+";\nconsole.log(hello);\n// Added a new line',
        'javascript'
      )

      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel
      })

      observer = new MutationObserver(updateEditorTheme)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

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
  if (diffEditor) {
    diffEditor.updateOptions({
      renderSideBySide: newMode === 'side'
    })
  }
})

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
}

const swapTexts = () => {
  const models = diffEditor?.getModel()
  if (models) {
    const originalValue = models.original.getValue()
    const modifiedValue = models.modified.getValue()
    models.original.setValue(modifiedValue)
    models.modified.setValue(originalValue)

    // Swap file metadata too
    const tempFile = originalFile.value
    originalFile.value = modifiedFile.value
    modifiedFile.value = tempFile

    const tempChunks = originalChunksLoaded.value
    originalChunksLoaded.value = modifiedChunksLoaded.value
    modifiedChunksLoaded.value = tempChunks
  }
}

const copyModified = async () => {
  const models = diffEditor?.getModel()
  const content = models?.modified.getValue() || ''
  if (!content) return
  try {
    await navigator.clipboard.writeText(content)
    toast.add({ severity: 'info', summary: 'Copied', detail: 'Modified content copied to clipboard', life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy', life: 2000 })
  }
}
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-0 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-white/10 bg-white/50 px-4 py-2 backdrop-blur-md dark:bg-surface-900/50 gap-y-2">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100/50 dark:bg-surface-800/50 border border-white/10">
          <i class="pi pi-columns text-primary"></i>
          <span class="font-mono text-sm font-medium text-surface-700 dark:text-surface-200">
            Text Comparison
          </span>
        </div>

        <div class="h-4 w-[1px] bg-surface-200 dark:bg-surface-700 hidden sm:block"></div>

        <div class="flex items-center gap-2">
          <SelectButton v-model="selectedViewMode" :options="viewModes" optionLabel="label" optionValue="value"
            :allowEmpty="false" class="p-button-sm" />
          <Button label="Swap" icon="pi pi-sync" size="small" severity="secondary" @click="swapTexts" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex gap-1 mr-2 border-r border-white/10 pr-2">
          <div class="flex flex-col gap-1">
            <FileUpload mode="basic" name="original" accept="*" :maxFileSize="1000000000"
              @select="(e) => handleFileSelect(e, 'original')" chooseLabel="Original File"
              class="p-button-xs p-button-outlined" />
            <Button v-if="originalFile && originalChunksLoaded * CHUNK_SIZE < originalFile.size" label="Load More"
              size="small" text class="py-0 text-[10px]" @click="loadMore('original')" :loading="isLoading" />
          </div>
          <div class="flex flex-col gap-1">
            <FileUpload mode="basic" name="modified" accept="*" :maxFileSize="1000000000"
              @select="(e) => handleFileSelect(e, 'modified')" chooseLabel="Modified File"
              class="p-button-xs p-button-outlined" />
            <Button v-if="modifiedFile && modifiedChunksLoaded * CHUNK_SIZE < modifiedFile.size" label="Load More"
              size="small" text class="py-0 text-[10px]" @click="loadMore('modified')" :loading="isLoading" />
          </div>
        </div>
        <Button v-tooltip="'Copy Modified'" icon="pi pi-copy" size="small" severity="secondary" text rounded
          class="hover:bg-primary/10 transition-all duration-300" @click="copyModified" />
        <Button v-tooltip="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearEditors" />
      </div>
    </div>

    <Message v-if="mountError" severity="error" class="m-2 rounded-xl">{{ mountError }}</Message>

    <!-- Editor -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="diffContainer" class="h-full w-full"></div>
      <div v-if="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-surface-50/20 backdrop-blur-[1px] pointer-events-none">
         <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

:deep(.p-selectbutton .p-button) {
  @apply py-1 px-3 text-xs;
}

:deep(.p-fileupload-basic .p-button) {
  @apply py-1 px-2 text-[10px] h-7;
}

.p-button-xs {
  @apply py-1 px-2 text-[10px] h-7;
}
</style>
