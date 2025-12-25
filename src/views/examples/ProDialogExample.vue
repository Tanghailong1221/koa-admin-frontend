<template>
  <div class="pro-dialog-example">
    <el-card class="example-card">
      <template #header>
        <div class="card-header">
          <span>ProDialog 弹窗组件示例</span>
        </div>
      </template>

      <el-space wrap>
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
        <el-button type="success" @click="handleEdit">编辑用户</el-button>
        <el-button type="info" @click="handleView">查看用户</el-button>
        <el-button @click="handleCustom">自定义内容</el-button>
      </el-space>

      <el-divider />

      <h4>功能特性：</h4>
      <ul class="feature-list">
        <li>支持新增、编辑、查看三种模式，自动切换标题和表单状态</li>
        <li>内置 ProForm 表单组件，支持所有表单字段类型</li>
        <li>不同模式显示不同的图标和颜色主题</li>
        <li>支持拖拽移动、表单重置功能</li>
        <li>支持自定义内容插槽</li>
        <li>支持表单验证、加载状态</li>
        <li>支持多种尺寸预设（small/default/large/xlarge）</li>
        <li>查看模式下表单自动禁用，背景高亮显示</li>
        <li>完整的 TypeScript 类型支持</li>
      </ul>
    </el-card>

    <!-- 用户表单弹窗 -->
    <ProDialog
      ref="userDialogRef"
      :title="{ add: '新增用户', edit: '编辑用户', view: '查看用户详情' }"
      :fields="userFields"
      :dialog-config="dialogConfig"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- 自定义内容弹窗 -->
    <ProDialog
      ref="customDialogRef"
      title="自定义内容弹窗"
      :use-form="false"
      :dialog-config="{ size: 'large', showConfirm: false }"
      @cancel="() => customDialogRef?.close()"
    >
      <template #default="{ mode, data }">
        <div class="custom-content">
          <el-result icon="success" title="自定义内容区域" sub-title="你可以在这里放置任何自定义内容">
            <template #extra>
              <p>当前模式: {{ mode }}</p>
              <p>传入数据: {{ JSON.stringify(data) }}</p>
            </template>
          </el-result>
        </div>
      </template>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ProDialog } from '@/components/pro'
import type { ProDialogInstance, ProDialogConfig, ProFormField } from '@/components/pro'
import { FormFieldType, DialogMode } from '@/components/pro'

// 弹窗引用
const userDialogRef = ref<ProDialogInstance>()
const customDialogRef = ref<ProDialogInstance>()

// 用户表单字段配置
const userFields: ProFormField[] = [
  {
    name: 'username',
    label: '用户名',
    type: FormFieldType.INPUT,
    required: true,
    placeholder: '请输入用户名',
    span: 12,
  },
  {
    name: 'nickname',
    label: '昵称',
    type: FormFieldType.INPUT,
    placeholder: '请输入昵称',
    span: 12,
  },
  {
    name: 'email',
    label: '邮箱',
    type: FormFieldType.INPUT,
    required: true,
    placeholder: '请输入邮箱',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    span: 12,
  },
  {
    name: 'phone',
    label: '手机号',
    type: FormFieldType.INPUT,
    placeholder: '请输入手机号',
    span: 12,
  },
  {
    name: 'gender',
    label: '性别',
    type: FormFieldType.SELECT,
    placeholder: '请选择性别',
    span: 12,
    fieldProps: {
      options: [
        { label: '男', value: 1 },
        { label: '女', value: 2 },
        { label: '保密', value: 0 },
      ],
    },
  },
  {
    name: 'status',
    label: '状态',
    type: FormFieldType.SWITCH,
    defaultValue: true,
    span: 12,
    fieldProps: {
      activeText: '启用',
      inactiveText: '禁用',
    },
  },
  {
    name: 'birthday',
    label: '生日',
    type: FormFieldType.DATE,
    placeholder: '请选择生日',
    span: 12,
  },
  {
    name: 'roleId',
    label: '角色',
    type: FormFieldType.SELECT,
    required: true,
    placeholder: '请选择角色',
    span: 12,
    fieldProps: {
      options: [
        { label: '超级管理员', value: 1 },
        { label: '普通用户', value: 2 },
        { label: '访客', value: 3 },
      ],
    },
  },
  {
    name: 'remark',
    label: '备注',
    type: FormFieldType.TEXTAREA,
    placeholder: '请输入备注信息',
    span: 24,
    fieldProps: {
      rows: 3,
      maxlength: 200,
      showWordLimit: true,
    },
  },
]

// 弹窗配置
const dialogConfig: ProDialogConfig = {
  size: 'large',
  draggable: true,
  showReset: true,
}

// 模拟用户数据
const mockUserData = {
  id: 1,
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  gender: 1,
  status: true,
  birthday: '1990-01-01',
  roleId: 1,
  remark: '这是一个管理员账号',
}

// 新增
const handleAdd = () => {
  userDialogRef.value?.open(DialogMode.ADD)
}

// 编辑
const handleEdit = () => {
  userDialogRef.value?.open(DialogMode.EDIT, mockUserData)
}

// 查看
const handleView = () => {
  userDialogRef.value?.open(DialogMode.VIEW, mockUserData)
}

// 自定义内容
const handleCustom = () => {
  customDialogRef.value?.open(DialogMode.CUSTOM, { message: 'Hello ProDialog!' })
}

// 确认
const handleConfirm = async (data: any) => {
  console.log('提交数据:', data)
  
  // 模拟提交
  userDialogRef.value?.setConfirmLoading(true)
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  userDialogRef.value?.setConfirmLoading(false)
  userDialogRef.value?.close()
  
  ElMessage.success('操作成功')
}

// 取消
const handleCancel = () => {
  console.log('取消操作')
}
</script>

<style scoped>
.pro-dialog-example {
  padding: 20px;
}

.example-card {
  max-width: 800px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.feature-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  color: var(--el-text-color-secondary);
}

.feature-list li {
  margin-bottom: 4px;
}

.custom-content {
  padding: 20px;
  text-align: center;
}
</style>
