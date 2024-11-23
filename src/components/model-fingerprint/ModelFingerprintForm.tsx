import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ModelFingerprintSession } from "@/integrations/supabase/types/tables/model-fingerprint";

interface ModelFingerprintFormProps {
  onSessionCreated: (session: ModelFingerprintSession) => void;
}

export function ModelFingerprintForm({ onSessionCreated }: ModelFingerprintFormProps) {
  const [provider, setProvider] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [datasetId, setDatasetId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch datasets");
        return [];
      }
      return data;
    }
  });

  const handleSubmit = async () => {
    if (!provider || !model || !datasetId) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('model_fingerprint_sessions')
        .insert({
          user_id: userData.user.id,
          provider,
          model,
          dataset_id: datasetId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      onSessionCreated(data as ModelFingerprintSession);
      toast.success("Scan initiated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Provider</label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
              <SelectItem value="ollama">Ollama (Custom Endpoint)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {provider === 'openai' && (
                <>
                  <SelectItem value="gpt-4o">GPT-4 Opus</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4 Opus Mini</SelectItem>
                </>
              )}
              {provider === 'anthropic' && (
                <>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </>
              )}
              {provider === 'google' && (
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              )}
              {provider === 'ollama' && (
                <>
                  <SelectItem value="llama2">Llama 2</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                  <SelectItem value="codellama">Code Llama</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dataset</label>
          <Select value={datasetId} onValueChange={setDatasetId}>
            <SelectTrigger>
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets?.map((dataset) => (
                <SelectItem key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isLoading || !provider || !model || !datasetId}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initiating Scan...
            </>
          ) : (
            'Initiate Scan'
          )}
        </Button>
      </div>
    </Card>
  );
}