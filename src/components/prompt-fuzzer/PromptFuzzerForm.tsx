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
  }) => Promise<void>;
  isScanning: boolean;
}

export const PromptFuzzerForm = ({ onSubmit, isScanning }: PromptFuzzerFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [numMutations, setNumMutations] = useState(10);
  const [strategy, setStrategy] = useState("random");
  const [model, setModel] = useState("gpt-3.5-turbo");

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
        model
      });
    } catch (error) {
      console.error('Fuzzing failed:', error);
      toast.error('Failed to run prompt fuzzer: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Base Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt you want to fuzz"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Mutations ({numMutations})</Label>
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
        <Label>Mutation Strategy</Label>
        <Select value={strategy} onValueChange={setStrategy}>
          <SelectTrigger>
            <SelectValue placeholder="Select mutation strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random</SelectItem>
            <SelectItem value="targeted">Targeted</SelectItem>
            <SelectItem value="semantic">Semantic</SelectItem>
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
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isScanning || !prompt}
        className="w-full"
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Fuzzer...
          </>
        ) : (
          "Run Prompt Fuzzer"
        )}
      </Button>
    </div>
  );
};