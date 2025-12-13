<template>
  <el-card class="cardBox">
    <el-tabs type="border-card" class="demo-tabs">
      <el-tab-pane>
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Picture />
            </el-icon>
            <span>图片上传</span>
          </span>
        </template>
        <el-upload class="upload-demo" action="/api/imageDraw/imageReconstruct" :headers="{ token: userStore.token }" drag multiple v-model="fileLists"
          :show-file-list="false" :before-upload="beforeUpload" :on-success="handleImageSuccess" :on-progress="loadModel">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件或者 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              文件类型必须为文件夹
            </div>
          </template>
        </el-upload>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Files />
            </el-icon>
            <span>文件夹上传</span>
          </span>
        </template>
        <div class="file-upload-container">
          <svg-icon name="fileUpload" width="100px" height="100px"></svg-icon>
          <label for="fileUpload" class="custom-file-upload">
            选择文件夹
          </label>
          <input type="file" id="fileUpload" class="file-input" webkitdirectory ref="fileUpload">
        </div>
      </el-tab-pane>
    </el-tabs>


  </el-card>
  <el-card class="modelTable">
    <el-table border :data="imageReconstruct" class="table">
      <el-table-column type="index" label="序号" fixed align="center" prop="id" width="80px"></el-table-column>
      <el-table-column label="图片名称" align="center" prop="imageName"></el-table-column>
      <!-- <el-table-column label="误差" align="center" prop="size" sortable>
        <template #="{ row, $index }">
          <el-tag>{{ row.size }}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column align="center" label="操作">
        <!-- <template #header>
          <el-input v-model="keyPicture" size="small" placeholder="请输入图片名称" />
        </template> -->
        <template #="{ row, $index }">
          <el-button type="primary" size="small" :icon="View" @click="showModel(row)">查看</el-button>
          <el-button type="success" size="small" :icon="Download" @click="downloadModel(row)">下载</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="" style="height: 50vh;" />
      </template>
    </el-table>
  </el-card>
  <el-dialog v-model="modelView" title="三维模型预览" width="1500" align-center>
    <div class="modelDialog">
      <el-card class="picture">
        <img :src=image style="width: 200px;height: 200px;" alt="">
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
import { Picture, View, Delete, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, ref, watch } from 'vue';
import { init, modelObserve } from '@/utils/showModel';
import Models from '@/views/models/index.vue';
import { reqFileUpload } from '../../../api/file';
import { fileDownload } from '../../../utils/fileDownload';
import { ElLoading } from 'element-plus';
import { useRoute } from 'vue-router';
import userStores from '../../../store/modules/user';

let reader = new FileReader();
const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();

// 控制对话框是否显示
let modelView = ref(false);
// 三维模型展示日期
let container = ref();

// 查询数据
let keyPicture = ref('');

// 上传的文件
let fileLists = ref([]);
let fileUpload = ref();

// 图像数据
let image = ref();

// 图像重构收集数据
let imageReconstruct = ref([]);

let route = useRoute();
let userStore = userStores();

onMounted(() => {
  if (fileUpload.value) {
    fileUpload.value.addEventListener("change", handleFileSelect);
  }
})

watch(() => route.query.updateReconstruct, (val) => {
  if (!val) { 
    return;
  }
  // 获取路由参数
  const updateReconstruct = JSON.parse(val);

  if (updateReconstruct) {
    imageReconstruct.value.push(...updateReconstruct);
  }
}, {immediate: true})

// 文件上传前
const beforeUpload = (file) => {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
    return false;
  } else if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
}

// 文件上传中
const loadModel = () =>{
  // 加载效果
  const loadingInstance = ElLoading.service({
      lock: true,
      text: '模型构建中,请耐心等待',
      background: 'rgba(0, 0, 0, 0.7)',
    });
}

// 上传文件夹
const handleFileSelect = async (event) => {
  // 加载效果
  const loadingInstance = ElLoading.service({
      lock: true,
      text: '模型构建中,请耐心等待',
      background: 'rgba(0, 0, 0, 0.7)',
    });
  // 获取文件列表
  const files = event.target.files;

  // 创建 FormData 对象，用于封装文件数据
  const formData = new FormData();

  // 将所有选中的文件添加到 FormData
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // 注意：文件会携带 webkitRelativePath 属性，用于保存文件的相对路径
    formData.append("files", file, file.webkitRelativePath || file.name);
  }
  // 发请求
  let result = await reqFileUpload(formData);
  if (result.code === 200) {
    imageReconstruct.value.push(...result.data);
    // 提示信息
    ElMessage.success("模型构建成功");
  } else {
    // 提示信息
    ElMessage.error("模型构建失败");
  }
  // 加载完成
  loadingInstance.close();
}

// 查看按钮的回调
const showModel = async (row) => {
  console.log(row.imagePath);
  console.log(row.modelPath);
  // 显示对话框
  modelView.value = true;
  image.value = row.imagePath;
  // 清空模型数据
  voxel.length = 0;
  // 显示对话框
  modelView.value = true;
  // 发送请求，解析模型数据
  let response = await fetch(row.modelPath);
  // 解析并创建文件对象
  let blob = await response.blob();
  const file = new File([blob], row.modelPath, {
    type: 'application/octet-stream',
  });
  modelObserve(file, voxel, scene, grid_size, cube_size, reader, '#26CB1D');
}

// 下载模型
const downloadModel = (row) => {
  fileDownload('',row.modelPath);
}

// 单张图片上传成功的回调
const handleImageSuccess = (response) => {
  // 加载效果
  const loadingInstance = ElLoading.service({
      lock: true,
      text: '模型构建中,请耐心等待',
      background: 'rgba(0, 0, 0, 0.7)',
    });
  // 上传单张图片重构成功
  if (response.code === 200) {
    // imageReconstruct.value.push(response.data);
    ElMessage.success("文件上传成功");
  } else {
    ElMessage.error("文件上传失败");
  }
  // 加载完成
  loadingInstance.close();
}
</script>
<style lang="scss" scoped>
.cardBox {
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
}

.modelTable {
  width: 100%;
  height: 610px;

  .table {
    width: 100%;
    height: 60vh;
  }
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

.file-input {
  display: none;
}

.custom-file-upload {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.custom-file-upload:hover {
  background-color: #45a049;
}

.file-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}
</style>
