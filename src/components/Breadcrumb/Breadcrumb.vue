<template>
  <el-breadcrumb :separator="separator" class="app-breadcrumb">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        :to="index < breadcrumbs.length - 1 ? { path: item.path } : undefined"
      >
        <el-icon v-if="item.meta?.icon" class="breadcrumb-icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ getBreadcrumbTitle(item) }}</span>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router'
import { useI18n } from '@/composables'

interface Props {
  /** 分隔符 */
  separator?: string
  /** 是否显示首页 */
  showHome?: boolean
  /** 首页路径 */
  homePath?: string
  /** 首页标题 */
  homeTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  separator: '/',
  showHome: true,
  homePath: '/',
  homeTitle: '首页'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

/**
 * 获取面包屑标题
 */
function getBreadcrumbTitle(item: RouteLocationMatched): string {
  // 优先使用 meta.title
  if (item.meta?.title) {
    // 如果是翻译键，使用翻译
    if (typeof item.meta.title === 'string' && item.meta.title.includes('.')) {
      return t(item.meta.title)
    }
    return String(item.meta.title)
  }
  
  // 使用路由名称
  if (item.name) {
    return String(item.name)
  }
  
  // 使用路径
  return item.path
}

/**
 * 是否为首页
 */
function isHome(path: string): boolean {
  return path === props.homePath
}

/**
 * 生成面包屑列表
 */
const breadcrumbs = computed(() => {
  let matched = route.matched.filter(item => {
    // 过滤掉没有名称和标题的路由
    return item.name || item.meta?.title
  })

  // 如果需要显示首页且当前不在首页
  if (props.showHome && !isHome(route.path)) {
    // 检查第一项是否已经是首页
    const firstPath = matched[0]?.path || ''
    if (matched.length === 0 || !isHome(firstPath)) {
      // 创建首页路由对象
      const homeRoute = router.getRoutes().find(r => r.path === props.homePath)
      if (homeRoute) {
        // 使用 homeRoute 本身作为 RouteLocationMatched
        matched = [homeRoute as any, ...matched]
      }
    }
  }

  return matched
})

/**
 * 监听路由变化
 */
watch(
  () => route.path,
  () => {
    console.log('[Breadcrumb] 路由变化:', route.path)
  }
)
</script>

<style scoped lang="scss">
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  
  .breadcrumb-icon {
    margin-right: 4px;
    vertical-align: middle;
  }
}

// 面包屑动画
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.3s;
}

.breadcrumb-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
