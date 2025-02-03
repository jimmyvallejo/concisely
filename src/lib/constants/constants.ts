export const BASE_URL = "http://localhost:8080"


export const API_PROVIDER = {
    OpenAI: 'openai',
    Anthropic: 'anthropic',
    DeepSeek: 'deepseek'
  } as const;

  export const CHAT_MODELS = {
    GptMini: {
      id: "gpt-4o-mini",
      displayName: "GPT-4o-Mini",
      provider: API_PROVIDER.OpenAI
    },
    GptStandard: {
      id: "gpt-4o-standard",
      displayName: "GPT-4o",
      provider: API_PROVIDER.OpenAI
    },
    GptOld: {
      id: "gpt-4-old",
      displayName: "GPT-4",
      provider: API_PROVIDER.OpenAI
    },
    Sonnet: {
      id: "claude-3.5-sonnet",
      displayName: "Claude 3.5 Sonnet", 
      provider: API_PROVIDER.Anthropic
    },
    Opus: {
      id: "claude-3-opus",
      displayName: "Claude 3 Opus",
      provider: API_PROVIDER.Anthropic
    },
    Haiku: {
      id: "claude-3-haiku",
      displayName: "Claude 3 Haiku",
      provider: API_PROVIDER.Anthropic
    }
  } as const;