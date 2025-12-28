// 文件上传相关的类型
// 返回的统一数据
export interface ResponseData {
    code: number,
    message: string,
}

// 手绘图片重构的返回数据
export interface handDrawResponseData extends ResponseData {
    data: {
        model: string,
    }
}

export interface imageDraw {
    id: number,
    imageName: string,
    imageUrl:string,
    modelUrl:string
}

// 图像重构的返回数据
export interface imageDrawResponseData extends ResponseData {
    data: imageDraw[]
}

export interface roomResponseData {
    roomId : string,
    roomName : string,
    isPublic : boolean,
    users : string[],
    maxUser : number,
    isOwner : boolean
}

// 房间创建的返回数据
export interface createRoomResponseData extends ResponseData {
    data: string
}

// 获取房间列表的返回数据
export interface getRoomResponseData extends ResponseData {
    data: roomResponseData[]
}

export interface operation {
    lineWidth: number,
    type: string,
    opearteTime: string,
    points: string
}

// 获取房间操作信息的返回数据
export interface getRoomOperationResponseData extends ResponseData {
    data: operation[]
}
