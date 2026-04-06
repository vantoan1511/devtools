<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">RegEx Tester</h1>
        <p class="text-surface-600 dark:text-surface-400">Test your regular expressions against sample text with
          real-time highlighting and group extraction.</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Regex Configuration -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <Card class="border-none shadow-sm glass-card">
            <template #title>
              <div class="flex items-center gap-2">
                <i class="pi pi-filter text-xl text-primary"></i>
                <span>Regular Expression</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2 p-inputgroup">
                  <span class="p-inputgroup-addon font-mono text-xl">/</span>
                  <InputText v-model="regexPattern" placeholder="enter your regex pattern here..."
                    class="font-mono glass-input flex-1" :class="{ 'p-invalid': regexError }" />
                  <span class="p-inputgroup-addon font-mono text-xl">/{{ activeFlags }}</span>
                </div>

                <div v-if="regexError" class="text-red-500 text-sm font-medium">
                  <i class="pi pi-exclamation-circle mr-1"></i>
                  {{ regexError }}
                </div>

                <div class="flex flex-wrap gap-4 mt-2">
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="flags.global" inputId="flag-g" :binary="true" />
                    <label for="flag-g" class="text-sm cursor-pointer" v-tooltip.top="'Global (g)'">Global</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="flags.ignoreCase" inputId="flag-i" :binary="true" />
                    <label for="flag-i" class="text-sm cursor-pointer" v-tooltip.top="'Case-insensitive (i)'">Ignore
                      Case</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="flags.multiline" inputId="flag-m" :binary="true" />
                    <label for="flag-m" class="text-sm cursor-pointer" v-tooltip.top="'Multiline (m)'">Multiline</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="flags.dotAll" inputId="flag-s" :binary="true" />
                    <label for="flag-s" class="text-sm cursor-pointer" v-tooltip.top="'Single line / Dot all (s)'">Dot
                      All</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="flags.unicode" inputId="flag-u" :binary="true" />
                    <label for="flag-u" class="text-sm cursor-pointer" v-tooltip.top="'Unicode (u)'">Unicode</label>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <Card class="border-none shadow-sm glass-card flex-1">
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="pi pi-align-left text-xl text-primary"></i>
                  <span>Test String</span>
                </div>
                <Button icon="pi pi-trash" severity="secondary" text rounded @click="testString = ''"
                  v-tooltip="'Clear'" />
              </div>
            </template>
            <template #content>
              <div class="relative min-h-[400px] border rounded-xl overflow-hidden glass-input">
                <div ref="highlighterRef"
                  class="highlighter-container absolute inset-0 font-mono text-sm p-4 whitespace-pre-wrap break-all overflow-hidden pointer-events-none text-transparent"
                  v-html="highlightedText"></div>
                <textarea v-model="testString" @scroll="syncScroll" ref="textareaRef"
                  class="w-full h-full absolute inset-0 font-mono text-sm p-4 bg-transparent border-none focus:ring-0 resize-none z-10 text-surface-900 dark:text-surface-0 caret-surface-900 dark:caret-surface-0 overflow-auto"
                  placeholder="Paste your test text here..."></textarea>
              </div>
            </template>
          </Card>
        </div>

        <!-- Results Section -->
        <div class="flex flex-col gap-6">
          <Card class="h-full border-none shadow-sm glass-card">
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="pi pi-list text-xl text-primary"></i>
                  <span>Matches ({{ matches.length }})</span>
                </div>
              </div>
            </template>
            <template #content>
              <ScrollPanel style="width: 100%; height: 600px">
                <div v-if="matches.length === 0"
                  class="flex flex-col items-center justify-center py-10 text-surface-400">
                  <i class="pi pi-search text-4xl mb-2 opacity-20"></i>
                  <p>No matches found</p>
                </div>
                <div v-else class="flex flex-col gap-3">
                  <div v-for="(match, idx) in matches" :key="idx"
                    class="p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-100/30 dark:bg-surface-800/30">
                    <div class="flex items-center justify-between mb-2">
                      <Tag :value="'Match ' + (idx + 1)" severity="primary" size="small" />
                      <span class="text-xs text-surface-500 font-mono">index: {{ match.index }}</span>
                    </div>
                    <div class="font-mono text-sm break-all mb-2 p-2 bg-surface-200/50 dark:bg-surface-700/50 rounded">
                      {{ match[0] }}
                    </div>

                    <div v-if="match.length > 1" class="mt-2">
                      <p class="text-xs font-bold uppercase text-surface-500 mb-1">Groups:</p>
                      <div v-for="(group, gIdx) in match.slice(1)" :key="gIdx"
                        class="flex items-start gap-2 text-xs font-mono mb-1">
                        <span class="text-primary font-bold">{{ gIdx + 1 }}:</span>
                        <span class="break-all">{{ group || 'null' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollPanel>
            </template>
          </Card>
        </div>
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
import Tag from 'primevue/tag'
import { computed, ref } from 'vue'

const regexPattern = ref('')
const testString = ref('')
const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  unicode: false
})

const highlighterRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const syncScroll = () => {
  if (highlighterRef.value && textareaRef.value) {
    highlighterRef.value.scrollTop = textareaRef.value.scrollTop
    highlighterRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
}

const activeFlags = computed(() => {
  let f = ''
  if (flags.value.global) f += 'g'
  if (flags.value.ignoreCase) f += 'i'
  if (flags.value.multiline) f += 'm'
  if (flags.value.dotAll) f += 's'
  if (flags.value.unicode) f += 'u'
  return f
})

const regexError = ref('')

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
        if (match.index === re.lastIndex) {
          re.lastIndex++
        }
        // Safety break to prevent infinite loops with zero-width matches
        if (results.length > 1000) break
      }
    } else {
      const match = regex.value.exec(str)
      if (match) results.push(match)
    }
  } catch (e) {
    // Should be handled by regex computed property
  }

  return results
})

const highlightedText = computed(() => {
  if (!testString.value) return ''
  if (!regex.value || !regexPattern.value) return escapeHtml(testString.value)

  const str = testString.value
  const res = []
  let lastIndex = 0

  try {
    // We use the matches to build the highlighted text
    for (const match of matches.value) {
      // Add text before match
      res.push(escapeHtml(str.substring(lastIndex, match.index)))
      // Add highlighted match
      res.push(`<mark class="bg-primary/30 border-b-2 border-primary rounded-sm">${escapeHtml(match[0])}</mark>`)
      lastIndex = match.index + match[0].length
    }
    // Add remaining text
    res.push(escapeHtml(str.substring(lastIndex)))
  } catch (e) {
    return escapeHtml(testString.value)
  }

  return res.join('').replace(/\n/g, '<br>')
})

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
</script>

<style scoped>
@reference "@/assets/main.css";

.glass-card {
  @apply bg-white/40 dark:bg-surface-900/40 backdrop-blur-xl border border-white/10;
}

.glass-input {
  @apply bg-white/50 dark:bg-surface-950/50 backdrop-blur-sm border-white/10 dark:border-surface-700/50 transition-all duration-300 focus:ring-2 focus:ring-primary/50;
}

:deep(.p-inputgroup-addon) {
  @apply bg-surface-100/50 dark:bg-surface-800/50 border-white/10 dark:border-surface-700/50 text-surface-500;
}

.highlighter-container {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
  /* Match PrimeVue Textarea default or set explicitly */
}

/* Adjust textarea to perfectly overlap the highlighter */
:deep(textarea.p-textarea) {
  line-height: 1.5;
  background-color: transparent !important;
  color: transparent !important;
}
</style>
