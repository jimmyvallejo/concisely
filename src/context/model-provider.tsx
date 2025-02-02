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
  handleInitialAndRemoval: () => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const { apiKeys } = useApiKeys();
  const [currentModel, setCurrentModel] = useState<ChatModelConfig | undefined>(
    undefined
  );

  const handleInitialAndRemoval = () => {
    if (apiKeys && apiKeys.openai) {
      setCurrentModel(CHAT_MODELS.GptMini);
      return;
    } else if (apiKeys && apiKeys.anthropic) {
      setCurrentModel(CHAT_MODELS.Sonnet);
    } else {
      setCurrentModel(undefined);
    }
  };

  useEffect(() => {
    handleInitialAndRemoval();
  }, [apiKeys]);

  useEffect(() => {
    console.log("Model:", currentModel);
  }, [currentModel]);

  return (
    <ModelContext.Provider
      value={{ currentModel, setCurrentModel, handleInitialAndRemoval }}
    >
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
