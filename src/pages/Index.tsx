import { Link } from "react-router-dom";
import { 
  Shield, 
  Database,
  List,
  ArrowRight,
  History
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
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
      {/* Background dot pattern */}
      <div className="absolute inset-0 [background-size:16px_16px] bg-dot-pattern opacity-20 pointer-events-none" />
      
      <div className="container mx-auto py-12 space-y-16 relative">
        {/* Hero Section */}
        <div className="relative">
          <div className="relative px-6 py-16 md:py-24 text-center space-y-8 max-w-4xl mx-auto glass-card rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
                <span className="text-foreground/90">Secure GenAI with </span>
                <span className="text-[#9b87f5]">Triksha</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed">
              Your end to end LLM red teaming platform
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/llm-results" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <History className="w-5 h-5" />
                <span>View Scan History</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/llm-scanner" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <ToolCard
              icon={Shield}
              title="Security Scanner"
              description="Run comprehensive static and contextual scans to detect vulnerabilities in your LLMs"
              className="h-full bg-white/5 backdrop-blur-sm border-white/10"
            />
          </Link>

          <Link to="/llm-results" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ToolCard
              icon={List}
              title="Analysis Dashboard"
              description="Track, analyze, and visualize security metrics with detailed insights and reporting"
              className="h-full bg-white/5 backdrop-blur-sm border-white/10"
            />
          </Link>

          <Link to="/datasets" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ToolCard
              icon={Database}
              title="Dataset Generation"
              description="Generate and manage adversarial datasets to thoroughly test LLM boundaries"
              className="h-full bg-white/5 backdrop-blur-sm border-white/10"
            />
          </Link>
        </div>

        {/* Roadmap Section */}
        <div className="space-y-8 pt-8">
          <h2 className="text-2xl font-semibold text-center text-primary">
            Product Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Advanced Contextual Analysis</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Enhanced LLM security assessment with deep contextual understanding and behavioral analysis
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <List className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Intelligent Dataset Generation</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                AI-powered creation of sophisticated adversarial datasets for comprehensive security testing
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Database className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-medium text-center text-foreground">Automated Defense System</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Real-time protection and automated response system against emerging LLM vulnerabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;