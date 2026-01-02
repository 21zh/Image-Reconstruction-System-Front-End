<template>
  <el-card class="processBox">
    <el-steps style="width: 800px" :active="active" finish-status="success" :align-center="true">
      <el-step title="手绘图像" />
      <el-step title="确认图像" />
      <el-step title="构建模型" />
      <el-step title="导出模型" />
    </el-steps>
    <div class="btnContainer">
      <el-button type="warning" size="default" :icon="Cpu" :disabled="active != 0 || !currentRoom.isOwner"
        @click="aiOpearte">AI协作</el-button>
      <el-button type="danger" size="default" :icon="Back" @click="backStep"
        :disabled="active == 0 || (currentRoom.id != '' && !currentRoom.isOwner)">回退</el-button>
      <el-button type="primary" size="default" :icon="Right" @click="goStep"
        :disabled="active > 2 || (currentRoom.id != '' && !currentRoom.isOwner)">前进</el-button>
      <el-button type="success" size="default" :icon="Download" @click="downloads"
        :disabled="active != 3">下载</el-button>
      <el-button type="danger" size="default" :disabled="currentRoom.name != ''" :icon="HomeFilled"
        @click="createRooms">创建房间</el-button>
      <el-button type="info" size="default" :icon="View" @click="searchRoom">查看房间</el-button>
    </div>
    <div class="roomBox" v-if="currentRoom.name != ''">
      <el-alert type="success" show-icon :closable="false" class="roomAlert">
        <div class="roomLine">
          <span class="roomName">
            当前房间：{{ currentRoom.name }}
          </span>
          <span>{{ currentRoom.isOwner ? '房主' : '成员' }}</span>
          <span>｜在线 {{ currentRoom.users.length }} / {{ currentRoom.maxUser }}</span>
          <el-button size="small" type="warning" @click="leaveRoom">
            退出房间
          </el-button>
        </div>
      </el-alert>
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
                <el-button size="default" :icon="Delete"
                  :disabled="active != 0 || (currentRoom.id != '' && !currentRoom.isOwner)">清除</el-button>
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
  <el-dialog v-model="dialogVisible" title="创建手绘房间" width="600px" align-center>
    <el-form :model="roomForm" label-width="auto">

      <el-form-item label="手绘房间名称">
        <el-input v-model="roomForm.roomName" />
      </el-form-item>

      <el-form-item v-if="!roomForm.isPublic" label="手绘房间密码">
        <el-input v-model="roomForm.roomPassword" />
      </el-form-item>

      <el-form-item label="是否公开">
        <el-switch v-model="roomForm.isPublic" />
      </el-form-item>

      <el-form-item label="协作人数">
        <el-radio-group v-model="roomForm.maxUser">
          <el-radio :value="1">1</el-radio>
          <el-radio :value="2">2</el-radio>
          <el-radio :value="3">3</el-radio>
          <el-radio :value="4">4</el-radio>
          <el-radio :value="5">5</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary"
          :disabled="roomForm.roomName == '' || (!roomForm.isPublic && roomForm.roomPassword == '') || roomForm.maxUser == ''"
          @click="onSubmit(roomForm)">创建</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>

    </el-form>
  </el-dialog>

  <el-dialog v-model="roomRz" title="身份验证" width="600px" align-center>
    <el-form :model="roomForm" label-width="auto">

      <el-form-item label="请输入手绘房间密码">
        <el-input v-model="roomInfo.roomPassword" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :disabled="roomInfo.roomPassword == ''" @click="enterRooms(roomInfo)">确认</el-button>
        <el-button @click="roomRz = false">取消</el-button>
      </el-form-item>

    </el-form>
  </el-dialog>

  <el-dialog v-model="isAI" title="AI协作" width="600px" align-center>
    <el-form :model="aiForm" label-width="auto">

      <el-form-item label="请输入所需的图像信息">
        <el-input v-model="aiForm.prompt" />
      </el-form-item>

      <el-form-item label="请输入禁止的图像信息">
        <el-input v-model="aiForm.negativePrompt" />
      </el-form-item>

      <el-form-item label="是否基于图像生成">
        <el-switch v-model="aiForm.isImage" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :disabled="aiForm.prompt == ''" @click="aiHelp(aiInfo)">确认</el-button>
        <el-button @click="isAI = false">取消</el-button>
      </el-form-item>

    </el-form>
  </el-dialog>

  <el-drawer v-model="drawer" size="400px" :with-header="false">
    <!-- 标题 -->
    <div class="drawer-title">手绘房间列表</div>

    <!-- 搜索框 -->
    <el-input v-model="keyword" placeholder="搜索房间名称" @blur="searchRoom" clearable style="margin: 12px 0">
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>

    <!-- 房间列表 -->
    <div class="room-list">
      <div class="room-card" v-for="room in rooms" @click="enterRoom(room)">
        <!-- 房间信息 -->
        <div class="room-info">
          <div class="room-name">{{ room.roomName }}</div>
          <div class="room-desc">
            {{ room.isPublic ? '公开房间' : '私密房间' }}
          </div>
        </div>

        <!-- 协作人数 -->
        <div class="room-users">
          <div v-for="i in room.maxUser" :key="i" class="user-circle">
            <template v-if="room.users[i - 1]">
              <el-avatar :size="32" :src="room.users[i - 1]" />
            </template>
            <template v-else>
              <el-icon>
                <Plus />
              </el-icon>
            </template>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>

</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { init, modelObserve } from '@/utils/showModel';
import { Back, Right, Delete, Download, ToiletPaper, EditPen, HomeFilled, View, Cpu } from '@element-plus/icons-vue';
import { onMounted, ref, computed, nextTick, onBeforeUnmount, watch, reactive } from 'vue';
import Models from '@/views/models/index.vue';
import { ElMessage } from 'element-plus';
import {
  reqCreateRoom, reqHandDrawImageUpload, reqLeaveRoom, reqGetRoom, reqEnterRoom, reqGetRoomInfo,
  reqUploadOperation, reqGetOperation, reqAICooperation
} from '../../../api/file';
import { fileDownload } from '../../../utils/fileDownload';
import { ElLoading } from 'element-plus';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import userStores from '../../../store/modules/user';
import { userRoute } from '../../../router/routers';
import { useRoute } from 'vue-router';
import { id } from 'element-plus/es/locales.mjs';

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
// 创建房间表单
let dialogVisible = ref(false);
// 房间列表
let drawer = ref(false);
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

let userStore = userStores();

let route = useRoute();

let ws = null;
const connectDrawWs = () => {
  ws = new WebSocket(`ws://localhost:1800/draw/ws?roomId=${currentRoom.value.id}&userId=${userStore.userId}`);

  ws.onopen = () => {
    console.log('绘图 WebSocket 已连接');
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'drawImage':
        drawRemote(data.stroke);
        break;
      case 'leaveRoom':
        await getRoomInfo();
        break;
      case 'enterRoom':
        await getRoomInfo();
        break;
      case 'reconstruct':
        loadImageToCanvas(data.imagePath);
        handDrawModel(data.modelPath);
        break;
      case 'clearImage':
        clearCanvas();
        break;
      case 'aiHelp':
        loadImageToCanvas(data.imagePath);
        ElMessage.success('AI协作图像成功');
        break;
      default:
        console.error('未知的绘图类型');
    }

  };

  ws.onerror = (err) => {
    console.error('绘图 WebSocket 出错', err);
  };

  ws.onclose = () => {
    console.log('房间连接已关闭');
  };
}
const clearCanvas = () => {
  let hCanvas = document.getElementById('myCanvas');
  hCanvas.width = hCanvas.offsetWidth;
  hCanvas.height = hCanvas.offsetHeight;
}

let roomRz = ref(false);
let roomInfo = ref({
  id: '',
  isPublic: false,
  roomPassword: '',
  maxUser: 1,
});

let isAI = ref(false);
let aiForm = reactive({
  prompt: '',
  negativePrompt: '',
  isImage: false,
})
let aiInfo = ref({
  userId: userStore.userId,
  prompt: '',
  negativePrompt: '',
  isImage: false,
  imagePath: ''
});


let currentRoom = ref({
  id: '',
  name: '',
  isOwner: true,
  users: [],
  maxUser: 1
});

// const currentRoom = ref(null);

const roomForm = reactive({
  roomName: '',
  roomPassword: '',
  maxUser: 1,
  isPublic: false,
})

const aiOpearte = () => {
  aiForm = reactive({
    prompt: '',
    negativePrompt: '',
    isImage: false,
  });
  aiInfo = {
    userId: userStore.userId,
    prompt: '',
    negativePrompt: '',
    isImage: false,
    imagePath: ''
  };
  isAI.value = true;
}

// 发起ai协作请求
const aiHelp = async (aiInfo) => {
  aiInfo.prompt = aiForm.prompt;
  aiInfo.negativePrompt = aiForm.negativePrompt;
  aiInfo.isImage = aiForm.isImage;

  if (aiInfo.isImage) {
    let hCanvas = document.getElementById('myCanvas');
    let dataURL = hCanvas.toDataURL("image/png");
    aiInfo.imagePath = dataURL;
  }
  let result = await reqAICooperation(aiInfo);

  if (result.code == 200) {
    ElMessage.success('AI协作任务上传成功');
    isAI.value = false;
  } else {
    ElMessage.error('AI协作任务上传失败');
  }
}

// 创建房间
const onSubmit = async (data) => {
  let result = await reqCreateRoom(data);
  if (result.code == 200) {
    currentRoom.value.name = data.roomName;
    currentRoom.value.isOwner = true;
    currentRoom.value.users = [
      { avatar: userStore.avatar }
    ];
    currentRoom.value.maxUser = data.maxUser;
    currentRoom.value.id = result.data;
    connectDrawWs();
    ElMessage.success('房间创建成功');
  } else {
    ElMessage.error('房间创建失败');
  }
  dialogVisible.value = false;
}

// 离开房间
const leaveRoom = async () => {
  console.log(currentRoom.value)
  let data = {
    roomId: currentRoom.value.id,
    userId: userStore.userId
  };
  let result = await reqLeaveRoom(data);
  if (result.code == 200) {
    sendWhenReady(JSON.stringify({
      type: 'leaveRoom'
    }));
    ElMessage.success('已离开房间');
    currentRoom.value = {
      id: '',
      name: '',
      isOwner: false,
      users: [],
      maxUser: 0
    }
    clear();
  } else {
    ElMessage.error('离开房间失败');
  }
}

// 获取房间信息
const getRoomInfo = async () => {
  let result = await reqGetRoomInfo(userStore.userId);
  if (result.code == 200) {
    if (result.data != null) {
      currentRoom.value.name = result.data.roomName;
      currentRoom.value.isOwner = result.data.isOwner;
      currentRoom.value.users = result.data.users;
      currentRoom.value.maxUser = result.data.maxUser;
      currentRoom.value.id = result.data.roomId;
    }
  }
}

const keyword = ref('')

const rooms = ref([]);

let currentStroke = null;

// 获取房间历史
const getRoomHistory = async () => {
  let result = await reqGetOperation(userStore.userId, currentRoom.value.id);
  if (result.code == 200) {
    currentStroke = result.data;
    for (let i = 0; i < currentStroke.length; i++) {
      if (currentStroke[i].type != 'clear') {
        currentStroke[i].points = JSON.parse(currentStroke[i].points);
      }
      drawRemote(currentStroke[i]);
    }
  } else {
    ElMessage.error('获取房间历史操作失败');
  }
}

// 查看房间
const searchRoom = async () => {
  let result = await reqGetRoom(keyword.value);
  if (result.code == 200) {
    rooms.value = result.data;
  } else {
    ElMessage.error('获取房间列表失败');
  }
  drawer.value = true;
}

/* const filteredRooms = computed(() => {
  if (!keyword.value) return rooms.value
  return rooms.value.filter(room =>
    room.name.includes(keyword.value)
  )
}) */

const createRooms = () => {
  roomForm.roomName = '';
  roomForm.roomPassword = '';
  roomForm.isPublic = false;
  roomForm.maxUser = 1;
  dialogVisible.value = true;
}

const enterRoom = (room) => {
  roomInfo.value.isPublic = room.isPublic;
  roomInfo.value.roomName = room.roomName;
  roomInfo.value.maxUser = room.maxUser;
  roomInfo.value.id = room.roomId;
  if (roomInfo.value.id == currentRoom.value.id) {
    ElMessage.error('请勿重复加入房间');
    return;
  }
  if (currentRoom.value.id != '') {
    ElMessage.error('请先离开当前房间');
    return;
  }
  if (room.isPublic) {
    enterRooms(roomInfo.value);
  } else {
    roomInfo.value.roomPassword = '';
    roomRz.value = true;
  }
}

// 加入房间
const enterRooms = async (data) => {
  let result = await reqEnterRoom(data);
  if (result.code == 200) {
    await getRoomInfo();
    connectDrawWs();
    sendWhenReady(JSON.stringify({
      type: 'enterRoom'
    }));
    await getRoomHistory();
    ElMessage.success(result.message);
  } else {
    ElMessage.error(result.data);
  }
  roomRz.value = false;
}


// 挂载成功
onMounted(async () => {
  await nextTick();
  initHandCanvas();
  await getRoomInfo();
  if (currentRoom.value.id != '') {
    await getRoomHistory();
    connectDrawWs();
  }
})

watch(() => route.query, async (newVal) => {
  await nextTick();
  // 获取路由参数
  const { imagePaths, modelPaths } = newVal;

  if (imagePaths && modelPaths) {
    loadImageToCanvas(imagePaths);
    handDrawModel(modelPaths);
    active.value = 3;
    if (currentRoom.value.id != '') {
      sendWhenReady(JSON.stringify({
        type: 'reconstruct',
        imagePath: imagePaths,
        modelPath: modelPaths
      }));
    }
  } else if (imagePaths) {
    clearCanvas();
    loadImageToCanvas(imagePaths);
    if (currentRoom.value.id != '') {
      sendWhenReady(JSON.stringify({
        type: 'aiHelp',
        imagePath: imagePaths,
      }));
    }
  }
}, { immediate: true })

// 加载图像
function loadImageToCanvas(imagePath) {
  const canvasContainer = canvas.value;
  if (!canvasContainer) {
    return;
  }

  const ctx = canvasContainer.getContext('2d');

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imagePath;

  image.onload = () => {
    canvasContainer.width = image.width;
    canvasContainer.height = image.height;
    ctx.drawImage(image, 0, 0);
  };

  image.onerror = () => {
    console.error('图片加载失败');
  };
};

// 加载模型
async function handDrawModel(modelPaths) {
  modelPath.value = modelPaths;
  // 解析模型
  // 清空模型数据
  voxel.length = 0;
  // 发送请求，解析模型数据
  let response = await fetch(modelPaths);
  // 解析并创建文件对象
  let blob = await response.blob();
  const file = new File([blob], modelPaths, {
    type: 'application/octet-stream',
  });
  modelObserve(file, voxel, scene, grid_size, cube_size, reader, '#26CB1D');
  ElMessage({
    type: 'success',
    message: '构建模型成功'
  })
}

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
    /* modelPath.value = result.data;
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
    modelObserve(file, voxel, scene, grid_size, cube_size, reader, '#26CB1D'); */
    ElMessage({
      type: 'success',
      message: '手绘图像上传成功'
    })
  } else {
    ElMessage.error("手绘图片上传失败");
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

// 节流
const throttle = (func, delay = 20) => {
  let last = 0;
  return function () {
    let now = Date.now();
    if (now - last > delay) {
      func.apply(this, arguments);
      last = now;
    }
  }
};

// 发送消息
const data = ref({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  lineWidth: 5
});

// 房间操作记录
const roomOperate = ref({
  type: '',
  roomId: '',
  userId: '',
  lineWidth: 1,
  points: []
});

// 绘制图像
const drawLine = ({ x1, y1, x2, y2, lineWidth }) => {
  let hCanvas = document.getElementById('myCanvas');
  let ctx = hCanvas.getContext('2d');
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// 擦除痕迹
const eraseTrace = (x1, y1, x2, y2, lineWidth) => {
  let hCanvas = document.getElementById('myCanvas');
  let ctx = hCanvas.getContext('2d');
  ctx.clearRect(x2 - 10, y2 - 10, lineWidth, lineWidth);
}


// 消息发送
const sendMessage = throttle((types) => {
  ws.send(JSON.stringify({
    type: types,
    roomId: currentRoom.value.id,
    userId: userStore.userId
  }));
}, 50);

// 确保ws连接成功发送
const sendWhenReady = (data) => {
  const timer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      clearInterval(timer)
    }
  }, 50)
}

// 处理消息
const handleRemoteDraw = (data) => {
  if (data.type == 'draw') {
    drawLine(data.payload);
  }
  if (data.type == 'erase') {
    eraseTrace(data.payload);
  }
  if (data.type == 'clear') {
    clear();
  }
}

// 绘制图像
const drawRemote = (stroke) => {
  let hCanvas = document.getElementById('myCanvas');
  let ctx = hCanvas.getContext('2d');
  ctx.save();
  // ctx.globalCompositeOperation =
  //   stroke.type === 'erase' ? 'destination-out' : 'source-over'
  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = 'black';
  ctx.lineWidth = stroke.lineWidth
  ctx.beginPath()
  if (stroke.type === 'clear') {
    clearCanvas();
  } else {
    stroke.points.forEach((p, i) => {
      const x = p.x * hCanvas.width
      const y = p.y * hCanvas.height
      if (stroke.type === 'draw') {
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      } else if (stroke.type === 'erase') {
        ctx.clearRect(x - 10, y - 10, ctx.lineWidth, ctx.lineWidth);
      }
    })
  }
  ctx.stroke();
  ctx.restore();
}

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

// 坐标转化为百分比
const addPoints = (e) => {
  let hCanvas = document.getElementById('myCanvas');
  let rect = hCanvas.getBoundingClientRect();
  currentStroke.points.push({
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height
  });
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
    // data.value.x1 = pos.x;
    // data.value.y1 = pos.y;
    currentStroke = {
      roomId: currentRoom.value.id,
      userId: userStore.userId,
      type: textFlag.value ? 'erase' : 'draw',
      lineWidth: textFlag.value ? eraserWidth.value : penWidth.value,
      points: []
    }
    addPoints(e);
  })

  // 鼠标移动的响应
  hCanvas.addEventListener('mousemove', (e) => {
    if (isDrawing.value) {
      addPoints(e);
      let pos = getMousePosition(e);
      // data.value.x2 = pos.x;
      // data.value.y2 = pos.y;
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
  hCanvas.addEventListener('mouseup', async (e) => {
    isDrawing.value = false;
    if (currentRoom.value.id != '') {
      let result = await reqUploadOperation(currentStroke);
      if (result.code == 200) {
        ws.send(JSON.stringify({
          type: 'drawImage',
          roomId: currentRoom.value.id,
          userId: userStore.userId,
          stroke: currentStroke
        }));
      } else {
        ElMessage.error('操作上传失败');
      }
      currentStroke = null;
    }
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
const clear = async () => {
  clearCanvas();
  if (currentRoom.value.id != '') {
    const data = {
      roomId: currentRoom.value.id,
      userId: userStore.userId,
      type: 'clear',
      lineWidth: 1,
      points: []
    }
    let result = await reqUploadOperation(data);
    if (result.code == 200) {
      sendWhenReady(JSON.stringify({
        type: 'clearImage'
      }));
    } else {
      ElMessage.error('操作上传失败');
    }
  }
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

.roomBox {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}

.roomAlert {
  width: 800px;
}

.roomLine {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.roomName {
  font-weight: 600;
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

.drawer-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.room-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.room-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.room-info {
  margin-bottom: 8px;
}

.room-name {
  font-weight: 600;
}

.room-desc {
  font-size: 12px;
  color: #909399;
}

.room-users {
  display: flex;
  gap: 8px;
}

.user-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}
</style>
