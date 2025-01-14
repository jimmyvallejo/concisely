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
  const [error, setError] = useState<string>("");

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
    setError("");
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
          const data = {
            apiKey: openAiKey,
          };

          const response = await fetch("http://localhost:8080/gpt-validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          console.log(response);
          if (response.status === 200) {
            await SecureKeyStorage.saveApiKey("openai", openAiKey);
          } else {
            setError("Invalid API key");
            return;
          }
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
    <div className="space-y-2">
      <div className="flex w-full max-w-sm items-start space-x-2">
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
        <div className="flex-1">
          <Input
            id="key"
            type="password"
            placeholder={type === "gpt" ? "sk-1234" : "sk-ant-"}
            className="w-full"
            value={type === "gpt" ? openAiKey || "" : anthropicKey || ""}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={type === "gpt" ? !!apiKeys?.openai : !!apiKeys?.anthropic}
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
