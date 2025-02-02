import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiProvider } from "@/lib/types/common";
import { useEffect, useState } from "react";
import { SecureKeyStorage } from "@/lib/utils/encryption";
import { useApiKeys } from "@/context/key-provider";
import { useModel } from "@/context/model-provider";
import { validateOpenAI, validateAnthropicKey } from "@/lib/api/validate-keys";
import { API_PROVIDER } from "@/lib/constants/constants";

interface InputWithButtonProps {
  type: ApiProvider;
}

export const InputWithButton = ({ type }: InputWithButtonProps) => {
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [anthropicKey, setAnthropicKey] = useState<string>("");
  const { apiKeys, fetchApiKeys } = useApiKeys();
  const { handleInitialAndRemoval } = useModel();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (apiKeys) {
      if (type === API_PROVIDER.OpenAI && apiKeys.openai) {
        setOpenAiKey(apiKeys.openai);
      } else if (type === API_PROVIDER.Anthropic && apiKeys.anthropic) {
        setAnthropicKey(apiKeys.anthropic);
      }
    }
  }, [apiKeys, type]);

  const getButtonText = () => {
    if (type === API_PROVIDER.OpenAI) {
      return apiKeys?.openai ? "Remove" : "Add";
    }
    return apiKeys?.anthropic ? "Remove" : "Add";
  };

  const handleInputChange = (value: string) => {
    setError("");
    if (type === API_PROVIDER.OpenAI) {
      setOpenAiKey(value);
    } else {
      setAnthropicKey(value);
    }
  };

  const handleSetKey = async () => {
    try {
      if (type === API_PROVIDER.OpenAI) {
        if (getButtonText() === "Remove") {
          await SecureKeyStorage.removeApiKey(API_PROVIDER.OpenAI);
          handleInitialAndRemoval()
          setOpenAiKey("");
        } else if (openAiKey) {
          const validated = await validateOpenAI(openAiKey);
          if (validated) {
            await SecureKeyStorage.saveApiKey(API_PROVIDER.OpenAI, openAiKey);
          } else {
            setError("Invalid API key");
            return;
          }
        }
      } else {
        if (getButtonText() === "Remove") {
          await SecureKeyStorage.removeApiKey(API_PROVIDER.Anthropic);
          handleInitialAndRemoval()
          setAnthropicKey("");
        } else if (anthropicKey) {
          const validated = await validateAnthropicKey(anthropicKey);
          if (validated) {
            await SecureKeyStorage.saveApiKey(
              API_PROVIDER.Anthropic,
              anthropicKey
            );
          }
        }
      }
      await fetchApiKeys();
      console.log(apiKeys);
    } catch (error) {
      console.error("Error managing API key:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex w-full max-w-sm items-start space-x-2">
        <div className="flex items-center min-w-[120px]">
          <img
            src={`${type}.png`}
            alt={`${type === API_PROVIDER.OpenAI ? "GPT" : "Claude"} Logo`}
            className="h-6 w-6 mr-2"
          />
          <Label htmlFor="key" className="whitespace-nowrap">
            {type === API_PROVIDER.OpenAI ? "OpenAI" : "Anthropic"}
          </Label>
        </div>
        <div className="flex-1">
          <Input
            id="key"
            type="password"
            placeholder={type === API_PROVIDER.OpenAI ? "sk-1234" : "sk-ant-"}
            className="w-full"
            value={
              type === API_PROVIDER.OpenAI
                ? openAiKey || ""
                : anthropicKey || ""
            }
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={
              type === API_PROVIDER.OpenAI
                ? !!apiKeys?.openai
                : !!apiKeys?.anthropic
            }
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
