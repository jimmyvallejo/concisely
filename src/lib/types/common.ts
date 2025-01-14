export type ApiKeys = {
    openai: string | null;
    anthropic: string | null;
  };


export type ApiProvider = 'openai' | 'anthropic';

export type ChatModelConfig = {
  id: string;
  displayName: string;
  provider: ApiProvider;
};

export type ChatModels = {
  Mini: ChatModelConfig;
  Sonnet: ChatModelConfig;
};