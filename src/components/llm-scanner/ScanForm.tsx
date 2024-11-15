import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormPrompt } from "./ScanFormPrompt";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { Loader2 } from "lucide-react";

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

    if (provider === 'ollama') {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('api_keys').single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Failed to fetch profile settings");
        return;
      }

      const ollamaEndpoint = profile?.api_keys?.['ollama_endpoint'] as string | undefined;
      
      if (!ollamaEndpoint) {
        toast.error("Please configure your Ollama endpoint URL in Settings");
        return;
      }
      
      try {
        new URL(ollamaEndpoint);
      } catch (error) {
        console.error("Invalid Ollama endpoint URL:", error);
        toast.error("Invalid Ollama endpoint URL. Please check your settings.");
        return;
      }
    }

    const allPrompts = singlePrompt ? [singlePrompt] : prompts;
    console.log("Submitting scan with prompts:", allPrompts);

    try {
      await onSubmit({
        prompts: allPrompts,
        provider,
        category,
        label: label || undefined,
        schedule: schedule !== "none" ? schedule : undefined,
        isRecurring
      });

      // Reset form only on success
      setSinglePrompt("");
      setPrompts([]);
      setLabel("");
      setSchedule("none");
      setIsRecurring(false);
      
      toast.success("Scan initiated successfully");
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error(`Scan failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-8">
      <ScanFormProvider 
        provider={provider}
        onProviderChange={setProvider}
      />

      <ScanFormPrompt
        singlePrompt={singlePrompt}
        onSinglePromptChange={(value) => {
          setSinglePrompt(value);
          setPrompts([]);
        }}
        prompts={prompts}
        onPromptsExtracted={(extractedPrompts) => {
          setPrompts(extractedPrompts);
          setSinglePrompt("");
        }}
      />

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

      <ScanFormSchedule
        schedule={schedule}
        onScheduleChange={setSchedule}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
      />

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleSubmit}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Scan...
          </>
        ) : (
          "Start LLM Scan"
        )}
      </Button>
    </div>
  );
};