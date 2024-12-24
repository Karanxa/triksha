import { Link } from "react-router-dom";
import { 
  Shield, 
  Search,
  List,
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
            Welcome to Triksha
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive platform for LLM security testing and enhancement
          </p>
          <div className="flex justify-center">
            <Link to="/llm-scanner">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 text-lg font-medium">
                Get Started
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

        <Link to="/llm-results">
          <ToolCard
            icon={List}
            title="Scan Results"
            description="View and analyze detailed security scan results"
            className="h-full"
          />
        </Link>

        <Link to="/llm-scanner?tab=contextual">
          <ToolCard
            icon={Search}
            title="Contextual Analysis"
            description="Deep dive into model behavior with contextual testing"
            className="h-full"
          />
        </Link>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center">Why Choose Triksha?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <Shield className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium text-center">Comprehensive Testing</h3>
            <p className="text-sm text-muted-foreground text-center">
              Test your LLMs against a wide range of security vulnerabilities
            </p>
          </div>
          
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <List className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium text-center">Detailed Results</h3>
            <p className="text-sm text-muted-foreground text-center">
              Get in-depth analysis of scan results and vulnerabilities
            </p>
          </div>
          
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <Search className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium text-center">Contextual Analysis</h3>
            <p className="text-sm text-muted-foreground text-center">
              Understand model behavior through contextual testing
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