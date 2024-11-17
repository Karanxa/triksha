import { useState } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ModelSelect } from "./ModelSelect"
import { DatasetUpload } from "./DatasetUpload"
import { TaskSelect } from "./TaskSelect"
import { BasicParameters } from "./BasicParameters"
import { AdvancedParameters } from "./AdvancedParameters"
import { ScriptPreview } from "./ScriptPreview"
import { supabase } from "@/integrations/supabase/client"

export const GenerateScript = () => {
  const session = useSession()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form state
  const [model, setModel] = useState("")
  const [dataset, setDataset] = useState<File | null>(null)
  const [taskType, setTaskType] = useState("")
  
  // Basic parameters
  const [learningRate, setLearningRate] = useState("0.0001")
  const [batchSize, setBatchSize] = useState("32")
  const [epochs, setEpochs] = useState("10")
  const [warmupSteps, setWarmupSteps] = useState("500")
  const [weightDecay, setWeightDecay] = useState("0.01")
  const [optimizer, setOptimizer] = useState("adamw")
  const [scheduler, setScheduler] = useState("linear")
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps")
  const [saveStrategy, setSaveStrategy] = useState("steps")
  const [randomSeed, setRandomSeed] = useState("42")
  
  // Advanced parameters
  const [precision, setPrecision] = useState("fp16")
  const [gradientAccumulation, setGradientAccumulation] = useState("1")
  const [maxGradNorm, setMaxGradNorm] = useState("1.0")
  const [memoryOptimization, setMemoryOptimization] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true)

  const [generatedScript, setGeneratedScript] = useState("")

  const handleGenerate = async () => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate fine-tuning scripts",
          variant: "destructive"
        })
        return
      }

      if (!model || !dataset || !taskType) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      setIsGenerating(true)

      const formData = {
        model,
        taskType,
        basicParams: {
          learningRate,
          batchSize,
          epochs,
          warmupSteps,
          weightDecay,
          optimizer,
          scheduler,
          evaluationStrategy,
          saveStrategy,
          randomSeed
        },
        advancedParams: {
          precision,
          gradientAccumulation,
          maxGradNorm,
          memoryOptimization,
          hardwareAcceleration
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-finetuning-script', {
        body: formData
      })

      if (error) throw error

      setGeneratedScript(data.script)

      // Save job to database
      const { error: dbError } = await supabase
        .from('fine_tuning_jobs')
        .insert({
          user_id: session.user.id,
          model,
          status: 'pending',
          parameters: formData
        })

      if (dbError) throw dbError

      toast({
        title: "Script generated successfully",
        description: "Your fine-tuning script is ready"
      })

    } catch (error: any) {
      toast({
        title: "Error generating script",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form className="space-y-8">
          <ModelSelect value={model} onChange={setModel} />
          <DatasetUpload file={dataset} onFileChange={setDataset} />
          <TaskSelect value={taskType} onChange={setTaskType} />
          
          <BasicParameters
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
            evaluationStrategy={evaluationStrategy}
            setEvaluationStrategy={setEvaluationStrategy}
            saveStrategy={saveStrategy}
            setSaveStrategy={setSaveStrategy}
            randomSeed={randomSeed}
            setRandomSeed={setRandomSeed}
          />

          <AdvancedParameters
            precision={precision}
            setPrecision={setPrecision}
            gradientAccumulation={gradientAccumulation}
            setGradientAccumulation={setGradientAccumulation}
            maxGradNorm={maxGradNorm}
            setMaxGradNorm={setMaxGradNorm}
            memoryOptimization={memoryOptimization}
            setMemoryOptimization={setMemoryOptimization}
            hardwareAcceleration={hardwareAcceleration}
            setHardwareAcceleration={setHardwareAcceleration}
          />

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Script
          </Button>
        </form>
      </Card>

      {generatedScript && (
        <ScriptPreview script={generatedScript} />
      )}
    </div>
  )
}