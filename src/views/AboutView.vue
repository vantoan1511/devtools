<template>
  <div class="about-container bg-surface-50 dark:bg-surface-950 min-h-full py-12 px-6 overflow-x-hidden">
    <div class="max-w-5xl mx-auto">
      <!-- Hero Section -->
      <section class="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div class="inline-block p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
          <i class="pi pi-bolt text-4xl text-primary"></i>
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-surface-900 dark:text-surface-0 mb-4">
          DevTool<span class="text-primary">+</span>
        </h1>
        <p class="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
          A high-performance suite of development utilities designed to streamline your daily workflow.
          Blazing fast, secure, and beautiful.
        </p>
        <div class="flex justify-center gap-4 mt-8">
          <Button label="Get Started" icon="pi pi-play" rounded raised @click="$router.push('/')" />
          <Button as="a" href="https://github.com/vantoan1511/devtools" target="_blank" label="Star on GitHub"
            icon="pi pi-github" severity="secondary" rounded text />
        </div>
      </section>

      <Divider class="my-16" />

      <!-- Features Grid -->
      <section class="mb-20">
        <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-10 text-center">Core Capabilities</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="feature in features" :key="feature.title"
            class="feature-card border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm">
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
          <span class="text-xs uppercase tracking-widest font-bold">Built with ❤️ for developers</span>
        </div>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'

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
    title: 'Modern UI/UX',
    description: 'Built with a glassmorphism design, supporting both light and dark modes seamlessly.',
    icon: 'pi pi-desktop',
    color: 'text-indigo-500'
  }
]

const techStack = [
  { name: 'Vue 3', icon: 'pi pi-check-circle' },
  { name: 'Vite', icon: 'pi pi-bolt' },
  { name: 'TypeScript', icon: 'pi pi-code' },
  { name: 'PrimeVue', icon: 'pi pi-palette' },
  { name: 'Tailwind CSS', icon: 'pi pi-box' },
  { name: 'Monaco Editor', icon: 'pi pi-file-edit' }
]
</script>

<style scoped>
@reference "@/assets/main.css";

.feature-card {
  @apply transform transition-transform duration-300 hover:-translate-y-2;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: animate-in 0.6s ease-out forwards;
}
</style>
