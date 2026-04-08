<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-link text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">URL Encoder</span>
        </div>

        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>

        <div class="flex items-center gap-2">
          <SelectButton v-model="isComponentMode" :options="modeOptions" optionLabel="label" optionValue="value"
            :allowEmpty="false" class="custom-selectbutton" />
          
          <div class="flex items-center bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-surface-200 dark:border-surface-700">
            <Button label="Encode" icon="pi pi-lock" size="small" text @click="encode" 
              class="hover:bg-primary/10" v-tooltip.bottom="'Encode URL'"/>
            <Button label="Decode" icon="pi pi-lock-open" size="small" text severity="secondary" @click="decode" 
              class="hover:bg-surface-200 dark:hover:bg-surface-700" v-tooltip.bottom="'Decode URL'"/>
          </div>
          
          <Button icon="pi pi-sync" size="small" severity="secondary" text rounded @click="swap" 
            v-tooltip.bottom="'Swap Input/Output'" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-6">
      <div class="max-w-7xl mx-auto flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Input Card -->
          <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden group">
            <template #title>
              <div class="flex items-center gap-2 text-base px-2">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i class="pi pi-sign-in text-primary"></i>
                </div>
                <span class="font-bold">Input Source</span>
              </div>
            </template>
            <template #content>
              <Textarea v-model="inputText" 
                class="w-full font-mono text-sm p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[200px]"
                placeholder="Enter URL or string to process..." />
            </template>
          </Card>

          <!-- Output Card -->
          <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
            <template #title>
              <div class="flex items-center justify-between text-base px-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <i class="pi pi-sign-out text-green-500"></i>
                  </div>
                  <span class="font-bold">Result Output</span>
                </div>
                <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyOutput" v-tooltip.bottom="'Copy'" />
              </div>
            </template>
            <template #content>
              <Textarea v-model="outputText" readonly
                class="w-full font-mono text-sm p-4 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 border-none resize-none min-h-[200px]"
                placeholder="Result will appear here..." />
            </template>
          </Card>
        </div>

        <!-- URL Inspector Section -->
        <Card v-if="urlBreakdown" class="border-none shadow-sm bg-primary/5 border border-primary/10 overflow-hidden animate-in">
          <template #title>
            <div class="flex items-center gap-2 text-base px-2">
              <i class="pi pi-search text-primary"></i>
              <span class="font-bold">URL Inspector</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-surface-400 tracking-widest">Protocol</span>
                <span class="text-sm font-mono text-primary">{{ urlBreakdown.protocol }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-surface-400 tracking-widest">Host</span>
                <span class="text-sm font-mono text-surface-700 dark:text-surface-300">{{ urlBreakdown.host }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-surface-400 tracking-widest">Path</span>
                <span class="text-sm font-mono text-surface-700 dark:text-surface-300 break-all">{{ urlBreakdown.pathname }}</span>
              </div>
            </div>

            <div v-if="urlBreakdown.params" class="mt-6 border-t border-surface-200 dark:border-white/10 pt-4">
              <span class="text-[10px] font-black uppercase text-surface-400 tracking-widest mb-3 block">Query Parameters</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="[key, val] in urlBreakdown.params" :key="key" 
                  class="flex flex-col p-2 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 group relative">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-bold text-primary truncate">{{ key }}</span>
                    <Button icon="pi pi-copy" size="small" text rounded class="opacity-0 group-hover:opacity-100 h-5 w-5 p-0" @click="copyParamValue(val)" />
                  </div>
                  <span class="text-xs font-mono text-surface-500 break-all">{{ val || '(empty)' }}</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500">
      <div class="flex items-center gap-4">
        <span>Input: {{ charCount }} chars</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>Output: {{ outputCharCount }} chars</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span class="flex items-center gap-1.5">
          <i :class="['pi text-[8px]', isComponentMode ? 'pi-check-circle text-primary' : 'pi-circle text-surface-400']"></i>
          Mode: {{ isComponentMode ? 'Component' : 'Full URI' }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">Client-side Encoding</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'

const toast = useToast()
const inputText = ref('')
const outputText = ref('')
const isComponentMode = ref(true)

const modeOptions = [
  { label: 'Component', value: true, desc: 'Encodes everything (recommended for parameters)' },
  { label: 'Full URI', value: false, desc: 'Preserves protocol and domain structure' }
]

const charCount = computed(() => inputText.value.length)
const outputCharCount = computed(() => outputText.value.length)

const urlBreakdown = computed(() => {
  try {
    const url = new URL(inputText.value.startsWith('http') ? inputText.value : `https://${inputText.value}`)
    const params = Array.from(url.searchParams.entries())
    return {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
      params: params.length > 0 ? params : null,
      hash: url.hash
    }
  } catch (e) {
    return null
  }
})

const encode = () => {
  if (!inputText.value) return
  try {
    outputText.value = isComponentMode.value 
      ? encodeURIComponent(inputText.value) 
      : encodeURI(inputText.value)
    toast.add({ severity: 'success', summary: 'Encoded', detail: 'URL transformation complete', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Encoding failed', life: 3000 })
  }
}

const decode = () => {
  if (!inputText.value) return
  try {
    outputText.value = decodeURIComponent(inputText.value)
    toast.add({ severity: 'success', summary: 'Decoded', detail: 'URL decoded successfully', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Decoding failed', life: 3000 })
  }
}

const swap = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
}

const copyOutput = () => {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Result copied to clipboard', life: 2000 })
}

const copyParamValue = (val: string) => {
  navigator.clipboard.writeText(val)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Parameter value copied', life: 1500 })
}

watch(isComponentMode, () => {
  if (inputText.value && outputText.value) encode()
})
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

.animate-in {
  animation: animate-in 0.4s ease-out forwards;
}

@keyframes animate-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.p-card-body) {
  @apply p-4!;
}
</style>
