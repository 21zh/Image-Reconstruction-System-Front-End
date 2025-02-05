<template>
  <el-card class="cardBox">
    <el-upload class="upload-demo" drag multiple v-model="fileLists" :auto-upload="false" :on-change="handleModel"
      :show-file-list="false">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽文件或者 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          文件类型必须为.binvox
          <div>
            <span style="margin-left: 10px;">模型颜色选择器</span>
            <el-color-picker v-model="color" style="margin-left: 10px;" @change="changeModelColor" />
          </div>
        </div>
      </template>
    </el-upload>

  </el-card>
  <el-card class="modelCanvas">
    <div class="container" ref="container">
      <Models v-if="container" :container="container" :grid_size="grid_size" :cube_size="cube_size" :scene="scene" />
    </div>
  </el-card>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { init, modelObserve } from '@/utils/showModel';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Models from '@/views/models/index.vue';

let reader = new FileReader();
const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();
// 模型颜色
let color = ref('#409EFF');
// 存储模型的容器
let container = ref();
// 上传的binvox文件列表
let fileLists = ref([]);

// onMounted(() => {
//   if (container.value) {
//     init(container.value, grid_size, cube_size, scene);
//   }
// })

// 上传文件前的类型检查
const checkFile = (file) => {
  console.log(111);
  if (file.type !== 'application/octet-stream') {
    return false;
  }
}

// 上传文件处理
const handleModel = (file, fileList) => {
  if (!file.name.endsWith(".binvox")) {
    return ElMessage({ type: 'error', message: '文件类型必须为.binvox' });
  }
  fileLists.value = fileList;
  voxel.length = 0;
  try {
    modelObserve(file, voxel, scene, grid_size, cube_size, reader, color.value);
    ElMessage({ type: 'success', message: '模型文件解析成功' });
  } catch (e) {
    ElMessage({ type: 'error', message: '模型文件格式错误' });
  }
}

// 颜色选择器发送改变，调整模型颜色
const changeModelColor = () => {
  voxel.length = 0;
  if (fileLists.value.length > 0) {
    try {
      modelObserve(fileLists.value[fileLists.value.length - 1], voxel, scene, grid_size, cube_size, reader, color.value);
      ElMessage({ type: 'success', message: '模型颜色已改变' });
    } catch (e) {
      ElMessage({ type: 'error', message: '模型颜色改变错误' });
    }
  }
}
</script>

<style lang="scss" scoped>
.cardBox {
  width: 100%;
  height: 242px;
  margin-bottom: 10px;
}

.el-upload__tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modelCanvas {
  width: 100%;
  height: 600px;

  /* 设置一个固定高度 */
  .container {
    width: 100%;
    height: 600px;
  }
}
</style>