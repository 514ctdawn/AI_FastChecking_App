// Mock data for the fact-checking app (Traditional Chinese)
export const recentVerifications = [
  {
    id: '1',
    snippet: '突破性發現：每日喝八杯熱水，癌症遠離你',
    platform: 'WhatsApp',
    status: 'false',
    date: '2 小時前',
  },
  {
    id: '2',
    snippet: '政府宣佈：本月起，老年年金將調漲 5%',
    platform: 'Facebook',
    status: 'true',
    date: '5 小時前',
  },
  {
    id: '3',
    snippet: '免費領取最新 iPhone 15 Pro！只需將此訊息轉發給 10 人...',
    platform: 'Douyin',
    status: 'false',
    date: '昨天',
  },
  {
    id: '4',
    snippet: '新變種病毒 Omicron 正在傳播 - 衛生官員籲保持警戒',
    platform: 'Facebook',
    status: 'caution',
    date: '昨天',
  },
]

export const factCheckDetails = {
  '1': {
    id: '1',
    snippet: '突破性發現：每日喝八杯熱水，癌症遠離你',
    status: 'false',
    simpleExplanation: '此訊息為不實內容。沒有任何科學研究證實喝熱水可以預防或治療癌症。保持健康的方式包括均衡飲食、規律運動與定期健檢。若有身體不適，請尋求醫師協助。',
  },
  '2': {
    id: '2',
    snippet: '政府宣佈：本月起，老年年金將調漲 5%',
    status: 'true',
    simpleExplanation: '此訊息屬實。政府已正式公告老年年金調漲 5%。您可至政府官網查詢詳細資訊，或撥打年金諮詢專線。',
  },
  '3': {
    id: '3',
    snippet: '免費領取最新 iPhone 15 Pro！只需將此訊息轉發給 10 人...',
    status: 'false',
    simpleExplanation: '這是常見的詐騙手法。沒有任何正規公司會要求轉發訊息來贈送手機。這類訊息常企圖竊取個人資料。請勿轉發或分享。',
  },
  '4': {
    id: '4',
    snippet: '新變種病毒 Omicron 正在傳播 - 衛生官員籲保持警戒',
    status: 'caution',
    simpleExplanation: '衛生單位已針對 COVID 變異株發布相關指引。但此貼文部分內容可能過度渲染。請至官方衛生部門網站查詢最新、最準確的資訊。',
  },
}

export const knowledgeLibrary = [
  { id: 'k1', category: '健康', title: 'COVID-19 疫苗相關', count: 12 },
  { id: 'k2', category: '健康', title: '偏方與另類療法', count: 8 },
  { id: 'k3', category: '理財', title: '投資詐騙', count: 15 },
  { id: 'k4', category: '理財', title: '銀行簡訊詐騙', count: 9 },
  { id: 'k5', category: '社會', title: '名人逝世謠言', count: 6 },
  { id: 'k6', category: '社會', title: '政府補助傳聞', count: 11 },
]
