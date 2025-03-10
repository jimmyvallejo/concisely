export type ApiKeys = {
    openai: string | null;
    anthropic: string | null;
    deepseek: string | null;
    gemini: string | null
  };


export type ApiProvider = 'openai' | 'anthropic' | 'deepseek' | 'gemini';

export type ChatModelConfig = {
  id: string;
  displayName: string;
  provider: ApiProvider;
};

export type ChatModels = {
  Mini: ChatModelConfig;
  Sonnet: ChatModelConfig;
};

export interface SavedChat {
  url: string;
  title: string;
  summary: string;
  timestamp: number;
}