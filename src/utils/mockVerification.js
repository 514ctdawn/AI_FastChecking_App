/**
 * Simulates AI verification - returns status and explanation based on content.
 * In production, this would call a real AI/backend.
 */
export function mockVerifyContent(text) {
  const t = (text || '').toLowerCase()
  const scamKeywords = ['免費', '轉發', 'forward', '贈送', '中獎', '領取', '立即', '限時']
  const healthFalse = ['治癒', '根治', '遠離癌症', '熱水', '檸檬水', '糖尿病']
  const govKeywords = ['政府', '宣佈', '公告', '調漲', '年金', '補助']

  if (scamKeywords.some((k) => t.includes(k))) {
    return {
      status: 'false',
      simpleExplanation:
        '這是常見的詐騙或誤導訊息。請勿轉發或分享個人資料。建議查詢官方管道以確認資訊真實性。',
    }
  }
  if (healthFalse.some((k) => t.includes(k))) {
    return {
      status: 'false',
      simpleExplanation:
        '此類健康宣稱缺乏科學依據。若有健康疑慮，請諮詢醫師或查詢衛福部官方資訊。',
    }
  }
  if (govKeywords.some((k) => t.includes(k))) {
    return {
      status: 'true',
      simpleExplanation:
        '此訊息與政府公告相符。建議至政府官網或撥打諮詢專線確認最新細節。',
    }
  }
  return {
    status: 'caution',
    simpleExplanation:
      '部分內容需進一步確認。建議查詢可靠來源或官方網站以獲取準確資訊。',
  }
}

export function generateId() {
  return 'v_' + Date.now()
}
