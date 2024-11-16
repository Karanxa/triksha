import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const GarakScanForm = () => {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testSuites = [
    { id: "encoding", label: "Encoding Tests" },
    { id: "injection", label: "Injection Tests" },
    { id: "xss", label: "XSS Tests" },
    { id: "prompt_leaking", label: "Prompt Leaking Tests" },
    { id: "system_prompt", label: "System Prompt Tests" },
    { id: "data_extraction", label: "Data Extraction Tests" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model || !prompt || selectedSuites.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("garak_scans").insert({
        name,
        model,
        prompts: [prompt],
        test_suites: selectedSuites,
      });

      if (error) throw error;
      toast.success("Garak scan created successfully");
      setName("");
      setModel("");
      setPrompt("");
      setSelectedSuites([]);
    } catch (error) {
      console.error("Error creating garak scan:", error);
      toast.error("Failed to create garak scan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Scan Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter scan name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Enter model name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">Test Prompt</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter test prompt"
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Test Suites</Label>
        <div className="grid grid-cols-2 gap-4">
          {testSuites.map((suite) => (
            <div key={suite.id} className="flex items-center space-x-2">
              <Checkbox
                id={suite.id}
                checked={selectedSuites.includes(suite.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSuites([...selectedSuites, suite.id]);
                  } else {
                    setSelectedSuites(selectedSuites.filter((id) => id !== suite.id));
                  }
                }}
              />
              <Label htmlFor={suite.id}>{suite.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Scan..." : "Create Garak Scan"}
      </Button>
    </form>
  );
};