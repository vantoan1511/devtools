<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ToggleButton from 'primevue/togglebutton'
import { useToast } from 'primevue/usetoast'
import { faker } from '@faker-js/faker'

const toast = useToast()

interface Field {
  id: string
  name: string
  type: string
}

const dataTypes = [
  { group: 'Person', items: [
    { label: 'Full Name', value: 'person.fullName' },
    { label: 'First Name', value: 'person.firstName' },
    { label: 'Last Name', value: 'person.lastName' },
    { label: 'Job Title', value: 'person.jobTitle' }
  ]},
  { group: 'Contact', items: [
    { label: 'Email', value: 'internet.email' },
    { label: 'Phone Number', value: 'phone.number' },
    { label: 'Username', value: 'internet.userName' }
  ]},
  { group: 'Location', items: [
    { label: 'Country', value: 'location.country' },
    { label: 'City', value: 'location.city' },
    { label: 'Street Address', value: 'location.streetAddress' },
    { label: 'Zip Code', value: 'location.zipCode' }
  ]},
  { group: 'System', items: [
    { label: 'UUID', value: 'string.uuid' },
    { label: 'ID (Auto-increment)', value: 'system.id' },
    { label: 'Boolean', value: 'datatype.boolean' }
  ]},
  { group: 'Text', items: [
    { label: 'Word', value: 'lorem.word' },
    { label: 'Sentence', value: 'lorem.sentence' },
    { label: 'Paragraph', value: 'lorem.paragraph' }
  ]}
]

const fields = ref<Field[]>([
  { id: '1', name: 'id', type: 'system.id' },
  { id: '2', name: 'name', type: 'person.fullName' },
  { id: '3', name: 'email', type: 'internet.email' },
  { id: '4', name: 'city', type: 'location.city' }
])

const quantity = ref(10)
const tableName = ref('users')
const generatedData = ref<any[]>([])
const exportFormat = ref('json')

const generateData = () => {
  const data = []
  for (let i = 0; i < quantity.value; i++) {
    const item: any = {}
    fields.value.forEach(field => {
      if (field.type === 'system.id') {
        item[field.name] = i + 1
      } else {
        const [category, method] = field.type.split('.')
        item[field.name] = (faker as any)[category][method]()
      }
    })
    data.push(item)
  }
  generatedData.value = data
}

const addField = () => {
  fields.value.push({
    id: Date.now().toString(),
    name: 'new_field',
    type: 'lorem.word'
  })
}

const removeField = (id: string) => {
  fields.value = fields.value.filter(f => f.id !== id)
}

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

const exportJSON = () => {
  const json = JSON.stringify(generatedData.value, null, 2)
  downloadFile(json, `${tableName.value}.json`, 'application/json')
  toast.add({ severity: 'success', summary: 'Exported', detail: 'Data exported as JSON', life: 2000 })
}

const exportCSV = () => {
  if (generatedData.value.length === 0) return
  const headers = Object.keys(generatedData.value[0]).join(',')
  const rows = generatedData.value.map(row => 
    Object.values(row).map(val => `"${val}"`).join(',')
  ).join('\n')
  const csv = `${headers}\n${rows}`
  downloadFile(csv, `${tableName.value}.csv`, 'text/csv')
  toast.add({ severity: 'success', summary: 'Exported', detail: 'Data exported as CSV', life: 2000 })
}

const exportSQL = () => {
  if (generatedData.value.length === 0) return
  const keys = Object.keys(generatedData.value[0])
  const columns = keys.join(', ')
  
  const inserts = generatedData.value.map(row => {
    const values = Object.values(row).map(val => {
      if (typeof val === 'number' || typeof val === 'boolean') return val
      return `'${String(val).replace(/'/g, "''")}'`
    }).join(', ')
    return `INSERT INTO ${tableName.value} (${columns}) VALUES (${values});`
  }).join('\n')

  downloadFile(inserts, `${tableName.value}.sql`, 'text/plain')
  toast.add({ severity: 'success', summary: 'Exported', detail: 'Data exported as SQL', life: 2000 })
}

const copyToClipboard = async () => {
  const json = JSON.stringify(generatedData.value, null, 2)
  await navigator.clipboard.writeText(json)
  toast.add({ severity: 'info', summary: 'Copied', detail: 'Preview data copied to clipboard', life: 2000 })
}

onMounted(() => {
  generateData()
})
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden">
    <!-- Toolbar -->
    <div
      class="z-10 flex flex-wrap items-center justify-between border-b border-surface-200 dark:border-white/10 bg-white/70 px-4 py-2 backdrop-blur-md dark:bg-surface-900/70 transition-colors duration-300">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <i class="pi pi-database text-primary text-sm"></i>
          <span class="font-bold text-xs uppercase tracking-wider text-primary">Mock Generator</span>
        </div>
        <div class="hidden sm:block h-6 w-[1px] bg-surface-200 dark:bg-surface-700 mx-1"></div>
        <div class="flex items-center gap-2">
          <Button label="Generate" icon="pi pi-refresh" size="small" @click="generateData" />
          <InputNumber v-model="quantity" showButtons buttonLayout="horizontal" :min="1" :max="1000" 
            class="custom-inputnumber h-8" v-tooltip.bottom="'Number of records'" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-surface-200 dark:border-surface-700">
          <Button label="JSON" size="small" text @click="exportJSON" class="text-xs hover:bg-primary/10" />
          <Button label="CSV" size="small" text severity="secondary" @click="exportCSV" class="text-xs" />
          <Button label="SQL" size="small" text severity="secondary" @click="exportSQL" class="text-xs" />
        </div>
        <Button v-tooltip.bottom="'Copy Preview'" icon="pi pi-copy" size="small" severity="secondary" text rounded @click="copyToClipboard" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden p-4 md:p-6">
      <div class="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">
        
        <!-- Sidebar: Configuration -->
        <div class="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pr-1">
          <Card class="border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm">
            <template #title>
              <div class="flex items-center justify-between px-2 text-base">
                <span class="font-bold">Schema</span>
                <Button icon="pi pi-plus" size="small" text rounded @click="addField" v-tooltip.bottom="'Add Field'" />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-black uppercase text-surface-400 tracking-widest px-1">Table Name</label>
                  <InputText v-model="tableName" class="w-full text-xs font-mono rounded-xl bg-surface-50 dark:bg-surface-950 border-surface-200 dark:border-surface-800" />
                </div>

                <div class="flex flex-col gap-3 mt-2">
                  <div v-for="(field, index) in fields" :key="field.id" 
                    class="p-3 rounded-2xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 animate-in slide-in-from-left-2"
                    :style="{ animationDelay: `${index * 50}ms` }">
                    <div class="flex items-center justify-between mb-2">
                      <InputText v-model="field.name" class="w-2/3 h-7 text-[11px] font-mono font-bold bg-transparent border-none focus:ring-0 p-0" placeholder="field_name" />
                      <Button icon="pi pi-times" size="small" text severity="danger" rounded class="h-6 w-6 p-0" @click="removeField(field.id)" />
                    </div>
                    <Select v-model="field.type" :options="dataTypes" optionLabel="label" optionValue="value" optionGroupLabel="group" optionGroupChildren="items" 
                      class="w-full custom-select" />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Preview Area -->
        <div class="flex-1 min-w-0">
          <Card class="h-full border-none shadow-sm bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
            <template #title>
              <div class="flex items-center justify-between px-2 text-base">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i class="pi pi-eye text-primary"></i>
                  </div>
                  <span class="font-bold">Data Preview</span>
                </div>
                <Tag :value="`Displaying ${Math.min(quantity, 50)} items`" severity="secondary" rounded class="text-[10px]" />
              </div>
            </template>
            <template #content>
              <div class="flex-1 overflow-auto h-full pt-2">
                <DataTable :value="generatedData.slice(0, 50)" class="custom-table text-xs" 
                  size="small" stripedRows scrollable scrollHeight="flex">
                  <Column v-for="field in fields" :key="field.id" :field="field.name" :header="field.name">
                    <template #body="slotProps">
                      <span class="font-mono text-surface-600 dark:text-surface-400">{{ slotProps.data[field.name] }}</span>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="z-10 flex items-center justify-between border-t border-surface-200 dark:border-white/10 bg-white/50 px-4 py-1.5 backdrop-blur-md dark:bg-surface-900/50 text-[11px] font-medium text-surface-500">
      <div class="flex items-center gap-4">
        <span>Rows: {{ quantity }}</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span>Fields: {{ fields.length }}</span>
        <div class="h-3 w-[1px] bg-surface-200 dark:bg-surface-700"></div>
        <span class="uppercase tracking-widest text-[9px] font-bold text-primary">Faker.js Engine</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="opacity-70">Formats: JSON, CSV, SQL</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.custom-inputnumber :deep(.p-inputtext) {
  @apply w-12 text-center text-xs font-bold py-1 px-0 bg-transparent border-none focus:ring-0;
}

.custom-inputnumber :deep(.p-inputnumber-button) {
  @apply w-6 h-6 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-surface-500 hover:bg-primary/10 hover:text-primary transition-all p-0;
}

.custom-select :deep(.p-select-label) {
  @apply text-[10px] py-1 px-2;
}

.custom-table :deep(.p-datatable-thead > tr > th) {
  @apply bg-surface-100/50 dark:bg-surface-800/50 text-[10px] font-black uppercase tracking-wider py-2;
}

.custom-table :deep(.p-datatable-tbody > tr > td) {
  @apply py-2;
}

.animate-in {
  animation: animate-in 0.4s ease-out forwards;
}

@keyframes animate-in {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

:deep(.p-card-body) {
  @apply p-4! h-full flex flex-col;
}
:deep(.p-card-content) {
  @apply p-0! flex-1 flex flex-col min-h-0 h-full;
}
</style>
