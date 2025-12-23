/**
 * 加密 Composable
 * 提供响应式的加密功能
 */

import { ref, computed } from 'vue'
import { crypto, CryptoUtil, type HashAlgorithm } from '@/utils/crypto'

/**
 * 加密 Composable 配置
 */
export interface UseCryptoOptions {
    /** 是否自动加密 */
    autoEncrypt?: boolean
    /** 是否自动解密 */
    autoDecrypt?: boolean
}

/**
 * 使用加密功能
 * @param options 配置选项
 * @returns 加密相关方法和状态
 */
export function useCrypto(options: UseCryptoOptions = {}) {
    const { autoEncrypt = false, autoDecrypt = false } = options

    // 加密状态
    const isEncrypting = ref(false)
    const isDecrypting = ref(false)
    const error = ref<Error | null>(null)

    /**
     * 加密数据
     * @param data 要加密的数据
     * @returns 加密后的字符串
     */
    const encrypt = (data: string): string => {
        try {
            isEncrypting.value = true
            error.value = null
            return crypto.encrypt(data)
        } catch (err) {
            error.value = err as Error
            throw err
        } finally {
            isEncrypting.value = false
        }
    }

    /**
     * 解密数据
     * @param encryptedData 加密的数据
     * @returns 解密后的字符串
     */
    const decrypt = (encryptedData: string): string => {
        try {
            isDecrypting.value = true
            error.value = null
            return crypto.decrypt(encryptedData)
        } catch (err) {
            error.value = err as Error
            throw err
        } finally {
            isDecrypting.value = false
        }
    }

    /**
     * 加密对象
     * @param obj 要加密的对象
     * @returns 加密后的字符串
     */
    const encryptObject = <T = any>(obj: T): string => {
        try {
            isEncrypting.value = true
            error.value = null
            return crypto.encryptObject(obj)
        } catch (err) {
            error.value = err as Error
            throw err
        } finally {
            isEncrypting.value = false
        }
    }

    /**
     * 解密对象
     * @param encryptedData 加密的数据
     * @returns 解密后的对象
     */
    const decryptObject = <T = any>(encryptedData: string): T => {
        try {
            isDecrypting.value = true
            error.value = null
            return crypto.decryptObject<T>(encryptedData)
        } catch (err) {
            error.value = err as Error
            throw err
        } finally {
            isDecrypting.value = false
        }
    }

    /**
     * 哈希数据
     * @param data 要哈希的数据
     * @param algorithm 哈希算法
     * @returns 哈希值
     */
    const hash = (data: string, algorithm: HashAlgorithm = 'SHA256'): string => {
        try {
            error.value = null
            return CryptoUtil.hash(data, algorithm)
        } catch (err) {
            error.value = err as Error
            throw err
        }
    }

    /**
     * Base64 编码
     * @param data 要编码的数据
     * @returns Base64 字符串
     */
    const base64Encode = (data: string): string => {
        try {
            error.value = null
            return CryptoUtil.base64Encode(data)
        } catch (err) {
            error.value = err as Error
            throw err
        }
    }

    /**
     * Base64 解码
     * @param base64Data Base64 字符串
     * @returns 解码后的字符串
     */
    const base64Decode = (base64Data: string): string => {
        try {
            error.value = null
            return CryptoUtil.base64Decode(base64Data)
        } catch (err) {
            error.value = err as Error
            throw err
        }
    }

    /**
     * HMAC 签名
     * @param data 要签名的数据
     * @param secretKey 密钥
     * @param algorithm 算法
     * @returns 签名
     */
    const hmac = (
        data: string,
        secretKey: string,
        algorithm: HashAlgorithm = 'SHA256'
    ): string => {
        try {
            error.value = null
            return CryptoUtil.hmac(data, secretKey, algorithm)
        } catch (err) {
            error.value = err as Error
            throw err
        }
    }

    /**
     * 验证 HMAC 签名
     * @param data 原始数据
     * @param signature 签名
     * @param secretKey 密钥
     * @param algorithm 算法
     * @returns 是否验证通过
     */
    const verifyHmac = (
        data: string,
        signature: string,
        secretKey: string,
        algorithm: HashAlgorithm = 'SHA256'
    ): boolean => {
        try {
            error.value = null
            return CryptoUtil.verifyHmac(data, signature, secretKey, algorithm)
        } catch (err) {
            error.value = err as Error
            return false
        }
    }

    /**
     * 生成随机密钥
     * @param length 密钥长度
     * @returns 随机密钥
     */
    const generateKey = (length: number = 32): string => {
        try {
            error.value = null
            return CryptoUtil.generateKey(length)
        } catch (err) {
            error.value = err as Error
            throw err
        }
    }

    // 是否正在处理
    const isProcessing = computed(() => isEncrypting.value || isDecrypting.value)

    // 是否有错误
    const hasError = computed(() => error.value !== null)

    return {
        // 状态
        isEncrypting,
        isDecrypting,
        isProcessing,
        error,
        hasError,

        // 方法
        encrypt,
        decrypt,
        encryptObject,
        decryptObject,
        hash,
        base64Encode,
        base64Decode,
        hmac,
        verifyHmac,
        generateKey
    }
}
