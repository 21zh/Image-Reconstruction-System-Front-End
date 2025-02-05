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
        </div>
      </template>
    </el-upload>
  </el-card>
  <el-card class="modelTable">
    <el-table border :data="data" class="table">
      <el-table-column type="selection"></el-table-column>
      <el-table-column type="index" label="序号" fixed align="center" prop="id" width="80px"></el-table-column>
      <el-table-column label="图片名称" align="center" prop="name"></el-table-column>
      <el-table-column label="误差" align="center" prop="size" sortable>
        <template #="{ row, $index }">
          <el-tag>{{ row.size }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center">
        <template #header>
          <el-input v-model="keyPicture" size="small" placeholder="请输入图片名称" />
        </template>
        <template #="{ row, $index }">
          <el-button type="primary" size="small" :icon="View" @click="showModel(row)">查看</el-button>
          <el-button type="success" size="small" :icon="Download">下载</el-button>
          <el-button type="danger" size="small" :icon="Delete">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
          <el-empty description="" style="height: 50vh;"/>
      </template>
    </el-table>
  </el-card>
  <el-dialog v-model="modelView" title="三维模型预览" width="1500" align-center>
    <div class="modelDialog">
      <el-card class="picture">
        <img src="@/assets/images/loginbg.gif" alt="">
      </el-card>
      <el-card class="model">
        <div class="container" ref="container">
          <Models v-if="container" :container="container" :grid_size="grid_size" :cube_size="cube_size" :scene="scene" />
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

// 虚拟数据
let data = ref([
  {
    id: 1,
    name: '3D模型',
    img: 'https://img.alicdn.com/imgextra/i4/O1CN01KX2jqB1K5YJ8YJ1YH_!!6000000000080-2-tps-800-800.png',
    time: '2023-06-01',
  },
]);

onMounted(() => {
})

// watch(container, (newValue) => {
//   if (newValue) {
//     init(container.value, grid_size, cube_size, scene, '#409EFF');
//   }
// });

// 查看按钮的回调
const showModel = (row) => {
  modelView.value = true;
}

onMounted(() => {
  // init();
});
</script>
<style lang="scss" scoped>
.cardBox {
  width: 100%;
  height: 242px;
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
</style>
