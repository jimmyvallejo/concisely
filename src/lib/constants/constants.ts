export const API_PROVIDER = {
    OpenAI: 'openai',
    Anthropic: 'anthropic'
  } as const;

  export const CHAT_MODELS = {
    Mini: {
      id: "gpt-4o-mini",
      displayName: "GPT-4o",
      provider: API_PROVIDER.OpenAI
    },
    Sonnet: {
      id: "claude-3.5-sonnet",
      displayName: "Claude 3.5 Sonnet",
      provider: API_PROVIDER.Anthropic
    }
  } as const;

