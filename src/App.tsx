import { useState } from "react";

interface ScrapedData {
  title: string;
  headers: Array<{ type: string; text: string }>;
  paragraphs: string[];
  links: Array<{ text: string; href: string }>;
  metaDescription: string | null;
  mainContent: string | null;
}

function App() {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);

  const handleScrape = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) return;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-script.js']
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      chrome.tabs.sendMessage(tab.id, { action: "scrapeText" }, (response) => {
        if (response && response.success) {
          setScrapedData(response.data);
        } else {
          console.error("Failed to scrape:", response?.error);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <button 
        onClick={handleScrape}
        className="bg-blue-500 text-white px-4 py-2 rounded flex"
      >
        Scrape Page
      </button>

      {scrapedData && (
        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-bold">{scrapedData.title}</h1>
          
          {scrapedData.metaDescription && (
            <div>
              <h2 className="text-xl font-semibold">Meta Description</h2>
              <p>{scrapedData.metaDescription}</p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">Headers</h2>
            {scrapedData.headers.map((header, index) => (
              <div key={index} className="ml-4">
                <strong>{header.type}:</strong> {header.text}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Links</h2>
            {scrapedData.links.map((link, index) => (
              <div key={index} className="ml-4">
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  {link.text}
                </a>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Paragraphs</h2>
            {scrapedData.paragraphs.map((paragraph, index) => (
              <p key={index} className="ml-4 mt-2">{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;