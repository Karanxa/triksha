import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const FineTuning = () => {
  const [baseModel, setBaseModel] = useState("");
  const [datasetType, setDatasetType] = useState("");
  const [taskType, setTaskType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Basic Parameters
  const [learningRate, setLearningRate] = useState("0.0001");
  const [epochs, setEpochs] = useState("10");
  const [batchSize, setBatchSize] = useState("32");
  const [warmupSteps, setWarmupSteps] = useState("500");
  const [maxSteps, setMaxSteps] = useState("1000");
  const [weightDecay, setWeightDecay] = useState("0.01");
  const [optimizer, setOptimizer] = useState("adamw");
  const [scheduler, setScheduler] = useState("linear");
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps");
  const [saveStrategy, setSaveStrategy] = useState("steps");
  const [randomSeed, setRandomSeed] = useState("42");

  // Advanced Parameters
  const [mixedPrecision, setMixedPrecision] = useState("fp16");
  const [gradAccumSteps, setGradAccumSteps] = useState("4");
  const [maxGradNorm, setMaxGradNorm] = useState("1.0");
  const [useDeepSpeed, setUseDeepSpeed] = useState(false);
  const [enableGradientCheckpointing, setEnableGradientCheckpointing] = useState(false);
  const [useFlashAttention, setUseFlashAttention] = useState(false);
  const [useMemoryEfficientAttention, setUseMemoryEfficientAttention] = useState(false);
  const [useTritronKernels, setUseTritronKernels] = useState(false);
  const [optimizeMemoryUsage, setOptimizeMemoryUsage] = useState(false);
  const [useActivationCheckpointing, setUseActivationCheckpointing] = useState(false);
  const [useFSDP, setUseFSDP] = useState(false);
  const [enableParallelTraining, setEnableParallelTraining] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (['json', 'jsonl', 'csv', 'txt'].includes(fileType || '')) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JSON, JSONL, CSV, or TXT file",
        });
      }
    }
  };

  const handleGenerateScript = () => {
    if (!baseModel || !datasetType || !taskType || !file) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }

    toast({
      title: "Script generated successfully",
      description: "Your fine-tuning script has been generated",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Model Fine-tuning</h1>
        <p className="text-muted-foreground mb-8">
          Fine-tune pre-trained models on your custom dataset using Google Colab's GPU resources.
        </p>

        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-medium">Base Model</label>
            <Select value={baseModel} onValueChange={setBaseModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                <SelectItem value="llama-2">Llama 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Dataset Type</label>
            <Select value={datasetType} onValueChange={setDatasetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="conversation">Conversation</SelectItem>
                <SelectItem value="qa">Question & Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Task Type</label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="generation">Text Generation</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Upload Dataset</label>
            <Input
              type="file"
              accept=".json,.jsonl,.csv,.txt"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: JSON, JSONL, CSV, TXT
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="training-params">
              <AccordionTrigger>Training Parameters</AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Parameters</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="learning-rate">Learning Rate</Label>
                        <Input
                          id="learning-rate"
                          type="number"
                          value={learningRate}
                          onChange={(e) => setLearningRate(e.target.value)}
                          step="0.0001"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch-size">Batch Size</Label>
                        <Input
                          id="batch-size"
                          type="number"
                          value={batchSize}
                          onChange={(e) => setBatchSize(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="epochs">Epochs</Label>
                        <Input
                          id="epochs"
                          type="number"
                          value={epochs}
                          onChange={(e) => setEpochs(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-steps">Max Steps</Label>
                        <Input
                          id="max-steps"
                          type="number"
                          value={maxSteps}
                          onChange={(e) => setMaxSteps(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warmup-steps">Warmup Steps</Label>
                        <Input
                          id="warmup-steps"
                          type="number"
                          value={warmupSteps}
                          onChange={(e) => setWarmupSteps(e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight-decay">Weight Decay</Label>
                        <Input
                          id="weight-decay"
                          type="number"
                          value={weightDecay}
                          onChange={(e) => setWeightDecay(e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optimizer">Optimizer</Label>
                        <Select value={optimizer} onValueChange={setOptimizer}>
                          <SelectTrigger id="optimizer">
                            <SelectValue placeholder="Select optimizer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adamw">AdamW</SelectItem>
                            <SelectItem value="adam">Adam</SelectItem>
                            <SelectItem value="sgd">SGD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduler">Scheduler</Label>
                        <Select value={scheduler} onValueChange={setScheduler}>
                          <SelectTrigger id="scheduler">
                            <SelectValue placeholder="Select scheduler" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="cosine">Cosine</SelectItem>
                            <SelectItem value="constant">Constant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="evaluation-strategy">Evaluation Strategy</Label>
                        <Select value={evaluationStrategy} onValueChange={setEvaluationStrategy}>
                          <SelectTrigger id="evaluation-strategy">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="steps">Steps</SelectItem>
                            <SelectItem value="epoch">Epoch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="save-strategy">Save Strategy</Label>
                        <Select value={saveStrategy} onValueChange={setSaveStrategy}>
                          <SelectTrigger id="save-strategy">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="steps">Steps</SelectItem>
                            <SelectItem value="epoch">Epoch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="random-seed">Random Seed</Label>
                        <Input
                          id="random-seed"
                          type="number"
                          value={randomSeed}
                          onChange={(e) => setRandomSeed(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mixed-precision">Mixed Precision</Label>
                          <Select value={mixedPrecision} onValueChange={setMixedPrecision}>
                            <SelectTrigger id="mixed-precision">
                              <SelectValue placeholder="Select precision" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fp16">FP16</SelectItem>
                              <SelectItem value="bf16">BF16</SelectItem>
                              <SelectItem value="fp32">FP32</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grad-accum-steps">Gradient Accumulation Steps</Label>
                          <Input
                            id="grad-accum-steps"
                            type="number"
                            value={gradAccumSteps}
                            onChange={(e) => setGradAccumSteps(e.target.value)}
                            min="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-grad-norm">Max Gradient Norm</Label>
                          <Input
                            id="max-grad-norm"
                            type="number"
                            value={maxGradNorm}
                            onChange={(e) => setMaxGradNorm(e.target.value)}
                            step="0.1"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-deepspeed"
                            checked={useDeepSpeed}
                            onCheckedChange={setUseDeepSpeed}
                          />
                          <Label htmlFor="use-deepspeed">Use DeepSpeed</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enable-gradient-checkpointing"
                            checked={enableGradientCheckpointing}
                            onCheckedChange={setEnableGradientCheckpointing}
                          />
                          <Label htmlFor="enable-gradient-checkpointing">Enable Gradient Checkpointing</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-flash-attention"
                            checked={useFlashAttention}
                            onCheckedChange={setUseFlashAttention}
                          />
                          <Label htmlFor="use-flash-attention">Use Flash Attention</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-memory-efficient-attention"
                            checked={useMemoryEfficientAttention}
                            onCheckedChange={setUseMemoryEfficientAttention}
                          />
                          <Label htmlFor="use-memory-efficient-attention">Use xFormers Memory Efficient Attention</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-tritron-kernels"
                            checked={useTritronKernels}
                            onCheckedChange={setUseTritronKernels}
                          />
                          <Label htmlFor="use-tritron-kernels">Use Triton Kernels</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="optimize-memory-usage"
                            checked={optimizeMemoryUsage}
                            onCheckedChange={setOptimizeMemoryUsage}
                          />
                          <Label htmlFor="optimize-memory-usage">Optimize Memory Usage</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-activation-checkpointing"
                            checked={useActivationCheckpointing}
                            onCheckedChange={setUseActivationCheckpointing}
                          />
                          <Label htmlFor="use-activation-checkpointing">Use Activation Checkpointing</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-fsdp"
                            checked={useFSDP}
                            onCheckedChange={setUseFSDP}
                          />
                          <Label htmlFor="use-fsdp">Use Fully Sharded Data Parallel (FSDP)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enable-parallel-training"
                            checked={enableParallelTraining}
                            onCheckedChange={setEnableParallelTraining}
                          />
                          <Label htmlFor="enable-parallel-training">Enable Parallel Training</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            onClick={handleGenerateScript}
            className="w-full"
            size="lg"
          >
            Generate Fine-tuning Script
          </Button>

          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold">Your Generated Scripts</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-card rounded-md">
                <div>
                  <p className="font-medium">llama-2</p>
                  <p className="text-sm text-muted-foreground">
                    Task: classification | Dataset: text
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: 11/6/2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Script
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FineTuning;