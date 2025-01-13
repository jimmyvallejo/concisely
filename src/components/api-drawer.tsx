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
import { ApiKeys } from "@/types/common";

interface APIDrawerProps {
  apiKeys: ApiKeys;
}

export const APIDrawer = ({ apiKeys }: APIDrawerProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Add API Key</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex items-center justify-center">
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
        </div>
        <div className="flex items-center justify-center">
          <DrawerFooter>
            <InputWithButton apiKeys={apiKeys} type="gpt" />
            <InputWithButton apiKeys={apiKeys} type="claude" />
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
