<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-0 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70 transition-colors duration-300">
      <div class="flex flex-wrap items-center gap-3">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-file text-primary text-sm"></i>
          <div v-if="!isRenaming" @click="startRenaming" class="flex items-center gap-2 cursor-pointer group">
            <span class="font-bold text-xs uppercase tracking-wider text-primary">
              {{ currentProfile ? currentProfile.name : 'scratchpad.yaml' }}
            </span>
            <i v-if="currentProfile"
              class="pi pi-pencil text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div v-else class="flex items-center">
            <InputText v-model="newName" size="small" class="h-5 font-mono text-[10px] glass-input-mini"
              @keyup.enter="saveName" @blur="saveName" autofocus />
          </div>
        </div>

        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>

        <div class="flex items-center gap-1">
          <div class="flex items-center bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-surface-200 dark:border-surface-700 mr-2">
            <Button label="Prettify" icon="pi pi-sparkles" size="small" text @click="formatYaml" 
              class="hover:bg-primary/10 text-xs" v-tooltip.bottom="'Format YAML'"/>
            <Button label="Export" icon="pi pi-download" size="small" text severity="secondary" @click="downloadSpec" 
              class="hover:bg-surface-200 dark:hover:bg-surface-700 text-xs" v-tooltip.bottom="'Download YAML'"/>
          </div>

          <Button v-tooltip.bottom="'Toggle Editor Theme'" :icon="editorTheme === 'vs-dark' ? 'pi pi-moon' : 'pi pi-sun'" size="small" severity="secondary" text rounded
            class="hover:bg-primary/10 transition-all duration-300" @click="toggleEditorTheme" />
          <Button v-tooltip.bottom="'Copy Content'" icon="pi pi-copy" size="small" severity="secondary" text rounded
            class="hover:bg-primary/10 transition-all duration-300" @click="copyToClipboard" />
          <Button v-tooltip.bottom="'Reset Spec'" icon="pi pi-refresh" size="small" severity="secondary" text rounded
            class="hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-300" @click="resetSpec" />
          <Button v-if="currentProfile" v-tooltip.bottom="'Delete Profile'" icon="pi pi-trash" size="small"
            severity="secondary" text rounded class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
            @click="deleteProfile" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/50 mr-2">
          <span class="text-[10px] font-bold uppercase text-surface-500">Live Preview</span>
          <ToggleButton v-model="showPreview" onLabel="" offLabel="" onIcon="pi pi-eye" offIcon="pi pi-eye-slash" 
            class="preview-toggle" />
        </div>
      </div>
    </div>

    <Message v-if="mountError" severity="error" class="m-2 rounded-xl">{{ mountError }}</Message>

    <!-- Editor & Preview -->
    <div class="flex-1 relative overflow-hidden">
      <Splitter v-if="showPreview" class="h-full border-none bg-transparent" stateKey="openapi-editor-splitter"
        stateStorage="local">
        <SplitterPanel :size="50" :minSize="20">
          <div ref="editorContainer" class="h-full w-full"></div>
        </SplitterPanel>
        <SplitterPanel :size="50" :minSize="20"
          class="overflow-y-auto bg-white/30 dark:bg-surface-950/30 backdrop-blur-sm">
          <div id="swagger-ui-mount" class="p-6 swagger-modern shadow-inner"></div>
        </SplitterPanel>
      </Splitter>

      <!-- Full width editor when preview is hidden -->
      <div v-else ref="editorContainer" class="h-full w-full animate-fade-in"></div>
    </div>

    <!-- Status Bar -->
    <div class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500 transition-colors duration-300">
      <div class="flex items-center gap-4">
        <span>{{ lineCount }} Lines</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>{{ charCount }} Characters</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span class="flex items-center gap-1">
          <i class="pi pi-code text-[8px]"></i>
          YAML / OpenAPI
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">Swagger UI Powered</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProfileStore } from '@/stores/profileStore'
import jsYaml from 'js-yaml'
import * as monaco from 'monaco-editor'
import { useConfirm, useToast } from 'primevue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const confirm = useConfirm()
const toast = useToast()

const STORAGE_KEY = 'devtool_openapi_spec'

const defaultSpec = `openapi: 3.1.0
info:
  title: Hello World API
  version: 1.0.0
  description: A simple API to demonstrate the Monaco + Swagger Editor in DevTool.
paths:
  /hello:
    get:
      summary: Say Hello
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Hello, world!
`

const editorContainer = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
const isRenaming = ref(false)
const newName = ref('')
const showPreview = ref(true)
const charCount = ref(0)
const lineCount = ref(0)
const editorTheme = ref<'vs-dark' | 'vs'>('vs-dark')        

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let ui: any = null
let debounceTimer: number | null = null

const profileId = computed(() => route.params.id as string | undefined)
const currentProfile = computed(() =>
  profileId.value ? profileStore.profiles.find(p => p.id === profileId.value) : null
)

const initialSpec = computed(() => {
  if (currentProfile.value) {
    return currentProfile.value.spec
  }
  return localStorage.getItem(STORAGE_KEY) || defaultSpec
})

const updatePreview = (content: string) => {
  if (!ui || !showPreview.value) return

  try {
    const specObject = jsYaml.load(content)
    if (specObject && typeof specObject === 'object') {
      ui.specActions.updateSpec(JSON.stringify(specObject))
    }
  } catch (e) {
    // YAML parse error, ignore for preview
  }
}

const updateEditorTheme = () => {
  if (editor) {
    monaco.editor.setTheme(editorTheme.value)
  }
}

const syncEditorThemeWithSystem = () => {
  const isDarkMode = document.documentElement.classList.contains('p-dark')
  editorTheme.value = isDarkMode ? 'vs-dark' : 'vs'
  updateEditorTheme()
}

const toggleEditorTheme = () => {
  editorTheme.value = editorTheme.value === 'vs-dark' ? 'vs' : 'vs-dark'
  updateEditorTheme()
}

let observer: MutationObserver | null = null

const initEditor = (content?: string) => {
  if (editorContainer.value) {
    if (editor) {
      editor.dispose()
      editor = null
    }

    try {
      editor = monaco.editor.create(editorContainer.value, {
        value: content || initialSpec.value,
        language: 'yaml',
        theme: editorTheme.value,
        automaticLayout: true,
        minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },   
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 16 },
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        }
      })

      const updateStats = () => {
        const val = editor?.getValue() || ''
        charCount.value = val.length
        lineCount.value = editor?.getModel()?.getLineCount() || 0
      }

      updateStats()

      if (observer) observer.disconnect()
      observer = new MutationObserver(syncEditorThemeWithSystem)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

      editor.onDidChangeModelContent(() => {
        const content = editor?.getValue() || ''
        updateStats()
        if (profileId.value) {
          profileStore.updateProfileSpec(profileId.value, content)
        } else {
          localStorage.setItem(STORAGE_KEY, content)
        }

        if (debounceTimer) window.clearTimeout(debounceTimer)
        debounceTimer = window.setTimeout(() => {
          updatePreview(content)
        }, 500)
      })
    } catch (e) {
      console.error('Monaco init error:', e)
      mountError.value = 'Failed to initialize code editor.'
    }
  }
}

const initSwaggerUI = (specContent: string) => {
  try {
    const specObject = jsYaml.load(specContent) as Record<string, any>
    ui = SwaggerUIBundle({
      spec: specObject,
      dom_id: '#swagger-ui-mount',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: 'BaseLayout'
    })
  } catch (e) {
    console.error('Swagger UI init error:', e)
  }
}

onMounted(() => {
  editorTheme.value = document.documentElement.classList.contains('p-dark') ? 'vs-dark' : 'vs'
  initEditor()
  if (showPreview.value) {
    initSwaggerUI(initialSpec.value)
  }
})

watch(profileId, (newId) => {
  if (editor) {
    const newContent = initialSpec.value
    editor.setValue(newContent)
    updatePreview(newContent)
  }
})

watch(showPreview, async (val) => {
  const currentContent = editor?.getValue() || initialSpec.value

  await nextTick()
  initEditor(currentContent)

  if (val) {
    initSwaggerUI(currentContent)
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
  if (debounceTimer) window.clearTimeout(debounceTimer)
  if (observer) observer.disconnect()
})

const formatYaml = () => {
  if (!editor) return
  try {
    const content = editor.getValue()
    const obj = jsYaml.load(content)
    const formatted = jsYaml.dump(obj, { indent: 2, lineWidth: -1 })
    editor.setValue(formatted)
    toast.add({ severity: 'success', summary: 'Formatted', detail: 'YAML prettified successfully', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Format Error', detail: 'Invalid YAML structure', life: 3000 })
  }
}

const downloadSpec = () => {
  if (!editor) return
  const content = editor.getValue()
  const blob = new Blob([content], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const name = currentProfile.value ? currentProfile.value.name.replace(/\.[^/.]+$/, "") : 'openapi'
  a.href = url
  a.download = `${name}.yaml`
  a.click()
  URL.revokeObjectURL(url)
  toast.add({ severity: 'info', summary: 'Downloading', detail: 'Specification exported as YAML', life: 2000 })
}

const resetSpec = () => {
  const content = defaultSpec
  editor?.setValue(content)
  if (profileId.value) {
    profileStore.updateProfileSpec(profileId.value, content)
  } else {
    localStorage.setItem(STORAGE_KEY, content)
  }
  updatePreview(content)
}

const copyToClipboard = async () => {
  const content = editor?.getValue() || ''
  try {
    await navigator.clipboard.writeText(content)
    toast.add({ severity: 'info', summary: 'Copied', detail: 'Content copied to clipboard', life: 2000 })
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

const startRenaming = () => {
  if (currentProfile.value) {
    newName.value = currentProfile.value.name
    isRenaming.value = true
  }
}

const saveName = () => {
  if (profileId.value && newName.value.trim()) {
    profileStore.renameProfile(profileId.value, newName.value.trim())
  }
  isRenaming.value = false
}

const deleteProfile = () => {
  if (profileId.value) {
    confirm.require({
      message: 'This action cannot be undone. Are you sure you want to delete this spec?',
      header: 'Delete confirmation',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => {
        const idToDelete = profileId.value
        if (idToDelete) {
          profileStore.removeProfile(idToDelete)
          router.push('/openapi')
          toast.add({ severity: 'success', summary: 'Profile Deleted', detail: 'The OpenAPI spec profile has been deleted.', life: 3000 })
        }
      },
      reject: () => {
      }
    })
  }
}
</script>

<style scoped>
@reference "@/assets/main.css";

.glass-input-mini {
  @apply bg-transparent border-none focus:ring-0 p-0 m-0 w-32 text-primary font-bold;
}

.preview-toggle {
  @apply w-8 h-5;
}

:deep(.preview-toggle.p-togglebutton) {
  @apply bg-surface-200 dark:bg-surface-700 border-none;
}

:deep(.preview-toggle.p-togglebutton.p-highlight) {
  @apply bg-primary;
}

:deep(.preview-toggle .p-button-icon) {
  @apply text-[8px] text-white;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.99);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

:deep(.p-splitter) {
  @apply bg-transparent;
}

:deep(.p-splitter-gutter) {
  @apply bg-surface-200/20 dark:bg-surface-700/20 hover:bg-primary/30 transition-colors duration-300;
}

:deep(.p-splitter-gutter-handle) {
  @apply bg-primary/50 w-1 rounded-full;
}

/* Custom overrides for Swagger UI Modern & Glassmorphism */
:deep(.swagger-ui) {
  @apply transition-all duration-500 antialiased;
  color: var(--p-text-color);
  font-family: var(--p-font-family);
  background-color: transparent !important;
}

:deep(.swagger-ui .info) {
  @apply p-6 bg-white/40 dark:bg-surface-900/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-xl mb-8;
}

:deep(.swagger-ui .info .title) {
  @apply text-3xl font-black mb-2 text-primary tracking-tight;
}

:deep(.swagger-ui .info .description p) {
  @apply text-sm text-surface-700 dark:text-surface-300 leading-relaxed font-medium;
}

:deep(.swagger-ui .scheme-container) {
  @apply bg-white/40 dark:bg-surface-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-lg mt-6 p-4 mb-8;
}

/* Operation Blocks */
:deep(.swagger-ui .opblock) {
  @apply rounded-2xl border-none shadow-md overflow-hidden mb-5 bg-white/30 dark:bg-surface-900/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.005];
}

:deep(.swagger-ui .opblock-summary) {
  @apply border-none px-5 py-4 flex items-center gap-3;
}

:deep(.swagger-ui .opblock .opblock-summary-method) {
  @apply rounded-xl font-black text-[11px] min-w-[70px] px-3 py-1.5 text-center shadow-sm uppercase tracking-wider;
}

:deep(.swagger-ui .opblock-summary-path) {
  @apply font-mono font-bold text-sm text-surface-900 dark:text-surface-0;
}

:deep(.swagger-ui .opblock-summary-description) {
  @apply text-xs font-medium text-surface-600 dark:text-surface-400;
}

/* Specific Method Colors with Glassmorphism */
:deep(.swagger-ui .opblock-get) { @apply bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-500/30; }
:deep(.swagger-ui .opblock-get .opblock-summary-method) { @apply bg-blue-500 text-white shadow-blue-500/20; }

:deep(.swagger-ui .opblock-post) { @apply bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30; }
:deep(.swagger-ui .opblock-post .opblock-summary-method) { @apply bg-emerald-500 text-white shadow-emerald-500/20; }

:deep(.swagger-ui .opblock-put) { @apply bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/30; }
:deep(.swagger-ui .opblock-put .opblock-summary-method) { @apply bg-amber-500 text-white shadow-amber-500/20; }

:deep(.swagger-ui .opblock-delete) { @apply bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 dark:border-rose-500/30; }
:deep(.swagger-ui .opblock-delete .opblock-summary-method) { @apply bg-rose-500 text-white shadow-rose-500/20; }

:deep(.swagger-ui .opblock-patch) { @apply bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 dark:border-cyan-500/30; }
:deep(.swagger-ui .opblock-patch .opblock-summary-method) { @apply bg-cyan-500 text-white shadow-cyan-500/20; }

/* Tags/Groups */
:deep(.swagger-ui .opblock-tag) {
  @apply border-none bg-surface-100/60 dark:bg-surface-800/60 backdrop-blur-md text-surface-900 dark:text-surface-0 rounded-2xl px-6 py-4 mb-4 font-black text-lg tracking-tight transition-all flex items-center gap-3 border border-white/20 dark:border-white/10 shadow-sm;
}

:deep(.swagger-ui .opblock-tag:hover) {
  @apply bg-surface-200/70 dark:bg-surface-700/70 shadow-md;
}

:deep(.swagger-ui .opblock-tag small) {
  @apply text-xs font-medium text-surface-500 dark:text-surface-400 ml-2 lowercase tracking-normal opacity-80;
}

/* Sections inside Opblock */
:deep(.swagger-ui .opblock-section-header) {
  @apply bg-transparent px-5 py-4 border-b border-surface-200/50 dark:border-surface-700/50;
}

:deep(.swagger-ui .opblock-section-header h4) {
  @apply font-bold text-surface-800 dark:text-surface-200 uppercase tracking-widest text-[10px];
}

/* Forms & Inputs */
:deep(.swagger-ui .btn) {
  @apply rounded-xl font-bold transition-all shadow-md px-4 py-2 border-none active:scale-95;
}

:deep(.swagger-ui .btn.execute) {
  @apply bg-primary hover:bg-primary-emphasis text-white shadow-primary/20;
}

:deep(.swagger-ui .tab li button.tablinks) {
  @apply font-bold text-surface-500 dark:text-surface-400 border-none px-4 py-2 transition-all hover:text-primary dark:hover:text-primary;
}

:deep(.swagger-ui .tab li.active button.tablinks) {
  @apply text-primary border-b-2 border-primary;
}

:deep(.swagger-ui input[type=text]), 
:deep(.swagger-ui textarea),
:deep(.swagger-ui select) {
  @apply bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-surface-400 text-surface-900 dark:text-surface-0;
}

:deep(.swagger-ui select) {
  @apply cursor-pointer pr-10;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  appearance: none;
}

/* Neutralize internal backgrounds for glassmorphism */
:deep(.swagger-ui .opblock-body),
:deep(.swagger-ui .responses-table),
:deep(.swagger-ui .parameters-container),
:deep(.swagger-ui .parameters-table),
:deep(.swagger-ui .table-container) {
  @apply !bg-transparent;
}

/* Responses */
:deep(.swagger-ui .responses-inner) {
  @apply p-0 bg-transparent;
}

:deep(.swagger-ui .responses-inner h4),
:deep(.swagger-ui .responses-inner h5) {
  @apply font-bold text-surface-800 dark:text-surface-200 uppercase tracking-widest text-[10px] mb-3 mt-6;
}

:deep(.swagger-ui .response-col_status) {
  @apply font-mono font-black text-sm text-surface-900 dark:text-surface-0 p-4;
}

:deep(.swagger-ui .response-col_description) {
  @apply text-sm text-surface-700 dark:text-surface-300 p-4;
}

:deep(.swagger-ui .response-col_links) {
  @apply text-sm text-surface-700 dark:text-surface-300 p-4;
}

:deep(.swagger-ui table.headers td) {
  @apply text-sm text-surface-700 dark:text-surface-300 p-4 font-medium;
}

/* Schemas / Models */
:deep(.swagger-ui section.models) {
  @apply border border-surface-200 dark:border-surface-700 rounded-3xl overflow-hidden mt-12 shadow-sm bg-white/20 dark:bg-surface-900/20 backdrop-blur-sm;
}

:deep(.swagger-ui section.models h4) {
  @apply bg-surface-100/60 dark:bg-surface-800/60 backdrop-blur-md px-6 py-4 border-b border-surface-200/50 dark:border-surface-700/50 font-black uppercase tracking-wider text-xs flex items-center justify-between text-surface-600 dark:text-surface-400;
}

:deep(.swagger-ui section.models h4 span) {
  @apply flex items-center justify-center w-6 h-6 rounded-lg bg-surface-200/50 dark:bg-surface-700/50 transition-colors;
}

:deep(.swagger-ui .model-box) {
  @apply bg-transparent p-4;
}

:deep(.swagger-ui .model-title) {
  @apply font-bold text-primary;
}

:deep(.swagger-ui .model) {
  @apply font-mono text-sm text-surface-900 dark:text-surface-0;
}

:deep(.swagger-ui .prop-name) {
  @apply font-bold text-surface-800 dark:text-surface-200;
}

:deep(.swagger-ui .prop-type) {
  @apply text-primary font-medium;
}

:deep(.swagger-ui .model-hint) {
  @apply text-surface-500 dark:text-surface-400 text-xs italic;
}

/* Markdown and other text */
:deep(.swagger-ui .markdown p), 
:deep(.swagger-ui .markdown li),
:deep(.swagger-ui .opblock-description-wrapper p), 
:deep(.swagger-ui .opblock-external-docs-wrapper p), 
:deep(.swagger-ui .opblock-title_normal p) {
  @apply text-sm leading-relaxed text-surface-700 dark:text-surface-300 font-medium;
}

/* Dark mode specific tweaks for visibility */
:where(.p-dark) :deep(.swagger-ui) {
  --p-text-color: #f1f5f9; /* Slate 100 */
}

:deep(.swagger-ui table thead tr td), 
:deep(.swagger-ui table thead tr th) {
  @apply border-b border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 font-bold uppercase text-[10px] tracking-widest p-4;
}

:deep(.swagger-ui .parameters-col_name) {
  @apply font-bold text-surface-900 dark:text-surface-0;
}

:deep(.swagger-ui .parameter__name) {
  @apply font-mono text-primary font-bold;
}

:deep(.swagger-ui .parameter__type) {
  @apply font-mono text-[10px] text-surface-500 dark:text-surface-400;
}
</style>
