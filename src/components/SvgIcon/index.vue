<template>
  <!-- 测试SVG图标使用
    svg:图标外层容器节点，内部需要结合use使用 -->
  <svg :style="{ width, height }">
    <!-- xlink:href属性值是SVG图标的id，id值是SVG图标的name -->
    <use :xlink:href="prefix + name" :fill="color"></use>
  </svg>
</template>

<script setup lang="ts">
// 接收父组件传递的参数
defineProps({
  // xlink前缀
  prefix: {
    type: String,
    default: '#icon-',
  },
  // 提供图标名字
  name: String,
  // 提供图标颜色
  color: {
    type: String,
    default: '',
  },
  // 接收父组件传递的宽度
  width: {
    type: String,
    default: '16px',
  },
  // 接收父组件传递的高度
  height: {
    type: String,
    default: '16px',
  },
})
</script>

<style lang="scss" scoped></style>
