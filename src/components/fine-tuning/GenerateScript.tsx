import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ModelSelect } from "./ModelSelect"
import { DatasetSelect } from "./DatasetSelect"
import { TaskSelect } from "./TaskSelect"
import { ParameterTabs } from "./ParameterTabs"
import { LanguageSelect } from "./LanguageSelect"
import { GeneratedScript } from "./GeneratedScript"
import { generateTrainingScript } from "./utils/scriptGenerator"

interface GenerateScriptProps {
  isGoogleAuthed: boolean
}

export const GenerateScript = ({ isGoogleAuthed }: GenerateScriptProps) => {
  const { toast } = useToast()
  
  // Model and Dataset Selection
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [taskType, setTaskType] = useState("")
  const [scriptLanguage, setScriptLanguage] = useState("python")
  
  // Basic Parameters with default values
  const [learningRate, setLearningRate] = useState("0.0001")
  const [batchSize, setBatchSize] = useState("32")
  const [epochs, setEpochs] = useState("10")
  const [warmupSteps, setWarmupSteps] = useState("500")
  const [weightDecay, setWeightDecay] = useState("0.01")
  const [optimizer, setOptimizer] = useState("adamw")
  const [scheduler, setScheduler] = useState("linear")
  const [maxSteps, setMaxSteps] = useState("1000")
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps")
  const [saveStrategy, setSaveStrategy] = useState("steps")
  const [randomSeed, setRandomSeed] = useState("42")

  // Advanced Parameters with default values
  const [precision, setPrecision] = useState("fp16")
  const [gradientAccumulation, setGradientAccumulation] = useState("4")
  const [useDeepSpeed, setUseDeepSpeed] = useState(false)
  const [useFlashAttention, setUseFlashAttention] = useState(false)
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda")

  const [generatedScript, setGeneratedScript] = useState<string | null>(null)

  // Check if all required inputs are filled
  const areRequiredInputsFilled = model.length > 0 && datasetId.length > 0 && taskType.length > 0

  const handleGenerateScript = async () => {
    if (!areRequiredInputsFilled) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields: Base Model, Dataset, and Task Type"
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

    const script = generateTrainingScript({
      model,
      datasetId,
      taskType,
      scriptLanguage,
      parameters
    })

    setGeneratedScript(script)
    toast({
      title: "Script generated",
      description: "Your fine-tuning script has been generated successfully"
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModelSelect model={model} setModel={setModel} />
          <DatasetSelect value={datasetId} onValueChange={setDatasetId} />
          <TaskSelect taskType={taskType} setTaskType={setTaskType} />
          <LanguageSelect value={scriptLanguage} onValueChange={setScriptLanguage} />
        </div>
      </Card>

      <Card className="p-6">
        <ParameterTabs
          // Basic Parameters
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
          // Advanced Parameters
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
      </Card>

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleGenerateScript}
        disabled={!areRequiredInputsFilled}
      >
        Generate Fine-tuning Script
      </Button>

      {generatedScript && (
        <GeneratedScript script={generatedScript} />
      )}
    </div>
  )
}