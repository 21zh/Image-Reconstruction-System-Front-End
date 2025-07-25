<template>
  <ul class="infinite-list" style="overflow: auto">
    <div class="article" v-for="(item, index) in props.forumList" :key="item.id" @click="showArticle(item)">
      <div class="leftContainer">
        <h1>{{ item.title }}</h1>
        <div class="userContainer" @click.stop="searchUser(item)" style="cursor:pointer">
          <el-avatar :src=item.avatar />
          <span class="userName">{{ item.userName }}</span>
        </div>
      </div>
      <div class="rightContainer">
        <el-badge :value="item.likes" :max="999" class="item">
          <svg-icon :name="!item.ilike?'unLike':'like'" width="25px" height="25px" @click.stop="likeClick(item)"></svg-icon>
        </el-badge>
        <el-badge :value="item.downloads" :max="999" class="item">
          <svg-icon name="download" width="25px" height="25px" @click.stop="downloadClick(item)"></svg-icon>
        </el-badge>
      </div>
    </div>
  </ul>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { fileDownload } from '../../../utils/fileDownload';
import userStores from '../../../store/modules/user';

// 获取用户对象
let userStore = userStores();
// 配置websocket端点
let socket = new SockJS(import.meta.env.VITE_SERVE + '/ws');
let stompClient = Stomp.over(socket);

// 连接websocket实时更新点赞和下载
stompClient.connect({}, () => {
  stompClient.subscribe('/forum/likes', (likeMap) => {
    // 解析对象
    let updateLikes = JSON.parse(likeMap.body);
    // 查找对应的帖子
    let post = props.forumList.find(item => item.id === updateLikes.id);
    // 存在，更新
    if (post) {
      // 更新点赞数
      post.likes = updateLikes.likes;
      post.ilike = !post.ilike;
    }

  });
  stompClient.subscribe('/forum/downloads', (downloadMap) => {
    // 解析对象
    let updateDownloads = JSON.parse(downloadMap.body);
    // 查找对应的帖子
    let post = props.forumList.find(item => item.id === updateDownloads.id);
    // 存在，更新
    if (post) {
      // 更新下载量
      post.downloads = updateDownloads.downloads;
    }
  });
});

// 接收父组件传递过来的帖子数据
const props = defineProps({
  forumList: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      return value.every(item =>
        typeof item.id === 'number' &&
        typeof item.typeId === 'number' &&
        typeof item.userId === 'number' &&
        typeof item.title === 'string' &&
        typeof item.image === 'string' &&
        typeof item.model === 'string' &&
        typeof item.likes === 'number' &&
        typeof item.downloads === 'number' &&
        typeof item.userName === 'string' &&
        typeof item.avatar === 'string' &&
        typeof item.motto === 'string' &&
        typeof item.createTime === 'string' &&
        typeof item.ilike === 'boolean'
      )
    }
  },
});

// 获取父组件的方法
let $emit = defineEmits(['showUserInfo', 'showArticle']);

// 点赞或者取消点赞
const likeClick = (item) => {
  const Message = JSON.stringify({id: item.id,userName:userStore.userName,action: 'likes',iLike:item.ilike});
  stompClient.send('/forum/update', {}, Message);
}

// 下载
const downloadClick = (item) => {
  const Message = JSON.stringify({id: item.id,action: 'downloads'});
  stompClient.send('/forum/update', {}, Message);
  fileDownload(item.image,item.model);
}

// 查看用户按钮的回调
const searchUser = (item) => {
  $emit('showUserInfo',item);
}

// 查看帖子内容
const showArticle = (item) => {
  $emit('showArticle',item);
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