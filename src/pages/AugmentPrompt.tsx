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
import { supabase } from "@/integrations/supabase/client";

const AugmentPrompt = () => {
  const [prompts, setPrompts] = useState("");
  const [keyword, setKeyword] = useState("");
  const [provider, setProvider] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{ original: string; augmented?: string; error?: string }>>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].toLowerCase().split(",");
      const promptIndex = headers.indexOf("prompts");

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts' column");
        return;
      }

      const promptsList = lines
        .slice(1)
        .map(line => line.split(",")[promptIndex])
        .filter(Boolean)
        .join("\n");

      setPrompts(promptsList);
      toast.success("CSV file uploaded successfully");
    };
    reader.readAsText(file);
  };

  const handleAugment = async () => {
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

    setIsLoading(true);
    try {
      const promptsList = prompts.split("\n").filter(Boolean);

      const { data, error } = await supabase.functions.invoke('augment-prompt', {
        body: {
          prompts: promptsList,
          keyword,
          provider
        }
      });

      if (error) throw error;

      setResults(data.results);
      toast.success("Prompts augmented successfully");
    } catch (error) {
      console.error('Error augmenting prompts:', error);
      toast.error(error.message || "Failed to augment prompts");
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
          >
            {isLoading ? "Augmenting Prompts..." : "Augment Prompts"}
          </Button>

          {results.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold">Results</h2>
              {results.map((result, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="mb-2">
                    <h3 className="font-medium">Original Prompt:</h3>
                    <p className="text-muted-foreground">{result.original}</p>
                  </div>
                  {result.augmented ? (
                    <div>
                      <h3 className="font-medium">Augmented Prompt:</h3>
                      <p className="text-muted-foreground">{result.augmented}</p>
                    </div>
                  ) : (
                    <p className="text-red-500">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AugmentPrompt;