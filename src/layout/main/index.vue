<template>
    <div>
        <!-- 路由组件出口 -->
        <router-view v-slot="{ Component }">
            <transition name="fade">
                <component :is="Component" v-if="flag"></component>
            </transition>
        </router-view>
    </div>
</template>

<script setup>
import LayOutSettingStore from '@/store/modules/setting';
import { ref } from 'vue';

// 获取配置仓库对象
let layOutSettingStore = LayOutSettingStore();

let flag = ref(true);
</script>

<script>
export default {
    name: 'Main'
}
</script>

<style lang="scss" scoped>
.fade-enter-from {
    opacity: 0;
    transform: scale(0);
}

.fade-enter-active {
    transition: all 1s;
}

.fade-enter-to {
    opacity: 1;
    transform: scale(1);
}
</style>