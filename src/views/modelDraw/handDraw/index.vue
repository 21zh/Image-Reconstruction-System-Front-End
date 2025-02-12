<template>
  <el-card class="processBox">
    <el-steps style="width: 800px" :active="active" finish-status="success" :align-center="true">
      <el-step title="手绘图像" />
      <el-step title="确认图像" />
      <el-step title="构建模型" />
      <el-step title="导出模型" />
    </el-steps>
    <div class="btnContainer">
      <el-button type="danger" size="default" :icon="Back" @click="backStep" :disabled="active == 0">回退</el-button>
      <el-button type="primary" size="default" :icon="Right" @click="goStep" :disabled="active > 2">前进</el-button>
      <el-button type="success" size="default" :icon="Download" @click="downloads"
        :disabled="active != 3">下载</el-button>
    </div>

  </el-card>
  <div class="handBox">
    <el-card style="margin-right: 10px;">
      <el-card class="tools">
        <el-row :gutter="80">
          <el-col :span="5">
            <el-slider v-model="penWidth" :format-tooltip="penWidthWatch" :min="1" :max="20" />
          </el-col>
          <el-col :span="4">
            <el-popconfirm title="您确定要清除图像吗?" @confirm="clear" width="200">
              <template #reference>
                <el-button size="default" :icon="Delete" :disabled="active != 0">清除</el-button>
              </template>
            </el-popconfirm>
          </el-col>
          <el-col :span="4">
            <el-button size="default" :icon="Download" @click="exportImage">导出</el-button>
          </el-col>
          <el-col :span="4" style="margin-right: 30px;">
            <el-button size="default" :icon="textFlag ? EditPen : ToiletPaper" @click="penOrErase"
              :disabled="active != 0">{{
                textFlag ? '画笔' :
                  '橡皮擦' }}</el-button>
          </el-col>
          <el-col :span="5">
            <el-slider v-model="eraserWidth" :format-tooltip="eraserWidthWatch" :min="10" :max="100" />
          </el-col>
        </el-row>
      </el-card>
      <canvas class="handCanvas" :style="cursorStyle" id="myCanvas" ref="canvas">
      </canvas>
    </el-card>
    <el-card>
      <div class="modelCanvas">
        <div class="container" ref="container">
          <Models v-if="container" :container="container" :grid_size="grid_size" :cube_size="cube_size"
            :scene="scene" />
        </div>
      </div>
    </el-card>
  </div>

</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { init, modelObserve } from '@/utils/showModel';
import { Back, Right, Delete, Download, ToiletPaper, EditPen } from '@element-plus/icons-vue';
import { onMounted, ref, computed, nextTick, onBeforeUnmount } from 'vue';
import Models from '@/views/models/index.vue';
import { ElMessage } from 'element-plus';
import { reqHandDrawImageUpload } from '../../../api/file';
import { fileDownload } from '../../../utils/fileDownload';
import { ElLoading } from 'element-plus';

let reader = new FileReader();
const grid_size = 32;
const cube_size = 10;
let voxel = [];
// 视图
const scene = new THREE.Scene();
let camera, renderer; // 存储相机和渲染器

// 模型颜色
let color = ref('#409EFF');
// 存储模型的容器
let container = ref();
// 画板对象
let canvas = ref();

// 模型下载路径
let modelPath = ref();

// 控制步骤的索引
let active = ref(0);
// 显示画笔还是橡皮擦
let textFlag = ref(false);
// 动态更新鼠标样式
let cursorStyle = ref({
  cursor: `url(/src/assets/images/pen.ico), auto`,
});
// 控制是否进行绘图
let isDrawing = ref(false);

// 画笔的宽度
let penWidth = ref(1);
// 橡皮擦的大小
let eraserWidth = ref(10);

// 挂载成功
onMounted(() => {
  nextTick(() => {
    initHandCanvas();
  })
})

// 窗口变化函数调用
const resizeHandler = () => {
};

// 组件销毁前移除监听事件
onBeforeUnmount(() => {
})

// 上传手绘图片进行重构的方法
const handDrawReconstruct = async (data) => {
  let result = await reqHandDrawImageUpload(data);
  // 请求成功
  if (result.code == 200) {
    modelPath.value = result.data;
    // 解析模型
    // 清空模型数据
    voxel.length = 0;
    // 发送请求，解析模型数据
    let response = await fetch(result.data);
    // 解析并创建文件对象
    let blob = await response.blob();
    const file = new File([blob], result.data, {
      type: 'application/octet-stream',
    });
    modelObserve(file, voxel, scene, grid_size, cube_size, reader, '#26CB1D');
    ElMessage({
      type: 'success',
      message: '构建模型成功'
    })
  } else {
    ElMessage.error("手绘图片的模型重构失败");
  }
}

// 前进按钮的回调
const goStep = async () => {
  if (active.value === 0) {
    ElMessage({
      type: 'success',
      message: '手绘图像成功，进入下一步'
    })
  } else if (active.value === 1) {
    ElMessage({
      type: 'success',
      message: '成功确认图像，进入下一步'
    });
  } else {
    // 加载效果
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '模型构建中',
      background: 'rgba(0, 0, 0, 0.7)',
      target: document.getElementsByClassName('modelCanvas')[0],
      fullscreen: false,  // 防止默认全屏加载
    });
    // 上传手绘图像
    let handImage = canvas.value.toDataURL("image/png");
    await handDrawReconstruct(handImage);
    // 加载完成
    loadingInstance.close();
  }
  active.value++;
};
// 回退按钮的回调
const backStep = () => {
  active.value--;
};

// 画笔进度条显示
const penWidthWatch = () => {
  return `画笔宽度为${penWidth.value}`
}

// 橡皮擦大小显示
const eraserWidthWatch = () => {
  return `橡皮擦宽度为${eraserWidth.value}`
}

// 获取鼠标位置
const getMousePosition = (e) => {
  let hCanvas = document.getElementById('myCanvas');
  let rect = hCanvas.getBoundingClientRect();
  let scaleX = hCanvas.width / rect.width;
  let scaleY = hCanvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

// 绘制图像
const initHandCanvas = () => {
  let hCanvas = document.getElementById('myCanvas');
  hCanvas.width = hCanvas.offsetWidth;
  hCanvas.height = hCanvas.offsetHeight;
  let ctx = hCanvas.getContext('2d');
  ctx.strokeStyle = 'black';

  // 鼠标按下的响应
  hCanvas.addEventListener('mousedown', (e) => {
    ctx.lineWidth = penWidth.value;
    isDrawing.value = true;
    let pos = getMousePosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  })

  // 鼠标移动的响应
  hCanvas.addEventListener('mousemove', (e) => {
    if (isDrawing.value) {
      let pos = getMousePosition(e);
      console.log(textFlag.value);
      if (!textFlag.value) {
        // 绘图
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        // 橡皮擦擦除
        ctx.clearRect(pos.x - 10, pos.y - 10, eraserWidth.value, eraserWidth.value);
      }
    }
  })

  // 鼠标松开的响应
  hCanvas.addEventListener('mouseup', (e) => {
    isDrawing.value = false;
  })

  // 鼠标离开的响应
  hCanvas.addEventListener('mouseleave', (e) => {
    isDrawing.value = false;
  })
}

// 画笔或者橡皮
const penOrErase = () => {
  if (textFlag.value) {
    textFlag.value = !textFlag.value;
    cursorStyle.value = {
      cursor: 'url(/src/assets/images/pen.ico), auto'
    };
  } else {
    textFlag.value = !textFlag.value;
    cursorStyle.value = {
      cursor: 'url(/src/assets/images/eraser.ico), auto'
    };
  }
}

// 清除画板的内容
const clear = () => {
  let hCanvas = document.getElementById('myCanvas');
  hCanvas.width = hCanvas.offsetWidth;
  hCanvas.height = hCanvas.offsetHeight;
}

// 下载模型
const downloads = () => {
  fileDownload('', modelPath.value);
  active.value = 4;
}

// 导出图像
const exportImage = () => {
  // 获取画布元素
  let hCanvas = document.getElementById('myCanvas');
  let dataURL = hCanvas.toDataURL("image/png");
  let link = document.createElement('a');
  link.download = 'image.png';
  link.href = dataURL;
  link.click();
}

</script>

<style lang="scss" scoped>
.processBox {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: $base-progress-card-height;
  margin-bottom: 10px;

  .btnContainer {
    display: flex;
    justify-content: center;
  }
}

.handBox {
  display: flex;
  justify-content: space-between;

  .el-card {
    width: 50vw;
    height: calc(100vh - $base-progress-card-height - 100px);
    background: greenyellow;

    .tools {
      display: flex;
      width: 100%;
      height: 45px;
      margin-bottom: 10px;
      justify-content: center;
      align-items: center;
      background: skyblue;

      .penContainer {
        span {
          font-size: 14px;
        }

        justify-content: center;
        align-items: center;
      }
    }

    .handCanvas {
      width: 100%;
      height: calc(100vh - $base-progress-card-height - 195px);
      background: white;
    }

    .modelCanvas {
      width: 100%;
      height: calc(100vh - $base-progress-card-height - 140px);
      background: white;
    }

    .container {
      width: 100%;
      height: 60vh;
    }
  }

}
</style>
