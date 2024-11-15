import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

const LLMScanner = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">LLM Scanner</h1>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <Label>Select Provider</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Single Prompt</Label>
            <Textarea 
              placeholder="Enter your prompt for scanning"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <Label>Or Upload CSV with Prompts</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                CSV must have a "prompts" column
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Attack Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an attack category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
                <SelectItem value="data-extraction">Data Extraction</SelectItem>
                <SelectItem value="prompt-leaking">Prompt Leaking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Scan Label (Optional)</Label>
            <Input placeholder="Enter a label for this scan" />
            <p className="text-sm text-muted-foreground">
              If provided, all prompts in this scan will be tagged with this label
            </p>
          </div>

          <div className="space-y-4">
            <Label>Schedule (cron expression)</Label>
            <Input placeholder="/5 * * * *" />
            <p className="text-sm text-muted-foreground">
              Enter a cron expression (e.g., "/5 * * * *" for every 5 minutes)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="recurring" />
            <Label htmlFor="recurring">Recurring scan</Label>
          </div>

          <div className="space-y-4">
            <Button className="w-full" size="lg">
              Start LLM Scan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMScanner;