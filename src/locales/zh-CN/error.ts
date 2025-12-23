/**
 * 错误信息翻译
 */

export default {
    // HTTP 错误
    http: {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '没有权限访问',
        404: '请求的资源不存在',
        405: '请求方法不允许',
        408: '请求超时',
        409: '数据冲突',
        422: '数据验证失败',
        429: '请求过于频繁，请稍后再试',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务暂时不可用',
        504: '网关超时',
        networkError: '网络连接失败，请检查网络',
        timeout: '请求超时，请稍后重试',
        unknown: '网络异常，请稍后重试'
    },

    // 业务错误
    business: {
        userNotFound: '用户不存在',
        userDisabled: '用户已被禁用',
        userLocked: '用户已被锁定',
        passwordError: '密码错误',
        passwordExpired: '密码已过期，请修改密码',
        tokenExpired: '登录已过期，请重新登录',
        tokenInvalid: '登录信息无效，请重新登录',
        permissionDenied: '没有权限执行此操作',
        dataNotFound: '数据不存在',
        dataExists: '数据已存在',
        operationFailed: '操作失败',
        uploadFailed: '上传失败',
        downloadFailed: '下载失败',
        exportFailed: '导出失败',
        importFailed: '导入失败'
    },

    // 页面错误
    page: {
        404: '页面不存在',
        403: '没有权限访问此页面',
        500: '服务器错误',
        backHome: '返回首页',
        backPrevious: '返回上一页',
        refresh: '刷新页面'
    }
}
