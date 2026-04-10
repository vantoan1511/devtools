<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { transformers, type Transformer } from '../utils/transformers'

const toast = useToast()
const inputText = ref('')
const selectedSteps = ref<string[]>([])

// Drag and Drop State
const draggedIndex = ref<number | null>(null)

const onDragStart = (index: number) => {
  draggedIndex.value = index
}

const onDragOver = (index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return

  const item = selectedSteps.value.splice(draggedIndex.value, 1)[0]
  selectedSteps.value.splice(index, 0, item)
  draggedIndex.value = index
}

const onDragEnd = () => {
  draggedIndex.value = null
}

// Category Icon Mapping
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Encoding': return 'pi pi-lock'
    case 'Formatting': return 'pi pi-code'
    case 'Hashing': return 'ri-fingerprint-line'
    case 'Utility': return 'pi pi-wrench'
    default: return 'pi pi-cog'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Encoding': return 'text-blue-500 bg-blue-500/10'
    case 'Formatting': return 'text-green-500 bg-green-500/10'
    case 'Hashing': return 'text-indigo-500 bg-indigo-500/10'
    case 'Utility': return 'text-amber-500 bg-amber-500/10'
    default: return 'text-surface-500 bg-surface-500/10'
  }
}

// Group transformers by category for the selection menu
const transformerOptions = computed(() => {
  const groups = transformers.reduce((acc, t) => {
    const group = acc.find(g => g.label === t.category)
    if (group) {
      group.items.push({ label: t.name, value: t.id, description: t.description, category: t.category })
    } else {
      acc.push({
        label: t.category,
        items: [{ label: t.name, value: t.id, description: t.description, category: t.category }]
      })
    }
    return acc
  }, [] as any[])
  return groups
})

const results = computed(() => {
  let current = inputText.value
  const chainResults: { step: string; output: string; error?: string; category: string }[] = []

  for (const stepId of selectedSteps.value) {
    const transformer = transformers.find(t => t.id === stepId)
    if (transformer) {
      const res = transformer.fn(current)
      chainResults.push({
        step: transformer.name,
        output: res.output,
        error: res.error,
        category: transformer.category
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
    toast.add({ severity: 'success', summary: 'Step Added', detail: `Added transformation step`, life: 1500 })
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
  toast.add({ severity: 'info', summary: 'Cleared', detail: 'Chain and input cleared', life: 1500 })
}

const copyToClipboard = (text: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Copied to clipboard', life: 2000 })
}

const getStepTransformer = (id: string) => transformers.find(t => t.id === id)
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden relative">
    <!-- Background Decor -->
    <div class="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/60 px-4 py-2 backdrop-blur-xl dark:bg-surface-900/60 transition-all duration-300">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5">
          <i class="pi pi-link text-primary text-sm animate-pulse"></i>
          <span class="font-black text-xs uppercase tracking-widest text-primary">Transformer Chain</span>
        </div>
        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700/50 mx-1"></div>
        
        <Select :options="transformerOptions" optionLabel="label" optionValue="value" optionGroupLabel="label"
          optionGroupChildren="items" placeholder="Add Transformation Step..." 
          class="w-72 h-10 glass-select" @change="addStep">
          <template #optiongroup="slotProps">
            <div class="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-surface-400 py-2 px-2">
              <i :class="getCategoryIcon(slotProps.option.label)"></i>
              {{ slotProps.option.label }}
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center gap-3 py-1">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', getCategoryColor(slotProps.option.category)]">
                <i :class="[getCategoryIcon(slotProps.option.category), 'text-xs']"></i>
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="text-sm font-bold leading-tight">{{ slotProps.option.label }}</div>
                <div class="text-[10px] text-surface-500 leading-tight opacity-70">{{ slotProps.option.description }}</div>
              </div>
            </div>
          </template>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button v-tooltip.bottom="'Clear Everything'" icon="pi pi-trash" size="small" severity="secondary" text rounded
          class="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 active:scale-90" @click="clearAll" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
      <!-- Input & Chain Configuration (Left) -->
      <div class="w-full lg:w-[380px] p-6 border-r border-surface-200 dark:border-white/10 flex flex-col gap-6 overflow-y-auto bg-white/20 dark:bg-surface-900/10 backdrop-blur-sm">
        <!-- Initial Input -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between px-1">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Initial Input</span>
            <span class="text-[10px] font-mono text-surface-400">{{ inputText.length }} chars</span>
          </div>
          <Textarea v-model="inputText"
            class="w-full font-mono text-sm p-4 rounded-2xl bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none min-h-[140px] shadow-sm"
            placeholder="Paste your source text here..." />
        </div>

        <!-- Chain Pipeline -->
        <div class="flex flex-col gap-4 relative">
          <div class="flex items-center justify-between px-1">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Pipeline Flow</span>
            <Tag :value="selectedSteps.length + ' steps'" severity="primary" class="text-[9px] font-black px-2 rounded-full" />
          </div>

          <div class="relative flex flex-col gap-3">
            <!-- Pipeline Connector Line -->
            <div v-if="selectedSteps.length > 1" 
              class="absolute left-[23px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40 rounded-full z-0 hidden sm:block">
            </div>

            <TransitionGroup name="pipeline" tag="div" class="flex flex-col gap-3 relative z-10">
              <div v-for="(stepId, index) in selectedSteps" :key="index + stepId"
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragover.prevent="onDragOver(index)"
                @dragend="onDragEnd"
                :class="[
                  'group flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 dark:bg-surface-900/80 border border-surface-200 dark:border-white/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-0.5 backdrop-blur-md cursor-grab active:cursor-grabbing',
                  draggedIndex === index ? 'opacity-40 border-primary shadow-inner scale-95' : ''
                ]">
                
                <!-- Order & Move -->
                <div class="flex flex-col items-center gap-1 shrink-0">
                  <Button icon="pi pi-chevron-up" size="small" text rounded class="move-btn"
                    :disabled="index === 0" @click="moveStep(index, 'up')" />
                  <div class="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center border border-primary/20 shadow-inner">
                    {{ index + 1 }}
                  </div>
                  <Button icon="pi pi-chevron-down" size="small" text rounded class="move-btn"
                    :disabled="index === selectedSteps.length - 1" @click="moveStep(index, 'down')" />
                </div>

                <!-- Step Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <div :class="['w-5 h-5 rounded flex items-center justify-center shrink-0', getCategoryColor(getStepTransformer(stepId)?.category || '')]">
                      <i :class="[getCategoryIcon(getStepTransformer(stepId)?.category || ''), 'text-[10px]']"></i>
                    </div>
                    <span class="font-black text-xs text-surface-900 dark:text-surface-0 truncate">
                      {{ getStepTransformer(stepId)?.name }}
                    </span>
                  </div>
                  <div class="text-[10px] text-surface-400 font-medium truncate opacity-80">
                    {{ getStepTransformer(stepId)?.description }}
                  </div>
                </div>

                <!-- Action -->
                <Button icon="pi pi-times" severity="secondary" text rounded size="small"
                  class="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500 active:scale-75"
                  @click="removeStep(index)" />
              </div>
            </TransitionGroup>

            <!-- Empty State -->
            <div v-if="selectedSteps.length === 0"
              class="flex flex-col items-center justify-center p-10 border-2 border-dashed border-surface-200 dark:border-surface-800/50 rounded-3xl text-surface-400 gap-4 group transition-all duration-500 hover:border-primary/30 hover:bg-primary/5">
              <div class="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800/50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <i class="pi pi-plus-circle text-3xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all"></i>
              </div>
              <div class="text-center">
                <p class="text-xs font-black uppercase tracking-widest mb-1">Pipeline Empty</p>
                <p class="text-[10px] opacity-60">Add a step from the menu above</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results & Intermediate Steps (Right) -->
      <div class="flex-1 p-6 md:p-8 overflow-y-auto bg-surface-100/20 dark:bg-surface-950/20 relative">
        <div class="max-w-4xl mx-auto flex flex-col gap-10">
          <!-- Final Result Card -->
          <Card class="border-none shadow-xl shadow-black/5 dark:shadow-black/20 bg-white dark:bg-surface-900 rounded-[2rem] overflow-hidden group/result">
            <template #title>
              <div class="flex items-center justify-between px-4 pt-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center ring-1 ring-green-500/20 transition-transform group-hover/result:rotate-6">
                    <i class="pi pi-check-circle text-green-500 text-xl"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-black uppercase tracking-widest text-surface-900 dark:text-surface-0">Final Output</span>
                    <span class="text-[10px] font-bold text-surface-400">{{ results.final.length }} characters</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button icon="pi pi-copy" label="Copy Result" size="small" rounded severity="secondary" 
                    class="font-bold text-xs px-4 bg-surface-100 dark:bg-surface-800 border-none hover:bg-primary hover:text-white transition-all duration-300" 
                    @click="copyToClipboard(results.final)" />
                </div>
              </div>
            </template>
            <template #content>
              <div class="px-2 pb-2">
                <Textarea v-model="results.final" readonly
                  class="w-full font-mono text-sm p-6 rounded-2xl bg-surface-50/50 dark:bg-surface-950/50 border-none resize-none min-h-[240px] focus:ring-0 leading-relaxed transition-all duration-500"
                  placeholder="The final output of your pipeline will appear here..." />
              </div>
            </template>
          </Card>

          <!-- Intermediate Steps Visualizer -->
          <div v-if="results.steps.length > 0" class="flex flex-col gap-6 animate-in">
            <div class="flex items-center gap-3 px-2">
              <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent to-surface-200 dark:to-white/10"></div>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-surface-400">Step-by-Step Breakdown</span>
              <div class="h-[1px] flex-1 bg-gradient-to-l from-transparent to-surface-200 dark:to-white/10"></div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(res, idx) in results.steps" :key="idx" 
                class="flex flex-col gap-3 p-5 rounded-3xl bg-white/40 dark:bg-surface-900/40 border border-surface-200/50 dark:border-white/5 backdrop-blur-md hover:border-primary/20 transition-all duration-300 group/step">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-xl bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center ring-1 ring-primary/20">
                      {{ idx + 1 }}
                    </span>
                    <div class="flex flex-col">
                      <span class="font-black text-[11px] uppercase tracking-wider">{{ res.step }}</span>
                      <span class="text-[9px] font-bold text-surface-400 opacity-70">{{ res.category }}</span>
                    </div>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
                    <Button icon="pi pi-copy" size="small" text rounded @click="copyToClipboard(res.output)"
                      class="h-7 w-7 text-surface-400 hover:text-primary" v-tooltip.bottom="'Copy step result'" />
                  </div>
                </div>

                <div v-if="res.error" class="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-2">
                  <i class="pi pi-exclamation-circle text-red-500 text-xs"></i>
                  <span class="text-[10px] font-bold text-red-500 uppercase">{{ res.error }}</span>
                </div>

                <div class="font-mono text-[11px] p-4 rounded-2xl bg-surface-50/50 dark:bg-surface-950/50 text-surface-600 dark:text-surface-400 break-all max-h-40 overflow-y-auto border border-surface-100 dark:border-surface-800/50 leading-relaxed">
                  {{ res.output || '(Empty Result)' }}
                </div>
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

/* Pipeline Transitions */
.pipeline-move,
.pipeline-enter-active,
.pipeline-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.pipeline-enter-from,
.pipeline-leave-to {
  opacity: 0;
  transform: scale(0.9) translateX(-20px);
}

.pipeline-leave-active {
  position: absolute;
  width: 100%;
}

/* Custom Styles */
.glass-select {
  @apply bg-white/50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-700/50 rounded-xl transition-all duration-300;
}

:deep(.p-select.glass-select:not(.p-disabled).p-focus) {
  @apply ring-4 ring-primary/10 border-primary/40;
}

.move-btn {
  @apply p-0 h-4 w-4 text-[8px] opacity-20 hover:opacity-100 hover:bg-primary/10 transition-all;
}

:deep(.p-card-body) {
  @apply p-0!;
}

.animate-in {
  animation: fade-in-up 0.6s ease-out forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Scrollbar for side panel */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-surface-300/30 dark:bg-surface-700/30 rounded-full;
}

[draggable="true"] {
  user-select: none;
}
</style>
