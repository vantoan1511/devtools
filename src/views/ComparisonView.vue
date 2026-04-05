<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Message from 'primevue/message'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const toast = useToast()
const diffContainer = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
const viewModes = ref([
  { label: 'Side-by-Side', value: 'side' },
  { label: 'Inline', value: 'inline' }
])
const selectedViewMode = ref('side')

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
        '// Paste original text here\nconst hello = "world";\nconsole.log(hello);',
        'javascript'
      )
      const modifiedModel = monaco.editor.createModel(
        '// Paste modified text here\nconst hello = "DevTool+";\nconsole.log(hello);\n// Added a new line',
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
}

const swapTexts = () => {
  const models = diffEditor?.getModel()
  if (models) {
    const originalValue = models.original.getValue()
    const modifiedValue = models.modified.getValue()
    models.original.setValue(modifiedValue)
    models.modified.setValue(originalValue)
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
      class="z-10 flex items-center justify-between border-b border-white/10 bg-white/50 px-4 py-2 backdrop-blur-md dark:bg-surface-900/50">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100/50 dark:bg-surface-800/50 border border-white/10">
          <i class="pi pi-columns text-primary"></i>
          <span class="font-mono text-sm font-medium text-surface-700 dark:text-surface-200">
            Text Comparison
          </span>
        </div>

        <div class="h-4 w-[1px] bg-surface-200 dark:bg-surface-700"></div>

        <div class="flex items-center gap-2">
          <SelectButton v-model="selectedViewMode" :options="viewModes" optionLabel="label" optionValue="value" :allowEmpty="false" class="p-button-sm" />
          <Button label="Swap" icon="pi pi-sync" size="small" severity="secondary" @click="swapTexts" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button v-tooltip="'Copy Modified'" icon="pi pi-copy" size="small" severity="secondary" text rounded
          class="hover:bg-primary/10 transition-all duration-300" @click="copyModified" />
        <Button v-tooltip="'Clear'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearEditors" />
      </div>
    </div>

    <Message v-if="mountError" severity="error" class="m-2 rounded-xl">{{ mountError }}</Message>

    <!-- Editor -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="diffContainer" class="h-full w-full"></div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

:deep(.p-selectbutton .p-button) {
  @apply py-1 px-3 text-xs;
}
</style>
