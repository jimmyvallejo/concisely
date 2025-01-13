import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKeys, ApiType } from "@/types/common";

interface InputWithButtonProps {
  type: ApiType;
  apiKeys: ApiKeys | null;
}

export const InputWithButton = ({ type, apiKeys }: InputWithButtonProps) => {
  const getButtonText = () => {
    if (!apiKeys) return "Add";

    if (type === "gpt") {
      return apiKeys.openai ? "Edit" : "Add";
    }
    return apiKeys.anthropic ? "Edit" : "Add";
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
        placeholder={type === "gpt" ? "sk-1234" : "sk-ant-"}
        className="flex-1"
      />
      <Button variant="outline" type="submit">
        {getButtonText()}
      </Button>
    </div>
  );
};
