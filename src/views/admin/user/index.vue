<template>
  <el-card style="position: sticky; top: 0; z-index: 1000; margin-bottom: 20px;">
    <el-input placeholder="请输入用户名称" :prefix-icon="User"></el-input>
  </el-card>
  <el-card>
    <el-button type="primary" size="default" :icon="Plus" style="margin-bottom: 10px;">添加用户</el-button>
    <el-table border :data="data" style="margin-bottom: 10px;">
      <el-table-column type="index" label="序号" align="center" width="80px"></el-table-column>
      <el-table-column prop="name" label="用户名" align="center"></el-table-column>
      <el-table-column prop="role" label="角色" align="center">
        <template #="{ row, $index }">
          <el-tag v-if="row.roleId === 0" type="danger">管理员</el-tag>
          <el-tag v-else type="success">普通用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间" align="center"></el-table-column>
      <el-table-column label="操作" align="center" width="480px">
        <template #="{ row, $index }">
          <el-button type="primary" size="small" :icon="Stamp">{{ row.roleId ? '授权' : '夺权' }}</el-button>
          <el-button type="primary" size="small" :icon="View" @click="showUser(row)">查看</el-button>
          <el-button type="primary" size="small" :icon="Edit" @click="editUser(row)">编辑</el-button>
          <el-button type="primary" size="small" :icon="Delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[10, 15, 20, 25]"
      :size="default" :background="true" layout="prev, pager, next, jumper,->, sizes ,total" :total="total" />
  </el-card>
  <el-dialog v-model="userDialogVisible" :title="userParams.id ? '修改用户' : '添加用户'" align-center>
    <el-form label-width="80px" :rules="rules" :model="userParams">
      <el-form-item label="用户名" prop="username">
        <el-input placeholder="请你输入用户名" v-model="userParams.username"
          :disabled="userParams.id ? true : false"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input placeholder="请你输入密码" v-model="userParams.password"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input placeholder="请你输入手机号" v-model="userParams.phone"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="userInfoDialogVisible" title="用户信息" width="700" align-center>
    <el-descriptions border style="text-align: center;">
      <el-descriptions-item :rowspan="2" :width="100" label="头像" align="center" style="justify-content: center;">
        <el-image style="width: 100px; height: 100px; display: block; margin: 0 auto;"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
      </el-descriptions-item>
      <el-descriptions-item label="用户名" style="text-align: center;">
        kooriookami
      </el-descriptions-item>
      <el-descriptions-item label="密码" style="text-align: center;">
        18100000000
      </el-descriptions-item>
      <el-descriptions-item label="角色" style="text-align: center;">
        <el-tag size="small">School</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="电话号码" style="text-align: center;">
        <el-tag size="small">School</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="个性签名" style="text-align: center;">
        No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { User, Plus, Delete, Edit, Stamp, View } from '@element-plus/icons-vue';
import { id } from 'element-plus/es/locales.mjs';
import { ref } from 'vue';

// 用户表单数据
let userParams = ref({
  id: 0,
  username: '',
  password: '',
  phone: '',
  role: '',
  roleId: 0,
});

// 虚拟数据
let data = [
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
];

// 当前页码
let pageNo = ref(1);
// 每页条数
let pageSize = ref(10);
// 总数
let total = ref(10);

// 控制对话框是否显示
let userDialogVisible = ref(false);
// 控制用户信息对话框的显示
let userInfoDialogVisible = ref(false);

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

// 编辑按钮的回调
const editUser = (row) => {
  // 显示对话框
  userDialogVisible.value = true;
}

// 展示用户信息的按钮回调
const showUser = (row) => {
  // 显示用户信息
  userInfoDialogVisible.value = true;
}
</script>

<style lang="scss" scoped></style>
