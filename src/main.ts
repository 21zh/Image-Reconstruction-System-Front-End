import { createApp } from 'vue'
import App from '@/App.vue'
// 引入element-plus插件与样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 配置element-plus国际化
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// svg插件配置代码
import 'virtual:svg-icons-register'
// 引入模板的全局样式
import '@/styles/index.scss'
// 引入自定义插件对象，注册整个项目的全局插件
import globalComponent from '@/components'
// 引入路由
import router from '@/router'
// 引入仓库
import pinia from '@/store'
// 获取应用实例对象
const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn,
})
// 安装element-plus插件
app.use(ElementPlus)

// 安装之定义插件
app.use(globalComponent)

// 注册模板路由
app.use(router)

// 安装pinia仓库
app.use(pinia)

// 将应用挂载到容器中
app.mount('#app')
