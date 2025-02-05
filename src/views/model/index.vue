<template>
  <el-card style="position: sticky; top: 0; z-index: 1000; margin-bottom: 20px;">
    <el-segmented v-model="value" :options="options" block>
      <template #default="scope">
        <div class="segment-item">
          <el-icon size="24" :class="scope.isActive ? 'active-icon' : 'inactive-icon'">
            <component :is="scope.item.icon" />
          </el-icon>
          <div :class="scope.isActive ? 'active-label' : 'inactive-label'">
            {{ scope.item.label }}
          </div>
        </div>
      </template>
    </el-segmented>
  </el-card>
  <div class="card-container">
    <el-card class="modelContainer" @click="showModel" v-for="item in 10">
      <img src="@/assets/images/loginbg.gif" alt="">
      <el-button>下载</el-button>
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
import { onMounted, ref } from 'vue'
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

const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();
const value = ref('Apple');
// 模型容纳容器
let container = ref();
// 控制对话框是否显示
let modelView = ref(false);

const options = [
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
];

// 展示模型数据
const showModel = () => {
  modelView.value = true;
}
</script>

<style lang="scss" scoped>
.container{
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
