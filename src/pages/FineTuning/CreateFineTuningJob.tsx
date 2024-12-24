import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModelSelect } from "./components/ModelSelect"
import { DatasetSelect } from "./components/DatasetSelect"
import { TaskSelect } from "@/components/fine-tuning/TaskSelect"
import { LanguageSelect } from "@/components/fine-tuning/LanguageSelect"
import { ParameterTabs } from "@/components/fine-tuning/ParameterTabs"
import { useState } from "react"
import { GeneratedScript } from "@/components/fine-tuning/GeneratedScript"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@supabase/auth-helpers-react"

interface CreateFineTuningJobProps {
  onScriptGenerated: (script: string, model: string, parameters: any) => void;
}

export const CreateFineTuningJob = ({ onScriptGenerated }: CreateFineTuningJobProps) => {
  const { toast } = useToast()
  const session = useSession()
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [taskType, setTaskType] = useState("")
  const [scriptLanguage, setScriptLanguage] = useState("python")
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  
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
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to generate scripts"
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
      console.log("Generating script with parameters:", { model, taskType, parameters })
      
      const script = generateScript({
        model,
        datasetId,
        taskType,
        scriptLanguage,
        parameters
      })

      setGeneratedScript(script)

      // Store in database
      const { data, error } = await supabase
        .from('fine_tuning_jobs')
        .insert({
          user_id: session.user.id,
          model,
          dataset_id: datasetId || null,
          status: 'script_generated',
          parameters,
          script_content: script
        })
        .select()

      if (error) {
        console.error('Error saving script:', error)
        throw error
      }

      console.log('Fine-tuning job created:', data)

      onScriptGenerated(script, model, parameters)

      toast({
        title: "Script generated successfully",
        description: "You can view it in the Job History tab"
      })

    } catch (error: any) {
      console.error('Error in script generation:', error)
      toast({
        variant: "destructive",
        title: "Failed to generate script",
        description: error.message || "Please try again"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <div className="p-6 space-y-8">
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

      {generatedScript && (
        <GeneratedScript script={generatedScript} />
      )}
    </div>
  )
}
