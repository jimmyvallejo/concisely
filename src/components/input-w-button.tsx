import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiProvider } from "@/lib/types/common";
import { useEffect, useState } from "react";
import { SecureKeyStorage } from "@/lib/utils/encryption";
import { useApiKeys } from "@/context/key-provider";
import { useModel } from "@/context/model-provider";
import { validateOpenAI, validateAnthropicKey, validateDeepseekKey } from "@/lib/api/validate-keys";
import { API_PROVIDER } from "@/lib/constants/constants";

interface InputWithButtonProps {
  type: ApiProvider;
}

export const InputWithButton = ({ type }: InputWithButtonProps) => {
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [anthropicKey, setAnthropicKey] = useState<string>("");
  const [deepseekKey, setDeepseekKey] = useState<string>("");
  const { apiKeys, fetchApiKeys } = useApiKeys();
  const { handleInitialAndRemoval } = useModel();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (apiKeys) {
      if (type === API_PROVIDER.OpenAI && apiKeys.openai) {
        setOpenAiKey(apiKeys.openai);
      } else if (type === API_PROVIDER.Anthropic && apiKeys.anthropic) {
        setAnthropicKey(apiKeys.anthropic);
      } else if (type === API_PROVIDER.DeepSeek && apiKeys.deepseek) {
        setDeepseekKey(apiKeys.deepseek);
      }
    }
  }, [apiKeys, type]);

  const getButtonText = () => {
    switch (type) {
      case API_PROVIDER.OpenAI:
        return apiKeys?.openai ? "Remove" : "Add";
      case API_PROVIDER.Anthropic:
        return apiKeys?.anthropic ? "Remove" : "Add";
      case API_PROVIDER.DeepSeek:
        return apiKeys?.deepseek ? "Remove" : "Add";
      default:
        return "Add";
    }
  };

  const handleInputChange = (value: string) => {
    setError("");
    switch (type) {
      case API_PROVIDER.OpenAI:
        setOpenAiKey(value);
        break;
      case API_PROVIDER.Anthropic:
        setAnthropicKey(value);
        break;
      case API_PROVIDER.DeepSeek:
        setDeepseekKey(value);
        break;
    }
  };

  const handleSetKey = async () => {
    try {
      const isRemove = getButtonText() === "Remove";

      if (isRemove) {
        await SecureKeyStorage.removeApiKey(type);
        handleInitialAndRemoval();
        switch (type) {
          case API_PROVIDER.OpenAI:
            setOpenAiKey("");
            break;
          case API_PROVIDER.Anthropic:
            setAnthropicKey("");
            break;
          case API_PROVIDER.DeepSeek:
            setDeepseekKey("");
            break;
        }
      } else {
        let key = "";
        let isValid = false;

        switch (type) {
          case API_PROVIDER.OpenAI:
            key = openAiKey;
            isValid = await validateOpenAI(key);
            break;
          case API_PROVIDER.Anthropic:
            key = anthropicKey;
            isValid = await validateAnthropicKey(key);
            break;
          case API_PROVIDER.DeepSeek:
            key = deepseekKey;
            isValid = await validateDeepseekKey(key);
            break;
        }

        if (!key) return;

        if (isValid) {
          await SecureKeyStorage.saveApiKey(type, key);
        } else {
          setError("Invalid API key");
          return;
        }
      }

      await fetchApiKeys();
    } catch (error) {
      console.error("Error managing API key:", error);
    }
  };

  const getCurrentValue = () => {
    switch (type) {
      case API_PROVIDER.OpenAI:
        return openAiKey || "";
      case API_PROVIDER.Anthropic:
        return anthropicKey || "";
      case API_PROVIDER.DeepSeek:
        return deepseekKey || "";
    }
  };

  const isDisabled = () => {
    switch (type) {
      case API_PROVIDER.OpenAI:
        return !!apiKeys?.openai;
      case API_PROVIDER.Anthropic:
        return !!apiKeys?.anthropic;
      case API_PROVIDER.DeepSeek:
        return !!apiKeys?.deepseek;
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case API_PROVIDER.OpenAI:
        return "sk-1234";
      case API_PROVIDER.Anthropic:
        return "sk-ant-";
      case API_PROVIDER.DeepSeek:
        return "sk-ds-";
    }
  };

  const getProviderName = () => {
    switch (type) {
      case API_PROVIDER.OpenAI:
        return "OpenAI";
      case API_PROVIDER.Anthropic:
        return "Anthropic";
      case API_PROVIDER.DeepSeek:
        return "Deepseek";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex w-full max-w-sm items-start space-x-2">
        <div className="flex items-center min-w-[120px]">
          <img
            src={`${type}.png`}
            alt={`${getProviderName()} Logo`}
            className="h-6 w-6 mr-2"
          />
          <Label htmlFor="key" className="whitespace-nowrap">
            {getProviderName()}
          </Label>
        </div>
        <div className="flex-1">
          <Input
            id="key"
            type="password"
            placeholder={getPlaceholder()}
            className="w-full"
            value={getCurrentValue()}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isDisabled()}
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">Invalid API key</p>
          )}
        </div>
        <Button variant="outline" onClick={handleSetKey} type="button">
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};
