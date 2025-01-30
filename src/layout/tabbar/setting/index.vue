<template>
  <el-button size="default" icon="Refresh" circle></el-button>
  <el-button size="default" icon="FullScreen" circle></el-button>
  <el-button size="default" icon="Setting" circle></el-button>
  <img
    :src="userStore.avatar"
    style="width: 24px; height: 24px; margin: 0 10px; border-radius: 50%"
  />
  <!-- 下拉菜单 -->
  <el-dropdown>
    <span class="el-dropdown-link">
      {{ userStore.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
// 引入用户仓库
import userStores from '@/store/modules/user'
// 获取用户的对象
let userStore = userStores()
</script>
<script>
export default {
  name: 'Setting',
}
</script>

<style lang="scss" scoped></style>
