<template>
  <el-card style="position: sticky; top: 0; z-index: 1000; margin-bottom: 20px;">
    <el-segmented v-model="typeId" :options="formattedOptions" block @change="getTypeModel">
      <template #default="scope">
        <div class="segment-item">
          <el-icon size="24" :class="scope.isActive ? 'active-icon' : 'inactive-icon'">
            <img :src=scope.item.iconUrl alt="">
          </el-icon>
          <div :class="scope.isActive ? 'active-label' : 'inactive-label'">
            {{ scope.item.label }}
          </div>
        </div>
      </template>
    </el-segmented>
  </el-card>
  <div class="card-container">
    <el-card class="modelContainer" @click="showModel(row)" v-for="(row, $index) in modelData" :key="index">
      <img :src=row.image alt="">
      <el-button @click.stop="downloadModel(row)">下载</el-button>
    </el-card>
  </div>
  <el-dialog v-model="modelView" title="三维模型预览" width="1000" align-center>
    <div class="container" ref="container">
      <Models v-if="container" :container="container" :grid_size="grid_size" :cube_size="cube_size" :scene="scene" />
    </div>
  </el-dialog>

</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { computed, onMounted, ref } from 'vue'
import Models from '@/views/models/index.vue';
import { init, modelObserve } from '@/utils/showModel';
import {
  Apple,
  Cherry,
  Grape,
  Orange,
  Pear,
  Watermelon,
} from '@element-plus/icons-vue'
import { reqGetAllType } from '../../api/type';
import { ElMessage } from 'element-plus';
import { reqGetTypeModel } from '../../api/model';

let reader = new FileReader();
const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();
let typeId = ref(0);
// 模型容纳容器
let container = ref();
// 控制对话框是否显示
let modelView = ref(false);

// 所有的类型数据
let options = ref([]);

// 模型数据
let modelData = ref([]);

let imageValue = ref('');

// 组件挂载成功，获取所有的类型
onMounted(() => {
  // 获取所有的类型
  getAllType();
  // 获取类型下的模型数据
  getTypeModel(typeId.value);
})

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

// 展示模型数据
const showModel = async (row) => {
  // 清空模型数据
  voxel.length = 0;
  // 显示对话框
  modelView.value = true;
  // 发送请求，解析模型数据
  let response = await fetch(row.model);
  // 解析并创建文件对象
  let blob = await response.blob();
  const file = new File([blob], row.model, {
    type: 'application/octet-stream',
  });
  modelObserve(file, voxel, scene, grid_size, cube_size, reader, '#26CB1D');
}

// 获取类型下的模型数据
const getTypeModel = async (id) => {
  // 发起请求
  let result = await reqGetTypeModel(id);
  // 成功
  if (result.code == 200) {
    modelData.value = result.data;
  }
}

// 下载模型和图像数据
const downloadModel = async(row) => {
  let imageUrl = row.image;
  let modelUrl = row.model;

  // 发请求下载图像和模型
  try{
    const imageResponse = await fetch(imageUrl);
    const modelResponse = await fetch(modelUrl);

    if (!imageResponse.ok || !modelResponse.ok){
      ElMessage.error("下载失败");
    }

    // 获取文件的blob数据
    const imageBlob = await imageResponse.blob();
    const modelBlob = await modelResponse.blob();

    // 创建url分别指向文件
    const imageLink = document.createElement('a');
    const modelLink = document.createElement('a');

    imageLink.href = URL.createObjectURL(imageBlob);
    modelLink.href = URL.createObjectURL(modelBlob);
    imageLink.download = 'image.png';
    modelLink.download = 'model.binvox';

    // 触发点击事件
    imageLink.click();
    modelLink.click();

    // 释放blob的url
    URL.revokeObjectURL(imageLink.href);
    URL.revokeObjectURL(modelLink.href);
  }catch(error){
    ElMessage.error("下载失败");
  }
}

</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 700px;
}

.segment-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.segment-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
}

.active-icon {
  color: #409EFF;
}

.inactive-icon {
  color: #606266;
}

.active-label {
  color: #409EFF;
  font-weight: 500;
}

.inactive-label {
  color: #606266;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  justify-content: center;
}

.modelContainer {
  width: 280px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.modelContainer:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.modelContainer img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin: 15px 0;
}

.modelContainer h1 {
  text-align: center;
  font-size: 1.5em;
  margin: 15px 0;
}

.modelContainer .el-button {
  display: block;
  width: 80%;
  margin: 0 auto 15px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modelContainer .el-button:hover {
  background-color: #66b1ff;
}
</style>
