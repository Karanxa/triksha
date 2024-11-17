import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AdvancedParametersProps {
  precision: string
  setPrecision: (value: string) => void
  gradientAccumulation: string
  setGradientAccumulation: (value: string) => void
  maxGradNorm: string
  setMaxGradNorm: (value: string) => void
  memoryOptimization: boolean
  setMemoryOptimization: (value: boolean) => void
  hardwareAcceleration: boolean
  setHardwareAcceleration: (value: boolean) => void
}

export const AdvancedParameters = ({
  precision,
  setPrecision,
  gradientAccumulation,
  setGradientAccumulation,
  maxGradNorm,
  setMaxGradNorm,
  memoryOptimization,
  setMemoryOptimization,
  hardwareAcceleration,
  setHardwareAcceleration
}: AdvancedParametersProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Advanced Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Precision</Label>
          <Select value={precision} onValueChange={setPrecision}>
            <SelectTrigger>
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
          <Label>Gradient Accumulation Steps</Label>
          <Input
            type="number"
            value={gradientAccumulation}
            onChange={(e) => setGradientAccumulation(e.target.value)}
            placeholder="1"
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label>Max Gradient Norm</Label>
          <Input
            type="number"
            value={maxGradNorm}
            onChange={(e) => setMaxGradNorm(e.target.value)}
            placeholder="1.0"
            step="0.1"
          />
        </div>

        <div className="space-y-2">
          <Label>Memory Optimization</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={memoryOptimization}
              onCheckedChange={setMemoryOptimization}
            />
            <span className="text-sm text-muted-foreground">
              Enable memory optimization techniques
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Hardware Acceleration</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={hardwareAcceleration}
              onCheckedChange={setHardwareAcceleration}
            />
            <span className="text-sm text-muted-foreground">
              Enable hardware acceleration when available
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}