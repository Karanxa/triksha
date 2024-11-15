import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import LLMScanner from "./pages/LLMScanner";
import LLMResults from "./pages/LLMResults";
import Datasets from "./pages/Datasets";
import AugmentPrompt from "./pages/AugmentPrompt";
import FineTuning from "./pages/FineTuning";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthGuard from "./components/AuthGuard";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <>
                        <Navigation />
                        <Index />
                      </>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/llm-scanner"
                  element={
                    <AuthGuard>
                      <>
                        <Navigation />
                        <LLMScanner />
                      </>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/llm-results"
                  element={
                    <AuthGuard>
                      <>
                        <Navigation />
                        <LLMResults />
                      </>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/datasets"
                  element={
                    <AuthGuard>
                      <>
                        <Navigation />
                        <Datasets />
                      </>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/augment-prompt"
                  element={
                    <AuthGuard>
                      <>
                        <Navigation />
                        <AugmentPrompt />
                      </>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/fine-tuning"
                  element={
                    <AuthGuard>
                      <>
                        <Navigation />
                        <FineTuning />
                      </>
                    </AuthGuard>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;