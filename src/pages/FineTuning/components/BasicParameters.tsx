import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicParametersProps {
  learningRate: string;
  setLearningRate: (value: string) => void;
  batchSize: string;
  setBatchSize: (value: string) => void;
  epochs: string;
  setEpochs: (value: string) => void;
  optimizer: string;
  setOptimizer: (value: string) => void;
}

export const BasicParameters = ({
  learningRate,
  setLearningRate,
  batchSize,
  setBatchSize,
  epochs,
  setEpochs,
  optimizer,
  setOptimizer,
}: BasicParametersProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Training Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};