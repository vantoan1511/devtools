<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-link text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">
            Slug Generator
          </span>
        </div>

        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>

        <div class="flex items-center gap-2">
          <SelectButton v-model="separator" :options="separatorOptions" optionLabel="label" optionValue="value" 
            :allowEmpty="false" class="custom-selectbutton" />
          
          <SelectButton v-model="casing" :options="casingOptions" optionLabel="label" optionValue="value" 
            :allowEmpty="false" class="custom-selectbutton" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button v-if="!charCount" label="Sample" icon="pi pi-info-circle" size="small" severity="secondary" text rounded
          @click="insertSample" class="text-xs" />
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-6">
      <div class="max-w-7xl mx-auto h-full flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          <!-- Configuration Panel -->
          <Card class="lg:col-span-1 border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
            <template #title>
              <div class="flex items-center gap-2 text-base px-2">
                <i class="pi pi-cog text-primary"></i>
                <span class="font-bold">Settings</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-6 p-2">
                <!-- Advanced Toggles -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between p-3 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold uppercase text-surface-600 dark:text-surface-300">Stop Words</span>
                      <span class="text-[10px] text-surface-500">Remove 'the', 'a', 'is', etc.</span>
                    </div>
                    <Checkbox v-model="removeStopWords" :binary="true" />
                  </div>

                  <div class="flex items-center justify-between p-3 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold uppercase text-surface-600 dark:text-surface-300">No Numbers</span>
                      <span class="text-[10px] text-surface-500">Remove all numeric digits</span>
                    </div>
                    <Checkbox v-model="removeNumbers" :binary="true" />
                  </div>
                </div>

                <!-- Trim Length -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold uppercase text-surface-500">Max Length (0 = Unlimited)</label>
                  <InputNumber v-model="trimLength" :min="0" placeholder="e.g. 50" class="glass-input-number w-full" fluid />
                </div>

                <!-- Custom Replacements -->
                <div class="flex flex-col gap-3 mt-2">
                  <label class="text-xs font-bold uppercase text-surface-500">Custom Replacements</label>
                  <div class="flex gap-2">
                    <InputText v-model="newReplacement.from" placeholder="From" size="small" class="flex-1 glass-input-mini" />
                    <InputText v-model="newReplacement.to" placeholder="To" size="small" class="flex-1 glass-input-mini" />
                    <Button icon="pi pi-plus" size="small" severity="primary" @click="addReplacement" rounded />
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <Tag v-for="(rep, index) in customReplacements" :key="index" severity="secondary" rounded class="px-3 py-1 bg-primary/10 border border-primary/20 text-primary">
                      <span class="font-mono text-[10px]">{{ rep.from }} → {{ rep.to }}</span>
                      <i class="pi pi-times ml-2 cursor-pointer hover:text-red-500" @click="removeReplacement(index)"></i>
                    </Tag>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Input/Output Panel -->
          <div class="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
            <!-- Input -->
            <Card class="flex-1 border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden group">
              <template #title>
                <div class="flex items-center gap-2 text-base px-2">
                  <i class="pi pi-align-left text-primary"></i>
                  <span class="font-bold">Original Text</span>
                  <span class="text-[10px] font-normal text-surface-400 ml-auto">(Support Multi-line)</span>
                </div>
              </template>
              <template #content>
                <Textarea v-model="inputText"
                  class="flex-1 w-full h-full min-h-[150px] font-mono text-sm p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Paste your titles or phrases here, one per line..." />
              </template>
            </Card>

            <!-- Output -->
            <Card class="flex-1 border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
              <template #title>
                <div class="flex items-center justify-between text-base px-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-check-circle text-green-500"></i>
                    <span class="font-bold">Generated Slugs</span>
                  </div>
                  <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyToClipboard"
                    v-tooltip.bottom="'Copy All Slugs'" />
                </div>
              </template>
              <template #content>
                <Textarea v-model="outputText" readonly
                  class="flex-1 w-full h-full min-h-[150px] font-mono text-sm p-4 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 border-none resize-none text-primary"
                  placeholder="Slugs will appear here..." />
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
        <span>Input: {{ charCount }} chars / {{ wordCount }} words</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>Generated: {{ slugCount }} slugs</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">SEO Friendly • URL Safe</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const toast = useToast()

// State
const inputText = ref('')
const separator = ref('-')
const casing = ref('lowercase')
const removeStopWords = ref(false)
const removeNumbers = ref(false)
const trimLength = ref(0)
const customReplacements = ref<{ from: string, to: string }[]>([])
const newReplacement = ref({ from: '', to: '' })

const separatorOptions = [
  { label: 'Hyphen (-)', value: '-' },
  { label: 'Underscore (_)', value: '_' },
  { label: 'Dot (.)', value: '.' },
  { label: 'None', value: '' }
]

const casingOptions = [
  { label: 'lower', value: 'lowercase' },
  { label: 'UPPER', value: 'uppercase' },
  { label: 'Title', value: 'titlecase' }
]

const stopWords = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
]

// Transliteration Map (Common accented characters)
const transliterationMap: Record<string, string> = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y',
  'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u', 'œ': 'oe', 'ß': 'ss'
}

const slugify = (text: string) => {
  if (!text) return ''

  let result = text.trim()

  // 1. Transliteration (Handled via char by char replacement to be safe)
  result = result.split('').map(char => transliterationMap[char.toLowerCase()] || char).join('')

  // 2. Custom Replacements
  customReplacements.value.forEach(rep => {
    if (rep.from) {
      result = result.split(rep.from).join(rep.to)
    }
  })

  // 3. Casing
  if (casing.value === 'lowercase') result = result.toLowerCase()
  else if (casing.value === 'uppercase') result = result.toUpperCase()

  // 4. Remove Stop Words
  if (removeStopWords.value) {
    const words = result.split(/\s+/)
    result = words.filter(w => !stopWords.includes(w.toLowerCase())).join(' ')
  }

  // 5. Basic cleanup: Replace non-alphanumeric with spaces
  const regex = removeNumbers.value ? /[^a-zA-Z\s]/g : /[^a-zA-Z0-9\s]/g
  result = result.replace(regex, ' ')

  // 6. Replace spaces with separator
  const sep = separator.value
  result = result.trim().replace(/\s+/g, sep)

  // 7. Title Case (Special handling because we need to uppercase after separators)
  if (casing.value === 'titlecase') {
    result = result.split(sep).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(sep)
  }

  // 8. Trim Length
  if (trimLength.value > 0 && result.length > trimLength.value) {
    result = result.substring(0, trimLength.value)
    // Avoid ending with a separator
    if (sep && result.endsWith(sep)) {
      result = result.substring(0, result.length - 1)
    }
  }

  return result
}

const outputText = computed(() => {
  if (!inputText.value) return ''
  const lines = inputText.value.split('\n')
  return lines.map(line => slugify(line)).join('\n')
})

const charCount = computed(() => inputText.value.length)
const wordCount = computed(() => inputText.value.trim() ? inputText.value.trim().split(/\s+/).length : 0)
const slugCount = computed(() => outputText.value.split('\n').filter(l => l.trim()).length)

const copyToClipboard = async () => {
  if (!outputText.value) return
  try {
    await navigator.clipboard.writeText(outputText.value)
    toast.add({ severity: 'info', summary: 'Copied', detail: 'Slugs copied to clipboard', life: 2000 })
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

const clearAll = () => {
  inputText.value = ''
}

const addReplacement = () => {
  if (newReplacement.value.from) {
    customReplacements.value.push({ ...newReplacement.value })
    newReplacement.value = { from: '', to: '' }
  }
}

const removeReplacement = (index: number) => {
  customReplacements.value.splice(index, 1)
}

const insertSample = () => {
  inputText.value = "Hello World: A Professional Tool!\n25 Awesome Features for Developers\nTesting Accents: àáâãäå æçèéêë"
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

:deep(.p-selectbutton) {
  @apply bg-surface-100 dark:bg-surface-800 rounded-xl p-1 border border-surface-200 dark:border-surface-700;
}

:deep(.p-card-body) {
  @apply flex-1 flex flex-col p-4! h-full;
}

:deep(.p-card-content) {
  @apply flex-1 flex flex-col p-0! h-full min-h-0;
}

.glass-input-mini {
  @apply bg-surface-100 dark:bg-surface-800 border-none focus:ring-1 focus:ring-primary/30 rounded-lg py-2 px-3 text-xs;
}
</style>
