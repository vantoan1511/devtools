<template>
  <div
      class="home-container bg-surface-50 dark:bg-surface-950 min-h-full py-12 px-6 overflow-x-hidden custom-scrollbar">
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <section class="text-center mb-16 animate-in">
        <Headline/>
        <p class="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one toolbox for modern developers. Fast, private, and powerful tools designed to streamline your
          daily workflow.
        </p>
        <div class="flex justify-center gap-4 mt-8">
          <Button label="Explore Tools" icon="pi pi-arrow-right" icon-pos="right" @click="scrollToTools"/>
          <Button as="a" href="https://github.com/vantoan1511/devtools" target="_blank" label="Star on GitHub"
                  icon="pi pi-github" severity="secondary" rounded text/>
        </div>

      </section>

      <!-- Tool Grid -->
      <section id="tools-grid" class="mb-24 relative" :class="{ 'is-drag-mode': draggedIndex !== null }">
        <div class="flex flex-col items-center mb-12">
          <h2 class="text-4xl font-black text-surface-900 dark:text-surface-0 mb-4 tracking-tight">
            Available Tools
          </h2>
          <div class="h-1.5 w-24 bg-gradient-to-r from-primary to-primary-emphasis rounded-full"></div>
          <p class="mt-4 text-surface-500 dark:text-surface-400 text-sm font-medium">
            Organize your tools exactly how you want them
          </p>
        </div>

        <TransitionGroup name="tool-grid" tag="div"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
          <div v-for="(tool, index) in displayTools" :key="tool.id" class="tool-wrapper"
            draggable="true" @dragstart="handleDragStart($event, index)"
            @dragover.prevent="handleDragOver($event, index)" @dragend="handleDragEnd" @drop="handleDrop" :class="[
              draggedIndex === index ? 'is-dragging' : '',
              dragOverIndex === index && draggedIndex !== index ? 'drag-over-target' : ''
            ]">

            <Card v-spotlight
                  class="tool-card h-full border border-white/10 dark:border-surface-800/50 shadow-lg transition-all duration-500 bg-white/40 dark:bg-surface-900/40 backdrop-blur-md cursor-pointer group relative overflow-hidden rounded-3xl"
                  :class="{ 'pointer-events-none': draggedIndex !== null && draggedIndex !== index }"
                  @click="router.push(tool.route)">
              <template #content>
                <div class="flex flex-col h-full gap-6 p-2 transition-all duration-300">
                  <div class="flex justify-between items-start">
                    <div
                        :class="[tool.color, 'w-14 h-14 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner ring-1 ring-white/20 dark:ring-surface-700/30']">
                      <i :class="[tool.icon, 'text-3xl filter drop-shadow-sm']"></i>
                    </div>
                    <div class="flex items-center gap-1">
                      <Button :icon="tool.isFavorite ? 'pi pi-star-fill' : 'pi pi-star'"
                              :class="['favorite-btn p-2', tool.isFavorite ? 'text-yellow-500 scale-110' : 'text-surface-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-yellow-400']"
                              severity="secondary" rounded text @click.stop="toolStore.toggleFavorite(tool.id)"
                              v-tooltip.top="tool.isFavorite ? 'Remove from favorites' : 'Add to favorites'"/>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                      {{ tool.title }}
                      <i
                          class="pi pi-arrow-up-right text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0 text-primary"></i>
                    </h3>
                    <p class="text-surface-600 dark:text-surface-400 leading-relaxed text-sm font-medium">
                      {{ tool.description }}
                    </p>
                  </div>
                </div>

                <!-- Subtle Drag Indicator -->
                <div
                    class="absolute top-0 left-0 w-full h-1 flex items-center justify-center pointer-events-none transition-all duration-500"
                    :class="[draggedIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-40']">
                  <div class="w-12 h-1 bg-primary/40 rounded-full mt-2"></div>
                </div>

                <!-- Landing Pad (Visible for target) -->
                <div v-if="dragOverIndex === index && draggedIndex !== index"
                     class="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-3xl flex items-center justify-center pointer-events-none transition-all duration-300">
                  <div class="flex flex-col items-center gap-2">
                    <i class="pi pi-download text-primary/40 text-xl animate-bounce"></i>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </TransitionGroup>
      </section>

      <Divider class="my-16"/>

      <!-- Features Grid (Core Capabilities) -->
      <section class="mb-24">
        <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-10 text-center">Core Capabilities</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="feature in features" :key="feature.title" v-spotlight
                class="feature-card border-none shadow-sm transition-all duration-300 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm">
            <template #content>
              <div class="flex flex-col gap-4">
                <div
                    :class="[feature.color, 'w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center']">
                  <i :class="[feature.icon, 'text-xl']"></i>
                </div>
                <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ feature.title }}</h3>
                <p class="text-surface-600 dark:text-surface-400 leading-relaxed text-sm">
                  {{ feature.description }}
                </p>
              </div>
            </template>
          </Card>
        </div>
      </section>

      <!-- Quick Tips -->
      <section
          class="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-primary/5 border border-primary/10 animate-in">
        <div class="flex flex-col items-center text-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
            <i class="pi pi-bolt text-primary"></i>
          </div>
          <h4 class="font-bold text-surface-900 dark:text-surface-0">Instant Launch</h4>
          <p class="text-xs text-surface-500">No login required. Tools are ready to use the moment you need them.</p>
        </div>
        <div class="flex flex-col items-center text-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
            <i class="pi pi-eye-slash text-primary"></i>
          </div>
          <h4 class="font-bold text-surface-900 dark:text-surface-0">Privacy First</h4>
          <p class="text-xs text-surface-500">All processing happens locally in your browser. Your data never leaves
            your
            device.</p>
        </div>
        <div class="flex flex-col items-center text-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
            <i class="pi pi-moon text-primary"></i>
          </div>
          <h4 class="font-bold text-surface-900 dark:text-surface-0">Full Dark Mode</h4>
          <p class="text-xs text-surface-500">Designed for night owls. Seamless switching between light and dark themes.
          </p>
        </div>
      </section>

      <!-- Tech Stack -->
      <section class="bg-primary/5 rounded-3xl p-10 border border-primary/10 mb-20">
        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-8 text-center">Built with Modern Tech</h2>
        <div class="flex flex-wrap justify-center gap-4 md:gap-8">
          <div v-for="tech in techStack" :key="tech.name"
               class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-800">
            <i :class="[tech.icon, 'text-primary text-sm']"></i>
            <span class="text-sm font-semibold text-surface-700 dark:text-surface-300">{{ tech.name }}</span>
          </div>
        </div>
      </section>

      <!-- Footer CTA -->
      <footer class="text-center pb-12">
        <p class="text-surface-500 text-sm mb-4">
          Open source and free to use forever.
        </p>
        <div class="flex items-center justify-center gap-2 text-surface-400">
          <span class="text-xs uppercase tracking-widest font-bold">Built with ❤️ for developers by</span>
          <Button label="Toan Nguyen" icon="pi pi-github" variant="text" @click="handleAboutMeClick"/>
        </div>
      </footer>
    </div>
    <div class="z-100 fixed top-0 left-0 w-full h-full pointer-events-none">
      <AboutMe :display="isShowAboutMe"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import AboutMe from '@/components/AboutMe.vue'
import Headline from '@/components/Headline.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import {ref, watch, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useToolStore, type Tool} from '@/stores/toolStore'

const router = useRouter()
const toolStore = useToolStore()

// Local state for smooth drag-and-drop
const displayTools = ref<Tool[]>([])
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const swapLock = ref(false)
let lastSwapTime = 0

// Sync displayTools with store, but only when not dragging
watch(() => toolStore.sortedTools, (newTools) => {
  if (draggedIndex.value === null) {
    displayTools.value = [...newTools]
  }
}, {immediate: true, deep: true})

const scrollToTools = () => {
  const el = document.getElementById('tools-grid')
  if (el) {
    el.scrollIntoView({behavior: 'smooth'})
  }
}

const handleDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'

    // Completely transparent drag image
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    event.dataTransfer.setDragImage(img, 0, 0)
  }
}

const handleDragOver = (event: DragEvent, index: number) => {
  // Always update visual highlight index immediately for responsiveness
  dragOverIndex.value = index

  const now = Date.now()
  if (swapLock.value || now - lastSwapTime < 200) return

  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    // Only swap if we have intent (don't swap just by grazing the edge)
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top

    // Threshold: Must be at least 25% into the element to trigger swap
    const thresholdX = rect.width * 0.25
    const thresholdY = rect.height * 0.25

    if (
        relativeX > thresholdX &&
        relativeX < rect.width - thresholdX &&
        relativeY > thresholdY &&
        relativeY < rect.height - thresholdY
    ) {
      performSwap(index)
    }
  }
}

const performSwap = (index: number) => {
  if (draggedIndex.value === null) return

  swapLock.value = true
  lastSwapTime = Date.now()

  const newTools = [...displayTools.value]
  const [movedItem] = newTools.splice(draggedIndex.value, 1)
  if (movedItem) {
    newTools.splice(index, 0, movedItem)

    displayTools.value = newTools
    draggedIndex.value = index
  }
  // Longer lock for stability
  setTimeout(() => {
    swapLock.value = false
  }, 250)
}

const handleDragEnd = () => {
  if (draggedIndex.value !== null) {
    toolStore.updateOrder(displayTools.value, true)
  }
  draggedIndex.value = null
  dragOverIndex.value = null
  swapLock.value = false
}

const handleDrop = () => {
  toolStore.updateOrder(displayTools.value, true)
  draggedIndex.value = null
  dragOverIndex.value = null
}

const features = [
  {
    title: 'OpenAPI Editor',
    description: 'A full-featured editor for designing and previewing API specifications with live Swagger UI rendering.',
    icon: 'pi pi-pencil',
    color: 'text-blue-500'
  },
  {
    title: 'RegEx Tester',
    description: 'Real-time regular expression testing with highlighting and detailed group extraction.',
    icon: 'pi pi-filter',
    color: 'text-purple-500'
  },
  {
    title: 'JSON Formatter',
    description: 'Validate, format, and minify JSON data instantly with syntax error detection.',
    icon: 'pi pi-database',
    color: 'text-green-500'
  },
  {
    title: 'Comparison Tool',
    description: 'Compare two pieces of text and see differences side-by-side or inline with synced scrolling.',
    icon: 'pi pi-objects-column',
    color: 'text-orange-500'
  },
  {
    title: 'Security Tools',
    description: 'Generate hashes (MD5, SHA), UUIDs (v4, v7), and encode/decode Base64 or URLs securely.',
    icon: 'pi pi-shield',
    color: 'text-red-500'
  },
  {
    title: 'Mock Data Generator',
    description: 'Generate realistic test data using Faker.js and export to JSON, CSV, or SQL formats.',
    icon: 'pi pi-database',
    color: 'text-amber-500'
  },
  {
    title: 'Modern UI/UX',
    description: 'Built with a glassmorphism design, supporting both light and dark modes seamlessly.',
    icon: 'pi pi-desktop',
    color: 'text-indigo-500'
  }
]

const techStack = [
  {name: 'Vue 3', icon: 'pi pi-check-circle'},
  {name: 'Vite', icon: 'pi pi-bolt'},
  {name: 'TypeScript', icon: 'pi pi-code'},
  {name: 'PrimeVue', icon: 'pi pi-palette'},
  {name: 'Tailwind CSS', icon: 'pi pi-box'},
  {name: 'Monaco Editor', icon: 'pi pi-file-edit'}
]

const isShowAboutMe = ref(false)

const handleAboutMeClick = () => {
  isShowAboutMe.value = !isShowAboutMe.value
  setTimeout(() => {
    isShowAboutMe.value = false
  }, 3000)
}
</script>

<style scoped>
@reference "@/assets/main.css";

.tool-card,
.feature-card {
  @apply hover:-translate-y-2 transition-all duration-300;
}

.tool-card:active {
  cursor: grabbing;
}

[draggable="true"] {
  cursor: grab;
}

.tool-wrapper {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.is-dragging {
  opacity: 0.5;
  transform: scale(0.92);
  filter: grayscale(0.5) blur(1px);
  z-index: 50;
}

.drag-over-target {
  transform: scale(1.05);
  z-index: 10;
}

.drag-over-target .tool-card {
  @apply ring-4 ring-primary/30 border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10;
}

.animate-in {
  animation: animate-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.favorite-btn:hover {
  @apply scale-125 transition-all duration-300;
}

/* Premium Drag & Slide System */
.tool-wrapper {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
  will-change: transform, opacity;
}

/* The "Floating" state for the item being held */
.is-dragging {
  opacity: 1 !important;
  transform: scale(1.05) translateY(-12px);
  z-index: 100;
  filter: none;
  @apply shadow-2xl shadow-primary/30;
}

/* The "Landing Pad" state */
.drag-over-target {
  z-index: 30;
}

.drag-over-target .tool-card {
  @apply ring-4 ring-primary/40 border-primary bg-primary/10 shadow-2xl scale-[1.05];
  animation: landing-pulse 1.5s infinite;
}

@keyframes landing-pulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--p-primary-500-rgb), 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(var(--p-primary-500-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--p-primary-500-rgb), 0); }
}

/* Background items during drag - Depth effect */
.is-drag-mode .tool-wrapper:not(.is-dragging):not(.drag-over-target) {
  @apply opacity-50 scale-[0.96] grayscale-[0.5] blur-[0.5px];
}

/* The Premium Slide - Spring-back settle */
.tool-grid-move {
  transition: transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

/* Entrance Animations */
.animate-in {
  animation: animate-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
</style>
