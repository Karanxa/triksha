import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DatasetFormInputsProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  basePrompt: string;
  setBasePrompt: (value: string) => void;
  numSamples: string;
  setNumSamples: (value: string) => void;
  method: string;
  setMethod: (value: string) => void;
  recipe: string;
  setRecipe: (value: string) => void;
  targetModel: string;
  setTargetModel: (value: string) => void;
}

export const DatasetFormInputs = ({
  name,
  setName,
  description,
  setDescription,
  basePrompt,
  setBasePrompt,
  numSamples,
  setNumSamples,
  method,
  setMethod,
  recipe,
  setRecipe,
  targetModel,
  setTargetModel
}: DatasetFormInputsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Dataset Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter dataset name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter dataset description"
        />
      </div>

      <div className="space-y-2">
        <Label>Generation Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select generation method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Input</SelectItem>
            <SelectItem value="recipe">EasyJailbreak Recipe</SelectItem>
            <SelectItem value="adversarial">Advanced Adversarial</SelectItem>
            <SelectItem value="upload">Upload CSV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === "manual" && (
        <div className="space-y-2">
          <Label htmlFor="base-prompt">Base Prompt</Label>
          <Textarea
            id="base-prompt"
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Enter the base prompt for generating variations"
          />
        </div>
      )}

      {method === "recipe" && (
        <>
          <div className="space-y-2">
            <Label>Recipe</Label>
            <Select value={recipe} onValueChange={setRecipe}>
              <SelectTrigger>
                <SelectValue placeholder="Select EasyJailbreak recipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAIR">PAIR (Chao 2023)</SelectItem>
                <SelectItem value="AutoDAN">AutoDAN</SelectItem>
                <SelectItem value="DeepInception">Deep Inception</SelectItem>
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
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="claude-3">Claude 3</SelectItem>
                <SelectItem value="llama-2">Llama 2</SelectItem>
                <SelectItem value="vicuna">Vicuna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {method !== "upload" && (
        <div className="space-y-2">
          <Label htmlFor="num-samples">Number of Samples</Label>
          <Input
            id="num-samples"
            type="number"
            value={numSamples}
            onChange={(e) => setNumSamples(e.target.value)}
            min="1"
            max="1000"
          />
        </div>
      )}
    </>
  );
};