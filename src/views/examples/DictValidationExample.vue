<template>
  <div class="dict-validation-example">
    <el-card header="字典验证示例">
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本示例演示如何使用字典验证功能：</p>
        <ul>
          <li>1. 使用 useDict 的 createRule() 创建验证规则</li>
          <li>2. 使用 useDict 的 validate() 手动验证值</li>
          <li>3. 使用 createDictRule() 创建自定义验证规则</li>
          <li>4. 支持单选和多选验证</li>
        </ul>
      </el-alert>

      <!-- 示例 1：Element Plus 表单验证 -->
      <el-divider content-position="left">示例 1：Element Plus 表单验证</el-divider>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-form-item label="用户状态" prop="status">
          <DictSelect
            v-model="formData.status"
            type="user_status"
            placeholder="请选择用户状态"
            clearable
          />
        </el-form-item>

        <el-form-item label="用户角色" prop="roles">
          <DictSelect
            v-model="formData.roles"
            type="user_role"
            multiple
            placeholder="请选择用户角色"
          />
        </el-form-item>

        <el-form-item label="用户类型" prop="userType">
          <DictRadio
            v-model="formData.userType"
            type="user_type"
          />
        </el-form-item>

        <el-form-item label="权限" prop="permissions">
          <DictCheckbox
            v-model="formData.permissions"
            type="permission"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            提交
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button @click="handleValidateField">
            验证单个字段
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 示例 2：手动验证 -->
      <el-divider content-position="left">示例 2：手动验证</el-divider>
      
      <div style="max-width: 600px">
        <el-space direction="vertical" style="width: 100%">
          <div>
            <el-text>测试值：</el-text>
            <el-input
              v-model="testValue"
              placeholder="输入要测试的值"
              style="width: 200px; margin-left: 10px"
            />
            <el-button
              type="primary"
              @click="handleManualValidate"
              style="margin-left: 10px"
            >
              验证
            </el-button>
          </div>

          <el-alert
            v-if="manualValidateResult !== null"
            :type="manualValidateResult ? 'success' : 'error'"
            :closable="false"
          >
            {{ manualValidateResult ? '验证通过：值在字典范围内' : '验证失败：值不在字典范围内' }}
          </el-alert>
        </el-space>
      </div>

      <!-- 示例 3：批量验证 -->
      <el-divider content-position="left">示例 3：批量验证</el-divider>
      
      <div style="max-width: 600px">
        <el-space direction="vertical" style="width: 100%">
          <div>
            <el-button type="primary" @click="handleBatchValidate">
              批量验证表单数据
            </el-button>
          </div>

          <el-alert
            v-if="batchValidateResult"
            :type="batchValidateResult.valid ? 'success' : 'error'"
            :closable="false"
          >
            <div v-if="batchValidateResult.valid">
              批量验证通过：所有字段值都在字典范围内
            </div>
            <div v-else>
              <div>批量验证失败：</div>
              <ul>
                <li
                  v-for="(error, field) in batchValidateResult.errors"
                  :key="field"
                >
                  {{ field }}: {{ error }}
                </li>
              </ul>
            </div>
          </el-alert>
        </el-space>
      </div>

      <!-- 当前表单数据 -->
      <el-divider content-position="left">当前表单数据</el-divider>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户状态">
          {{ formData.status ?? '未选择' }}
          <el-tag
            v-if="formData.status !== undefined"
            :type="statusDict.getTagType(formData.status) as any"
            size="small"
            style="margin-left: 10px"
          >
            {{ statusDict.getLabel(formData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户角色">
          {{ formData.roles }}
          <el-space v-if="formData.roles.length > 0" style="margin-left: 10px">
            <el-tag
              v-for="role in formData.roles"
              :key="role"
              size="small"
            >
              {{ roleDict.getLabel(role) }}
            </el-tag>
          </el-space>
        </el-descriptions-item>
        <el-descriptions-item label="用户类型">
          {{ formData.userType ?? '未选择' }}
          <el-tag
            v-if="formData.userType !== undefined"
            size="small"
            style="margin-left: 10px"
          >
            {{ userTypeDict.getLabel(formData.userType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="权限">
          {{ formData.permissions }}
          <el-space v-if="formData.permissions.length > 0" style="margin-left: 10px">
            <el-tag
              v-for="perm in formData.permissions"
              :key="perm"
              size="small"
            >
              {{ permissionDict.getLabel(perm) }}
            </el-tag>
          </el-space>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      
      <el-collapse>
        <el-collapse-item title="1. 使用 useDict 创建验证规则" name="1">
          <pre><code>{{ useDictCode }}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 使用 createDictRule 创建自定义规则" name="2">
          <pre><code>{{ createDictRuleCode }}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. 手动验证值" name="3">
          <pre><code>{{ manualValidateCode }}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 批量验证" name="4">
          <pre><code>{{ batchValidateCode }}</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useDict } from '@/composables'
import { DictSelect, DictRadio, DictCheckbox } from '@/components/dict'
import { validateDictValues } from '@/utils/dict-validation'

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  status: undefined as number | undefined,
  roles: [] as number[],
  userType: undefined as number | undefined,
  permissions: [] as string[]
})

// 字典
const statusDict = useDict('user_status')
const roleDict = useDict('user_role')
const userTypeDict = useDict('user_type')
const permissionDict = useDict('permission')

// 表单验证规则
const formRules = computed<FormRules>(() => ({
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' },
    statusDict.createRule(false, '用户状态值不在允许的范围内')
  ],
  roles: [
    { required: true, message: '请选择用户角色', trigger: 'change' },
    roleDict.createRule(false, '用户角色值不在允许的范围内')
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' },
    userTypeDict.createRule(false, '用户类型值不在允许的范围内')
  ],
  permissions: [
    permissionDict.createRule(false, '权限值不在允许的范围内')
  ]
}))

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    ElMessage.success('验证通过，可以提交')
    console.log('表单数据:', formData)
  } catch (error) {
    ElMessage.error('验证失败，请检查表单')
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

// 验证单个字段
const handleValidateField = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField('status')
    ElMessage.success('状态字段验证通过')
  } catch (error) {
    ElMessage.error('状态字段验证失败')
  }
}

// 手动验证
const testValue = ref('')
const manualValidateResult = ref<boolean | null>(null)

const handleManualValidate = () => {
  // 尝试转换为数字
  let value: any = testValue.value
  if (!isNaN(Number(value))) {
    value = Number(value)
  }

  // 验证
  manualValidateResult.value = statusDict.validate(value)
}

// 批量验证
const batchValidateResult = ref<{
  valid: boolean
  errors: Record<string, string>
} | null>(null)

const handleBatchValidate = () => {
  batchValidateResult.value = validateDictValues(
    {
      status: formData.status,
      roles: formData.roles,
      userType: formData.userType,
      permissions: formData.permissions
    },
    {
      status: {
        dictType: 'user_status',
        dictData: statusDict.dict.value
      },
      roles: {
        dictType: 'user_role',
        dictData: roleDict.dict.value
      },
      userType: {
        dictType: 'user_type',
        dictData: userTypeDict.dict.value
      },
      permissions: {
        dictType: 'permission',
        dictData: permissionDict.dict.value
      }
    }
  )

  if (batchValidateResult.value.valid) {
    ElMessage.success('批量验证通过')
  } else {
    ElMessage.error('批量验证失败')
  }
}

// 代码示例
const useDictCode = `// 使用 useDict 创建验证规则
const statusDict = useDict('user_status')

const formRules = {
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' },
    statusDict.createRule(false, '用户状态值不在允许的范围内')
  ]
}`

const createDictRuleCode = `// 使用 createDictRule 创建自定义规则
import { createDictRule } from '@/utils/dict-validation'

const rule = createDictRule({
  dictType: 'user_status',
  dictData: statusDict.dict.value,
  required: true,
  message: '自定义错误消息',
  trigger: 'change'
})`

const manualValidateCode = `// 手动验证值
const statusDict = useDict('user_status')

// 验证单个值
const isValid = statusDict.validate(1) // true

// 验证数组
const isValid = statusDict.validate([1, 2]) // true`

const batchValidateCode = `// 批量验证
import { validateDictValues } from '@/utils/dict-validation'

const result = validateDictValues(
  {
    status: 1,
    roles: [1, 2]
  },
  {
    status: {
      dictType: 'user_status',
      dictData: statusDict.dict.value
    },
    roles: {
      dictType: 'user_role',
      dictData: roleDict.dict.value
    }
  }
)

if (result.valid) {
  console.log('验证通过')
} else {
  console.log('验证失败:', result.errors)
}`
</script>

<style scoped>
.dict-validation-example {
  padding: 20px;
}

pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
