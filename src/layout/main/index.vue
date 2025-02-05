<template>
    <div>
        <!-- 路由组件出口 -->
        <router-view v-slot="{ Component }">
            <transition name="fade">
                <div v-if="flag">
                    <component :is="Component" />
                </div>
            </transition>
        </router-view>
    </div>
</template>

<script setup>
import LayOutSettingStore from '@/store/modules/setting';
import { ref, watch, nextTick } from 'vue';

// 获取配置仓库对象
let layOutSettingStore = LayOutSettingStore();

// 控制当前组件是否销毁重建
let flag = ref(true);

// 监听仓库内部数据是否发送变化，如果发生变化，则刷新
watch(() => layOutSettingStore.refsh, () => {
    flag.value = false;
    nextTick(() => {
        flag.value = true;
    })
})
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