import { Brain, Database, FileText, Settings, File, List } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const tools = [
    { icon: Brain, title: "LLM Scanner", path: "/llm-scanner" },
    { icon: List, title: "LLM Results", path: "/llm-results" },
    { icon: Database, title: "Datasets", path: "/datasets" },
    { icon: FileText, title: "Prompt Augmentation" },
    { icon: Settings, title: "Fine-tuning" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">GenAI Security</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Select a tool from the sidebar to get started with genai security security testing.
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