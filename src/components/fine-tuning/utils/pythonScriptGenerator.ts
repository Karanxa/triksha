import { GenerateScriptParams } from './scriptGeneratorTypes';

export const generatePythonScript = ({ model, datasetId, taskType, parameters }: Omit<GenerateScriptParams, 'scriptLanguage'>): string => {
  return `
# Fine-tuning script for ${model} on ${taskType} task
# This script is designed to run in a local Jupyter notebook

# Install required packages if not already installed
!pip install -q transformers datasets accelerate wandb

import os
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
from IPython.display import display, HTML

# Initialize wandb for experiment tracking (optional)
# wandb.init(project="llm-finetuning", name="${model}-finetuning")

print("Setting up GPU...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

if device.type == "cuda":
    print("GPU Memory before loading model:", torch.cuda.get_device_properties(0).total_memory / 1e9, "GB")

# Model and tokenizer setup
model_name = "${model}"
print(f"Loading model and tokenizer: {model_name}")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.${parameters.precision === 'fp16' ? 'float16' : 'float32'},
    device_map="auto"
)

# Add padding token if not present
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token
    model.config.pad_token_id = model.config.eos_token_id

# Dataset preparation
def prepare_dataset():
    # Load dataset from file or Hugging Face Hub
    dataset = load_dataset("text", data_files={"train": "train.txt"})
    
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )
    
    print("Tokenizing dataset...")
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names,
        desc="Tokenizing"
    )
    
    return tokenized_dataset

print("Preparing dataset...")
dataset = prepare_dataset()

# Training configuration
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=int(${parameters.epochs}),
    per_device_train_batch_size=int(${parameters.batchSize}),
    gradient_accumulation_steps=int(${parameters.gradientAccumulation}),
    learning_rate=float(${parameters.learningRate}),
    weight_decay=float(${parameters.weightDecay}),
    warmup_steps=int(${parameters.warmupSteps}),
    logging_steps=100,
    save_strategy="${parameters.saveStrategy}",
    evaluation_strategy="${parameters.evaluationStrategy}",
    ${parameters.useDeepSpeed ? 'deepspeed="ds_config.json",' : ''}
    fp16=${parameters.precision === 'fp16'},
    optim="${parameters.optimizer}",
    lr_scheduler_type="${parameters.scheduler}",
    seed=int(${parameters.randomSeed}),
    report_to="wandb" if wandb.run is not None else "none"
)

# Initialize trainer
print("Initializing trainer...")
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

# Training progress display
from IPython.display import HTML, display
def display_training_info():
    display(HTML("""
    <div style='background-color: #f0f0f0; padding: 10px; border-radius: 5px;'>
        <h3>Training Information</h3>
        <ul>
            <li>Model: ${model}</li>
            <li>Task Type: ${taskType}</li>
            <li>Epochs: ${parameters.epochs}</li>
            <li>Batch Size: ${parameters.batchSize}</li>
            <li>Learning Rate: ${parameters.learningRate}</li>
            <li>Device: Using GPU if available</li>
        </ul>
    </div>
    """))

display_training_info()

# Training
print("Starting training...")
trainer.train()

# Save the model
print("Saving model...")
trainer.save_model("./fine_tuned_model")
if wandb.run is not None:
    wandb.finish()

print("Training completed! Model saved in ./fine_tuned_model")

# Memory cleanup
import gc
gc.collect()
if device.type == "cuda":
    torch.cuda.empty_cache()
    print("GPU Memory after training:", torch.cuda.get_device_properties(0).total_memory / 1e9, "GB")
`;
};