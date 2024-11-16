import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CSVUpload } from "./CSVUpload";

interface ScanFormPromptProps {
  singlePrompt: string;
  onSinglePromptChange: (value: string) => void;
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
  scanType: "manual" | "batch";
}

export const ScanFormPrompt = ({ 
  singlePrompt, 
  onSinglePromptChange,
  prompts,
  onPromptsExtracted,
  scanType
}: ScanFormPromptProps) => {
  if (scanType === "manual") {
    return (
      <div className="space-y-4">
        <Label>Single Prompt</Label>
        <Textarea 
          placeholder="Enter your prompt for scanning"
          className="min-h-[100px]"
          value={singlePrompt}
          onChange={(e) => onSinglePromptChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Upload Multiple Prompts</Label>
      <CSVUpload onPromptsExtracted={onPromptsExtracted} />
      {prompts.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {prompts.length} prompts loaded from CSV
        </p>
      )}
    </div>
  );
};