import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BasicParametersProps {
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
  evaluationStrategy: string
  setEvaluationStrategy: (value: string) => void
  saveStrategy: string
  setSaveStrategy: (value: string) => void
  randomSeed: string
  setRandomSeed: (value: string) => void
}

export const BasicParameters = ({
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
  evaluationStrategy,
  setEvaluationStrategy,
  saveStrategy,
  setSaveStrategy,
  randomSeed,
  setRandomSeed
}: BasicParametersProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Learning Rate</Label>
          <Input
            type="number"
            value={learningRate}
            onChange={(e) => setLearningRate(e.target.value)}
            placeholder="0.0001"
            step="0.0001"
          />
        </div>

        <div className="space-y-2">
          <Label>Batch Size</Label>
          <Input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            placeholder="32"
          />
        </div>

        <div className="space-y-2">
          <Label>Epochs</Label>
          <Input
            type="number"
            value={epochs}
            onChange={(e) => setEpochs(e.target.value)}
            placeholder="10"
          />
        </div>

        <div className="space-y-2">
          <Label>Warmup Steps</Label>
          <Input
            type="number"
            value={warmupSteps}
            onChange={(e) => setWarmupSteps(e.target.value)}
            placeholder="500"
          />
        </div>

        <div className="space-y-2">
          <Label>Weight Decay</Label>
          <Input
            type="number"
            value={weightDecay}
            onChange={(e) => setWeightDecay(e.target.value)}
            placeholder="0.01"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label>Optimizer</Label>
          <Select value={optimizer} onValueChange={setOptimizer}>
            <SelectTrigger>
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
          <Label>Scheduler</Label>
          <Select value={scheduler} onValueChange={setScheduler}>
            <SelectTrigger>
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
          <Label>Evaluation Strategy</Label>
          <Select value={evaluationStrategy} onValueChange={setEvaluationStrategy}>
            <SelectTrigger>
              <SelectValue placeholder="Select evaluation strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steps">Steps</SelectItem>
              <SelectItem value="epoch">Epoch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Save Strategy</Label>
          <Select value={saveStrategy} onValueChange={setSaveStrategy}>
            <SelectTrigger>
              <SelectValue placeholder="Select save strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steps">Steps</SelectItem>
              <SelectItem value="epoch">Epoch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Random Seed</Label>
          <Input
            type="number"
            value={randomSeed}
            onChange={(e) => setRandomSeed(e.target.value)}
            placeholder="42"
          />
        </div>
      </div>
    </div>
  )
}