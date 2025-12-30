<template>
  <el-card>
    <div class="search">
      <el-input placeholder="请输入关键词" style="width: 400px;margin-right: 10px;" v-model="keyWord"
        @blur="getTypeForum(typeId)"></el-input>
      <el-button type="primary" size="default" :icon="Upload" @click="postArticle">上传</el-button>
    </div>
    <div class="scrollbarContainer">
      <el-scrollbar>
        <div class="scrollbar-flex-content">
          <div class="custom-style">
            <el-segmented v-model="typeId" :options="formattedOptions" block @change="getTypeForum">
              <template #default="scope">
                <div class="flex flex-col items-center gap-2 p-2">
                  <el-icon size="24">
                    <img :src=scope.item.iconUrl alt="">
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
      <forumContainer class="forums" @showUserInfo="showUserInfo" @showArticle="showArticle" :forumList="forumList">
      </forumContainer>
      <imgContainer class="imgs" :imgList="rightImgList"></imgContainer>
    </div>
  </el-card>
  <el-drawer v-model="articlePost" title="上传帖子" @close="resetForm">
    <el-form :model="forumForm" ref="forumForms" :rules="rules">
      <el-form-item label="标题" prop="title">
        <el-input placeholder="请输入标题" v-model="forumForm.title"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="typeId">
        <el-select v-model="forumForm.typeId" value-key="id" placeholder="请选择类型">
          <el-option v-for="item in options" :key="item.id" :label="item.typeName" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="图像" prop="image">
        <el-upload action="api/forum/imageUpload" list-type="picture-card" :headers="{ token: userStore.token }" :limit="1" :before-upload="beforeImageUpload"
          :on-success="handleImageSuccess">
          <el-icon>
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="模型" prop="model">
        <el-upload class="upload-demo" :headers="{ token: userStore.token }" drag action="api/forum/modelUpload" :limit="1" style="width: 400px;"
          :before-upload="beforeModelUpload" :on-success="handleModelSuccess">
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
        <el-button type="primary" @click="uploadForum">确定</el-button>
      </div>
    </template>
  </el-drawer>
  <el-dialog v-model="userInfo" width="900" align-center>
    <div class="topContainer">
      <div class="userContainer" @click="searchUser" style="cursor:pointer">
        <el-avatar :src=avatar />
        <span class="userName" style="font-weight: 1000;">{{ userName }}</span>
        <span style="margin-left: 30px;font-weight: 1000;">个性签名：</span>
        <h1 style="font-weight: 3000; color: red;">{{ motto }}</h1>
      </div>
      <div class="likeAndDownload">
        <el-badge :value="userForum.allLikes" :max="999" class="item">
          <svg-icon name="like" width="25px" height="25px"></svg-icon>
        </el-badge>
        <el-badge :value="userForum.allDownloads" :max="999" class="item">
          <svg-icon name="download" width="25px" height="25px"></svg-icon>
        </el-badge>
      </div>
    </div>
    <el-divider>
      <el-icon><star-filled /></el-icon>
    </el-divider>
    <forumContainer class="forums" @showArticle="showArticle" :forumList="userForum.forumList">
    </forumContainer>
  </el-dialog>
  <el-dialog v-model="articleContent" :title=title width="1300" align-center>
    <div class="modelDialog">
      <el-card class="picture">
        <img :src=image alt="" style="width: 200px;height: 200px;" />
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
import { ref, computed, onMounted, reactive } from 'vue';
import imgContainer from './imgContainer/index.vue';
import forumContainer from './forumContainer/index.vue';
import Models from '@/views/models/index.vue';
import { reqGetAllType } from '../../api/type';
import { reqGetTypeForum, reqGetUserForum, reqUploadForum } from '../../api/forum';
import { ElMessage } from 'element-plus';
import userStores from '../../store/modules/user';
import { modelObserve } from '../../utils/showModel';

let userStore = userStores();
let reader = new FileReader();
const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();
// 存储模型的容器
let container = ref();

// 标题
let title = ref('');
// 图片和模型
let image = ref('');
let model = ref('');

// 用户名和头像和个性签名
let userName = ref('');
let avatar = ref('');
let motto = ref('');

// 帖子表单对象
let forumForm = reactive({
  typeId: '',
  title: '',
  image: '',
  model: '',
});
let forumForms = ref();

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

// 搜索关键词
let keyWord = ref('');

// 帖子数据数组
let forumList = ref([]);
// 用户帖子数组
let userForumList = ref([]);

// 控制上传帖子的弹窗
let articlePost = ref(false);
// 控制用户消息对话框
let userInfo = ref(false);
// 帖子内容是否显示
let articleContent = ref(false);
// 所选的帖子类型
let typeValue = ref();

// 类型id
let typeId = ref(0);

// 所有的类型数据
let options = ref([]);

// 总点赞量
let allLike = ref(0);
// 总下载量
let allDownload = ref(0);

// 存储用户帖子的数据
let userForum = ref(
  {
    forumList: [],
    allLikes: 0,
    allDownloads: 0,
  }
);

// 定义表单校验规则
const rules = {
  title: [{ required: true, trigger: 'blur', min: 2, max: 10, message: '请输入2-10字数的标题' }],
  typeId: [{ required: true, trigger: 'blur', message: '请选择分类' }],
  image: [{ required: true, trigger: 'blur', message: '请上传图片' }],
  model: [{ required: true, trigger: 'blur', message: '请上传模型' }]
}

// 组件挂载成功发请求
onMounted(() => {
  getAllType();
  getTypeForum(typeId.value);
});

// 重置表单
const resetForm = () => {
  forumForms.value?.resetFields();
}

// 数据映射
const formattedOptions = computed(() => {
  return options.value.map((item) => {
    return {
      label: item.typeName,
      value: item.id,
      iconUrl: item.iconUrl
    };
  });
});

// 获取所有的类型数据
const getAllType = async () => {
  // 发请求
  let result = await reqGetAllType();
  // 请求成功
  if (result.code == 200) {
    // 将类型数据进行存储
    options.value = result.data;
  }
}

// 获取类型下的帖子数据
const getTypeForum = async (id) => {
  // 发起请求
  let result = await reqGetTypeForum(id, keyWord.value, userStore.userName);
  // 成功
  if (result.code == 200) {
    forumList.value = result.data;
  }
}

// 图片上传前的检查
const beforeImageUpload = (file) => {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!');
    return false;
  } else if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('上传图片大小不能超过 2MB!');
    return false;
  }
  return true;
}

// 上传后的回调
const handleImageSuccess = (response) => {
  if (response.code === 200) {
    forumForm.image = response.data;
    ElMessage.success('上传图片成功!');
  } else {
    ElMessage.error('上传图片失败!');
  }
}

// 模型上传前的检查
const beforeModelUpload = (file) => {
  if (!file.name.endsWith('.binvox')) {
    ElMessage.error('上传模型只能是 BINVOX 格式!');
    return false;
  } else if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('上传模型大小不能超过 2MB!');
    return false;
  }
  return true;
}

// 上传后的回调
const handleModelSuccess = (response) => {
  if (response.code === 200) {
    forumForm.model = response.data;
    ElMessage.success('上传模型成功!');
  } else {
    ElMessage.error('上传模型失败!');
  }
}

// 上传帖子
const postArticle = () => {
  // 显示弹窗
  articlePost.value = true;
}

// 显示用户信息
const showUserInfo = async (item) => {
  // 显示用户信息
  userInfo.value = true;
  // 发起请求查询
  let result = await reqGetUserForum(item.userId, userStore.userName);
  if (result.code == 200) {
    userForum.value = result.data;
    userForumList.value = result.data.forumList;
    userName.value = item.userName;
    avatar.value = item.avatar;
    motto.value = item.motto;
  }
}

// 显示帖子内容
const showArticle = async (item) => {
  // 清空模型数据
  voxel.length = 0;
  // 赋值
  title.value = item.title;
  image.value = item.image;
  model.value = item.model;
  // 显示帖子内容
  articleContent.value = true;
  console.log(model.value);
  // 发送请求，解析模型数据
  let response = await fetch(model.value);
  // 解析并创建文件对象
  let blob = await response.blob();
  const file = new File([blob], item.model, {
    type: 'application/octet-stream',
  });
  modelObserve(file, voxel, scene, grid_size, cube_size, reader, '#26CB1D');
}

// 上传帖子
const uploadForum = () => {
  // 表单校验
  forumForms.value.validate(async (valid) => {
    if (valid) {
      // 发请求
      let result = await reqUploadForum(forumForm, userStore.userName);
      // 判断是否成功
      if (result.code == 200) {
        ElMessage.success("上传成功");
        articlePost.value = false;
        // 刷新帖子列表
        getTypeForum(0);
      } else {
        ElMessage.error("上传失败");
      }
    }
  })

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
    flex: 4.5;
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
