<template>
  <div class="confirm-dialog-example">
    <el-card header="敏感操作确认示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>敏感操作确认用于防止用户误操作，提供多种确认方式。</p>
      </el-alert>

      <!-- 基础确认 -->
      <el-divider content-position="left">基础确认</el-divider>
      <el-space wrap>
        <el-button type="primary" @click="handleBasicConfirm">基础确认</el-button>
        <el-button type="warning" @click="handleWarningConfirm">警告确认</el-button>
        <el-button type="success" @click="handleSuccessConfirm">成功确认</el-button>
        <el-button type="info" @click="handleInfoConfirm">信息确认</el-button>
      </el-space>

      <!-- 删除确认 -->
      <el-divider content-position="left">删除确认</el-divider>
      <el-space wrap>
        <el-button type="danger" @click="handleDeleteUser">删除用户</el-button>
        <el-button type="danger" @click="handleDeleteFile">删除文件</el-button>
        <el-button type="danger" @click="handleDeleteDatabase">删除数据库</el-button>
      </el-space>

      <!-- 危险操作确认（需要输入确认文本）-->
      <el-divider content-position="left">危险操作确认（需要输入确认文本）</el-divider>
      <el-space wrap>
        <el-button type="danger" plain @click="handleDangerOperation1">
          清空数据
        </el-button>
        <el-button type="danger" plain @click="handleDangerOperation2">
          重置系统
        </el-button>
        <el-button type="danger" plain @click="handleDangerOperation3">
          删除所有用户
        </el-button>
      </el-space>

      <!-- 密码确认 -->
      <el-divider content-position="left">密码确认</el-divider>
      <el-space wrap>
        <el-button type="warning" @click="handlePasswordConfirm1">
          修改邮箱
        </el-button>
        <el-button type="warning" @click="handlePasswordConfirm2">
          修改密码
        </el-button>
        <el-button type="warning" @click="handlePasswordConfirm3">
          注销账号
        </el-button>
      </el-space>

      <!-- 使用 ConfirmDialog 组件 -->
      <el-divider content-position="left">使用 ConfirmDialog 组件</el-divider>
      <el-space wrap>
        <el-button type="primary" @click="showComponentDialog1">
          基础对话框
        </el-button>
        <el-button type="danger" @click="showComponentDialog2">
          二次确认对话框
        </el-button>
        <el-button type="warning" @click="showComponentDialog3">
          密码确认对话框
        </el-button>
      </el-space>

      <!-- 操作日志 -->
      <el-divider content-position="left">操作日志</el-divider>
      <el-card shadow="never">
        <div v-if="logs.length === 0" style="text-align: center; color: #909399">
          暂无操作记录
        </div>
        <el-timeline v-else>
          <el-timeline-item
            v-for="(log, index) in logs"
            :key="index"
            :timestamp="log.time"
            :type="log.type"
          >
            {{ log.message }}
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-collapse>
        <el-collapse-item title="1. 使用 useConfirm Composable" name="1">
          <pre><code>import { useConfirm } from '@/composables'

const { confirm, confirmDelete, confirmDanger, confirmPassword } = useConfirm()

// 基础确认
const result = await confirm({ message: '确定要执行此操作吗？' })
if (result.confirmed) {
  // 执行操作
}

// 删除确认
const deleteResult = await confirmDelete('用户')
if (deleteResult.confirmed) {
  // 执行删除
}

// 危险操作确认（需要输入确认文本）
const dangerResult = await confirmDanger('此操作不可撤销', '删除数据库', '确认删除')
if (dangerResult.confirmed) {
  // 执行危险操作
}

// 密码确认
const passwordResult = await confirmPassword('修改邮箱需要验证密码')
if (passwordResult.confirmed) {
  console.log('用户密码:', passwordResult.password)
  // 执行操作
}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 使用 ConfirmDialog 组件" name="2">
          <pre><code>&lt;template&gt;
  &lt;el-button @click="showDialog"&gt;显示对话框&lt;/el-button&gt;

  &lt;ConfirmDialog
    ref="dialogRef"
    title="确认删除"
    message="确定要删除此用户吗？"
    confirm-button-type="danger"
    :on-confirm="handleConfirm"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const dialogRef = ref()

function showDialog() {
  dialogRef.value?.show()
}

async function handleConfirm() {
  // 执行删除操作
  await deleteUser()
}
&lt;/script&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. 二次确认文本" name="3">
          <pre><code>const result = await confirm({
  title: '危险操作',
  message: '此操作将清空所有数据，不可撤销',
  type: 'error',
  requireConfirmText: true,
  confirmText: '清空数据',
  confirmButtonText: '确认清空'
})

if (result.confirmed) {
  console.log('用户输入的确认文本:', result.confirmText)
  // 执行操作
}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 密码确认" name="4">
          <pre><code>const result = await confirm({
  title: '密码确认',
  message: '修改邮箱需要验证您的密码',
  type: 'warning',
  requirePassword: true
})

if (result.confirmed) {
  console.log('用户密码:', result.password)
  // 验证密码并执行操作
}</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- ConfirmDialog 组件实例 -->
    <ConfirmDialog
      ref="componentDialog1Ref"
      title="确认操作"
      message="确定要执行此操作吗？"
      :on-confirm="handleComponentConfirm1"
    />

    <ConfirmDialog
      ref="componentDialog2Ref"
      title="危险操作"
      message="此操作不可撤销，请输入确认文本"
      confirm-button-type="danger"
      :require-confirm-text="true"
      confirm-text-value="确认删除"
      :on-confirm="handleComponentConfirm2"
    />

    <ConfirmDialog
      ref="componentDialog3Ref"
      title="密码确认"
      message="此操作需要验证您的密码"
      confirm-button-type="warning"
      :require-password="true"
      :on-confirm="handleComponentConfirm3"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConfirm } from '@/composables'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ElMessage } from 'element-plus'

const { confirm, confirmWarning, confirmDelete, confirmDanger, confirmPassword } = useConfirm()

// 操作日志
interface Log {
  time: string
  message: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const logs = ref<Log[]>([])

// ConfirmDialog 组件引用
const componentDialog1Ref = ref()
const componentDialog2Ref = ref()
const componentDialog3Ref = ref()

/**
 * 添加日志
 */
function addLog(message: string, type: Log['type'] = 'info') {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })

  // 只保留最近 10 条
  if (logs.value.length > 10) {
    logs.value = logs.value.slice(0, 10)
  }
}

/**
 * 基础确认
 */
async function handleBasicConfirm() {
  const result = await confirm({
    message: '确定要执行此操作吗？'
  })

  if (result.confirmed) {
    addLog('用户确认了基础操作', 'success')
    ElMessage.success('操作已确认')
  } else {
    addLog('用户取消了基础操作', 'info')
  }
}

/**
 * 警告确认
 */
async function handleWarningConfirm() {
  const result = await confirmWarning('此操作可能会影响系统性能')

  if (result.confirmed) {
    addLog('用户确认了警告操作', 'warning')
    ElMessage.success('操作已确认')
  } else {
    addLog('用户取消了警告操作', 'info')
  }
}

/**
 * 成功确认
 */
async function handleSuccessConfirm() {
  const result = await confirm({
    message: '操作已完成，是否继续？',
    type: 'success'
  })

  if (result.confirmed) {
    addLog('用户确认继续操作', 'success')
    ElMessage.success('继续操作')
  } else {
    addLog('用户取消继续操作', 'info')
  }
}

/**
 * 信息确认
 */
async function handleInfoConfirm() {
  const result = await confirm({
    message: '这是一条提示信息',
    type: 'info'
  })

  if (result.confirmed) {
    addLog('用户确认了信息', 'info')
    ElMessage.success('已确认')
  } else {
    addLog('用户取消了信息确认', 'info')
  }
}

/**
 * 删除用户
 */
async function handleDeleteUser() {
  const result = await confirmDelete('用户 "张三"')

  if (result.confirmed) {
    addLog('用户确认删除用户 "张三"', 'danger')
    ElMessage.success('用户已删除')
  } else {
    addLog('用户取消删除用户', 'info')
  }
}

/**
 * 删除文件
 */
async function handleDeleteFile() {
  const result = await confirmDelete('文件 "document.pdf"')

  if (result.confirmed) {
    addLog('用户确认删除文件 "document.pdf"', 'danger')
    ElMessage.success('文件已删除')
  } else {
    addLog('用户取消删除文件', 'info')
  }
}

/**
 * 删除数据库
 */
async function handleDeleteDatabase() {
  const result = await confirmDelete('数据库 "production"')

  if (result.confirmed) {
    addLog('用户确认删除数据库 "production"', 'danger')
    ElMessage.success('数据库已删除')
  } else {
    addLog('用户取消删除数据库', 'info')
  }
}

/**
 * 危险操作 1
 */
async function handleDangerOperation1() {
  const result = await confirmDanger('此操作将清空所有数据，不可撤销', '清空数据', '清空')

  if (result.confirmed) {
    addLog(`用户确认清空数据（输入: ${result.confirmText}）`, 'danger')
    ElMessage.success('数据已清空')
  } else {
    addLog('用户取消清空数据', 'info')
  }
}

/**
 * 危险操作 2
 */
async function handleDangerOperation2() {
  const result = await confirmDanger('此操作将重置系统到初始状态', '重置系统', '重置')

  if (result.confirmed) {
    addLog(`用户确认重置系统（输入: ${result.confirmText}）`, 'danger')
    ElMessage.success('系统已重置')
  } else {
    addLog('用户取消重置系统', 'info')
  }
}

/**
 * 危险操作 3
 */
async function handleDangerOperation3() {
  const result = await confirmDanger('此操作将删除所有用户账号', '删除所有用户', '删除全部')

  if (result.confirmed) {
    addLog(`用户确认删除所有用户（输入: ${result.confirmText}）`, 'danger')
    ElMessage.success('所有用户已删除')
  } else {
    addLog('用户取消删除所有用户', 'info')
  }
}

/**
 * 密码确认 1
 */
async function handlePasswordConfirm1() {
  const result = await confirmPassword('修改邮箱需要验证您的密码')

  if (result.confirmed) {
    addLog(`用户确认修改邮箱（密码: ${result.password?.replace(/./g, '*')}）`, 'warning')
    ElMessage.success('邮箱已修改')
  } else {
    addLog('用户取消修改邮箱', 'info')
  }
}

/**
 * 密码确认 2
 */
async function handlePasswordConfirm2() {
  const result = await confirmPassword('修改密码需要验证您的当前密码')

  if (result.confirmed) {
    addLog(`用户确认修改密码（密码: ${result.password?.replace(/./g, '*')}）`, 'warning')
    ElMessage.success('密码已修改')
  } else {
    addLog('用户取消修改密码', 'info')
  }
}

/**
 * 密码确认 3
 */
async function handlePasswordConfirm3() {
  const result = await confirmPassword('注销账号需要验证您的密码')

  if (result.confirmed) {
    addLog(`用户确认注销账号（密码: ${result.password?.replace(/./g, '*')}）`, 'danger')
    ElMessage.success('账号已注销')
  } else {
    addLog('用户取消注销账号', 'info')
  }
}

/**
 * 显示组件对话框 1
 */
function showComponentDialog1() {
  componentDialog1Ref.value?.show()
}

/**
 * 显示组件对话框 2
 */
function showComponentDialog2() {
  componentDialog2Ref.value?.show()
}

/**
 * 显示组件对话框 3
 */
function showComponentDialog3() {
  componentDialog3Ref.value?.show()
}

/**
 * 组件确认回调 1
 */
async function handleComponentConfirm1() {
  addLog('用户通过组件确认了操作', 'success')
  ElMessage.success('操作已确认')
}

/**
 * 组件确认回调 2
 */
async function handleComponentConfirm2(data: any) {
  addLog(`用户通过组件确认了危险操作（输入: ${data.confirmText}）`, 'danger')
  ElMessage.success('操作已确认')
}

/**
 * 组件确认回调 3
 */
async function handleComponentConfirm3(data: any) {
  addLog(`用户通过组件确认了密码验证（密码: ${data.password?.replace(/./g, '*')}）`, 'warning')
  ElMessage.success('密码验证成功')
}
</script>

<style scoped lang="scss">
.confirm-dialog-example {
  padding: 20px;

  :deep(.el-collapse-item__content) {
    padding-bottom: 15px;
  }

  pre code {
    display: block;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
    overflow: auto;
  }
}
</style>
