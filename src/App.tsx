import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import AuthGuard from "@/components/AuthGuard";
import { ScanNotification } from "@/components/llm-scanner/ScanNotification";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthGuard>
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4">
              <Navigation />
              <ScanNotification />
              <Toaster />
            </div>
          </div>
        </AuthGuard>
      </Router>
    </ThemeProvider>
  );
}

export default App;