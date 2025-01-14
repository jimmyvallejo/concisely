import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiKeys } from "@/context/key-provider";
import { CHAT_MODELS } from "@/lib/constants/constants";
import { useModel } from "@/context/model-provider";

export const ProviderDropdown = () => {
  const { apiKeys } = useApiKeys();
  const { currentModel, setCurrentModel } = useModel();

  const handleModelChange = (modelId: string) => {
    const selectedModel = Object.values(CHAT_MODELS).find(
      (model) => model.id === modelId
    );
    if (selectedModel) {
      setCurrentModel(selectedModel);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{currentModel?.displayName}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Available Models:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentModel?.id}
          onValueChange={handleModelChange}
        >
          {apiKeys.openai && (
            <DropdownMenuRadioItem value={CHAT_MODELS.Mini.id}>
              {CHAT_MODELS.Mini.displayName}
            </DropdownMenuRadioItem>
          )}
          {apiKeys.anthropic && (
            <DropdownMenuRadioItem value={CHAT_MODELS.Sonnet.id}>
              {CHAT_MODELS.Sonnet.displayName}
            </DropdownMenuRadioItem>
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
