<template>
  <div class="home-container bg-surface-50 dark:bg-surface-950 min-h-full py-12 px-6 overflow-x-hidden">
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <section class="mb-16 text-center animate-in">
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-surface-900 dark:text-surface-0 mb-4">
          Unleash Your <span class="text-primary">Workflow</span>
        </h1>
        <p class="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one toolbox for modern developers. Fast, private, and powerful tools at your fingertips.
        </p>
      </section>

      <!-- Tool Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="(tool, index) in tools" :key="tool.route" 
          class="animate-in" :style="{ animationDelay: `${index * 50}ms` }">
          <Card
            class="tool-card h-full border-none shadow-sm transition-all duration-300 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm cursor-pointer group relative overflow-hidden"
            @click="router.push(tool.route)"
            @mousemove="handleMouseMove">
            <template #content>
              <div class="flex flex-col gap-4 relative z-10">
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
              <!-- Spotlight Glow -->
              <div class="spotlight pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                :style="{
                  background: `radial-gradient(600px circle at var(--x) var(--y), color-mix(in srgb, var(--p-primary-500), transparent 85%), transparent 40%)`
                }">
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Quick Tips / Features -->
      <section class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-primary/5 border border-primary/10 animate-in">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleMouseMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  target.style.setProperty('--x', `${x}px`)
  target.style.setProperty('--y', `${y}px`)
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
</script>

<style scoped>
@reference "@/assets/main.css";

.tool-card {
  @apply hover:-translate-y-2 hover:ring-2 hover:ring-primary/20 hover:bg-white dark:hover:bg-surface-900 transition-all duration-300;
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
