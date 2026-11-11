export interface ModelPrice {
  id: string
  name: string
  inputPerMillion: number
  outputPerMillion: number
}

export const DEFAULT_MODELS: ModelPrice[] = [
  { id: 'gpt-4o', name: 'GPT-4o', inputPerMillion: 2.5, outputPerMillion: 10 },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', inputPerMillion: 0.15, outputPerMillion: 0.6 },
  { id: 'claude-sonnet', name: 'Claude Sonnet', inputPerMillion: 3, outputPerMillion: 15 },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', inputPerMillion: 0.27, outputPerMillion: 1.1 },
  { id: 'qwen-plus', name: '通义千问 Plus', inputPerMillion: 0.8, outputPerMillion: 2 },
  { id: 'gemini-flash', name: 'Gemini Flash', inputPerMillion: 0.15, outputPerMillion: 0.6 },
]

export function estimateCost(model: ModelPrice, inputTokens: number, outputTokens: number): number {
  if (inputTokens < 0 || outputTokens < 0) throw new Error('Token 数不能为负')
  if (model.inputPerMillion < 0 || model.outputPerMillion < 0) throw new Error('单价不能为负')
  return (inputTokens / 1_000_000) * model.inputPerMillion + (outputTokens / 1_000_000) * model.outputPerMillion
}

export function compareModels(models: ModelPrice[], inputTokens: number, outputTokens: number): Array<ModelPrice & { cost: number }> {
  return models
    .map((model) => ({ ...model, cost: estimateCost(model, inputTokens, outputTokens) }))
    .sort((a, b) => a.cost - b.cost)
}
