import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import router from '@/router';

let stompClient = null;

export function connectWebsocket(userId : string) { 
    if (!stompClient) {
        // 配置websocket端点
        const socket = new SockJS(`${import.meta.env.VITE_SERVE}/ws?userId=${encodeURIComponent(userId)}`);
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe('/user/queue/reconstruct/handNotice', (reconstructMap) => {
              // 解析对象
              let updateReconstruct = JSON.parse(reconstructMap.body);
              // 获取图像路径
              let imagePaths = updateReconstruct.imagePath;
              // 获取模型路径
              let modelPaths = updateReconstruct.modelPath;

              console.log(imagePaths);
              console.log(modelPaths);

              router.push({
                path: '/modelDraw/handDraw',
                query: {
                  imagePaths: imagePaths,
                  modelPaths: modelPaths,
                },
              });
            });
          });
    }
    return stompClient;
}
