import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModelSelect } from "./ModelSelect"
import { DatasetSelect } from "./DatasetSelect"
import { TaskSelect } from "./TaskSelect"
import { LanguageSelect } from "./LanguageSelect"
import { BasicParameters } from "./BasicParameters"
import { AdvancedParameters } from "./AdvancedParameters"
import { ParameterTabs } from "./ParameterTabs"
import { GeneratedScript } from "./GeneratedScript"
import { generateScript } from "./utils/scriptGenerator"
import { useToast } from "@/hooks/use-toast"

interface GenerateScriptProps {
  isGoogleAuthed: boolean;
  onScriptGenerated: (script: string, model: string, parameters: any) => void;
}

export const GenerateScript = ({ isGoogleAuthed, onScriptGenerated }: GenerateScriptProps) => {
  const { toast } = useToast()
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [taskType, setTaskType] = useState("")
  const [scriptLanguage, setScriptLanguage] = useState("python")
  const [basicParams, setBasicParams] = useState({
    learningRate: "0.0001",
    batchSize: "8",
    epochs: "3",
    warmupSteps: "500",
    weightDecay: "0.01",
    optimizer: "AdamW",
    scheduler: "linear",
  })
  const [advancedParams, setAdvancedParams] = useState({
    maxSteps: "1000",
    evaluationStrategy: "steps",
    saveStrategy: "steps",
    randomSeed: "42",
    precision: "fp16",
    gradientAccumulation: "4",
    useDeepSpeed: false,
    useFlashAttention: false,
    useMemoryOptimization: false,
    hardwareAcceleration: "cuda",
  })

  const handleGenerateScript = async () => {
    if (!isGoogleAuthed) {
      toast({
        variant: "destructive",
        title: "Google authentication required",
        description: "Please authenticate with Google before generating a script"
      })
      return
    }

    if (!model || !taskType) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please select a model and task type"
      })
      return
    }

    const parameters = {
      ...basicParams,
      ...advancedParams
    }

    try {
      const script = generateScript({
        model,
        datasetId,
        taskType,
        scriptLanguage,
        parameters
      })

      onScriptGenerated(script, model, parameters)

    } catch (error) {
      console.error('Error generating script:', error)
      toast({
        variant: "destructive",
        title: "Failed to generate script",
        description: "Please try again"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <ModelSelect value={model} onChange={setModel} />
            <DatasetSelect value={datasetId} onChange={setDatasetId} />
            <TaskSelect value={taskType} onChange={setTaskType} />
            <LanguageSelect value={scriptLanguage} onChange={setScriptLanguage} />
          </div>

          <ParameterTabs>
            <BasicParameters
              parameters={basicParams}
              onChange={setBasicParams}
            />
            <AdvancedParameters
              parameters={advancedParams}
              onChange={setAdvancedParams}
            />
          </ParameterTabs>

          <Button 
            onClick={handleGenerateScript}
            disabled={!isGoogleAuthed || !model || !taskType}
          >
            Generate Script
          </Button>
        </div>
      </Card>
    </div>
  )
}