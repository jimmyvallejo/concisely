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