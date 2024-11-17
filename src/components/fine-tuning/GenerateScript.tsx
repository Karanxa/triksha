import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BasicParameters } from './BasicParameters';
import { AdvancedParameters } from './AdvancedParameters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface GenerateScriptProps {
  isGoogleAuthed: boolean;
}

export const GenerateScript: React.FC<GenerateScriptProps> = ({ isGoogleAuthed }) => {
  const { toast } = useToast();
  
  // Basic Parameters
  const [learningRate, setLearningRate] = useState("0.0001");
  const [batchSize, setBatchSize] = useState("32");
  const [epochs, setEpochs] = useState("10");
  const [warmupSteps, setWarmupSteps] = useState("500");
  const [weightDecay, setWeightDecay] = useState("0.01");
  const [optimizer, setOptimizer] = useState("adamw");
  const [scheduler, setScheduler] = useState("linear");
  const [maxSteps, setMaxSteps] = useState("1000");
  const [evaluationStrategy, setEvaluationStrategy] = useState("steps");
  const [saveStrategy, setSaveStrategy] = useState("steps");
  const [randomSeed, setRandomSeed] = useState("42");

  // Advanced Parameters
  const [precision, setPrecision] = useState("fp16");
  const [gradientAccumulation, setGradientAccumulation] = useState("4");
  const [useDeepSpeed, setUseDeepSpeed] = useState(false);
  const [useFlashAttention, setUseFlashAttention] = useState(false);
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false);
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda");

  const handleGenerateScript = async () => {
    if (!isGoogleAuthed) {
      toast({
        variant: "destructive",
        title: "Google authentication required",
        description: "Please authenticate with Google before generating a script"
      });
      return;
    }

    // Add script generation logic here
    toast({
      title: "Script generated",
      description: "Your fine-tuning script has been generated successfully"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Parameters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
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
              maxSteps={maxSteps}
              setMaxSteps={setMaxSteps}
              evaluationStrategy={evaluationStrategy}
              setEvaluationStrategy={setEvaluationStrategy}
              saveStrategy={saveStrategy}
              setSaveStrategy={setSaveStrategy}
              randomSeed={randomSeed}
              setRandomSeed={setRandomSeed}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 pt-4">
            <AdvancedParameters
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
          </TabsContent>
        </Tabs>
      </Card>

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleGenerateScript}
        disabled={!isGoogleAuthed}
      >
        Generate Fine-tuning Script
      </Button>
    </div>
  );
};