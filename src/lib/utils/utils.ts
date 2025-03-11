import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SavedChat } from "../types/common"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getSavedChats = async (): Promise<SavedChat[]> => {
  try {
    const result = await chrome.storage.local.get("savedChats");
    return result.savedChats || [];
  } catch (error) {
    console.error("Error retrieving saved chats:", error);
    return [];
  }
};

export const getIsWebPDF = async (): Promise<boolean> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.url){
    return false
  }
  return isWebPdfUrl(tab.url)
}


export const isWebPdfUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  const isPdf = url.toLowerCase().endsWith('.pdf');
  
  const isWebUrl = url.startsWith('http://') || url.startsWith('https://');
  
  const isPdfViewer = 
    (url.includes('viewer.html') && url.includes('pdf=')) ||
    url.includes('pdfjs/web/viewer.html') ||
    (url.includes('drive.google.com') && url.includes('viewerng/viewer'));
  
  return isWebUrl && (isPdf || isPdfViewer);
};