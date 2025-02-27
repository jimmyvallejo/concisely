import { ThemeProvider } from "./components/theme-provider";
import { ApiKeysProvider } from "./context/key-provider";
import { ModelProvider } from "./context/model-provider";
import Main from "./app/main/page";
import { Nav } from "./components/top-nav";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <ApiKeysProvider>
        <ModelProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Nav />
            <Main />
            <Toaster />
          </ThemeProvider>
        </ModelProvider>
      </ApiKeysProvider>
    </>
  );
}

export default App;
