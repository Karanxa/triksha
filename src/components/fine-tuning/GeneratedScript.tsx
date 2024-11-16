import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface GeneratedScriptProps {
  baseModel: string;
  datasetType: string;
  taskType: string;
  parameters: {
    learningRate: string;
    epochs: string;
    batchSize: string;
    warmupSteps: string;
    maxSteps: string;
    weightDecay: string;
    optimizer: string;
    scheduler: string;
    evaluationStrategy: string;
    saveStrategy: string;
    randomSeed: string;
    mixedPrecision: string;
    gradAccumSteps: string;
    maxGradNorm: string;
    useDeepSpeed: boolean;
    enableGradientCheckpointing: boolean;
    useFlashAttention: boolean;
    useMemoryEfficientAttention: boolean;
    useTritronKernels: boolean;
    optimizeMemoryUsage: boolean;
    useActivationCheckpointing: boolean;
    useFSDP: boolean;
    enableParallelTraining: boolean;
  };
}

export const GeneratedScript = ({ baseModel, datasetType, taskType, parameters }: GeneratedScriptProps) => {
  const generatePythonScript = () => {
    const script = `
import torch
from transformers import Trainer, TrainingArguments, AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

# Model and tokenizer setup
model_name = "${baseModel}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Dataset preparation
dataset_type = "${datasetType}"
task_type = "${taskType}"

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=${parameters.learningRate},
    num_train_epochs=${parameters.epochs},
    per_device_train_batch_size=${parameters.batchSize},
    warmup_steps=${parameters.warmupSteps},
    max_steps=${parameters.maxSteps},
    weight_decay=${parameters.weightDecay},
    optim="${parameters.optimizer}",
    lr_scheduler_type="${parameters.scheduler}",
    evaluation_strategy="${parameters.evaluationStrategy}",
    save_strategy="${parameters.saveStrategy}",
    seed=${parameters.randomSeed},
    fp16=${parameters.mixedPrecision === "fp16"},
    gradient_accumulation_steps=${parameters.gradAccumSteps},
    max_grad_norm=${parameters.maxGradNorm},
    ${parameters.useDeepSpeed ? 'deepspeed="ds_config.json",' : ''}
    gradient_checkpointing=${parameters.enableGradientCheckpointing},
    ${parameters.useFSDP ? 'fsdp="full_shard",' : ''}
)

# Initialize trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)

# Start training
trainer.train()
`;

    return script;
  };

  const handleDownload = () => {
    try {
      const script = generatePythonScript();
      const blob = new Blob([script], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fine_tuning_script.py';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Script downloaded successfully");
    } catch (error) {
      toast.error("Failed to download script");
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Generated Fine-tuning Script
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Script
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          {generatePythonScript()}
        </pre>
      </CardContent>
    </Card>
  );
};