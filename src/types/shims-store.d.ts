// 临时补充模块声明，解决编辑器中 "@/store/auth" 无法解析的问题
// 这里提供一个简化的类型声明，避免影响实际运行
declare module '@/store/auth' {
  export const useAuthStore: () => any
}


