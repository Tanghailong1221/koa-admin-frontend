/**
 * 分块上传工具
 * 支持大文件分块上传和断点续传
 */

/**
 * 分块上传配置
 */
export interface ChunkUploadConfig {
    /**
     * 上传地址
     */
    action: string

    /**
     * 分块大小（字节）
     * @default 2 * 1024 * 1024 (2MB)
     */
    chunkSize?: number

    /**
     * 并发上传数量
     * @default 3
     */
    concurrent?: number

    /**
     * 请求头
     */
    headers?: Record<string, string>

    /**
     * 额外的表单数据
     */
    data?: Record<string, any>

    /**
     * 超时时间（毫秒）
     * @default 30000
     */
    timeout?: number

    /**
     * 是否启用断点续传
     * @default true
     */
    enableResume?: boolean

    /**
     * 重试次数
     * @default 3
     */
    retryCount?: number

    /**
     * 重试延迟（毫秒）
     * @default 1000
     */
    retryDelay?: number
}

/**
 * 分块信息
 */
export interface ChunkInfo {
    /**
     * 分块索引
     */
    index: number

    /**
     * 分块开始位置
     */
    start: number

    /**
     * 分块结束位置
     */
    end: number

    /**
     * 分块数据
     */
    blob: Blob

    /**
     * 分块大小
     */
    size: number

    /**
     * 上传状态
     */
    status: 'waiting' | 'uploading' | 'success' | 'error'

    /**
     * 上传进度（0-100）
     */
    progress: number

    /**
     * 重试次数
     */
    retryCount: number

    /**
     * 错误信息
     */
    error?: string
}

/**
 * 上传任务
 */
export interface UploadTask {
    /**
     * 任务 ID
     */
    id: string

    /**
     * 文件对象
     */
    file: File

    /**
     * 文件哈希值
     */
    hash: string

    /**
     * 分块列表
     */
    chunks: ChunkInfo[]

    /**
     * 总分块数
     */
    totalChunks: number

    /**
     * 已上传分块数
     */
    uploadedChunks: number

    /**
     * 上传状态
     */
    status: 'waiting' | 'uploading' | 'success' | 'error' | 'paused'

    /**
     * 总进度（0-100）
     */
    progress: number

    /**
     * 开始时间
     */
    startTime?: number

    /**
     * 结束时间
     */
    endTime?: number

    /**
     * 上传速度（字节/秒）
     */
    speed?: number

    /**
     * 剩余时间（秒）
     */
    remainingTime?: number
}

/**
 * 分块上传器
 */
export class ChunkUploader {
    private config: Required<ChunkUploadConfig>
    private tasks: Map<string, UploadTask> = new Map()
    private abortControllers: Map<string, AbortController> = new Map()

    constructor(config: ChunkUploadConfig) {
        this.config = {
            chunkSize: 2 * 1024 * 1024, // 2MB
            concurrent: 3,
            timeout: 30000,
            enableResume: true,
            retryCount: 3,
            retryDelay: 1000,
            headers: {},
            data: {},
            ...config
        }
    }

    /**
     * 上传文件
     */
    async upload(
        file: File,
        onProgress?: (progress: number, task: UploadTask) => void
    ): Promise<any> {
        // 生成任务 ID
        const taskId = `${file.name}-${file.size}-${Date.now()}`

        // 计算文件哈希
        const hash = await this.calculateHash(file)

        // 检查是否可以秒传
        const canSkip = await this.checkFileExists(hash)
        if (canSkip) {
            console.log('[ChunkUploader] 文件已存在，秒传成功')
            return { success: true, message: '秒传成功' }
        }

        // 创建上传任务
        const task = await this.createTask(taskId, file, hash)
        this.tasks.set(taskId, task)

        // 检查断点续传
        if (this.config.enableResume) {
            await this.loadProgress(task)
        }

        // 开始上传
        task.status = 'uploading'
        task.startTime = Date.now()

        try {
            // 上传所有分块
            await this.uploadChunks(task, onProgress)

            // 合并分块
            const result = await this.mergeChunks(task)

            // 更新任务状态
            task.status = 'success'
            task.endTime = Date.now()
            task.progress = 100

            // 清理任务
            this.tasks.delete(taskId)
            this.clearProgress(task)

            console.log('[ChunkUploader] 上传成功')
            return result
        } catch (error: any) {
            task.status = 'error'
            task.endTime = Date.now()
            console.error('[ChunkUploader] 上传失败:', error)
            throw error
        }
    }

    /**
     * 暂停上传
     */
    pause(taskId: string): void {
        const task = this.tasks.get(taskId)
        if (!task) return

        task.status = 'paused'

        // 取消所有正在上传的请求
        const controller = this.abortControllers.get(taskId)
        if (controller) {
            controller.abort()
            this.abortControllers.delete(taskId)
        }

        // 保存进度
        if (this.config.enableResume) {
            this.saveProgress(task)
        }

        console.log('[ChunkUploader] 上传已暂停')
    }

    /**
     * 恢复上传
     */
    async resume(
        taskId: string,
        onProgress?: (progress: number, task: UploadTask) => void
    ): Promise<any> {
        const task = this.tasks.get(taskId)
        if (!task || task.status !== 'paused') return

        task.status = 'uploading'

        try {
            await this.uploadChunks(task, onProgress)
            const result = await this.mergeChunks(task)

            task.status = 'success'
            task.endTime = Date.now()
            task.progress = 100

            this.tasks.delete(taskId)
            this.clearProgress(task)

            console.log('[ChunkUploader] 恢复上传成功')
            return result
        } catch (error: any) {
            task.status = 'error'
            console.error('[ChunkUploader] 恢复上传失败:', error)
            throw error
        }
    }

    /**
     * 取消上传
     */
    cancel(taskId: string): void {
        const task = this.tasks.get(taskId)
        if (!task) return

        // 取消所有请求
        const controller = this.abortControllers.get(taskId)
        if (controller) {
            controller.abort()
            this.abortControllers.delete(taskId)
        }

        // 清理任务
        this.tasks.delete(taskId)
        this.clearProgress(task)

        console.log('[ChunkUploader] 上传已取消')
    }

    /**
     * 创建上传任务
     */
    private async createTask(
        taskId: string,
        file: File,
        hash: string
    ): Promise<UploadTask> {
        const chunks = this.createChunks(file)

        return {
            id: taskId,
            file,
            hash,
            chunks,
            totalChunks: chunks.length,
            uploadedChunks: 0,
            status: 'waiting',
            progress: 0
        }
    }

    /**
     * 创建分块
     */
    private createChunks(file: File): ChunkInfo[] {
        const chunks: ChunkInfo[] = []
        const totalSize = file.size
        const chunkSize = this.config.chunkSize
        const totalChunks = Math.ceil(totalSize / chunkSize)

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize
            const end = Math.min(start + chunkSize, totalSize)
            const blob = file.slice(start, end)

            chunks.push({
                index: i,
                start,
                end,
                blob,
                size: blob.size,
                status: 'waiting',
                progress: 0,
                retryCount: 0
            })
        }

        return chunks
    }

    /**
     * 上传所有分块
     */
    private async uploadChunks(
        task: UploadTask,
        onProgress?: (progress: number, task: UploadTask) => void
    ): Promise<void> {
        const controller = new AbortController()
        this.abortControllers.set(task.id, controller)

        // 过滤出未上传的分块
        const pendingChunks = task.chunks.filter(
            chunk => chunk.status !== 'success'
        )

        // 并发上传
        const concurrent = this.config.concurrent
        for (let i = 0; i < pendingChunks.length; i += concurrent) {
            if (task.status === 'paused') break

            const batch = pendingChunks.slice(i, i + concurrent)
            await Promise.all(
                batch.map(chunk => this.uploadChunk(task, chunk, controller.signal))
            )

            // 更新进度
            this.updateProgress(task, onProgress)
        }

        this.abortControllers.delete(task.id)
    }

    /**
     * 上传单个分块
     */
    private async uploadChunk(
        task: UploadTask,
        chunk: ChunkInfo,
        signal: AbortSignal
    ): Promise<void> {
        chunk.status = 'uploading'

        for (let i = 0; i <= this.config.retryCount; i++) {
            try {
                await this.doUploadChunk(task, chunk, signal)
                chunk.status = 'success'
                chunk.progress = 100
                task.uploadedChunks++
                return
            } catch (error: any) {
                if (signal.aborted) {
                    throw new Error('上传已取消')
                }

                chunk.retryCount = i
                chunk.error = error.message

                if (i < this.config.retryCount) {
                    console.warn(
                        `[ChunkUploader] 分块 ${chunk.index} 上传失败，${this.config.retryDelay}ms 后重试 (${i + 1}/${this.config.retryCount})`
                    )
                    await this.delay(this.config.retryDelay)
                } else {
                    chunk.status = 'error'
                    throw new Error(`分块 ${chunk.index} 上传失败: ${error.message}`)
                }
            }
        }
    }

    /**
     * 执行分块上传
     */
    private async doUploadChunk(
        task: UploadTask,
        chunk: ChunkInfo,
        signal: AbortSignal
    ): Promise<void> {
        const formData = new FormData()
        formData.append('file', chunk.blob)
        formData.append('hash', task.hash)
        formData.append('index', String(chunk.index))
        formData.append('total', String(task.totalChunks))

        // 添加额外数据
        Object.entries(this.config.data).forEach(([key, value]) => {
            formData.append(key, value)
        })

        const response = await fetch(this.config.action, {
            method: 'POST',
            headers: this.config.headers,
            body: formData,
            signal
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        if (!result.success) {
            throw new Error(result.message || '上传失败')
        }
    }

    /**
     * 合并分块
     */
    private async mergeChunks(task: UploadTask): Promise<any> {
        const response = await fetch(`${this.config.action}/merge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            },
            body: JSON.stringify({
                hash: task.hash,
                filename: task.file.name,
                total: task.totalChunks,
                ...this.config.data
            })
        })

        if (!response.ok) {
            throw new Error(`合并失败: HTTP ${response.status}`)
        }

        return await response.json()
    }

    /**
     * 计算文件哈希
     */
    private async calculateHash(file: File): Promise<string> {
        // 简化版：使用文件名、大小和修改时间生成哈希
        // 生产环境建议使用 spark-md5 等库计算真实的文件哈希
        const str = `${file.name}-${file.size}-${file.lastModified}`
        return btoa(str).replace(/[^a-zA-Z0-9]/g, '')
    }

    /**
     * 检查文件是否已存在（秒传）
     */
    private async checkFileExists(hash: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.action}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({ hash })
            })

            if (response.ok) {
                const result = await response.json()
                return result.exists === true
            }
        } catch (error) {
            console.warn('[ChunkUploader] 检查文件失败:', error)
        }

        return false
    }

    /**
     * 更新进度
     */
    private updateProgress(
        task: UploadTask,
        onProgress?: (progress: number, task: UploadTask) => void
    ): void {
        const uploadedSize = task.chunks
            .filter(chunk => chunk.status === 'success')
            .reduce((sum, chunk) => sum + chunk.size, 0)

        const totalSize = task.file.size
        task.progress = Math.round((uploadedSize / totalSize) * 100)

        // 计算上传速度和剩余时间
        if (task.startTime) {
            const elapsed = (Date.now() - task.startTime) / 1000 // 秒
            task.speed = Math.round(uploadedSize / elapsed) // 字节/秒

            const remainingSize = totalSize - uploadedSize
            task.remainingTime = Math.round(remainingSize / task.speed) // 秒
        }

        if (onProgress) {
            onProgress(task.progress, task)
        }
    }

    /**
     * 保存进度
     */
    private saveProgress(task: UploadTask): void {
        const key = `chunk-upload-${task.hash}`
        const data = {
            chunks: task.chunks.map(chunk => ({
                index: chunk.index,
                status: chunk.status
            })),
            uploadedChunks: task.uploadedChunks,
            progress: task.progress
        }

        localStorage.setItem(key, JSON.stringify(data))
    }

    /**
     * 加载进度
     */
    private async loadProgress(task: UploadTask): Promise<void> {
        const key = `chunk-upload-${task.hash}`
        const data = localStorage.getItem(key)

        if (data) {
            try {
                const saved = JSON.parse(data)
                saved.chunks.forEach((savedChunk: any) => {
                    const chunk = task.chunks[savedChunk.index]
                    if (chunk && savedChunk.status === 'success') {
                        chunk.status = 'success'
                        chunk.progress = 100
                        task.uploadedChunks++
                    }
                })

                console.log(`[ChunkUploader] 已加载断点续传进度: ${task.uploadedChunks}/${task.totalChunks}`)
            } catch (error) {
                console.warn('[ChunkUploader] 加载进度失败:', error)
            }
        }
    }

    /**
     * 清除进度
     */
    private clearProgress(task: UploadTask): void {
        const key = `chunk-upload-${task.hash}`
        localStorage.removeItem(key)
    }

    /**
     * 延迟
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 获取任务
     */
    getTask(taskId: string): UploadTask | undefined {
        return this.tasks.get(taskId)
    }

    /**
     * 获取所有任务
     */
    getAllTasks(): UploadTask[] {
        return Array.from(this.tasks.values())
    }
}

/**
 * 创建分块上传器
 */
export function createChunkUploader(config: ChunkUploadConfig): ChunkUploader {
    return new ChunkUploader(config)
}
