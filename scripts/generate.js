#!/usr/bin/env node

/**
 * 代码生成器
 * 用于快速生成页面、组件、API 等代码
 */

import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const program = new Command()

program
    .name('generate')
    .description('代码生成器 - 快速生成页面、组件、API 等代码')
    .version('1.0.0')

// 生成页面
program
    .command('page')
    .description('生成页面')
    .action(async () => {
        await generatePage()
    })

// 生成组件
program
    .command('component')
    .alias('comp')
    .description('生成组件')
    .action(async () => {
        await generateComponent()
    })

// 生成 API
program
    .command('api')
    .description('生成 API 模块')
    .action(async () => {
        await generateApi()
    })

// 生成 Store
program
    .command('store')
    .description('生成 Pinia Store')
    .action(async () => {
        await generateStore()
    })

program.parse()

/**
 * 生成页面
 */
async function generatePage() {
    console.log(chalk.blue('\n📄 生成页面\n'))

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '页面名称 (例如: UserList):',
            validate: (input) => {
                if (!input) return '页面名称不能为空'
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
                    return '页面名称必须以大写字母开头，只能包含字母和数字'
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'path',
            message: '页面路径 (例如: system/user):',
            default: (answers) => {
                // 将 UserList 转换为 user-list
                return answers.name
                    .replace(/([A-Z])/g, '-$1')
                    .toLowerCase()
                    .slice(1)
            }
        },
        {
            type: 'input',
            name: 'title',
            message: '页面标题:',
            default: (answers) => answers.name
        },
        {
            type: 'confirm',
            name: 'useProTable',
            message: '是否使用 ProTable 组件?',
            default: true
        },
        {
            type: 'confirm',
            name: 'useProForm',
            message: '是否使用 ProForm 组件?',
            default: true
        }
    ])

    const spinner = ora('正在生成页面...').start()

    try {
        // 生成页面文件
        const pagePath = path.resolve(
            __dirname,
            `../src/views/${answers.path}`
        )
        const pageFile = path.join(pagePath, `${answers.name}.vue`)

        // 创建目录
        if (!fs.existsSync(pagePath)) {
            fs.mkdirSync(pagePath, { recursive: true })
        }

        // 生成页面内容
        const pageContent = generatePageTemplate(answers)
        fs.writeFileSync(pageFile, pageContent)

        spinner.succeed(chalk.green('页面生成成功!'))

        console.log(chalk.cyan('\n生成的文件:'))
        console.log(chalk.gray(`  ${pageFile}`))

        console.log(chalk.yellow('\n下一步:'))
        console.log(chalk.gray('  1. 在 router 中添加路由配置'))
        console.log(chalk.gray('  2. 根据需要调整页面代码'))
        console.log(chalk.gray('  3. 实现 API 接口'))
    } catch (error) {
        spinner.fail(chalk.red('页面生成失败'))
        console.error(error)
    }
}

/**
 * 生成组件
 */
async function generateComponent() {
    console.log(chalk.blue('\n🧩 生成组件\n'))

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '组件名称 (例如: UserCard):',
            validate: (input) => {
                if (!input) return '组件名称不能为空'
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
                    return '组件名称必须以大写字母开头，只能包含字母和数字'
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'path',
            message: '组件路径 (例如: user):',
            default: (answers) => {
                return answers.name
                    .replace(/([A-Z])/g, '-$1')
                    .toLowerCase()
                    .slice(1)
            }
        },
        {
            type: 'confirm',
            name: 'withProps',
            message: '是否需要 Props?',
            default: true
        },
        {
            type: 'confirm',
            name: 'withEmits',
            message: '是否需要 Emits?',
            default: false
        }
    ])

    const spinner = ora('正在生成组件...').start()

    try {
        // 生成组件文件
        const compPath = path.resolve(
            __dirname,
            `../src/components/${answers.path}`
        )
        const compFile = path.join(compPath, `${answers.name}.vue`)
        const indexFile = path.join(compPath, 'index.ts')

        // 创建目录
        if (!fs.existsSync(compPath)) {
            fs.mkdirSync(compPath, { recursive: true })
        }

        // 生成组件内容
        const compContent = generateComponentTemplate(answers)
        fs.writeFileSync(compFile, compContent)

        // 生成 index.ts
        const indexContent = `export { default as ${answers.name} } from './${answers.name}.vue'\n`
        fs.writeFileSync(indexFile, indexContent)

        spinner.succeed(chalk.green('组件生成成功!'))

        console.log(chalk.cyan('\n生成的文件:'))
        console.log(chalk.gray(`  ${compFile}`))
        console.log(chalk.gray(`  ${indexFile}`))

        console.log(chalk.yellow('\n使用方法:'))
        console.log(
            chalk.gray(
                `  import { ${answers.name} } from '@/components/${answers.path}'`
            )
        )
    } catch (error) {
        spinner.fail(chalk.red('组件生成失败'))
        console.error(error)
    }
}

/**
 * 生成 API
 */
async function generateApi() {
    console.log(chalk.blue('\n🌐 生成 API 模块\n'))

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'API 模块名称 (例如: user):',
            validate: (input) => {
                if (!input) return 'API 模块名称不能为空'
                if (!/^[a-z][a-zA-Z0-9]*$/.test(input)) {
                    return 'API 模块名称必须以小写字母开头，只能包含字母和数字'
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'baseUrl',
            message: 'API 基础路径 (例如: /user):',
            default: (answers) => `/${answers.name}`
        }
    ])

    const spinner = ora('正在生成 API 模块...').start()

    try {
        // 生成 API 文件
        const apiPath = path.resolve(__dirname, '../src/api')
        const apiFile = path.join(apiPath, `${answers.name}.ts`)

        // 创建目录
        if (!fs.existsSync(apiPath)) {
            fs.mkdirSync(apiPath, { recursive: true })
        }

        // 生成 API 内容
        const apiContent = generateApiTemplate(answers)
        fs.writeFileSync(apiFile, apiContent)

        spinner.succeed(chalk.green('API 模块生成成功!'))

        console.log(chalk.cyan('\n生成的文件:'))
        console.log(chalk.gray(`  ${apiFile}`))

        console.log(chalk.yellow('\n使用方法:'))
        console.log(
            chalk.gray(`  import { get${capitalize(answers.name)}List } from '@/api/${answers.name}'`)
        )
    } catch (error) {
        spinner.fail(chalk.red('API 模块生成失败'))
        console.error(error)
    }
}

/**
 * 生成 Store
 */
async function generateStore() {
    console.log(chalk.blue('\n📦 生成 Pinia Store\n'))

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Store 名称 (例如: user):',
            validate: (input) => {
                if (!input) return 'Store 名称不能为空'
                if (!/^[a-z][a-zA-Z0-9]*$/.test(input)) {
                    return 'Store 名称必须以小写字母开头，只能包含字母和数字'
                }
                return true
            }
        },
        {
            type: 'confirm',
            name: 'withPersist',
            message: '是否启用持久化?',
            default: false
        }
    ])

    const spinner = ora('正在生成 Store...').start()

    try {
        // 生成 Store 文件
        const storePath = path.resolve(__dirname, '../src/store')
        const storeFile = path.join(storePath, `${answers.name}.ts`)

        // 创建目录
        if (!fs.existsSync(storePath)) {
            fs.mkdirSync(storePath, { recursive: true })
        }

        // 生成 Store 内容
        const storeContent = generateStoreTemplate(answers)
        fs.writeFileSync(storeFile, storeContent)

        spinner.succeed(chalk.green('Store 生成成功!'))

        console.log(chalk.cyan('\n生成的文件:'))
        console.log(chalk.gray(`  ${storeFile}`))

        console.log(chalk.yellow('\n使用方法:'))
        console.log(
            chalk.gray(`  import { use${capitalize(answers.name)}Store } from '@/store/${answers.name}'`)
        )
    } catch (error) {
        spinner.fail(chalk.red('Store 生成失败'))
        console.error(error)
    }
}

/**
 * 生成页面模板
 */
function generatePageTemplate(answers) {
    const { name, title, useProTable, useProForm } = answers

    let imports = `import { ref } from 'vue'\n`
    let components = []

    if (useProTable) {
        imports += `import { ProTable } from '@/components/pro'\nimport type { ProTableColumn } from '@/components/pro'\n`
        components.push('ProTable')
    }

    if (useProForm) {
        imports += `import { ProForm, FormFieldType } from '@/components/pro'\nimport type { ProFormField } from '@/components/pro'\n`
        components.push('ProForm')
    }

    return `<template>
  <div class="${name.toLowerCase()}-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>${title}</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      ${useProTable ? generateProTableCode() : generateBasicTableCode()}
    </el-card>

    ${useProForm ? generateProFormDialog() : generateBasicFormDialog()}
  </div>
</template>

<script setup lang="ts">
${imports}

/**
 * 数据接口
 */
interface DataItem {
  id: number
  name: string
  status: number
  createTime: string
}

${useProTable ? generateProTableScript() : generateBasicTableScript()}

${useProForm ? generateProFormScript() : generateBasicFormScript()}

/**
 * 新增
 */
function handleAdd() {
  dialogVisible.value = true
  dialogTitle.value = '新增'
  formData.value = {
    name: '',
    status: 1
  }
}

/**
 * 编辑
 */
function handleEdit(row: DataItem) {
  dialogVisible.value = true
  dialogTitle.value = '编辑'
  formData.value = { ...row }
}

/**
 * 删除
 */
async function handleDelete(row: DataItem) {
  await ElMessageBox.confirm('确定要删除吗?', '提示', {
    type: 'warning'
  })
  
  // TODO: 调用删除 API
  ElMessage.success('删除成功')
}

/**
 * 提交表单
 */
async function handleSubmit() {
  // TODO: 调用保存 API
  ElMessage.success('保存成功')
  dialogVisible.value = false
}
</script>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: '${name}'
}
</script>

<style scoped lang="scss">
.${name.toLowerCase()}-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
`
}

/**
 * 生成 ProTable 代码
 */
function generateProTableCode() {
    return `<ProTable
        ref="tableRef"
        :columns="columns"
        :request="loadData"
        selectable
      >
        <template #status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>

        <template #action="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </ProTable>`
}

/**
 * 生成基础表格代码
 */
function generateBasicTableCode() {
    return `<el-table :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />`
}

/**
 * 生成 ProTable Script
 */
function generateProTableScript() {
    return `// 表格引用
const tableRef = ref()

// 表格列配置
const columns: ProTableColumn<DataItem>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', minWidth: 120 },
  { prop: 'status', label: '状态', width: 100, slotName: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 },
  { label: '操作', width: 150, fixed: 'right', slotName: 'action' }
]

/**
 * 加载数据
 */
async function loadData(params: any) {
  // TODO: 调用 API
  return {
    data: [],
    total: 0
  }
}`
}

/**
 * 生成基础表格 Script
 */
function generateBasicTableScript() {
    return `// 表格数据
const tableData = ref<DataItem[]>([])

// 分页
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

/**
 * 加载数据
 */
async function loadData() {
  // TODO: 调用 API
  tableData.value = []
  pagination.value.total = 0
}`
}

/**
 * 生成 ProForm 对话框
 */
function generateProFormDialog() {
    return `<el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <ProForm
        v-model="formData"
        :fields="formFields"
        @submit="handleSubmit"
      />
    </el-dialog>`
}

/**
 * 生成基础表单对话框
 */
function generateBasicFormDialog() {
    return `<el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>`
}

/**
 * 生成 ProForm Script
 */
function generateProFormScript() {
    return `// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 表单数据
const formData = ref({
  name: '',
  status: 1
})

// 表单字段配置
const formFields: ProFormField<typeof formData.value>[] = [
  {
    name: 'name',
    label: '名称',
    type: FormFieldType.INPUT,
    required: true
  },
  {
    name: 'status',
    label: '状态',
    type: FormFieldType.RADIO,
    required: true,
    fieldProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  }
]`
}

/**
 * 生成基础表单 Script
 */
function generateBasicFormScript() {
    return `// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 表单数据
const formData = ref({
  name: '',
  status: 1
})`
}

/**
 * 生成组件模板
 */
function generateComponentTemplate(answers) {
    const { name, withProps, withEmits } = answers

    let propsCode = ''
    let emitsCode = ''

    if (withProps) {
        propsCode = `
/**
 * Props
 */
interface Props {
  // TODO: 定义 Props
}

const props = withDefaults(defineProps<Props>(), {
  // TODO: 设置默认值
})
`
    }

    if (withEmits) {
        emitsCode = `
/**
 * Emits
 */
interface Emits {
  // TODO: 定义 Emits
  // (e: 'update', value: string): void
}

const emit = defineEmits<Emits>()
`
    }

    return `<template>
  <div class="${name.toLowerCase()}">
    <!-- TODO: 实现组件内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
${propsCode}${emitsCode}
// TODO: 实现组件逻辑
</script>

<script lang="ts">
export default {
  name: '${name}'
}
</script>

<style scoped lang="scss">
.${name.toLowerCase()} {
  // TODO: 添加样式
}
</style>
`
}

/**
 * 生成 API 模板
 */
function generateApiTemplate(answers) {
    const { name, baseUrl } = answers
    const capitalName = capitalize(name)

    return `/**
 * ${capitalName} API
 */

import request from '@/utils/request'

/**
 * ${capitalName} 接口
 */
export interface ${capitalName} {
  id: number
  name: string
  status: number
  createTime: string
}

/**
 * 查询参数
 */
export interface ${capitalName}Query {
  page?: number
  pageSize?: number
  name?: string
  status?: number
}

/**
 * 获取${capitalName}列表
 */
export function get${capitalName}List(params?: ${capitalName}Query) {
  return request<{ data: ${capitalName}[]; total: number }>({
    url: '${baseUrl}/list',
    method: 'get',
    params
  })
}

/**
 * 获取${capitalName}详情
 */
export function get${capitalName}Detail(id: number) {
  return request<${capitalName}>({
    url: \`${baseUrl}/\${id}\`,
    method: 'get'
  })
}

/**
 * 创建${capitalName}
 */
export function create${capitalName}(data: Partial<${capitalName}>) {
  return request({
    url: '${baseUrl}',
    method: 'post',
    data
  })
}

/**
 * 更新${capitalName}
 */
export function update${capitalName}(id: number, data: Partial<${capitalName}>) {
  return request({
    url: \`${baseUrl}/\${id}\`,
    method: 'put',
    data
  })
}

/**
 * 删除${capitalName}
 */
export function delete${capitalName}(id: number) {
  return request({
    url: \`${baseUrl}/\${id}\`,
    method: 'delete'
  })
}
`
}

/**
 * 生成 Store 模板
 */
function generateStoreTemplate(answers) {
    const { name, withPersist } = answers
    const capitalName = capitalize(name)

    let persistCode = ''
    if (withPersist) {
        persistCode = `, {
    persist: {
      enabled: true,
      strategies: [
        {
          key: '${name}',
          storage: localStorage
        }
      ]
    }
  }`
    }

    return `/**
 * ${capitalName} Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * ${capitalName} 状态接口
 */
export interface ${capitalName}State {
  // TODO: 定义状态
}

/**
 * ${capitalName} Store
 */
export const use${capitalName}Store = defineStore('${name}', () => {
  // 状态
  const state = ref<${capitalName}State>({
    // TODO: 初始化状态
  })

  // Getters
  // const someGetter = computed(() => state.value.xxx)

  // Actions
  function someAction() {
    // TODO: 实现 Action
  }

  return {
    state,
    // someGetter,
    someAction
  }
}${persistCode})
`
}

/**
 * 首字母大写
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
