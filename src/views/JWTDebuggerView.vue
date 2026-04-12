<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-auto">
    <!-- Toolbar -->
    <DToolbar :pill="true">
      <template #start>
        <div class="flex items-center gap-2">
          <i class="pi pi-shield text-primary"></i>
          <span class="font-bold uppercase tracking-wider text-primary">JWT Debugger</span>

          <Divider v-if="!token" layout="vertical"/>

          <Button v-if="!token" label="Insert Sample" icon="pi pi-info-circle" text @click="insertSample"
                  class="text-xs"/>
        </div>
      </template>
      <template #end>
        <Button v-tooltip.bottom="'Clear All'" icon="pi pi-trash" severity="secondary" text rounded
                @click="clearAll"/>
      </template>
    </DToolbar>

    <!-- Main Content -->
    <div class="flex-1 p-4 md:p-6">
      <div class="max-w-7xl mx-auto flex flex-col gap-6 h-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

          <!-- Encoded Token Input -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <Card
                class="flex-1 border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <template #title>
                <div class="flex items-center gap-2 text-base px-2">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i class="pi pi-key text-primary"></i>
                  </div>
                  <span class="font-bold">Encoded Token</span>
                </div>
              </template>
              <template #content>
                <div class="flex-1 flex flex-col h-full min-h-0 pt-2">
                  <Textarea v-model="token"
                            class="flex-1 w-full font-mono text-xs p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border-none focus:ring-2 focus:ring-primary/20 resize-none break-all"
                            placeholder="Paste your JWT (Encoded) here..."/>

                  <div v-if="error" class="mt-4 animate-in slide-in-from-top-2">
                    <Message severity="error" icon="pi pi-exclamation-triangle"
                             class="m-0 border-none bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-xl">
                      {{ error }}
                    </Message>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Decoded Results -->
          <div class="lg:col-span-7 flex flex-col gap-6 min-h-0">
            <!-- Header Section -->
            <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
              <template #title>
                <div class="flex items-center justify-between px-2">
                  <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-surface-400">
                    <i class="pi pi-cog text-primary"></i>
                    <span>Header</span>
                    <span
                        class="ml-2 font-mono text-[10px] text-surface-300 normal-case">JOSE Algorithm & Token Type</span>
                  </div>
                  <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copy(headerObj)"
                          v-tooltip.bottom="'Copy Header'"/>
                </div>
              </template>
              <template #content>
                <div class="relative group">
                  <pre
                      class="font-mono text-xs p-4 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 overflow-auto max-h-[150px] leading-relaxed text-surface-700 dark:text-surface-300">{{
                      headerObj ? JSON.stringify(headerObj, null, 2) : 'Waiting for token...'
                    }}</pre>
                </div>
              </template>
            </Card>

            <!-- Payload Section -->
            <Card
                class="flex-1 border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <template #title>
                <div class="flex items-center justify-between px-2">
                  <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-surface-400">
                    <i class="pi pi-database text-green-500"></i>
                    <span>Payload</span>
                    <span class="ml-2 font-mono text-[10px] text-surface-300 normal-case">Data & Claims</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Tag v-if="payloadObj?.exp" :value="isExpired ? 'Expired' : 'Valid'"
                         :severity="isExpired ? 'danger' : 'success'" rounded class="text-[9px]"/>
                    <Button icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copy(payloadObj)"
                            v-tooltip.bottom="'Copy Payload'"/>
                  </div>
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-4 flex-1 h-full min-h-0 pt-2">
                  <!-- Payload Data -->
                  <pre
                      class="flex-1 font-mono text-xs p-4 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 overflow-auto leading-relaxed text-surface-700 dark:text-surface-300">{{
                      payloadObj ? JSON.stringify(payloadObj, null, 2) : 'Waiting for token...'
                    }}</pre>

                  <!-- Claim Inspector -->
                  <div v-if="payloadObj" class="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in">
                    <div v-if="payloadObj.iat"
                         class="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                      <div class="text-[9px] font-black uppercase text-surface-400 tracking-tighter mb-1">Issued At
                        (iat)
                      </div>
                      <div class="text-xs font-mono font-bold">{{ formatDate(payloadObj.iat) }}</div>
                    </div>
                    <div v-if="payloadObj.exp"
                         class="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
                         :class="{'ring-1 ring-red-500/30': isExpired}">
                      <div
                          class="text-[9px] font-black uppercase text-surface-400 tracking-tighter mb-1 flex justify-between">
                        Expiration (exp)
                        <span v-if="timeRemaining" class="text-primary">{{ timeRemaining }}</span>
                      </div>
                      <div class="text-xs font-mono font-bold">{{ formatDate(payloadObj.exp) }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>

            <!-- Signature Display -->
            <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden">
              <template #title>
                <div class="flex items-center justify-between px-2">
                  <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-surface-400">
                    <i class="pi pi-pencil text-orange-500"></i>
                    <span>Signature</span>
                  </div>
                  <Tag v-if="headerObj?.alg" :value="headerObj.alg" severity="secondary" rounded class="text-[9px]"/>
                </div>
              </template>
              <template #content>
                <div
                    class="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 font-mono text-[10px] break-all leading-tight text-orange-600 dark:text-orange-400">
                  {{ signatureHex || 'Waiting for token...' }}
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div
        class="sticky bottom-0 z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500">
      <div class="flex items-center gap-4">
        <span>Token Length: {{ charCount }}</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <div class="flex items-center gap-1.5">
          <div :class="['w-2 h-2 rounded-full transition-colors', headerObj ? 'bg-green-500' : 'bg-surface-300']"></div>
          <span>{{ headerObj ? 'Decoded' : 'No Token' }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="uppercase tracking-widest text-[9px] font-bold opacity-70">Local Decoding Only</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import {useToast} from 'primevue/usetoast'
import {Buffer} from 'buffer'
import DToolbar from "@/components/DToolbar.vue";

const toast = useToast()
const token = ref('')
const headerObj = ref<any>(null)
const payloadObj = ref<any>(null)
const signatureHex = ref('')
const error = ref('')

const charCount = computed(() => token.value.length)

const decodeToken = () => {
  error.value = ''
  headerObj.value = null
  payloadObj.value = null
  signatureHex.value = ''

  if (!token.value.trim()) return

  const parts = token.value.trim().split('.')
  if (parts.length !== 3) {
    error.value = 'Invalid JWT format. A token must consist of three parts separated by dots.'
    return
  }

  try {
    const base64UrlDecode = (str: string) => {
      // Convert base64url to base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      while (base64.length % 4) base64 += '='
      return Buffer.from(base64, 'base64').toString('utf8')
    }

    const headerJson = base64UrlDecode(parts[0] || '')
    const payloadJson = base64UrlDecode(parts[1] || '')

    headerObj.value = JSON.parse(headerJson)
    payloadObj.value = JSON.parse(payloadJson)
    signatureHex.value = parts[2] || ''

  } catch (e) {
    error.value = 'Decoding failed: ' + (e as Error).message
  }
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp * 1000).toLocaleString()
  } catch (e) {
    return 'Invalid Date'
  }
}

const isExpired = computed(() => {
  if (!payloadObj.value?.exp) return false
  return Date.now() >= payloadObj.value.exp * 1000
})

const timeRemaining = computed(() => {
  if (!payloadObj.value?.exp) return null
  const diff = payloadObj.value.exp * 1000 - Date.now()
  if (diff < 0) return 'Expired'

  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  if (hours > 0) return `${hours}h ${mins % 60}m remaining`
  return `${mins}m remaining`
})

const copy = (obj: any) => {
  if (!obj) return
  const text = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
  navigator.clipboard.writeText(text)
  toast.add({severity: 'success', summary: 'Copied', detail: 'Content copied to clipboard', life: 2000})
}

const insertSample = () => {
  // A standard sample token (HS256)
  token.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjIsImF1ZCI6ImRldnRvb2xzKyJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  toast.add({severity: 'info', summary: 'Sample Loaded', detail: 'Test token inserted', life: 2000})
}

const clearAll = () => {
  token.value = ''
}

watch(token, decodeToken)

onMounted(() => {
  if (token.value) decodeToken()
})
</script>

<style scoped>
@reference "@/assets/main.css";

:deep(.p-card-body) {
  @apply p-4! h-full flex flex-col;
}

:deep(.p-card-content) {
  @apply p-0! flex-1 flex flex-col min-h-0;
}

.animate-in {
  animation: animate-in 0.4s ease-out forwards;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
