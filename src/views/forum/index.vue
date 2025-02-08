<template>
  <el-card>
    <div class="search">
      <el-input placeholder="请输入关键词" style="width: 400px;margin-right: 10px;"></el-input>
      <el-button type="primary" size="default" :icon="Search">搜索</el-button>
      <el-button type="primary" size="default" :icon="Upload" @click="postArticle">上传</el-button>
    </div>
    <div class="scrollbarContainer">
      <el-scrollbar>
        <div class="scrollbar-flex-content">
          <div class="custom-style">
            <el-segmented v-model="value" :options="options" block>
              <template #default="scope">
                <div class="flex flex-col items-center gap-2 p-2">
                  <el-icon size="20">
                    <component :is="scope.item.icon" />
                  </el-icon>
                  <div>{{ scope.item.label }}</div>
                </div>
              </template>
            </el-segmented>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="forum">
      <imgContainer class="imgs" :imgList="leftImgList"></imgContainer>
      <forumContainer class="forums" @showUserInfo="showUserInfo" @showArticle="showArticle"></forumContainer>
      <imgContainer class="imgs" :imgList="rightImgList"></imgContainer>
    </div>
  </el-card>
  <el-drawer v-model="articlePost" title="上传帖子">
    <el-form>
      <el-form-item label="标题">
        <el-input placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-select></el-select>
      </el-form-item>
      <el-form-item label="图像">
        <el-upload v-model:file-list="fileList" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          list-type="picture-card" limit="1">
          <el-icon>
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="模型">
        <el-upload class="upload-demo" drag action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          limit="1" style="width: 400px;">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件或者 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              文件必须为binvox文件
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="articlePost = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </div>
    </template>
  </el-drawer>
  <el-dialog v-model="userInfo" width="900" align-center>
    <div class="topContainer">
      <div class="userContainer" @click="searchUser" style="cursor:pointer">
        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <span class="userName">用户</span>
      </div>
      <div class="likeAndDownload">
        <el-badge :value="allLike" :max="999" class="item">
          <svg-icon name="like" width="25px" height="25px" @click="likeClick"></svg-icon>
        </el-badge>
        <el-badge :value="allDownload" :max="999" class="item">
          <svg-icon name="download" width="25px" height="25px" @click="downloadClick"></svg-icon>
        </el-badge>
      </div>
    </div>
    <el-divider>
      <el-icon><star-filled /></el-icon>
    </el-divider>
    <forumContainer class="forums" @showUserInfo="showUserInfo" @showArticle="showArticle"></forumContainer>
  </el-dialog>
  <el-dialog v-model="articleContent" title="内容" width="1500" align-center>
    <div class="modelDialog">
      <el-card class="picture">
        <img src="@/assets/images/loginbg.gif" alt="">
      </el-card>
      <el-card class="model">
        <div class="container" ref="container">
          <Models v-if="container" :container="container" :grid_size="grid_size" :cube_size="cube_size"
            :scene="scene" />
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  Search, Upload, Apple,
  Cherry,
  Grape,
  Orange,
  Pear,
  Watermelon,
} from '@element-plus/icons-vue';
import { ref } from 'vue';
import imgContainer from './imgContainer/index.vue';
import forumContainer from './forumContainer/index.vue';
import Models from '@/views/models/index.vue';

const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();
// 存储模型的容器
let container = ref();

// 左边图片数组
let leftImgList = ref([
  '/public/limg0.png',
  '/public/limg1.png',
  '/public/limg2.png'
]);

// 右边图片数组
let rightImgList = ref([
  '/public/rimg0.png',
  '/public/rimg1.png',
  '/public/rimg2.png'
]);

let value = ref('Apple');

// 控制上传帖子的弹窗
let articlePost = ref(false);
// 控制用户消息对话框
let userInfo = ref(false);
// 帖子内容是否显示
let articleContent = ref(false);

let options = [
  {
    label: 'Apple',
    value: 'Apple',
    icon: Apple,
  },
  {
    label: 'Cherry',
    value: 'Cherry',
    icon: Cherry,
  },
  {
    label: 'Grape',
    value: 'Grape',
    icon: Grape,
  },
  {
    label: 'Orange',
    value: 'Orange',
    icon: Orange,
  },
  {
    label: 'Pear',
    value: 'Pear',
    icon: Pear,
  },
  {
    label: 'Watermelon',
    value: 'Watermelon',
    icon: Watermelon,
  },
  {
    label: 'a',
    value: 'Apple',
    icon: Apple,
  },
  {
    label: 'Cherry',
    value: 'Cherry',
    icon: Cherry,
  },
  {
    label: 'Grape',
    value: 'Grape',
    icon: Grape,
  },
  {
    label: 'Apple',
    value: 'Apple',
    icon: Apple,
  },
  {
    label: 'Cherry',
    value: 'Cherry',
    icon: Cherry,
  },
  {
    label: 'Grape',
    value: 'Grape',
    icon: Grape,
  },
  {
    label: 'Orange',
    value: 'Orange',
    icon: Orange,
  },
  {
    label: 'Pear',
    value: 'Pear',
    icon: Pear,
  },
  {
    label: 'Watermelon',
    value: 'Watermelon',
    icon: Watermelon,
  },
  {
    label: 'a',
    value: 'Apple',
    icon: Apple,
  },
  {
    label: 'Cherry',
    value: 'Cherry',
    icon: Cherry,
  },
  {
    label: 'Grape',
    value: 'Grape',
    icon: Grape,
  },
];

// 总点赞量
let allLike = ref(999);
// 总下载量
let allDownload = ref(999);

// 上传帖子
const postArticle = () => {
  // 显示弹窗
  articlePost.value = true;
}

// 显示用户信息
const showUserInfo = () => {
  // 显示用户信息
  userInfo.value = true;
}

// 显示帖子内容
const showArticle = () => {
  // 显示帖子内容
  articleContent.value = true;
}
</script>

<style lang="scss" scoped>
.topContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scrollbarContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 10px;
}

.scrollbar-flex-content {
  display: flex;
  justify-content: flex-start;
  white-space: nowrap;
  /* 不换行 */
  margin: 10px 10px;
}



.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #ffd100;
  --el-border-radius-base: 16px;
}

.search {
  display: flex;
  justify-content: center;
  align-items: center;
}

.forum {
  display: flex;
  justify-content: center;
  align-items: center;

  .imgs {
    flex: 1;
  }

  .forums {
    flex: 5;
    margin-right: 10px;
  }
}

.userContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item {
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-right: 30px;
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

.modelDialog {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .picture {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 300px;
    margin-right: 20px;
  }

  img {
    width: 100%;
    height: 100%;
  }

  .model {
    position: relative;
    /* 父元素设置为相对定位 */
    height: 800px;
    flex: 3;
  }

  .container {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }
}
</style>
