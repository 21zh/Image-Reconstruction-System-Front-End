<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <el-carousel :interval="4000" type="card" height="220px" class="custom-carousel">
      <el-carousel-item v-for="item in imgList" :key="item">
        <img :src="item" alt="carousel-image" class="carousel-image">
      </el-carousel-item>
    </el-carousel>

    <!-- 日历 -->
    <el-calendar class="custom-calendar">
      <template #date-cell="{ data }">
        <p :class="{ 'selected-date': data.isSelected }">
          {{ data.day.split('-').slice(1).join('-') }}
          <span v-if="data.isSelected" class="checkmark">✔️</span>
        </p>
      </template>
    </el-calendar>
  </div>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import userStores from '@/store/modules/user';

// 获取用户仓库
let userStore = userStores();

// 图片数组
let imgList = ref([
  '/public/spring.png',
  '/public/summer.png',
  '/public/autumn.png',
  '/public/winter.png'
]);

// 组件加载成功，请求获取用户数据
onMounted(() => {
  // 发送请求
  userStore.userPart();
});
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 轮播图样式 */
.custom-carousel {
  width: 80%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.el-carousel__item:hover .carousel-image {
  transform: scale(1.05);
}

/* 日历样式 */
.custom-calendar {
  width: 90%;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: url('/public/calendars.gif');
}

.selected-date {
  font-weight: bold;
  color: #409eff;
  background-color: #f0faff;
  padding: 5px;
  border-radius: 5px;
}

.checkmark {
  color: #67c23a;
  font-size: 14px;
  margin-left: 5px;
}
</style>
