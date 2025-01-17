import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APIDrawer } from "@/components/api-drawer";
import { ProviderDropdown } from "@/components/provider-dropdown";
import { useApiKeys } from "@/context/key-provider";
import { useModel } from "@/context/model-provider";
import { API_PROVIDER } from "@/lib/constants/constants";

interface ScrapedData {
  title: string;
  headers: Array<{ type: string; text: string }>;
  paragraphs: string[];
  links: Array<{ text: string; href: string }>;
  metaDescription: string | null;
  mainContent: string | null;
  ApiKey: string | null;
}

const Main = () => {
  const { apiKeys } = useApiKeys();
  const { currentModel } = useModel();
  const [streamResponse, setStreamResponse] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) return;

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
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleStream = async (data: ScrapedData): Promise<void> => {
    try {
      setStreamResponse([]);

      if (apiKeys.openai && currentModel?.provider === API_PROVIDER.OpenAI) {
        data.ApiKey = apiKeys.openai;
      } else {
        throw new Error("Invalid API key")
      }

      const response = await fetch("http://localhost:8080/gpt-stream", {
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          setStreamResponse((prev) => [...prev, chunk]);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Error:", error);
      setStreamResponse((prev) => [...prev, "Error: Stream failed"]);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">One Click Summary</h1>

        {apiKeys.openai ? (
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
          <div className="mt-6 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">AI Summary</h2>
            <div className="prose dark:prose-invert max-w-none">
              {streamResponse.map((chunk, index) => (
                <span key={index}>{chunk}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
