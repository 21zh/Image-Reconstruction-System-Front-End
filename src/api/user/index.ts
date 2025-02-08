// 统一管理用户相关的请求接口
import request from "@/utils/request";
import type { loginForm, loginResponseData ,registerForm, userInfoResponseData} from "./type";

enum API{
    // 已有账户，登录接口
    LOGIN_URL = '/user/login',
    // 注册账户，登录接口
    REGISTER_URL = '/user/register',
    // 发送验证码
    SENDCODE_URL = '/user/sendCode',
    // 获取用户信息
    GETINFO_URL = '/user/getUserPart',
    // 退出登录
    LOGOUT_URL = '/user/logout',
}

// 已有账户的登录接口
export const reqLogin = (data:loginForm) => request.post<any,loginResponseData>(API.LOGIN_URL,data);

//发送验证码
export const reqSendCode = (phone:string) => request.post<any,any>(API.SENDCODE_URL+`?phone=${phone}`);

// 账户注册登录接口
export const reqRegister = (data:registerForm) => request.post<any,loginResponseData>(API.REGISTER_URL,data);

// 获取用户信息接口
export const reqGetUserPart = () => request.get<any,userInfoResponseData>(API.GETINFO_URL);

// 退出用户接口
export const reqLogout = () => request.post<any,any>(API.LOGOUT_URL);


