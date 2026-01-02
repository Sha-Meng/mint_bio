import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'animate.css'
import "@/assets/font/font.css";
import directives from './utils/directives' 

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(directives);
app.mount('#app')
