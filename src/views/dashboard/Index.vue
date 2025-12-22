<template>
  <div class="dashboard">
    <el-card class="dashboard__card">
      <template #header>
        <div class="card-header">
          <span class="card-header__title">仪表盘</span>
        </div>
      </template>
      <div class="dashboard__content">
        <p class="dashboard__welcome">欢迎使用 KOA Admin 前端框架</p>
        <el-space>
          <el-button type="primary" v-perm="['user:list']" class="btn-tech">
            仅 user:list 可见
          </el-button>
          <el-button v-perm="['role:list']" class="btn-tech">仅 role:list 可见</el-button>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100%;
}

.dashboard__card {
  background: var(--bg-card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.dashboard__card:hover {
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  transform: translateY(-2px);
}

.dashboard__card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid var(--border-color);
  padding: 20px 24px;
}

.dashboard__card :deep(.el-card__body) {
  padding: 24px;
  background: transparent;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header__title {
  font-size: 20px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard__content {
  color: var(--text-primary);
}

.dashboard__welcome {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.dashboard__card :deep(.el-button) {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.dashboard__card :deep(.el-button--primary) {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
}

.dashboard__card :deep(.el-button--primary:hover) {
  box-shadow: var(--shadow-glow-cyan);
  transform: translateY(-2px);
}

.dashboard__card :deep(.el-button:not(.el-button--primary)) {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.dashboard__card :deep(.el-button:not(.el-button--primary):hover) {
  background: var(--bg-glass-hover);
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}
</style>

