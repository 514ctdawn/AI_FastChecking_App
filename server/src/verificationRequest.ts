/**
 * Treat only @VeriSenior + 查證 intent as a Tag-to-App request (not a random reply).
 * If the webhook omits comment text (common with Meta), we accept and still process.
 */
export function isVeriSeniorVerificationRequest(commentText: string | undefined | null): boolean {
  if (commentText == null || !String(commentText).trim()) return true
  const t = String(commentText).toLowerCase()
  const mentionsBot =
    t.includes('@verisenior') || t.includes('veri senior') || t.includes('verisenior')
  const intent =
    t.includes('幫我查證') ||
    t.includes('幫我查') ||
    t.includes('查證') ||
    t.includes('查核') ||
    t.includes('fact check')
  return mentionsBot && intent
}
