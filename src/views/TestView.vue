<script setup lang="ts">
import { ref } from 'vue'

const height = ref(0)
const onHeightChange = (h: number) => {
  console.log('Height changed to:', h)
}
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Test View</h1>
        <p>This is a simple test view to verify the <code>v-height</code> directive.</p>
        
        <div class="mt-8 p-4 border rounded-lg bg-surface-50 dark:bg-surface-900">
            <p class="mb-2">Observed element height: <strong>{{ height }}px</strong></p>
            
            <div 
                v-height="height"
                class="bg-primary text-primary-contrast p-4 rounded transition-all duration-300 overflow-hidden"
                :style="{ height: height > 200 ? '100px' : '250px' }"
            >
                <p>This box changes height automatically in this test.</p>
                <p>Resize the window or wait for animations to see updates.</p>
            </div>
        </div>

        <div class="mt-4 p-4 border rounded-lg">
          <p>Testing with callback:</p>
          <div v-height="onHeightChange" class="p-4 bg-secondary text-secondary-contrast mt-2">
            Check console for height updates of this box.
          </div>
        </div>
    </div>
</template>
