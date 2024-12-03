import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useSession } from "@supabase/auth-helpers-react"
import { CreateDatasetForm } from "./CreateDatasetForm"

export const CreateDataset = () => {
  const session = useSession()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (formData: {
    name: string;
    description: string;
    basePrompt: string;
    numSamples: string;
    method: string;
    recipe: string;
    targetModel: string;
    adversarialConfig: any;
  }) => {
    if (!session?.user?.id) {
      toast.error("Please log in to generate datasets");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-dataset', {
        body: {
          name: formData.name,
          description: formData.description,
          basePrompt: formData.method === "manual" ? formData.basePrompt : undefined,
          numSamples: parseInt(formData.numSamples),
          method: formData.method,
          recipe: formData.recipe,
          targetModel: formData.targetModel,
          adversarialConfig: formData.method === "adversarial" ? formData.adversarialConfig : undefined,
        }
      });

      if (error) throw error;

      toast.success("Dataset generated successfully");
    } catch (error: any) {
      console.error('Error generating dataset:', error);
      toast.error(error.message || "Failed to generate dataset");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Dataset</CardTitle>
        <CardDescription>
          Generate adversarial datasets using manual input, EasyJailbreak recipes, or advanced adversarial techniques
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateDatasetForm 
          onSubmit={handleGenerate}
          isGenerating={isGenerating}
        />
      </CardContent>
    </Card>
  );
};