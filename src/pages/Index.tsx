import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Database, 
  Bot, 
  Brain,
  Settings
} from "lucide-react";
import ToolCard from "@/components/ToolCard";

const Index = () => {
  return (
    <div className="container mx-auto py-12 space-y-16">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl" />
        <div className="relative px-6 py-12 sm:py-20 text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to Geraid
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive platform for LLM security testing and enhancement
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/llm-scanner">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Get Started
              </button>
            </Link>
            <Link to="/datasets">
              <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                View Datasets
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/llm-scanner">
          <ToolCard
            icon={Shield}
            title="LLM Scanner"
            description="Test your models against common security vulnerabilities"
            className="h-full"
          />
        </Link>

        <Link to="/datasets">
          <ToolCard
            icon={Database}
            title="Datasets"
            description="Manage and create datasets for testing and fine-tuning"
            className="h-full"
          />
        </Link>

        <Link to="/augment-prompt">
          <ToolCard
            icon={Zap}
            title="Prompt Augmentation"
            description="Enhance your prompts with security-focused improvements"
            className="h-full"
          />
        </Link>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center">Why Choose Geraid?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <Bot className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium text-center">Comprehensive Testing</h3>
            <p className="text-sm text-muted-foreground text-center">
              Test your LLMs against a wide range of security vulnerabilities
            </p>
          </div>
          
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <Brain className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium text-center">Advanced Analysis</h3>
            <p className="text-sm text-muted-foreground text-center">
              Get detailed insights into potential security risks
            </p>
          </div>
          
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <Settings className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium text-center">Model Enhancement</h3>
            <p className="text-sm text-muted-foreground text-center">
              Improve your models with security-focused fine-tuning
            </p>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default Index;