import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";

// Page imports
import Index from "./pages/Index";
import LLMScanner from "./pages/LLMScanner";
import LLMResults from "./pages/LLMResults";
import Datasets from "./pages/Datasets";
import AugmentPrompt from "./pages/AugmentPrompt";
import FineTuning from "./pages/FineTuning";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthGuard from "./components/AuthGuard";
import Navigation from "./components/Navigation";

// Create protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <>
      <Navigation />
      {children}
    </>
  </AuthGuard>
);

// Initialize QueryClient outside of component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Set dark mode before rendering
if (typeof window !== 'undefined') {
  document.documentElement.classList.add("dark");
}

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/llm-scanner" element={<ProtectedRoute><LLMScanner /></ProtectedRoute>} />
                <Route path="/llm-results" element={<ProtectedRoute><LLMResults /></ProtectedRoute>} />
                <Route path="/datasets" element={<ProtectedRoute><Datasets /></ProtectedRoute>} />
                <Route path="/augment-prompt" element={<ProtectedRoute><AugmentPrompt /></ProtectedRoute>} />
                <Route path="/fine-tuning" element={<ProtectedRoute><FineTuning /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;