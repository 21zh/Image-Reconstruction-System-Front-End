import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'
import { tr } from 'element-plus/es/locales.mjs'
import { h } from 'vue'

// 暴露配置路由
export const constantRoute = [
  {
    // 登录
    path: '/login',
    component: () => import('@/views/login/index.vue'), // 路由懒加载
    name: 'login', // 路由名称
    meta: {
      title: '登录', // 菜单标题
      hidden: true, // 代表路由的标题在菜单上是否隐藏
      icon: 'Promotion',
    },
  },
  {
    // 骨架
    path: '/',
    component: () => import('@/layout/index.vue'), // 路由懒加载
    name: 'Layout', // 路由名称
    meta: {
      title: '骨架', // 菜单标题
      hidden: true, // 代表路由的标题在菜单上是否隐藏
      icon: 'Promotion',
    },
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home/index.vue'),
        name: 'home',
        meta: {
          title: '首页',
          hidden: false,
          icon: 'Promotion',
        },
      },
    ],
  },
  {
    // 三维重构
    path: '/modelDraw',
    component: () => import('@/layout/index.vue'),
    name: 'modelDrawing',
    meta: {
      title: '三维重构',
      hidden: false,
      icon: 'Compass',
    },
    redirect: '/modelDraw/handDraw',
    children: [
      // 手绘重构
      {
        path: '/modelDraw/handDraw',
        component: () => import('@/views/modelDraw/handDraw/index.vue'),
        name: 'handDraw',
        meta: {
          title: '手绘重构',
          hidden: false,
          icon: 'EditPen',
        },
      },
      // 图像重构
      {
        path: '/modelDraw/imageDraw',
        component: () => import('@/views/modelDraw/imageDraw/index.vue'),
        name: 'imageDraw',
        meta: {
          title: '图像重构',
          hidden: false,
          icon: 'Picture',
        },
      },
      {
        // 模型预览
        path: '/modelDraw/modelPreview',
        component: () => import('@/views/modelDraw/modelPreview/index.vue'),
        name: 'modelPreview',
        meta: {
          title: '模型预览',
          hidden: false,
          icon: 'View',
        },
      },
    ],
  },
  {
    // 管理模块
    path: '/admin',
    component: () => import('@/layout/index.vue'),
    name: 'admin',
    meta: {
      title: '用户管理',
      hidden: false,
      icon: 'User',
    },
    redirect: '/admin/user',
    children: [
      {
        // 用户授权
        path: '/admin/user',
        component: () => import('@/views/admin/user/index.vue'),
        name: 'user',
        meta: {
          title: '角色管理',
          hidden: false,
          icon: 'User',
        },
      }
      // {
      //   // 数据大屏
      //   path: '/admin/screen',
      //   component: () => import('@/views/admin/screen/index.vue'),
      //   name: 'screen',
      //   meta: {
      //     title: '数据大屏',
      //     hidden: false,
      //     icon: 'DataBoard',
      //   },
      // },
    ],
  },
  {
    // 骨架
    path: '/forum',
    component: () => import('@/layout/index.vue'), // 路由懒加载
    name: 'Forum', // 路由名称
    meta: {
      title: '骨架', // 菜单标题
      hidden: true, // 代表路由的标题在菜单上是否隐藏
      icon: 'Promotion',
    },
    redirect: '/forum/communicate',
    children: [
      {
        // 论坛交流
        path: '/forum/communicate',
        component: () => import('@/views/forum/index.vue'),
        name: 'forum',
        meta: {
          title: '论坛交流',
          hidden: false,
          icon: 'ChatDotRound',
        },
      },
    ],
  },
  {
    // 骨架
    path: '/model',
    component: () => import('@/layout/index.vue'), // 路由懒加载
    name: 'Model', // 路由名称
    meta: {
      title: '骨架', // 菜单标题
      hidden: true, // 代表路由的标题在菜单上是否隐藏
      icon: 'Promotion',
    },
    redirect: '/model/dataBase',
    children: [
      {
        // 模型数据
        path: '/model/dataBase',
        component: () => import('@/views/model/index.vue'),
        name: 'model',
        meta: {
          title: '图像模型',
          hidden: false,
          icon: 'DataAnalysis',
        },
      },
    ],
  },
  {
    // 404
    path: '/404',
    component: () => import('@/views/404/index.vue'), // 路由懒加载
    name: '404',
    meta: {
      title: '404', // 菜单标题
      hidden: true,
    },
  },
  {
    // 默认路由
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'Any',
    meta: {
      title: '默认', // 菜单标题
      hidden: true,
    },
  },
]
