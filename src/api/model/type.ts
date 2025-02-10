// 模型数据相关的ts类型
// 返回的统一数据
export interface ResponseData{
    code:number,
    message:string,
}

// 模型数据相关的ts类型
export interface Model{
  id: number,
  typeId:number,
  image:string,
  model:string,
  createTime?:string,
  updateTime?:string
}

// 获取类型的模型的接口返回的类型
export interface ModelResponseData extends ResponseData{
    data:Model[]
}