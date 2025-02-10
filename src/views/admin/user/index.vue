<template>
  <el-card style="position: sticky; top: 0; z-index: 1000; margin-bottom: 20px;">
    <el-input placeholder="请输入用户名称" :prefix-icon="User" v-model="keyWord" @blur="() => getUserInfo()"></el-input>
  </el-card>
  <el-card>
    <el-button type="primary" size="default" :icon="Plus" style="margin-bottom: 10px;" @click="addUser">添加用户</el-button>
    <el-table border :data="userInfo" style="margin-bottom: 10px;">
      <el-table-column type="index" label="序号" align="center" width="80px"></el-table-column>
      <el-table-column prop="userName" label="用户名" align="center"></el-table-column>
      <el-table-column prop="roleId" label="角色" align="center">
        <template #="{ row, $index }">
          <el-tag v-if="row.roleId === 0" type="danger">管理员</el-tag>
          <el-tag v-else type="success">普通用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template #="{ row, $index }">
          {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" align="center">
        <template #="{ row, $index }">
          {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="480px">
        <template #="{ row, $index }">
          <el-button :type="row.roleId ? 'primary' : 'danger'" size="small" :icon="Stamp" @click="changeRole(row)">{{
            row.roleId ? '授权' : '夺权'
          }}</el-button>
          <el-button type="primary" size="small" :icon="View" @click="showUser(row)">查看</el-button>
          <el-button type="primary" size="small" :icon="Edit" @click="editUser(row)">编辑</el-button>
          <el-popconfirm title="您确定要删除该用户吗?" width="200" @confirm="deleteUser(row)">
            <template #reference>
              <el-button type="primary" size="small" :icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[10, 15, 20, 25]"
      :size="default" :background="true" layout="prev, pager, next, jumper,->, sizes ,total" :total="total"
      @size-change="handler" @current-change="getUserInfo" />
  </el-card>
  <el-dialog v-model="userDialogVisible" :title="userForm.id ? '修改用户' : '添加用户'" align-center @close="resetForm">
    <el-form label-width="80px" :rules="rules" :model="userForm" ref="userForms">
      <el-form-item prop="avatar" label="头像">
        <el-upload class="avatar-uploader" action="/api/avatar/upload" :show-file-list="false"
          :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess">
          <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="用户名" prop="userName">
        <el-input placeholder="请你输入用户名" v-model="userForm.userName" :disabled="userForm.id ? true : false"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input placeholder="请你输入密码" v-model="userForm.password"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input placeholder="请你输入手机号" v-model="userForm.phone" :disabled="userForm.id ? true : false"></el-input>
      </el-form-item>
      <el-form-item prop="motto" label="个性签名">
        <el-input placeholder="请输入个性签名" :prefix-icon="Flag" v-model="userForm.motto"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addOrUpdateUser">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="userInfoDialogVisible" title="用户信息" width="800" align-center>
    <el-descriptions border style="text-align: center;">
      <el-descriptions-item :rowspan="2" :width="100" label="头像" align="center" style="justify-content: center;">
        <el-image style="width: 100px; height: 100px; display: block; margin: 0 auto;" :src=userParams.avatar />
      </el-descriptions-item>
      <el-descriptions-item label="用户名" style="text-align: center;">
        {{ userParams.userName }}
      </el-descriptions-item>
      <el-descriptions-item label="密码" style="text-align: center;">
        {{ userParams.password }}
      </el-descriptions-item>
      <el-descriptions-item label="角色" style="text-align: center;">
        <el-tag v-if="userParams.roleId === 0" type="danger">管理员</el-tag>
        <el-tag v-else type="success">普通用户</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="电话号码" style="text-align: center;">
        {{ userParams.phone }}
      </el-descriptions-item>
      <el-descriptions-item label="个性签名" style="text-align: center;">
        {{ userParams.motto }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { User, Plus, Delete, Edit, Stamp, View } from '@element-plus/icons-vue';
import { id } from 'element-plus/es/locales.mjs';
import { onMounted, reactive, ref, nextTick } from 'vue';
import { reqAddOrUpdateUser, reqChangeRole, reqDeleteUser, reqGetUserInfo } from '../../../api/admin';
import dayjs from "dayjs";
import { ElMessage } from 'element-plus';

// 用户信息描述数据
let userParams = ref({
  id: 0,
  userName: '',
  password: '',
  phone: '',
  roleId: 1,
  avatar: ''
});

// 用户表单数据
let userForm = reactive({
  id: 0,
  userName: '',
  password: '',
  phone: '',
  roleId: 1,
  avatar: '',
  motto: ''
});

// 表单对象
let userForms = ref();

// 用户数据
let userInfo = ref([]);

// 虚拟数据
/* let data = [
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  },
  {
    id: 2,
    name: '王五',
    role: '管理员',
    roleId: 1,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-0112:00:00',
  },
  {
    id: 1,
    name: '张三',
    role: '管理员',
    roleId: 0,
    createTime: '2023-05-01 12:00:00',
    updateTime: '2023-05-01 12:00:00',
  }
]; */

// 当前页码
let pageNo = ref(1);
// 每页条数
let pageSize = ref(10);
// 总数
let total = ref(0);
// 关键词
let keyWord = ref('');

// 控制对话框是否显示
let userDialogVisible = ref(false);
// 控制用户信息对话框的显示
let userInfoDialogVisible = ref(false);

// 挂载成功进行分页查询
onMounted(() => {
  getUserInfo();
});

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
  avatar: [{ required: true, trigger: 'blur', message: '请上传头像' }],
  motto: [{ required: true, trigger: 'blur', min: 5, max: 100, message: '请输入5-100字数的个性签名' }]
}

// 分页获取用户信息的逻辑
const getUserInfo = async (pager = 1) => {
  pageNo.value = pager;
  // 发请求
  let result = await reqGetUserInfo(pageNo.value, pageSize.value, keyWord.value);
  if (result.code == 200) {
    // 获取用户信息
    userInfo.value = result.data.userList;
    // 获取用户总数
    total.value = result.data.total;
  }
}

// 分页器下拉的回调
const handler = () => {
  getUserInfo();
}

// 编辑按钮的回调
const editUser = (row) => {
  // 显示对话框
  userDialogVisible.value = true;
  // 将row数据赋值给表单对象
  Object.assign(userForm, row);
}

// 展示用户信息的按钮回调
const showUser = (row) => {
  // 显示用户信息
  userInfoDialogVisible.value = true;
  // 将数据赋值给用户信息对话框
  Object.assign(userParams.value, row);
}

// 改变用户角色的回调
const changeRole = async (row) => {
  // 发送请求
  let result = await reqChangeRole(row.id);
  // 判断是否成功
  if (result.code == 200) {
    // 成功则查询查询用户信息
    getUserInfo(pageNo.value);
    ElMessage({
      type: 'success',
      message: result.message,
    });
  }

}

// 添加或者修改用户的回调
const addOrUpdateUser = async () => {
  // 表单校验成功后发送请求
  userForms.value.validate(async (valid) => {
    // 表单校验通过
    if (valid) {
      // 发送请求
      let result = await reqAddOrUpdateUser(userForm);
      // 请求成功
      if (result.code == 200) {
        ElMessage.success(userForm.id ? '修改成功' : '添加成功');
        getUserInfo(userForm.id ? pageNo.value:1);
      } else {
        ElMessage.error(result.message);
      }
      // 更新成功，关闭对话框和重新获取数据
      userDialogVisible.value = false;
    }
  })
}

// 头像上传前的检查
const beforeAvatarUpload = (file) => {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
    ElMessage.error('上传头像图片只能是 JPG/PNG/GIF 格式!');
    return false;
  } else if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
}

// 上传后的回调
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    userForm.avatar = response.data;
    ElMessage.success('上传头像成功!');
  } else {
    ElMessage.error('上传头像失败!');
  }
}

// 添加用户按钮的回调
const addUser = () => {
  // 显示对话框
  userDialogVisible.value = true;
}

// 重置表单
const resetForm = () =>{
  userForms.value.resetFields();
}

// 删除用户的接口回调
const deleteUser = async(row) =>{
  // 发请求
  let result = await reqDeleteUser(row.id);
  if(result.code == 200){
    ElMessage.success('删除用户成功');
    // 删除成功重新查询
    getUserInfo(userInfo.value.length > 1?pageNo.value:pageNo.value - 1);
  }else{
    ElMessage.error('删除用户失败');
  }
}
</script>

<style lang="scss" scoped>
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
