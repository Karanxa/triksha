import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export const CreateDataset = () => {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [basePrompt, setBasePrompt] = useState("")
  const [numSamples, setNumSamples] = useState("100")

  const handleGenerate = async () => {
    if (!name || !basePrompt || !numSamples) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields"
      })
      return
    }

    setIsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-dataset', {
        body: {
          name,
          description,
          basePrompt,
          numSamples: parseInt(numSamples)
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
    } catch (error: any) {
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
        <CardTitle>Generate Jailbreak Dataset</CardTitle>
        <CardDescription>
          Generate adversarial datasets using EasyJailbreak to test LLM security
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
          <Label htmlFor="base-prompt">Base Prompt</Label>
          <Textarea
            id="base-prompt"
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Enter the base prompt for generating variations"
          />
        </div>

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