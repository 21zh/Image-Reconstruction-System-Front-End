// 与帖子信息相关的ts类型
// 返回的统一数据
export interface ResponseData{
    code:number,
    message:string,
}

// 帖子的ts类型
export interface Forum{
  id?: number,
  typeId:number,
  userId?:number,
  title:string,
  image:string,
  model:string,
  likes?:number,
  downloads?:number,
  createTime?:string,
  updateTime?:string
}

// 帖子包含用户部分信息
export interface forumDto extends Forum{
  userName:string,
  avatar:string,
  motto:string,
  ilike:boolean
}

// 帖子集合
export type ForumDtoList = forumDto[];

// 获取类型帖子接口返回的ts类型
export interface ForumResponseData extends ResponseData{
    data:ForumDtoList
}