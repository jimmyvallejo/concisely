import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ApiKeys } from "@/lib/types/common";
import { SecureKeyStorage } from "@/lib/utils/encryption";

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  fetchApiKeys: () => Promise<void>;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export const ApiKeysProvider = ({ children }: { children: ReactNode }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: null,
    anthropic: null,
  });

  const fetchApiKeys = async () => {
    const openAiKey = await SecureKeyStorage.getApiKey("openai");
    const anthropicKey = await SecureKeyStorage.getApiKey("anthropic");
    setApiKeys({ openai: openAiKey, anthropic: anthropicKey });
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <ApiKeysContext.Provider value={{ apiKeys, fetchApiKeys }}>
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
