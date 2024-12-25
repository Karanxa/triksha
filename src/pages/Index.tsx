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
            <h1 className="text-4xl sm:text-6xl font-bold animate-fade-in" style={{
              background: 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(155, 135, 245, 0.2)',
              transform: 'perspective(1000px) rotateX(5deg)',
              transition: 'transform 0.3s ease'
            }}>
              Secure AI Models with <span className="relative inline-block" style={{
                transform: 'translateZ(50px)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}>Triksha</span>
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
              <Search className="w-8 h-8 text-primary mx-auto" />
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