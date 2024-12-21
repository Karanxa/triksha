import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Database, 
  Bot, 
  Brain,
  FileCode,
  BarChart,
  Settings
} from "lucide-react";
import ToolCard from "@/components/ToolCard";

const Index = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Geraid</h1>
        <p className="text-xl text-muted-foreground">
          Your comprehensive platform for LLM security testing and enhancement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/llm-scanner">
          <ToolCard
            icon={Shield}
            title="LLM Scanner"
            description="Test your models against common security vulnerabilities and attack vectors"
          />
        </Link>

        <Link to="/llm-results">
          <ToolCard
            icon={BarChart}
            title="Scan Results"
            description="View and analyze your security scan results"
          />
        </Link>

        <Link to="/datasets">
          <ToolCard
            icon={Database}
            title="Datasets"
            description="Manage and create datasets for testing and fine-tuning"
          />
        </Link>

        <Link to="/augment-prompt">
          <ToolCard
            icon={Zap}
            title="Prompt Augmentation"
            description="Enhance your prompts with security-focused improvements"
          />
        </Link>

        <Link to="/fine-tuning">
          <ToolCard
            icon={Brain}
            title="Fine-tuning"
            description="Train and customize models with enhanced security features"
          />
        </Link>

        <Link to="/settings">
          <ToolCard
            icon={Settings}
            title="API Settings"
            description="Configure your API keys and provider settings"
          />
        </Link>
      </div>

      <div className="mt-12 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Geraid?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <Bot className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-medium mb-2">Comprehensive Testing</h3>
              <p className="text-sm text-muted-foreground">
                Test your LLMs against a wide range of security vulnerabilities
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <FileCode className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-medium mb-2">Advanced Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed insights into potential security risks
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Brain className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-medium mb-2">Model Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                Improve your models with security-focused fine-tuning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;