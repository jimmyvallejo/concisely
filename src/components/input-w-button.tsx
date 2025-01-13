import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiType } from "@/types/common";
import { useEffect, useState } from "react";
import { SecureKeyStorage } from "@/lib/encryption";
import { useApiKeys } from "@/context/key-provider";

interface InputWithButtonProps {
  type: ApiType;
}

export const InputWithButton = ({ type }: InputWithButtonProps) => {
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [anthropicKey, setAnthropicKey] = useState<string>("");
  const { apiKeys, fetchApiKeys } = useApiKeys();

  useEffect(() => {
    if (apiKeys) {
      if (type === "gpt" && apiKeys.openai) {
        setOpenAiKey(apiKeys.openai);
      } else if (type === "claude" && apiKeys.anthropic) {
        setAnthropicKey(apiKeys.anthropic);
      }
    }
  }, [apiKeys, type]);

  const getButtonText = () => {
    if (type === "gpt") {
      return apiKeys?.openai ? "Remove" : "Add";
    }
    return apiKeys?.anthropic ? "Remove" : "Add";
  };

  const handleInputChange = (value: string) => {
    if (type === "gpt") {
      setOpenAiKey(value);
    } else {
      setAnthropicKey(value);
    }
  };

  const handleSetKey = async () => {
    try {
      if (type === "gpt") {
        if (getButtonText() === "Remove") {
          await SecureKeyStorage.removeApiKey("openai");
          setOpenAiKey("");
        } else if (openAiKey) {
          await SecureKeyStorage.saveApiKey("openai", openAiKey);
        }
      } else {
        if (getButtonText() === "Remove") {
          await SecureKeyStorage.removeApiKey("anthropic");
          setAnthropicKey("");
        } else if (anthropicKey) {
          await SecureKeyStorage.saveApiKey("anthropic", anthropicKey);
        }
      }
      await fetchApiKeys();
    } catch (error) {
      console.error("Error managing API key:", error);
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <div className="flex items-center min-w-[120px]">
        <img
          src={`${type}.png`}
          alt={`${type === "gpt" ? "GPT" : "Claude"} Logo`}
          className="h-6 w-6 mr-2"
        />
        <Label htmlFor="key" className="whitespace-nowrap">
          {type === "gpt" ? "OpenAI" : "Anthropic"}
        </Label>
      </div>
      <Input
        id="key"
        type="password"
        placeholder={type === "gpt" ? "sk-1234" : "sk-ant-"}
        className="flex-1"
        value={type === "gpt" ? openAiKey || "" : anthropicKey || ""}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <Button variant="outline" onClick={handleSetKey} type="button">
        {getButtonText()}
      </Button>
    </div>
  );
};
