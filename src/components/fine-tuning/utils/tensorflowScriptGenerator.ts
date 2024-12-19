import { GenerateScriptParams } from './scriptGeneratorTypes';

export const generateTensorFlowScript = ({ model, datasetId, taskType, parameters }: Omit<GenerateScriptParams, 'scriptLanguage'>): string => {
  return `
# TensorFlow-specific fine-tuning script for ${model}
# This script is designed to run in a local Jupyter notebook

!pip install tensorflow transformers datasets wandb

import tensorflow as tf
from transformers import TFAutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset
import wandb
from wandb.keras import WandbCallback
from IPython.display import display, HTML

# Initialize wandb (optional)
# wandb.init(project="llm-finetuning", name="${model}-tensorflow-finetuning")

# Enable mixed precision if requested
if ${parameters.precision === 'fp16'}:
    policy = tf.keras.mixed_precision.Policy('mixed_float16')
    tf.keras.mixed_precision.set_global_policy(policy)

# Check GPU availability
print("GPU Available:", tf.config.list_physical_devices('GPU'))

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

# Display training configuration
def display_training_info():
    display(HTML("""
    <div style='background-color: #f0f0f0; padding: 10px; border-radius: 5px;'>
        <h3>TensorFlow Training Configuration</h3>
        <ul>
            <li>Model: ${model}</li>
            <li>Batch Size: ${parameters.batchSize}</li>
            <li>Learning Rate: ${parameters.learningRate}</li>
            <li>Mixed Precision: ${parameters.precision === 'fp16'}</li>
        </ul>
    </div>
    """))

display_training_info()

# Optimizer
optimizer = tf.keras.optimizers.experimental.${parameters.optimizer}(
    learning_rate=float(${parameters.learningRate}),
    weight_decay=float(${parameters.weightDecay})
)

# Compile model
model.compile(optimizer=optimizer)

# Training
print("Starting training...")
callbacks = [WandbCallback()] if wandb.run is not None else []

history = model.fit(
    tf_train_dataset,
    epochs=int(${parameters.epochs}),
    callbacks=callbacks
)

# Save the model
print("Saving model...")
model.save_pretrained("./fine_tuned_model_tf")
if wandb.run is not None:
    wandb.finish()

print("Training completed! Model saved in ./fine_tuned_model_tf")

# Memory cleanup
import gc
gc.collect()
tf.keras.backend.clear_session()
`;
};