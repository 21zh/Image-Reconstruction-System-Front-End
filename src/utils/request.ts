// axios二次封装：使用请求和响应拦截器
import axios from 'axios'
import { ElMessage } from 'element-plus'
import userStores from '../store/modules/user'

// 1.利用axios对象创建axios示例
let request = axios.create({
  // 基础路径
  baseURL: import.meta.env.VITE_APP_BASE_API, // 基础路径上会携带/api
  timeout: 5000, // 请求超时时间
})

//2.配置请求拦截器
request.interceptors.request.use((config) => {
  // config配置对象，headers属性请求头
  let userStore = userStores();
  if(userStore.token){
    config.headers.token = userStore.token;
  }
  // 返回配置对象
  return config;
})

//3.配置响应拦截器
request.interceptors.response.use(
  (response) => {
    // 成功回调
    // 简化数据
    return response.data;
  },
  (error) => {
    // 失败回调
    let message = ''
    let status = error.response.status
    switch (status) {
      case 401:
        message = 'token过期'
        break
      case 403:
        message = '无权访问'
        break
      case 404:
        message = '请求地址错误'
        break
      case 500:
        message = '服务器出现问题'
        break
      default:
        message = '网络出现问题'
        break
    }
    // 提示错误信息
    ElMessage({
      type: 'error',
      message: message,
    })
    return Promise.reject(error)
  },
)

// 对外暴露
export default request;
