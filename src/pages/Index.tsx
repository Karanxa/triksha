import { Brain, Database, FileText, Settings, File, List } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const tools = [
    { icon: Brain, title: "LLM Scanner", path: "/llm-scanner" },
    { icon: List, title: "LLM Results", path: "/llm-results" },
    { icon: Database, title: "Datasets", path: "/datasets" },
    { icon: FileText, title: "Prompt Augmentation", path: "/augment-prompt" },
    { icon: Settings, title: "Fine-tuning", path: "/fine-tuning" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">GenAI Security</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12">
          Select a tool from the sidebar to get started with genai security security testing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
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