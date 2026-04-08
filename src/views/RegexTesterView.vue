<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70 transition-colors duration-300">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-filter text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">RegEx Tester</span>
        </div>
        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>
        <SelectButton v-model="isReplaceMode" :options="modeOptions" optionLabel="label" optionValue="value"
          :allowEmpty="false" class="custom-selectbutton" />
      </div>

      <div class="flex items-center gap-2">
        <Button label="Copy JS" icon="pi pi-code" size="small" severity="secondary" text rounded @click="copyJS"
          class="text-xs" />
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-6">
      <div class="max-w-7xl mx-auto flex flex-col gap-6 h-full">
        <!-- Regex Input Card -->
        <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
          <template #content>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <div
                  class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-100 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span class="font-mono text-xl text-surface-400">/</span>
                  <InputText v-model="regexPattern" placeholder="enter your regex pattern here..."
                    class="flex-1 font-mono text-base bg-transparent border-none focus:ring-0 p-0" />
                  <span class="font-mono text-xl text-surface-400">/{{ activeFlags }}</span>
                </div>
                <div v-if="regexError"
                  class="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 px-2">
                  <i class="pi pi-exclamation-triangle"></i>
                  {{ regexError }}
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
                <div v-for="(val, key) in flags" :key="key" class="flex items-center gap-2 group cursor-pointer">
                  <Checkbox v-model="flags[key]" :inputId="'flag-' + key" :binary="true" class="custom-checkbox" />
                  <label :for="'flag-' + key"
                    class="text-[10px] font-bold uppercase tracking-widest text-surface-500 cursor-pointer group-hover:text-primary transition-colors">
                    {{ key }}
                  </label>
                </div>
              </div>

              <div v-if="isReplaceMode" class="animate-in slide-in-from-top-2">
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/5 border border-green-500/20">
                  <i class="pi pi-sync text-green-500 text-sm"></i>
                  <InputText v-model="substitutionText" placeholder="Replacement text (e.g. $1, $&)..."
                    class="flex-1 font-mono text-sm bg-transparent border-none focus:ring-0 p-0" />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <!-- Text Input & Library -->
          <div class="lg:col-span-8 flex flex-col gap-6">
            <Card
              class="flex-1 flex flex-col border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
              <template #title>
                <div class="flex items-center justify-between px-2">
                  <div class="flex items-center gap-2 text-base">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <i class="pi pi-align-left text-primary"></i>
                    </div>
                    <span class="font-bold">Test String</span>
                  </div>
                </div>
              </template>
              <template #content>
                <div
                  class="relative flex-1 min-h-[300px] rounded-2xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 overflow-hidden">
                  <div ref="highlighterRef" class="highlighter-container" v-html="highlightedText"></div>
                  <textarea v-model="testString" @scroll="syncScroll" ref="textareaRef" class="editor-textarea"
                    placeholder="Paste your test text here..."></textarea>
                </div>
              </template>
            </Card>

            <Card v-if="isReplaceMode"
              class="border-none shadow-sm bg-green-500/5 border border-green-500/10 backdrop-blur-sm animate-in">
              <template #title>
                <div class="flex items-center gap-2 text-base px-2">
                  <i class="pi pi-check-circle text-green-500"></i>
                  <span class="font-bold">Substitution Result</span>
                </div>
              </template>
              <template #content>
                <div
                  class="p-4 rounded-2xl bg-surface-50/50 dark:bg-surface-950/50 font-mono text-sm break-all min-h-[100px] leading-relaxed">
                  {{ replacedText }}
                </div>
              </template>
            </Card>
          </div>

          <!-- Side Panel: Matches & Library -->
          <div class="lg:col-span-4 flex flex-col gap-6">
            <Card
              class="flex-1 border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
              <template #content>
                <ScrollPanel class="match-scroll">
                  <div class="p-1">
                    <h3
                      class="text-xs font-black uppercase tracking-widest text-surface-400 mb-4 flex items-center justify-between">
                      Matches
                      <Tag :value="matches.length" severity="primary" rounded />
                    </h3>

                    <div v-if="matches.length === 0"
                      class="flex flex-col items-center justify-center py-20 text-surface-400 opacity-40">
                      <i class="pi pi-search text-4xl mb-2"></i>
                      <p class="text-xs font-bold uppercase">No matches found</p>
                    </div>

                    <div v-else class="flex flex-col gap-3">
                      <div v-for="(match, idx) in matches" :key="idx"
                        class="p-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/50 hover:ring-2 hover:ring-primary/10 transition-all group">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-[10px] font-black uppercase text-primary">Match {{ idx + 1 }}</span>
                          <span class="text-[10px] font-mono text-surface-400">@{{ match.index }}</span>
                        </div>
                        <div
                          class="font-mono text-xs break-all mb-2 p-2 bg-white dark:bg-surface-900 rounded-lg shadow-inner">
                          {{ match[0] }}
                        </div>
                        <div v-if="match.length > 1"
                          class="flex flex-col gap-1 border-t border-surface-200 dark:border-surface-700 pt-2 mt-2">
                          <div v-for="(group, gIdx) in match.slice(1)" :key="gIdx"
                            class="flex items-start gap-2 text-[10px] font-mono">
                            <span class="text-primary font-bold">G{{ gIdx + 1 }}:</span>
                            <span class="text-surface-600 dark:text-surface-400 break-all">{{ group || 'null' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollPanel>
              </template>
            </Card>

            <Card class="border-none shadow-sm bg-primary/5 border border-primary/10 overflow-hidden">
              <template #content>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Pattern Library</h3>
                <div class="flex flex-col gap-1">
                  <button v-for="item in library" :key="item.name" @click="applyFromLibrary(item.pattern)"
                    class="text-left px-3 py-2 rounded-lg text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-white dark:hover:bg-surface-900 hover:text-primary transition-all flex items-center justify-between group">
                    {{ item.name }}
                    <i class="pi pi-plus text-[8px] opacity-0 group-hover:opacity-100"></i>
                  </button>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div
      class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <div
            :class="['w-2 h-2 rounded-full transition-colors', regexPattern ? (regexError ? 'bg-red-500' : 'bg-green-500') : 'bg-surface-300']">
          </div>
          <span :class="[regexError ? 'text-red-500' : (regexPattern ? 'text-green-600' : '')]">
            {{ regexError ? 'Invalid Regex' : (regexPattern ? 'Valid Regex' : 'Empty Pattern') }}
          </span>
        </div>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>{{ matches.length }} Matches Found</span>
        <span>{{ testString.length }} Characters</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">JavaScript RegExp</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import ScrollPanel from 'primevue/scrollpanel'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'

const toast = useToast()

const regexPattern = ref('')
const testString = ref('The quick brown fox jumps over the lazy dog. 123-456-7890.')
const substitutionText = ref('')
const isReplaceMode = ref(false)
const regexError = ref('')

const flags = ref({
  global: true,
  ignoreCase: true,
  multiline: false,
  dotAll: false,
  unicode: false,
  sticky: false
})

const modeOptions = [
  { label: 'Match', value: false },
  { label: 'Replace', value: true }
]

const library = [
  { name: 'Email', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { name: 'IPv4', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
  { name: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' },
  { name: 'Phone (US)', pattern: '\\(\\d{3}\\)\\s\\d{3}-\\d{4}' }
]

const activeFlags = computed(() => {
  let f = ''
  if (flags.value.global) f += 'g'
  if (flags.value.ignoreCase) f += 'i'
  if (flags.value.multiline) f += 'm'
  if (flags.value.dotAll) f += 's'
  if (flags.value.unicode) f += 'u'
  if (flags.value.sticky) f += 'y'
  return f
})

const regex = computed(() => {
  regexError.value = ''
  if (!regexPattern.value) return null
  try {
    return new RegExp(regexPattern.value, activeFlags.value)
  } catch (e) {
    regexError.value = (e as Error).message
    return null
  }
})

const matches = computed(() => {
  if (!regex.value || !regexPattern.value || !testString.value) return []
  const results = []
  const str = testString.value
  try {
    if (flags.value.global) {
      const re = new RegExp(regexPattern.value, activeFlags.value)
      let match
      while ((match = re.exec(str)) !== null) {
        results.push(match)
        if (match.index === re.lastIndex) re.lastIndex++
        if (results.length > 2000) break
      }
    } else {
      const match = regex.value.exec(str)
      if (match) results.push(match)
    }
  } catch (e) { /* Error handled by regex computed */ }
  return results
})

const replacedText = computed(() => {
  if (!regex.value || !testString.value) return testString.value
  try {
    return testString.value.replace(regex.value, substitutionText.value)
  } catch (e) {
    return 'Error during replacement'
  }
})

const highlightedText = computed(() => {
  if (!testString.value) return ''
  if (!regex.value || !regexPattern.value) return escapeHtml(testString.value)

  const str = testString.value
  const res = []
  let lastIndex = 0

  try {
    for (const match of matches.value) {
      res.push(escapeHtml(str.substring(lastIndex, match.index)))
      res.push(`<mark class="match-mark">${escapeHtml(match[0])}</mark>`)
      lastIndex = match.index + match[0].length
    }
    res.push(escapeHtml(str.substring(lastIndex)))
  } catch (e) {
    return escapeHtml(testString.value)
  }
  return res.join('').replace(/\n/g, '<br>')
})

const highlighterRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const syncScroll = () => {
  if (highlighterRef.value && textareaRef.value) {
    highlighterRef.value.scrollTop = textareaRef.value.scrollTop
    highlighterRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
}

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const applyFromLibrary = (pattern: string) => {
  regexPattern.value = pattern
  toast.add({ severity: 'info', summary: 'Pattern Applied', detail: 'Regular expression loaded from library', life: 2000 })
}

const clearAll = () => {
  regexPattern.value = ''
  testString.value = ''
  substitutionText.value = ''
}

const copyJS = () => {
  const code = `const regex = /${regexPattern.value}/${activeFlags.value};\nconst str = \`${testString.value}\`;\nlet m;\n\nwhile ((m = regex.exec(str)) !== null) {\n  if (m.index === regex.lastIndex) {\n    regex.lastIndex++;\n  }\n  m.forEach((match, groupIndex) => {\n    console.log(\`Found match, group \${groupIndex}: \${match}\`);\n  });\n}`
  navigator.clipboard.writeText(code)
  toast.add({ severity: 'success', summary: 'Copied', detail: 'JavaScript snippet copied to clipboard', life: 2000 })
}

watch([testString, regexPattern, flags], () => {
  setTimeout(syncScroll, 0)
}, { deep: true })
</script>

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

.highlighter-container {
  @apply absolute inset-0 font-mono text-sm p-4 whitespace-pre-wrap break-all overflow-hidden pointer-events-none text-transparent;
  line-height: 1.6;
}

.editor-textarea {
  @apply w-full h-full absolute inset-0 font-mono text-sm p-4 bg-transparent border-none focus:ring-0 resize-none z-10 text-surface-900 dark:text-surface-0 caret-surface-900 dark:caret-surface-0 overflow-auto;
  line-height: 1.6;
}

:deep(.match-mark) {
  @apply bg-primary/20 border-b-2 border-primary rounded-sm transition-colors;
}

.match-scroll {
  @apply h-[400px] lg:h-full;
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

:deep(.p-card-body) {
  @apply p-4! h-full flex flex-col;
}

:deep(.p-card-content) {
  @apply p-0! flex-1 flex flex-col;
}

.custom-checkbox :deep(.p-checkbox-box) {
  @apply w-4 h-4 border-surface-300 dark:border-surface-700;
}

.p-button-xs {
  @apply py-1 px-2 text-[10px] font-bold uppercase tracking-wider h-auto;
}
</style>
