import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OpenAPIEditorView from '../views/OpenAPIEditorView.vue'
import LandingPageView from '@/views/LandingPageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/getting-started',
    },
    {
      path: '/getting-started',
      name: 'getting-started',
      component: HomeView,
    },
    {
      path: '/landing',
      name: 'landing',
      component: LandingPageView,
    },
    {
      path: '/openapi/:id?',
      name: 'openapi',
      component: OpenAPIEditorView,
    },
    {
      path: '/base64',
      name: 'base64',
      component: () => import('../views/Base64View.vue'),
    },
    {
      path: '/json-formatter',
      name: 'json-formatter',
      component: () => import('../views/JSONFormatterView.vue'),
    },
    {
      path: '/hash-generator',
      name: 'hash-generator',
      component: () => import('../views/HashGeneratorView.vue'),
    },
    {
      path: '/comparison',
      name: 'comparison',
      component: () => import('../views/ComparisonView.vue'),
    },
    {
      path: '/regex-tester',
      name: 'regex-tester',
      component: () => import('../views/RegexTesterView.vue'),
    },
    {
      path: '/url-encoder',
      name: 'url-encoder',
      component: () => import('../views/URLEncoderView.vue'),
    },
    {
      path: '/jwt-debugger',
      name: 'jwt-debugger',
      component: () => import('../views/JWTDebuggerView.vue'),
    },
    {
      path: '/uuid-generator',
      name: 'uuid-generator',
      component: () => import('../views/UUIDGeneratorView.vue'),
    },
    {
      path: '/mock-generator',
      name: 'mock-generator',
      component: () => import('../views/MockDataGeneratorView.vue')
    },
    {
      path: '/slug-generator',
      name: 'slug-generator',
      component: () => import('../views/SlugGeneratorView.vue')
    },
    {
      path: '/transformer',
      name: 'transformer',
      component: () => import('../views/TransformerView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
