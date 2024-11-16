import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const FineTuning = () => {
  const [modelName, setModelName] = useState("");
  const [trainingData, setTrainingData] = useState("");
  const [epochs, setEpochs] = useState("10");
  const [isTraining, setIsTraining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName || !trainingData) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsTraining(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Model fine-tuning started successfully");
    } catch (error) {
      toast.error("Failed to start fine-tuning process");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-2">Fine Tuning</h1>
        <p className="text-muted-foreground mb-8">Customize and optimize your LLM models for enhanced security testing capabilities</p>

        <div className="max-w-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Enter model name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-data">Training Data</Label>
              <Textarea
                id="training-data"
                value={trainingData}
                onChange={(e) => setTrainingData(e.target.value)}
                placeholder="Enter or paste training data"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="epochs">Number of Epochs</Label>
              <Input
                id="epochs"
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            <Button type="submit" disabled={isTraining} className="w-full">
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training in Progress...
                </>
              ) : (
                "Start Fine-tuning"
              )}
            </Button>
          </form>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Fine-tuning Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Ensure your training data is clean and well-formatted</li>
              <li>Start with a small number of epochs and adjust as needed</li>
              <li>Monitor the training process for potential overfitting</li>
              <li>Use a validation set to evaluate model performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FineTuning;
