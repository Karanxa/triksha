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
      console.log('Starting dataset generation with:', formData)
      
      // First, perform fingerprinting if needed
      if (formData.method !== 'manual') {
        console.log('Starting fingerprinting for model:', formData.targetModel)
        const { data: fingerprintData, error: fingerprintError } = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: formData.targetModel.split('-')[0],
            model: formData.targetModel.split('-')[1],
            prompt: "Tell me about your capabilities and limitations"
          }
        })

        if (fingerprintError) {
          console.error('Fingerprint error:', fingerprintError)
          throw new Error(`Fingerprinting failed: ${fingerprintError.message}`)
        }

        console.log('Fingerprint results:', fingerprintData)
        setFingerprintResults(fingerprintData)
      }

      // Generate dataset with fingerprint results
      console.log('Generating dataset...')
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

      if (error) {
        console.error('Dataset generation error:', error)
        throw new Error(`Dataset generation failed: ${error.message}`)
      }

      if (!data) {
        throw new Error('No response received from the server')
      }

      console.log('Dataset generated successfully:', data)
      toast({
        title: "Success",
        description: "Dataset generated successfully"
      })
    } catch (error: any) {
      console.error('Error generating dataset:', error)
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || 'An unexpected error occurred'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return <DatasetForm isGenerating={isGenerating} onSubmit={handleGenerate} />
}