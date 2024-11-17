import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface BasicParametersProps {
  params: {
    learningRate: string
    batchSize: string
    epochs: string
    warmupSteps: string
    weightDecay: string
    optimizer: string
    scheduler: string
    gradientClipping: string
    earlyStoppingEnabled: boolean
    validationSplit: string
    dropoutRate: string
    randomSeed: string
    maxSteps: string
    evaluationStrategy: string
    loggingSteps: string
    saveStrategy: string
  }
  onChange: (params: any) => void
}

export const BasicParameters = ({ params, onChange }: BasicParametersProps) => {
  const handleChange = (key: string, value: string | boolean) => {
    onChange({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Basic Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Learning Rate</Label>
          <Input
            type="number"
            value={params.learningRate}
            onChange={(e) => handleChange("learningRate", e.target.value)}
            step="0.0001"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label>Batch Size</Label>
          <Input
            type="number"
            value={params.batchSize}
            onChange={(e) => handleChange("batchSize", e.target.value)}
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label>Epochs</Label>
          <Input
            type="number"
            value={params.epochs}
            onChange={(e) => handleChange("epochs", e.target.value)}
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label>Warmup Steps</Label>
          <Input
            type="number"
            value={params.warmupSteps}
            onChange={(e) => handleChange("warmupSteps", e.target.value)}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label>Weight Decay</Label>
          <Input
            type="number"
            value={params.weightDecay}
            onChange={(e) => handleChange("weightDecay", e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label>Optimizer</Label>
          <Select 
            value={params.optimizer}
            onValueChange={(value) => handleChange("optimizer", value)}
          >
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
          <Select 
            value={params.scheduler}
            onValueChange={(value) => handleChange("scheduler", value)}
          >
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
          <Label>Early Stopping</Label>
          <Switch
            checked={params.earlyStoppingEnabled}
            onCheckedChange={(checked) => handleChange("earlyStoppingEnabled", checked)}
          />
        </div>

        {/* Add remaining basic parameters */}
        <div className="space-y-2">
          <Label>Validation Split</Label>
          <Input
            type="number"
            value={params.validationSplit}
            onChange={(e) => handleChange("validationSplit", e.target.value)}
            step="0.1"
            min="0"
            max="1"
          />
        </div>

        <div className="space-y-2">
          <Label>Dropout Rate</Label>
          <Input
            type="number"
            value={params.dropoutRate}
            onChange={(e) => handleChange("dropoutRate", e.target.value)}
            step="0.1"
            min="0"
            max="1"
          />
        </div>

        <div className="space-y-2">
          <Label>Random Seed</Label>
          <Input
            type="number"
            value={params.randomSeed}
            onChange={(e) => handleChange("randomSeed", e.target.value)}
            min="0"
          />
        </div>
      </div>
    </div>
  )
}