<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, View, Hide, User } from '@element-plus/icons-vue'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const showPassword = ref(false)
const rememberPassword = ref(false)
const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    await auth.login({ username: form.username, password: form.password })
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}

// 粒子系统
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null
let mouseX = 0
let mouseY = 0

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  twinkleStart?: number
  twinkleEnd?: number
}

const particles: Particle[] = []
const PARTICLE_COUNT = 30 // 粒子数量
const CONNECT_DISTANCE = 120 // 连线距离
const MOUSE_REPEL_DISTANCE = 150 // 鼠标排斥距离
const MOUSE_REPEL_STRENGTH = 0.5 // 鼠标排斥强度
const TWINKLE_DURATION = 1500 // 单次闪烁时长（ms）
const TWINKLE_INTERVAL = 8000 // 间隔约 8 秒，让闪烁更容易被看到
const TWINKLE_VARIANCE = 0 // 固定间隔
let nextTwinkleAt = performance.now() + TWINKLE_INTERVAL

const initParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  particles.length = 0
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1, // 1-3px
    })
  }
}

const updateParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const now = performance.now()

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 按时间触发闪烁：约每分钟随机 2 个粒子闪 1.5s
  if (now >= nextTwinkleAt && particles.length > 0) {
    const pickTwinkle = () => Math.floor(Math.random() * particles.length)
    const chosen = new Set<number>()
    while (chosen.size < 2) {
      chosen.add(pickTwinkle())
    }
    chosen.forEach((idx) => {
      const p = particles[idx]
      if (p) {
        p.twinkleStart = now
        p.twinkleEnd = now + TWINKLE_DURATION
      }
    })
    nextTwinkleAt =
      now + TWINKLE_INTERVAL + (Math.random() - 0.5) * TWINKLE_VARIANCE
  }

  // 更新和绘制粒子
  particles.forEach((particle) => {
    // 鼠标排斥
    const dx = particle.x - mouseX
    const dy = particle.y - mouseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < MOUSE_REPEL_DISTANCE && distance > 0) {
      const force = (MOUSE_REPEL_DISTANCE - distance) / MOUSE_REPEL_DISTANCE
      const angle = Math.atan2(dy, dx)
      particle.vx += Math.cos(angle) * force * MOUSE_REPEL_STRENGTH
      particle.vy += Math.sin(angle) * force * MOUSE_REPEL_STRENGTH
    }

    // 更新位置
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界反弹
    if (particle.x < 0 || particle.x > canvas.width) {
      particle.vx *= -0.8
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
    }
    if (particle.y < 0 || particle.y > canvas.height) {
      particle.vy *= -0.8
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))
    }

    // 速度衰减
    particle.vx *= 0.99
    particle.vy *= 0.99

    // 轻微随机漂移，避免静止
    particle.vx += (Math.random() - 0.5) * 0.03
    particle.vy += (Math.random() - 0.5) * 0.03

    // 防止速度过小导致停滞，重新赋予微速
    const speed = Math.hypot(particle.vx, particle.vy)
    if (speed < 0.05) {
      const angle = Math.random() * Math.PI * 2
      const base = 0.08
      particle.vx = Math.cos(angle) * base
      particle.vy = Math.sin(angle) * base
    }

    // 限制最大速度，避免过快
    const maxSpeed = 0.9
    if (speed > maxSpeed) {
      particle.vx = (particle.vx / speed) * maxSpeed
      particle.vy = (particle.vy / speed) * maxSpeed
    }

    // 绘制粒子（模糊效果 & 闪烁）
    ctx.save()

    const isTwinkling =
      particle.twinkleStart !== undefined &&
      particle.twinkleEnd !== undefined &&
      now < particle.twinkleEnd

    let alpha = 0.25
    let radiusFactor = 3

    if (isTwinkling && particle.twinkleStart) {
      const progress = (now - particle.twinkleStart) / TWINKLE_DURATION
      // 先增后减的亮度曲线
      const pulse = 1 - Math.abs(progress - 0.5) / 0.5 // 0-1-0
      // 只提高亮度，不明显放大半径，保持细小星点的感觉
      alpha = 0.6 + pulse * 0.6 // 0.6 ~ 1.2 更亮
      radiusFactor = 3 + pulse * 0.8 // 轻微放大一点点
    }

    const gradient = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius * radiusFactor
    )
    // 非闪烁时为柔和白光，闪烁时提升为更亮的纯白光
    if (isTwinkling) {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    }
    ctx.globalAlpha = alpha
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.radius * radiusFactor, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // 闪烁结束后清理标记
    if (particle.twinkleEnd && now >= particle.twinkleEnd) {
      particle.twinkleStart = undefined
      particle.twinkleEnd = undefined
    }
  })

  // 绘制连线
  particles.forEach((particle, i) => {
    particles.slice(i + 1).forEach((other) => {
      const dx = particle.x - other.x
      const dy = particle.y - other.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < CONNECT_DISTANCE) {
        const opacity = (1 - distance / CONNECT_DISTANCE) * 0.3
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(other.x, other.y)
        ctx.stroke()
      }
    })
  })

}

const animate = () => {
  updateParticles()
  animationFrameId = requestAnimationFrame(animate)
}

const handleMouseMove = (e: Event) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const mouseEvent = e as MouseEvent
  const rect = canvas.getBoundingClientRect()
  mouseX = mouseEvent.clientX - rect.left
  mouseY = mouseEvent.clientY - rect.top
}

const handleResize = () => {
  initParticles()
}

onMounted(() => {
  initParticles()
  animate()
  const leftPanel = document.querySelector('.login__left')
  if (leftPanel) {
    leftPanel.addEventListener('mousemove', handleMouseMove)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  const leftPanel = document.querySelector('.login__left')
  if (leftPanel) {
    leftPanel.removeEventListener('mousemove', handleMouseMove)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="login">
    <!-- 左侧面板 -->
    <div class="login__left">
      <!-- 背景装饰：粒子效果 -->
      <canvas ref="canvasRef" class="login__particles"></canvas>

      <div class="login__content">
        <!-- Logo + 标语整体区域 -->
        <div class="login__header">
          <!-- Logo 区域 -->
          <div class="login__logo">
            <div class="logo-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18C10 18 14 18 18 18" stroke="#165DFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="8" y1="18" x2="8" y2="9" stroke="#165DFF" stroke-width="2.8" stroke-linecap="round"/>
                <line x1="12" y1="18" x2="12" y2="6" stroke="#165DFF" stroke-width="2.8" stroke-linecap="round"/>
                <line x1="16" y1="18" x2="16" y2="12" stroke="#165DFF" stroke-width="2.8" stroke-linecap="round"/>
                <path d="M6 18C6 10 10 6 14 6" stroke="#165DFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1 class="logo-title">科技管理系统</h1>
              <p class="logo-subtitle">Enterprise Admin Platform</p>
            </div>
          </div>

          <!-- 标语 -->
          <div class="login__slogan">智能管理·高效协同</div>
        </div>

        <!-- 功能卖点区域 -->
        <div class="login__features">
          <div class="feature-item">
            <div class="feature-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L14 8H8L10 4M12 20V12M18 12H20M6 12H4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-content">
              <div class="feature-title">极速响应</div>
              <div class="feature-desc">毫秒级数据处理能力</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17V15M12 7C10.34 7 9 8.34 9 10V16C9 17.66 10.34 19 12 19C13.66 19 15 17.66 15 16V10C15 8.34 13.66 7 12 7Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-content">
              <div class="feature-title">安全可靠</div>
              <div class="feature-desc">企业级数据加密保护</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L8 14L12 16L16 12L18 18M8 10L12 12L18 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-content">
              <div class="feature-title">智能分析</div>
              <div class="feature-desc">AI驱动的数据洞察</div>
            </div>
          </div>
        </div>

        <!-- 背景装饰：底部柱状装饰（与功能卖点区域放在一起） -->
        <div class="login__bottom-bars">
          <div class="bottom-bar" style="height: 20px"></div>
          <div class="bottom-bar" style="height: 30px"></div>
          <div class="bottom-bar" style="height: 25px"></div>
          <div class="bottom-bar" style="height: 35px"></div>
          <div class="bottom-bar" style="height: 28px"></div>
          <div class="bottom-bar" style="height: 20px"></div>
          <div class="bottom-bar" style="height: 30px"></div>
          <div class="bottom-bar" style="height: 25px"></div>
          <div class="bottom-bar" style="height: 35px"></div>
          <div class="bottom-bar" style="height: 28px"></div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="login__right">
      <div class="login__form-wrapper">
        <div class="login__card">
          <h2 class="login__title">系统登录</h2>
          <div class="login__title-underline"></div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="login-form"
            @keyup.enter="handleSubmit"
          >
            <el-form-item prop="username" label="登录账号">
              <el-input
                v-model="form.username"
                placeholder="请输入登录账号"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password" label="登录密码">
              <el-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入登录密码"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
                <template #suffix>
                  <el-icon class="password-toggle" @click="showPassword = !showPassword">
                    <component :is="showPassword ? View : Hide" />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item class="login-options">
              <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
              <span class="forgot-link">忘记密码？</span>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleSubmit"
              >
                立即登录
              </el-button>
            </el-form-item>

            <el-form-item>
              <el-button size="large" class="reset-button" @click="handleReset">重置</el-button>
            </el-form-item>

            <div class="login-footer">
              <span class="footer-tip">暂无账号？</span>
              <span class="register-link">联系管理员</span>
            </div>
          </el-form>
        </div>

        <div class="login__copyright">
          <p>© 2024 科技管理系统. All rights reserved.</p>
          <div class="copyright-links">
            <el-link type="info" :underline="false">隐私政策</el-link>
            <span class="divider">·</span>
            <el-link type="info" :underline="false">服务条款</el-link>
            <span class="divider">·</span>
            <el-link type="info" :underline="false">帮助中心</el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: linear-gradient(180deg, #F8FAFC 0%, #E8F3FF 100%);
  overflow: hidden;
}

/* 隐藏滚动条但保持滚动功能 */
.login::-webkit-scrollbar {
  display: none;
}

.login {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 左侧面板 */
.login__left {
  flex: 0 0 60%;
  max-width: 60%;
  background: linear-gradient(135deg, #0a0f1e 0%, #1a2332 30%, #0f172a 60%, #0a0f1e 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  padding-left: 80px;
  animation: fadeInFromLeft 0.8s ease-out;
}

@keyframes fadeInFromLeft {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  100% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
  }
}

/* 右上角至左下角科技蓝色带 */
.login__left::before {
  content: '';
  position: absolute;
  top: -8%;
  left: -12%;
  right: -12%;
  bottom: -8%;
  background: linear-gradient(
    135deg,
    #000000 0%,
    #000000 20%,
    #165DFF 50%,
    #165DFF 50%,
    #000000 80%,
    #000000 100%
  );
  opacity: 0.55;
  filter: blur(10px);
  transform: rotate(2deg);
  pointer-events: none;
  z-index: 1;
}

/* 135度渐变科技蓝叠加层 */
.login__left::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0F4CD0 0%, #165DFF 100%);
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

/* 背景装饰：粒子效果 - Canvas 交互式粒子系统 */
.login__particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}


/* 背景装饰：底部柱状装饰 */
.login__bottom-bars {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-top: 20px;
  z-index: 2;
}

.bottom-bar {
  width: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  --i: 0;
  animation: chartFloat 2.4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.16s);
}

.bottom-bar:nth-child(1) { --i: 0; }
.bottom-bar:nth-child(2) { --i: 1; }
.bottom-bar:nth-child(3) { --i: 2; }
.bottom-bar:nth-child(4) { --i: 3; }
.bottom-bar:nth-child(5) { --i: 4; }
.bottom-bar:nth-child(6) { --i: 5; }
.bottom-bar:nth-child(7) { --i: 6; }
.bottom-bar:nth-child(8) { --i: 7; }
.bottom-bar:nth-child(9) { --i: 8; }
.bottom-bar:nth-child(10) { --i: 9; }

@keyframes chartFloat {
  0%, 100% {
    transform: translateY(0) scaleY(1);
  }
  25% {
    transform: translateY(-6px) scaleY(1.04);
  }
  50% {
    transform: translateY(-10px) scaleY(1.08);
  }
  75% {
    transform: translateY(-6px) scaleY(1.04);
  }
}

.login__content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 500px;
  padding: 80px 0 60px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
}

/* Logo + 标语整体区域 */
.login__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Logo 区域 */
.login__logo {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
  animation: logo-shake 1s ease-out 0s 1;
  transform-origin: right center;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(145deg, #f8fbff 0%, #e6eeff 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow:
    0 10px 22px rgba(22, 93, 255, 0.32),
    0 0 16px rgba(255, 255, 255, 0.65),
    0 0 22px rgba(22, 93, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(8px);
}

.logo-text {
  flex: 1;
}

.logo-title {
  font-size: 30px;
  font-weight: 900;
  color: #ffffff;
  margin: -4px 0 2px 0;
  line-height: 1.1;
  letter-spacing: 0.6px;
  text-shadow:
    0 3px 6px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(22, 93, 255, 0.3),
    0 0 20px rgba(0, 229, 255, 0.25);
}

.logo-subtitle {
  font-size: 14px;
  color: #00E5FF;
  margin: 0;
  font-weight: 400;
}

@keyframes logo-shake {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); }
  15% { transform: translate3d(-4px, 8px, 0) rotate(-2deg); }
  30% { transform: translate3d(4px, -8px, 0) rotate(2deg); }
  45% { transform: translate3d(-3px, 6px, 0) rotate(-1.5deg); }
  60% { transform: translate3d(3px, -6px, 0) rotate(1.5deg); }
  75% { transform: translate3d(-2px, 4px, 0) rotate(-1deg); }
  90% { transform: translate3d(2px, -4px, 0) rotate(1deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}

/* 标语 */
.login__slogan {
  font-size: 17px;
  color: #e7e7e7;
  margin-bottom: 40px;
  font-weight: 5500;
  letter-spacing:2px;
}

/* 功能卖点区域 */
.login__features {
  margin-top: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.feature-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 6px 16px rgba(22, 93, 255, 0.28),
    0 0 14px rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon-circle svg {
  width: 28px;
  height: 28px;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.feature-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

/* 底部图表装饰 */
.login__chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 80px;
  margin-top: auto;
  padding-top: 20px;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.chart-bar {
  width: 4px;
  background: linear-gradient(180deg, rgba(22, 93, 255, 0.6) 0%, rgba(0, 229, 255, 0.4) 100%);
  border-radius: 2px 2px 0 0;
  animation: chartFloat 2.5s ease-in-out infinite;
}

.chart-bar:nth-child(1) {
  animation-delay: 0s;
}

.chart-bar:nth-child(2) {
  animation-delay: 0.3s;
}

.chart-bar:nth-child(3) {
  animation-delay: 0.6s;
}

.chart-bar:nth-child(4) {
  animation-delay: 0.9s;
}

.chart-bar:nth-child(5) {
  animation-delay: 1.2s;
}

@keyframes chartFloat {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(-12px);
  }
  75% {
    transform: translateY(-8px);
  }
}

/* 右侧面板 */
.login__right {
  flex: 1;
  max-width: 40%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 隐藏右侧面板滚动条 */
.login__right::-webkit-scrollbar {
  display: none;
}

.login__right {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.login__form-wrapper {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.login__card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px 24px 20px;
  width: 400px;
  box-shadow: 0 12px 32px rgba(22, 93, 255, 0.12);
  margin-bottom: 0;
  animation: slideInFromRight 0.8s ease-out 0.3s both;
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.login__title {
  font-size: 24px;
  font-weight: 700;
  color: #165DFF;
  margin: 0;
  text-align: left;
  animation: slideUpFadeIn 0.6s ease-out 0.2s both;
}

.login__title-underline {
  width: 40px;
  height: 3px;
  margin: 8px 0 16px 0;
  background: linear-gradient(90deg, #165DFF 0%, #00E5FF 100%);
  border-radius: 999px;
  animation: slideUpFadeIn 0.6s ease-out 0.3s both;
}

.login-form {
  margin-top: 16px;
  margin-bottom: 0;
}

/* 表单项滑入动画 */
.login-form :deep(.el-form-item) {
  animation: slideUpFadeIn 0.6s ease-out both;
}

.login-form :deep(.el-form-item:nth-child(1)) {
  animation-delay: 0.4s;
}

.login-form :deep(.el-form-item:nth-child(2)) {
  animation-delay: 0.5s;
}

.login-form :deep(.el-form-item:nth-child(3)) {
  animation-delay: 0.6s;
}

.login-form :deep(.el-form-item:nth-child(4)) {
  animation-delay: 0.7s;
}

.login-form :deep(.el-form-item:nth-child(5)) {
  animation-delay: 0.8s;
}

.login-footer {
  animation: slideUpFadeIn 0.6s ease-out 0.9s both;
}

@keyframes slideUpFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form :deep(.el-form-item__label) {
  color: #86909C;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 6px;
  padding: 0;
}

.login-input :deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #E4E7ED;
  border-radius: 8px;
  box-shadow: none;
  padding: 0 12px;
  min-height: 40px;
  transition: all 0.2s ease;
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: #165DFF;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #165DFF;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.login-input :deep(.el-input__inner) {
  color: #1f2d3d;
  font-size: 14px;
}

.login-input :deep(.el-input__inner::placeholder) {
  color: #C0C4CC;
}

.login-input :deep(.el-input__prefix) {
  color: #165DFF;
  margin-right: 8px;
}

.password-toggle {
  cursor: pointer;
  color: #86909c;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #165DFF;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  margin-top: 4px;
}

.login-options :deep(.el-form-item__content) {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-options :deep(.el-checkbox) {
  margin: 0;
}

.login-options :deep(.el-checkbox__inner) {
  border-color: #E4E7ED;
}

.login-options :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #165DFF;
  border-color: #165DFF;
}

.login-options :deep(.el-checkbox__label) {
  color: #86909C;
  font-size: 12px;
}

.forgot-link {
  font-size: 12px;
  color: #86909C;
}

.login-button {
  width: 100%;
  height: 44px;
  background: linear-gradient(180deg, #2f7bff 0%, #0054e3 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(0, 84, 227, 0.45);
  transition: all 0.22s ease;
}

.login-button:hover {
  background: linear-gradient(180deg, #3f87ff 0%, #0a5aeb 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(0, 84, 227, 0.55);
}

.login-button:active {
  transform: translateY(0);
  background: linear-gradient(180deg, #225fdd 0%, #0847b8 100%);
  box-shadow: 0 6px 16px rgba(10, 54, 150, 0.5);
}

.reset-button {
  width: 100%;
  height: 44px;
  background: #ffffff;
  border: 1px solid #165DFF;
  color: #165DFF;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease;
  margin-top: 0;
}

.reset-button:hover {
  background: #f0f5ff;
  border-color: #4080FF;
  color: #4080FF;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #86909C;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.register-link {
  font-size: 12px;
  color: #165DFF;
  cursor: pointer;
}

.login__copyright {
  text-align: center;
  margin-top: 0;
  padding-top: 0;
  border-top: none;
  align-self: center;
  width: 100%;
  animation: slideInFromRight 0.8s ease-out 0.3s both;
}

.login__copyright p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #C0C4CC;
}

.copyright-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  margin-top: 8px;
}

.copyright-links :deep(.el-link) {
  font-size: 12px;
  color: #C0C4CC;
}

.copyright-links :deep(.el-link:hover) {
  color: #165DFF;
}

.divider {
  color: #86909c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login {
    flex-direction: column;
  }

  .login__left {
    flex: 0 0 auto;
    min-height: 40vh;
  }

  .login__right {
    flex: 1;
    padding: 24px;
  }

  .login__content {
    padding: 40px 24px;
  }

  .login__features {
    margin-bottom: 40px;
  }

  .login__chart {
    display: none;
  }
}
</style>

