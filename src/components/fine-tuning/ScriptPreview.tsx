import { GeneratedScript } from "./GeneratedScript"

interface ScriptPreviewProps {
  script: string;
  model: string;
  dataset: string;
  parameters: {
    learning_rate: number;
    batch_size: number;
    epochs: number;
    warmup_steps: number;
    weight_decay: number;
    optimizer: string;
    scheduler: string;
    max_steps: number;
    evaluation_strategy: string;
    save_strategy: string;
    random_seed: number;
    precision: string;
    gradient_accumulation_steps: number;
    use_deepspeed: boolean;
    use_flash_attention: boolean;
    use_memory_optimization: boolean;
    hardware_acceleration: string;
  };
}

export const ScriptPreview = ({ script, model, dataset, parameters }: ScriptPreviewProps) => {
  if (!script || script === "# Your generated script will appear here") {
    return null;
  }

  return <GeneratedScript script={script} />;
}