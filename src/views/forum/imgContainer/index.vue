<template>
    <div class="block text-center">
        <el-carousel height="690px" interval="3000">
            <el-carousel-item v-for="item in imgList" :key="item">
                <img :src="item" alt="">
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script setup>

// 接收父组件传递的图片数据
let props = defineProps({
    imgList:{
        type:[],
        required:true
    }
});
</script>

<script>
// 暴露菜单组件
export default {
    name: 'imgContainer',
}
</script>

<style lang="scss" scoped>
.demonstration {
    color: var(--el-text-color-secondary);
}

.el-carousel__item{
    color: #475669;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
    text-align: center;
    img{
    width: 100%;
    height: 100%;
  }
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
}


</style>