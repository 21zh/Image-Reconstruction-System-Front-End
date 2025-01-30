<template>
  <!-- 顶部左侧静态结构 -->
  <el-icon style="margin-right: 10px">
    <component :is="layOutSettingStore.fold ? 'Fold' : 'Expand'"></component>
  </el-icon>
  <el-breadcrumb :separator-icon="`ArrowRight`">
    <!-- 动态展示路由和标题 -->
    <el-breadcrumb-item
      v-for="(item, index) in $route.matched"
      :key="index"
      v-show="item.meta.title && !item.meta.hidden"
      :to="item.path"
    >
      <el-icon style="margin: 0px 5px">
        <component :is="item.meta.icon"></component>
      </el-icon>
      <span>{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
// 引入相关的组件
import LayOutSettingStore from '@/store/modules/setting'
import { useRoute } from 'vue-router'

// 获取相关仓库对象
let layOutSettingStore = LayOutSettingStore()
// 获取路由对象
let $route = useRoute()

console.log($route.matched)
</script>

<script>
export default {
  name: 'Breadcrumb',
}
</script>

<style lang="scss" scoped></style>
