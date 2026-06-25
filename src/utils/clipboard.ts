import { ElMessage } from 'element-plus'

/**
 * 安全复制文本到剪贴板
 * @param text 要复制的文本
 * @param successMsg 成功提示（可选）
 * @returns 是否成功
 */
export async function copyToClipboard(text: string, successMsg = '已复制到剪贴板'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    if (successMsg) {
      ElMessage.success(successMsg)
    }
    return true
  } catch (error) {
    // 降级方案：使用传统的 textarea 复制方法
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (successMsg) {
        ElMessage.success(successMsg)
      }
      return true
    } catch {
      ElMessage.error('复制失败，请手动复制')
      return false
    }
  }
}
