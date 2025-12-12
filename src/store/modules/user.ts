// 创建用户相关的小仓库
import { defineStore } from 'pinia';
// 引入数据类型
import type { UserState } from '@/stores/interface';
// 引入路由相关对象
import { adminRoute ,userRoute} from '@/router/routers';
import type { loginForm, registerForm } from '@/api/user/type';
import { reqLogin, reqRegister } from '@/api/user';
import { SET_TOKEN } from '@/utils/token';
import { reqGetUserPart, reqLogout } from '../../api/user';
import { ElMessage } from 'element-plus';
import { GET_TOKEN, REMOVE_TOKEN } from '../../utils/token';

// 创建用户小仓库
let userStores = defineStore('User', {
  // 存储数据
  state: (): UserState => {
    return {
      // 用户id
      userId: '',
      // 用户名
      userName: '',
      // 头像
      avatar: '',
      // 个性签名
      motto: '',
      // 用户对象
      roleId:'',
      // token
      token: GET_TOKEN(),
      // 路由数据
      menuRoutes: adminRoute,
    }
  },
  // 异步和逻辑处理
  actions: {
    // 用户登录方法
    async userLogin(data: loginForm) {
      // 发送登录请求
      let result = await reqLogin(data);
      if (result.code === 200) {
        // 已有账户登录成功，存储token
        this.token = result.data;
        SET_TOKEN(result.data);
      }
      return result.code;
    },
    // 新用户注册登录
    async userRegister(data: registerForm) {
      // 发送注册请求
      let result = await reqRegister(data);
      if (result.code === 200) {
        // 账户注册登录成功，存储token
        this.token = result.data;
        SET_TOKEN(result.data);
      }
      return result.code;
    },
    // 获取用户信息
    async userPart() {
      // 发送获取用户信息请求
      let result = await reqGetUserPart();
      // 请求成功，属性赋值
      if (result.code === 200) {
        this.userId = result.data.id;
        this.userName = result.data.userName;
        this.avatar = result.data.avatar;
        this.motto = result.data.motto;
        if(result.data.roleId === 1){
          this.menuRoutes = userRoute;
        }
        return 'ok';
      } else {
        return Promise.reject(new Error(result.message));
      }
    },
    // 退出登录
    async logout() {
      // 1.调用登录接口
      let result = await reqLogout();
      // 2.判断是否成功
      // 3.如果成功，清除token
      REMOVE_TOKEN();
      this.userId = '';
      this.token = '';
      // 清除数据
      this.username = '';
      this.avatar = '';
      this.motto = '';
      if (result.code === 415) {
        ElMessage.success(result.message);
      }
    }
  },
  persist: true
})

// 对外暴露用户的小仓库
export default userStores
