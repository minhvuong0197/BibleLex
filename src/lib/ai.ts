export class AiNotConfiguredError extends Error {
  constructor(message = 'Chưa cấu hình AI_API_KEY') {
    super(message)
    this.name = 'AiNotConfiguredError'
  }
}

export class AiRequestError extends Error {}

interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiResult {
  text: string
  model: string
}

export type AiProviderKey = 'gemini' | 'openai' | 'ollama' | 'groq'

interface ProviderPreset {
  label: string
  baseUrl: string
  defaultModel: string
  models: string[]
}

export const AI_PROVIDERS: Record<AiProviderKey, ProviderPreset> = {
  gemini: {
    label: 'Gemini (Google AI Studio)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.6-flash',
    models: ['gemini-3.6-flash', 'gemini-3.5-flash'],
  },
  openai: {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'],
  },
  ollama: {
    label: 'Ollama (local)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.1',
    models: ['llama3.1', 'llama3.2', 'qwen2.5', 'gemma2', 'mistral'],
  },
  groq: {
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
}

export interface AiConfig {
  providerKey: string
  providerLabel: string
  baseUrl: string
  model: string
  models: string[]
  apiKey: string
}

export function resolveAiConfig(modelOverride?: string): AiConfig {
  const providerKey = (process.env.AI_PROVIDER || '').toLowerCase()
  const preset = (AI_PROVIDERS as Record<string, ProviderPreset>)[providerKey]
  const baseUrl = process.env.AI_BASE_URL || preset?.baseUrl || 'https://api.openai.com/v1'
  const model = modelOverride || process.env.AI_MODEL || preset?.defaultModel || 'gemini-2.0-flash'
  const providerLabel = preset?.label || (process.env.AI_BASE_URL ? 'Tùy chỉnh' : 'Mặc định')
  const models = preset?.models?.length ? preset.models : [model]
  return {
    providerKey: preset ? providerKey : 'custom',
    providerLabel,
    baseUrl,
    model,
    models,
    apiKey: process.env.AI_API_KEY || '',
  }
}

export async function generateAiText(
  system: string,
  user: string,
  opts?: { temperature?: number; timeoutMs?: number; model?: string }
): Promise<AiResult> {
  const config = resolveAiConfig(opts?.model)
  if (!config.apiKey) throw new AiNotConfiguredError()

  const baseUrl = config.baseUrl.replace(/\/+$/, '')
  const model = config.model
  const temperature = opts?.temperature ?? 0.3
  const timeoutMs = opts?.timeoutMs ?? 120000

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ] as AiChatMessage[],
        temperature,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new AiRequestError(`Yêu cầu AI thất bại (${res.status}): ${errText.slice(0, 300)}`)
    }

    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''
    return { text, model }
  } catch (err) {
    if (err instanceof AiNotConfiguredError || err instanceof AiRequestError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AiRequestError('Yêu cầu AI quá thời gian chờ')
    }
    throw new AiRequestError(`Lỗi khi gọi AI: ${(err as Error).message}`)
  } finally {
    clearTimeout(timer)
  }
}
