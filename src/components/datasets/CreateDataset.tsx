import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { AdversarialConfig } from "./AdversarialConfig"
import { useSession } from "@supabase/auth-helpers-react"
import { DatasetFormInputs } from "./DatasetFormInputs"
import DatasetFileUpload from "./DatasetFileUpload"

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

  const handleFileUpload = async (data: { prompts: string[]; name?: string }) => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to generate datasets"
      })
      return
    }

    setIsGenerating(true)
    try {
      const content = data.prompts.join('\n')
      const file = new Blob([content], { type: 'text/plain' })
      const filePath = `${session.user.id}/${Date.now()}-dataset.txt`

      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          name: data.name || 'Uploaded Dataset',
          description: `Dataset uploaded from CSV with ${data.prompts.length} prompts`,
          file_path: filePath,
          user_id: session.user.id
        })

      if (dbError) throw dbError

      toast({
        title: "Success",
        description: "Dataset uploaded successfully"
      })

      // Reset form
      setName("")
      setDescription("")
      setMethod("manual")
    } catch (error: any) {
      console.error('Error uploading dataset:', error)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message
      })
    } finally {
      setIsGenerating(false)
    }
  }

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
          Generate adversarial datasets using manual input, EasyJailbreak recipes, or upload your own CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {method === "upload" ? (
          <DatasetFileUpload onFileUpload={handleFileUpload} />
        ) : (
          <>
            <DatasetFormInputs
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              basePrompt={basePrompt}
              setBasePrompt={setBasePrompt}
              numSamples={numSamples}
              setNumSamples={setNumSamples}
              method={method}
              setMethod={setMethod}
              recipe={recipe}
              setRecipe={setRecipe}
              targetModel={targetModel}
              setTargetModel={setTargetModel}
            />

            {method === "adversarial" && (
              <AdversarialConfig 
                config={adversarialConfig}
                onChange={setAdversarialConfig}
              />
            )}

            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Dataset
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
