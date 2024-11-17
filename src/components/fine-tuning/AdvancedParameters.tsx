import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdvancedParametersProps {
  params: {
    lora: {
      rank: string
      alpha: string
      dropout: string
      targetModules: string[]
      biasHandling: string
      scalingRank: string
      moduleMapping: string
      fanOutScaling: boolean
      reparameterization: string
      rankAlphaPatterns: string
      taskType: string
    }
    qlora: {
      quantizationBits: string
      groupSize: string
      doubleQuantization: boolean
      quantizationMethod: string
      nesterovOptimization: boolean
      pagedOptimization: boolean
      fastTokenizer: boolean
      blockSize: string
      targetModules: string[]
      dataType: string
    }
    sft: {
      deepSpeedEnabled: boolean
      gradientCheckpointing: boolean
      mixedPrecision: boolean
      flashAttention: boolean
      xFormersOptimization: boolean
      tritonKernels: boolean
      gradientAccumulation: string
      memoryOptimization: boolean
      activationCheckpointing: boolean
      fsdpEnabled: boolean
      parallelTraining: boolean
    }
  }
  onChange: (params: any) => void
}

export const AdvancedParameters = ({ params, onChange }: AdvancedParametersProps) => {
  const handleLoraChange = (key: string, value: any) => {
    onChange({
      ...params,
      lora: { ...params.lora, [key]: value }
    })
  }

  const handleQLoraChange = (key: string, value: any) => {
    onChange({
      ...params,
      qlora: { ...params.qlora, [key]: value }
    })
  }

  const handleSFTChange = (key: string, value: any) => {
    onChange({
      ...params,
      sft: { ...params.sft, [key]: value }
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Advanced Parameters</h3>

      <Tabs defaultValue="lora">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lora">LoRA</TabsTrigger>
          <TabsTrigger value="qlora">QLoRA</TabsTrigger>
          <TabsTrigger value="sft">SFT</TabsTrigger>
        </TabsList>

        <TabsContent value="lora" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rank</Label>
              <Input
                type="number"
                value={params.lora.rank}
                onChange={(e) => handleLoraChange("rank", e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Alpha</Label>
              <Input
                type="number"
                value={params.lora.alpha}
                onChange={(e) => handleLoraChange("alpha", e.target.value)}
                min="0"
              />
            </div>

            {/* Add remaining LoRA parameters */}
          </div>
        </TabsContent>

        <TabsContent value="qlora" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantization Bits</Label>
              <Input
                type="number"
                value={params.qlora.quantizationBits}
                onChange={(e) => handleQLoraChange("quantizationBits", e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Group Size</Label>
              <Input
                type="number"
                value={params.qlora.groupSize}
                onChange={(e) => handleQLoraChange("groupSize", e.target.value)}
                min="1"
              />
            </div>

            {/* Add remaining QLoRA parameters */}
          </div>
        </TabsContent>

        <TabsContent value="sft" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DeepSpeed</Label>
              <Switch
                checked={params.sft.deepSpeedEnabled}
                onCheckedChange={(checked) => handleSFTChange("deepSpeedEnabled", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Gradient Checkpointing</Label>
              <Switch
                checked={params.sft.gradientCheckpointing}
                onCheckedChange={(checked) => handleSFTChange("gradientCheckpointing", checked)}
              />
            </div>

            {/* Add remaining SFT parameters */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}