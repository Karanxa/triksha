import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelect } from "@/components/llm-scanner/providers/ModelSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  datasetId: z.string().min(1, "Dataset is required"),
});

interface ModelFingerprintFormProps {
  onSessionCreated: (sessionId: string) => void;
}

export function ModelFingerprintForm({ onSessionCreated }: ModelFingerprintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      provider: "",
      model: "",
      datasetId: "",
    },
  });

  const { data: datasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ['user-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('model_fingerprint_sessions')
        .insert({
          name: values.name,
          provider: values.provider,
          model: values.model,
          dataset_id: values.datasetId,
          status: 'pending',
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Fingerprinting session created");
      onSessionCreated(data.id);
    } catch (error: any) {
      toast.error("Failed to create session: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Session Name</Label>
          <input
            {...form.register("name")}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter session name"
          />
        </div>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={selectedProvider}
            onValueChange={(value) => {
              setSelectedProvider(value);
              form.setValue("provider", value);
              form.setValue("model", "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
              <SelectItem value="ollama">Ollama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedProvider && (
          <ModelSelect
            name="model"
            label="Model"
            placeholder="Select a model"
            provider={selectedProvider}
          />
        )}

        <div className="space-y-2">
          <Label>Dataset</Label>
          <Select
            value={form.watch("datasetId")}
            onValueChange={(value) => form.setValue("datasetId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a dataset" />
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Start Fingerprinting"}
        </Button>
      </form>
    </Form>
  );
}