import 'primeicons/primeicons.css'
import 'remixicon/fonts/remixicon.css'
import 'swagger-ui-dist/swagger-ui.css'
import './assets/main.css'

import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'
import { MyPreset } from './assets/theme'
import { vSpotlight } from './directives/vSpotlight'
import { vHeight } from './directives/vHeight'
import FocusTrap from 'primevue/focustrap';
import App from './App.vue'
import router from './router'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { LiquidGlassPlugin } from './directives/vLiquidGlass'

// Monaco worker configuration for Vite
// @ts-ignore: Internal Monaco property
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.p-dark',
      cssLayer: {
        name: 'primevue',
        order: 'base, primevue, components, utilities'
      }
    }
  }
})

app.use(ConfirmationService);
app.use(ToastService);
app.use(LiquidGlassPlugin);
app.directive('tooltip', Tooltip);
app.directive('spotlight', vSpotlight);
app.directive('height', vHeight);
app.directive('focustrap', FocusTrap);

app.mount('#app')
