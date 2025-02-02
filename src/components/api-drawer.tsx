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
import { InputWithButton } from "./input-w-button";
import { API_PROVIDER } from "@/lib/constants/constants";

interface APIDrawerProps {
  isNav?: boolean;
}

export const APIDrawer = ({ isNav = false }: APIDrawerProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {!isNav ? (
          <Button>Add API Key</Button>
        ) : (
          <img
            src="settings.png"
            alt="Settings"
            className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity"
          />
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex items-center justify-center">
          <DrawerHeader>
            <div className="flex flex-col justify-center items-center space-y-3">
              <DrawerTitle>Add/Remove API Keys</DrawerTitle>
              <DrawerDescription>
                API keys are securely stored with encryption in chrome storage.
              </DrawerDescription>
            </div>
          </DrawerHeader>
        </div>
        <div className="flex items-center justify-center">
          <DrawerFooter>
            <InputWithButton type={API_PROVIDER.OpenAI} />
            <InputWithButton type={API_PROVIDER.Anthropic} />
            <DrawerClose asChild>
              <div className="flex items-center justify-center mt-3">
                <Button variant="outline">Cancel</Button>
              </div>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
