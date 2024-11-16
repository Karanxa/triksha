import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="parallel">Run Tests in Parallel</Label>
              <Switch
                id="parallel"
                checked={config.parallel ?? false}
                onCheckedChange={(checked) => updateConfig('parallel', checked)}
              />
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