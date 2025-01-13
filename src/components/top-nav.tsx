import { ModeToggle } from "./mode-toggle";
import { APIDrawer } from "./api-drawer";

export const Nav = () => {
  return (
    <nav className="flex flex-row justify-between items-center w-full">
      <h1 className="font-bold">CONCISELY</h1>
      <div className="ml-3 flex flex-row items-center space-x-3">
        <ModeToggle />
        <APIDrawer isNav={true} />
      </div>
    </nav>
  );
};
