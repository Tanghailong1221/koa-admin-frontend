import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface NotificationItem {
    id: number
    title: string
    content: string
    type: 'message' | 'system' | 'warning'
    time: string
    read: boolean
    createTime: string
}

export const useNotificationStore = defineStore('notification', () => {
    // 消息列表
    const notifications = ref<NotificationItem[]>([
        { id: 1, title: '系统更新通知', content: '系统将于今晚22:00进行维护升级，预计持续2小时。届时系统将暂停服务，请提前做好相关工作安排。', type: 'system', time: '10分钟前', createTime: '2025-12-25 14:30:00', read: false },
        { id: 2, title: '新用户注册', content: '用户 张三 已完成注册，请及时审核其账户信息和权限配置。', type: 'message', time: '30分钟前', createTime: '2025-12-25 14:10:00', read: false },
        { id: 3, title: '安全警告', content: '检测到异常登录行为，IP地址：192.168.1.100，登录时间：2025-12-25 13:45:00，请确认是否为本人操作。', type: 'warning', time: '1小时前', createTime: '2025-12-25 13:45:00', read: false },
        { id: 4, title: '任务完成提醒', content: '您的数据导出任务已完成，文件大小：2.5MB，请前往下载中心获取文件。', type: 'message', time: '2小时前', createTime: '2025-12-25 12:30:00', read: true },
        { id: 5, title: '权限变更通知', content: '您的角色权限已更新，新增了"数据导出"和"报表查看"权限，请重新登录使配置生效。', type: 'system', time: '昨天', createTime: '2025-12-24 16:00:00', read: true },
        { id: 6, title: '密码即将过期', content: '您的登录密码将于7天后过期，为确保账户安全，请及时修改密码。', type: 'warning', time: '昨天', createTime: '2025-12-24 10:00:00', read: true },
        { id: 7, title: '新功能上线通知', content: '系统新增了批量导入功能，支持Excel和CSV格式，欢迎体验使用。', type: 'system', time: '3天前', createTime: '2025-12-22 09:00:00', read: true },
        { id: 8, title: '审批流程提醒', content: '您有一条待审批的请假申请，申请人：李四，请假类型：年假，请及时处理。', type: 'message', time: '3天前', createTime: '2025-12-22 08:30:00', read: true },
    ])

    // 未读消息数量
    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

    // 标记单条消息为已读
    const markAsRead = (id: number) => {
        const item = notifications.value.find(n => n.id === id)
        if (item) {
            item.read = true
        }
    }

    // 标记所有消息为已读
    const markAllAsRead = () => {
        notifications.value.forEach(n => n.read = true)
    }

    // 删除消息
    const deleteNotification = (id: number) => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
            notifications.value.splice(index, 1)
        }
    }

    // 清空所有已读消息
    const clearReadNotifications = () => {
        notifications.value = notifications.value.filter(n => !n.read)
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
    }
})
