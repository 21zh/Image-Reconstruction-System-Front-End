// 引入项目中的所有全局组件
import SvgIcon from './SvgIcon/index.vue'
import Pagination from './Pagination/index.vue'
// 引入elements-plus组件提供的全部图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const allGloablComponents = { SvgIcon, Pagination }

// 对外暴露插件对象
export default {
  // 插件对象中必须有一个 install 方法
  install(app) {
    Object.keys(allGloablComponents).forEach((key) => {
      // 注册所有组件
      app.component(key, allGloablComponents[key])
      // 将element-plus的图标注册为全局组件
      for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
      }
    })
  },
}
