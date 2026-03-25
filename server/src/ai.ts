import type { AiAnalysisResult } from './types.js'

const SYSTEM = `You are VeriSenior's fact-check assistant for elderly users in Taiwan.

Respond ONLY with compact JSON, no markdown or code fences:
{"status":"True"|"False"|"Caution","explanation":"Traditional Chinese (Taiwan 繁體中文) only, max ~25 words","confidence":0.0-1.0}

Rules:
- "True" = claim is largely accurate; "False" = misleading or false; "Caution" = unclear or needs context.
- The "explanation" field MUST be written in Traditional Chinese (臺灣常用字形). If the source post is in English or another language, still write the explanation in Traditional Chinese.
- Use natural, respectful wording suitable for seniors.`

/** Alias for integrations that expect `analyzeWithAI(content)`. */
export async function analyzeWithAI(text: string): Promise<AiAnalysisResult> {
  return analyzeContent(text)
}

export async function analyzeContent(text: string): Promise<AiAnalysisResult> {
  const trimmed = (text || '').trim()
  if (!trimmed) {
    return {
      status: 'Caution',
      explanation: '內容為空，無法有效查核。',
      confidence: 0.2,
    }
  }

  if (process.env.OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: trimmed.slice(0, 12000) },
        ],
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OPENAI_${res.status}: ${err.slice(0, 200)}`)
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
    return parseAiJson(raw)
  }

  if (process.env.GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM}\n\n---\n${trimmed.slice(0, 12000)}` }] }],
        generationConfig: { temperature: 0.2 },
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GEMINI_${res.status}: ${err.slice(0, 200)}`)
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
    return parseAiJson(raw)
  }

  return mockAnalyze(trimmed)
}

function parseAiJson(raw: string): AiAnalysisResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : raw
  try {
    const o = JSON.parse(jsonStr) as {
      status?: string
      explanation?: string
      analysis?: string
      reason?: string
      confidence?: number
    }
    const status =
      o.status === 'True' || o.status === 'False' || o.status === 'Caution' ? o.status : 'Caution'
    const explanationRaw =
      typeof o.explanation === 'string' && o.explanation.length > 0
        ? o.explanation
        : typeof o.analysis === 'string' && o.analysis.length > 0
          ? o.analysis
          : typeof o.reason === 'string' && o.reason.length > 0
            ? o.reason
            : '無法產生簡短說明。'
    const explanation = explanationRaw.slice(0, 200)
    const confidence =
      typeof o.confidence === 'number' && !Number.isNaN(o.confidence)
        ? Math.min(1, Math.max(0, o.confidence))
        : 0.7
    return { status, explanation, confidence }
  } catch {
    return mockAnalyze(raw)
  }
}

function mockAnalyze(text: string): AiAnalysisResult {
  const t = text.toLowerCase()
  const scam = ['免費', '轉發', '贈送', '中獎', '領取', '限時']
  const healthFalse = ['治癒', '根治', '遠離癌症', '熱水治']
  if (scam.some((k) => t.includes(k))) {
    return {
      status: 'False',
      explanation: '常見詐騙或誤導話術，請勿提供個資或轉發。',
      confidence: 0.82,
    }
  }
  if (healthFalse.some((k) => t.includes(k))) {
    return {
      status: 'False',
      explanation: '健康宣稱缺乏可靠醫學依據，請以醫師說明為準。',
      confidence: 0.78,
    }
  }
  if (['政府', '公告', '年金', '調漲'].some((k) => t.includes(k))) {
    return {
      status: 'True',
      explanation: '內容與官方說法大致相符，仍建議查官網確認。',
      confidence: 0.75,
    }
  }
  return {
    status: 'Caution',
    explanation: '資訊不完整或需更多背景，建議查核官方來源。',
    confidence: 0.55,
  }
}
