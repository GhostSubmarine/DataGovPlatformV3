import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import { createPinia } from 'pinia'
import { registerStore } from './store'
import { directive } from './utils/directive'
import { router } from './router'
import { i18n } from './i18n'
import 'virtual:svg-icons-register'

import '@/icons/iconfont/iconfont'
import 'element-plus/dist/index.css'
import '@/styles/index.scss'

import FastTableColumn from '@/components/fast-table-column'
import FastTableProjectColumn from '@/components/fast-table-project-column'
import FastTableOrgColumn from '@/components/fast-table-org-column'
import FastRadioGroup from '@/components/fast-radio-group'
import FastSelect from '@/components/fast-select'
import FastProjectSelect from '@/components/fast-project-select'
import FastCreatorColumn from '@/components/fast-creator-column'
import FastUser from '@/components/fast-user'
import SvgIcon from '@/components/svg-icon'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import dayjs from "dayjs"
import VChart from 'vue-echarts';
import * as echarts from 'echarts';
const app = createApp(App)
// 全局注册vue-echarts组件
app.component('v-chart', VChart);
 
// 如果你需要在全局范围内使用echarts，可以将其挂载到Vue的原型上（可选）
app.config.globalProperties.$echarts = echarts;
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.config.globalProperties.$dayjs = dayjs
app.use(createPinia())
// 注册 Pinia
registerStore()
// 注册 自定义指令
directive(app)
app.use(router)
app.use(i18n)
app.use(FastTableColumn)
app.use(FastTableProjectColumn)
app.use(FastTableOrgColumn)
app.use(FastRadioGroup)
app.use(FastSelect)
app.use(FastProjectSelect)
app.use(FastCreatorColumn)
app.use(FastUser)
app.use(SvgIcon)
app.use(ElementPlus)
app.mount('#app')
