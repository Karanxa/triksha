import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Database, 
  Bot, 
  Brain,
  Settings,
  ArrowRight
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with improved gradient */}
      <div className="container mx-auto py-16 lg:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-3xl opacity-50" />
        <div className="relative px-6 py-12 sm:py-20 text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              Welcome to Geraid
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your comprehensive platform for LLM security testing and enhancement
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/llm-scanner">
              <Button size="lg" className="w-full sm:w-auto group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/datasets">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Datasets
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Features Grid with enhanced cards */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link to="/llm-scanner">
            <ToolCard
              icon={Shield}
              title="LLM Scanner"
              description="Test your models against common security vulnerabilities"
              className="h-full hover:scale-[1.02] transition-transform"
            />
          </Link>

          <Link to="/datasets">
            <ToolCard
              icon={Database}
              title="Datasets"
              description="Manage and create datasets for testing and fine-tuning"
              className="h-full hover:scale-[1.02] transition-transform"
            />
          </Link>

          <Link to="/augment-prompt">
            <ToolCard
              icon={Zap}
              title="Prompt Augmentation"
              description="Enhance your prompts with security-focused improvements"
              className="h-full hover:scale-[1.02] transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Features Section with improved cards */}
      <div className="container mx-auto py-16 space-y-12">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Why Choose Geraid?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4 hover:bg-card/80 transition-colors">
            <Bot className="w-10 h-10 text-primary mx-auto" />
            <h3 className="font-semibold text-xl text-center">Comprehensive Testing</h3>
            <p className="text-muted-foreground text-center">
              Test your LLMs against a wide range of security vulnerabilities
            </p>
          </div>
          
          <div className="p-8 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4 hover:bg-card/80 transition-colors">
            <Brain className="w-10 h-10 text-primary mx-auto" />
            <h3 className="font-semibold text-xl text-center">Advanced Analysis</h3>
            <p className="text-muted-foreground text-center">
              Get detailed insights into potential security risks
            </p>
          </div>
          
          <div className="p-8 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4 hover:bg-card/80 transition-colors">
            <Settings className="w-10 h-10 text-primary mx-auto" />
            <h3 className="font-semibold text-xl text-center">Model Enhancement</h3>
            <p className="text-muted-foreground text-center">
              Improve your models with security-focused fine-tuning
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default Index;