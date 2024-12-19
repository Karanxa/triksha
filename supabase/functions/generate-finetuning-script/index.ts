import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { model, datasetId, userId, basicParams, advancedParams } = await req.json()
    console.log('Received request:', { model, datasetId, basicParams, advancedParams })

    // Validate required parameters
    if (!model || !datasetId || !basicParams || !advancedParams) {
      throw new Error('Missing required parameters')
    }

    // Validate specific parameters
    if (!basicParams.learningRate || !basicParams.batchSize || !basicParams.epochs) {
      throw new Error('Missing required basic parameters')
    }

    if (!advancedParams.precision || !advancedParams.gradientAccumulation) {
      throw new Error('Missing required advanced parameters')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate the Python script
    const script = generateTrainingScript(model, basicParams, advancedParams)

    // Store the generated script in the database
    const { error: dbError } = await supabase
      .from('fine_tuning_jobs')
      .insert({
        user_id: userId,
        model,
        dataset_id: datasetId,
        parameters: basicParams,
        advanced_parameters: advancedParams,
        script_content: script,
        status: 'pending'
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ script }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in generate-finetuning-script:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateTrainingScript(
  model: string,
  basicParams: any,
  advancedParams: any
): string {
  return `
# Fine-tuning script for ${model}
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset
import wandb

# Initialize wandb
wandb.init(project="llm-finetuning", name="${model}-finetuning")

# Model configuration
model_name = "${model}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=${advancedParams.precision === 'fp16' ? 'torch.float16' : 'torch.float32'}
)

# Training configuration
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=${basicParams.epochs},
    per_device_train_batch_size=${basicParams.batchSize},
    learning_rate=${basicParams.learningRate},
    warmup_steps=${basicParams.warmupSteps},
    weight_decay=${basicParams.weightDecay},
    logging_steps=100,
    save_strategy="${basicParams.saveStrategy}",
    evaluation_strategy="${basicParams.evaluationStrategy}",
    gradient_accumulation_steps=${advancedParams.gradientAccumulation},
    fp16=${advancedParams.precision === 'fp16'},
    optim="${basicParams.optimizer}",
    lr_scheduler_type="${basicParams.scheduler}",
    max_steps=${basicParams.maxSteps},
    seed=${basicParams.randomSeed},
    ${advancedParams.useDeepSpeed ? 'deepspeed="ds_config.json",' : ''}
    report_to="wandb"
)

# Load and preprocess dataset
def prepare_dataset():
    dataset = load_dataset("text", data_files={"train": "train.txt"})
    
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            padding="max_length",
            max_length=512
        )
    
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names
    )
    
    return tokenized_dataset

# Initialize trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=prepare_dataset()["train"],
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

# Start training
trainer.train()

# Save the model
trainer.save_model("./fine_tuned_model")
wandb.finish()
`
}