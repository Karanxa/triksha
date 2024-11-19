import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { FuzzingFormHeader } from "./FuzzingFormHeader";
import { ModelSelectionGrid } from "./ModelSelectionGrid";
import { FuzzingControls } from "./FuzzingControls";
import { TestSelector } from "./TestSelector";

const DEFAULT_CONFIG = {
  attack_provider: "openai",
  attack_model: "gpt-4",
  target_provider: "openai",
  target_model: "gpt-4",
  num_attempts: 3,
  num_threads: 4,
  attack_temperature: 0.6,
  custom_benchmark: [],
};

export const PromptFuzzingForm = () => {
  const [name, setName] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrompt) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to create a scan");
      return;
    }

    setIsLoading(true);
    try {
      const { data: scan, error } = await supabase
        .from("prompt_fuzzing_scans")
        .insert({
          name,
          base_prompt: basePrompt,
          user_id: session.user.id,
          fuzzing_type: "security",
          mutations: {
            ...config,
            tests: selectedTests
          }
        })
        .select()
        .single();

      if (error) throw error;

      const { error: functionError } = await supabase.functions.invoke('run-prompt-fuzzer', {
        body: { scanId: scan.id }
      });

      if (functionError) throw functionError;

      toast.success("Prompt fuzzing scan started successfully");
      setName("");
      setBasePrompt("");
      setConfig(DEFAULT_CONFIG);
      setSelectedTests([]);
    } catch (error) {
      console.error("Error creating prompt fuzzing scan:", error);
      toast.error("Failed to create prompt fuzzing scan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FuzzingFormHeader
        name={name}
        setName={setName}
        basePrompt={basePrompt}
        setBasePrompt={setBasePrompt}
      />
      
      <ModelSelectionGrid config={config} setConfig={setConfig} />
      
      <FuzzingControls config={config} setConfig={setConfig} />
      
      <TestSelector
        selectedTests={selectedTests}
        setSelectedTests={setSelectedTests}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Scan..." : "Create Fuzzing Scan"}
      </Button>
    </form>
  );
};