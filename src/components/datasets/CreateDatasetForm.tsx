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
import { useGenerateDataset } from "./hooks/useGenerateDataset"
import { useFileUpload } from "./hooks/useFileUpload"

export const CreateDatasetForm = () => {
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

  const { handleGenerate } = useGenerateDataset({
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
  })

  const { handleFileUpload } = useFileUpload({
    session,
    setName,
    setDescription,
    setMethod,
    toast
  })

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