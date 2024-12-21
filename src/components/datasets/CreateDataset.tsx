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
  const [fingerprintResults, setFingerprintResults] = useState(null)

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
      // Only perform fingerprinting if OpenAI enhancement is enabled
      let fingerprintData = null
      if (formData.useOpenAI && formData.method !== 'manual') {
        const { data, error: fingerprintError } = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: formData.targetModel.split('-')[0],
            model: formData.targetModel.split('-')[1],
            prompt: "Tell me about your capabilities and limitations"
          }
        })

        if (fingerprintError) throw fingerprintError
        fingerprintData = data
        setFingerprintResults(data)
      }

      // Generate dataset with or without fingerprint results
      const { data, error } = await supabase.functions.invoke('generate-dataset', {
        body: {
          name: formData.name,
          description: formData.description,
          basePrompt: formData.method === "manual" ? formData.basePrompt : undefined,
          numSamples: parseInt(formData.numSamples),
          method: formData.method,
          recipe: formData.recipe,
          targetModel: formData.targetModel,
          adversarialConfig: formData.method === "adversarial" ? formData.adversarialConfig : undefined,
          fingerprintResults: fingerprintData,
          useOpenAI: formData.useOpenAI
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
      setFingerprintResults(null)
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