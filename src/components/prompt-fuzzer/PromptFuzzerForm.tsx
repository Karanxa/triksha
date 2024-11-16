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
    attackProvider: string;
    attackModel: string;
    targetProvider: string;
    targetModel: string;
    numAttempts: number;
    numThreads: number;
    attackTemperature: number;
    customBenchmark: string[];
    tests: string[];
  }) => Promise<void>;
  isScanning: boolean;
}

export const PromptFuzzerForm = ({ onSubmit, isScanning }: PromptFuzzerFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [attackProvider, setAttackProvider] = useState("open_ai");
  const [attackModel, setAttackModel] = useState("gpt-3.5-turbo");
  const [targetProvider, setTargetProvider] = useState("open_ai");
  const [targetModel, setTargetModel] = useState("gpt-3.5-turbo");
  const [numAttempts, setNumAttempts] = useState(3);
  const [numThreads, setNumThreads] = useState(4);
  const [attackTemperature, setAttackTemperature] = useState(0.6);
  const [customBenchmark] = useState<string[]>([]);
  const [tests] = useState<string[]>([]);

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
        customBenchmark,
        tests
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
        <Label>Attack Provider</Label>
        <Select value={attackProvider} onValueChange={setAttackProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select attack provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open_ai">OpenAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Attack Model</Label>
        <Select value={attackModel} onValueChange={setAttackModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select attack model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Provider</Label>
        <Select value={targetProvider} onValueChange={setTargetProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select target provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open_ai">OpenAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Model</Label>
        <Select value={targetModel} onValueChange={setTargetModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select target model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Number of Attempts ({numAttempts})</Label>
        <Slider
          value={[numAttempts]}
          onValueChange={([value]) => setNumAttempts(value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Threads ({numThreads})</Label>
        <Slider
          value={[numThreads]}
          onValueChange={([value]) => setNumThreads(value)}
          min={1}
          max={8}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Attack Temperature ({attackTemperature})</Label>
        <Slider
          value={[attackTemperature]}
          onValueChange={([value]) => setAttackTemperature(value)}
          min={0}
          max={2}
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