import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CSVUpload } from "./CSVUpload";

interface ScanPromptInputProps {
  scanType: string;
  singlePrompt: string;
  onSinglePromptChange: (value: string) => void;
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const ScanPromptInput = ({
  scanType,
  singlePrompt,
  onSinglePromptChange,
  prompts,
  onPromptsExtracted
}: ScanPromptInputProps) => {
  if (scanType === "manual") {
    return (
      <div className="space-y-4">
        <Label>Enter Prompt</Label>
        <Textarea
          placeholder="Enter your prompt for scanning"
          className="min-h-[100px]"
          value={singlePrompt}
          onChange={(e) => onSinglePromptChange(e.target.value)}
        />
      </div>
    );
  }

  if (scanType === "batch") {
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
  }

  return null;
};