<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-0 dark:bg-surface-950 overflow-auto">
    <!-- Toolbar -->
    <DToolbar :pill="true">
      <template #start>
        <div class="flex items-center gap-2">
          <i class="pi pi-database text-primary"></i>
          <span class="font-bold uppercase tracking-wider text-primary">JSON Formatter</span>
        </div>

        <Divider layout="vertical"/>

        <Button v-tooltip.bottom="'Format JSON'" icon="pi pi-sparkles" label="Beautify" text @click="formatJSON"/>
        <Button v-tooltip.bottom="'Minify JSON'" icon="pi pi-compress" label="Minify" severity="secondary" text
                @click="minifyJSON"/>
      </template>
      <template #center>
        <div class="flex items-center gap-1">
          <Button v-tooltip.bottom="'Sort Keys'" icon="pi pi-sort-alpha-down" rounded severity="secondary" size="small"
                  text
                  @click="sortKeys"/>
          <Button v-tooltip.bottom="'Fix Quotes (Single to Double)'" icon="pi pi-quote-left" rounded
                  severity="secondary" size="small" text
                  @click="fixQuotes"/>
          <Button v-tooltip.bottom="'Escape JSON String'" icon="pi pi-sign-in" rounded severity="secondary" size="small"
                  text
                  @click="escapeJSON"/>
          <Button v-tooltip.bottom="'Unescape String'" icon="pi pi-sign-out" rounded severity="secondary" size="small"
                  text
                  @click="unescapeJSON"/>
          <SelectButton v-model="selectedIndent" :allowEmpty="false" :options="indentOptions" optionLabel="label"
                        optionValue="value"/>
        </div>
      </template>

      <template #end>
        <Button v-if="!charCount" icon="pi pi-info-circle" label="Sample" rounded severity="secondary" text
                @click="insertSample"/>
        <Button v-tooltip.bottom="'Copy Content'" icon="pi pi-copy" rounded severity="secondary" text
                @click="copyToClipboard"/>
        <Button v-tooltip.bottom="'Clear Editor'" icon="pi pi-trash" rounded severity="secondary" text
                @click="clearEditor"/>
      </template>
    </DToolbar>

    <Message v-if="mountError" severity="error" class="m-2 rounded-xl">{{ mountError }}</Message>

    <!-- Editor -->
    <div class="flex-1 relative">
      <div ref="editorContainer" class="h-full w-full"></div>
    </div>

    <!-- Status Bar -->
    <div
        class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500 transition-colors duration-300">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <div
              :class="['w-2 h-2 rounded-full shadow-sm transition-colors duration-300', isValid ? 'bg-green-500' : 'bg-red-500 animate-pulse']">
          </div>
          <span :class="[isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
            {{ isValid ? 'Valid JSON' : 'Invalid JSON' }}
          </span>
        </div>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>{{ lineCount }} Lines</span>
        <span>{{ charCount }} Characters</span>
      </div>
      <div class="flex items-center gap-3">
        <span>Indent: {{ typeof selectedIndent === 'number' ? `${selectedIndent} spaces` : 'Tabs' }}</span>
        <span>JSON</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DToolbar from '@/components/DToolbar.vue'
import * as monaco from 'monaco-editor'
import Button from 'primevue/button'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import {useToast} from 'primevue/usetoast'
import {onBeforeUnmount, onMounted, ref} from 'vue'

const toast = useToast()
const editorContainer = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
const isValid = ref(true)
const charCount = ref(0)
const lineCount = ref(0)

const indentOptions = ref([
  {label: '2', value: 2},
  {label: '4', value: 4},
  {label: 'Tabs', value: '\t'}
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

const validateJSON = (value: string) => {
  if (!value.trim()) {
    isValid.value = true
    return
  }
  try {
    JSON.parse(value)
    isValid.value = true
  } catch (e) {
    isValid.value = false
  }
}

const initEditor = () => {
  if (editorContainer.value) {
    try {
      editor = monaco.editor.create(editorContainer.value, {
        value: '{\n  "message": "Paste your JSON here",\n  "status": "success",\n  "data": {\n    "id": 1,\n    "items": [1, 2, 3]\n  }\n}',
        language: 'json',
        theme: isDark.value ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: {enabled: false},
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: {top: 16},
        formatOnPaste: true,
        formatOnType: true,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        }
      })

      editor.onDidChangeModelContent(() => {
        const value = editor?.getValue() || ''
        validateJSON(value)
        charCount.value = value.length
        lineCount.value = editor?.getModel()?.getLineCount() || 0
      })

      // Initial validation
      const initialValue = editor.getValue()
      validateJSON(initialValue)
      charCount.value = initialValue.length
      lineCount.value = editor.getModel()?.getLineCount() || 0

      observer = new MutationObserver(updateEditorTheme)
      observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})

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
    toast.add({severity: 'success', summary: 'Success', detail: 'JSON Formatted', life: 2000})
  } catch (e) {
    toast.add({severity: 'error', summary: 'Invalid JSON', detail: (e as Error).message, life: 3000})
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
    toast.add({severity: 'success', summary: 'Success', detail: 'JSON Minified', life: 2000})
  } catch (e) {
    toast.add({severity: 'error', summary: 'Invalid JSON', detail: (e as Error).message, life: 3000})
  }
}

const sortKeys = () => {
  if (!editor) return
  try {
    const value = editor.getValue()
    if (!value.trim()) return

    const obj = JSON.parse(value)

    const sortObject = (o: any): any => {
      if (Array.isArray(o)) return o.map(sortObject)
      if (o !== null && typeof o === 'object') {
        return Object.keys(o).sort().reduce((acc: any, key) => {
          acc[key] = sortObject(o[key])
          return acc
        }, {})
      }
      return o
    }

    const sorted = sortObject(obj)
    editor.setValue(JSON.stringify(sorted, null, selectedIndent.value))
    toast.add({severity: 'success', summary: 'Sorted', detail: 'JSON keys sorted alphabetically', life: 2000})
  } catch (e) {
    toast.add({severity: 'error', summary: 'Invalid JSON', detail: (e as Error).message, life: 3000})
  }
}

const fixQuotes = () => {
  if (!editor) return
  const value = editor.getValue()
  // Replace single quotes with double quotes (basic attempt)
  const fixed = value.replace(/'/g, '"')
  editor.setValue(fixed)
  toast.add({severity: 'info', summary: 'Fixed', detail: 'Attempted to fix quotes', life: 2000})
}

const escapeJSON = () => {
  if (!editor) return
  const value = editor.getValue()
  editor.setValue(JSON.stringify(value))
  toast.add({severity: 'info', summary: 'Escaped', detail: 'Content escaped as JSON string', life: 2000})
}

const unescapeJSON = () => {
  if (!editor) return
  try {
    const value = editor.getValue().trim()
    // If it's a quoted string, try to parse it as a string
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      editor.setValue(JSON.parse(value))
      toast.add({severity: 'info', summary: 'Unescaped', detail: 'Content unescaped', life: 2000})
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Content does not look like an escaped string',
        life: 2000
      })
    }
  } catch (e) {
    toast.add({severity: 'error', summary: 'Error', detail: 'Failed to unescape', life: 2000})
  }
}

const clearEditor = () => {
  editor?.setValue('')
}

const insertSample = () => {
  editor?.setValue(JSON.stringify({
    id: "0001",
    type: "donut",
    name: "Cake",
    ppu: 0.55,
    batters: {
      batter: [
        {id: "1001", type: "Regular"},
        {id: "1002", type: "Chocolate"},
        {id: "1003", type: "Blueberry"}
      ]
    },
    topping: [
      {id: "5001", type: "None"},
      {id: "5002", type: "Glazed"},
      {id: "5005", type: "Sugar"}
    ]
  }, null, selectedIndent.value))
}

const copyToClipboard = async () => {
  const content = editor?.getValue() || ''
  if (!content) return
  try {
    await navigator.clipboard.writeText(content)
    toast.add({severity: 'info', summary: 'Copied', detail: 'Content copied to clipboard', life: 2000})
  } catch (err) {
    toast.add({severity: 'error', summary: 'Error', detail: 'Failed to copy', life: 2000})
  }
}
</script>

<style scoped>
@reference "@/assets/main.css";

.custom-selectbutton :deep(.p-button) {
  @apply py-1 px-2.5 text-[10px] font-bold uppercase tracking-tighter border-none bg-transparent hover:bg-surface-200 dark:hover:bg-surface-800;
}

.custom-selectbutton :deep(.p-button.p-highlight) {
  @apply bg-primary/10 text-primary shadow-none;
}

.custom-selectbutton :deep(.p-button.p-highlight::before) {
  @apply hidden;
}

:deep(.p-selectbutton) {
  @apply bg-surface-100 dark:bg-surface-800 rounded-xl p-1 border border-surface-200 dark:border-surface-700;
}
</style>
