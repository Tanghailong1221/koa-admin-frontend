/**
 * CryptoUtil 单元测试
 */

import { describe, it, expect } from 'vitest'
import { CryptoUtil } from '../crypto'

describe('CryptoUtil', () => {
    const crypto = new CryptoUtil('test-secret-key')

    describe('AES 加密/解密', () => {
        it('应该能够加密和解密字符串', () => {
            const plaintext = 'Hello, World!'
            const encrypted = crypto.encrypt(plaintext)
            const decrypted = crypto.decrypt(encrypted)

            expect(encrypted).not.toBe(plaintext)
            expect(decrypted).toBe(plaintext)
        })

        it('应该能够加密和解密中文', () => {
            const plaintext = '你好，世界！'
            const encrypted = crypto.encrypt(plaintext)
            const decrypted = crypto.decrypt(encrypted)

            expect(decrypted).toBe(plaintext)
        })

        it('应该能够加密和解密特殊字符', () => {
            const plaintext = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
            const encrypted = crypto.encrypt(plaintext)
            const decrypted = crypto.decrypt(encrypted)

            expect(decrypted).toBe(plaintext)
        })

        it('应该能够加密和解密空字符串', () => {
            const plaintext = ''
            const encrypted = crypto.encrypt(plaintext)
            const decrypted = crypto.decrypt(encrypted)

            expect(decrypted).toBe(plaintext)
        })

        it('应该在解密无效数据时返回空字符串', () => {
            const decrypted = crypto.decrypt('invalid-encrypted-data')
            expect(decrypted).toBe('')
        })
    })

    describe('对象加密/解密', () => {
        it('应该能够加密和解密对象', () => {
            const obj = {
                username: 'admin',
                password: '123456',
                email: 'admin@example.com'
            }

            const encrypted = crypto.encryptObject(obj)
            const decrypted = crypto.decryptObject<typeof obj>(encrypted)

            expect(encrypted).not.toBe(JSON.stringify(obj))
            expect(decrypted).toEqual(obj)
        })

        it('应该能够加密和解密嵌套对象', () => {
            const obj = {
                user: {
                    name: 'admin',
                    profile: {
                        age: 25,
                        city: 'Beijing'
                    }
                }
            }

            const encrypted = crypto.encryptObject(obj)
            const decrypted = crypto.decryptObject<typeof obj>(encrypted)

            expect(decrypted).toEqual(obj)
        })

        it('应该能够加密和解密数组', () => {
            const arr = [1, 2, 3, 'a', 'b', 'c', { key: 'value' }]

            const encrypted = crypto.encryptObject(arr)
            const decrypted = crypto.decryptObject<typeof arr>(encrypted)

            expect(decrypted).toEqual(arr)
        })

        it('应该在解密无效数据时返回 null', () => {
            const decrypted = crypto.decryptObject('invalid-encrypted-data')
            expect(decrypted).toBeNull()
        })
    })

    describe('哈希', () => {
        it('应该能够计算 MD5 哈希', () => {
            const hash = crypto.hash('password', 'MD5')
            expect(hash).toBe('5f4dcc3b5aa765d61d8327deb882cf99')
        })

        it('应该能够计算 SHA256 哈希', () => {
            const hash = crypto.hash('password', 'SHA256')
            expect(hash).toBe('5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8')
        })

        it('应该能够计算 SHA512 哈希', () => {
            const hash = crypto.hash('password', 'SHA512')
            expect(hash.length).toBe(128) // SHA512 输出 128 个十六进制字符
        })

        it('相同的输入应该产生相同的哈希', () => {
            const hash1 = crypto.hash('password', 'SHA256')
            const hash2 = crypto.hash('password', 'SHA256')
            expect(hash1).toBe(hash2)
        })

        it('不同的输入应该产生不同的哈希', () => {
            const hash1 = crypto.hash('password1', 'SHA256')
            const hash2 = crypto.hash('password2', 'SHA256')
            expect(hash1).not.toBe(hash2)
        })
    })

    describe('HMAC 签名', () => {
        it('应该能够生成 HMAC 签名', () => {
            const signature = crypto.hmac('data', 'secret-key', 'SHA256')
            expect(signature).toBeTruthy()
            expect(typeof signature).toBe('string')
        })

        it('应该能够验证 HMAC 签名', () => {
            const data = 'important-data'
            const key = 'secret-key'
            const signature = crypto.hmac(data, key, 'SHA256')

            expect(crypto.verifyHmac(data, signature, key, 'SHA256')).toBe(true)
        })

        it('应该在签名不匹配时返回 false', () => {
            const data = 'important-data'
            const key = 'secret-key'
            const signature = crypto.hmac(data, key, 'SHA256')

            // 修改数据
            expect(crypto.verifyHmac('modified-data', signature, key, 'SHA256')).toBe(false)

            // 修改密钥
            expect(crypto.verifyHmac(data, signature, 'wrong-key', 'SHA256')).toBe(false)
        })

        it('相同的输入应该产生相同的签名', () => {
            const signature1 = crypto.hmac('data', 'key', 'SHA256')
            const signature2 = crypto.hmac('data', 'key', 'SHA256')
            expect(signature1).toBe(signature2)
        })
    })

    describe('Base64 编码/解码', () => {
        it('应该能够编码和解码 Base64', () => {
            const plaintext = 'Hello, World!'
            const encoded = crypto.base64Encode(plaintext)
            const decoded = crypto.base64Decode(encoded)

            expect(encoded).not.toBe(plaintext)
            expect(decoded).toBe(plaintext)
        })

        it('应该能够编码和解码中文', () => {
            const plaintext = '你好，世界！'
            const encoded = crypto.base64Encode(plaintext)
            const decoded = crypto.base64Decode(encoded)

            expect(decoded).toBe(plaintext)
        })
    })

    describe('随机字符串生成', () => {
        it('应该能够生成指定长度的随机字符串', () => {
            const random = crypto.randomString(16)
            expect(random.length).toBe(16)
        })

        it('应该生成不同的随机字符串', () => {
            const random1 = crypto.randomString(16)
            const random2 = crypto.randomString(16)
            expect(random1).not.toBe(random2)
        })

        it('应该只包含十六进制字符', () => {
            const random = crypto.randomString(32)
            expect(/^[0-9a-f]+$/.test(random)).toBe(true)
        })
    })
})
