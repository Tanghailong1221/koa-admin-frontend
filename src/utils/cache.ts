import CryptoJS from 'crypto-js'

/**
 * 缓存条目接口
 */
export interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
    version: number
}

/**
 * 缓存管理器配置
 */
export interface CacheManagerOptions {
    storage?: Storage
    prefix?: string
    defaultTTL?: number
    version?: number
    encrypt?: boolean
    encryptionKey?: string
}

/**
 * 缓存管理器类
 * 提供带 TTL、版本控制和加密的缓存功能
 */
export class CacheManager {
    private storage: Storage
    private prefix: string
    private defaultTTL: number
    private version: number
    private encrypt: boolean
    private encryptionKey: string

    constructor(options: CacheManagerOptions = {}) {
        this.storage = options.storage || localStorage
        this.prefix = options.prefix || 'app_cache_'
        this.defaultTTL = options.defaultTTL || 0 // 0 表示永不过期
        this.version = options.version || 1
        this.encrypt = options.encrypt || false
        this.encryptionKey = options.encryptionKey || 'default_key'
    }

    /**
     * 生成完整的存储键
     */
    private getFullKey(key: string): string {
        return `${this.prefix}${key}`
    }

    /**
     * 加密数据
     */
    private encryptData(data: string): string {
        if (!this.encrypt) return data
        return CryptoJS.AES.encrypt(data, this.encryptionKey).toString()
    }

    /**
     * 解密数据
     */
    private decryptData(encryptedData: string): string {
        if (!this.encrypt) return encryptedData
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey)
            return bytes.toString(CryptoJS.enc.Utf8)
        } catch (error) {
            console.error('解密失败:', error)
            return ''
        }
    }

    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param ttl 生存时间（毫秒），0 表示永不过期
     */
    set<T>(key: string, value: T, ttl?: number): void {
        const entry: CacheEntry<T> = {
            data: value,
            timestamp: Date.now(),
            ttl: ttl !== undefined ? ttl : this.defaultTTL,
            version: this.version,
        }

        try {
            const jsonString = JSON.stringify(entry)
            const dataToStore = this.encryptData(jsonString)
            this.storage.setItem(this.getFullKey(key), dataToStore)
        } catch (error) {
            console.error('缓存设置失败:', error)
        }
    }

    /**
     * 获取缓存
     * @param key 缓存键
     * @returns 缓存值，如果不存在、已过期或版本不匹配则返回 null
     */
    get<T>(key: string): T | null {
        try {
            const fullKey = this.getFullKey(key)
            const encryptedData = this.storage.getItem(fullKey)

            if (!encryptedData) {
                return null
            }

            const jsonString = this.decryptData(encryptedData)
            if (!jsonString) {
                this.remove(key)
                return null
            }

            const entry: CacheEntry<T> = JSON.parse(jsonString)

            // 检查版本
            if (entry.version !== this.version) {
                this.remove(key)
                return null
            }

            // 检查是否过期
            if (this.isExpired(key)) {
                this.remove(key)
                return null
            }

            return entry.data
        } catch (error) {
            console.error('缓存获取失败:', error)
            this.remove(key)
            return null
        }
    }

    /**
     * 检查缓存是否存在
     * @param key 缓存键
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }

    /**
     * 检查缓存是否过期
     * @param key 缓存键
     */
    isExpired(key: string): boolean {
        try {
            const fullKey = this.getFullKey(key)
            const encryptedData = this.storage.getItem(fullKey)

            if (!encryptedData) {
                return true
            }

            const jsonString = this.decryptData(encryptedData)
            if (!jsonString) {
                return true
            }

            const entry: CacheEntry<any> = JSON.parse(jsonString)

            // TTL 为 0 表示永不过期
            if (entry.ttl === 0) {
                return false
            }

            const now = Date.now()
            return now - entry.timestamp > entry.ttl
        } catch (error) {
            console.error('检查过期失败:', error)
            return true
        }
    }

    /**
     * 删除缓存
     * @param key 缓存键
     */
    remove(key: string): void {
        this.storage.removeItem(this.getFullKey(key))
    }

    /**
     * 清除所有缓存
     */
    clear(): void {
        const keys: string[] = []

        // 收集所有匹配前缀的键
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i)
            if (key && key.startsWith(this.prefix)) {
                keys.push(key)
            }
        }

        // 删除所有匹配的键
        keys.forEach(key => this.storage.removeItem(key))
    }

    /**
     * 获取所有缓存键（不包含前缀）
     */
    keys(): string[] {
        const keys: string[] = []

        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i)
            if (key && key.startsWith(this.prefix)) {
                keys.push(key.substring(this.prefix.length))
            }
        }

        return keys
    }

    /**
     * 获取缓存大小（条目数量）
     */
    size(): number {
        return this.keys().length
    }

    /**
     * 清理所有过期的缓存
     */
    clearExpired(): void {
        const keys = this.keys()
        keys.forEach(key => {
            if (this.isExpired(key)) {
                this.remove(key)
            }
        })
    }
}

// 导出默认实例（延迟初始化）
let _cacheManager: CacheManager | null = null
export const getCacheManager = (): CacheManager => {
    if (!_cacheManager) {
        _cacheManager = new CacheManager({
            prefix: 'app_cache_',
            defaultTTL: 3600000, // 1 小时
            version: 1,
            encrypt: false,
        })
    }
    return _cacheManager
}

// 导出加密实例（延迟初始化，用于敏感数据）
let _secureCacheManager: CacheManager | null = null
export const getSecureCacheManager = (): CacheManager => {
    if (!_secureCacheManager) {
        _secureCacheManager = new CacheManager({
            prefix: 'app_secure_cache_',
            defaultTTL: 3600000, // 1 小时
            version: 1,
            encrypt: true,
            encryptionKey: import.meta.env.VITE_CACHE_ENCRYPTION_KEY || 'default_secure_key',
        })
    }
    return _secureCacheManager
}
