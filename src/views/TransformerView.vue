<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import { transformers, type Transformer } from '../utils/transformers'

const toast = useToast()
const inputText = ref('')
const selectedSteps = ref<string[]>([])

// Group transformers by category for the selection menu
const transformerOptions = computed(() => {
  const groups = transformers.reduce((acc, t) => {
    const group = acc.find(g => g.label === t.category)
    if (group) {
      group.items.push({ label: t.name, value: t.id, description: t.description })
    } else {
      acc.push({
        label: t.category,
        items: [{ label: t.name, value: t.id, description: t.description }]
      })
    }
    return acc
  }, [] as { label: string, items: { label: string, value: string, description: string }[] }[])
  return groups
})

const results = computed(() => {
  let current = inputText.value
  const chainResults: { step: string; output: string; error?: string }[] = []

  for (const stepId of selectedSteps.value) {
    const transformer = transformers.find(t => t.id === stepId)
    if (transformer) {
      const res = transformer.fn(current)
      chainResults.push({
        step: transformer.name,
        output: res.output,
        error: res.error
      })
      current = res.output
    }
  }

  return {
    final: current,
    steps: chainResults
  }
})

const addStep = (event: any) => {
  if (event.value) {
    selectedSteps.value.push(event.value)
    // We don't want the select to keep the value, so we'll reset it if possible
    // or just let it be handled by the UI
  }
}

const removeStep = (index: number) => {
  selectedSteps.value.splice(index, 1)
}

const moveStep = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < selectedSteps.value.length) {
    const temp = selectedSteps.value[index]
    selectedSteps.value[index] = selectedSteps.value[newIndex]
    selectedSteps.value[newIndex] = temp
  }
}

const clearAll = () => {
  inputText.value = ''
  selectedSteps.value = []
}

const copyToClipboard = (text: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Result copied to clipboard', life: 2000 })
}

const getStepTransformer = (id: string) => transformers.find(t => t.id === id)
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-link text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">Transformer Chain</span>
        </div>
        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>
        <Select :options="transformerOptions" optionLabel="label" optionValue="value" optionGroupLabel="label"
          optionGroupChildren="items" placeholder="Add Transformation Step..." class="w-64 h-9 text-sm"
          @change="addStep">
          <template #optiongroup="slotProps">
            <div class="flex items-center font-bold text-xs uppercase tracking-widest text-surface-400 py-1">
              {{ slotProps.option.label }}
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex flex-col gap-0.5">
              <div class="text-sm font-bold">{{ slotProps.option.label }}</div>
              <div class="text-[10px] text-surface-500 leading-tight">{{ slotProps.option.description }}</div>
            </div>
          </template>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button v-tooltip.bottom="'Clear Chain'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
      <!-- Input & Chain Configuration (Left) -->
      <div class="w-full lg:w-1/3 p-4 border-r border-surface-200 dark:border-white/10 flex flex-col gap-4 overflow-y-auto">
        <Card class="border-none shadow-none bg-transparent">
          <template #title>
            <div class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2 px-1">Initial Input</div>
          </template>
          <template #content>
            <Textarea v-model="inputText"
              class="w-full font-mono text-sm p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary/20 resize-none min-h-[150px]"
              placeholder="Paste your source text here..." />
          </template>
        </Card>

        <div class="flex flex-col gap-2">
          <div class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2 px-1 flex justify-between">
            <span>Transformation Chain</span>
            <span class="text-primary">{{ selectedSteps.length }} steps</span>
          </div>

          <TransitionGroup name="list" tag="div" class="flex flex-col gap-2">
            <div v-for="(stepId, index) in selectedSteps" :key="index + stepId"
              class="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary/30 transition-all duration-300">
              <div class="flex flex-col items-center gap-1">
                <Button icon="pi pi-chevron-up" size="small" text rounded class="p-0 h-4 w-4 text-[8px]"
                  :disabled="index === 0" @click="moveStep(index, 'up')" />
                <span class="text-[10px] font-bold text-surface-400">{{ index + 1 }}</span>
                <Button icon="pi pi-chevron-down" size="small" text rounded class="p-0 h-4 w-4 text-[8px]"
                  :disabled="index === selectedSteps.length - 1" @click="moveStep(index, 'down')" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm text-surface-900 dark:text-surface-0">
                  {{ getStepTransformer(stepId)?.name }}
                </div>
                <div class="text-[10px] text-surface-500 truncate">
                  {{ getStepTransformer(stepId)?.description }}
                </div>
              </div>

              <Button icon="pi pi-times" severity="secondary" text rounded size="small"
                class="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                @click="removeStep(index)" />
            </div>
          </TransitionGroup>

          <div v-if="selectedSteps.length === 0"
            class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl text-surface-400 gap-3">
            <i class="pi pi-plus-circle text-2xl"></i>
            <p class="text-xs font-medium">Add steps to start transforming</p>
          </div>
        </div>
      </div>

      <!-- Results & Intermediate Steps (Right) -->
      <div class="flex-1 p-4 md:p-6 overflow-y-auto bg-surface-100/30 dark:bg-surface-950/30">
        <div class="max-w-4xl mx-auto flex flex-col gap-6">
          <!-- Final Result -->
          <Card class="border-none shadow-sm bg-white dark:bg-surface-900 overflow-hidden">
            <template #title>
              <div class="flex items-center justify-between text-base px-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <i class="pi pi-check-circle text-green-500"></i>
                  </div>
                  <span class="font-bold">Final Output</span>
                </div>
                <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyToClipboard(results.final)"
                  v-tooltip.bottom="'Copy Final Result'" />
              </div>
            </template>
            <template #content>
              <Textarea v-model="results.final" readonly
                class="w-full font-mono text-sm p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border-none resize-none min-h-[200px]"
                placeholder="Results will appear here..." />
            </template>
          </Card>

          <!-- Intermediate Steps -->
          <div v-if="results.steps.length > 0" class="flex flex-col gap-4">
            <div class="text-xs font-black uppercase tracking-widest text-surface-400 px-1">Intermediate Results</div>
            
            <div v-for="(res, idx) in results.steps" :key="idx" 
              class="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                    {{ idx + 1 }}
                  </span>
                  <span class="font-bold text-xs uppercase tracking-wider">{{ res.step }}</span>
                  <Tag v-if="res.error" severity="danger" :value="res.error" class="text-[9px]" />
                </div>
                <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyToClipboard(res.output)"
                  class="h-7 w-7" v-tooltip.bottom="'Copy this step result'" />
              </div>
              <div class="font-mono text-[11px] p-3 rounded-xl bg-surface-50 dark:bg-surface-950 text-surface-600 dark:text-surface-400 break-all max-h-32 overflow-y-auto border border-surface-100 dark:border-surface-800">
                {{ res.output || '(Empty)' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

:deep(.p-select) {
  @apply bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700 rounded-xl;
}

:deep(.p-card-body) {
  @apply p-4!;
}
</style>
