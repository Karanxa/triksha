import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, ExternalLink } from "lucide-react"

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
  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fine-tuning-script.py'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const openJupyterNotebook = () => {
    window.open('http://localhost:8888/tree', '_blank');
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Generated Script</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={openJupyterNotebook}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Jupyter
          </Button>
        </div>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code>{script}</code>
      </pre>
    </Card>
  )
}