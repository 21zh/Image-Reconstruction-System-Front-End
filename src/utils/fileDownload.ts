// 文件下载的方法
import { ElMessage } from 'element-plus';
export const fileDownload = async (image: string, model: string) => {
    // 发请求下载图像和模型
    try {
        const imageResponse = await fetch(image);
        const modelResponse = await fetch(model);

        if (!imageResponse.ok || !modelResponse.ok) {
            ElMessage.error("下载失败");
        }

        // 获取文件的blob数据
        const imageBlob = await imageResponse.blob();
        const modelBlob = await modelResponse.blob();

        // 创建url分别指向文件
        const imageLink = document.createElement('a');
        const modelLink = document.createElement('a');

        imageLink.href = URL.createObjectURL(imageBlob);
        modelLink.href = URL.createObjectURL(modelBlob);
        imageLink.download = 'image.png';
        modelLink.download = 'model.binvox';

        // 触发点击事件
        imageLink.click();
        modelLink.click();

        // 释放blob的url
        URL.revokeObjectURL(imageLink.href);
        URL.revokeObjectURL(modelLink.href);
    } catch (error) {
        ElMessage.error("下载失败");
    }
}