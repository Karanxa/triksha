import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const AugmentPrompt = () => {
  const [prompts, setPrompts] = useState("");
  const [keyword, setKeyword] = useState("");
  const [provider, setProvider] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPrompts(text);
        toast.success("CSV file uploaded successfully");
      };
      reader.readAsText(file);
    }
  };

  const handleAugment = () => {
    if (!provider) {
      toast.error("Please select a provider");
      return;
    }
    if (!prompts) {
      toast.error("Please enter prompts or upload a CSV file");
      return;
    }
    if (!keyword) {
      toast.error("Please enter a keyword for augmentation");
      return;
    }
    toast.success("Prompts augmented successfully");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Augment Prompts</h1>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select AI Provider
            </label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Upload CSV</label>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload CSV
              </Button>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with a 'prompts' column
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter prompts, one per line
            </label>
            <Textarea
              value={prompts}
              onChange={(e) => setPrompts(e.target.value)}
              placeholder="Enter prompts, one per line..."
              className="min-h-[200px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter keyword for augmentation
            </label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., ecommerce, banking"
              className="mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Keywords help contextualize the prompts for better results
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleAugment}
          >
            Augment Prompts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AugmentPrompt;