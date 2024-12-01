import { Card, CardContent } from "@/components/ui/card";
import { ScanTabs } from "@/components/llm-scanner/ScanTabs";
import ToolCard from "@/components/ToolCard";
import { Shield } from "lucide-react";
import { useState } from "react";

const LLMScanner = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: "basic",
      title: "Custom Scan",
      description: "Test LLMs with custom prompts and analyze their responses",
      icon: Shield
    }
  ];

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Scans</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">Test LLM models for security vulnerabilities and analyze their responses.</p>
      
      {!selectedTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="pt-4 md:pt-6">
            <div className="mb-4 md:mb-6">
              <button 
                onClick={() => setSelectedTool(null)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
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