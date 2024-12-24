import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProviderSelect from "@/components/augment-prompt/ProviderSelect";
import FileUpload from "@/components/augment-prompt/FileUpload";
import Results from "@/components/augment-prompt/Results";

interface Result {
  original: string;
  augmented?: string;
  response?: string;
  error?: string;
}

const AugmentPrompt = () => {
  const [prompts, setPrompts] = useState("");
  const [keyword, setKeyword] = useState("");
  const [provider, setProvider] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

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
        <h1 className="text-3xl font-bold mb-2">Augmentation</h1>
        <p className="text-muted-foreground mb-8">Generate variations of prompts to enhance your testing coverage.</p>
        
        <div className="space-y-6">
          <ProviderSelect value={provider} onValueChange={setProvider} />
          <FileUpload onFileUpload={setPrompts} />

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

          <Results results={results} />
        </div>
      </div>
    </div>
  );
};

export default AugmentPrompt;