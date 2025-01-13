import { ThemeProvider } from "./components/theme-provider";
import { ApiKeysProvider } from "./context/key-provider";
import Main from "./app/main/page";
import { Nav } from "./components/top-nav";

function App() {
  return (
    <>
      <ApiKeysProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Nav />
          <Main />
        </ThemeProvider>
      </ApiKeysProvider>
    </>
  );
}
export default App;
