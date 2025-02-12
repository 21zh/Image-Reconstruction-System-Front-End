// 文件上传相关的接口
import request from '@/utils/request';
import type { handDrawResponseData } from './type';

enum API{
    // 上传手绘图片的地址
    IMAGEUPLOAD_URL = '/handDraw/imageUpload'
}

// 手绘图片上传的接口
export const reqHandDrawImageUpload = (data: any) => {
    const payload = {
      image: data, // 假设传递的 `data` 是 Base64 编码的图像数据
    };
  
    return request.post<any, handDrawResponseData>(API.IMAGEUPLOAD_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });
  };
  
  