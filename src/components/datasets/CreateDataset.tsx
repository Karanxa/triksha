import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { DatasetForm } from "./create/DatasetForm"
import { useSession } from "@supabase/auth-helpers-react"

export const CreateDataset = () => {
  const { toast } = useToast()
  const session = useSession()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (formData: any) => {
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please provide a name for the dataset"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Generate base prompts based on method
      let originalPrompts = []
      if (formData.method === "manual") {
        originalPrompts = [formData.basePrompt]
      } else {
        // For recipe and adversarial methods, we'll use a default set of prompts
        // This should be replaced with actual prompt generation logic
        originalPrompts = ["Default prompt 1", "Default prompt 2"]
      }

      // Generate dataset
      const { data, error } = await supabase.functions.invoke('generate-dataset', {
        body: {
          name: formData.name,
          description: formData.description,
          originalPrompts: originalPrompts,
          numSamples: parseInt(formData.numSamples),
          method: formData.method,
          recipe: formData.recipe,
          targetModel: formData.targetModel,
          adversarialConfig: formData.method === "adversarial" ? formData.adversarialConfig : undefined,
          useOpenAI: formData.useOpenAI,
          // Add empty fingerprint if not provided
          fingerprintResults: {
            capabilities: "",
            boundaries: "",
            training: "",
            languages: "",
            safety: ""
          }
        }
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Dataset generated successfully"
      })

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
      <CardContent>
        <DatasetForm 
          isGenerating={isGenerating}
          onSubmit={handleGenerate}
        />
      </CardContent>
    </Card>
  )
}