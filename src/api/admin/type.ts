// 定义与管理员相关的ts类型
// 返回的统一数据
export interface ResponseData{
    code:number,
    message:string,
}

// 分页查询数据的类型
export interface user{
    id?:number,
    userName:string,
    password:string,
    phone:string,
    avatar:string,
    motto:string,
    roleId:number,
    createTime?:string,
    updateTime?:string,
}

// 用户信息列表
export type userList = user[]

// 分页获取用户返回的数据类型
export interface userInfoResponseData extends ResponseData{
    data:{
        userList:userList,
        total:number,
        pageNo:number,
        pageSize:number,
        totalPage:number
    }
}

