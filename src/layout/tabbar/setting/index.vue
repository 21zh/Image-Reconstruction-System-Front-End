<template>
  <el-button size="default" icon="Refresh" circle @click="updateRresh"></el-button>
  <el-button size="default" icon="FullScreen" circle @click="fullScreen"></el-button>
  <el-popover placement="bottom" title="主题设置" :width="300" trigger="hover">
    <!-- 表单组件 -->
    <el-form>
      <el-form-item label="暗黑模式">
        <el-switch v-model="dark" class="mt-2" style="margin-left: 24px" active-icon="MoonNight" inactive-icon="Sunny"
          inline-prompt @change="changeDark" />
      </el-form-item>
    </el-form>
    <template #reference>
      <el-button size="default" icon="Setting" circle></el-button>
    </template>
  </el-popover>
  <img :src="userStore.avatar" style="width: 32px; height: 32px; margin: 0 10px; border-radius: 50%" />
  <!-- 下拉菜单 -->
  <el-dropdown>
    <span class="el-dropdown-link">
      {{ userStore.userName }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="layout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import {ref} from 'vue';
// 引入用户仓库
import userStores from '@/store/modules/user';
import LayOutSettingStore from '@/store/modules/setting';
import { useRoute ,useRouter} from 'vue-router';
// 获取用户的对象
let userStore = userStores();
// 获取仓库对象
let layoutSettingStore = LayOutSettingStore();

// 收集开关的数据
let dark = ref(false);
// 路由对象
let $router = useRouter();

// 刷新按钮点击回调
const updateRresh = () => {
  layoutSettingStore.refsh = !layoutSettingStore.refsh;
}

// 全屏按钮点击
const fullScreen = () => {
  // DOM对象的一个属性，用于判断当前是否全屏
  let full = document.fullscreenElement;
  // 切换全屏
  if (!full) {
    // 利用文档根节点的方法requestFullscreen来实现全屏
    document.documentElement.requestFullscreen();
  } else {
    // 退出全屏
    document.exitFullscreen();
  }
}

// change按钮的事件
const changeDark = () => {
    // 获取html的根节点
    let html = document.documentElement;
    // 判断html标签是否有类目dark
    dark.value ? html.className = 'dark' : html.className = '';
}

// 退出登录按钮的回调
const layout = async()=>{
  await userStore.logout();
  // 进行路由跳转
  $router.push('/login');
}
</script>
<script>
export default {
  name: 'Setting',
}
</script>

<style lang="scss" scoped></style>
