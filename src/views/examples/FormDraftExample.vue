<template>
  <div class="form-draft-example">
    <el-card header="表单草稿和导航守卫示例">
      <!-- 草稿提示 -->
      <el-alert
        v-if="hasDraft && !draftLoaded"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #title>
          检测到 {{ draftInfo?.timeAgo }} 的草稿
        </template>
        <el-space>
          <el-button type="primary" size="small" @click="handleLoadDraft">
            加载草稿
          </el-button>
          <el-button size="small" @click="clearDraft()">
            清除草稿
          </el-button>
        </el-space>
      </el-alert>

      <!-- 状态显示 -->
      <el-descriptions :column="2" border style="margin-bottom: 16px">
        <el-descriptions-item label="是否有草稿">
          <el-tag :type="hasDraft ? 'success' : 'info'">
            {{ hasDraft ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="表单是否有更改">
          <el-tag :type="isDirty ? 'warning' : 'success'">
            {{ isDirty ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后保存时间">
          {{ lastSaveTime ? new Date(lastSaveTime).toLocaleString() : '未保存' }}
        </el-descriptions-item>
        <el-descriptions-item label="正在保存">
          <el-tag :type="isSaving ? 'warning' : 'success'">
            {{ isSaving ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入姓名"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号"
          />
        </el-form-item>

        <el-form-item label="年龄" prop="age">
          <el-input-number
            v-model="formData.age"
            :min="0"
            :max="150"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="爱好" prop="hobbies">
          <el-checkbox-group v-model="formData.hobbies">
            <el-checkbox label="reading">读书</el-checkbox>
            <el-checkbox label="sports">运动</el-checkbox>
            <el-checkbox label="music">音乐</el-checkbox>
            <el-checkbox label="travel">旅游</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input
            v-model="formData.address"
            type="textarea"
            :rows="3"
            placeholder="请输入地址"
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button
              type="primary"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交
            </el-button>
            <el-button @click="saveDraft(true)">
              手动保存草稿
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
            <el-button @click="handleNavigate">
              跳转到其他页面（测试守卫）
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>

      <!-- 说明 -->
      <el-divider />
      <el-alert type="info" :closable="false">
        <template #title>功能说明</template>
        <ul style="margin: 0; padding-left: 20px">
          <li>表单数据会自动保存草稿（1 秒防抖）</li>
          <li>刷新页面后可以加载之前的草稿</li>
          <li>草稿会在 7 天后自动过期</li>
          <li>修改表单后尝试跳转会提示确认</li>
          <li>提交成功后会自动清除草稿和解除守卫</li>
          <li>刷新或关闭浏览器时也会提示确认</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useFormDraft, useFormGuard } from '@/composables'

/**
 * 表单数据接口
 */
interface FormData {
  name: string
  email: string
  phone: string
  age: number
  gender: number
  hobbies: string[]
  address: string
  description: string
}

// Refs
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const draftLoaded = ref(false)

// 表单数据
const formData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  age: 0,
  gender: 1,
  hobbies: [],
  address: '',
  description: ''
})

// 验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ]
}

// 表单草稿
const {
  hasDraft,
  lastSaveTime,
  isSaving,
  saveDraft,
  loadDraft,
  clearDraft,
  getDraftInfo
} = useFormDraft(formData, {
  key: 'form_draft_example', // 自定义草稿键
  autoSave: true,
  autoSaveDelay: 1000,
  showLoadTip: true,
  showSaveTip: false
})

// 导航守卫
const {
  isDirty,
  setOriginalData,
  markAsSubmitted
} = useFormGuard(formData, {
  enabled: true,
  message: '表单有未保存的更改，确定要离开吗？',
  showSaveDraft: true,
  onSaveDraft: async () => {
    saveDraft(true)
  }
})

// 获取草稿信息
const draftInfo = getDraftInfo()

/**
 * 事件处理
 */
const handleLoadDraft = () => {
  const loaded = loadDraft(true)
  if (loaded) {
    draftLoaded.value = true
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('提交成功')

    // 标记为已提交（解除导航守卫）
    markAsSubmitted()

    // 清除草稿
    clearDraft(false)

    // 重置表单
    formRef.value.resetFields()

    // 重新设置原始数据
    setOriginalData(formData.value)
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  ElMessage.info('表单已重置')
}

const handleNavigate = () => {
  // 尝试跳转到其他页面（会触发导航守卫）
  router.push('/')
}

/**
 * 初始化
 */
onMounted(() => {
  // 设置原始数据（用于检测更改）
  setOriginalData(formData.value)

  // 检查是否有草稿
  if (hasDraft.value) {
    console.log('检测到草稿:', draftInfo)
  }
})
</script>

<style scoped lang="scss">
.form-draft-example {
  padding: 20px;

  ul {
    li {
      margin: 8px 0;
      line-height: 1.6;
    }
  }
}
</style>
