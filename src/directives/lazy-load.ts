/**
 * 图片懒加载指令
 * 
 * 功能：
 * - 使用 IntersectionObserver 实现懒加载
 * - 支持占位符
 * - 支持加载失败处理
 * - 支持加载完成回调
 */

import type { Directive, DirectiveBinding } from 'vue'

/**
 * 懒加载选项
 */
export interface LazyLoadOptions {
    /** 占位符图片 */
    placeholder?: string
    /** 加载失败图片 */
    error?: string
    /** 根元素 */
    root?: Element | null
    /** 根边距 */
    rootMargin?: string
    /** 阈值 */
    threshold?: number | number[]
    /** 加载完成回调 */
    onLoad?: (el: HTMLImageElement) => void
    /** 加载失败回调 */
    onError?: (el: HTMLImageElement) => void
}

/**
 * 默认选项
 */
const defaultOptions: LazyLoadOptions = {
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E',
    error: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23ffebee" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23f44336" font-size="14"%3E加载失败%3C/text%3E%3C/svg%3E',
    rootMargin: '50px',
    threshold: 0.01
}

/**
 * 观察器映射
 */
const observerMap = new WeakMap<HTMLImageElement, IntersectionObserver>()

/**
 * 加载图片
 */
function loadImage(
    el: HTMLImageElement,
    src: string,
    options: LazyLoadOptions
): void {
    const img = new Image()

    img.onload = () => {
        el.src = src
        el.classList.add('lazy-loaded')
        el.classList.remove('lazy-loading')
        options.onLoad?.(el)
    }

    img.onerror = () => {
        if (options.error) {
            el.src = options.error
        }
        el.classList.add('lazy-error')
        el.classList.remove('lazy-loading')
        options.onError?.(el)
    }

    img.src = src
}

/**
 * 创建观察器
 */
function createObserver(
    el: HTMLImageElement,
    src: string,
    options: LazyLoadOptions
): IntersectionObserver {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = entry.target as HTMLImageElement
                    loadImage(target, src, options)
                    observer.unobserve(target)
                    observerMap.delete(target)
                }
            })
        },
        {
            root: options.root,
            rootMargin: options.rootMargin,
            threshold: options.threshold
        }
    )

    return observer
}

/**
 * 懒加载指令值类型
 */
export type LazyLoadValue = string | { src: string; options?: LazyLoadOptions }

/**
 * 懒加载指令
 * 
 * 用法：
 * - v-lazy-load="imageUrl"
 * - v-lazy-load="{ src: imageUrl, options: { placeholder: '...', onLoad: () => {} } }"
 */
export const vLazyLoad: Directive<HTMLImageElement, LazyLoadValue> = {
    mounted(el: HTMLImageElement, binding: DirectiveBinding<LazyLoadValue>) {
        // 检查是否支持 IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            console.warn('[LazyLoad] IntersectionObserver not supported, loading image directly')
            if (typeof binding.value === 'string') {
                el.src = binding.value
            } else {
                el.src = binding.value.src
            }
            return
        }

        // 解析参数
        let src: string
        let options: LazyLoadOptions

        if (typeof binding.value === 'string') {
            src = binding.value
            options = { ...defaultOptions }
        } else {
            src = binding.value.src
            options = { ...defaultOptions, ...binding.value.options }
        }

        // 设置占位符
        if (options.placeholder) {
            el.src = options.placeholder
        }

        // 添加加载中类名
        el.classList.add('lazy-loading')

        // 创建观察器
        const observer = createObserver(el, src, options)
        observer.observe(el)
        observerMap.set(el, observer)
    },

    updated(el: HTMLImageElement, binding: DirectiveBinding<LazyLoadValue>) {
        // 如果 src 变化，重新加载
        const oldValue = binding.oldValue
        const newValue = binding.value

        let oldSrc: string
        let newSrc: string

        if (typeof oldValue === 'string') {
            oldSrc = oldValue
        } else {
            oldSrc = oldValue?.src || ''
        }

        if (typeof newValue === 'string') {
            newSrc = newValue
        } else {
            newSrc = newValue.src
        }

        if (oldSrc !== newSrc) {
            // 取消旧的观察
            const oldObserver = observerMap.get(el)
            if (oldObserver) {
                oldObserver.unobserve(el)
                observerMap.delete(el)
            }

            // 重新挂载
            vLazyLoad.mounted?.(el, binding, null as any, null as any)
        }
    },

    unmounted(el: HTMLImageElement) {
        // 清理观察器
        const observer = observerMap.get(el)
        if (observer) {
            observer.unobserve(el)
            observerMap.delete(el)
        }
    }
}
