import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicParameters, type BasicParameterValues } from "./BasicParameters"
import { AdvancedParameters } from "./AdvancedParameters"

interface ParameterTabsProps {
  // Basic Parameters
  learningRate: string
  setLearningRate: (value: string) => void
  batchSize: string
  setBatchSize: (value: string) => void
  epochs: string
  setEpochs: (value: string) => void
  warmupSteps: string
  setWarmupSteps: (value: string) => void
  weightDecay: string
  setWeightDecay: (value: string) => void
  optimizer: string
  setOptimizer: (value: string) => void
  scheduler: string
  setScheduler: (value: string) => void
  maxSteps: string
  setMaxSteps: (value: string) => void
  evaluationStrategy: string
  setEvaluationStrategy: (value: string) => void
  saveStrategy: string
  setSaveStrategy: (value: string) => void
  randomSeed: string
  setRandomSeed: (value: string) => void

  // Advanced Parameters
  precision: string
  setPrecision: (value: string) => void
  gradientAccumulation: string
  setGradientAccumulation: (value: string) => void
  useDeepSpeed: boolean
  setUseDeepSpeed: (value: boolean) => void
  useFlashAttention: boolean
  setUseFlashAttention: (value: boolean) => void
  useMemoryOptimization: boolean
  setUseMemoryOptimization: (value: boolean) => void
  hardwareAcceleration: string
  setHardwareAcceleration: (value: string) => void
}

export const ParameterTabs = ({
  // Basic Parameters
  learningRate,
  setLearningRate,
  batchSize,
  setBatchSize,
  epochs,
  setEpochs,
  warmupSteps,
  setWarmupSteps,
  weightDecay,
  setWeightDecay,
  optimizer,
  setOptimizer,
  scheduler,
  setScheduler,
  maxSteps,
  setMaxSteps,
  evaluationStrategy,
  setEvaluationStrategy,
  saveStrategy,
  setSaveStrategy,
  randomSeed,
  setRandomSeed,

  // Advanced Parameters
  precision,
  setPrecision,
  gradientAccumulation,
  setGradientAccumulation,
  useDeepSpeed,
  setUseDeepSpeed,
  useFlashAttention,
  setUseFlashAttention,
  useMemoryOptimization,
  setUseMemoryOptimization,
  hardwareAcceleration,
  setHardwareAcceleration,
}: ParameterTabsProps) => {
  const basicParameterValues: BasicParameterValues = {
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
  };

  const handleBasicParametersChange = (newValues: BasicParameterValues) => {
    setLearningRate(newValues.learningRate);
    setBatchSize(newValues.batchSize);
    setEpochs(newValues.epochs);
    setWarmupSteps(newValues.warmupSteps);
    setWeightDecay(newValues.weightDecay);
    setOptimizer(newValues.optimizer);
    setScheduler(newValues.scheduler);
    setMaxSteps(newValues.maxSteps);
    setEvaluationStrategy(newValues.evaluationStrategy);
    setSaveStrategy(newValues.saveStrategy);
    setRandomSeed(newValues.randomSeed);
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic Parameters</TabsTrigger>
        <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 pt-4">
        <BasicParameters
          value={basicParameterValues}
          onChange={handleBasicParametersChange}
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
  )
}