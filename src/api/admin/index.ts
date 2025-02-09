// 管理员相关的请求接口
import request from "@/utils/request";
import type { user, userInfoResponseData } from "./type";

enum API{
    // 分页获取所有用户
    GETUSER_URL = '/admin/getUserInfo/',
    // 改变用户角色类型
    CHANGEROLE_URL = '/admin/changeRole',
    // 删除用户
    DELETEUSER_URL = '/admin/deleteUser',
    // 添加用户
    ADDUSER_URL = '/admin/addUser',
    // 修改用户
    UPDATEUSER_URL = '/admin/updateUser',
}

// 分页获取所有用户的接口
export const reqGetUserInfo = (pageNo:number,pageSize:number,keyWord:string) => request.get<any,userInfoResponseData>(API.GETUSER_URL + `/${pageNo}/${pageSize}?keyWord=${keyWord}`);

// 改变用户类型的接口
export const reqChangeRole = (id:number) => request.put<any,any>(API.CHANGEROLE_URL + `/${id}`);

// 新增或者修改用户接口
export const reqAddOrUpdateUser = (data:user) => {
    // 有id修改用户
    if(data.id){
        return request.put<any,any>(API.UPDATEUSER_URL,data);
    }else{
        // 没有id则添加用户
        return request.post<any,any>(API.ADDUSER_URL,data);
    } 
}

// 删除用户接口
export const reqDeleteUser = (id:number) => request.delete<any,any>(API.DELETEUSER_URL + `/${id}`);
