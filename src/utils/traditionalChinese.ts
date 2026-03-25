/**
 * VeriSenior Tag-to-App: AI responses are prompted for Taiwan Traditional Chinese (繁體中文).
 * Normalize display strings (trim, strip zero-width) before showing in the dashboard.
 */
export function formatAsTraditionalChinese(text: string): string {
  if (!text) return text
  return text.replace(/\u200b/g, '').trim()
}
