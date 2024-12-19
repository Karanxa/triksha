import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatasetSelect } from "./DatasetSelect";
import { ModelSelect } from "./ModelSelect";
import { ParameterTabs } from "./ParameterTabs";
import { ScriptPreview } from "./ScriptPreview";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const GenerateScript = ({ isGoogleAuthed }: { isGoogleAuthed: boolean }) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");

  // Basic Parameters
  const [learningRate, setLearningRate] = useState("0.0001");
  const [batchSize, setBatchSize] = useState("32");
  const [epochs, setEpochs] = useState("3");
  const [warmupSteps, setWarmupSteps] = useState("500");
  const [weightDecay, setWeightDecay] = useState("0.01");
  const [optimizer, setOptimizer] = useState("adamw_torch");
  const [scheduler, setScheduler] = useState("linear");
  const [maxSteps, setMaxSteps] = useState("1000");
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps");
  const [saveStrategy, setSaveStrategy] = useState("steps");
  const [randomSeed, setRandomSeed] = useState("42");

  // Advanced Parameters
  const [precision, setPrecision] = useState("fp16");
  const [gradientAccumulation, setGradientAccumulation] = useState("1");
  const [useDeepSpeed, setUseDeepSpeed] = useState(false);
  const [useFlashAttention, setUseFlashAttention] = useState(false);
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false);
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda");

  const openJupyterNotebook = () => {
    // This URL assumes Jupyter is running on the default port 8888
    window.open('http://localhost:8888/tree', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generate Fine-tuning Script</h2>
        <Button 
          variant="outline" 
          onClick={openJupyterNotebook}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
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
        </div>
      </Card>

      <ScriptPreview
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
          seed: parseInt(randomSeed),
          precision,
          gradient_accumulation_steps: parseInt(gradientAccumulation),
          use_deepspeed: useDeepSpeed,
          use_flash_attention: useFlashAttention,
          use_memory_optimization: useMemoryOptimization,
          hardware_acceleration: hardwareAcceleration,
        }}
      />
    </div>
  );
};