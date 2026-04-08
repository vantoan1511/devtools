<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import ToggleButton from 'primevue/togglebutton'
import { useToast } from 'primevue/usetoast'
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { onMounted, ref } from 'vue'

const toast = useToast()

const versions = [
  { label: 'v4 (Random)', value: 'v4', desc: 'Standard random UUID' },
  { label: 'v7 (Timed)', value: 'v7', desc: 'Timestamp-ordered (Sortable)' },
  { label: 'v1 (Time)', value: 'v1', desc: 'Host-id & Time based' }
]

const selectedVersion = ref('v4')
const quantity = ref(1)
const isUppercase = ref(false)
const hasHyphens = ref(true)
const hasBraces = ref(false)
const generatedUuids = ref<string[]>([])

const formatUuid = (uuid: string) => {
  let result = uuid
  if (!hasHyphens.value) result = result.replace(/-/g, '')
  if (isUppercase.value) result = result.toUpperCase()
  if (hasBraces.value) result = `{${result}}`
  return result
}

const generate = () => {
  const newUuids: string[] = []
  for (let i = 0; i < quantity.value; i++) {
    let id = ''
    switch (selectedVersion.value) {
      case 'v1': id = uuidv1(); break
      case 'v7': id = uuidv7(); break
      default: id = uuidv4(); break
    }
    newUuids.push(id)
  }
  generatedUuids.value = newUuids
  if (quantity.value > 1) {
    toast.add({ severity: 'success', summary: 'Generated', detail: `Generated ${quantity.value} UUIDs`, life: 2000 })
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'UUID copied to clipboard', life: 1500 })
}

const copyAll = () => {
  const text = generatedUuids.value.map(formatUuid).join('\n')
  navigator.clipboard.writeText(text)
  toast.add({ severity: 'success', summary: 'Copied All', detail: 'All UUIDs copied to clipboard', life: 2000 })
}

const clearAll = () => {
  generatedUuids.value = []
}

onMounted(() => {
  generate()
})
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70 transition-colors duration-300">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-id-card text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">UUID Generator</span>
        </div>
        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>
        <div class="flex items-center gap-2">
          <Button label="Generate" icon="pi pi-refresh" size="small" @click="generate" 
            class="hover:scale-105 transition-transform" />
          <InputNumber v-model="quantity" showButtons buttonLayout="horizontal" :min="1" :max="100" 
            class="custom-inputnumber h-8" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button v-if="generatedUuids.length" label="Copy All" icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyAll" class="text-xs" />
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-6">
      <div class="max-w-5xl mx-auto flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Configuration Card -->
          <div class="lg:col-span-4 flex flex-col gap-6">
            <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
              <template #title>
                <div class="flex items-center gap-2 text-base px-2">
                  <i class="pi pi-cog text-primary"></i>
                  <span class="font-bold">Settings</span>
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-6 pt-2">
                  <!-- Version Selector -->
                  <div class="flex flex-col gap-3">
                    <span class="text-[10px] font-black uppercase text-surface-400 tracking-widest px-1">Version</span>
                    <div class="flex flex-col gap-2">
                      <div v-for="v in versions" :key="v.value" 
                        @click="selectedVersion = v.value"
                        :class="['p-3 rounded-xl border transition-all cursor-pointer group', selectedVersion === v.value ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/10' : 'bg-surface-50 dark:bg-surface-950 border-surface-200 dark:border-surface-800 hover:border-primary/20']">
                        <div class="flex items-center justify-between mb-1">
                          <span :class="['text-xs font-bold', selectedVersion === v.value ? 'text-primary' : 'text-surface-700 dark:text-surface-300']">{{ v.label }}</span>
                          <div :class="['w-3 h-3 rounded-full border-2 transition-all', selectedVersion === v.value ? 'border-primary bg-primary' : 'border-surface-300 dark:border-surface-700']"></div>
                        </div>
                        <p class="text-[10px] text-surface-500 leading-tight">{{ v.desc }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Format Options -->
                  <div class="flex flex-col gap-3">
                    <span class="text-[10px] font-black uppercase text-surface-400 tracking-widest px-1">Format</span>
                    <div class="grid grid-cols-1 gap-2">
                      <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800">
                        <span class="text-[10px] font-bold uppercase text-surface-500">Hyphens</span>
                        <ToggleButton v-model="hasHyphens" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" class="small-toggle" />
                      </div>
                      <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800">
                        <span class="text-[10px] font-bold uppercase text-surface-500">Uppercase</span>
                        <ToggleButton v-model="isUppercase" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" class="small-toggle" />
                      </div>
                      <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800">
                        <span class="text-[10px] font-bold uppercase text-surface-500">Braces { }</span>
                        <ToggleButton v-model="hasBraces" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" class="small-toggle" />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Results Card -->
          <div class="lg:col-span-8">
            <Card class="h-full border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <template #title>
                <div class="flex items-center justify-between px-2 text-base">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <i class="pi pi-list text-green-500"></i>
                    </div>
                    <span class="font-bold">Generated Result</span>
                  </div>
                  <Tag :value="generatedUuids.length" severity="secondary" rounded class="text-[10px]" />
                </div>
              </template>
              <template #content>
                <div class="flex-1 flex flex-col min-h-0 pt-2 h-full">
                  <div v-if="generatedUuids.length === 0" class="flex-1 flex flex-col items-center justify-center text-surface-400 py-20">
                    <i class="pi pi-id-card text-4xl mb-3 opacity-20"></i>
                    <p class="text-xs font-bold uppercase">No UUIDs generated</p>
                  </div>
                  <div v-else class="flex flex-col gap-2 overflow-y-auto max-h-[600px] p-1">
                    <div v-for="(uuid, idx) in generatedUuids" :key="idx" 
                      class="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 hover:ring-2 hover:ring-primary/10 transition-all group animate-in slide-in-from-right-2"
                      :style="{ animationDelay: `${idx * 30}ms` }">
                      <span class="text-[10px] font-mono text-surface-400 min-w-[20px]">{{ idx + 1 }}.</span>
                      <span class="flex-1 font-mono text-sm break-all font-medium text-surface-700 dark:text-surface-300">
                        {{ formatUuid(uuid) }}
                      </span>
                      <Button icon="pi pi-copy" size="small" text rounded 
                        class="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" 
                        @click="copyToClipboard(formatUuid(uuid))" v-tooltip.left="'Copy'" />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <i class="pi pi-info-circle text-[10px] text-primary"></i>
          Type: UUID {{ selectedVersion }}
        </span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>{{ generatedUuids.length }} Items</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>Uppercase: {{ isUppercase ? 'ON' : 'OFF' }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">RFC 4122 Compliant</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.small-toggle {
  @apply w-8 h-5;
}

:deep(.small-toggle.p-togglebutton) {
  @apply bg-surface-200 dark:bg-surface-700 border-none;
}

:deep(.small-toggle.p-togglebutton.p-highlight) {
  @apply bg-primary;
}

:deep(.small-toggle .p-button-icon) {
  @apply text-[8px] text-white;
}

.custom-inputnumber :deep(.p-inputtext) {
  @apply w-12 text-center text-xs font-bold py-1 px-0 bg-transparent border-none focus:ring-0;
}

.custom-inputnumber :deep(.p-inputnumber-button) {
  @apply w-6 h-6 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-surface-500 hover:bg-primary/10 hover:text-primary transition-all p-0;
}

.animate-in {
  animation: animate-in 0.4s ease-out forwards;
}

@keyframes animate-in {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

:deep(.p-card-body) {
  @apply p-4! h-full flex flex-col;
}
:deep(.p-card-content) {
  @apply p-0! flex-1 flex flex-col min-h-0;
}
</style>
