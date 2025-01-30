// 配置相关的小仓库
import { defineStore } from 'pinia'

let LayOutSettingStore = defineStore('Settinng', {
  state: () => {
    return {
      fold: false, // 控制菜单栏是否对折
      refsh: false, // 是否刷新
    }
  },
})

// 对外暴露配置仓库
export default LayOutSettingStore
