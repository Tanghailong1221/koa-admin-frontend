<template>
  <div class="i18n-example">
    <el-card header="国际化系统示例 / I18n System Example">
      <el-alert
        :title="t('common.message.info')"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>{{ t('common.message.loading') }}</p>
        <p>当前语言 / Current Language: {{ currentLocaleInfo?.name }} {{ currentLocaleInfo?.icon }}</p>
      </el-alert>

      <!-- 语言切换 -->
      <el-card header="语言切换 / Language Switcher" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button
            v-for="item in localeList"
            :key="item.locale"
            :type="locale === item.locale ? 'primary' : 'default'"
            @click="changeLocale(item.locale)"
          >
            {{ item.icon }} {{ item.name }}
          </el-button>
        </el-space>
      </el-card>

      <!-- 通用翻译示例 -->
      <el-card header="通用翻译 / Common Translations" style="margin-bottom: 20px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作 / Actions">
            <el-space wrap>
              <el-tag>{{ t('common.action.add') }}</el-tag>
              <el-tag>{{ t('common.action.edit') }}</el-tag>
              <el-tag>{{ t('common.action.delete') }}</el-tag>
              <el-tag>{{ t('common.action.search') }}</el-tag>
              <el-tag>{{ t('common.action.submit') }}</el-tag>
            </el-space>
          </el-descriptions-item>
          <el-descriptions-item label="状态 / Status">
            <el-space wrap>
              <el-tag type="success">{{ t('common.status.enabled') }}</el-tag>
              <el-tag type="danger">{{ t('common.status.disabled') }}</el-tag>
              <el-tag type="info">{{ t('common.status.normal') }}</el-tag>
            </el-space>
          </el-descriptions-item>
          <el-descriptions-item label="消息 / Messages">
            <el-space direction="vertical">
              <span>{{ t('common.message.success') }}</span>
              <span>{{ t('common.message.loading') }}</span>
              <span>{{ t('common.message.noData') }}</span>
            </el-space>
          </el-descriptions-item>
          <el-descriptions-item label="表单 / Form">
            <el-space direction="vertical">
              <span>{{ t('common.form.required') }}</span>
              <span>{{ t('common.form.pleaseInput') }}</span>
              <span>{{ t('common.form.pleaseSelect') }}</span>
            </el-space>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 参数替换示例 -->
      <el-card header="参数替换 / Parameter Replacement" style="margin-bottom: 20px">
        <el-space direction="vertical" style="width: 100%">
          <div>
            <strong>示例 1 / Example 1:</strong>
            <p>{{ t('common.table.total', { total: 100 }) }}</p>
          </div>
          <div>
            <strong>示例 2 / Example 2:</strong>
            <p>{{ t('common.table.selected', { count: 5 }) }}</p>
          </div>
          <div>
            <strong>示例 3 / Example 3:</strong>
            <p>{{ t('common.time.minutesAgo', { n: 10 }) }}</p>
          </div>
          <div>
            <strong>示例 4 / Example 4:</strong>
            <p>{{ t('validation.min', { field: '年龄/Age', min: 18 }) }}</p>
          </div>
        </el-space>
      </el-card>

      <!-- 用户相关翻译 -->
      <el-card header="用户相关 / User Related" style="margin-bottom: 20px">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('user.info.username')">
            admin
          </el-descriptions-item>
          <el-descriptions-item :label="t('user.info.email')">
            admin@example.com
          </el-descriptions-item>
          <el-descriptions-item :label="t('user.info.phone')">
            13800138000
          </el-descriptions-item>
          <el-descriptions-item :label="t('user.info.status')">
            <el-tag type="success">{{ t('user.status.normal') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('user.info.gender')">
            {{ t('user.gender.male') }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('user.info.role')">
            {{ t('common.other.settings') }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- Element Plus 组件国际化 -->
      <el-card header="Element Plus 组件国际化 / Element Plus I18n" style="margin-bottom: 20px">
        <el-config-provider :locale="elementLocale">
          <el-space direction="vertical" style="width: 100%">
            <!-- 日期选择器 -->
            <div>
              <strong>{{ t('common.form.startDate') }} / {{ t('common.form.endDate') }}:</strong>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                :start-placeholder="t('common.form.startDate')"
                :end-placeholder="t('common.form.endDate')"
                style="margin-left: 10px"
              />
            </div>

            <!-- 分页 -->
            <div>
              <strong>{{ t('common.pagination.total') }}:</strong>
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="10"
                :total="100"
                layout="total, prev, pager, next, jumper"
                style="margin-top: 10px"
              />
            </div>

            <!-- 空状态 -->
            <div>
              <strong>{{ t('common.message.noData') }}:</strong>
              <el-empty :description="t('common.message.noData')" />
            </div>
          </el-space>
        </el-config-provider>
      </el-card>

      <!-- 表单示例 -->
      <el-card header="表单示例 / Form Example" style="margin-bottom: 20px">
        <el-form :model="formData" label-width="120px">
          <el-form-item :label="t('user.info.username')">
            <el-input
              v-model="formData.username"
              :placeholder="t('user.login.usernamePlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="t('user.info.email')">
            <el-input
              v-model="formData.email"
              :placeholder="t('common.form.inputPlaceholder', { field: t('user.info.email') })"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary">{{ t('common.action.submit') }}</el-button>
            <el-button>{{ t('common.action.cancel') }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 表格示例 -->
      <el-card header="表格示例 / Table Example" style="margin-bottom: 20px">
        <el-table :data="tableData" border>
          <el-table-column type="index" :label="t('common.table.index')" width="60" />
          <el-table-column prop="name" :label="t('user.info.username')" />
          <el-table-column prop="email" :label="t('user.info.email')" />
          <el-table-column prop="status" :label="t('user.info.status')">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('common.table.operation')" width="200">
            <template #default>
              <el-button size="small" type="primary">{{ t('common.action.edit') }}</el-button>
              <el-button size="small" type="danger">{{ t('common.action.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px; text-align: right">
          {{ t('common.table.total', { total: tableData.length }) }}
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card header="使用说明 / Usage">
        <el-collapse>
          <el-collapse-item title="基础用法 / Basic Usage" name="1">
            <pre><code>{{ basicUsageCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="参数替换 / Parameter Replacement" name="2">
            <pre><code>{{ paramReplacementCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="语言切换 / Language Switching" name="3">
            <pre><code>{{ languageSwitchingCode }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables'

const { locale, localeList, currentLocaleInfo, elementLocale, t, changeLocale } = useI18n()

// 表单数据
const formData = ref({
  username: '',
  email: ''
})

// 日期范围
const dateRange = ref<[Date, Date]>()

// 当前页码
const currentPage = ref(1)

// 表格数据
const tableData = ref([
  { id: 1, name: 'Admin', email: 'admin@example.com', status: 1 },
  { id: 2, name: 'User', email: 'user@example.com', status: 1 },
  { id: 3, name: 'Guest', email: 'guest@example.com', status: 0 }
])

// 代码示例
const basicUsageCode = `import { useI18n } from '@/composables'

const { t } = useI18n()

// 使用翻译
const title = t('common.action.add')  // '新增' or 'Add'
const message = t('common.message.success')  // '操作成功' or 'Success'`

const paramReplacementCode = `// 参数替换
const total = t('common.table.total', { total: 100 })
// 中文: '共 100 条'
// English: 'Total 100 items'

const selected = t('common.table.selected', { count: 5 })
// 中文: '已选 5 条'
// English: '5 selected'`

const languageSwitchingCode = `import { useI18n } from '@/composables'

const { locale, changeLocale } = useI18n()

// 切换到英文
changeLocale('en-US')

// 切换到中文
changeLocale('zh-CN')

// 获取当前语言
console.log(locale.value)  // 'zh-CN' or 'en-US'`
</script>

<style scoped>
.i18n-example {
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
