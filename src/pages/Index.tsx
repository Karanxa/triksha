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
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-16 text-center">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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