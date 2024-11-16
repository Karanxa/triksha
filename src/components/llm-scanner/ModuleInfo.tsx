import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleInfoProps {
  type: "custom" | "garak" | "fuzzer";
}

export const ModuleInfo = ({ type }: ModuleInfoProps) => {
  const getInfo = () => {
    switch (type) {
      case "custom":
        return {
          title: "Custom LLM Scanner",
          description: "Test your prompts against various LLM providers to identify potential vulnerabilities and security risks.",
          features: [
            "Multiple provider support (OpenAI, Anthropic, Google, Ollama)",
            "Batch scanning capabilities",
            "Scheduled scans",
            "Custom endpoint integration"
          ]
        };
      case "garak":
        return {
          title: "Garak Integration",
          description: "Leverages Garak, an open-source LLM vulnerability scanner, to perform comprehensive security testing.",
          features: [
            "Multiple test suites",
            "Detailed vulnerability reports",
            "Model-specific testing",
            "Configuration options"
          ],
          credits: {
            name: "Garak",
            url: "https://github.com/leondz/garak",
            author: "Leon Derczynski"
          }
        };
      case "fuzzer":
        return {
          title: "Prompt Security Fuzzer",
          description: "Advanced prompt mutation and security testing tool that attempts to bypass LLM safety measures.",
          features: [
            "Multiple attack strategies",
            "Parallel testing",
            "Temperature control",
            "Cross-model validation"
          ]
        };
    }
  };

  const info = getInfo();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <InfoIcon className="h-4 w-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{info.title}</h4>
          <p className="text-sm text-muted-foreground">
            {info.description}
          </p>
          <div className="mt-2">
            <h5 className="text-sm font-medium mb-1">Key Features:</h5>
            <ul className="text-sm text-muted-foreground list-disc pl-4">
              {info.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          {'credits' in info && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm">
                Powered by{' '}
                <a 
                  href={info.credits.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-primary"
                >
                  {info.credits.name}
                </a>
                {' '}by {info.credits.author}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};