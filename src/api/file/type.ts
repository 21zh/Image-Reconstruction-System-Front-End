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
