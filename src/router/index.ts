import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OpenAPIEditorView from '../views/OpenAPIEditorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
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
  ],
})

export default router
