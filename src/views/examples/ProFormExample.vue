<template>
  <div class="pro-form-example">
    <el-card header="ProForm 示例">
      <ProForm
        ref="formRef"
        v-model="formData"
        :fields="fields"
        :config="formConfig"
        @submit="handleSubmit"
        @reset="handleReset"
        @field-change="handleFieldChange"
      >
        <!-- 自定义字段插槽 -->
        <template #avatar="{ value }">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
          >
            <img v-if="value" :src="value" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </template>

        <!-- 自定义操作按钮 -->
        <template #actions>
          <el-button @click="handlePreview">预览数据</el-button>
        </template>
      </ProForm>
    </el-card>

    <!-- 数据预览对话框 -->
    <el-dialog
      v-model="showPreview"
      title="表单数据预览"
      width="600px"
    >
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ProForm, FormFieldType } from '@/components/pro'
import type {
  ProFormField,
  ProFormConfig,
  ProFormInstance
} from '@/components/pro'

/**
 * 表单数据接口
 */
interface UserForm {
  username: string
  password: string
  email: string
  phone: string
  gender: number
  age: number
  birthday: string
  hobbies: string[]
  province: string
  city: string
  address: string
  description: string
  status: number
  enabled: boolean
  avatar: string
  type: string
  companyName: string
}

// Refs
const formRef = ref<ProFormInstance<UserForm>>()
const showPreview = ref(false)

// 表单数据
const formData = ref<UserForm>({
  username: '',
  password: '',
  email: '',
  phone: '',
  gender: 1,
  age: 0,
  birthday: '',
  hobbies: [],
  province: '',
  city: '',
  address: '',
  description: '',
  status: 1,
  enabled: true,
  avatar: '',
  type: 'personal',
  companyName: ''
})

// 省份和城市数据
const provinces = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广东', value: 'guangdong' }
]

const citiesMap: Record<string, any[]> = {
  beijing: [{ label: '北京市', value: 'beijing' }],
  shanghai: [{ label: '上海市', value: 'shanghai' }],
  guangdong: [
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' }
  ]
}

const cities = ref<any[]>([])

// 表单配置
const formConfig: ProFormConfig = {
  layout: 'horizontal',
  labelWidth: '120px',
  gutter: 20,
  showReset: true,
  showCancel: false,
  submitText: '提交',
  resetText: '重置'
}

// 表单字段配置
const fields: ProFormField<UserForm>[] = [
  {
    name: 'type',
    label: '用户类型',
    type: FormFieldType.RADIO,
    defaultValue: 'personal',
    span: 24,
    fieldProps: {
      options: [
        { label: '个人用户', value: 'personal' },
        { label: '企业用户', value: 'company' }
      ]
    }
  },
  {
    name: 'username',
    label: '用户名',
    type: FormFieldType.INPUT,
    required: true,
    span: 12,
    placeholder: '请输入用户名',
    tooltip: '用户名长度为 3-20 个字符',
    rules: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    fieldProps: {
      maxlength: 20,
      showWordLimit: true
    }
  },
  {
    name: 'password',
    label: '密码',
    type: FormFieldType.INPUT,
    required: true,
    span: 12,
    placeholder: '请输入密码',
    tooltip: '密码长度至少 8 位',
    extra: '建议使用强密码以保护账户安全',
    rules: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, message: '密码长度至少 8 位', trigger: 'blur' }
    ],
    fieldProps: {
      type: 'password',
      showPassword: true
    }
  },
  {
    name: 'companyName',
    label: '公司名称',
    type: FormFieldType.INPUT,
    span: 12,
    placeholder: '请输入公司名称',
    dependencies: [
      {
        field: 'type',
        value: 'company',
        operator: 'eq'
      }
    ]
  },
  {
    name: 'email',
    label: '邮箱',
    type: FormFieldType.INPUT,
    required: true,
    span: 12,
    placeholder: '请输入邮箱',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  },
  {
    name: 'phone',
    label: '手机号',
    type: FormFieldType.INPUT,
    span: 12,
    placeholder: '请输入手机号',
    rules: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号',
        trigger: 'blur'
      }
    ]
  },
  {
    name: 'gender',
    label: '性别',
    type: FormFieldType.RADIO,
    defaultValue: 1,
    span: 12,
    fieldProps: {
      options: [
        { label: '男', value: 1 },
        { label: '女', value: 2 }
      ]
    }
  },
  {
    name: 'age',
    label: '年龄',
    type: FormFieldType.NUMBER,
    span: 12,
    fieldProps: {
      min: 0,
      max: 150,
      step: 1
    }
  },
  {
    name: 'birthday',
    label: '生日',
    type: FormFieldType.DATE,
    span: 12,
    placeholder: '请选择生日',
    fieldProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    }
  },
  {
    name: 'hobbies',
    label: '爱好',
    type: FormFieldType.CHECKBOX,
    defaultValue: [],
    span: 12,
    fieldProps: {
      options: [
        { label: '读书', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅游', value: 'travel' }
      ]
    }
  },
  {
    name: 'province',
    label: '省份',
    type: FormFieldType.SELECT,
    span: 12,
    placeholder: '请选择省份',
    fieldProps: {
      options: provinces
    },
    onChange: (value: string) => {
      // 省份变化时，重置城市并加载对应城市列表
      formData.value.city = ''
      cities.value = citiesMap[value] || []
    }
  },
  {
    name: 'city',
    label: '城市',
    type: FormFieldType.SELECT,
    span: 12,
    placeholder: '请选择城市',
    fieldProps: {
      options: cities.value
    }
  },
  {
    name: 'address',
    label: '详细地址',
    type: FormFieldType.TEXTAREA,
    span: 24,
    placeholder: '请输入详细地址',
    fieldProps: {
      rows: 3,
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    name: 'description',
    label: '个人简介',
    type: FormFieldType.TEXTAREA,
    span: 24,
    placeholder: '请输入个人简介',
    fieldProps: {
      rows: 4,
      maxlength: 500,
      showWordLimit: true
    }
  },
  {
    name: 'status',
    label: '状态',
    type: FormFieldType.RADIO,
    defaultValue: 1,
    span: 12,
    fieldProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  },
  {
    name: 'enabled',
    label: '是否启用',
    type: FormFieldType.SWITCH,
    defaultValue: true,
    span: 12
  },
  {
    name: 'avatar',
    label: '头像',
    type: FormFieldType.CUSTOM,
    span: 24,
    slotName: 'avatar'
  }
]

/**
 * 事件处理
 */
const handleSubmit = async (data: UserForm) => {
  console.log('提交数据:', data)
  ElMessage.success('提交成功')
}

const handleReset = () => {
  ElMessage.info('表单已重置')
}

const handleFieldChange = (field: string, value: any) => {
  console.log('字段变化:', field, value)
}

const handlePreview = () => {
  showPreview.value = true
}
</script>

<style scoped lang="scss">
.pro-form-example {
  padding: 20px;

  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
      line-height: 178px;
    }

    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
  }
}
</style>
