import { useState } from "react"
import { BasicParameters } from "./components/BasicParameters"
import { ModelSelect } from "./components/ModelSelect"
import { DatasetSelect } from "./components/DatasetSelect"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const CreateFineTuningJob = ({ 
  onScriptGenerated 
}: { 
  onScriptGenerated: (script: string, model: string, parameters: any) => void 
}) => {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [parameters, setParameters] = useState({
    epochs: 3,
    batchSize: 32,
    learningRate: 0.0001
  })
  const [generatedScript, setGeneratedScript] = useState("")

  const handleSubmit = async () => {
    if (!model || !datasetId) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please select a model and dataset"
      })
      return
    }

    setIsGenerating(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-finetuning-script', {
        body: {
          model,
          datasetId,
          parameters
        }
      })

      if (error) throw error

      setGeneratedScript(data.script)
      onScriptGenerated(data.script, model, parameters)

      toast({
        title: "Script generated successfully",
        description: "You can now view and edit the generated script"
      })
    } catch (error: any) {
      console.error('Error generating script:', error)
      toast({
        variant: "destructive",
        title: "Failed to generate script",
        description: error.message
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 content-container">
      <Card className="p-6 glass-card">
        <div className="space-y-6">
          <ModelSelect value={model} onValueChange={setModel} />
          <DatasetSelect value={datasetId} onValueChange={setDatasetId} />
          <BasicParameters value={parameters} onChange={setParameters} />
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Script
          </Button>
        </div>
      </Card>
    </div>
  )
}