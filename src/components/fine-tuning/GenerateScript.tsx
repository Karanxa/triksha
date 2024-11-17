import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ModelSelect } from "./ModelSelect"
import { DatasetSelect } from "./DatasetSelect"
import { TaskSelect } from "./TaskSelect"
import { DatasetUpload } from "./DatasetUpload"
import { ParameterTabs } from "./ParameterTabs"

interface GenerateScriptProps {
  isGoogleAuthed: boolean
}

export const GenerateScript = ({ isGoogleAuthed }: GenerateScriptProps) => {
  const { toast } = useToast()
  
  // Model and Dataset Selection
  const [model, setModel] = useState("")
  const [datasetType, setDatasetType] = useState("")
  const [taskType, setTaskType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  
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

  // Check if all required inputs are filled
  const areRequiredInputsFilled = model !== "" && datasetType !== "" && taskType !== "" && file !== null

  const handleGenerateScript = async () => {
    if (!isGoogleAuthed) {
      toast({
        variant: "destructive",
        title: "Google authentication required",
        description: "Please authenticate with Google before generating a script"
      })
      return
    }

    if (!areRequiredInputsFilled) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields: Base Model, Dataset Type, Task Type, and Dataset"
      })
      return
    }

    // Add script generation logic here
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
          <DatasetSelect datasetType={datasetType} setDatasetType={setDatasetType} />
          <TaskSelect taskType={taskType} setTaskType={setTaskType} />
          <DatasetUpload onFileSelect={(file) => setFile(file)} />
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
        disabled={!isGoogleAuthed || !areRequiredInputsFilled}
      >
        Generate Fine-tuning Script
      </Button>
    </div>
  )
}