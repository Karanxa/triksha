interface ScriptParameters {
  learningRate: string;
  batchSize: string;
  epochs: string;
  warmupSteps: string;
  weightDecay: string;
  optimizer: string;
  scheduler: string;
  maxSteps: string;
  evaluationStrategy: string;
  saveStrategy: string;
  randomSeed: string;
  precision: string;
  gradientAccumulation: string;
  useDeepSpeed: boolean;
  useFlashAttention: boolean;
  useMemoryOptimization: boolean;
  hardwareAcceleration: string;
}

interface GenerateScriptParams {
  model: string;
  datasetId: string;
  taskType: string;
  scriptLanguage: string;
  parameters: ScriptParameters;
}

export const generateTrainingScript = ({
  model,
  datasetId,
  taskType,
  scriptLanguage,
  parameters
}: GenerateScriptParams): string => {
  switch (scriptLanguage) {
    case 'pytorch':
      return generatePyTorchScript({ model, datasetId, taskType, parameters });
    case 'tensorflow':
      return generateTensorFlowScript({ model, datasetId, taskType, parameters });
    case 'python':
    default:
      return generatePythonScript({ model, datasetId, taskType, parameters });
  }
};

const generatePythonScript = ({ model, datasetId, taskType, parameters }: Omit<GenerateScriptParams, 'scriptLanguage'>): string => {
  return `
# Fine-tuning script for ${model} on ${taskType} task
# This script is designed to run in Google Colab

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

# Initialize wandb for experiment tracking
wandb.init(project="llm-finetuning", name="${model}-finetuning")

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
    
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names
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
    report_to="wandb"
)

# Initialize trainer
print("Initializing trainer...")
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

# Training
print("Starting training...")
trainer.train()

# Save the model
print("Saving model...")
trainer.save_model("./fine_tuned_model")
wandb.finish()

print("Training completed! Model saved in ./fine_tuned_model")
`;
};

const generatePyTorchScript = ({ model, datasetId, taskType, parameters }: Omit<GenerateScriptParams, 'scriptLanguage'>): string => {
  return `
# PyTorch-specific fine-tuning script for ${model}
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from transformers import AutoTokenizer, AutoModelForCausalLM
from datasets import load_dataset
import wandb

# Initialize wandb
wandb.init(project="llm-finetuning", name="${model}-pytorch-finetuning")

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model and tokenizer setup
model_name = "${model}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.${parameters.precision === 'fp16' ? 'float16' : 'float32'}
).to(device)

# Dataset preparation
dataset = load_dataset("text", data_files={"train": "train.txt"})

class TextDataset(torch.utils.data.Dataset):
    def __init__(self, encodings):
        self.encodings = encodings

    def __getitem__(self, idx):
        return {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}

    def __len__(self):
        return len(self.encodings.input_ids)

# Tokenize and create dataset
train_encodings = tokenizer(
    dataset["train"]["text"],
    truncation=True,
    padding=True,
    max_length=512,
    return_tensors="pt"
)

train_dataset = TextDataset(train_encodings)
train_loader = DataLoader(
    train_dataset, 
    batch_size=int(${parameters.batchSize}), 
    shuffle=True
)

# Training setup
optimizer = torch.optim.${parameters.optimizer}(
    model.parameters(),
    lr=float(${parameters.learningRate}),
    weight_decay=float(${parameters.weightDecay})
)

# Training loop
num_epochs = int(${parameters.epochs})
for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    for batch in train_loader:
        optimizer.zero_grad()
        
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        
        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=input_ids
        )
        
        loss = outputs.loss
        total_loss += loss.item()
        
        loss.backward()
        optimizer.step()
        
        wandb.log({"batch_loss": loss.item()})
    
    avg_loss = total_loss / len(train_loader)
    print(f"Epoch {epoch+1}/{num_epochs}, Average Loss: {avg_loss:.4f}")
    wandb.log({"epoch": epoch, "average_loss": avg_loss})

# Save the model
torch.save(model.state_dict(), "fine_tuned_model.pth")
wandb.finish()
print("Training completed! Model saved as fine_tuned_model.pth")
`;
};

const generateTensorFlowScript = ({ model, datasetId, taskType, parameters }: Omit<GenerateScriptParams, 'scriptLanguage'>): string => {
  return `
# TensorFlow-specific fine-tuning script for ${model}
import tensorflow as tf
from transformers import TFAutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset
import wandb
from wandb.keras import WandbCallback

# Initialize wandb
wandb.init(project="llm-finetuning", name="${model}-tensorflow-finetuning")

# Enable mixed precision if requested
if ${parameters.precision === 'fp16'}:
    policy = tf.keras.mixed_precision.Policy('mixed_float16')
    tf.keras.mixed_precision.set_global_policy(policy)

# Model and tokenizer setup
print("Loading model and tokenizer...")
model_name = "${model}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = TFAutoModelForCausalLM.from_pretrained(model_name)

# Dataset preparation
dataset = load_dataset("text", data_files={"train": "train.txt"})

def preprocess_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length",
        max_length=512,
        return_tensors="tf"
    )

print("Preparing dataset...")
tokenized_dataset = dataset.map(
    preprocess_function,
    batched=True,
    remove_columns=dataset["train"].column_names
)

# Convert to TensorFlow dataset
tf_train_dataset = model.prepare_tf_dataset(
    tokenized_dataset["train"],
    shuffle=True,
    batch_size=int(${parameters.batchSize})
)

# Optimizer and learning rate schedule
optimizer = tf.keras.optimizers.experimental.${parameters.optimizer}(
    learning_rate=float(${parameters.learningRate}),
    weight_decay=float(${parameters.weightDecay})
)

# Compile model
model.compile(optimizer=optimizer)

# Training
print("Starting training...")
history = model.fit(
    tf_train_dataset,
    epochs=int(${parameters.epochs}),
    callbacks=[WandbCallback()]
)

# Save the model
print("Saving model...")
model.save_pretrained("./fine_tuned_model_tf")
wandb.finish()

print("Training completed! Model saved in ./fine_tuned_model_tf")
`;
};