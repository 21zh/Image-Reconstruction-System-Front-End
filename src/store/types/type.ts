import type { RouteRecordRaw } from 'vue-router'
// 定义小仓库数据类型
export interface UserState {
  userName: string
  password: string
  avatar: string
  menuRoutes: RouteRecordRaw[]
}
