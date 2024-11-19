import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

const DEFAULT_CONFIG = {
  attack_provider: "openai",
  attack_model: "gpt-4o",
  target_provider: "openai",
  target_model: "gpt-4o",
  num_attempts: 3,
  num_threads: 4,
  attack_temperature: 0.6,
  custom_benchmark: [],
  tests: []
};

const AVAILABLE_TESTS = [
  "ucar", "amnesia", "toxic", "prompt_injection", "prompt_leaking",
  "jailbreak", "data_exfiltration", "system_prompt", "role_play",
  "social_engineering", "xss", "sql_injection", "command_injection",
  "path_traversal", "ssrf"
];

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
      // Create the scan record
      const { data: scan, error } = await supabase
        .from("prompt_fuzzing_scans")
        .insert({
          name,
          base_prompt: basePrompt,
          user_id: session.user.id,
          mutations: {
            ...config,
            tests: selectedTests
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Start the fuzzing process
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
        <Textarea
          id="basePrompt"
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          placeholder="Enter the system prompt you want to test"
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Attack Provider</Label>
          <Select 
            value={config.attack_provider}
            onValueChange={(value) => setConfig(prev => ({ ...prev, attack_provider: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select attack provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Attack Model</Label>
          <Select 
            value={config.attack_model}
            onValueChange={(value) => setConfig(prev => ({ ...prev, attack_model: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select attack model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4 Opus</SelectItem>
              <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
              <SelectItem value="gemini-1.0-ultra">Gemini Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Provider</Label>
          <Select 
            value={config.target_provider}
            onValueChange={(value) => setConfig(prev => ({ ...prev, target_provider: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Model</Label>
          <Select 
            value={config.target_model}
            onValueChange={(value) => setConfig(prev => ({ ...prev, target_model: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4 Opus</SelectItem>
              <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
              <SelectItem value="gemini-1.0-ultra">Gemini Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Number of Attempts: {config.num_attempts}</Label>
          <Slider
            value={[config.num_attempts]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, num_attempts: value }))}
            min={1}
            max={10}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Threads: {config.num_threads}</Label>
          <Slider
            value={[config.num_threads]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, num_threads: value }))}
            min={1}
            max={8}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Attack Temperature: {config.attack_temperature}</Label>
          <Slider
            value={[config.attack_temperature]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, attack_temperature: value }))}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Tests</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AVAILABLE_TESTS.map((test) => (
            <label key={test} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedTests.includes(test)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTests(prev => [...prev, test]);
                  } else {
                    setSelectedTests(prev => prev.filter(t => t !== test));
                  }
                }}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-sm">{test}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Scan..." : "Create Fuzzing Scan"}
      </Button>
    </form>
  );
};