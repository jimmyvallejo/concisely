const scrapePageText =() => {
  return {
    title: document.title,
    headers: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(header => ({
      type: header.tagName.toLowerCase(),
      text: header.textContent?.trim()
    })),
    paragraphs: Array.from(document.querySelectorAll('p')).map(p => 
      p.textContent?.trim()
    ).filter(text => text && text.length > 0), 
    links: Array.from(document.querySelectorAll('a')).map(link => ({
      text: link.textContent?.trim(),
      href: link.href
    })).filter(link => link.text && link.text.length > 0), 
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    mainContent: document.querySelector('main')?.textContent?.trim() || null
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.action === "scrapeText") {
    try {
      const data = scrapePageText();
      console.log("Scraped data:", data);
      sendResponse({ success: true, data });
    } catch (error) {
      console.error("Scraping error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});