// 本地浏览器存储、获取和删除token
// 存储token
export const SET_TOKEN = (token:string) =>{
    localStorage.setItem('token',token);
}

// 获取token
export const GET_TOKEN = () =>{
    return localStorage.getItem('token');
}

// 删除token
export const REMOVE_TOKEN = () =>{
    localStorage.removeItem('token');
}