import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ModelSelect } from "./components/ModelSelect";
import { DatasetSelect } from "./components/DatasetSelect";
import { BasicParameters } from "./components/BasicParameters";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const CreateFineTuningJob = () => {
  const { toast } = useToast();
  const session = useSession();
  const navigate = useNavigate();
  
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

      // Navigate to job history
      navigate("/fine-tuning?tab=history");
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
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Create Fine-tuning Job</h2>
          <p className="text-sm text-muted-foreground">
            Select a model and dataset to begin fine-tuning. Make sure you have uploaded your training data first.
          </p>
        </div>

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
          disabled={isSubmitting || !model || !datasetId}
          className="w-full"
        >
          {isSubmitting ? "Creating..." : "Create Fine-tuning Job"}
        </Button>

        {!datasetId && (
          <p className="text-sm text-muted-foreground text-center">
            No dataset selected. You can{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal"
              onClick={() => navigate("/datasets")}
            >
              create or upload a dataset
            </Button>{" "}
            first.
          </p>
        )}
      </div>
    </Card>
  );
};