// 与类型接口相关的数据ts类型

// 返回的统一数据
export interface ResponseData{
    code:number,
    message:string,
}

// 类型的ts
export interface Type {
  id: number
  typeName:string,
  iconUrl:string,
  createTime:string,
  updateTime?:string
}

//获取所有的类型接口返回的数据类型
export interface TypeResponseData extends ResponseData{
    data:Type[]
}