/**
 * Error translations
 */

export default {
    // HTTP errors
    http: {
        400: 'Bad Request',
        401: 'Unauthorized, please login again',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        408: 'Request Timeout',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        networkError: 'Network Error',
        timeout: 'Request Timeout',
        unknown: 'Unknown Error'
    },

    // Business errors
    business: {
        userNotFound: 'User not found',
        userDisabled: 'User is disabled',
        userLocked: 'User is locked',
        passwordError: 'Password error',
        passwordExpired: 'Password expired',
        tokenExpired: 'Token expired, please login again',
        tokenInvalid: 'Token invalid, please login again',
        permissionDenied: 'Permission denied',
        dataNotFound: 'Data not found',
        dataExists: 'Data already exists',
        operationFailed: 'Operation failed',
        uploadFailed: 'Upload failed',
        downloadFailed: 'Download failed',
        exportFailed: 'Export failed',
        importFailed: 'Import failed'
    },

    // Page errors
    page: {
        404: 'Page Not Found',
        403: 'Forbidden',
        500: 'Server Error',
        backHome: 'Back Home',
        backPrevious: 'Back',
        refresh: 'Refresh'
    }
}
