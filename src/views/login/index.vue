<template>
  <div class="login_container">
    <el-form class="login_form" :rules="rules" :model="loginForm" ref="loginForms">
      <h1>图像重构三维模型</h1>
      <el-form-item prop="userName">
        <el-input placeholder="请输入用户名" :prefix-icon="User" v-model="loginForm.userName"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" placeholder="请输入密码" :prefix-icon="Key" show-password
          v-model="loginForm.password"></el-input>
      </el-form-item>
      <el-button class="login_btn" type="primary" size="default" :loading="isLoading"
        :disabled="loginForm.userName == '' || loginForm.password == ''" @click="login">
        登录
      </el-button>
    </el-form>
    <!-- 绑定信息的对话框 -->
    <el-dialog v-model="centerDialogVisible" title="用户信息绑定" width="500" align-center>
      <el-form :model="userInfoForm" :rules="rules" ref="userInfoForms">
        <el-form-item prop="avatar" label="头像">
          <el-upload class="avatar-uploader" action="/api/avatar/upload" :show-file-list="false"
            :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess">
            <img v-if="userInfoForm.avatar" :src="userInfoForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input placeholder="请输入手机号码" :prefix-icon="Iphone" v-model="userInfoForm.phone"></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input placeholder="请输入验证码" :prefix-icon="Key" style="width: 350px; margin-right: 10px"
            v-model="userInfoForm.code"></el-input>
          <el-button type="success" size="default" @click="sendCode" :disabled="isSendCodeButtonDisabled">
            {{ buttonText }}
          </el-button>
        </el-form-item>
        <el-form-item prop="motto">
          <el-input placeholder="请输入个性签名" :prefix-icon="Flag" v-model="userInfoForm.motto"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="registerUser" :loading="isRegister"
            :disabled="userInfoForm.phone == '' || userInfoForm.code == '' || userInfoForm.avatar == '' || userInfoForm.motto == ''">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 引入所有的图标
import { User, Key, View, Iphone, Flag } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { nextTick, reactive, ref } from 'vue';
import userStores from '@/store/modules/user';
import { useRouter } from 'vue-router';
import { reqSendCode } from '../../api/user';

// 获取用户仓库
let userStore = userStores();

// 收集用户名和密码
let loginForm = reactive({
  userName: '',
  password: ''
});

// 收集手机号码和验证码
let userInfoForm = reactive({
  phone: '',
  code: '',
  avatar: '',
  motto: ''
})

// 按钮的加载状态
let isLoading = ref(false);
let isRegister = ref(false);
// 控制对话框是否显示
let centerDialogVisible = ref(false);

// 定义登录的表单对象
let loginForms = ref();
// 定义手机的表单对象
let userInfoForms = ref();

// 控制发送验证码按钮是否禁用
let isSendCodeButtonDisabled = ref(false);
// 倒计时秒数
let countdownSeconds = ref(60);
// 按钮文本内容
let buttonText = ref('发送验证码');

// 获取路由对象
let $router = useRouter();
// 用户名称校验
const validatoruserName = (rule, value, callback) => {
  if (value.trim().length < 5) {
    // 用户名长度不能小于5
    callback(new Error('用户名长度不能小于5位'))
  } else {
    callback()
  }
}

// 密码校验
const validatorPassword = (rule, value, callback) => {
  if (value.trim().length <= 8) {
    // 密码长度不能小于8
    callback(new Error('密码长度不能小于8位'))
  } else if (
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{1,}$/.test(
      value,
    )
  ) {
    callback()
  } else {
    callback(new Error('密码必须包含字母、数字和特殊字符'))
  }
}

// 手机号码校验
const validatorPhone = (rule, value, callback) => {
  if (/^1[3-9]\d{9}$/.test(value)) {
    callback()
  } else {
    callback(new Error('手机号码格式不正确'))
  }
}

// 定义表单校验规则
const rules = {
  userName: [{ required: true, trigger: 'blur', validator: validatoruserName }],
  password: [{ required: true, trigger: 'blur', validator: validatorPassword }],
  phone: [{ required: true, trigger: 'blur', validator: validatorPhone }],
  code: [{ required: true, trigger: 'blur', min: 6, max: 6, message: '验证码长度为6位' }],
  avatar: [{ required: true, trigger: 'blur', message: '请上传头像' }],
  motto: [{ required: true, trigger: 'blur', min: 5, max: 100, message: '请输入5-100字数的个性签名' }]
}

// 发送验证码
const sendCode = () => {
  // 表单校验
  userInfoForms.value.validateField('phone', async (valid) => {
    if (valid) {
      // 校验成功，请求发送验证码
      let result = await reqSendCode(userInfoForm.phone);
      // 禁用发送验证码的按钮
      isSendCodeButtonDisabled.value = true;
      // 开始倒计时
      let timer = setInterval(() => {
        countdownSeconds.value--
        buttonText.value = `${countdownSeconds.value}秒后重试`
        if (countdownSeconds.value <= 0) {
          // 停止倒计时
          clearInterval(timer)
          // 重置秒数
          countdownSeconds.value = 60
          // 恢复发送验证码的按钮
          isSendCodeButtonDisabled.value = false
          // 按钮文本恢复
          buttonText.value = '发送验证码'
        }
      }, 1000);
      // 成功
      if (result.code == 200) {
        ElMessage.success('验证码发送成功');
      } else if (result.code == 412) {
        ElMessage.error(result.message);
      } else {
        ElMessage.error('验证码发送失败');
      }
    }
  })
}

// 登录按钮回调
const login = () => {
  // 表单校验
  loginForms.value.validate(async (valid) => {
    // 显示加载状态
    isLoading.value = true;
    // 表单校验通过
    if (valid) {
      // 发送请求
      let result = await userStore.userLogin(loginForm);
      if (result == 200) {
        ElMessage.success('登录成功');
        $router.push('/');
      } else if (result == 802) {
        ElMessage.error('用户名或密码错误');
      } else {
        ElMessage.success('注册成功，请完善个人信息');
        // 显示对话框
        centerDialogVisible.value = true;
        nextTick(() => {
          // 清除表单信息
          userInfoForms.value?.resetFields();
        });

      }
    }
    isLoading.value = false;
  })
}

// 确认按钮的回调
const registerUser = () => {
  userInfoForms.value.validate(async (valid) => {
    // 加载状态
    isRegister.value = true;
    // 表单校验通过
    if (valid) {
      // 将用户信息进行合并
      let userInfo = Object.assign(loginForm, userInfoForm);
      // 发送请求
      let result = await userStore.userRegister(userInfo);
      console.log(result);
      if (result == 200) {
        // 关闭对话框
        centerDialogVisible.value = false;
        ElMessage.success('注册成功');
        // 路由跳转
        $router.push('/');
      } else {
        ElMessage.error('信息错误，注册失败');
      }
      isRegister.value = false;
    }
  })
}

// 头像上传前的检查
const beforeAvatarUpload = (file) => {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
    ElMessage.error('上传头像图片只能是 JPG/PNG/GIF 格式!');
  } else if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }
  return true;
}

// 上传后的回调
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    userInfoForm.avatar = response.data;
    ElMessage.success('上传头像成功!');
  } else {
    ElMessage.error('上传头像失败!');
  }
}
</script>

<style lang="scss" scoped>
.login_container {
  display: flex;
  width: 100%;
  height: 100vh;
  background: url('@/assets/images/loginbg.gif') no-repeat;
  background-size: cover;
  justify-content: center;
  align-items: center;
}

.login_form {
  display: flex;
  flex-direction: column;
  width: 30%;
  background-size: cover;
  padding: 50px;

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: white;
    font-size: 40px;
  }

  .login_btn {
    width: 100%;
  }
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
  border-radius: 50%;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
