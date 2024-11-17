import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface AdvancedParametersProps {
  precision: string;
  setPrecision: (value: string) => void;
  gradientAccumulation: string;
  setGradientAccumulation: (value: string) => void;
  useDeepSpeed: boolean;
  setUseDeepSpeed: (value: boolean) => void;
  useFlashAttention: boolean;
  setUseFlashAttention: (value: boolean) => void;
  useMemoryOptimization: boolean;
  setUseMemoryOptimization: (value: boolean) => void;
  hardwareAcceleration: string;
  setHardwareAcceleration: (value: string) => void;
}

export const AdvancedParameters: React.FC<AdvancedParametersProps> = ({
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
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="precision">Mixed Precision</Label>
          <Select value={precision} onValueChange={setPrecision}>
            <SelectTrigger id="precision">
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
          <Label htmlFor="gradient-accumulation">Gradient Accumulation Steps</Label>
          <Input
            id="gradient-accumulation"
            type="number"
            value={gradientAccumulation}
            onChange={(e) => setGradientAccumulation(e.target.value)}
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hardware-acceleration">Hardware Acceleration</Label>
          <Select value={hardwareAcceleration} onValueChange={setHardwareAcceleration}>
            <SelectTrigger id="hardware-acceleration">
              <SelectValue placeholder="Select acceleration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cuda">CUDA</SelectItem>
              <SelectItem value="cpu">CPU</SelectItem>
              <SelectItem value="mps">MPS</SelectItem>
            </SelectContent>
          </Select>
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
            id="use-flash-attention"
            checked={useFlashAttention}
            onCheckedChange={setUseFlashAttention}
          />
          <Label htmlFor="use-flash-attention">Use Flash Attention</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="use-memory-optimization"
            checked={useMemoryOptimization}
            onCheckedChange={setUseMemoryOptimization}
          />
          <Label htmlFor="use-memory-optimization">Use Memory Optimization</Label>
        </div>
      </div>
    </div>
  );
};