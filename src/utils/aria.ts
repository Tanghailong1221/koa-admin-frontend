/**
 * ARIA 工具函数
 * 用于管理 ARIA 属性
 */

/**
 * 设置 ARIA 属性
 */
export function setAriaAttribute(
    element: HTMLElement,
    attribute: string,
    value: string | boolean | number
): void {
    element.setAttribute(`aria-${attribute}`, String(value))
}

/**
 * 移除 ARIA 属性
 */
export function removeAriaAttribute(
    element: HTMLElement,
    attribute: string
): void {
    element.removeAttribute(`aria-${attribute}`)
}

/**
 * 获取 ARIA 属性
 */
export function getAriaAttribute(
    element: HTMLElement,
    attribute: string
): string | null {
    return element.getAttribute(`aria-${attribute}`)
}

/**
 * 设置 ARIA 标签
 */
export function setAriaLabel(element: HTMLElement, label: string): void {
    setAriaAttribute(element, 'label', label)
}

/**
 * 设置 ARIA 描述
 */
export function setAriaDescribedBy(
    element: HTMLElement,
    id: string
): void {
    setAriaAttribute(element, 'describedby', id)
}

/**
 * 设置 ARIA 标签引用
 */
export function setAriaLabelledBy(element: HTMLElement, id: string): void {
    setAriaAttribute(element, 'labelledby', id)
}

/**
 * 设置 ARIA 角色
 */
export function setAriaRole(element: HTMLElement, role: string): void {
    element.setAttribute('role', role)
}

/**
 * 设置 ARIA 展开状态
 */
export function setAriaExpanded(
    element: HTMLElement,
    expanded: boolean
): void {
    setAriaAttribute(element, 'expanded', expanded)
}

/**
 * 设置 ARIA 隐藏状态
 */
export function setAriaHidden(element: HTMLElement, hidden: boolean): void {
    setAriaAttribute(element, 'hidden', hidden)
}

/**
 * 设置 ARIA 禁用状态
 */
export function setAriaDisabled(
    element: HTMLElement,
    disabled: boolean
): void {
    setAriaAttribute(element, 'disabled', disabled)
}

/**
 * 设置 ARIA 选中状态
 */
export function setAriaSelected(
    element: HTMLElement,
    selected: boolean
): void {
    setAriaAttribute(element, 'selected', selected)
}

/**
 * 设置 ARIA 激活状态
 */
export function setAriaCurrent(element: HTMLElement, current: string): void {
    setAriaAttribute(element, 'current', current)
}

/**
 * 设置 ARIA 实时区域
 */
export function setAriaLive(
    element: HTMLElement,
    live: 'off' | 'polite' | 'assertive'
): void {
    setAriaAttribute(element, 'live', live)
}

/**
 * 设置 ARIA 原子性
 */
export function setAriaAtomic(element: HTMLElement, atomic: boolean): void {
    setAriaAttribute(element, 'atomic', atomic)
}

/**
 * 设置 ARIA 相关性
 */
export function setAriaRelevant(
    element: HTMLElement,
    relevant: string
): void {
    setAriaAttribute(element, 'relevant', relevant)
}

/**
 * 创建实时区域
 */
export function createLiveRegion(
    message: string,
    level: 'polite' | 'assertive' = 'polite'
): HTMLElement {
    const region = document.createElement('div')
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', level)
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only' // 屏幕阅读器专用
    region.textContent = message

    document.body.appendChild(region)

    // 3 秒后移除
    setTimeout(() => {
        document.body.removeChild(region)
    }, 3000)

    return region
}

/**
 * 宣布消息(屏幕阅读器)
 */
export function announce(
    message: string,
    level: 'polite' | 'assertive' = 'polite'
): void {
    createLiveRegion(message, level)
}

/**
 * 宣布错误
 */
export function announceError(message: string): void {
    announce(message, 'assertive')
}

/**
 * 宣布成功
 */
export function announceSuccess(message: string): void {
    announce(message, 'polite')
}
