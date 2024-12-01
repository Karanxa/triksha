import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptListProps {
  prompts: string[];
}

export const PromptList = ({ prompts }: PromptListProps) => {
  if (!prompts.length) return null;
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Original Dataset Prompts ({prompts.length})</h3>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <div key={index} className="p-2 bg-muted rounded-md">
                <p className="text-sm">{prompt}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};