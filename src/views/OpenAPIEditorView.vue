<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-0 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex items-center justify-between border-b border-white/10 bg-white/50 px-4 py-2 backdrop-blur-md dark:bg-surface-900/50">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100/50 dark:bg-surface-800/50 border border-white/10">
          <i class="pi pi-file text-primary"></i>
          <div v-if="!isRenaming" @click="startRenaming" class="flex items-center gap-2 cursor-pointer group">
            <span class="font-mono text-sm font-medium text-surface-700 dark:text-surface-200">
              {{ currentProfile ? currentProfile.name : 'scratchpad.yaml' }}
            </span>
            <i v-if="currentProfile"
              class="pi pi-pencil text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div v-else class="flex items-center">
            <InputText v-model="newName" size="small" class="h-6 font-mono text-xs glass-input-mini"
              @keyup.enter="saveName" @blur="saveName" autofocus />
          </div>
        </div>

        <div class="h-4 w-[1px] bg-surface-200 dark:bg-surface-700"></div>

        <div class="flex items-center gap-1">
          <Button v-tooltip="'Copy Content'" icon="pi pi-copy" size="small" severity="secondary" text rounded
            class="hover:bg-primary/10 transition-all duration-300" @click="copyToClipboard" />
          <Button v-tooltip="'Reset Spec'" icon="pi pi-refresh" size="small" severity="secondary" text rounded
            class="hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-300" @click="resetSpec" />
          <Button v-if="currentProfile" v-tooltip="'Delete Profile'" icon="pi pi-trash" size="small"
            severity="secondary" text rounded class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
            @click="deleteProfile" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button :icon="showPreview ? 'ri-layout-right-2-line' : 'ri-layout-column-line'" size="small"
          :severity="showPreview ? 'primary' : 'secondary'" class="text-xs transition-all duration-500"
          @click="showPreview = !showPreview" />
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
const confirm = useConfirm();
const toast = useToast();

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

const isDark = ref(document.documentElement.classList.contains('p-dark'))

const updateEditorTheme = () => {
  const dark = document.documentElement.classList.contains('p-dark')
  isDark.value = dark
  if (editor) {
    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs')
  }
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
        theme: isDark.value ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 16 }
      })

      if (observer) observer.disconnect()
      observer = new MutationObserver(updateEditorTheme)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

      editor.onDidChangeModelContent(() => {
        const content = editor?.getValue() || ''
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
    });
  }
}
</script>


<style scoped>
@reference "@/assets/main.css";

.glass-input-mini {
  @apply bg-transparent border-none focus:ring-0 p-0 m-0 w-32;
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

/* Custom overrides for Swagger UI Modern */
:deep(.swagger-ui) {
  @apply transition-all duration-500;
  color: var(--p-text-color);
  font-family: var(--p-font-family);
}

:deep(.swagger-ui .info) {
  @apply p-4 bg-surface-100/50 dark:bg-surface-800/50 rounded-2xl;
}

:deep(.swagger-ui .info .title) {
  @apply text-2xl font-bold mb-2 text-primary;
}

:deep(.swagger-ui .info .description p) {
  @apply text-sm text-surface-700 dark:text-surface-300;
}

:deep(.swagger-ui .scheme-container) {
  @apply bg-surface-100/50 dark:bg-surface-800/50 rounded-lg;
}

:deep(.swagger-ui .dialog-ux .backdrop-ux) {
  @apply bg-black/50 backdrop-blur-sm;
}

:deep(.swagger-ui .dialog-ux .modal-ux) {
  @apply bg-surface-100/90 dark:bg-surface-800/90 rounded-lg shadow-lg border border-white/10;
}

:deep(.swagger-ui .dialog-ux .modal-ux-header) {
  @apply border-b border-surface-600/10 dark:border-white/10 mb-4;
}

:deep(.swagger-ui .dialog-ux .modal-ux-header h3) {
  @apply text-lg font-semibold text-surface-800 dark:text-surface-200;
}

:deep(.swagger-ui .dialog-ux .modal-ux-content h4) {
  @apply text-sm font-medium text-surface-700 dark:text-surface-300 mb-2;
}

:deep(.swagger-ui label) {
  @apply text-sm text-surface-700 dark:text-surface-300;
}

:deep(.swagger-ui input[type=text]) {
  @apply bg-transparent border border-surface-300 dark:border-surface-600 rounded-md px-2 py-1 text-sm text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary focus:outline-none;
}

:deep(.swagger-ui .btn) {
  @apply text-white mx-2;
}

:deep(.swagger-ui .dialog-ux .modal-ux-header .close-modal) {
  @apply text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors duration-300;
}

:deep(.swagger-ui .opblock-tag) {
  @apply bg-surface-200/50 dark:bg-surface-700/50 text-surface-800 dark:text-surface-200 rounded-tl-lg rounded-tr-lg;
}

:deep(.swagger-ui .opblock-tag small) {
  @apply text-xs text-surface-600 dark:text-surface-400;
}
</style>
