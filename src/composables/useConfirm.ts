/**
 * 确认对话框 Composable
 * 提供便捷的确认对话框方法
 */

import { h, type VNode } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { ElMessageBoxOptions, Action } from 'element-plus'

/**
 * 确认选项
 */
export interface ConfirmOptions {
    /**
     * 标题
     */
    title?: string

    /**
     * 消息
     */
    message?: string

    /**
     * 确认按钮文本
     */
    confirmButtonText?: string

    /**
     * 取消按钮文本
     */
    cancelButtonText?: string

    /**
     * 确认按钮类型
     */
    type?: 'warning' | 'info' | 'success' | 'error'

    /**
     * 是否显示取消按钮
     */
    showCancelButton?: boolean

    /**
     * 是否需要二次确认文本
     */
    requireConfirmText?: boolean

    /**
     * 二次确认文本
     */
    confirmText?: string

    /**
     * 是否需要密码确认
     */
    requirePassword?: boolean

    /**
     * 自定义内容
     */
    customContent?: VNode | string
}

/**
 * 确认结果
 */
export interface ConfirmResult {
    /**
     * 是否确认
     */
    confirmed: boolean

    /**
     * 确认文本（如果需要）
     */
    confirmText?: string

    /**
     * 密码（如果需要）
     */
    password?: string

    /**
     * 操作类型
     */
    action: Action
}

/**
 * useConfirm 返回值
 */
export interface UseConfirmReturn {
    /**
     * 显示确认对话框
     */
    confirm: (options?: ConfirmOptions) => Promise<ConfirmResult>

    /**
     * 显示警告确认对话框
     */
    confirmWarning: (message: string, title?: string) => Promise<ConfirmResult>

    /**
     * 显示危险确认对话框（需要二次确认）
     */
    confirmDanger: (message: string, title?: string, confirmText?: string) => Promise<ConfirmResult>

    /**
     * 显示密码确认对话框
     */
    confirmPassword: (message: string, title?: string) => Promise<ConfirmResult>

    /**
     * 显示删除确认对话框
     */
    confirmDelete: (itemName?: string) => Promise<ConfirmResult>
}

/**
 * 确认对话框 Composable
 *
 * @example
 * ```typescript
 * const { confirm, confirmDelete, confirmDanger } = useConfirm()
 *
 * // 基础确认
 * const result = await confirm({ message: '确定要执行此操作吗？' })
 * if (result.confirmed) {
 *   // 执行操作
 * }
 *
 * // 删除确认
 * const deleteResult = await confirmDelete('用户')
 * if (deleteResult.confirmed) {
 *   // 执行删除
 * }
 *
 * // 危险操作确认（需要输入确认文本）
 * const dangerResult = await confirmDanger('此操作不可撤销', '删除数据库', '确认删除')
 * if (dangerResult.confirmed) {
 *   // 执行危险操作
 * }
 * ```
 */
export function useConfirm(): UseConfirmReturn {
    /**
     * 显示确认对话框
     */
    async function confirm(options: ConfirmOptions = {}): Promise<ConfirmResult> {
        const {
            title = '确认操作',
            message = '确定要执行此操作吗？',
            confirmButtonText = '确定',
            cancelButtonText = '取消',
            type = 'warning',
            showCancelButton = true,
            requireConfirmText = false,
            confirmText = '确认',
            requirePassword = false,
            customContent
        } = options

        try {
            let messageContent: any = message

            // 如果需要二次确认文本
            if (requireConfirmText) {
                let inputValue = ''
                messageContent = h('div', [
                    h('p', { style: 'margin-bottom: 15px' }, message),
                    h(
                        'div',
                        {
                            style:
                                'padding: 10px; background-color: #fef0f0; border: 1px solid #fde2e2; border-radius: 4px; margin-bottom: 15px'
                        },
                        [
                            h('p', { style: 'margin: 0; color: #f56c6c; font-size: 14px' }, [
                                '此操作不可撤销，请输入 ',
                                h('strong', confirmText),
                                ' 以确认'
                            ])
                        ]
                    ),
                    h('input', {
                        type: 'text',
                        placeholder: `请输入 ${confirmText}`,
                        style:
                            'width: 100%; padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px',
                        onInput: (e: Event) => {
                            inputValue = (e.target as HTMLInputElement).value
                        }
                    })
                ])

                const action = await ElMessageBox.confirm(messageContent, title, {
                    confirmButtonText,
                    cancelButtonText,
                    type,
                    showCancelButton,
                    dangerouslyUseHTMLString: false,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            if (inputValue !== confirmText) {
                                instance.confirmButtonLoading = false
                                ElMessageBox.alert('确认文本不正确，请重新输入', '错误', {
                                    type: 'error'
                                })
                                return
                            }
                        }
                        done()
                    }
                } as ElMessageBoxOptions)

                return {
                    confirmed: action === 'confirm',
                    confirmText: inputValue,
                    action
                }
            }

            // 如果需要密码确认
            if (requirePassword) {
                let passwordValue = ''
                messageContent = h('div', [
                    h('p', { style: 'margin-bottom: 15px' }, message),
                    h(
                        'div',
                        {
                            style:
                                'padding: 10px; background-color: #fef0f0; border: 1px solid #fde2e2; border-radius: 4px; margin-bottom: 15px'
                        },
                        [h('p', { style: 'margin: 0; color: #f56c6c; font-size: 14px' }, '此操作需要验证您的密码')]
                    ),
                    h('input', {
                        type: 'password',
                        placeholder: '请输入密码',
                        style:
                            'width: 100%; padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px',
                        onInput: (e: Event) => {
                            passwordValue = (e.target as HTMLInputElement).value
                        }
                    })
                ])

                const action = await ElMessageBox.confirm(messageContent, title, {
                    confirmButtonText,
                    cancelButtonText,
                    type,
                    showCancelButton,
                    dangerouslyUseHTMLString: false,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            if (!passwordValue) {
                                instance.confirmButtonLoading = false
                                ElMessageBox.alert('请输入密码', '错误', {
                                    type: 'error'
                                })
                                return
                            }
                        }
                        done()
                    }
                } as ElMessageBoxOptions)

                return {
                    confirmed: action === 'confirm',
                    password: passwordValue,
                    action
                }
            }

            // 如果有自定义内容
            if (customContent) {
                messageContent = customContent
            }

            // 普通确认
            const action = await ElMessageBox.confirm(messageContent, title, {
                confirmButtonText,
                cancelButtonText,
                type,
                showCancelButton,
                dangerouslyUseHTMLString: typeof messageContent === 'string'
            } as ElMessageBoxOptions)

            return {
                confirmed: action === 'confirm',
                action
            }
        } catch (error) {
            // 用户取消
            return {
                confirmed: false,
                action: 'cancel'
            }
        }
    }

    /**
     * 显示警告确认对话框
     */
    async function confirmWarning(message: string, title = '警告'): Promise<ConfirmResult> {
        return confirm({
            title,
            message,
            type: 'warning'
        })
    }

    /**
     * 显示危险确认对话框（需要二次确认）
     */
    async function confirmDanger(
        message: string,
        title = '危险操作',
        confirmText = '确认'
    ): Promise<ConfirmResult> {
        return confirm({
            title,
            message,
            type: 'error',
            requireConfirmText: true,
            confirmText,
            confirmButtonText: '确认删除'
        })
    }

    /**
     * 显示密码确认对话框
     */
    async function confirmPassword(message: string, title = '密码确认'): Promise<ConfirmResult> {
        return confirm({
            title,
            message,
            type: 'warning',
            requirePassword: true
        })
    }

    /**
     * 显示删除确认对话框
     */
    async function confirmDelete(itemName = '此项'): Promise<ConfirmResult> {
        return confirm({
            title: '确认删除',
            message: `确定要删除${itemName}吗？此操作不可撤销。`,
            type: 'warning',
            confirmButtonText: '删除',
            requireConfirmText: true,
            confirmText: '删除'
        })
    }

    return {
        confirm,
        confirmWarning,
        confirmDanger,
        confirmPassword,
        confirmDelete
    }
}

export default useConfirm
