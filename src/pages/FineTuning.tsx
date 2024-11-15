import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";

const FineTuning = () => {
  const [baseModel, setBaseModel] = useState("");
  const [datasetType, setDatasetType] = useState("");
  const [taskType, setTaskType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (['json', 'jsonl', 'csv', 'txt'].includes(fileType || '')) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JSON, JSONL, CSV, or TXT file",
        });
      }
    }
  };

  const handleGenerateScript = () => {
    if (!baseModel || !datasetType || !taskType || !file) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }

    toast({
      title: "Script generated successfully",
      description: "Your fine-tuning script has been generated",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Model Fine-tuning</h1>
        <p className="text-muted-foreground mb-8">
          Fine-tune pre-trained models on your custom dataset using Google Colab's GPU resources.
        </p>

        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-medium">Base Model</label>
            <Select value={baseModel} onValueChange={setBaseModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                <SelectItem value="llama-2">Llama 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Dataset Type</label>
            <Select value={datasetType} onValueChange={setDatasetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="conversation">Conversation</SelectItem>
                <SelectItem value="qa">Question & Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Task Type</label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="generation">Text Generation</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Upload Dataset</label>
            <Input
              type="file"
              accept=".json,.jsonl,.csv,.txt"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: JSON, JSONL, CSV, TXT
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="training-params">
              <AccordionTrigger>Training Parameters</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Learning Rate</label>
                    <Input type="number" placeholder="0.0001" step="0.0001" min="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Epochs</label>
                    <Input type="number" placeholder="3" min="1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch Size</label>
                    <Input type="number" placeholder="8" min="1" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            onClick={handleGenerateScript}
            className="w-full"
            size="lg"
          >
            Generate Fine-tuning Script
          </Button>

          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold">Your Generated Scripts</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-card rounded-md">
                <div>
                  <p className="font-medium">llama-2</p>
                  <p className="text-sm text-muted-foreground">
                    Task: classification | Dataset: text
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: 11/6/2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Script
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FineTuning;