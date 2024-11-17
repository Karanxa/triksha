import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      model,
      taskType,
      datasetType,
      basicParams,
      advancedParams,
      userId
    } = await req.json()

    // Generate Python script based on parameters
    const script = generatePythonScript(
      model,
      taskType,
      datasetType,
      basicParams,
      advancedParams
    )

    // Store job in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: jobError } = await supabase
      .from('fine_tuning_jobs')
      .insert({
        user_id: userId,
        model,
        status: 'pending',
        parameters: {
          taskType,
          datasetType,
          basicParams,
          advancedParams
        }
      })

    if (jobError) throw jobError

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
    console.error('Error in generate-finetuning-script:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
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
  datasetType: string,
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
    gradient_accumulation_steps=${advancedParams.sft.gradientAccumulation},
    fp16=${advancedParams.sft.mixedPrecision},
    gradient_checkpointing=${advancedParams.sft.gradientCheckpointing},
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