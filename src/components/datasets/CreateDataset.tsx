import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { DatasetForm } from "./form/DatasetForm"

export const CreateDataset = () => {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [fingerprintResults, setFingerprintResults] = useState(null)

  const handleGenerate = async (formData: {
    name: string;
    description: string;
    basePrompt: string;
    numSamples: string;
    method: string;
    recipe: string;
    targetModel: string;
    adversarialConfig: any;
  }) => {
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
      // First, perform fingerprinting if needed
      if (formData.method !== 'manual') {
        const { data: fingerprintData, error: fingerprintError } = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: formData.targetModel.split('-')[0],
            model: formData.targetModel.split('-')[1],
            prompt: "Tell me about your capabilities and limitations"
          }
        })

        if (fingerprintError) throw fingerprintError
        setFingerprintResults(fingerprintData)
      }

      // Generate dataset with fingerprint results
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
          fingerprintResults
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

  return <DatasetForm isGenerating={isGenerating} onSubmit={handleGenerate} />
}