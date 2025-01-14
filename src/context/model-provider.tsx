import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { useApiKeys } from "./key-provider";
import { CHAT_MODELS } from "@/lib/constants/constants";
import { ChatModelConfig } from "@/lib/types/common";

interface ModelContextType {
  currentModel: ChatModelConfig | undefined;
  setCurrentModel: Dispatch<SetStateAction<ChatModelConfig | undefined>>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const { apiKeys } = useApiKeys();
  const [currentModel, setCurrentModel] = useState<ChatModelConfig | undefined>(
    undefined
  );

  useEffect(() => {
    if (apiKeys && apiKeys.openai) {
      setCurrentModel(CHAT_MODELS.Mini);
    }
  }, [apiKeys]);

  useEffect(() => {
    console.log("Model:", currentModel);
  }, [currentModel]);

  return (
    <ModelContext.Provider value={{ currentModel, setCurrentModel }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};
