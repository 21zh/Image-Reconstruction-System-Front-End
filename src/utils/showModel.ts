import { ElMessage } from 'element-plus';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const read_binvox = (
    array_buffer: any,
    voxel: any[],
) => {
    let buf = new Uint8Array(array_buffer);  // 使用 Uint8Array
    array_buffer = null;

    // 读取头部
    let lines = [], line = '', c = 0;
    let pos = 0;  // 这里应该使用 let，因为 pos 的值会被多次修改
    let textDecoder = new TextDecoder();  // 使用 TextDecoder 来解码字节数据

    // 读取头部信息，直到 'data' 行
    while (line !== 'data') {
        // 查找换行符
        let newlinePos = buf.indexOf(10, pos);  // 10 是换行符 '\n' 的字节值
        if (c++ > 1000 || newlinePos === -1) {
            return ElMessage({ type: 'error', message: '数据解析错误' });
        }

        // 从当前 pos 到 newlinePos 解码文本行
        line = textDecoder.decode(buf.slice(pos, newlinePos));
        lines.push(line);
        pos = newlinePos + 1;  // 更新 pos，跳过换行符
    }

    // 解析头部的 binvox 版本
    var headerLine = lines[0].slice(0, 7);
    if (headerLine !== '#binvox') {
        return Promise.reject(`first line reads ${headerLine} instead of #binvox`);
    }
    var version = parseInt(lines[0].slice(8), 10);
    // console.log("binvox version: " + version);

    // 解析维度信息
    let depth, height, width;
    for (var i = 1; i < lines.length - 1; i++) {
        line = lines[i];
        if (line.slice(0, line.indexOf(' ')) === 'dim') {
            line = line.slice(line.indexOf(' ') + 1);
            let pos = line.indexOf(' ');  // 使用 let
            depth = parseInt(line.slice(0, pos), 10);

            line = line.slice(pos + 1);
            pos = line.indexOf(' ');  // 使用 let
            height = parseInt(line.slice(0, pos), 10);

            line = line.slice(pos + 1);
            width = parseInt(line, 10);
            break;
        } else {
            return ElMessage({ type: 'error', message: '维度信息解析错误' });
        }
    }
    if (depth === void 0) {
        if (height === void 0 || width === void 0) {
            return Promise.reject("error reading header");
        } else {
            return Promise.reject("missing dimensions in header");
        }
    }

    // 应该是 depth === width === height
    const grid_size = depth;
    // console.log('size: ' + `(${depth}, ${width}, ${height})`);

    // 读取体素数据
    let idx = 0;
    i = 0;
    let j = 0, k = 0;
    const gs = grid_size;

    for (let c = 0; c < (buf.byteLength - pos) / 2; c++) {
        const value = buf[pos + 2 * c];  // 获取每个体素的值
        const count = buf[pos + 2 * c + 1];  // 获取体素的数量

        if (value === 1) {
            for (let _ = 0; _ < count; _++) {
                i = Math.floor(idx / (gs * gs));
                j = Math.floor((idx - i * gs * gs) / gs);
                k = idx - i * gs * gs - j * gs;
                voxel.push([i, k, j]);
                idx++;
            }
        } else {
            idx += count;
        }
    }
    return Promise.resolve();
}

// 求最大值
const argmax = (v: any[][], w: any) => {
    let idx: any = {
        'x': 0,
        'y': 1,
        'z': 2,
    }
    var max = v[0][idx[w]];
    for (var i = 1; i < v.length; i++) {
        if (v[i][idx[w]] > max) {
            max = v[i][idx[w]]
        }
    }
    return max;
}


// 求最小值
const argmin = (v: any[], w: any) => {
    let idx: any = {
        'x': 0,
        'y': 1,
        'z': 2,
    }
    var min = v[0][idx[w]];
    for (var i = 1; i < v.length; i++) {
        if (v[i][idx[w]] < min) {
            min = v[i][idx[w]]
        }
    }
    return min;
}

// 绘制三维模型
const plot_voxel = (voxel: any[], scene: THREE.Scene, grid_size: any, cube_size: any, color: any) => {
    // 移除旧的体素模型
    scene.children = scene.children.filter((child) => !(child instanceof THREE.Mesh));

    // voxel描画
    let voxel_geo = new THREE.Geometry();
    let mesh_item = new THREE.Mesh(new THREE.BoxGeometry(cube_size, cube_size, cube_size));

    let origin = {
        x: -0.5 * cube_size * (grid_size - 1),
        y: -cube_size / 2 - 150,
        z: -0.5 * cube_size * (grid_size - 1),
    };

    var offset_x = 0, offset_y = 0, offset_z = 0;

    for (let i = 0; i < voxel.length; i++) {
        let norm_x = origin.x - offset_x + cube_size * voxel[i][0];
        let norm_y = origin.y - offset_y + cube_size * voxel[i][1];
        let norm_z = origin.z - offset_z + cube_size * voxel[i][2];
        mesh_item.position.set(norm_x, norm_y, norm_z);
        voxel_geo.mergeMesh(mesh_item);
    }

    let voxel_mat = new THREE.MeshPhongMaterial({ color: parseInt(color.replace("#", ""), 16) });
    let voxel_mesh = new THREE.Mesh(voxel_geo, voxel_mat);

    scene.add(voxel_mesh);
}

const animate = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    requestAnimationFrame(() => animate(renderer, scene, camera)); // 修复调用方式
    renderer.render(scene, camera);
};

export const modelObserve = (file: any, voxel: any[], scene: any, grid_size: any, cube_size: any, reader: any, color: any) => {
    // 监听文件读取完成事件
    reader.onload = () => {
        const arrayBuffer = reader.result;

        // 调用 read_binvox 处理 arrayBuffer
        read_binvox(arrayBuffer, voxel)
            .then(() => {
                plot_voxel(voxel, scene, grid_size, cube_size, color);
            })
            .catch((err: any) => {
                ElMessage({ type: 'error', message: `文件读取失败：${err}` });
            });
    };

    // 监听文件读取错误事件

    reader.onerror = () => {
        ElMessage({ type: 'error', message: '文件读取失败' });
    };

    // 开始读取文件
    if(file.raw){
      reader.readAsArrayBuffer(file.raw);  
    }
    else{
        reader.readAsArrayBuffer(file);
    }
};

export const init = (
    container: HTMLElement, // 直接传入 DOM 元素
    grid_size: number,
    cube_size: number,
    scene: THREE.Scene,
) => {
    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    renderer.setSize(width, height);
    renderer.setClearColor(new THREE.Color(0xffffff), 1); // 设置白色背景
    container.appendChild(renderer.domElement);

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
    camera.position.set(-20 * grid_size, 7 * grid_size, 20 * grid_size);
    camera.lookAt(0, 0, 0); // 让相机朝向场景中心

    // 光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 增加环境光强度
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 增加平行光强度
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    // 网格
    const grid = new THREE.GridHelper(grid_size * cube_size, grid_size);
    grid.position.set(0, -cube_size / 2 - 150, 0);
    (grid.material as THREE.Material).color = new THREE.Color(0x000000); // 设置网格颜色
    (grid.material as THREE.Material).opacity = 0.2; // 设置网格透明度
    (grid.material as THREE.Material).transparent = true; // 启用透明度
    scene.add(grid);

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    // 窗口大小变化时的处理
    window.addEventListener('resize', () => {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;

        // 更新渲染器的大小
        renderer.setSize(newWidth, newHeight);

        // 更新相机的宽高比
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });
    // 启动动画循环
    animate(renderer, scene, camera);
};