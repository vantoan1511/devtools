import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Tool {
  id: string
  title: string
  description: string
  icon: string
  route: string
  color: string
  isFavorite?: boolean
  order?: number
}

const DEFAULT_TOOLS: Tool[] = [
  {
    id: 'openapi',
    title: 'OpenAPI Editor',
    description: 'Design and preview API specifications with a high-performance editor and live Swagger UI.',
    icon: 'pi pi-code',
    route: '/openapi',
    color: 'text-blue-500'
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Beautify, validate, and minify complex JSON structures with real-time error detection.',
    icon: 'pi pi-database',
    route: '/json-formatter',
    color: 'text-green-500'
  },
  {
    id: 'transformer',
    title: 'Transformer Chain',
    description: 'The ultimate power tool: chain multiple operations like Base64, JSON, and Hashing.',
    icon: 'pi pi-link',
    route: '/transformer',
    color: 'text-primary'
  },
  {
    id: 'regex-tester',
    title: 'RegEx Tester',
    description: 'Debug regular expressions with live match highlighting and detailed capture group info.',
    icon: 'pi pi-filter',
    route: '/regex-tester',
    color: 'text-purple-500'
  },
  {
    id: 'comparison',
    title: 'Comparison Tool',
    description: 'Analyze differences between text blocks with synced scrolling and visual diffing.',
    icon: 'pi pi-objects-column',
    route: '/comparison',
    color: 'text-orange-500'
  },
  {
    id: 'jwt-debugger',
    title: 'JWT Debugger',
    description: 'Instantly decode and inspect JSON Web Tokens to verify claims and signatures.',
    icon: 'pi pi-shield',
    route: '/jwt-debugger',
    color: 'text-red-500'
  },
  {
    id: 'base64',
    title: 'Base64 Tool',
    description: 'Securely encode and decode strings or files to and from Base64 format.',
    icon: 'pi pi-lock',
    route: '/base64',
    color: 'text-cyan-500'
  },
  {
    id: 'hash-generator',
    title: 'Hash Generator',
    description: 'Generate secure MD5, SHA-1, SHA-256, and SHA-512 hashes from any input.',
    icon: 'ri-fingerprint-line',
    route: '/hash-generator',
    color: 'text-indigo-500'
  },
  {
    id: 'url-encoder',
    title: 'URL Encoder',
    description: 'Safe conversion of special characters in URLs and query parameters.',
    icon: 'pi pi-link',
    route: '/url-encoder',
    color: 'text-teal-500'
  },
  {
    id: 'uuid-generator',
    title: 'UUID Generator',
    description: 'Generate RFC 4122 compliant UUIDs (v1, v4, v7) with custom formatting.',
    icon: 'pi pi-id-card',
    route: '/uuid-generator',
    color: 'text-pink-500'
  },
  {
    id: 'mock-generator',
    title: 'Mock Generator',
    description: 'Generate realistic mock data for testing and development in JSON, CSV, or SQL.',
    icon: 'pi pi-database',
    route: '/mock-generator',
    color: 'text-amber-500'
  },
  {
    id: 'slug-generator',
    title: 'Slug Generator',
    description: 'Create SEO-friendly, URL-safe slugs with transliteration and bulk generation support.',
    icon: 'pi pi-link',
    route: '/slug-generator',
    color: 'text-blue-400'
  }
]

export const useToolStore = defineStore('tool', () => {
  const tools = ref<Tool[]>([])

  // Load from localStorage on init
  const loadTools = () => {
    const saved = localStorage.getItem('devtool-tools-config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge with DEFAULT_TOOLS to handle new tools in future updates
        tools.value = DEFAULT_TOOLS.map(defaultTool => {
          const savedTool = parsed.find((t: any) => t.id === defaultTool.id)
          return {
            ...defaultTool,
            isFavorite: savedTool?.isFavorite || false,
            order: savedTool?.order ?? DEFAULT_TOOLS.indexOf(defaultTool)
          }
        }).sort((a, b) => (a.order || 0) - (b.order || 0))
      } catch (e) {
        console.error('Failed to parse saved tools config', e)
        tools.value = DEFAULT_TOOLS.map((t, index) => ({ ...t, isFavorite: false, order: index }))
      }
    } else {
      tools.value = DEFAULT_TOOLS.map((t, index) => ({ ...t, isFavorite: false, order: index }))
    }
  }

  const saveTools = () => {
    const config = tools.value.map(t => ({ id: t.id, isFavorite: t.isFavorite, order: t.order }))
    localStorage.setItem('devtool-tools-config', JSON.stringify(config))
  }

  const sortedTools = computed(() => {
    return [...tools.value].sort((a, b) => {
      // Favorite first
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      // Then by order
      return (a.order || 0) - (b.order || 0)
    })
  })

  const toggleFavorite = (id: string) => {
    const tool = tools.value.find(t => t.id === id)
    if (tool) {
      tool.isFavorite = !tool.isFavorite
      saveTools()
    }
  }

  const updateOrder = (newOrder: Tool[], save = true) => {
    newOrder.forEach((tool, index) => {
      const target = tools.value.find(t => t.id === tool.id)
      if (target) {
        target.order = index
      }
    })
    if (save) saveTools()
  }

  loadTools()

  return {
    tools,
    sortedTools,
    toggleFavorite,
    updateOrder
  }
})
