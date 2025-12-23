/**
 * 测试工具函数
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'
import type { Component } from 'vue'

/**
 * 创建组件包装器
 */
export function createWrapper<T extends Component>(
    component: T,
    options: any = {}
): VueWrapper<any> {
    return mount(component, {
        global: {
            stubs: {
                teleport: true,
                ...options.stubs
            },
            mocks: {
                $t: (key: string) => key,
                ...options.mocks
            },
            ...options.global
        },
        ...options
    })
}

/**
 * 等待异步操作完成
 */
export async function flushPromises(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 0)
    })
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock Axios 响应
 */
export function mockAxiosResponse(data: any, status = 200) {
    return Promise.resolve({
        data,
        status,
        statusText: 'OK',
        headers: {},
        config: {} as any
    })
}

/**
 * Mock Axios 错误
 */
export function mockAxiosError(message: string, status = 500) {
    const error: any = new Error(message)
    error.response = {
        data: { message },
        status,
        statusText: 'Error',
        headers: {},
        config: {} as any
    }
    return Promise.reject(error)
}

/**
 * 创建 Mock 函数
 */
export function createMockFn<T extends (...args: any[]) => any>(): T {
    return vi.fn() as T
}

/**
 * 触发输入事件
 */
export async function triggerInput(
    wrapper: VueWrapper<any>,
    selector: string,
    value: string
): Promise<void> {
    const input = wrapper.find(selector)
    await input.setValue(value)
    await input.trigger('input')
}

/**
 * 触发点击事件
 */
export async function triggerClick(
    wrapper: VueWrapper<any>,
    selector: string
): Promise<void> {
    const element = wrapper.find(selector)
    await element.trigger('click')
}

/**
 * 检查元素是否可见
 */
export function isVisible(wrapper: VueWrapper<any>, selector: string): boolean {
    const element = wrapper.find(selector)
    return element.exists() && element.isVisible()
}

/**
 * 获取元素文本
 */
export function getText(wrapper: VueWrapper<any>, selector: string): string {
    const element = wrapper.find(selector)
    return element.text()
}

/**
 * 检查元素是否包含类名
 */
export function hasClass(
    wrapper: VueWrapper<any>,
    selector: string,
    className: string
): boolean {
    const element = wrapper.find(selector)
    return element.classes().includes(className)
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
    const store: Record<string, string> = {}

    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key]
        }),
        clear: vi.fn(() => {
            Object.keys(store).forEach((key) => delete store[key])
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        get length() {
            return Object.keys(store).length
        }
    }
}

/**
 * Mock sessionStorage
 */
export function mockSessionStorage() {
    return mockLocalStorage()
}

/**
 * 创建测试用的 Pinia Store
 */
export function createTestStore() {
    // 这里可以根据需要创建测试用的 store
    return {}
}
