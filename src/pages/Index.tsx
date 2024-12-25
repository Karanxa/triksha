import { Link } from "react-router-dom";
import { 
  Shield, 
  Search,
  List,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background dot pattern */}
      <div className="absolute inset-0 [background-size:24px_24px] bg-dot-pattern opacity-10 pointer-events-none" />
      
      <div className="container mx-auto py-12 space-y-16 relative">
        {/* Hero Section */}
        <div className="relative">
          <div className="relative px-6 py-20 text-center space-y-6 max-w-4xl mx-auto glass-card">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent animate-fade-in">
              Secure Your AI Models with Triksha
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto animate-fade-in">
              Bulletproof security testing for your LLMs
            </p>
            <div className="flex justify-center animate-fade-in">
              <Link to="/llm-scanner">
                <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 text-lg font-medium">
                  Start Scanning
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/llm-scanner" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <ToolCard
              icon={Shield}
              title="Security Scanner"
              description="Detect and prevent vulnerabilities in your LLMs"
              className="h-full bg-white/30 backdrop-blur-sm border-white/20"
            />
          </Link>

          <Link to="/llm-results" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ToolCard
              icon={List}
              title="Analysis Dashboard"
              description="Track and visualize security metrics in real-time"
              className="h-full bg-white/30 backdrop-blur-sm border-white/20"
            />
          </Link>

          <Link to="/llm-scanner?tab=contextual" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ToolCard
              icon={Search}
              title="Contextual Analysis"
              description="Smart threat detection powered by behavioral analysis"
              className="h-full bg-white/30 backdrop-blur-sm border-white/20"
            />
          </Link>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center text-foreground">Why Choose Triksha?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Enterprise-Grade Security</h3>
              <p className="text-sm text-foreground/60 text-center">
                Military-grade protection for your AI models
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <List className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Actionable Insights</h3>
              <p className="text-sm text-foreground/60 text-center">
                Crystal-clear security metrics at your fingertips
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Search className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Smart Detection</h3>
              <p className="text-sm text-foreground/60 text-center">
                AI-powered threat detection that never sleeps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;