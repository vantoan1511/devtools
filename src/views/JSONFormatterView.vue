<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Message from 'primevue/message'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const toast = useToast()
const editorContainer = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
const indentOptions = ref([
  { label: '2 Spaces', value: 2 },
  { label: '4 Spaces', value: 4 },
  { label: 'Tabs', value: '\t' }
])
const selectedIndent = ref(2)

let editor: monaco.editor.IStandaloneCodeEditor | null = null
const isDark = ref(document.documentElement.classList.contains('p-dark'))

const updateEditorTheme = () => {
  const dark = document.documentElement.classList.contains('p-dark')
  isDark.value = dark
  if (editor) {
    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs')
  }
}

let observer: MutationObserver | null = null

const initEditor = () => {
  if (editorContainer.value) {
    try {
      editor = monaco.editor.create(editorContainer.value, {
        value: '{\n  "message": "Paste your JSON here",\n  "status": "success",\n  "data": {\n    "id": 1,\n    "items": [1, 2, 3]\n  }\n}',
        language: 'json',
        theme: isDark.value ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 16 },
        formatOnPaste: true,
        formatOnType: true
      })

      observer = new MutationObserver(updateEditorTheme)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    } catch (e) {
      console.error('Monaco init error:', e)
      mountError.value = 'Failed to initialize code editor.'
    }
  }
}

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
  if (observer) observer.disconnect()
})

const formatJSON = () => {
  if (!editor) return
  try {
    const value = editor.getValue()
    if (!value.trim()) return

    const obj = JSON.parse(value)
    const formatted = JSON.stringify(obj, null, selectedIndent.value)
    editor.setValue(formatted)
    toast.add({ severity: 'success', summary: 'Success', detail: 'JSON Formatted', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Invalid JSON', detail: (e as Error).message, life: 3000 })
  }
}

const minifyJSON = () => {
  if (!editor) return
  try {
    const value = editor.getValue()
    if (!value.trim()) return

    const obj = JSON.parse(value)
    const minified = JSON.stringify(obj)
    editor.setValue(minified)
    toast.add({ severity: 'success', summary: 'Success', detail: 'JSON Minified', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Invalid JSON', detail: (e as Error).message, life: 3000 })
  }
}

const clearEditor = () => {
  editor?.setValue('')
}

const copyToClipboard = async () => {
  const content = editor?.getValue() || ''
  if (!content) return
  try {
    await navigator.clipboard.writeText(content)
    toast.add({ severity: 'info', summary: 'Copied', detail: 'Content copied to clipboard', life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy', life: 2000 })
  }
}
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-0 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex items-center justify-between border-b border-white/10 bg-white/50 px-4 py-2 backdrop-blur-md dark:bg-surface-900/50">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100/50 dark:bg-surface-800/50 border border-white/10">
          <i class="pi pi-database text-primary"></i>
          <span class="font-mono text-sm font-medium text-surface-700 dark:text-surface-200">
            JSON Formatter
          </span>
        </div>

        <div class="h-4 w-[1px] bg-surface-200 dark:bg-surface-700"></div>

        <div class="flex items-center gap-2">
          <SelectButton v-model="selectedIndent" :options="indentOptions" optionLabel="label" optionValue="value"
            :allowEmpty="false" class="p-button-sm" />
          <Button label="Format" icon="pi pi-align-left" size="small" @click="formatJSON" />
          <Button label="Minify" icon="pi pi-compress" size="small" severity="secondary" @click="minifyJSON" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button v-tooltip="'Copy Content'" icon="pi pi-copy" size="small" severity="secondary" text rounded
          class="hover:bg-primary/10 transition-all duration-300" @click="copyToClipboard" />
        <Button v-tooltip="'Clear'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearEditor" />
      </div>
    </div>

    <Message v-if="mountError" severity="error" class="m-2 rounded-xl">{{ mountError }}</Message>

    <!-- Editor -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="editorContainer" class="h-full w-full"></div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

:deep(.p-selectbutton .p-button) {
  @apply py-1 px-3 text-xs;
}
</style>
