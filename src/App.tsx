import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import Scrape from "./app/scrape/page";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex flex-row justify-center items-center w-full">
  
          <h1>CONCISELY</h1>
          <div className="ml-3">
            <ModeToggle />
          </div>
        </div>
          <Scrape />
      </ThemeProvider>
    </>
  );
}
export default App;
