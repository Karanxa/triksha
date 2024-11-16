import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptFuzzerFormProps {
  onSubmit: (data: {
    prompt: string;
    numMutations: number;
    strategy: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    stopSequences?: string[];
    topP?: number;
  }) => Promise<void>;
  isScanning: boolean;
}

export const PromptFuzzerForm = ({ onSubmit, isScanning }: PromptFuzzerFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [numMutations, setNumMutations] = useState(10);
  const [strategy, setStrategy] = useState("random");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [maxTokens, setMaxTokens] = useState(100);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [stopSequences, setStopSequences] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      await onSubmit({
        prompt,
        numMutations,
        strategy,
        model,
        maxTokens,
        temperature,
        topP,
        stopSequences
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

      <div className="space-y-2">
        <Label>Number of Security Mutations ({numMutations})</Label>
        <Slider
          value={[numMutations]}
          onValueChange={([value]) => setNumMutations(value)}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Security Testing Strategy</Label>
        <Select value={strategy} onValueChange={setStrategy}>
          <SelectTrigger>
            <SelectValue placeholder="Select security testing strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random Mutations</SelectItem>
            <SelectItem value="targeted">Targeted Attack Vectors</SelectItem>
            <SelectItem value="semantic">Semantic Preservation</SelectItem>
            <SelectItem value="adversarial">Adversarial Examples</SelectItem>
            <SelectItem value="boundary">Boundary Testing</SelectItem>
            <SelectItem value="injection">Injection Attacks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select target model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-2">Claude 2</SelectItem>
            <SelectItem value="llama2">Llama 2</SelectItem>
            <SelectItem value="mistral">Mistral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maximum Tokens ({maxTokens})</Label>
        <Slider
          value={[maxTokens]}
          onValueChange={([value]) => setMaxTokens(value)}
          min={1}
          max={2000}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Temperature ({temperature})</Label>
        <Slider
          value={[temperature]}
          onValueChange={([value]) => setTemperature(value)}
          min={0}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Top P ({topP})</Label>
        <Slider
          value={[topP]}
          onValueChange={([value]) => setTopP(value)}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

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