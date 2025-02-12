// 文件下载的方法
import { ElMessage } from 'element-plus';
export const fileDownload = async (image: string, model: string) => {
    // 发请求下载图像和模型
    try {
        if (image != '') {
            const imageResponse = await fetch(image);
            if (!imageResponse.ok) {
                ElMessage.error("下载失败");
            }
            // 获取文件的blob数据
            const imageBlob = await imageResponse.blob();
            // 创建url分别指向文件
            const imageLink = document.createElement('a');
            imageLink.href = URL.createObjectURL(imageBlob);
            imageLink.download = 'image.png';
            // 触发点击事件
            imageLink.click();
            // 释放blob的url
            URL.revokeObjectURL(imageLink.href);
        }
        if (model != '') {
            const modelResponse = await fetch(model);
            if (!modelResponse.ok) {
                ElMessage.error("下载失败");
            }
            const modelBlob = await modelResponse.blob();
            const modelLink = document.createElement('a');
            modelLink.href = URL.createObjectURL(modelBlob);
            modelLink.download = 'model.binvox';
            modelLink.click();
            URL.revokeObjectURL(modelLink.href);
        }
    } catch (error) {
        ElMessage.error("下载失败");
    }
}