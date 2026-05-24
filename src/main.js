import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'animate.css'
import "@/assets/font/font.css";
import directives from './utils/directives'
import { i18nPlugin, initializeLanguage } from './utils/language'

async function bootstrap() {
  await initializeLanguage()

  const app = createApp(App)

  app.use(router)
  app.use(ElementPlus)
  app.use(directives)
  app.use(i18nPlugin)
  app.mount('#app')
}

bootstrap()

