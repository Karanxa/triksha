import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModelSelect } from "../providers/ModelSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

export const DynamicScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [responses, setResponses] = useState<Array<{ prompt: string; response: string }>>([]);
  const form = useForm({
    defaultValues: {
      model: "",
      initialPrompt: ""
    }
  });

  const startScan = async (values: { model: string; initialPrompt: string }) => {
    try {
      setIsScanning(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to perform scans");
        return;
      }

      // Create a new scan record
      const { data: scan, error: scanError } = await supabase
        .from('llm_scans')
        .insert({
          user_id: user.id,
          name: "Dynamic Scan",
          status: 'processing',
          scan_type: 'dynamic_scan',
          results: {
            initial_prompt: values.initialPrompt,
            model: values.model,
            responses: []
          }
        })
        .select()
        .single();

      if (scanError) throw scanError;

      // Start the dynamic scan process
      const { data, error } = await supabase.functions.invoke('dynamic-scan', {
        body: {
          scanId: scan.id,
          model: values.model,
          initialPrompt: values.initialPrompt
        }
      });

      if (error) throw error;

      setResponses(data.responses);
      toast.success("Dynamic scan completed successfully");

    } catch (error: any) {
      console.error("Dynamic scan error:", error);
      toast.error("Failed to complete dynamic scan: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Scan</CardTitle>
          <CardDescription>
            Start an adaptive scanning session that evolves based on the model's responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(startScan)} className="space-y-6">
            <div className="space-y-2">
              <ModelSelect
                name="model"
                label="Model"
                placeholder="Select a model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialPrompt">Initial Prompt</Label>
              <Textarea
                id="initialPrompt"
                placeholder="Enter your initial prompt..."
                className="min-h-[100px]"
                {...form.register("initialPrompt", { required: true })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Scan...
                </>
              ) : (
                "Start Dynamic Scan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {responses.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="font-medium">Prompt {index + 1}:</div>
                    <div className="bg-muted p-3 rounded-md">{item.prompt}</div>
                    <div className="font-medium">Response:</div>
                    <div className="bg-muted p-3 rounded-md">{item.response}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};