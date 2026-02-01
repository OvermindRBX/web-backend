import { type Tier, hasMinimumTier } from "./tiers"

export interface ModelConfig {
  id: string
  name: string
  provider: string
  creditCost: number
  requiredTier: Tier
  description?: string
  icon?: string
  actualModelId?: string
}

export const MODELS: Record<string, ModelConfig> = {
  "base-model": {
    id: "base-model",
    name: "Base Model",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 1,
    requiredTier: "free",
    description: "Reliable all-rounder",
    icon: "🔹",
    actualModelId: "mistralai/mistral-large-3-675b-instruct-2512",
  },
  "gpt-4.1-mini": {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 0.5,
    requiredTier: "free",
    description: "Fast & efficient",
    icon: "🚀",
  },
  "gpt-4o-latest": {
    id: "gpt-4o-latest",
    name: "GPT-4o",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 1,
    requiredTier: "free",
    description: "Fast and capable",
    icon: "⚡",
  },
  "o3-mini": {
    id: "o3-mini",
    name: "O3 Mini",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 2,
    requiredTier: "free",
    description: "Compact reasoning model",
    icon: "�",
  },
  "o1-preview": {
    id: "o1-preview",
    name: "O1 Preview",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 5,
    requiredTier: "pro",
    description: "Advanced reasoning",
    icon: "🧠",
  },
  "mistralai/mistral-large-3-675b-instruct-2512": {
    id: "mistralai/mistral-large-3-675b-instruct-2512",
    name: "Mistral Large 675B",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 4,
    requiredTier: "pro",
    description: "Powerful open model",
    icon: "🌀",
  },
  "gpt-5.1": {
    id: "gpt-5.1",
    name: "GPT-5.1",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 10,
    requiredTier: "studio",
    description: "Most capable model",
    icon: "💎",
  },
  "anthropic/claude-sonnet-4": {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "chat.gpt-chatbot.ru",
    creditCost: 2.5,
    requiredTier: "free",
    description: "Balanced intelligence",
    icon: "✨",
  },
}

export function getModel(id: string): ModelConfig | null {
  return MODELS[id] || null
}

export function getModelCost(modelId: string): number {
  const model = getModel(modelId)
  return model?.creditCost || 1
}

export function isModelAvailable(modelId: string, userTier: Tier): boolean {
  const model = getModel(modelId)
  if (!model) return false
  return hasMinimumTier(userTier, model.requiredTier)
}

export function getAvailableModels(userTier: Tier): ModelConfig[] {
  return Object.values(MODELS).filter((model) => 
    hasMinimumTier(userTier, model.requiredTier)
  )
}

export function getLockedModels(userTier: Tier): ModelConfig[] {
  return Object.values(MODELS).filter((model) => 
    !hasMinimumTier(userTier, model.requiredTier)
  )
}

export function getAllModels(): ModelConfig[] {
  return Object.values(MODELS)
}
