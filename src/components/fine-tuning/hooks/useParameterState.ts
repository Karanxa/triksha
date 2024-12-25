import { useState } from "react"

export const useParameterState = () => {
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
  const [gradientAccumulation, setGradientAccumulation] = useState("4")
  const [useDeepSpeed, setUseDeepSpeed] = useState(false)
  const [useFlashAttention, setUseFlashAttention] = useState(false)
  const [useMemoryOptimization, setUseMemoryOptimization] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState("cuda")

  const getParameters = () => ({
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
  })

  return {
    // Basic parameters
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
    // Advanced parameters
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
    // Utility function
    getParameters
  }
}