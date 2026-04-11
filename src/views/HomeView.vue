<template>
  <div class="home-container bg-surface-50 dark:bg-surface-950 min-h-full py-12 px-6 overflow-x-hidden custom-scrollbar">
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <section class="text-center mb-16 animate-in">
        <div class="inline-block p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
          <i class="pi pi-bolt text-4xl text-primary"></i>
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-surface-900 dark:text-surface-0 mb-4">
          DevTool<span class="text-primary">+</span>
        </h1>
        <p class="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one toolbox for modern developers. Fast, private, and powerful tools designed to streamline your daily workflow.
        </p>
        <div class="flex justify-center gap-4 mt-8">
          <Button label="Explore Tools" icon="pi pi-th-large" rounded raised @click="scrollToTools" />
          <Button as="a" href="https://github.com/vantoan1511/devtools" target="_blank" label="Star on GitHub"
            icon="pi pi-github" severity="secondary" rounded text />
        </div>
      </section>

      <!-- Tool Grid -->
      <section id="tools-grid" class="mb-24">
        <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-10 text-center">Available Tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="(tool, index) in tools" :key="tool.route" 
            class="animate-in" :style="{ animationDelay: `${index * 50}ms` }">
            <Card
              v-spotlight
              class="tool-card h-full border-none shadow-sm transition-all duration-300 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm cursor-pointer group"
              @click="router.push(tool.route)">
              <template #content>
                <div class="flex flex-col gap-4">
                  <div :class="[tool.color, 'w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ring-1 ring-surface-200/50 dark:ring-surface-700/50']">
                    <i :class="[tool.icon, 'text-2xl']"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2 flex items-center gap-2">
                      {{ tool.title }}
                      <i class="pi pi-arrow-up-right text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"></i>
                    </h3>
                    <p class="text-surface-600 dark:text-surface-400 leading-relaxed text-sm">
                      {{ tool.description }}
                    </p>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </section>

      <Divider class="my-16" />

      <!-- Features Grid (Core Capabilities) -->
      <section class="mb-24">
        <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-10 text-center">Core Capabilities</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="feature in features" :key="feature.title"
            v-spotlight
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
      <section class="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-primary/5 border border-primary/10 animate-in">
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
          <p class="text-xs text-surface-500">All processing happens locally in your browser. Your data never leaves your device.</p>
        </div>
        <div class="flex flex-col items-center text-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
            <i class="pi pi-moon text-primary"></i>
          </div>
          <h4 class="font-bold text-surface-900 dark:text-surface-0">Full Dark Mode</h4>
          <p class="text-xs text-surface-500">Designed for night owls. Seamless switching between light and dark themes.</p>
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
import { useRouter } from 'vue-router'

const router = useRouter()

const scrollToTools = () => {
  const el = document.getElementById('tools-grid')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

interface Tool {
  title: string
  description: string
  icon: string
  route: string
  color: string
}

const tools: Tool[] = [
  {
    title: 'OpenAPI Editor',
    description: 'Design and preview API specifications with a high-performance editor and live Swagger UI.',
    icon: 'pi pi-code',
    route: '/openapi',
    color: 'text-blue-500'
  },
  {
    title: 'JSON Formatter',
    description: 'Beautify, validate, and minify complex JSON structures with real-time error detection.',
    icon: 'pi pi-database',
    route: '/json-formatter',
    color: 'text-green-500'
  },
  {
    title: 'Transformer Chain',
    description: 'The ultimate power tool: chain multiple operations like Base64, JSON, and Hashing.',
    icon: 'pi pi-link',
    route: '/transformer',
    color: 'text-primary'
  },
  {
    title: 'RegEx Tester',
    description: 'Debug regular expressions with live match highlighting and detailed capture group info.',
    icon: 'pi pi-filter',
    route: '/regex-tester',
    color: 'text-purple-500'
  },
  {
    title: 'Comparison Tool',
    description: 'Analyze differences between text blocks with synced scrolling and visual diffing.',
    icon: 'pi pi-objects-column',
    route: '/comparison',
    color: 'text-orange-500'
  },
  {
    title: 'JWT Debugger',
    description: 'Instantly decode and inspect JSON Web Tokens to verify claims and signatures.',
    icon: 'pi pi-shield',
    route: '/jwt-debugger',
    color: 'text-red-500'
  },
  {
    title: 'Base64 Tool',
    description: 'Securely encode and decode strings or files to and from Base64 format.',
    icon: 'pi pi-lock',
    route: '/base64',
    color: 'text-cyan-500'
  },
  {
    title: 'Hash Generator',
    description: 'Generate secure MD5, SHA-1, SHA-256, and SHA-512 hashes from any input.',
    icon: 'ri-fingerprint-line',
    route: '/hash-generator',
    color: 'text-indigo-500'
  },
  {
    title: 'URL Encoder',
    description: 'Safe conversion of special characters in URLs and query parameters.',
    icon: 'pi pi-link',
    route: '/url-encoder',
    color: 'text-teal-500'
  },
  {
    title: 'UUID Generator',
    description: 'Generate RFC 4122 compliant UUIDs (v1, v4, v7) with custom formatting.',
    icon: 'pi pi-id-card',
    route: '/uuid-generator',
    color: 'text-pink-500'
  },
  {
    title: 'Mock Generator',
    description: 'Generate realistic mock data for testing and development in JSON, CSV, or SQL.',
    icon: 'pi pi-database',
    route: '/mock-generator',
    color: 'text-amber-500'
  },
  {
    title: 'Slug Generator',
    description: 'Create SEO-friendly, URL-safe slugs with transliteration and bulk generation support.',
    icon: 'pi pi-link',
    route: '/slug-generator',
    color: 'text-blue-400'
  }
]

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

.tool-card, .feature-card {
  @apply hover:-translate-y-2 transition-all duration-300;
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
