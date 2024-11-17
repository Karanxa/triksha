import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { model, taskType, basicParams, advancedParams } = await req.json()

    // Generate Python script based on parameters
    const script = generatePythonScript(model, taskType, basicParams, advancedParams)

    return new Response(
      JSON.stringify({ script }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

function generatePythonScript(
  model: string,
  taskType: string,
  basicParams: any,
  advancedParams: any
) {
  return `
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
from datasets import load_dataset
import os

# Model configuration
model_name = "${model}"
task_type = "${taskType}"

# Training parameters
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=${basicParams.epochs},
    per_device_train_batch_size=${basicParams.batchSize},
    learning_rate=${basicParams.learningRate},
    warmup_steps=${basicParams.warmupSteps},
    weight_decay=${basicParams.weightDecay},
    optimizer="${basicParams.optimizer}",
    lr_scheduler_type="${basicParams.scheduler}",
    evaluation_strategy="${basicParams.evaluationStrategy}",
    save_strategy="${basicParams.saveStrategy}",
    seed=${basicParams.randomSeed},
    fp16=${advancedParams.precision === 'fp16'},
    gradient_accumulation_steps=${advancedParams.gradientAccumulation},
    max_grad_norm=${advancedParams.maxGradNorm},
    ${advancedParams.memoryOptimization ? 'gradient_checkpointing=True,' : ''}
    ${advancedParams.hardwareAcceleration ? 'use_cuda=True,' : ''}
)

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Load and preprocess dataset
dataset = load_dataset("text", data_files={"train": "train.txt"})

def preprocess_function(examples):
    return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=512)

tokenized_dataset = dataset.map(preprocess_function, batched=True)

# Initialize trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
)

# Start training
trainer.train()

# Save the model
trainer.save_model("./fine_tuned_model")
`
}