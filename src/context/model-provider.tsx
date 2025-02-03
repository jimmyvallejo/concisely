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
  handleSetModel: (model: ChatModelConfig) => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const { apiKeys } = useApiKeys();
  const [currentModel, setCurrentModel] = useState<ChatModelConfig | undefined>(
    undefined
  );

  const handleSetModel = async (model: ChatModelConfig | undefined) => {
    try {
      await chrome.storage.local.set({ current_model: model });
      setCurrentModel(model);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInit = async () => {
    try {
      const result = await chrome.storage.local.get("current_model");
      if (result.current_model) {
        setCurrentModel(result.current_model);
      } else {
        if (apiKeys?.openai) {
          handleSetModel(CHAT_MODELS.GptMini);
          return;
        } else if (apiKeys?.anthropic) {
          handleSetModel(CHAT_MODELS.Sonnet);
        } else {
          handleSetModel(undefined);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleInit();
  }, [apiKeys]);

  useEffect(() => {
    console.log("Model:", currentModel);
  }, [currentModel]);

  return (
    <ModelContext.Provider
      value={{
        currentModel,
        setCurrentModel,
        handleSetModel,
      }}
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
