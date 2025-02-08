// 定义与用户相关的ts类型
// 返回的统一数据
export interface ResponseData{
    code:number,
    message:string,
}

// 已有用户的类型
export interface loginForm{
    userName:string,
    password:string
}

// 注册用户的类型
export interface registerForm{
    userName:string,
    password:string,
    phone:string,
    avatar:string,
    motto:string,
    code?:string
}

// 登录接口返回的数据
export interface loginResponseData extends ResponseData{
    data:string
}

// 获取用户信息返回的数据
export interface userInfoResponseData extends ResponseData{
    userName:string,
    avatar:string,
    motto:string
}

