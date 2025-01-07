import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ScrapedData {
  title: string;
  headers: Array<{ type: string; text: string }>;
  paragraphs: string[];
  links: Array<{ text: string; href: string }>;
  metaDescription: string | null;
  mainContent: string | null;
}

const Scrape = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async () => {
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
          setScrapedData(response.data);
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

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Web Scraper</h1>
        <Button onClick={handleScrape} disabled={isLoading} className="w-48">
          {isLoading ? "Scraping..." : "Scrape Page"}
        </Button>

        {scrapedData && (
          <div className="mt-6 w-full space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold border-b pb-2">
              {scrapedData.title}
            </h2>

            {scrapedData.metaDescription && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Meta Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {scrapedData.metaDescription}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Headers</h3>
              <ul className="space-y-1">
                {scrapedData.headers.map((header, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{header.type}:</span>{" "}
                    {header.text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Links</h3>
              <ul className="space-y-1">
                {scrapedData.links.map((link, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Paragraphs</h3>
              {scrapedData.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400 mt-2"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scrape;
