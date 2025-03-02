import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSavedChats } from "@/lib/utils/utils";
import { SavedChat } from "@/lib/types/common";
import { Brain, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export const SavedChatDrawer = () => {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedChats, setExpandedChats] = useState<Record<number, boolean>>(
    {}
  );
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      handleSavedChats();
    }
  }, [isOpen]);

  const handleSavedChats = async () => {
    try {
      const result = await getSavedChats();
      setSavedChats(result.reverse());
      setExpandedChats({});
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (timestamp: number) => {
    try {
      const result = await chrome.storage.local.get("savedChats");
      const currentChats: SavedChat[] = result.savedChats || [];

      const updatedChats = currentChats.filter(
        (chat) => chat.timestamp !== timestamp
      );

      await chrome.storage.local.set({ savedChats: updatedChats });
      setSavedChats(updatedChats.reverse());

      toast({
        title: "Chat Deleted",
        description: "Summary has been deleted successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const toggleExpand = (timestamp: number) => {
    setExpandedChats((prev) => ({
      ...prev,
      [timestamp]: !prev[timestamp],
    }));
  };

  const truncateSummary = (summary: string, maxLength: number = 150) => {
    if (summary.length <= maxLength) return summary;
    return summary.slice(0, maxLength) + "...";
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Brain className="h-4 w-4" />
          View Saved Summaries
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex items-center justify-center">
          <DrawerHeader>
            <div className="flex flex-col justify-center items-center space-y-3">
              <DrawerTitle>Saved Summaries:</DrawerTitle>
              <DrawerDescription>
                A collection of your saved topics and summaries.
              </DrawerDescription>
            </div>
          </DrawerHeader>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {savedChats.length === 0 ? (
            <p className="text-center text-gray-500">No saved summaries yet.</p>
          ) : (
            <div className="space-y-4">
              {savedChats.map((chat) => (
                <div
                  key={chat.timestamp}
                  className="p-4 border rounded-lg shadow-sm relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => handleDelete(chat.timestamp)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium">Title: {chat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm">
                      <ReactMarkdown>
                        {expandedChats[chat.timestamp]
                          ? chat.summary
                          : truncateSummary(chat.summary)}
                      </ReactMarkdown>
                    </p>

                    {chat.summary.length > 150 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-8 text-blue-500 hover:text-blue-600"
                        onClick={() => toggleExpand(chat.timestamp)}
                      >
                        {expandedChats[chat.timestamp] ? (
                          <span className="flex items-center gap-1">
                            Show Less <ChevronUp className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            Show More <ChevronDown className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                  <a
                    href={chat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm mt-2 block"
                  >
                    View Original Page
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <div className="flex items-center justify-center mt-3">
              <Button variant="outline">Close</Button>
            </div>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
