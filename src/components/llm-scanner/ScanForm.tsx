import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { CSVUpload } from "./CSVUpload";
import { toast } from "sonner";

interface ScanFormProps {
  onSubmit: (data: {
    prompts: string[];
    provider: string;
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
  }) => Promise<void>;
  isScanning: boolean;
}

export const ScanForm = ({ onSubmit, isScanning }: ScanFormProps) => {
  const [provider, setProvider] = useState("");
  const [singlePrompt, setSinglePrompt] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("none");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = async () => {
    if (!provider) {
      toast.error("Please select a provider");
      return;
    }

    if (!singlePrompt && prompts.length === 0) {
      toast.error("Please enter a prompt or upload a CSV");
      return;
    }

    if (!category) {
      toast.error("Please select an attack category");
      return;
    }

    const allPrompts = singlePrompt ? [singlePrompt] : prompts;

    await onSubmit({
      prompts: allPrompts,
      provider,
      category,
      label: label || undefined,
      schedule: schedule !== "none" ? schedule : undefined,
      isRecurring
    });

    // Reset form
    setSinglePrompt("");
    setPrompts([]);
    setLabel("");
    setSchedule("none");
    setIsRecurring(false);
  };

  const handlePromptsExtracted = (extractedPrompts: string[]) => {
    setPrompts(extractedPrompts);
    setSinglePrompt(""); // Clear single prompt when CSV is uploaded
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Select Provider</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="ollama">Ollama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Single Prompt</Label>
        <Textarea 
          placeholder="Enter your prompt for scanning"
          className="min-h-[100px]"
          value={singlePrompt}
          onChange={(e) => {
            setSinglePrompt(e.target.value);
            setPrompts([]); // Clear CSV prompts when single prompt is entered
          }}
        />
      </div>

      <div className="space-y-4">
        <Label>Or Upload Multiple Prompts</Label>
        <CSVUpload onPromptsExtracted={handlePromptsExtracted} />
        {prompts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {prompts.length} prompts loaded from CSV
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Attack Category</Label>
        <AttackCategorySelect
          value={category}
          onValueChange={setCategory}
        />
      </div>

      <div className="space-y-4">
        <Label>Scan Label (Optional)</Label>
        <Input 
          placeholder="Enter a label for this scan"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label>Schedule (Optional)</Label>
        <Select value={schedule} onValueChange={setSchedule}>
          <SelectTrigger>
            <SelectValue placeholder="Select schedule frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Schedule</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {schedule !== "none" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <Label htmlFor="recurring">Make this scan recurring</Label>
        </div>
      )}

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleSubmit}
        disabled={isScanning}
      >
        {isScanning ? "Processing Scans..." : "Start LLM Scan"}
      </Button>
    </div>
  );
};