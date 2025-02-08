<template>
  <ul class="infinite-list" style="overflow: auto">
    <div class="article" v-for="item in 20" @click="showArticle">
      <div class="leftContainer">
        <h1>这是一个binvox文件</h1>
        <div class="userContainer" @click.stop="searchUser" style="cursor:pointer">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
          <span class="userName">用户</span>
        </div>
      </div>
      <div class="rightContainer">
        <el-badge :value="like" :max="999" class="item">
          <svg-icon name="like" width="25px" height="25px" @click.stop="likeClick"></svg-icon>
        </el-badge>
        <el-badge :value="download" :max="999" class="item">
          <svg-icon name="download" width="25px" height="25px" @click.stop="downloadClick"></svg-icon>
        </el-badge>
      </div>
    </div>
  </ul>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
let count = ref(10);

// 点赞数
let like = ref(999);
// 下载数
let download = ref(999);

// 获取父组件的方法
let $emit = defineEmits(['showUserInfo','showArticle']);

// 点赞或者取消点赞
const likeClick = () => {
  ElMessage.success('点赞成功');
}

// 下载
const downloadClick = () => {
  ElMessage.success('下载成功');
}

// 查看用户按钮的回调
const searchUser = () => {
  $emit('showUserInfo');
}

// 查看帖子内容
const showArticle = () =>{
  $emit('showArticle');
}


</script>
<script>
// 暴露菜单组件
export default {
  name: 'forumContainer',
}
</script>
<style lang="scss" scoped>
h1 {
  font-size: 18px;
  color: red;
  margin: 5px 10px;
}

.infinite-list {
  height: 690px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}

.infinite-list .infinite-list-item+.list-item {
  margin-top: 10px;
}

.article {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 20px;
  padding: 15px;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.article:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.leftContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

h1 {
  font-size: 18px;
  color: #333333;
  margin: 0;
  font-weight: 600;
}

.userContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.userName {
  font-size: 14px;
  color: #666666;
}

.rightContainer {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.item:hover {
  opacity: 0.8;
}

.item svg {
  fill: #666666;
}

.item:hover svg {
  fill: #2196F3;
}
</style>