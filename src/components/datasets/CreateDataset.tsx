import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { AdversarialConfig } from "./AdversarialConfig"
import { useSession } from "@supabase/auth-helpers-react"

export const CreateDataset = () => {
  const { toast } = useToast()
  const session = useSession()
  const [isGenerating, setIsGenerating] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [basePrompt, setBasePrompt] = useState("")
  const [numSamples, setNumSamples] = useState("100")
  const [method, setMethod] = useState("manual")
  const [recipe, setRecipe] = useState("")
  const [targetModel, setTargetModel] = useState("")
  const [fingerprintResults, setFingerprintResults] = useState(null)
  const [adversarialConfig, setAdversarialConfig] = useState({
    attackType: "evasion",
    vulnerabilityCategory: "prompt-injection",
    difficulty: "medium",
    severity: "medium",
    context: "chatbot"
  })

  const handleGenerate = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to generate datasets"
      })
      return
    }

    if (!name) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please provide a name for the dataset"
      })
      return
    }

    setIsGenerating(true)
    try {
      // First, perform fingerprinting if needed
      if (method !== 'manual') {
        const { data: fingerprintData, error: fingerprintError } = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: targetModel.split('-')[0],
            model: targetModel.split('-')[1],
            prompt: "Tell me about your capabilities and limitations"
          }
        })

        if (fingerprintError) throw fingerprintError
        setFingerprintResults(fingerprintData)
      }

      // Generate dataset with fingerprint results
      const { data, error } = await supabase.functions.invoke('generate-dataset', {
        body: {
          name,
          description,
          basePrompt: method === "manual" ? basePrompt : undefined,
          numSamples: parseInt(numSamples),
          method,
          recipe,
          targetModel,
          adversarialConfig: method === "adversarial" ? adversarialConfig : undefined,
          fingerprintResults
        }
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Dataset generated successfully"
      })

      // Reset form
      setName("")
      setDescription("")
      setBasePrompt("")
      setNumSamples("100")
      setRecipe("")
      setTargetModel("")
      setFingerprintResults(null)
    } catch (error: any) {
      console.error('Error generating dataset:', error)
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Dataset</CardTitle>
        <CardDescription>
          Generate adversarial datasets using manual input, EasyJailbreak recipes, or advanced adversarial techniques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Button 
          onClick={handleGenerate} 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Dataset
        </Button>
      </CardContent>
    </Card>
  )
}
