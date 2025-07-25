// 通过vue-router插件实现模板路由配置
import { createRouter, createWebHashHistory } from 'vue-router'
import { adminRoute } from './routers'
// 创建路由器
let router = createRouter({
  // 路由模式hash
  history: createWebHashHistory(),
  routes: adminRoute,
  scrollBehavior: () => {
    return { left: 0, top: 0 }
  },
})

export default router
