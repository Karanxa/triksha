import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "./FileUpload";
import { ModelSelectionGrid } from "./ModelSelectionGrid";
import { FuzzingControls } from "./FuzzingControls";
import { TestSelector } from "./TestSelector";
import { supabase } from "@/integrations/supabase/client";

export const PromptFuzzingForm = () => {
  const [name, setName] = useState("");
  const [scanMode, setScanMode] = useState<"batch" | "custom" | "subset">("batch");
  const [config, setConfig] = useState({
    attack_provider: "openai",
    attack_model: "gpt-4",
    target_provider: "openai",
    target_model: "gpt-4",
    num_attempts: 3,
    num_threads: 4,
    attack_temperature: 0.6,
    custom_benchmark: null as File | null,
    system_prompt_file: null as File | null,
  });
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      toast.error("You must be logged in to create a scan");
      return;
    }

    if (!name) {
      toast.error("Please provide a scan name");
      return;
    }

    if (!config.system_prompt_file) {
      toast.error("Please upload a system prompt file");
      return;
    }

    if (scanMode === "custom" && !config.custom_benchmark) {
      toast.error("Please upload a custom benchmark file");
      return;
    }

    if (scanMode === "subset" && selectedTests.length === 0) {
      toast.error("Please select at least one test to run");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("scanMode", scanMode);
      formData.append("config", JSON.stringify(config));
      formData.append("selectedTests", JSON.stringify(selectedTests));
      
      if (config.system_prompt_file) {
        formData.append("systemPromptFile", config.system_prompt_file);
      }
      if (config.custom_benchmark) {
        formData.append("customBenchmark", config.custom_benchmark);
      }

      const { data: scan, error } = await supabase.functions.invoke('run-prompt-fuzzer', {
        body: formData
      });

      if (error) throw error;

      toast.success("Prompt fuzzing scan started successfully");
      setName("");
      setConfig({
        ...config,
        custom_benchmark: null,
        system_prompt_file: null,
      });
      setSelectedTests([]);
    } catch (error) {
      console.error("Error creating prompt fuzzing scan:", error);
      toast.error("Failed to create prompt fuzzing scan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto px-4">
      <div className="space-y-3">
        <Label className="text-base">Scan Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter scan name"
          className="w-full"
          required
        />
      </div>

      <Tabs value={scanMode} onValueChange={(value: "batch" | "custom" | "subset") => setScanMode(value)}>
        <TabsList className="w-full grid grid-cols-3 mb-6 p-1">
          <TabsTrigger 
            value="batch" 
            className="text-xs sm:text-sm whitespace-normal h-auto min-h-[40px] text-center"
          >
            Batch Mode
          </TabsTrigger>
          <TabsTrigger 
            value="custom" 
            className="text-xs sm:text-sm whitespace-normal h-auto min-h-[40px] text-center"
          >
            Custom Benchmark
          </TabsTrigger>
          <TabsTrigger 
            value="subset" 
            className="text-xs sm:text-sm whitespace-normal h-auto min-h-[40px] text-center"
          >
            Subset Tests
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label className="text-base">System Prompt File</Label>
            <FileUpload
              file={config.system_prompt_file}
              onFileSelect={(file) => setConfig(prev => ({ ...prev, system_prompt_file: file }))}
              accept=".txt"
            />
          </div>

          <TabsContent value="custom" className="mt-6">
            <div className="space-y-3">
              <Label className="text-base">Custom Benchmark File</Label>
              <FileUpload
                file={config.custom_benchmark}
                onFileSelect={(file) => setConfig(prev => ({ ...prev, custom_benchmark: file }))}
                accept=".csv"
              />
            </div>
          </TabsContent>

          <TabsContent value="subset" className="mt-6">
            <TestSelector
              selectedTests={selectedTests}
              setSelectedTests={setSelectedTests}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      <ModelSelectionGrid config={config} setConfig={setConfig} />
      
      <FuzzingControls config={config} setConfig={setConfig} />

      <Button type="submit" className="w-full mt-6" disabled={isLoading}>
        {isLoading ? "Creating Scan..." : "Create Fuzzing Scan"}
      </Button>
    </form>
  );
};
