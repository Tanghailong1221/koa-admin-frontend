/**
 * 路由预取工具
 * 
 * 功能：
 * - 预测下一个可能访问的路由
 * - 预加载路由组件
 * - 提升页面切换速度
 */

import type { Router, RouteLocationNormalized } from 'vue-router'

/**
 * 预取选项
 */
export interface PrefetchOptions {
    /** 是否启用预取 */
    enabled?: boolean
    /** 预取延迟（毫秒） */
    delay?: number
    /** 最大预取数量 */
    maxPrefetch?: number
    /** 自定义预测函数 */
    predict?: (route: RouteLocationNormalized) => string[]
}

/**
 * 默认选项
 */
const defaultOptions: Required<PrefetchOptions> = {
    enabled: true,
    delay: 1000,
    maxPrefetch: 3,
    predict: () => []
}

/**
 * 已预取的路由集合
 */
const prefetchedRoutes = new Set<string>()

/**
 * 预取路由组件
 */
async function prefetchRoute(router: Router, path: string): Promise<void> {
    // 已经预取过，跳过
    if (prefetchedRoutes.has(path)) {
        return
    }

    try {
        // 解析路由
        const route = router.resolve(path)

        // 获取路由组件
        const matched = route.matched

        // 预加载组件
        for (const record of matched) {
            const component = record.components?.default
            if (component && typeof component === 'function') {
                await component()
            }
        }

        // 标记为已预取
        prefetchedRoutes.add(path)

        console.log('[RoutePrefetch] 预取路由:', path)
    } catch (error) {
        console.error('[RoutePrefetch] 预取失败:', path, error)
    }
}

/**
 * 预测下一个路由
 */
function predictNextRoutes(
    route: RouteLocationNormalized,
    customPredict?: (route: RouteLocationNormalized) => string[]
): string[] {
    // 使用自定义预测函数
    if (customPredict) {
        return customPredict(route)
    }

    // 默认预测逻辑
    const predictions: string[] = []

    // 1. 预测详情页的编辑页
    if (route.path.includes('/detail/')) {
        const editPath = route.path.replace('/detail/', '/edit/')
        predictions.push(editPath)
    }

    // 2. 预测列表页的新增页
    if (route.path.includes('/list')) {
        const addPath = route.path.replace('/list', '/add')
        predictions.push(addPath)
    }

    // 3. 预测编辑页的详情页
    if (route.path.includes('/edit/')) {
        const detailPath = route.path.replace('/edit/', '/detail/')
        predictions.push(detailPath)
    }

    // 4. 预测同级路由
    const pathParts = route.path.split('/')
    if (pathParts.length > 2) {
        const parentPath = pathParts.slice(0, -1).join('/')
        // 可以根据实际情况添加同级路由
    }

    return predictions
}

/**
 * 设置路由预取
 */
export function setupRoutePrefetch(
    router: Router,
    options: PrefetchOptions = {}
): void {
    const config = { ...defaultOptions, ...options }

    if (!config.enabled) {
        console.log('[RoutePrefetch] 路由预取已禁用')
        return
    }

    // 监听路由变化
    router.afterEach((to) => {
        // 延迟预取，避免影响当前页面加载
        setTimeout(() => {
            // 预测下一个路由
            const predictions = predictNextRoutes(to, config.predict)

            // 限制预取数量
            const routesToPrefetch = predictions.slice(0, config.maxPrefetch)

            // 预取路由
            routesToPrefetch.forEach((path) => {
                prefetchRoute(router, path)
            })
        }, config.delay)
    })

    console.log('[RoutePrefetch] 路由预取已启用')
}

/**
 * 手动预取路由
 */
export function prefetch(router: Router, path: string): Promise<void> {
    return prefetchRoute(router, path)
}

/**
 * 清除预取缓存
 */
export function clearPrefetchCache(): void {
    prefetchedRoutes.clear()
    console.log('[RoutePrefetch] 预取缓存已清除')
}

/**
 * 获取已预取的路由列表
 */
export function getPrefetchedRoutes(): string[] {
    return Array.from(prefetchedRoutes)
}
