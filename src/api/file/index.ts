// 文件上传相关的接口
import request from '@/utils/request';
import type { ResponseData, handDrawResponseData, imageDrawResponseData, createRoomResponseData, 
  getRoomResponseData, roomResponseData, getRoomOperationResponseData } from './type';

enum API {
  // 上传手绘图片的地址
  HANDUPLOAD_URL = '/handDraw/handReconstruct',
  // 上传文件夹的地址
  FILEUPLOAD_URL = '/imageDraw/fileReconstruct',
  // 创建房间的地址
  CREATEROOM_URL = '/room/createRoom',
  // 离开房间的地址
  LEAVEROOM_URL = '/room/leaveRoom',
  // 获取房间列表的地址
  GETROOM_URL = '/room/getRoomList',
  // 进入房间的地址
  ENTERROOM_URL = '/room/enterRoom',
  // 获取房间信息的地址
  GETROOMINFO_URL = '/room/getRoomInfo',
  // 上传操作记录的地址
  UPLOADOPERATION_URL = '/room/uploadOperation',
  // 获取操作记录的地址
  GETOPERATION_URL = '/room/getOperation',
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

// 创建房间的接口
export const reqCreateRoom = (data:any) =>{
  return request.post<any,getRoomResponseData>(API.CREATEROOM_URL,data, {
    headers:{"Content-Type":"application/json"},
    timeout:80000
  })
}

// 离开房间的接口
export const reqLeaveRoom = (data:any) =>{
  return request.post<any,ResponseData>(API.LEAVEROOM_URL,data,{
    headers:{"Content-Type":"application/json"},
    timeout:80000
  })
}

// 获取房间信息
export const reqGetRoomInfo = (userId:String) => request.get<any,roomResponseData>(API.GETROOMINFO_URL + `?userId=${userId}`);

// 获取房间列表的接口
export const reqGetRoom = (roomName:String) => request.get<any,ResponseData>(API.GETROOM_URL + `?roomName=${roomName}`);

// 进入房间列表的接口
export const reqEnterRoom = (data:any) =>{
  return request.post<any,ResponseData>(API.ENTERROOM_URL,data,{
    headers:{"Content-Type":"application/json"},
    timeout:80000
  })
}

// 上传操作记录的接口
export const reqUploadOperation = (data:any) =>{
  return request.post<any,ResponseData>(API.UPLOADOPERATION_URL,data,{
    headers:{"Content-Type":"application/json"},
    timeout:50000
  })
}

// 获取房间操作记录的接口
export const reqGetOperation = (userId:String, roomId:String) => request.get<any,getRoomOperationResponseData>(API.GETOPERATION_URL + `?userId=${userId}&roomId=${roomId}`);


