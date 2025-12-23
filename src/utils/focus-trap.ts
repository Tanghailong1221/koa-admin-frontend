/**
 * 焦点捕获工具
 * 用于模态框等组件的焦点管理
 */

/**
 * 可聚焦元素选择器
 */
const FOCUSABLE_ELEMENTS = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])'
].join(',')

/**
 * 焦点捕获配置
 */
export interface FocusTrapOptions {
    /**
     * 初始焦点元素
     */
    initialFocus?: HTMLElement | string

    /**
     * 返回焦点元素
     */
    returnFocus?: HTMLElement

    /**
     * 是否允许外部点击
     */
    allowOutsideClick?: boolean

    /**
     * 外部点击回调
     */
    onOutsideClick?: () => void
}

/**
 * 焦点捕获类
 */
export class FocusTrap {
    private element: HTMLElement
    private options: FocusTrapOptions
    private previousActiveElement: HTMLElement | null = null
    private isActive = false

    constructor(element: HTMLElement, options: FocusTrapOptions = {}) {
        this.element = element
        this.options = {
            allowOutsideClick: false,
            ...options
        }
    }

    /**
     * 激活焦点捕获
     */
    activate(): void {
        if (this.isActive) return

        // 保存当前焦点元素
        this.previousActiveElement = document.activeElement as HTMLElement

        // 设置初始焦点
        this.setInitialFocus()

        // 监听键盘事件
        document.addEventListener('keydown', this.handleKeyDown)

        // 监听点击事件
        if (this.options.allowOutsideClick) {
            document.addEventListener('click', this.handleClick)
        }

        this.isActive = true
    }

    /**
     * 停用焦点捕获
     */
    deactivate(): void {
        if (!this.isActive) return

        // 移除事件监听
        document.removeEventListener('keydown', this.handleKeyDown)
        document.removeEventListener('click', this.handleClick)

        // 返回焦点
        this.returnFocus()

        this.isActive = false
    }

    /**
     * 设置初始焦点
     */
    private setInitialFocus(): void {
        let initialFocusElement: HTMLElement | null = null

        // 从选项中获取初始焦点元素
        if (this.options.initialFocus) {
            if (typeof this.options.initialFocus === 'string') {
                initialFocusElement = this.element.querySelector(
                    this.options.initialFocus
                )
            } else {
                initialFocusElement = this.options.initialFocus
            }
        }

        // 如果没有指定,使用第一个可聚焦元素
        if (!initialFocusElement) {
            const focusableElements = this.getFocusableElements()
            initialFocusElement = focusableElements[0] || this.element
        }

        // 设置焦点
        if (initialFocusElement) {
            initialFocusElement.focus()
        }
    }

    /**
     * 返回焦点
     */
    private returnFocus(): void {
        const returnFocusElement =
            this.options.returnFocus || this.previousActiveElement

        if (returnFocusElement && returnFocusElement.focus) {
            returnFocusElement.focus()
        }
    }

    /**
     * 获取可聚焦元素
     */
    private getFocusableElements(): HTMLElement[] {
        const elements = Array.from(
            this.element.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
        )

        return elements.filter((element) => {
            return (
                element.offsetWidth > 0 &&
                element.offsetHeight > 0 &&
                !element.hasAttribute('disabled')
            )
        })
    }

    /**
     * 处理键盘事件
     */
    private handleKeyDown = (event: KeyboardEvent): void => {
        // Tab 键处理
        if (event.key === 'Tab') {
            this.handleTab(event)
        }

        // Escape 键处理
        if (event.key === 'Escape') {
            this.handleEscape(event)
        }
    }

    /**
     * 处理 Tab 键
     */
    private handleTab(event: KeyboardEvent): void {
        const focusableElements = this.getFocusableElements()

        if (focusableElements.length === 0) {
            event.preventDefault()
            return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        const activeElement = document.activeElement as HTMLElement

        // Shift + Tab: 向前
        if (event.shiftKey) {
            if (activeElement === firstElement) {
                event.preventDefault()
                lastElement.focus()
            }
        }
        // Tab: 向后
        else {
            if (activeElement === lastElement) {
                event.preventDefault()
                firstElement.focus()
            }
        }
    }

    /**
     * 处理 Escape 键
     */
    private handleEscape(event: KeyboardEvent): void {
        event.preventDefault()
        this.deactivate()
    }

    /**
     * 处理点击事件
     */
    private handleClick = (event: MouseEvent): void => {
        const target = event.target as HTMLElement

        // 检查是否点击在元素外部
        if (!this.element.contains(target)) {
            if (this.options.onOutsideClick) {
                this.options.onOutsideClick()
            }
        }
    }
}

/**
 * 创建焦点捕获
 */
export function createFocusTrap(
    element: HTMLElement,
    options?: FocusTrapOptions
): FocusTrap {
    return new FocusTrap(element, options)
}
