import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

const DEFAULT_CONFIG = {
  attack_provider: "open_ai",
  attack_model: "gpt-4o",  // Using the latest model as per instructions
  target_provider: "open_ai",
  target_model: "gpt-4o",
  num_attempts: 3,
  num_threads: 4,
  attack_temperature: 0.6,
  custom_benchmark: [],
  tests: []
};

export const PromptFuzzingForm = () => {
  const [name, setName] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [fuzzingType, setFuzzingType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrompt || !fuzzingType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to create a scan");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("prompt_fuzzing_scans").insert({
        name,
        base_prompt: basePrompt,
        fuzzing_type: fuzzingType,
        user_id: session.user.id,
        mutations: DEFAULT_CONFIG
      });

      if (error) throw error;
      toast.success("Prompt fuzzing scan created successfully");
      setName("");
      setBasePrompt("");
      setFuzzingType("");
    } catch (error) {
      console.error("Error creating prompt fuzzing scan:", error);
      toast.error("Failed to create prompt fuzzing scan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Scan Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter scan name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="basePrompt">Base Prompt</Label>
        <Input
          id="basePrompt"
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          placeholder="Enter base prompt for fuzzing"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuzzingType">Fuzzing Type</Label>
        <Select value={fuzzingType} onValueChange={setFuzzingType}>
          <SelectTrigger>
            <SelectValue placeholder="Select fuzzing type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="character_mutation">Character Mutation</SelectItem>
            <SelectItem value="word_replacement">Word Replacement</SelectItem>
            <SelectItem value="syntax_modification">Syntax Modification</SelectItem>
            <SelectItem value="context_injection">Context Injection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Scan..." : "Create Fuzzing Scan"}
      </Button>
    </form>
  );
};