export type ApiKeys = {
    openai: string | null;
    anthropic: string | null;
  };

export type ApiType = "gpt" | "claude";

export enum ChatModels {
  Mini = "gpt-4-mini",     
  Sonnet = "claude-3-sonnet"  
}