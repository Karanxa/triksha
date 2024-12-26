import { Link } from "react-router-dom";
import { 
  Shield, 
  Database,
  List,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  useEffect(() => {
    const checkApiKeys = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      if (!profile?.api_keys) {
        toast.info(
          "Welcome to Triksha! To get started, please configure your API keys in the Settings.",
          {
            action: {
              label: "Configure Keys",
              onClick: () => window.location.href = "/settings"
            },
            duration: 8000
          }
        );
      }
    };

    checkApiKeys();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 [background-size:16px_16px] bg-dot-pattern opacity-20 pointer-events-none" />
      
      <div className="container mx-auto py-12 space-y-16 relative">
        {/* Hero Section */}
        <div className="relative">
          <div className="relative px-6 py-16 md:py-24 text-center space-y-8 max-w-4xl mx-auto glass-card rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
                <span className="text-foreground/90">Secure GenAI with </span>
                <span className="text-[#9b87f5]">Triksha</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Your end-to-end LLM security testing platform
            </p>
            <p className="text-sm text-muted-foreground">
              Developed by{" "}
              <a 
                href="https://twitter.com/itskaranxa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Karan Arora
              </a>
            </p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/llm-scanner" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <ToolCard
                icon={Shield}
                title="Security Scanner"
                description="Advanced threat detection for LLMs"
                className="h-full bg-white/5 backdrop-blur-sm border-white/10 text-left"
              />
            </Link>

            <Link to="/llm-results" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <ToolCard
                icon={List}
                title="Analysis Dashboard"
                description="Real-time security metrics and insights"
                className="h-full bg-white/5 backdrop-blur-sm border-white/10 text-left"
              />
            </Link>

            <Link to="/datasets" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <ToolCard
                icon={Database}
                title="Dataset Generation"
                description="Advanced adversarial testing datasets"
                className="h-full bg-white/5 backdrop-blur-sm border-white/10 text-left"
              />
            </Link>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="container max-w-6xl mx-auto space-y-8">
          <h2 className="text-2xl font-semibold text-center text-primary">
            Product Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in text-left" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="font-medium text-foreground">Advanced Contextual Analysis</h3>
              <p className="text-sm text-muted-foreground">Deep behavioral analysis for LLM security</p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in text-left" style={{ animationDelay: '0.5s' }}>
              <List className="w-8 h-8 text-primary" />
              <h3 className="font-medium text-foreground">Intelligent Dataset Generation</h3>
              <p className="text-sm text-muted-foreground">AI-powered adversarial dataset creation</p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in text-left" style={{ animationDelay: '0.6s' }}>
              <Database className="w-8 h-8 text-primary" />
              <h3 className="font-medium text-foreground">Automated Defense System</h3>
              <p className="text-sm text-muted-foreground">Real-time LLM vulnerability protection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;