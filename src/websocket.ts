import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import router from '@/router';
import { ElMessage } from 'element-plus';

let stompClient = null;

export function connectWebsocket(userId : string) { 
    if (!stompClient) {
        // 配置websocket端点
        const socket = new SockJS(`${import.meta.env.VITE_SERVE}/ws?userId=${encodeURIComponent(userId)}`);
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe('/user/queue/reconstruct/handNotice', (reconstructMap : any) => {
              // 解析对象
              let updateReconstruct = JSON.parse(reconstructMap.body);
              // 获取图像路径
              let imagePaths = updateReconstruct.imagePath;
              // 获取模型路径
              let modelPaths = updateReconstruct.modelPath;

              router.push({
                path: '/modelDraw/handDraw',
                query: {
                  imagePaths: imagePaths,
                  modelPaths: modelPaths,
                },
              }).then(() => {
                // 跳转成功后执行
                ElMessage.success('三维重建完毕');
              });
            });
            stompClient.subscribe('/user/queue/reconstruct/imageNotice', (reconstructMap: any) => {
              // 解析对象
              let updateReconstruct = JSON.parse(reconstructMap.body);
              // 获取图像路径
              let imagePaths = updateReconstruct.imagePath;
              // 获取模型路径
              let modelPaths = updateReconstruct.modelPath;
              // 获取图像名称
              let imageName = updateReconstruct.imageName;

              router.push({
                path: '/modelDraw/imageDraw',
                query: {
                  updateReconstruct: JSON.stringify(updateReconstruct)
                },
              }).then(() => {
                // 跳转成功后执行
                ElMessage.success('三维重建完毕');
              })
            })
          });
    }
    return stompClient;
}
