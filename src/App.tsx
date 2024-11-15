import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LLMScanner from "./pages/LLMScanner";
import LLMResults from "./pages/LLMResults";
import Datasets from "./pages/Datasets";
import AugmentPrompt from "./pages/AugmentPrompt";
import FineTuning from "./pages/FineTuning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/llm-scanner" element={<LLMScanner />} />
          <Route path="/llm-results" element={<LLMResults />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/augment-prompt" element={<AugmentPrompt />} />
          <Route path="/fine-tuning" element={<FineTuning />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;