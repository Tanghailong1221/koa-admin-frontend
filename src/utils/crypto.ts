/**
 * 加密工具类
 * 提供数据加密、解密、哈希等功能
 */

import CryptoJS from 'crypto-js'

/**
 * 加密配置
 */
export interface CryptoConfig {
    /** 加密密钥 */
    secretKey: string
    /** 加密算法（默认 AES） */
    algorithm?: 'AES' | 'DES' | 'TripleDES' | 'RC4'
    /** 编码格式（默认 Base64） */
    encoding?: 'Base64' | 'Hex' | 'Latin1' | 'Utf8'
}

/**
 * 哈希算法类型
 */
export type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'

/**
 * 加密工具类
 */
export class CryptoUtil {
    private config: Required<CryptoConfig>

    constructor(config: CryptoConfig) {
        this.config = {
            algorithm: 'AES',
            encoding: 'Base64',
            ...config
        }
    }

    /**
     * 加密数据
     * @param data 要加密的数据
     * @returns 加密后的字符串
     */
    encrypt(data: string): string {
        try {
            const { algorithm, secretKey } = this.config

            let encrypted: CryptoJS.lib.CipherParams

            switch (algorithm) {
                case 'AES':
                    encrypted = CryptoJS.AES.encrypt(data, secretKey)
                    break
                case 'DES':
                    encrypted = CryptoJS.DES.encrypt(data, secretKey)
                    break
                case 'TripleDES':
                    encrypted = CryptoJS.TripleDES.encrypt(data, secretKey)
                    break
                case 'RC4':
                    encrypted = CryptoJS.RC4.encrypt(data, secretKey)
                    break
                default:
                    throw new Error(`不支持的加密算法: ${algorithm}`)
            }

            return encrypted.toString()
        } catch (error) {
            console.error('加密失败:', error)
            throw new Error('数据加密失败')
        }
    }

    /**
     * 解密数据
     * @param encryptedData 加密的数据
     * @returns 解密后的字符串
     */
    decrypt(encryptedData: string): string {
        try {
            const { algorithm, secretKey } = this.config

            let decrypted: CryptoJS.lib.WordArray

            switch (algorithm) {
                case 'AES':
                    decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey)
                    break
                case 'DES':
                    decrypted = CryptoJS.DES.decrypt(encryptedData, secretKey)
                    break
                case 'TripleDES':
                    decrypted = CryptoJS.TripleDES.decrypt(encryptedData, secretKey)
                    break
                case 'RC4':
                    decrypted = CryptoJS.RC4.decrypt(encryptedData, secretKey)
                    break
                default:
                    throw new Error(`不支持的加密算法: ${algorithm}`)
            }

            const result = decrypted.toString(CryptoJS.enc.Utf8)

            if (!result) {
                throw new Error('解密失败，可能是密钥错误')
            }

            return result
        } catch (error) {
            console.error('解密失败:', error)
            throw new Error('数据解密失败')
        }
    }

    /**
     * 加密对象
     * @param obj 要加密的对象
     * @returns 加密后的字符串
     */
    encryptObject<T = any>(obj: T): string {
        const jsonStr = JSON.stringify(obj)
        return this.encrypt(jsonStr)
    }

    /**
     * 解密对象
     * @param encryptedData 加密的数据
     * @returns 解密后的对象
     */
    decryptObject<T = any>(encryptedData: string): T {
        const jsonStr = this.decrypt(encryptedData)
        return JSON.parse(jsonStr) as T
    }

    /**
     * 哈希数据
     * @param data 要哈希的数据
     * @param algorithm 哈希算法（默认 SHA256）
     * @returns 哈希值
     */
    static hash(data: string, algorithm: HashAlgorithm = 'SHA256'): string {
        try {
            let hash: CryptoJS.lib.WordArray

            switch (algorithm) {
                case 'MD5':
                    hash = CryptoJS.MD5(data)
                    break
                case 'SHA1':
                    hash = CryptoJS.SHA1(data)
                    break
                case 'SHA256':
                    hash = CryptoJS.SHA256(data)
                    break
                case 'SHA512':
                    hash = CryptoJS.SHA512(data)
                    break
                default:
                    throw new Error(`不支持的哈希算法: ${algorithm}`)
            }

            return hash.toString()
        } catch (error) {
            console.error('哈希失败:', error)
            throw new Error('数据哈希失败')
        }
    }

    /**
     * Base64 编码
     * @param data 要编码的数据
     * @returns Base64 字符串
     */
    static base64Encode(data: string): string {
        try {
            const wordArray = CryptoJS.enc.Utf8.parse(data)
            return CryptoJS.enc.Base64.stringify(wordArray)
        } catch (error) {
            console.error('Base64 编码失败:', error)
            throw new Error('Base64 编码失败')
        }
    }

    /**
     * Base64 解码
     * @param base64Data Base64 字符串
     * @returns 解码后的字符串
     */
    static base64Decode(base64Data: string): string {
        try {
            const wordArray = CryptoJS.enc.Base64.parse(base64Data)
            return wordArray.toString(CryptoJS.enc.Utf8)
        } catch (error) {
            console.error('Base64 解码失败:', error)
            throw new Error('Base64 解码失败')
        }
    }

    /**
     * 生成随机密钥
     * @param length 密钥长度（默认 32）
     * @returns 随机密钥
     */
    static generateKey(length: number = 32): string {
        const wordArray = CryptoJS.lib.WordArray.random(length)
        return wordArray.toString()
    }

    /**
     * HMAC 签名
     * @param data 要签名的数据
     * @param secretKey 密钥
     * @param algorithm 算法（默认 SHA256）
     * @returns 签名
     */
    static hmac(
        data: string,
        secretKey: string,
        algorithm: HashAlgorithm = 'SHA256'
    ): string {
        try {
            let hmac: CryptoJS.lib.WordArray

            switch (algorithm) {
                case 'MD5':
                    hmac = CryptoJS.HmacMD5(data, secretKey)
                    break
                case 'SHA1':
                    hmac = CryptoJS.HmacSHA1(data, secretKey)
                    break
                case 'SHA256':
                    hmac = CryptoJS.HmacSHA256(data, secretKey)
                    break
                case 'SHA512':
                    hmac = CryptoJS.HmacSHA512(data, secretKey)
                    break
                default:
                    throw new Error(`不支持的 HMAC 算法: ${algorithm}`)
            }

            return hmac.toString()
        } catch (error) {
            console.error('HMAC 签名失败:', error)
            throw new Error('HMAC 签名失败')
        }
    }

    /**
     * 验证 HMAC 签名
     * @param data 原始数据
     * @param signature 签名
     * @param secretKey 密钥
     * @param algorithm 算法（默认 SHA256）
     * @returns 是否验证通过
     */
    static verifyHmac(
        data: string,
        signature: string,
        secretKey: string,
        algorithm: HashAlgorithm = 'SHA256'
    ): boolean {
        try {
            const computedSignature = this.hmac(data, secretKey, algorithm)
            return computedSignature === signature
        } catch (error) {
            console.error('HMAC 验证失败:', error)
            return false
        }
    }
}

/**
 * 创建加密工具实例
 * @param config 加密配置
 * @returns 加密工具实例
 */
export function createCrypto(config: CryptoConfig): CryptoUtil {
    return new CryptoUtil(config)
}

/**
 * 默认加密工具实例
 * 使用环境变量中的密钥，如果没有则使用默认密钥（生产环境应该配置）
 */
export const crypto = createCrypto({
    secretKey: import.meta.env.VITE_CRYPTO_SECRET_KEY || 'default-secret-key-change-in-production'
})
