<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, render, ref } from 'vue';

let reader = new FileReader();
let grid_size = 32;  // 全局变量
let cube_size = 10;  // 全局变量
let voxel = [];
let voxel_mesh, voxel_geo, voxel_mat, renderer, controls, scene, camera, grid;
let container = ref();
let drop_zone = ref();

const read_binvox = (array_buffer) => {
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
      return Promise.reject("error reading header");
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
  console.log("binvox version: " + version);

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
      return Promise.reject(`unrecognized keyword ${line}, skipping`);
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
  console.log('size: ' + `(${depth}, ${width}, ${height})`);
  // $('#list > .alert').append(`(${depth}, ${width}, ${height})`);

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
  buf = null;
  return Promise.resolve();
}

const fileLoad = () => {
  read_binvox(reader.result).then(() => {
    plot_voxel();
  }).catch((err) => {
    alert(`Error: ${err}`);
  });
}

// 求最大值
const argmax = (v, w) => {
  let idx = {
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
const argmin = (v, w) => {
  let idx = {
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
const plot_voxel = () => {
  // 清除模型残留
  if (grid) {
    scene.remove(grid);
  }

  // 添加网格
  grid = new THREE.GridHelper(grid_size, grid_size);
  grid.position.set(0, -cube_size / 2, 0);
  grid.material.color = new THREE.Color(0x000000);
  grid.material.opacity = 0.2;
  scene.add(grid);

  // 清除
  if (voxel_mesh) {
    scene.remove(voxel_mesh);
    voxel_geo.dispose();
    voxel_mat.dispose();
  }

  // voxel描画
  voxel_geo = new THREE.Geometry;
  let mesh_item = new THREE.Mesh(new THREE.BoxGeometry(cube_size, cube_size, cube_size));

  let origin = {
    x: -0.5 * cube_size * (grid_size - 1),
    y: -cube_size / 2,
    z: -0.5 * cube_size * (grid_size - 1),
  };

  var offset_x = 0, offset_y = 0, offset_z = 0;
  if (centering) {
    offset_x = ((argmax(voxel, 'x') - argmin(voxel, 'x')) / 2 - grid_size / 2) * cube_size;
    offset_z = ((argmax(voxel, 'z') - argmin(voxel, 'z')) / 2 - grid_size / 2) * cube_size;
  }

  for (let i = 0; i < voxel.length; i++) {
    let norm_x = origin.x - offset_x + cube_size * voxel[i][0];
    let norm_y = origin.y - offset_y + cube_size * voxel[i][1];
    let norm_z = origin.z - offset_z + cube_size * voxel[i][2];
    mesh_item.position.set(norm_x, norm_y, norm_z);
    voxel_geo.mergeMesh(mesh_item);
  }

  voxel_mat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  voxel_mesh = new THREE.Mesh(voxel_geo, voxel_mat);
  console.log(voxel_geo);
  scene.add(voxel_mesh);
  mesh_item = null;
}

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const handleDragLeave = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
  // $('#drop_zone').css('background', 'rgb(255,255,255)')
  drop_zone.value.style.background = 'rgb(255,255,255)';
}

const handleDragOver = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
  // $('#drop_zone').css('background', 'rgb(232, 232, 232)')
  drop_zone.value.style.background = 'rgb(232, 232, 232)';
}

const handleFileSelect = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.
  var output = [];

  for (let i = 0, f; f = files[i]; i++) {
    output.push(`<div class="alert alert-success" role="alert"><strong>${f.name}</strong></div>`);
  }

  document.getElementById('list').innerHTML = output.join('');
  let ext = files[0].name.split('.').pop();
  if (ext === 'binvox') {
    reader.readAsArrayBuffer(files[0]);
  }
}

const init = () => {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const width = container.value.offsetWidth;
  const height = container.value.offsetHeight;
  renderer.setSize(width, height);
  renderer.setClearColor(new THREE.Color(0xffffff), 0.0);
  container.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
  camera.position.set(-20 * grid_size, 7 * grid_size, 20 * grid_size);
  //camera.position.set(-grid_size * 4, grid_size * 4, grid_size * 4); // 调整视角位置


  // 光源
  var ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  let grid = new THREE.GridHelper(grid_size * cube_size, grid_size);
  grid.position.set(0, -cube_size / 2, 0);
  grid.material.color = new THREE.Color(0x000000);
  grid.material.opacity = 0.2;
  scene.add(grid);

  controls = new OrbitControls(camera, renderer.domElement);

  // ファイルのドラッグ＆ドロップ
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('dragleave', handleDragLeave, false);
  dropZone.addEventListener('drop', handleFileSelect, false);
  reader.addEventListener('load', fileLoad, false);

  // plot_voxel();
  // $('#centering').change(() => {
  //   plot_voxel($('#centering').prop('checked'));
  // });

  animate();
}

onMounted(() => {
  init();
});

</script>