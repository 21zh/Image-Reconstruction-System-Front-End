<template>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ref, onMounted ,watch} from 'vue';
import { init, modelObserve } from '@/utils/showModel';
let props = defineProps({
    container: HTMLElement,
    grid_size: Number,
    cube_size: Number,
    scene: THREE.Scene,
})

onMounted(() => {
    if (props.container) {
        init(props.container, props.grid_size, props.cube_size, props.scene);
    }
})
</script>

<script>
// 暴露菜单组件
export default {
    name: 'Models',
}
</script>

<style lang="scss" scoped></style>