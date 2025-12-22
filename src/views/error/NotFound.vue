<template>
  <div class="error">
    <el-result icon="warning" title="404" sub-title="页面不存在">
      <template #extra>
        <el-button type="primary" @click="$router.replace('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

