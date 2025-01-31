<template>
  <div id="content">
    <div class="toolBar">
      <el-button @click="clear">清空</el-button>
      <el-button @click="exprot">导出</el-button>
      <el-button @click="eraser">{{ text }}</el-button>
      <div style="margin-left: 12px">

        <!-- Element-Plus 颜色选择器 -->
        <el-color-picker v-model="color1" @change="colorChange" />

      </div>
      <div style="margin-left: 12px;width: 100px">
        <!-- Element-Plus 滑块 -->
        <el-slider style="margin-left: 12px;width: 100px" v-model="value1" @change="numberChange" />
      </div>

      <!-- 右上方关闭按钮 -->
      <div class="light" @click="backIndex">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        X
      </div>
    </div>
    <canvas id="myCanvas"></canvas>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs, onBeforeMount, onMounted, nextTick } from 'vue'
import { useRouter } from "vue-router";
import icon from '../../../assets/pen.png'

// 初始文字
const text = ref('橡皮擦')
// 该变量用来记录按钮文本
const textFlag = ref(true)
// 初始颜色
const color1 = ref('#409EFF')
// 初始线条粗细
const value1 = ref(6)
// 光标自定义
const cursorIcon = ref(`url(${icon}),default`);

let myCanvas: HTMLElement | null
let ctx: { scale: (arg0: number, arg1: number) => void; moveTo: (arg0: number, arg1: number) => void; beginPath: () => void; lineWidth: any; strokeStyle: any; lineTo: (arg0: number, arg1: number) => void; stroke: () => void; }
let isMouseDown: boolean
let strokeStyle: string
let lineWidth: number
onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
//返回首页
const router = useRouter();
function backIndex() {
  router.push('/')
}
// 初始化canvas
function initCanvas() {
  // 线条细节处理，分辨率
  let dpr = window.devicePixelRatio || 1;
  myCanvas = document.getElementById('myCanvas')
  // 设置canvas实际尺寸
  myCanvas.width = window.innerWidth - 20
  myCanvas.height = window.innerHeight - 50

  // 让canvas坐标系统使用css像素
  ctx = myCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  // 监听canvas的鼠标按下时间
  myCanvas.addEventListener('mousedown', function (e) {
    // console.log(e);
    isMouseDown = true // 变量记录是否按下鼠标
    ctx.moveTo(e.pageX, e.pageY) // 将绘制起始点设置为鼠标按下的点
    // 设置绘制图形的样式：线条宽度和颜色;开始画线
    ctx.beginPath();
    ctx.lineWidth = lineWidth || value1.value;
    ctx.strokeStyle = strokeStyle || color1.value;

  })
  // 监听鼠标松开事件
  myCanvas.addEventListener('mousemove', function (e) {
    if (isMouseDown) { // 如果鼠标按下
      ctx.lineTo(e.pageX, e.pageY) // 设置终点
      ctx.stroke() // 连接起点和终点并用设置好的样式描边
    }
  })
  // 监听鼠标松开事件，停止绘制
  myCanvas.addEventListener('mouseup', function () {
    // ctx.closePath();
    isMouseDown = false
  })
}

// 清空
function clear() {
  // 1. 简单填充 使用一个新的背景色简单地填充整个画布，这样就可以清除当前内容
  // ctx.fillStyle = '#fff';
  // let rect = this.canvas.getBoundingClientRect();
  // ctx.fillRect(rect.x, rect.y, rect.width, rect.height)

  // 2.重置画布高度 当画布的宽或高被重置时，当前画布内容就会被移除。
  let rect = myCanvas.getBoundingClientRect();
  myCanvas.width = rect.width;
  myCanvas.height = rect.height;

  //3. 使用clearRect函数 clearRect() 函数可以指定起始点的x, y 位置以及宽度和高度来清除画布
  // let rect = this.canvas.getBoundingClientRect();
  // this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
}

// 导出
function exprot() {
  let link = document.createElement('a')
  link.href = myCanvas.toDataURL('image/png')
  link.download = 'draw.png'
  link.click()
}
// 改变颜色
function colorChange(e: string | undefined) {
  console.log(e)
  strokeStyle = <string>e
}
// 改变线条粗细
function numberChange(e: number) {
  lineWidth = e
}
// 橡皮擦，更换文本以及光标样式
function eraser(e: string | undefined) {
  textFlag.value = !textFlag.value
  console.log(textFlag.value)
  if (!textFlag.value) {
    cursorIcon.value = "url(/src/assets/rubber.png),default"
    text.value = '画笔'
    strokeStyle = '#ffffff'
  } else {
    cursorIcon.value = 'url(/src/assets/pen.png),default'
    text.value = '橡皮擦'
    colorChange(e)
  }
}

</script>

<style scoped lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  box-sizing: border-box;
  overflow-y: hidden;
  overflow-x: hidden;
}

#content {
  width: 100%;
  height: 100%;
  position: relative;
}

.toolBar {
  width: 100vw;
  height: 50px;
  background-color: azure;
  box-shadow: 0 5px 2px #e8e8e8;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

// 关闭按钮样式以及动画：霓虹灯效果
.light {
  width: 40px;
  height: 30px;
  position: absolute;
  top: 30px;
  right: 30px;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 30px;
  color: #03e9f4;
  font-size: 20px;
  text-transform: uppercase;
  transition: 0.5s;
  letter-spacing: 4px;
  cursor: pointer;
  overflow: hidden;
}

.light:hover {
  background-color: #03e9f4;
  color: #050801;
  box-shadow: 0 0 5px #03e9f4,
    0 0 25px #03e9f4,
    0 0 50px #03e9f4,
    0 0 200px #03e9f4;
}

.light div {
  position: absolute;
}

.light div:nth-child(1) {
  width: 100%;
  height: 2px;
  top: 0;
  left: -100%;
  background: linear-gradient(to right, transparent, #03e9f4);
  animation: animate1 1s linear infinite;
}

.light div:nth-child(2) {
  width: 2px;
  height: 100%;
  top: -100%;
  right: 0;
  background: linear-gradient(to bottom, transparent, #03e9f4);
  animation: animate2 1s linear infinite;
  animation-delay: 0.25s;
}

.light div:nth-child(3) {
  width: 100%;
  height: 2px;
  bottom: 0;
  right: -100%;
  background: linear-gradient(to left, transparent, #03e9f4);
  animation: animate3 1s linear infinite;
  animation-delay: 0.5s;
}

.light div:nth-child(4) {
  width: 2px;
  height: 100%;
  bottom: -100%;
  left: 0;
  background: linear-gradient(to top, transparent, #03e9f4);
  animation: animate4 1s linear infinite;
  animation-delay: 0.75s;
}

@keyframes animate1 {
  0% {
    left: -100%;
  }

  50%,
  100% {
    left: 100%;
  }
}

@keyframes animate2 {
  0% {
    top: -100%;
  }

  50%,
  100% {
    top: 100%;
  }
}

@keyframes animate3 {
  0% {
    right: -100%;
  }

  50%,
  100% {
    right: 100%;
  }
}

@keyframes animate4 {
  0% {
    bottom: -100%;
  }

  50%,
  100% {
    bottom: 100%;
  }
}

#myCanvas {
  cursor: v-bind(cursorIcon);
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>