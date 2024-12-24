import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModelSelect } from "@/components/fine-tuning/ModelSelect"
import { DatasetSelect } from "@/components/fine-tuning/DatasetSelect"
import { TaskSelect } from "@/components/fine-tuning/TaskSelect"
import { ParameterTabs } from "@/components/fine-tuning/ParameterTabs"
import { generateScript } from "@/components/fine-tuning/utils/scriptGenerator"
import { GeneratedScript } from "@/components/fine-tuning/GeneratedScript"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CreateFineTuningJobProps {
  onScriptGenerated: (script: string, model: string, parameters: any) => void;
}

export const CreateFineTuningJob = ({ onScriptGenerated }: CreateFineTuningJobProps) => {
  const [model, setModel] = useState("")
  const [dataset, setDataset] = useState("")
  const [taskType, setTaskType] = useState("")
  const [scriptLanguage, setScriptLanguage] = useState("python")
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)

  // Basic parameters
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

  // Advanced parameters
  const [precision, setPrecision] = useState("fp16")
  const [gradientAccumulation, setGradientAccumulation] = useState("1")
  const [useDeepSpeed, setUseDeepSpeed] = useState(false)
  const [useFlashAttention, setUseFlashAttention] = useState(false)
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda")

  const handleGenerateScript = () => {
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
      hardwareAcceleration,
    }

    const script = generateScript({
      model,
      datasetId: dataset,
      taskType,
      scriptLanguage,
      parameters,
    })

    setGeneratedScript(script)
    onScriptGenerated(script, model, parameters)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModelSelect value={model} onValueChange={setModel} />
          <DatasetSelect value={dataset} onValueChange={setDataset} />
          <TaskSelect value={taskType} onValueChange={setTaskType} />
          <div className="space-y-2">
            <Label>Script Language</Label>
            <Select value={scriptLanguage} onValueChange={setScriptLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="pytorch">PyTorch</SelectItem>
                <SelectItem value="tensorflow">TensorFlow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
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

      <div className="flex justify-end">
        <Button 
          onClick={handleGenerateScript}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          Generate Script
        </Button>
      </div>

      {generatedScript && (
        <GeneratedScript script={generatedScript} />
      )}
    </div>
  )
}

export default CreateFineTuningJob