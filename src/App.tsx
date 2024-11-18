import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import AuthGuard from "@/components/AuthGuard";
import { ScanNotification } from "@/components/llm-scanner/ScanNotification";
import Index from "@/pages/Index";
import LLMScanner from "@/pages/LLMScanner";
import LLMResults from "@/pages/LLMResults";
import Datasets from "@/pages/Datasets";
import AugmentPrompt from "@/pages/AugmentPrompt";
import FineTuning from "@/pages/FineTuning";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthGuard><Navigation /></AuthGuard>}>
                <Route path="/" element={<Index />} />
                <Route path="/llm-scanner" element={<LLMScanner />} />
                <Route path="/llm-results" element={<LLMResults />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/augment-prompt" element={<AugmentPrompt />} />
                <Route path="/fine-tuning" element={<FineTuning />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
            <ScanNotification />
            <Toaster />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;