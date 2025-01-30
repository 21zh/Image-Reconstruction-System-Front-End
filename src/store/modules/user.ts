// 创建用户相关的小仓库
import { defineStore } from 'pinia'
// 引入数据类型
import type { UserState } from '@/stores/interface'
// 引入路由相关对象
import { constantRoute } from '@/router/routers'

// 创建用户小仓库
let userStores = defineStore('User', {
  // 存储数据
  state: (): UserState => {
    return {
      // 用户名
      username: '',
      // 密码
      password: '',
      // 头像
      avatar: '',
      // 路由数据
      menuRoutes: constantRoute,
    }
  },
})

// 对外暴露用户的小仓库
export default userStores
