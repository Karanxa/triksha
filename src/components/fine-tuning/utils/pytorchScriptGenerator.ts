import { GenerateScriptParams } from './scriptGeneratorTypes';

export const generatePyTorchScript = ({ model, datasetId, taskType, parameters }: Omit<GenerateScriptParams, 'scriptLanguage'>): string => {
  return `
# PyTorch-specific fine-tuning script for ${model}
# This script is designed to run in a local Jupyter notebook

!pip install torch transformers datasets wandb

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from transformers import AutoTokenizer, AutoModelForCausalLM
from datasets import load_dataset
import wandb
from IPython.display import display, HTML

# Initialize wandb (optional)
# wandb.init(project="llm-finetuning", name="${model}-pytorch-finetuning")

# Device configuration
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

print("Tokenizing dataset...")
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

# Display training configuration
def display_training_info():
    display(HTML("""
    <div style='background-color: #f0f0f0; padding: 10px; border-radius: 5px;'>
        <h3>PyTorch Training Configuration</h3>
        <ul>
            <li>Model: ${model}</li>
            <li>Device: {device}</li>
            <li>Batch Size: ${parameters.batchSize}</li>
            <li>Learning Rate: ${parameters.learningRate}</li>
            <li>Optimizer: ${parameters.optimizer}</li>
        </ul>
    </div>
    """))

display_training_info()

# Training loop
num_epochs = int(${parameters.epochs})
print("Starting training...")
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
        
        if wandb.run is not None:
            wandb.log({"batch_loss": loss.item()})
    
    avg_loss = total_loss / len(train_loader)
    print(f"Epoch {epoch+1}/{num_epochs}, Average Loss: {avg_loss:.4f}")
    if wandb.run is not None:
        wandb.log({"epoch": epoch, "average_loss": avg_loss})

# Save the model
print("Saving model...")
torch.save(model.state_dict(), "fine_tuned_model.pth")
if wandb.run is not None:
    wandb.finish()

# Memory cleanup
import gc
gc.collect()
if device.type == "cuda":
    torch.cuda.empty_cache()
    print("GPU Memory after training:", torch.cuda.get_device_properties(0).total_memory / 1e9, "GB")

print("Training completed! Model saved as fine_tuned_model.pth")
`;
};