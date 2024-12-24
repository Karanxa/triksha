import { Link } from "react-router-dom";
import { 
  Shield, 
  Search,
  List,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0D1117] relative">
      {/* Background dot pattern */}
      <div className="absolute inset-0 [background-size:24px_24px] bg-dot-pattern opacity-25 pointer-events-none" />
      
      <div className="container mx-auto py-12 space-y-16 relative">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-hero-gradient rounded-3xl" />
          <div className="relative px-6 py-20 text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-fade-in">
              Welcome to Triksha
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in">
              Your comprehensive platform for LLM security testing and enhancement
            </p>
            <div className="flex justify-center animate-fade-in">
              <Link to="/llm-scanner">
                <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 text-lg font-medium">
                  Get Started
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
              title="LLM Scanner"
              description="Test your models against common security vulnerabilities"
              className="h-full bg-white/5 backdrop-blur-sm border-white/10"
            />
          </Link>

          <Link to="/llm-results" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ToolCard
              icon={List}
              title="Scan Results"
              description="View and analyze detailed security scan results"
              className="h-full bg-white/5 backdrop-blur-sm border-white/10"
            />
          </Link>

          <Link to="/llm-scanner?tab=contextual" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ToolCard
              icon={Search}
              title="Contextual Analysis"
              description="Deep dive into model behavior with contextual testing"
              className="h-full bg-white/5 backdrop-blur-sm border-white/10"
            />
          </Link>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center text-white">Why Choose Triksha?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-white">Comprehensive Testing</h3>
              <p className="text-sm text-white/60 text-center">
                Test your LLMs against a wide range of security vulnerabilities
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <List className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-white">Detailed Results</h3>
              <p className="text-sm text-white/60 text-center">
                Get in-depth analysis of scan results and vulnerabilities
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Search className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-white">Contextual Analysis</h3>
              <p className="text-sm text-white/60 text-center">
                Understand model behavior through contextual testing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;