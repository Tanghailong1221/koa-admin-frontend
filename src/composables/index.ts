/**
 * Composables 统一导出
 */

export { useFormDraft } from './useFormDraft'
export { useFormGuard } from './useFormGuard'
export { useFormValidation, ValidationRules } from './useFormValidation'
export { useFormSubmit } from './useFormSubmit'
export { useTheme } from './useTheme'

export type { FormDraftOptions } from './useFormDraft'
export type { FormGuardOptions } from './useFormGuard'
export type {
    FormValidationOptions,
    FieldValidationResult,
    FormValidationResult
} from './useFormValidation'
export type { FormSubmitOptions } from './useFormSubmit'
export { useTableColumns } from './useTableColumns'
export { useTableSelection } from './useTableSelection'
export { useTableFilter } from './useTableFilter'
export { useDict, useDicts } from './useDict'

export type { TableColumnsOptions } from './useTableColumns'
export type { TableSelectionOptions } from './useTableSelection'
export { usePermission } from './usePermission'
export { usePermissionRefresh } from './usePermissionRefresh'
export { useCrypto } from './useCrypto'
export { useKeyboardShortcut, useShortcut } from './useKeyboardShortcut'
export { useI18n } from './useI18n'
export { useXSS, useSanitizedHtml, useEscapedHtml, useStrippedHtml, useBatchSanitize } from './useXSS'
export { useCSRF, useFormCSRF } from './useCSRF'
export { useSecurityHeaders } from './useSecurityHeaders'
export { useConfirm } from './useConfirm'
export { useVersionCheck } from './useVersionCheck'
export { useFocusTrap } from './useFocusTrap'
export { usePWA, useInstallPrompt } from './usePWA'
export { useOfflineCache } from './useOfflineCache'

export type { UsePWAReturn } from './usePWA'
export type { UseOfflineCacheReturn } from './useOfflineCache'
