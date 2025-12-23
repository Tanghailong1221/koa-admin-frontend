<template>
  <div class="dict-example">
    <el-card header="数据字典示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>此示例演示了数据字典功能：</p>
        <ul>
          <li>字典数据自动缓存（TTL 30 分钟）</li>
          <li>支持强制刷新字典</li>
          <li>提供多种字典组件（标签、选择器、单选、多选）</li>
          <li>支持字典验证</li>
        </ul>
      </el-alert>

      <!-- 字典标签 -->
      <el-divider content-position="left">字典标签（DictTag）</el-divider>
      <el-space wrap>
        <div>
          <div style="margin-bottom: 8px">用户状态：</div>
          <el-space>
            <DictTag type="user_status" :value="0" />
            <DictTag type="user_status" :value="1" />
          </el-space>
        </div>

        <div>
          <div style="margin-bottom: 8px">用户性别：</div>
          <el-space>
            <DictTag type="user_gender" :value="0" />
            <DictTag type="user_gender" :value="1" />
            <DictTag type="user_gender" :value="2" />
          </el-space>
        </div>

        <div>
          <div style="margin-bottom: 8px">订单状态：</div>
          <el-space>
            <DictTag type="order_status" :value="0" />
            <DictTag type="order_status" :value="1" />
            <DictTag type="order_status" :value="2" />
            <DictTag type="order_status" :value="3" />
          </el-space>
        </div>
      </el-space>

      <!-- 字典选择器 -->
      <el-divider content-position="left">字典选择器（DictSelect）</el-divider>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="用户状态">
              <DictSelect v-model="form.status" type="user_status" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="用户性别">
              <DictSelect v-model="form.gender" type="user_gender" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="用户角色（多选）">
              <DictSelect v-model="form.roles" type="user_role" multiple />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 字典单选框 -->
      <el-divider content-position="left">字典单选框（DictRadio）</el-divider>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户状态">
              <DictRadio v-model="form.status" type="user_status" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="用户性别（按钮）">
              <DictRadio v-model="form.gender" type="user_gender" button />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 字典多选框 -->
      <el-divider content-position="left">字典多选框（DictCheckbox）</el-divider>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户角色">
              <DictCheckbox v-model="form.roles" type="user_role" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="订单状态（按钮）">
              <DictCheckbox v-model="form.orderStatuses" type="order_status" button />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 当前表单数据 -->
      <el-divider content-position="left">当前表单数据</el-divider>
      <pre>{{ JSON.stringify(form, null, 2) }}</pre>

      <!-- 字典管理 -->
      <el-divider content-position="left">字典管理</el-divider>
      <el-space wrap>
        <el-button type="primary" @click="handleRefresh">
          刷新所有字典
        </el-button>
        <el-button @click="handleClearCache">
          清空缓存
        </el-button>
        <el-button @click="handleShowCache">
          查看缓存
        </el-button>
      </el-space>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="配置字典 Store">
          <pre>{{ configCode }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="使用 useDict">
          <pre>{{ useDictCode }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="使用字典组件">
          <pre>{{ componentCode }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDictStore } from '@/store/dict'
import { DictTag, DictSelect, DictRadio, DictCheckbox } from '@/components/dict'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表单数据
const form = ref({
  status: 1,
  gender: 1,
  roles: ['user'] as (string | number)[],
  orderStatuses: [0, 1] as (string | number)[]
})

// 字典 Store
const dictStore = useDictStore()

// 配置代码
const configCode = `import { useDictStore } from '@/store/dict'
import { getUserDictApi } from '@/api/dict'

const dictStore = useDictStore()

// 配置字典获取函数
dictStore.configure({
  ttl: 30 * 60 * 1000,  // 30 分钟
  enableCache: true,
  fetchDict: async (type) => {
    const response = await getUserDictApi(type)
    return response.data
  }
})`

// useDict 代码
const useDictCode = `import { useDict } from '@/composables'

const { dict, loading, getLabel, refresh } = useDict('user_status')

// 获取标签
const label = getLabel(1) // '启用'

// 刷新字典
await refresh()`

// 组件代码
const componentCode = `<template>
  <!-- 字典标签 -->
  <DictTag type="user_status" :value="1" />

  <!-- 字典选择器 -->
  <DictSelect v-model="status" type="user_status" />

  <!-- 字典单选框 -->
  <DictRadio v-model="status" type="user_status" />

  <!-- 字典多选框 -->
  <DictCheckbox v-model="roles" type="user_role" />
</template>`

/**
 * 刷新所有字典
 */
const handleRefresh = async () => {
  try {
    await dictStore.refreshAll(['user_status', 'user_gender', 'user_role', 'order_status'])
    ElMessage.success('字典已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

/**
 * 清空缓存
 */
const handleClearCache = () => {
  dictStore.clearCache()
  ElMessage.success('缓存已清空')
}

/**
 * 查看缓存
 */
const handleShowCache = () => {
  const cache = dictStore.dictCache
  const cacheInfo = Array.from(cache.entries()).map(([type, data]) => {
    return {
      type,
      count: data.items.length,
      timestamp: new Date(data.timestamp).toLocaleString()
    }
  })

  ElMessageBox.alert(
    `<pre>${JSON.stringify(cacheInfo, null, 2)}</pre>`,
    '字典缓存',
    {
      dangerouslyUseHTMLString: true
    }
  )
}

// 初始化
onMounted(() => {
  // 预加载字典
  dictStore.getDicts(['user_status', 'user_gender', 'user_role', 'order_status'])
})
</script>

<style scoped lang="scss">
.dict-example {
  padding: 20px;

  :deep(.el-alert) {
    ul {
      margin: 10px 0 0 20px;
      padding: 0;
    }

    li {
      margin: 5px 0;
    }
  }

  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0;
  }
}
</style>
