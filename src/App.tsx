import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SetupChecker } from '@/components/SetupChecker';
import AuthGuard from './components/AuthGuard';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SetupChecker>
          <ErrorBoundary>
            <AuthGuard>
              <Navigation />
            </AuthGuard>
          </ErrorBoundary>
          <Toaster />
        </SetupChecker>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
