import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// 引入svg所需的插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
// mock插件提供方法
import { viteMockServe } from 'vite-plugin-mock'
// https://vite.dev/config/

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      // viteMockServe({
      //   localEnabled: false,
      // }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('./src'), // 相对路径别名配置，使用 @ 代替 src
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: `@use "@/styles/variable.scss" as *;`, // 直接作为全局导入
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_SERVE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      global: 'window',
    },
  }
});
