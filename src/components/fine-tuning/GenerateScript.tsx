import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModelSelect } from "./ModelSelect"
import { DatasetSelect } from "./DatasetSelect"
import { TaskSelect } from "./TaskSelect"
import { LanguageSelect } from "./LanguageSelect"
import { ParameterTabs } from "./ParameterTabs"
import { generateScript } from "./utils/scriptGenerator"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@supabase/auth-helpers-react"
import { supabase } from "@/integrations/supabase/client"

interface GenerateScriptProps {
  onScriptGenerated: (script: string, model: string, parameters: any) => void;
}

export const GenerateScript = ({ onScriptGenerated }: GenerateScriptProps) => {
  const { toast } = useToast()
  const session = useSession()
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [taskType, setTaskType] = useState("")
  const [scriptLanguage, setScriptLanguage] = useState("python")
  
  // Basic parameters state
  const [learningRate, setLearningRate] = useState("0.0001")
  const [batchSize, setBatchSize] = useState("8")
  const [epochs, setEpochs] = useState("3")
  const [warmupSteps, setWarmupSteps] = useState("500")
  const [weightDecay, setWeightDecay] = useState("0.01")
  const [optimizer, setOptimizer] = useState("adamw")
  const [scheduler, setScheduler] = useState("linear")
  const [maxSteps, setMaxSteps] = useState("1000")
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps")
  const [saveStrategy, setSaveStrategy] = useState("steps")
  const [randomSeed, setRandomSeed] = useState("42")

  // Advanced parameters state
  const [precision, setPrecision] = useState("fp16")
  const [gradientAccumulation, setGradientAccumulation] = useState("4")
  const [useDeepSpeed, setUseDeepSpeed] = useState(false)
  const [useFlashAttention, setUseFlashAttention] = useState(false)
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda")

  const handleGenerateScript = async () => {
    if (!model || !taskType) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please select a model and task type"
      })
      return
    }

    const parameters = {
      learningRate,
      batchSize,
      epochs,
      warmupSteps,
      weightDecay,
      optimizer,
      scheduler,
      maxSteps,
      evaluationStrategy,
      saveStrategy,
      randomSeed,
      precision,
      gradientAccumulation,
      useDeepSpeed,
      useFlashAttention,
      useMemoryOptimization,
      hardwareAcceleration
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

      toast({
        title: "Script generated successfully",
        description: "You can view it in the Job History tab"
      })

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
            <ModelSelect value={model} onValueChange={setModel} />
            <DatasetSelect value={datasetId} onValueChange={setDatasetId} />
            <TaskSelect value={taskType} onValueChange={setTaskType} />
            <LanguageSelect value={scriptLanguage} onValueChange={setScriptLanguage} />
          </div>

          <ParameterTabs
            learningRate={learningRate}
            setLearningRate={setLearningRate}
            batchSize={batchSize}
            setBatchSize={setBatchSize}
            epochs={epochs}
            setEpochs={setEpochs}
            warmupSteps={warmupSteps}
            setWarmupSteps={setWarmupSteps}
            weightDecay={weightDecay}
            setWeightDecay={setWeightDecay}
            optimizer={optimizer}
            setOptimizer={setOptimizer}
            scheduler={scheduler}
            setScheduler={setScheduler}
            maxSteps={maxSteps}
            setMaxSteps={setMaxSteps}
            evaluationStrategy={evaluationStrategy}
            setEvaluationStrategy={setEvaluationStrategy}
            saveStrategy={saveStrategy}
            setSaveStrategy={setSaveStrategy}
            randomSeed={randomSeed}
            setRandomSeed={setRandomSeed}
            precision={precision}
            setPrecision={setPrecision}
            gradientAccumulation={gradientAccumulation}
            setGradientAccumulation={setGradientAccumulation}
            useDeepSpeed={useDeepSpeed}
            setUseDeepSpeed={setUseDeepSpeed}
            useFlashAttention={useFlashAttention}
            setUseFlashAttention={setUseFlashAttention}
            useMemoryOptimization={useMemoryOptimization}
            setUseMemoryOptimization={setUseMemoryOptimization}
            hardwareAcceleration={hardwareAcceleration}
            setHardwareAcceleration={setHardwareAcceleration}
          />

          <Button 
            onClick={handleGenerateScript}
            disabled={!model || !taskType}
            className="w-full"
          >
            Generate Script
          </Button>
        </div>
      </Card>
    </div>
  )
}