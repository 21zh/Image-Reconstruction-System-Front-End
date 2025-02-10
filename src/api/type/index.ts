// 与分类相关的请求接口
import request from '@/utils/request';
import type { TypeResponseData } from './type';

enum API{
    // 获取所有类型
    GETALLTYPE_URL = '/type/getAllType',
}

// 获取所有类型的接口
export const reqGetAllType = () => request.get<any, TypeResponseData>(API.GETALLTYPE_URL);