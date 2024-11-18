import { Brain, Database, FileText, Settings, File, List } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const tools = [
    { icon: Brain, title: "Red Teaming", path: "/llm-scanner" },
    { icon: List, title: "LLM Results", path: "/llm-results" },
    { icon: Database, title: "Datasets", path: "/datasets" },
    { icon: FileText, title: "Prompt Augmentation", path: "/augment-prompt" },
    { icon: Settings, title: "Fine-tuning", path: "/fine-tuning" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold mb-4">Geraid</h1>
          <p className="text-xl text-muted-foreground">
            An E2E LLM Offensive Security Testing Platform
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
        </div>

        <h2 className="text-2xl font-semibold mb-4">Tools</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Select a tool to get started with genai security testing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              icon={tool.icon}
              title={tool.title}
              onClick={() => tool.path ? navigate(tool.path) : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;