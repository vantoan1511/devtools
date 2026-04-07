<template>
  <div class="flex-1 bg-surface-50 p-4 dark:bg-surface-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 text-center">
        <h1 class="mb-2 text-4xl font-bold text-surface-900 dark:text-surface-0">Welcome to DevTool</h1>
        <p class="text-xl text-surface-600 dark:text-surface-400">Common tools for your everyday development</p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="tool in tools" :key="tool.route" class="h-full p-1">
          <Card
            class="h-full border-none shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-2 hover:border-primary hover:border-dashed cursor-pointer"
            @click="router.push(tool.route)">
            <template #title>
              <div class="flex items-center gap-2">
                <i :class="[tool.icon, 'text-2xl text-primary']"></i>
                <span>{{ tool.title }}</span>
              </div>
            </template>
            <template #content>
              <p class="m-0 leading-relaxed text-surface-600 dark:text-surface-400">
                {{ tool.description }}
              </p>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import { useRouter } from 'vue-router';

const router = useRouter()

interface Tool {
  title: string;
  description: string;
  icon: string;
  route: string;
  buttonLabel: string;
}

const tools: Tool[] = [
  {
    title: 'OpenAPI Editor',
    description: 'Edit and preview your OpenAPI specifications with a VS Code-like editor and live Swagger UI preview.',
    icon: 'pi pi-code',
    route: '/openapi',
    buttonLabel: 'Open Editor'
  },
  {
    title: 'JSON Formatter',
    description: 'Format, validate and minify your JSON data with ease.',
    icon: 'pi pi-database',
    route: '/json-formatter',
    buttonLabel: 'Open Formatter'
  },
  {
    title: 'Base64 Tool',
    description: 'Encode and decode strings and files to/from Base64 format.',
    icon: 'pi pi-lock',
    route: '/base64',
    buttonLabel: 'Open Tool'
  },
  {
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files.',
    icon: 'pi pi-fingerprint',
    route: '/hash-generator',
    buttonLabel: 'Open Tool'
  },
  {
    title: 'Comparison Tool',
    description: 'Compare two pieces of text and see the differences side-by-side or inline.',
    icon: 'pi pi-columns',
    route: '/comparison',
    buttonLabel: 'Open Tool'
  },
  {
    title: 'RegEx Tester',
    description: 'Test and debug your regular expressions with real-time highlighting and group extraction.',
    icon: 'pi pi-filter',
    route: '/regex-tester',
    buttonLabel: 'Open Tool'
  },
  {
    title: 'URL Encoder',
    description: 'Safely encode or decode URLs and parameters for web development.',
    icon: 'pi pi-link',
    route: '/url-encoder',
    buttonLabel: 'Open Tool'
  },
  {
    title: 'JWT Debugger',
    description: 'Decode and inspect JSON Web Tokens instantly to see their content.',
    icon: 'pi pi-shield',
    route: '/jwt-debugger',
    buttonLabel: 'Open Tool'
  }
]
</script>

<style scoped>
/* No additional styles needed as Tailwind classes are used */
</style>
