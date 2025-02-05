<template>
  <div class="login_container">
    <el-form class="login_form" :rules="rules" :model="loginForm" ref="loginForms">
      <h1>图像重构三维模型</h1>
      <el-form-item prop="username">
        <el-input placeholder="请输入用户名" :prefix-icon="User" v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" placeholder="请输入密码" :prefix-icon="Key" show-password
          v-model="loginForm.password"></el-input>
      </el-form-item>
      <el-button class="login_btn" type="primary" size="default" :loading="isLoading"
        :disabled="loginForm.username == '' || loginForm.password == ''" @click="login">
        登录
      </el-button>
    </el-form>
    <!-- 绑定手机的对话框 -->
    <el-dialog v-model="centerDialogVisible" title="手机号码绑定" width="500" align-center>
      <el-form :model="phoneForm" :rules="rules" ref="phoneForms">
        <el-form-item prop="phone">
          <el-input placeholder="请输入手机号码" :prefix-icon="Iphone" v-model="phoneForm.phone"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="请输入验证码" :prefix-icon="Key" style="width: 350px; margin-right: 10px"
            v-model="phoneForm.code"></el-input>
          <el-button type="success" size="default" @click="sendCode" :disabled="isSendCodeButtonDisabled">
            {{ buttonText }}
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addPhone" :disabled="phoneForm.phone == '' || phoneForm.code == ''">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 引入所有的图标
import { User, Key, View, Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

// 收集用户名和密码
let loginForm = reactive({
  username: 'admin',
  password: 'Aa123456.0',
})

// 收集手机号码和验证码
let phoneForm = reactive({
  phone: '19830906871',
  code: '',
})

// 按钮的加载状态
let isLoading = ref(false)
// 控制对话框是否显示
let centerDialogVisible = ref(false)

// 定义登录的表单对象
let loginForms = ref()
// 定义手机的表单对象
let phoneForms = ref()

// 控制发送验证码按钮是否禁用
let isSendCodeButtonDisabled = ref(false)
// 倒计时秒数
let countdownSeconds = ref(60)
// 按钮文本内容
let buttonText = ref('发送验证码')
// 用户名称校验
const validatorUserName = (rule, value, callback) => {
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
  username: [{ required: true, trigger: 'blur', validator: validatorUserName }],
  password: [{ required: true, trigger: 'blur', validator: validatorPassword }],
  phone: [{ required: true, trigger: 'blur', validator: validatorPhone }],
}

// 发送验证码
const sendCode = () => {
  // 表单校验
  phoneForms.value.validate((valid) => {
    if (valid) {
      // 发送请求

      // 禁用发送验证码的按钮
      isSendCodeButtonDisabled.value = true
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
      }, 1000)
    }
  })
  // 发送请求
}

// 登录按钮回调
const login = () => {
  // 表单校验
  loginForms.value.validate((valid) => {
    // 表单校验通过
    if (valid) {
      // 发送请求
      // 显示加载状态
      isLoading.value = true
      // 显示对话框
      centerDialogVisible.value = true
    }
  })
}

// 确认按钮的回调
const addPhone = () => {
  phoneForms.value.validate((valid) => {
    // 表单校验通过
    if (valid) {
      // 发送请求
      // 关闭对话框
      centerDialogVisible.value = false
    }
  })
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
</style>
