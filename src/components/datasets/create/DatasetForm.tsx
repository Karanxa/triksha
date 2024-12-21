import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { AdversarialConfig } from "../AdversarialConfig"

interface DatasetFormProps {
  isGenerating: boolean;
  onSubmit: (formData: {
    name: string;
    description: string;
    basePrompt: string;
    numSamples: string;
    method: string;
    recipe: string;
    targetModel: string;
    adversarialConfig: any;
    useOpenAI: boolean;
  }) => void;
}

export const DatasetForm = ({ isGenerating, onSubmit }: DatasetFormProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [basePrompt, setBasePrompt] = useState("")
  const [numSamples, setNumSamples] = useState("100")
  const [method, setMethod] = useState("manual")
  const [recipe, setRecipe] = useState("")
  const [targetModel, setTargetModel] = useState("")
  const [useOpenAI, setUseOpenAI] = useState(true)
  const [adversarialConfig, setAdversarialConfig] = useState({
    attackType: "evasion",
    vulnerabilityCategory: "prompt-injection",
    difficulty: "medium",
    severity: "medium",
    context: "chatbot"
  })

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      basePrompt,
      numSamples,
      method,
      recipe,
      targetModel,
      adversarialConfig,
      useOpenAI
    })
  }

  return (
    <div className="space-y-6">
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
          </SelectContent>
        </Select>
      </div>

      {method === "manual" ? (
        <div className="space-y-2">
          <Label htmlFor="base-prompt">Base Prompt</Label>
          <Textarea
            id="base-prompt"
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Enter the base prompt for generating variations"
          />
        </div>
      ) : method === "recipe" ? (
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
      ) : (
        <AdversarialConfig 
          config={adversarialConfig}
          onChange={setAdversarialConfig}
        />
      )}

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

      <div className="flex items-center space-x-2">
        <Switch
          id="use-openai"
          checked={useOpenAI}
          onCheckedChange={setUseOpenAI}
        />
        <Label htmlFor="use-openai">
          Use OpenAI to enhance prompts
        </Label>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isGenerating}
      >
        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Dataset
      </Button>
    </div>
  )
}