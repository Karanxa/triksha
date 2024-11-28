import { useState } from "react"
import { Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"

interface UseGenerateDatasetProps {
  session: Session | null
  name: string
  description: string
  basePrompt: string
  numSamples: string
  method: string
  recipe: string
  targetModel: string
  fingerprintResults: any
  adversarialConfig: any
  setIsGenerating: (value: boolean) => void
  setName: (value: string) => void
  setDescription: (value: string) => void
  setBasePrompt: (value: string) => void
  setNumSamples: (value: string) => void
  setRecipe: (value: string) => void
  setTargetModel: (value: string) => void
  setFingerprintResults: (value: any) => void
  toast: any
}

export const useGenerateDataset = ({
  session,
  name,
  description,
  basePrompt,
  numSamples,
  method,
  recipe,
  targetModel,
  fingerprintResults,
  adversarialConfig,
  setIsGenerating,
  setName,
  setDescription,
  setBasePrompt,
  setNumSamples,
  setRecipe,
  setTargetModel,
  setFingerprintResults,
  toast
}: UseGenerateDatasetProps) => {
  const handleGenerate = async () => {
    if (!name) {
      toast.error("Please provide a name for the dataset")
      return
    }

    setIsGenerating(true)
    try {
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

      toast.success("Dataset generated successfully")

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
      toast.error(error.message || "Failed to generate dataset")
    } finally {
      setIsGenerating(false)
    }
  }

  return { handleGenerate }
}