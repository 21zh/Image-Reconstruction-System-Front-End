import type { RouteRecordRaw } from 'vue-router'
// 定义小仓库数据类型
export interface UserState {
  username: string
  password: string
  avatar: string
  menuRoutes: RouteRecordRaw[]
}
