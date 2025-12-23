/**
 * 过滤工具函数
 */

import { FilterOperator, FilterLogic } from '@/components/Search/types'
import type { FilterCondition, FilterGroup } from '@/components/Search/types'

/**
 * 应用过滤条件到数据
 */
export function applyFilter<T = any>(data: T[], filterGroup: FilterGroup): T[] {
    if (!filterGroup.conditions || filterGroup.conditions.length === 0) {
        return data
    }

    return data.filter(item => evaluateFilterGroup(item, filterGroup))
}

/**
 * 评估过滤组
 */
function evaluateFilterGroup<T = any>(item: T, filterGroup: FilterGroup): boolean {
    const { logic, conditions, groups } = filterGroup

    // 评估条件
    const conditionResults = conditions.map(condition =>
        evaluateCondition(item, condition)
    )

    // 评估子组
    const groupResults = groups?.map(group =>
        evaluateFilterGroup(item, group)
    ) || []

    // 合并结果
    const allResults = [...conditionResults, ...groupResults]

    // 根据逻辑关系返回结果
    if (logic === FilterLogic.AND) {
        return allResults.every(result => result)
    } else {
        return allResults.some(result => result)
    }
}

/**
 * 评估单个条件
 */
function evaluateCondition<T = any>(item: T, condition: FilterCondition): boolean {
    const { field, operator, value } = condition
    const itemValue = getNestedValue(item, field)

    switch (operator) {
        case FilterOperator.EQUAL:
            return itemValue === value

        case FilterOperator.NOT_EQUAL:
            return itemValue !== value

        case FilterOperator.GREATER_THAN:
            return itemValue > value

        case FilterOperator.GREATER_THAN_OR_EQUAL:
            return itemValue >= value

        case FilterOperator.LESS_THAN:
            return itemValue < value

        case FilterOperator.LESS_THAN_OR_EQUAL:
            return itemValue <= value

        case FilterOperator.CONTAINS:
            return String(itemValue).toLowerCase().includes(String(value).toLowerCase())

        case FilterOperator.NOT_CONTAINS:
            return !String(itemValue).toLowerCase().includes(String(value).toLowerCase())

        case FilterOperator.STARTS_WITH:
            return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())

        case FilterOperator.ENDS_WITH:
            return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())

        case FilterOperator.IN:
            return Array.isArray(value) && value.includes(itemValue)

        case FilterOperator.NOT_IN:
            return Array.isArray(value) && !value.includes(itemValue)

        case FilterOperator.IS_NULL:
            return itemValue === null || itemValue === undefined || itemValue === ''

        case FilterOperator.IS_NOT_NULL:
            return itemValue !== null && itemValue !== undefined && itemValue !== ''

        case FilterOperator.BETWEEN:
            if (Array.isArray(value) && value.length === 2) {
                return itemValue >= value[0] && itemValue <= value[1]
            }
            return false

        default:
            return true
    }
}

/**
 * 获取嵌套值
 */
function getNestedValue<T = any>(obj: T, path: string): any {
    return path.split('.').reduce((current: any, key: string) => {
        return current?.[key]
    }, obj)
}

/**
 * 高亮文本
 */
export function highlightText(text: string, keyword: string): string {
    if (!keyword) return text

    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 将过滤组转换为 URL 参数
 */
export function filterGroupToUrlParams(filterGroup: FilterGroup): Record<string, string> {
    const params: Record<string, string> = {}

    // 简化版：只处理第一层条件
    filterGroup.conditions.forEach((condition, index) => {
        params[`filter[${index}][field]`] = condition.field
        params[`filter[${index}][operator]`] = condition.operator
        params[`filter[${index}][value]`] = JSON.stringify(condition.value)
    })

    params['filter[logic]'] = filterGroup.logic

    return params
}

/**
 * 从 URL 参数解析过滤组
 */
export function urlParamsToFilterGroup(params: Record<string, string>): FilterGroup | null {
    try {
        const conditions: FilterCondition[] = []
        let logic = FilterLogic.AND

        // 解析逻辑
        const logicParam = params['filter[logic]']
        if (logicParam) {
            logic = logicParam as FilterLogic
        }

        // 解析条件
        let index = 0
        while (params[`filter[${index}][field]`]) {
            const fieldParam = params[`filter[${index}][field]`]
            const operatorParam = params[`filter[${index}][operator]`]
            const valueParam = params[`filter[${index}][value]`]

            if (fieldParam && operatorParam) {
                conditions.push({
                    field: fieldParam,
                    operator: operatorParam as FilterOperator,
                    value: valueParam ? JSON.parse(valueParam) : undefined
                })
            }
            index++
        }

        if (conditions.length === 0) {
            return null
        }

        return {
            logic,
            conditions
        }
    } catch (error) {
        console.error('解析 URL 参数失败:', error)
        return null
    }
}
