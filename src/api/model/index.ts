// 模型获取相关的接口
import request from '@/utils/request';
import type { ModelResponseData } from './type';

enum API{
    // 获取对应类型的模型数据
    GETTYPEMODEL_URL = '/model/getTypeModel',
}

// 获取对应类型的模型数据的接口
export const reqGetTypeModel = (typeId:number) => request.get<any,ModelResponseData>(API.GETTYPEMODEL_URL + `/${typeId}`);
