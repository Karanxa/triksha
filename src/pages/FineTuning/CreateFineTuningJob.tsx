import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BasicParameters, type BasicParameterValues } from "@/components/fine-tuning/BasicParameters"
import { ModelSelect } from "@/components/fine-tuning/ModelSelect"
import { DatasetSelect } from "@/components/fine-tuning/DatasetSelect"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useSession } from "@supabase/auth-helpers-react"
import { Loader2 } from "lucide-react"

export const CreateFineTuningJob = () => {
  const { toast } = useToast()
  const session = useSession()
  const [isGenerating, setIsGenerating] = useState(false)
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [parameters, setParameters] = useState<BasicParameterValues>({
    learningRate: "0.0001",
    batchSize: "32",
    epochs: "3",
    warmupSteps: "500",
    weightDecay: "0.01",
    optimizer: "adamw",
    scheduler: "linear",
    maxSteps: "1000",
    evaluationStrategy: "steps",
    saveStrategy: "steps",
    randomSeed: "42"
  })

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to create a fine-tuning job"
      })
      return
    }

    if (!model) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please select a model"
      })
      return
    }

    setIsGenerating(true)

    try {
      const { error } = await supabase
        .from('fine_tuning_jobs')
        .insert({
          user_id: session.user.id,
          model,
          dataset_id: datasetId || null,
          parameters: parameters as any,
          status: 'script_generated'
        })

      if (error) throw error

      toast({
        title: "Job created successfully",
        description: "You can view it in the Job History tab"
      })
    } catch (error: any) {
      console.error('Error creating job:', error)
      toast({
        variant: "destructive",
        title: "Failed to create job",
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
          <BasicParameters 
            value={parameters}
            onChange={setParameters}
          />
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Fine-Tuning Job
          </Button>
        </div>
      </Card>
    </div>
  )
}