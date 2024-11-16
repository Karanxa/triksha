import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProviderConfig } from "./ProviderConfig";
import { FuzzerConfig } from "./FuzzerConfig";
import type { PromptFuzzerFormProps } from "./types";

export const PromptFuzzerForm = ({ onSubmit, isScanning }: PromptFuzzerFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [attackProvider, setAttackProvider] = useState("open_ai");
  const [attackModel, setAttackModel] = useState("gpt-4");
  const [targetProvider, setTargetProvider] = useState("open_ai");
  const [targetModel, setTargetModel] = useState("gpt-4");
  const [numAttempts, setNumAttempts] = useState(3);
  const [numThreads, setNumThreads] = useState(4);
  const [attackTemperature, setAttackTemperature] = useState(0.6);

  const handleSubmit = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      await onSubmit({
        prompt,
        attackProvider,
        attackModel,
        targetProvider,
        targetModel,
        numAttempts,
        numThreads,
        attackTemperature,
        customBenchmark: [],
        tests: []
      });
    } catch (error) {
      console.error('Security fuzzing failed:', error);
      toast.error('Failed to run prompt security fuzzer: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Base Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt you want to test for security vulnerabilities"
          className="min-h-[100px]"
        />
      </div>

      <ProviderConfig
        attackProvider={attackProvider}
        attackModel={attackModel}
        targetProvider={targetProvider}
        targetModel={targetModel}
        onAttackProviderChange={setAttackProvider}
        onAttackModelChange={setAttackModel}
        onTargetProviderChange={setTargetProvider}
        onTargetModelChange={setTargetModel}
      />

      <FuzzerConfig
        numAttempts={numAttempts}
        numThreads={numThreads}
        attackTemperature={attackTemperature}
        onNumAttemptsChange={setNumAttempts}
        onNumThreadsChange={setNumThreads}
        onAttackTemperatureChange={setAttackTemperature}
      />

      <Button 
        onClick={handleSubmit} 
        disabled={isScanning || !prompt}
        className="w-full"
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Security Fuzzer...
          </>
        ) : (
          "Run Prompt Security Fuzzer"
        )}
      </Button>
    </div>
  );
};