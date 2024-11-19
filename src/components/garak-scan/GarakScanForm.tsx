import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const TEST_SUITES = [
  { id: "encoding", label: "Encoding Tests", description: "Tests for various encoding and decoding attacks" },
  { id: "injection", label: "Injection Tests", description: "Tests for prompt injection vulnerabilities" },
  { id: "xss", label: "XSS Tests", description: "Tests for cross-site scripting style attacks" },
  { id: "prompt_leaking", label: "Prompt Leaking Tests", description: "Tests for extracting system prompts" },
  { id: "system_prompt", label: "System Prompt Tests", description: "Tests targeting system prompt manipulation" },
  { id: "data_extraction", label: "Data Extraction Tests", description: "Tests for unauthorized data extraction" },
  { id: "ban_completion", label: "Ban Completion Tests", description: "Tests for completing banned words/phrases" },
  { id: "code_execution", label: "Code Execution Tests", description: "Tests for arbitrary code execution attempts" },
  { id: "dos", label: "DoS Tests", description: "Tests for denial of service attempts" },
  { id: "info_disclosure", label: "Information Disclosure", description: "Tests for sensitive information leaks" },
  { id: "auth_bypass", label: "Authentication Bypass", description: "Tests for bypassing authentication" },
  { id: "string_match", label: "String Matching", description: "Basic string pattern matching tests" },
  { id: "regex_match", label: "Regex Matching", description: "Regular expression pattern matching" },
  { id: "yaml_match", label: "YAML Matching", description: "YAML-based pattern matching tests" },
  { id: "json_match", label: "JSON Matching", description: "JSON structure validation tests" }
];

const MODEL_CONFIGS = [
  { value: "huggingface/gpt2", label: "GPT-2" },
  { value: "huggingface/llama2", label: "Llama 2" },
  { value: "huggingface/mistral", label: "Mistral" },
  { value: "openai/gpt-4", label: "GPT-4" },
  { value: "anthropic/claude", label: "Claude" },
  { value: "google/gemini", label: "Gemini" },
  { value: "custom", label: "Custom Model" }
];

export const GarakScanForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [modelConfig, setModelConfig] = useState("");
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customModelConfig, setCustomModelConfig] = useState({
    type: "",
    name: "",
    endpoint: ""
  });
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !modelConfig || selectedSuites.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to create a scan");
      return;
    }

    setIsLoading(true);
    try {
      // Create scan record
      const { data: scanData, error: scanError } = await supabase
        .from('garak_scans')
        .insert({
          name,
          model: modelConfig === 'custom' ? `${customModelConfig.type}/${customModelConfig.name}` : modelConfig,
          prompts: [], // Garak generates its own test prompts
          test_suites: selectedSuites,
          user_id: session.user.id,
          status: 'pending',
          config: modelConfig === 'custom' ? {
            endpoint: customModelConfig.endpoint
          } : null
        })
        .select()
        .single();

      if (scanError) throw scanError;

      // Run Garak scan
      const response = await supabase.functions.invoke('run-garak-scan', {
        body: { 
          scanId: scanData.id,
          model: modelConfig === 'custom' ? `${customModelConfig.type}/${customModelConfig.name}` : modelConfig,
          test_suites: selectedSuites,
          config: modelConfig === 'custom' ? {
            endpoint: customModelConfig.endpoint
          } : null
        }
      });

      if (response.error) throw response.error;

      toast.success("Garak scan started successfully");
      navigate('/llm-results');
      
    } catch (error: any) {
      console.error("Error creating garak scan:", error);
      toast.error("Failed to create garak scan: " + error.message);
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
          placeholder="Enter a name for this scan"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Model Configuration</Label>
        <Select value={modelConfig} onValueChange={setModelConfig}>
          <SelectTrigger>
            <SelectValue placeholder="Select model configuration" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_CONFIGS.map((config) => (
              <SelectItem key={config.value} value={config.value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {modelConfig === 'custom' && (
        <div className="space-y-4">
          <div>
            <Label>Model Type</Label>
            <Select 
              value={customModelConfig.type} 
              onValueChange={(value) => setCustomModelConfig(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="huggingface">Hugging Face</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Model Name</Label>
            <Input
              value={customModelConfig.name}
              onChange={(e) => setCustomModelConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter model name"
            />
          </div>
          
          <div>
            <Label>API Endpoint (optional)</Label>
            <Input
              value={customModelConfig.endpoint}
              onChange={(e) => setCustomModelConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="Enter API endpoint"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Label>Test Suites</Label>
        <Card>
          <CardContent className="pt-6">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {TEST_SUITES.map((suite) => (
                  <div key={suite.id} className="flex items-start space-x-3">
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
                    <div className="space-y-1">
                      <Label htmlFor={suite.id} className="font-medium">
                        {suite.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {suite.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Scan..." : "Create Garak Scan"}
      </Button>
    </form>
  );
};