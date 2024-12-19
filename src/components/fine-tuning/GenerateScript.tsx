import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DatasetSelect } from "./DatasetSelect"
import { ModelSelect } from "./ModelSelect"
import { ParameterTabs } from "./ParameterTabs"
import { ScriptPreview } from "./ScriptPreview"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useSession } from "@supabase/auth-helpers-react"

export const GenerateScript = () => {
  const { toast } = useToast()
  const session = useSession()
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedDataset, setSelectedDataset] = useState("")
  const [generatedScript, setGeneratedScript] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Basic Parameters
  const [learningRate, setLearningRate] = useState("0.0001")
  const [batchSize, setBatchSize] = useState("32")
  const [epochs, setEpochs] = useState("3")
  const [warmupSteps, setWarmupSteps] = useState("500")
  const [weightDecay, setWeightDecay] = useState("0.01")
  const [optimizer, setOptimizer] = useState("adamw_torch")
  const [scheduler, setScheduler] = useState("linear")
  const [maxSteps, setMaxSteps] = useState("1000")
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps")
  const [saveStrategy, setSaveStrategy] = useState("steps")
  const [randomSeed, setRandomSeed] = useState("42")

  // Advanced Parameters
  const [precision, setPrecision] = useState("fp16")
  const [gradientAccumulation, setGradientAccumulation] = useState("1")
  const [useDeepSpeed, setUseDeepSpeed] = useState(false)
  const [useFlashAttention, setUseFlashAttention] = useState(false)
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda")

  const openJupyterNotebook = () => {
    window.open('http://localhost:8888/tree', '_blank')
  }

  const handleGenerateScript = async () => {
    if (!selectedModel || !selectedDataset) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please select a model and dataset before generating a script."
      })
      return
    }

    setIsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-finetuning-script', {
        body: {
          model: selectedModel,
          datasetId: selectedDataset,
          userId: session?.user?.id,
          basicParams: {
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
            randomSeed
          },
          advancedParams: {
            precision,
            gradientAccumulation,
            useDeepSpeed,
            useFlashAttention,
            useMemoryOptimization,
            hardwareAcceleration
          }
        }
      })

      if (error) throw error

      setGeneratedScript(data.script)
      toast({
        title: "Success",
        description: "Fine-tuning script generated successfully"
      })
    } catch (error) {
      console.error('Error generating script:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate fine-tuning script. Please try again."
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={openJupyterNotebook}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Open Jupyter Notebook
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <ModelSelect value={selectedModel} onValueChange={setSelectedModel} />
          <DatasetSelect value={selectedDataset} onValueChange={setSelectedDataset} />

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

          <Button 
            className="w-full"
            onClick={handleGenerateScript}
            disabled={isGenerating || !selectedModel || !selectedDataset}
          >
            {isGenerating ? "Generating Script..." : "Generate Script"}
          </Button>
        </div>
      </Card>

      {generatedScript && (
        <ScriptPreview
          script={generatedScript}
          model={selectedModel}
          dataset={selectedDataset}
          parameters={{
            learning_rate: parseFloat(learningRate),
            batch_size: parseInt(batchSize),
            epochs: parseInt(epochs),
            warmup_steps: parseInt(warmupSteps),
            weight_decay: parseFloat(weightDecay),
            optimizer,
            scheduler,
            max_steps: parseInt(maxSteps),
            evaluation_strategy: evaluationStrategy,
            save_strategy: saveStrategy,
            random_seed: parseInt(randomSeed),
            precision,
            gradient_accumulation_steps: parseInt(gradientAccumulation),
            use_deepspeed: useDeepSpeed,
            use_flash_attention: useFlashAttention,
            use_memory_optimization: useMemoryOptimization,
            hardware_acceleration: hardwareAcceleration,
          }}
        />
      )}
    </div>
  )
}