import { Card, CardContent } from "@/components/ui/card";
import { ScanTabs } from "@/components/llm-scanner/ScanTabs";
import ToolCard from "@/components/ToolCard";
import { Shield, Zap, Bug } from "lucide-react";
import { useState } from "react";

const LLMScanner = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: "basic",
      title: "Custom Scan",
      description: "Test LLMs with custom prompts and analyze their responses",
      icon: Shield
    },
    {
      id: "garak",
      title: "Garak",
      description: "Advanced scanning using the Garak testing framework. Learn more at https://github.com/leondz/garak",
      icon: Zap
    },
    {
      id: "fuzzer",
      title: "Prompt Security Fuzzer",
      description: "Automatically generate variations of prompts to test security boundaries. Based on research at https://arxiv.org/abs/2402.09155",
      icon: Bug
    }
  ];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Red Teaming</h1>
      
      {!selectedTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              onClick={() => setSelectedTool(tool.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <button 
                onClick={() => setSelectedTool(null)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to tools
              </button>
            </div>
            <ScanTabs initialTab={selectedTool} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LLMScanner;