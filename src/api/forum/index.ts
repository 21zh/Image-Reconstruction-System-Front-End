// 与帖子相关的请求接口
import request from '@/utils/request';
import type { Forum, ForumResponseData, UserForumResponseData, CommentResponseData, ResponseData } from './type';

enum API{
    // 获取相关类型下的帖子列表
    GETTYPEFORUM_URL = '/forum/getTypeForum',
    // 上传帖子的地址
    UPLOADFORUM_URL = '/forum/uploadForum',
    // 获取用户帖子信息的地址
    GETUSERFORUM_URL = '/forum/getUserForum', 
    // 获取帖子评论信息的地址
    GETFORUMCOMMENT_URL = '/forum/getForumComment',
    // 发表帖子评论的地址
    POSTFORUMCOMMENT_URL = '/forum/postForumComment',
}

// 获取相关类型下的帖子列表的接口
export const reqGetTypeForum = (typeId: number,keyWord:string,userName:string) => request.get<any, ForumResponseData>(API.GETTYPEFORUM_URL + `/${typeId}?keyWord=${keyWord}&userName=${userName}`);

// 上传帖子的接口
export const reqUploadForum = (data:Forum,userName:string) => request.post<any,any>(API.UPLOADFORUM_URL + `?userName=${userName}`,data);

// 获取用户帖子的接口
export const reqGetUserForum = (userId:number,userName:string) => request.get<any,UserForumResponseData>(API.GETUSERFORUM_URL + `/${userId}?userName=${userName}`);

// 获取帖子评论信息的接口
export const reqGetForumComment = (forumId:number) => request.get<any,CommentResponseData>(API.GETFORUMCOMMENT_URL + `/${forumId}`);

// 发表帖子评论的接口
export const reqPostForumComment = (data:any) => request.post<any,ResponseData>(API.POSTFORUMCOMMENT_URL,data);