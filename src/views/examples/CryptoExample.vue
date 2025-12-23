<template>
  <div class="crypto-example">
    <el-card header="数据加密示例">
      <el-alert
        title="提示"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        本示例演示了数据加密、解密、哈希、Base64 编码等功能。
      </el-alert>

      <!-- 基础加密/解密 -->
      <el-divider content-position="left">基础加密/解密</el-divider>
      <el-form label-width="120px">
        <el-form-item label="原始数据">
          <el-input
            v-model="plainText"
            type="textarea"
            :rows="3"
            placeholder="请输入要加密的数据"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleEncrypt">
            加密
          </el-button>
          <el-button @click="handleDecrypt" :disabled="!encryptedText">
            解密
          </el-button>
          <el-button @click="handleClear">清空</el-button>
        </el-form-item>

        <el-form-item label="加密后">
          <el-input
            v-model="encryptedText"
            type="textarea"
            :rows="3"
            readonly
            placeholder="加密后的数据"
          />
        </el-form-item>

        <el-form-item label="解密后">
          <el-input
            v-model="decryptedText"
            type="textarea"
            :rows="3"
            readonly
            placeholder="解密后的数据"
          />
        </el-form-item>
      </el-form>

      <!-- 对象加密/解密 -->
      <el-divider content-position="left">对象加密/解密</el-divider>
      <el-form label-width="120px">
        <el-form-item label="用户对象">
          <el-input
            v-model="userJson"
            type="textarea"
            :rows="4"
            placeholder='{"username": "admin", "password": "123456"}'
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleEncryptObject">
            加密对象
          </el-button>
          <el-button @click="handleDecryptObject" :disabled="!encryptedObject">
            解密对象
          </el-button>
        </el-form-item>

        <el-form-item label="加密后">
          <el-input
            v-model="encryptedObject"
            type="textarea"
            :rows="2"
            readonly
          />
        </el-form-item>

        <el-form-item label="解密后">
          <el-input
            v-model="decryptedObject"
            type="textarea"
            :rows="4"
            readonly
          />
        </el-form-item>
      </el-form>

      <!-- 哈希 -->
      <el-divider content-position="left">哈希</el-divider>
      <el-form label-width="120px">
        <el-form-item label="原始数据">
          <el-input v-model="hashInput" placeholder="请输入要哈希的数据" />
        </el-form-item>

        <el-form-item label="哈希算法">
          <el-radio-group v-model="hashAlgorithm">
            <el-radio label="MD5">MD5</el-radio>
            <el-radio label="SHA1">SHA1</el-radio>
            <el-radio label="SHA256">SHA256</el-radio>
            <el-radio label="SHA512">SHA512</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleHash">
            计算哈希
          </el-button>
        </el-form-item>

        <el-form-item label="哈希值">
          <el-input v-model="hashOutput" readonly />
        </el-form-item>
      </el-form>

      <!-- Base64 编码/解码 -->
      <el-divider content-position="left">Base64 编码/解码</el-divider>
      <el-form label-width="120px">
        <el-form-item label="原始数据">
          <el-input
            v-model="base64Input"
            type="textarea"
            :rows="2"
            placeholder="请输入要编码的数据"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleBase64Encode">
            Base64 编码
          </el-button>
          <el-button @click="handleBase64Decode" :disabled="!base64Encoded">
            Base64 解码
          </el-button>
        </el-form-item>

        <el-form-item label="编码后">
          <el-input
            v-model="base64Encoded"
            type="textarea"
            :rows="2"
            readonly
          />
        </el-form-item>

        <el-form-item label="解码后">
          <el-input
            v-model="base64Decoded"
            type="textarea"
            :rows="2"
            readonly
          />
        </el-form-item>
      </el-form>

      <!-- HMAC 签名 -->
      <el-divider content-position="left">HMAC 签名</el-divider>
      <el-form label-width="120px">
        <el-form-item label="原始数据">
          <el-input v-model="hmacData" placeholder="请输入要签名的数据" />
        </el-form-item>

        <el-form-item label="密钥">
          <el-input v-model="hmacKey" placeholder="请输入密钥" />
        </el-form-item>

        <el-form-item label="算法">
          <el-radio-group v-model="hmacAlgorithm">
            <el-radio label="MD5">MD5</el-radio>
            <el-radio label="SHA1">SHA1</el-radio>
            <el-radio label="SHA256">SHA256</el-radio>
            <el-radio label="SHA512">SHA512</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleHmac">
            生成签名
          </el-button>
          <el-button @click="handleVerifyHmac" :disabled="!hmacSignature">
            验证签名
          </el-button>
        </el-form-item>

        <el-form-item label="签名">
          <el-input v-model="hmacSignature" readonly />
        </el-form-item>

        <el-form-item label="验证结果" v-if="hmacVerifyResult !== null">
          <el-tag :type="hmacVerifyResult ? 'success' : 'danger'">
            {{ hmacVerifyResult ? '验证通过' : '验证失败' }}
          </el-tag>
        </el-form-item>
      </el-form>

      <!-- 工具 -->
      <el-divider content-position="left">工具</el-divider>
      <el-form label-width="120px">
        <el-form-item label="生成随机密钥">
          <el-input-number
            v-model="keyLength"
            :min="8"
            :max="64"
            :step="8"
            style="margin-right: 10px"
          />
          <el-button type="primary" @click="handleGenerateKey">
            生成
          </el-button>
        </el-form-item>

        <el-form-item label="密钥">
          <el-input v-model="generatedKey" readonly>
            <template #append>
              <el-button @click="handleCopyKey">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 使用说明 -->
    <el-card header="使用说明" style="margin-top: 20px">
      <el-collapse>
        <el-collapse-item title="基础用法" name="1">
          <pre><code>import { useCrypto } from '@/composables'

const { encrypt, decrypt } = useCrypto()

// 加密
const encrypted = encrypt('敏感数据')

// 解密
const decrypted = decrypt(encrypted)</code></pre>
        </el-collapse-item>

        <el-collapse-item title="对象加密" name="2">
          <pre><code>import { useCrypto } from '@/composables'

const { encryptObject, decryptObject } = useCrypto()

// 加密对象
const user = { username: 'admin', password: '123456' }
const encrypted = encryptObject(user)

// 解密对象
const decrypted = decryptObject&lt;User&gt;(encrypted)</code></pre>
        </el-collapse-item>

        <el-collapse-item title="哈希" name="3">
          <pre><code>import { useCrypto } from '@/composables'

const { hash } = useCrypto()

// 计算哈希
const hashed = hash('password', 'SHA256')</code></pre>
        </el-collapse-item>

        <el-collapse-item title="HMAC 签名" name="4">
          <pre><code>import { useCrypto } from '@/composables'

const { hmac, verifyHmac } = useCrypto()

// 生成签名
const signature = hmac('data', 'secret-key', 'SHA256')

// 验证签名
const isValid = verifyHmac('data', signature, 'secret-key', 'SHA256')</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useCrypto } from '@/composables'
import type { HashAlgorithm } from '@/utils/crypto'

const {
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
} = useCrypto()

// 基础加密/解密
const plainText = ref('这是一段敏感数据')
const encryptedText = ref('')
const decryptedText = ref('')

const handleEncrypt = () => {
  try {
    encryptedText.value = encrypt(plainText.value)
    ElMessage.success('加密成功')
  } catch (error) {
    ElMessage.error('加密失败')
  }
}

const handleDecrypt = () => {
  try {
    decryptedText.value = decrypt(encryptedText.value)
    ElMessage.success('解密成功')
  } catch (error) {
    ElMessage.error('解密失败')
  }
}

const handleClear = () => {
  plainText.value = ''
  encryptedText.value = ''
  decryptedText.value = ''
}

// 对象加密/解密
const userJson = ref(JSON.stringify({ username: 'admin', password: '123456' }, null, 2))
const encryptedObject = ref('')
const decryptedObject = ref('')

const handleEncryptObject = () => {
  try {
    const obj = JSON.parse(userJson.value)
    encryptedObject.value = encryptObject(obj)
    ElMessage.success('对象加密成功')
  } catch (error) {
    ElMessage.error('对象加密失败')
  }
}

const handleDecryptObject = () => {
  try {
    const obj = decryptObject(encryptedObject.value)
    decryptedObject.value = JSON.stringify(obj, null, 2)
    ElMessage.success('对象解密成功')
  } catch (error) {
    ElMessage.error('对象解密失败')
  }
}

// 哈希
const hashInput = ref('password123')
const hashAlgorithm = ref<HashAlgorithm>('SHA256')
const hashOutput = ref('')

const handleHash = () => {
  try {
    hashOutput.value = hash(hashInput.value, hashAlgorithm.value)
    ElMessage.success('哈希计算成功')
  } catch (error) {
    ElMessage.error('哈希计算失败')
  }
}

// Base64 编码/解码
const base64Input = ref('Hello, World!')
const base64Encoded = ref('')
const base64Decoded = ref('')

const handleBase64Encode = () => {
  try {
    base64Encoded.value = base64Encode(base64Input.value)
    ElMessage.success('Base64 编码成功')
  } catch (error) {
    ElMessage.error('Base64 编码失败')
  }
}

const handleBase64Decode = () => {
  try {
    base64Decoded.value = base64Decode(base64Encoded.value)
    ElMessage.success('Base64 解码成功')
  } catch (error) {
    ElMessage.error('Base64 解码失败')
  }
}

// HMAC 签名
const hmacData = ref('important data')
const hmacKey = ref('secret-key')
const hmacAlgorithm = ref<HashAlgorithm>('SHA256')
const hmacSignature = ref('')
const hmacVerifyResult = ref<boolean | null>(null)

const handleHmac = () => {
  try {
    hmacSignature.value = hmac(hmacData.value, hmacKey.value, hmacAlgorithm.value)
    hmacVerifyResult.value = null
    ElMessage.success('签名生成成功')
  } catch (error) {
    ElMessage.error('签名生成失败')
  }
}

const handleVerifyHmac = () => {
  try {
    hmacVerifyResult.value = verifyHmac(
      hmacData.value,
      hmacSignature.value,
      hmacKey.value,
      hmacAlgorithm.value
    )
    ElMessage.success(hmacVerifyResult.value ? '验证通过' : '验证失败')
  } catch (error) {
    ElMessage.error('验证失败')
  }
}

// 生成密钥
const keyLength = ref(32)
const generatedKey = ref('')

const handleGenerateKey = () => {
  try {
    generatedKey.value = generateKey(keyLength.value)
    ElMessage.success('密钥生成成功')
  } catch (error) {
    ElMessage.error('密钥生成失败')
  }
}

const handleCopyKey = () => {
  navigator.clipboard.writeText(generatedKey.value)
  ElMessage.success('已复制到剪贴板')
}
</script>

<style scoped>
.crypto-example {
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
  line-height: 1.6;
}
</style>
