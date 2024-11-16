import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

interface GarakConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const GarakConfig = ({ config, onChange }: GarakConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced">
        <AccordionTrigger>Advanced Configuration</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="parallel">Run Tests in Parallel</Label>
              <Switch
                id="parallel"
                checked={config.parallel ?? false}
                onCheckedChange={(checked) => updateConfig('parallel', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchSize">Batch Size</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="batchSize"
                  min={1}
                  max={100}
                  step={1}
                  value={[config.batchSize ?? 10]}
                  onValueChange={([value]) => updateConfig('batchSize', value)}
                  className="flex-1"
                />
                <span className="w-12 text-right">{config.batchSize ?? 10}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Number of prompts to process in each batch
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="rateLimit"
                  min={1}
                  max={100}
                  step={1}
                  value={[config.rateLimit ?? 30]}
                  onValueChange={([value]) => updateConfig('rateLimit', value)}
                  className="flex-1"
                />
                <span className="w-12 text-right">{config.rateLimit ?? 30}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Maximum requests per minute to prevent rate limiting
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                min="0"
                max="5"
                value={config.maxRetries ?? 3}
                onChange={(e) => updateConfig('maxRetries', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="10"
                max="300"
                value={config.timeout ?? 60}
                onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};