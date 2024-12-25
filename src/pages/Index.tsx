import { Link } from "react-router-dom";
import { 
  Shield, 
  Database,
  List,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background dot pattern - increased size and opacity */}
      <div className="absolute inset-0 [background-size:16px_16px] bg-dot-pattern opacity-20 pointer-events-none" />
      
      <div className="container mx-auto py-12 space-y-16 relative">
        {/* Hero Section */}
        <div className="relative">
          <div className="relative px-6 py-24 md:py-32 text-center space-y-8 max-w-4xl mx-auto glass-card rounded-xl">
            <h1 className="text-4xl sm:text-6xl font-bold animate-fade-in">
              <span className="text-foreground/80">Secure AI Models with </span>
              <span className="text-primary">Triksha</span>
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto animate-fade-in">
              Your LLM red teaming platform
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
              description="Run static and contextual scans to detect vulnerabilities in your LLMs"
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

          <Link to="/datasets" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ToolCard
              icon={Database}
              title="Dataset Generation"
              description="Create adversarial datasets to test LLM boundaries"
              className="h-full bg-white/30 backdrop-blur-sm border-white/20"
            />
          </Link>
        </div>

        {/* Roadmap Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center text-foreground">🛠️ Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Contextual Scans</h3>
              <p className="text-sm text-foreground/60 text-center">
                Fine-tuned LLM specifically designed for precise red-teaming of target models
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <List className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Enhanced Datasets</h3>
              <p className="text-sm text-foreground/60 text-center">
                Advanced adversarial dataset generation to push LLMs to their limits
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Database className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Automated Defense</h3>
              <p className="text-sm text-foreground/60 text-center">
                AI-powered protection against emerging LLM threats
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;