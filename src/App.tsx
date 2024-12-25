import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import AuthGuard from "@/components/AuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ErrorBoundary>
          <div className="min-h-screen">
            <AuthGuard>
              <Navigation />
              <OnboardingTutorial />
              <Toaster />
            </AuthGuard>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;