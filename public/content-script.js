const injectPdfLibrary = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      console.log("PDF.js already loaded");
      return resolve();
    }
    
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import * as pdfjsLib from '${chrome.runtime.getURL("pdf.min.mjs")}';
      // Set the global variable
      window.pdfjsLib = pdfjsLib;
      // Configure the worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '${chrome.runtime.getURL("pdf.worker.min.mjs")}';
      console.log("PDF.js module loaded with version:", pdfjsLib.version);
    `;
    
    script.onerror = (e) => {
      console.error("Error loading PDF.js module:", e);
      reject(new Error("Failed to load PDF.js module"));
    };
    
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (window.pdfjsLib) {
        console.log("PDF.js successfully loaded and verified");
        resolve();
      } else {
        console.error("PDF.js was not properly initialized");
        reject(new Error("PDF.js was not properly initialized"));
      }
    }, 1000);
  });
};

const detectContentType = () => {
  if (window.location.href.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }

  const contentType = document.contentType;
  if (contentType === "application/pdf") {
    return "pdf";
  }

  if (
    document.querySelector('embed[type="application/pdf"]') ||
    document.querySelector('object[type="application/pdf"]')
  ) {
    return "pdf";
  }

  return "webpage";
};

const scrapePageText = async () => {
  return {
    title: document.title,
    headers: Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).map((header) => ({
      type: header.tagName.toLowerCase(),
      text: header.textContent?.trim(),
    })),
    paragraphs: Array.from(document.querySelectorAll("p"))
      .map((p) => p.textContent?.trim())
      .filter((text) => text && text.length > 0),
    links: Array.from(document.querySelectorAll("a"))
      .map((link) => ({
        text: link.textContent?.trim(),
        href: link.href,
      }))
      .filter((link) => link.text && link.text.length > 0),
    metaDescription:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") || null,
    mainContent: document.querySelector("main")?.textContent?.trim() || null,
  };
};

const parsePDF = async (url) => {
  try {
    console.log("Starting PDF parsing for:", url);

    if (typeof window.pdfjsLib === "undefined") {
      console.log("PDF.js not found, injecting library...");
      await injectPdfLibrary();
      console.log("Library injection complete. Checking if pdfjsLib is available...");

      if (typeof window.pdfjsLib === "undefined") {
        throw new Error("PDF.js library failed to initialize properly");
      }
      console.log("PDF.js library successfully loaded");
    }

    console.log("Using PDF.js version:", window.pdfjsLib.version);

    let pdfData;
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      pdfData = url;
    } else {
      console.log("Fetching PDF data from URL:", url);
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include', 
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        pdfData = new Uint8Array(arrayBuffer);
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        
        console.log("Attempting direct PDF loading as fallback");
        pdfData = url;
      }
    }

    console.log("Creating PDF loading task");
    const loadingTask = window.pdfjsLib.getDocument({
      data: pdfData,
      cMapUrl: chrome.runtime.getURL('cmaps/'),
      cMapPacked: true,
      disableFontFace: true 
    });
    
    console.log("Loading task created, waiting for promise...");

    loadingTask.onProgress = (progressData) => {
      if (progressData.total) {
        console.log("Loading progress:", Math.round((progressData.loaded / progressData.total) * 100) + "%");
      } else {
        console.log("Loading progress:", progressData.loaded);
      }
    };

    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully with", pdf.numPages, "pages");

    let fullText = "";
    let title = document.title || "PDF Document";
    
    try {
      const metadata = await pdf.getMetadata();
      if (metadata && metadata.info && metadata.info.Title) {
        title = metadata.info.Title;
      }
      console.log("PDF Metadata:", metadata);
    } catch (metadataErr) {
      console.log("Could not extract metadata:", metadataErr);
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log("Processing page", i, "of", pdf.numPages);
      
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });

        if (!textContent || !textContent.items || textContent.items.length === 0) {
          console.log("No text content found on page", i);
          fullText += `[Page ${i} - No extractable text]\n\n`;
          continue;
        }

        console.log(`Page ${i} has ${textContent.items.length} text items`);
        
        const pageText = extractStructuredText(textContent.items);
        fullText += pageText + "\n\n";
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        fullText += `[Error extracting text from page ${i}]\n\n`;
      }
    }

    return {
      title: title,
      content: fullText,
      numPages: pdf.numPages,
    };
  } catch (error) {
    console.error("Detailed PDF parsing error:", error);
    console.error("Error stack:", error.stack);
    
    if (error.name === "MissingPDFException") {
      throw new Error("The specified PDF could not be found");
    } else if (error.name === "InvalidPDFException") {
      throw new Error("Invalid or corrupted PDF file");
    } else if (error.name === "PasswordException") {
      throw new Error("PDF is password protected");
    } else if (error.name === "UnexpectedResponseException") {
      throw new Error("Unexpected server response while retrieving PDF");
    } else {
      throw new Error(`Failed to parse PDF: ${error.message || "Unknown error"}`);
    }
  }
};

function extractStructuredText(textItems) {
  if (!textItems || textItems.length === 0) return "";
  
  const sortedItems = [...textItems].sort((a, b) => {
    const aY = a.transform ? a.transform[5] : (a.y || 0);
    const bY = b.transform ? b.transform[5] : (b.y || 0);
    
    if (Math.abs(aY - bY) < 5) {
      const aX = a.transform ? a.transform[4] : (a.x || 0);
      const bX = b.transform ? b.transform[4] : (b.x || 0);
      return aX - bX;
    }
    
    return bY - aY;
  });
  
  const lines = [];
  let currentLine = [];
  let currentY = null;
  
  sortedItems.forEach(item => {
    const y = item.transform ? item.transform[5] : (item.y || 0);
    
    if (currentY === null || Math.abs(y - currentY) > 5) {
      if (currentLine.length > 0) {
        currentLine.sort((a, b) => {
          const aX = a.transform ? a.transform[4] : (a.x || 0);
          const bX = b.transform ? b.transform[4] : (b.x || 0);
          return aX - bX;
        });
        
        lines.push(currentLine);
      }
      currentLine = [item];
      currentY = y;
    } else {
      currentLine.push(item);
    }
  });
  
  if (currentLine.length > 0) {
    currentLine.sort((a, b) => {
      const aX = a.transform ? a.transform[4] : (a.x || 0);
      const bX = b.transform ? b.transform[4] : (b.x || 0);
      return aX - bX;
    });
    lines.push(currentLine);
  }
  
  return lines.map(line => {
    let lineText = "";
    let lastEndX = 0;
    
    line.forEach(item => {
      if (!item.str) return;
      
      const x = item.transform ? item.transform[4] : (item.x || 0);
      
      if (lastEndX > 0 && x - lastEndX > 10) {
        lineText += " ";
      }
      
      lineText += item.str;
      
      const itemWidth = item.width || (item.str.length * 5); // Estimate width if not provided
      lastEndX = x + itemWidth;
    });
    
    return lineText;
  }).join('\n');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.action === "scrapeText") {
    const contentType = detectContentType();
    console.log("Detected content type:", contentType);

    if (contentType === "webpage") {
      (async () => {
        try {
          const data = await scrapePageText();
          console.log("Scraped webpage data:", data);
          sendResponse({ success: true, data, type: "web" });
        } catch (error) {
          console.error("Scraping error:", error);
          sendResponse({ success: false, error: error.message });
        }
      })();
    } else if (contentType === "pdf") {
      (async () => {
        try {
          const pdfUrl = window.location.href;
          console.log("Starting PDF scraping for URL:", pdfUrl);
          const data = await parsePDF(pdfUrl);
          console.log("Scraped PDF data:", data);
          sendResponse({ success: true, data, type: "pdf" });
        } catch (error) {
          console.error("PDF parsing error:", error);
          sendResponse({ 
            success: false, 
            error: error.message, 
            type: "pdf",
            details: {
              url: window.location.href,
              errorName: error.name,
              errorMessage: error.message,
              errorStack: error.stack
            }
          });
        }
      })();
    } else {
      sendResponse({ 
        success: false, 
        error: "Unsupported content type", 
        details: { detectedType: contentType } 
      });
    }

    return true; 
  }

  return true;
});