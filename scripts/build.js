/**
 * 构建脚本
 * 支持多环境构建
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取命令行参数
const args = process.argv.slice(2)
const env = args[0] || 'production'

// 支持的环境
const supportedEnvs = ['development', 'staging', 'production']

if (!supportedEnvs.includes(env)) {
    console.error(`❌ 不支持的环境: ${env}`)
    console.log(`✅ 支持的环境: ${supportedEnvs.join(', ')}`)
    process.exit(1)
}

console.log(`\n🚀 开始构建 ${env} 环境...\n`)

try {
    // 设置环境变量
    process.env.NODE_ENV = env === 'development' ? 'development' : 'production'

    // 执行构建命令
    const command = `vite build --mode ${env}`
    console.log(`📦 执行命令: ${command}\n`)

    execSync(command, {
        stdio: 'inherit',
        env: {
            ...process.env,
            FORCE_COLOR: '1'
        }
    })

    console.log(`\n✅ ${env} 环境构建完成!\n`)

    // 生成构建信息文件
    generateBuildInfo(env)

    // 显示构建产物大小
    showBuildSize()
} catch (error) {
    console.error(`\n❌ 构建失败:`, error.message)
    process.exit(1)
}

/**
 * 生成构建信息文件
 */
function generateBuildInfo(env) {
    const buildInfo = {
        env,
        buildTime: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
    }

    const distPath = path.resolve(__dirname, '../dist')
    const buildInfoPath = path.join(distPath, 'build-info.json')

    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2))

    console.log(`\n📝 构建信息已生成: ${buildInfoPath}`)
    console.log(JSON.stringify(buildInfo, null, 2))
}

/**
 * 显示构建产物大小
 */
function showBuildSize() {
    const distPath = path.resolve(__dirname, '../dist')

    if (!fs.existsSync(distPath)) {
        return
    }

    let totalSize = 0

    function getDirectorySize(dirPath) {
        const files = fs.readdirSync(dirPath)

        files.forEach((file) => {
            const filePath = path.join(dirPath, file)
            const stats = fs.statSync(filePath)

            if (stats.isDirectory()) {
                getDirectorySize(filePath)
            } else {
                totalSize += stats.size
            }
        })
    }

    getDirectorySize(distPath)

    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)

    console.log(`\n📊 构建产物大小: ${sizeMB} MB`)
}
