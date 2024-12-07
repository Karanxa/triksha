import { Brain, Database, FileText, Settings, File, List, ArrowRight, Shield, Zap, Fingerprint } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  
  const tools = [
    { 
      icon: Brain, 
      title: "LLM Scans",
      description: "Test models against security vulnerabilities",
      path: "/llm-scanner" 
    },
    { 
      icon: List, 
      title: "Scan Results", 
      description: "Analyze and track security findings",
      path: "/llm-results" 
    },
    { 
      icon: Database, 
      title: "Datasets", 
      description: "Manage testing datasets",
      path: "/datasets" 
    },
    { 
      icon: FileText, 
      title: "Prompt Augmentation", 
      description: "Enhance prompts for better testing",
      path: "/augment-prompt" 
    },
    { 
      icon: Settings, 
      title: "Fine-tuning", 
      description: "Customize models for security",
      path: "/fine-tuning" 
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Comprehensive Security Testing",
      description: "Test LLMs against a wide range of security vulnerabilities, from prompt injection to data leakage."
    },
    {
      icon: Zap,
      title: "Automated Scanning",
      description: "Schedule automated security scans to continuously monitor your LLM deployments."
    },
    {
      icon: Fingerprint,
      title: "Model Fingerprinting",
      description: "Understand model behavior and identify potential security weaknesses through deep analysis."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text animate-fade-in">
            Geraid
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An End-to-End LLM Security Testing Platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Developed by {" "}
            <a 
              href="https://twitter.com/itskaranxa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Karan Arora
            </a>
          </p>
          <Button 
            size="lg" 
            className="mt-8"
            onClick={() => navigate("/llm-scanner")}
          >
            Start Testing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.title}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                onClick={() => tool.path ? navigate(tool.path) : null}
                className="hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-semibold mb-4">
            Ready to secure your LLM applications?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start testing your models against security vulnerabilities and ensure your AI applications are safe and reliable.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/llm-scanner")}
          >
            Begin Security Testing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;