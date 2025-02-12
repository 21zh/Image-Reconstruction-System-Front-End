// 文件上传相关的接口
import request from '@/utils/request';
import type { handDrawResponseData, imageDrawResponseData } from './type';

enum API {
  // 上传手绘图片的地址
  HANDUPLOAD_URL = '/handDraw/handUpload',
  // 上传文件夹的地址
  FILEUPLOAD_URL = '/imageDraw/fileUpload'
}

// 手绘图片上传的接口
export const reqHandDrawImageUpload = (data: any) => {
  const payload = {
    image: data, // 假设传递的 `data` 是 Base64 编码的图像数据
  };

  return request.post<any, handDrawResponseData>(API.HANDUPLOAD_URL, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 60000,
  });
};

// 文件夹上传的接口
export const reqFileUpload = (data:any) =>{
  return request.post<any,imageDrawResponseData>(API.FILEUPLOAD_URL,data,{
    headers:{"Content-Type":"multipart/form-data"},
    timeout:80000
  })
}

