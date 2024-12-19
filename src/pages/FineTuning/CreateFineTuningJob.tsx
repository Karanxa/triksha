import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ModelSelect } from "./components/ModelSelect";
import { DatasetSelect } from "./components/DatasetSelect";
import { BasicParameters } from "./components/BasicParameters";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

export const CreateFineTuningJob = () => {
  const { toast } = useToast();
  const session = useSession();
  
  const [model, setModel] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic training parameters
  const [learningRate, setLearningRate] = useState("0.0001");
  const [batchSize, setBatchSize] = useState("32");
  const [epochs, setEpochs] = useState("3");
  const [optimizer, setOptimizer] = useState("adamw");

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create fine-tuning jobs"
      });
      return;
    }

    if (!model || !datasetId) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please select a model and dataset"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('fine_tuning_jobs')
        .insert({
          user_id: session.user.id,
          model,
          dataset_id: datasetId,
          parameters: {
            learning_rate: parseFloat(learningRate),
            batch_size: parseInt(batchSize),
            epochs: parseInt(epochs),
            optimizer
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine-tuning job created successfully"
      });

      // Reset form
      setModel("");
      setDatasetId("");
      setLearningRate("0.0001");
      setBatchSize("32");
      setEpochs("3");
      setOptimizer("adamw");
    } catch (error: any) {
      console.error('Error creating fine-tuning job:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ModelSelect 
        value={model}
        onValueChange={setModel}
      />

      <DatasetSelect
        value={datasetId}
        onValueChange={setDatasetId}
      />

      <BasicParameters
        learningRate={learningRate}
        setLearningRate={setLearningRate}
        batchSize={batchSize}
        setBatchSize={setBatchSize}
        epochs={epochs}
        setEpochs={setEpochs}
        optimizer={optimizer}
        setOptimizer={setOptimizer}
      />

      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Creating..." : "Create Fine-tuning Job"}
      </Button>
    </div>
  );
};