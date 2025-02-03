import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ApiKeys, ApiProvider } from "@/lib/types/common";
import { SecureKeyStorage } from "@/lib/utils/encryption";

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  fetchApiKeys: () => Promise<void>;
  deleteApiKey: (provider: ApiProvider) => Promise<void>;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export const ApiKeysProvider = ({ children }: { children: ReactNode }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: null,
    anthropic: null,
    deepseek: null,
  });

  const fetchApiKeys = async () => {
    const openAiKey = await SecureKeyStorage.getApiKey("openai");
    const anthropicKey = await SecureKeyStorage.getApiKey("anthropic");
    const deepseekKey = await SecureKeyStorage.getApiKey("deepseek");
    setApiKeys({
      openai: openAiKey,
      anthropic: anthropicKey,
      deepseek: deepseekKey,
    });
  };

  const deleteApiKey = async (provider: ApiProvider) => {
    try {
      await SecureKeyStorage.removeApiKey(provider);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    console.log("Keys:", apiKeys);
  }, [apiKeys]);

  return (
    <ApiKeysContext.Provider value={{ apiKeys, fetchApiKeys, deleteApiKey }}>
      {children}
    </ApiKeysContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeysContext);
  if (context === undefined) {
    throw new Error("useApiKeys must be used within an ApiKeysProvider");
  }
  return context;
};
