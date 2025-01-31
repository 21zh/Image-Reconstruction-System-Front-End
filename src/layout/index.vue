<template>
  <div class="layout_container">
    <!-- 左侧菜单 -->
    <div class="layout_slider">
      <Logo />
      <!-- 展示菜单 -->
      <el-scrollbar class="scrollbar">
        <!-- 菜单组件 -->
        <el-menu background-color="#2d3a4b" text-color="white">
          <!-- 动态展示菜单 -->
          <Menu :menuList="userStore.menuRoutes"></Menu>
        </el-menu>
      </el-scrollbar>
    </div>
    <!-- 顶部导航栏 -->
    <div class="layout_tabbar">
      <Tabbar />
    </div>
    <!-- 内容主体 -->
    <div class="layout_main">
      <Main></Main>
    </div>
  </div>
</template>

<script setup>
// 引入logo组件
import Logo from '@/layout/logo/index.vue';
// 引入菜单组件
import Menu from '@/layout/menu/index.vue';
// 引入用户仓库
import userStores from '@/store/modules/user';
// 引入顶部导航栏组件
import Tabbar from '@/layout/tabbar/index.vue';
// 引入主体内容组件
import Main from '@/layout/main/index.vue';

// 获取用户仓库对象
let userStore = userStores()
</script>

<style lang="scss" scoped>
.layout_container {
  width: 100%;
  height: 100vh;

  .layout_slider {
    color: white;
    width: $base-menu-width;
    height: 100vh;
    background: $base-menu-background;
    transition: all 0.3s;

    .scrollbar {
      width: 100%;
      height: calc(100vh - #{$base-menu-logo-height});

      .el-menu {
        border-right: none;
      }
    }
  }

  .layout_tabbar {
    position: fixed;
    width: calc(100% - $base-menu-width);
    height: $base-tabbar-height;
    top: 0px;
    left: $base-menu-width;
    transition: all 0.3s;
  }

  .layout_main {
    position: absolute;
    width: calc(100% - $base-menu-width);
    height: calc(100vh - $base-tabbar-height);
    top: $base-tabbar-height;
    left: $base-menu-width;
    padding: 20px;
    overflow: auto;
    transition: all 0.3s;
  }
}
</style>
