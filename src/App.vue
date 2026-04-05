<template>
  <div class="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950 transition-colors duration-500">
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <!-- Top Header -->
    <header
      class="sticky top-0 z-[60] flex h-[60px] items-center justify-between border-b border-white/10 px-6 backdrop-blur-md bg-white/70 dark:bg-surface-950/70 transition-all duration-300">
      <div class="flex items-center gap-4">
        <Button icon="pi pi-bars" severity="secondary" text rounded
          class="hover:rotate-90 transition-transform duration-300" @click="toggleSidebar" />
        <div class="group flex items-center group cursor-pointer" @click="router.push('/')">
          <span
            class="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-emphasis group-hover:scale-110 transition-all duration-300">
            DevTools+
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <Button :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" aria-label="Toggle Dark Mode" rounded
          severity="secondary" text class="hover:bg-primary/10 transition-colors duration-300"
          @click="toggleDarkMode" />
      </div>
    </header>

    <div class="flex flex-1 relative overflow-hidden">
      <!-- Sidebar Overlay (Mobile/Tablet) -->
      <Transition name="fade">
        <div v-if="sidebarOpen && !isLargeScreen" class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          @click="sidebarOpen = false"></div>
      </Transition>

      <!-- Sidebar -->
      <aside :class="[
        'z-50 flex flex-col transition-all duration-500 ease-in-out border-r border-white/10 backdrop-blur-xl bg-white/40 dark:bg-surface-900/40',
        isLargeScreen ? (sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full opacity-0') : (sidebarOpen ? 'fixed inset-y-0 left-0 w-72 translate-x-0' : 'fixed inset-y-0 left-0 w-72 -translate-x-full'),
      ]">
        <div class="flex h-full flex-col p-4 overflow-y-auto overflow-x-hidden min-w-[18rem]">
          <div class="mb-6 flex items-center justify-between px-2 lg:hidden">
            <span class="font-bold text-surface-500 uppercase text-xs tracking-widest">Menu</span>
            <Button icon="pi pi-times" severity="secondary" text rounded size="small" @click="sidebarOpen = false" />
          </div>

          <nav class="flex-1">
            <PanelMenu :model="menuItems" class="w-full border-none bg-transparent">
              <template #item="{ item, props, hasSubmenu, active }">
                <!-- Header Item (Branch with Submenu) -->
                <div v-if="hasSubmenu"
                  class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer mb-1 mx-1 text-surface-600 dark:text-surface-400 hover:text-primary hover:bg-primary/10 select-none group"
                  v-bind="props.action">
                  <i :class="[item.icon, 'text-lg transition-transform duration-300 group-hover:scale-110']"></i>
                  <span class="flex-1">{{ item.label }}</span>
                  <i
                    :class="['pi text-[10px] text-surface-400 group-hover:text-primary transition-all duration-300', active ? 'pi-chevron-down' : 'pi-chevron-right']">
                  </i>
                </div>

                <!-- Leaf Item (Link or Action) -->
                <router-link v-else-if="item.path" :to="item.path" custom v-slot="{ href, navigate }">
                  <a :href="href" @click="navigate" :class="[
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer mb-1 mx-1',
                    'hover:bg-primary/10 hover:translate-x-1',
                    isRouteActive(item) ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' : 'text-surface-600 dark:text-surface-400 hover:text-primary'
                  ]" v-ripple>
                    <i :class="[item.icon, 'text-lg transition-transform duration-300 group-hover:scale-110']"></i>
                    <span>{{ item.label }}</span>
                    <i v-if="isRouteActive(item) && !hasSubmenu" class="pi pi-chevron-right ml-auto text-[10px]"></i>
                  </a>
                </router-link>

                <!-- Generic Action Item -->
                <a v-else @click="item.command?.({ item, originalEvent: $event })" :class="[
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer mb-1 mx-1',
                  'hover:bg-primary/10 hover:translate-x-1 text-surface-600 dark:text-surface-400 hover:text-primary'
                ]" v-ripple>
                  <i :class="[item.icon, 'text-lg transition-transform duration-300 group-hover:scale-110']"></i>
                  <span>{{ item.label }}</span>
                </a>
              </template>
            </PanelMenu>
          </nav>

          <div class="mt-auto pt-6 px-4">
            <div
              class="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-emphasis/5 border border-primary/10">
              <p class="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">Current Version</p>
              <p class="text-xs font-mono text-surface-500">v1.1.0-beta</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main :class="[
        'flex-1 flex flex-col overflow-auto transition-all duration-500 ease-in-out',
        isLargeScreen && sidebarOpen ? 'ml-0' : ''
      ]">
        <div class="flex-1 relative">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <!-- Create Profile Dialog -->
    <Dialog v-model:visible="createDialogVisible" header="Create New OpenAPI Profile" modal class="glass-dialog"
      :style="{ width: '50vw' }" :breakpoints="{ '1024px': '75vw', '640px': '95vw' }">
      <div class="flex flex-col gap-6 p-1">
        <div class="flex flex-col gap-2">
          <label for="name" class="text-sm font-semibold text-surface-600 dark:text-surface-300">Profile Name</label>
          <InputText id="name" v-model="newProfileName" placeholder="e.g. My API v1" class="w-full glass-input" />
        </div>
        <div class="relative flex flex-col gap-2 group" @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false" @drop="handleDrop">
          <label class="text-sm font-semibold text-surface-600 dark:text-surface-300">OpenAPI Spec (YAML or
            JSON)</label>
          <div :class="[
            'relative overflow-hidden rounded-xl transition-all duration-300',
            isDragging ? 'ring-2 ring-primary bg-primary/5' : 'ring-1 ring-surface-200 dark:ring-surface-700'
          ]">
            <Textarea v-model="newProfileSpec" rows="12"
              class="w-full border-none bg-transparent font-mono text-sm focus:ring-0 p-4"
              :placeholder="isDragging ? 'Drop it here!' : 'Paste your spec or drop a file here...'" />
            <div v-if="isDragging"
              class="absolute inset-0 flex items-center justify-center bg-primary/10 pointer-events-none">
              <div class="flex flex-col items-center gap-2 animate-bounce">
                <i class="pi pi-cloud-upload text-4xl text-primary"></i>
                <span class="font-bold text-primary">Drop to Import</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end pt-4">
          <Button label="Cancel" text severity="secondary" rounded @click="createDialogVisible = false" />
          <Button label="Create Profile" icon="pi pi-check" rounded raised @click="saveNewProfile"
            :disabled="!newProfileSpec" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useProfileStore } from '@/stores/profileStore'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import type { MenuItem } from 'primevue/menuitem'
import PanelMenu from 'primevue/panelmenu'
import Textarea from 'primevue/textarea'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

const sidebarOpen = ref(true)
const isLargeScreen = ref(true)
const createDialogVisible = ref(false)
const newProfileSpec = ref('')
const newProfileName = ref('')
const isDragging = ref(false)

const checkScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1024
  if (!isLargeScreen.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      path: '/',
      command: () => {
        router.push('/')
        if (!isLargeScreen.value) sidebarOpen.value = false
      }
    }
  ]

  if (profileStore.profiles.length === 0) {
    items.push({
      label: 'OpenAPI Editor',
      icon: 'pi pi-pencil',
      path: '/openapi',
      command: () => {
        router.push('/openapi')
        if (!isLargeScreen.value) sidebarOpen.value = false
      },
      items: [
        {
          label: 'New Profile',
          icon: 'pi pi-plus',
          visible: () => profileStore.profiles.length < 5,
          command: () => {
            createDialogVisible.value = true
            if (!isLargeScreen.value) sidebarOpen.value = false
          }
        }
      ]
    })
  } else {
    items.push({
      label: 'OpenAPI Editor',
      icon: 'pi pi-pencil',
      expanded: true,
      items: [
        ...profileStore.profiles.map(p => ({
          label: p.name,
          icon: 'pi pi-file',
          path: `/openapi/${p.id}`,
          command: () => {
            router.push(`/openapi/${p.id}`)
            if (!isLargeScreen.value) sidebarOpen.value = false
          }
        })),
        {
          label: 'New Profile',
          icon: 'pi pi-plus',
          visible: () => profileStore.profiles.length < 5,
          command: () => {
            createDialogVisible.value = true
            if (!isLargeScreen.value) sidebarOpen.value = false
          }
        }
      ]
    })
  }

  items.push({
    label: 'JSON Formatter',
    icon: 'pi pi-database',
    path: '/json-formatter',
    command: () => {
      router.push('/json-formatter')
      if (!isLargeScreen.value) sidebarOpen.value = false
    }
  })

  items.push({
    label: 'Base64 Tool',
    icon: 'pi pi-lock',
    path: '/base64',
    command: () => {
      router.push('/base64')
      if (!isLargeScreen.value) sidebarOpen.value = false
    }
  })

  items.push({
    label: 'About',
    icon: 'pi pi-info-circle',
    path: '/about',
    command: () => {
      router.push('/about')
      if (!isLargeScreen.value) sidebarOpen.value = false
    }
  })

  return items
})

const isRouteActive = (item: any) => {
  if (item.path === '/openapi' && route.path === '/openapi') return true
  if (item.path === '/' && route.path === '/') return true
  if (item.path?.startsWith('/openapi/') && route.path === item.path) return true
  if (item.path === '/about' && route.path === '/about') return true
  if (item.path === '/base64' && route.path === '/base64') return true
  if (item.path === '/json-formatter' && route.path === '/json-formatter') return true
  return false
}

const isDarkMode = ref(document.documentElement.classList.contains('p-dark'))

const toggleDarkMode = () => {
  const dark = document.documentElement.classList.toggle('p-dark')
  isDarkMode.value = dark
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      newProfileSpec.value = event.target?.result as string
    }
    reader.readAsText(file)
  }
}

const saveNewProfile = () => {
  try {
    const id = profileStore.addProfile(newProfileSpec.value, newProfileName.value)
    newProfileSpec.value = ''
    newProfileName.value = ''
    createDialogVisible.value = false
    router.push(`/openapi/${id}`)
  } catch (e: any) {
    alert(e.message)
  }
}
</script>

<style scoped>
@reference "@/assets/main.css";

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Glass Morphism Classes */
.glass-input {
  @apply bg-white/50 dark:bg-surface-950/50 backdrop-blur-sm border-white/10 dark:border-surface-700/50 transition-all duration-300 focus:ring-2 focus:ring-primary/50;
}

/* PanelMenu Overrides */
:deep(.p-panelmenu) {
  @apply flex flex-col gap-2;
}

:deep(.p-panelmenu-panel) {
  @apply border-none bg-transparent;
}

:deep(.p-panelmenu-header-content) {
  @apply border-none bg-transparent ! p-0 !;
}

:deep(.p-panelmenu-content) {
  @apply border-none bg-transparent ! p-0 ! mt-1;
}

:deep(.p-panelmenu-item-content) {
  @apply border-none bg-transparent !;
}
</style>
