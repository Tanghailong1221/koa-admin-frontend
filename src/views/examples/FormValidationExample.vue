<template>
  <div class="form-validation-example">
    <el-card header="表单验证和提交示例">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名（3-20 个字符）"
            @blur="validateField('username')"
          />
          <div v-if="hasFieldError('username')" class="field-error">
            {{ getFieldError('username') }}
          </div>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            @input="validateFieldDebounced('email')"
          />
          <div v-if="hasFieldError('email')" class="field-error">
            {{ getFieldError('email') }}
          </div>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号"
            @blur="validateField('phone')"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="至少 8 位，包含大小写字母和数字"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="年龄" prop="age">
          <el-input-number
            v-model="formData.age"
            :min="0"
            :max="150"
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="formData.bio"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介（最多 200 字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button
              type="primary"
              :loading="isSubmitting"
              :disabled="isValidating"
              @click="handleSubmit"
            >
              提交
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
            <el-button @click="handleValidate">
              手动验证
            </el-button>
            <el-button @click="handleClearValidate">
              清除验证
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>

      <!-- 验证状态 -->
      <el-divider />
      <el-descriptions :column="2" border>
        <el-descriptions-item label="验证状态">
          <el-tag :type="isValidating ? 'warning' : 'success'">
            {{ isValidating ? '验证中' : '空闲' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交状态">
          <el-tag :type="isSubmitting ? 'warning' : 'success'">
            {{ isSubmitting ? '提交中' : '空闲' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否有错误">
          <el-tag :type="hasErrors ? 'danger' : 'success'">
            {{ hasErrors ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="错误数量">
          {{ errorCount }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 错误列表 -->
      <el-alert
        v-if="hasErrors"
        type="error"
        :closable="false"
        style="margin-top: 16px"
      >
        <template #title>
          表单有 {{ errorCount }} 个错误
        </template>
        <ul style="margin: 0; padding-left: 20px">
          <li v-for="(error, index) in allErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </el-alert>

      <!-- 提交结果 -->
      <el-alert
        v-if="submitResult"
        type="success"
        :closable="false"
        style="margin-top: 16px"
      >
        <template #title>提交成功</template>
        <pre>{{ JSON.stringify(submitResult, null, 2) }}</pre>
      </el-alert>

      <!-- 说明 -->
      <el-divider />
      <el-alert type="info" :closable="false">
        <template #title>功能说明</template>
        <ul style="margin: 0; padding-left: 20px">
          <li>用户名：失焦时验证</li>
          <li>邮箱：输入时防抖验证（300ms）</li>
          <li>手机号：失焦时验证</li>
          <li>密码：必须包含大小写字母和数字，长度至少 8 位</li>
          <li>确认密码：必须与密码一致</li>
          <li>年龄：数字范围 0-150</li>
          <li>个人简介：最多 200 字</li>
          <li>提交时会自动验证整个表单</li>
          <li>防止重复提交</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  useFormValidation,
  useFormSubmit,
  ValidationRules
} from '@/composables'
import type { FormInstance, FormRules } from 'element-plus'

/**
 * 表单数据接口
 */
interface FormData {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  age: number
  bio: string
}

// Refs
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<FormData>({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  age: 0,
  bio: ''
})

// 验证规则
const rules: FormRules = {
  username: [
    ValidationRules.required('请输入用户名'),
    ValidationRules.length(3, 20, '用户名长度在 3 到 20 个字符')
  ],
  email: [
    ValidationRules.required('请输入邮箱'),
    ValidationRules.email('请输入正确的邮箱地址')
  ],
  phone: [
    ValidationRules.phone('请输入正确的手机号')
  ],
  password: [
    ValidationRules.required('请输入密码'),
    ValidationRules.strongPassword('密码必须包含大小写字母和数字，长度至少 8 位')
  ],
  confirmPassword: [
    ValidationRules.required('请再次输入密码'),
    ValidationRules.custom((_rule: any, value: any, callback: any) => {
      if (value !== formData.value.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    })
  ],
  age: [
    ValidationRules.range(0, 150, '年龄必须在 0 到 150 之间')
  ],
  bio: [
    ValidationRules.maxLength(200, '个人简介最多 200 字')
  ]
}

// 表单验证
const {
  isValidating,
  hasErrors,
  errorCount,
  allErrors,
  validate,
  validateField,
  validateFieldDebounced,
  clearValidate,
  resetFields,
  getFieldError,
  hasFieldError
} = useFormValidation(formRef, {
  debounce: true,
  debounceDelay: 300,
  onValidateSuccess: () => {
    console.log('验证成功')
  },
  onValidateError: (errors) => {
    console.log('验证失败:', errors)
  }
})

// 表单提交
const { isSubmitting, submitResult, submit, reset } = useFormSubmit(
  formRef,
  formData,
  {
    onSubmit: async (data) => {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 1500))
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString()
      }
    },
    onSuccess: (result) => {
      console.log('提交成功:', result)
    },
    onError: (error) => {
      console.error('提交失败:', error)
    },
    successMessage: '用户创建成功',
    preventDuplicate: true
  }
)

/**
 * 事件处理
 */
const handleSubmit = async () => {
  const success = await submit()
  if (success) {
    console.log('表单提交成功')
  }
}

const handleReset = () => {
  resetFields()
  reset()
  ElMessage.info('表单已重置')
}

const handleValidate = async () => {
  const result = await validate()
  if (result.valid) {
    ElMessage.success('验证通过')
  } else {
    ElMessage.error('验证失败')
  }
}

const handleClearValidate = () => {
  clearValidate()
  ElMessage.info('验证已清除')
}
</script>

<style scoped lang="scss">
.form-validation-example {
  padding: 20px;

  .field-error {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-color-danger);
    line-height: 1.5;
  }

  ul {
    li {
      margin: 8px 0;
      line-height: 1.6;
    }
  }

  pre {
    margin: 8px 0 0;
    padding: 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
