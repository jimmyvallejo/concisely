import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APIDrawer } from "@/components/api-drawer";
import { ProviderDropdown } from "@/components/provider-dropdown";
import { useApiKeys } from "@/context/key-provider";
import { useModel } from "@/context/model-provider";
import { API_PROVIDER, BASE_URL } from "@/lib/constants/constants";
import ReactMarkdown from "react-markdown";
import { CircleX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";
import { SavedChat } from "@/lib/types/common";
import { SavedChatDrawer } from "@/components/saved-chat-drawer";

interface ScrapedData {
  title: string;
  headers: Array<{ type: string; text: string }>;
  paragraphs: string[];
  links: Array<{ text: string; href: string }>;
  metaDescription: string | null;
  mainContent: string | null;
  apiKey: string | null;
  model: string | null;
}

const Main = () => {
  const { apiKeys } = useApiKeys();
  const { currentModel } = useModel();
  const [streamResponse, setStreamResponse] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStreamError, setHasStreamError] = useState(false);

  const { toast } = useToast();

  const prepareRequestData = (data: ScrapedData): ScrapedData => {
    const enrichedData = { ...data };

    if (apiKeys.openai && currentModel?.provider === API_PROVIDER.OpenAI) {
      enrichedData.apiKey = apiKeys.openai;
    } else if (
      apiKeys.anthropic &&
      currentModel?.provider === API_PROVIDER.Anthropic
    ) {
      enrichedData.apiKey = apiKeys.anthropic;
    } else {
      throw new Error("Invalid API key");
    }

    enrichedData.model = currentModel?.id;
    return enrichedData;
  };

  const fetchStream = async (data: ScrapedData): Promise<Response> => {
    const endpoint =
      currentModel?.provider === "openai"
        ? `${BASE_URL}/gpt-stream`
        : `${BASE_URL}/anthropic-stream`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body!");
    }

    return response;
  };

  const processStreamResponse = async (response: Response): Promise<void> => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setIsLoading(false);
        const chunk = decoder.decode(value);
        setStreamResponse((prev) => [...prev, chunk]);
      }
      setHasStreamError(false);
    } finally {
      reader.releaseLock();
    }
  };

  const handleStreamError = (error: unknown): void => {
    console.error("Error:", error);
    setIsLoading(false);
    setHasStreamError(true);
    setStreamResponse((prev) => [...prev, "Error: Stream failed"]);
  };

  const handleStream = async (data: ScrapedData): Promise<void> => {
    setStreamResponse([]);
    setHasStreamError(false);

    try {
      const enrichedData = prepareRequestData(data);
      const response = await fetchStream(enrichedData);
      await processStreamResponse(response);
    } catch (error) {
      handleStreamError(error);
    }
  };

  const handleScrape = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) return;

      setCurrentUrl(tab.url || "");
      setCurrentTitle(tab.title || "");

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["/content-script.js"],
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      chrome.tabs.sendMessage(tab.id, { action: "scrapeText" }, (response) => {
        if (response && response.success) {
          console.log("Data", response.data);
          handleStream(response.data);
        } else {
          console.error("Failed to scrape:", response?.error);
          setHasStreamError(true);
        }
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setHasStreamError(true);
    }
  };

  const handleSaveChat = async () => {
    const newChat: SavedChat = {
      url: currentUrl,
      title: currentTitle || currentUrl,
      summary: streamResponse.join(""),
      timestamp: Date.now(),
    };

    try {
      const result = await chrome.storage.local.get("savedChats");
      const savedChats: SavedChat[] = result.savedChats || [];

      const updatedChats = [...savedChats, newChat];

      await chrome.storage.local.set({ savedChats: updatedChats });

      toast({
        title: "Chat Saved",
        description: "Your summary has been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving chat:", error);
      toast({
        title: "Error",
        description: "Failed to save chat. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="w-full flex items-center justify-center p-4 pb-20">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">One Click Summary</h1>

          {apiKeys.openai || apiKeys.anthropic ? (
            <div className="flex gap-2 flex-col">
              <Button
                onClick={handleScrape}
                disabled={isLoading}
                className="w-48"
              >
                {isLoading ? "Summarizing..." : "Summarize Tab"}
              </Button>
              <ProviderDropdown />
            </div>
          ) : (
            <div className="flex gap-4">
              <APIDrawer />
            </div>
          )}
          {streamResponse.length > 0 && (
            <div className="mt-6 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">AI Summary</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStreamResponse([]);
                    setHasStreamError(false);
                  }}
                >
                  <CircleX />
                </Button>
              </div>
              <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown>{streamResponse.join("")}</ReactMarkdown>
              </div>
              <div className="flex justify-center items-center gap-4 mt-4">
                {!hasStreamError && (
                  <Button size="sm" onClick={handleSaveChat}>
                    <Brain className="mr-1 h-4 w-4" />
                    Save Summary
                  </Button>
                )}
                {streamResponse.length > 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Scroll to Top
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SavedChatDrawer />
      </div>
    </div>
  );
};

export default Main;
