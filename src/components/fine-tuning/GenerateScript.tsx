import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModelSelect } from "./ModelSelect"
import { DatasetSelect } from "./DatasetSelect"
import { TaskSelect } from "./TaskSelect"
import { LanguageSelect } from "./LanguageSelect"
import { ParameterTabs } from "./ParameterTabs"
import { generateScript } from "./utils/scriptGenerator"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@supabase/auth-helpers-react"
import { supabase } from "@/integrations/supabase/client"
import { GeneratedScript } from "./GeneratedScript"
import { useParameterState } from "./hooks/useParameterState"

interface GenerateScriptProps {
  onScriptGenerated: (script: string, model: string, parameters: any) => void;
}

export const GenerateScript = ({ onScriptGenerated }: GenerateScriptProps) => {
  const { toast } = useToast()
  const session = useSession()
  const parameters = useParameterState()
  
  const [model, setModel] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [taskType, setTaskType] = useState("")
  const [scriptLanguage, setScriptLanguage] = useState("python")
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)

  const handleGenerateScript = async () => {
    if (!model || !taskType) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please select a model and task type"
      })
      return
    }

    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to generate a script"
      })
      return
    }

    try {
      console.log("Generating script with parameters:", { model, taskType, parameters: parameters.getParameters() })
      
      const script = generateScript({
        model,
        datasetId,
        taskType,
        scriptLanguage,
        parameters: parameters.getParameters()
      })

      setGeneratedScript(script)

      // Store in database
      const { data, error } = await supabase
        .from('fine_tuning_jobs')
        .insert({
          user_id: session.user.id,
          model,
          dataset_id: datasetId || null,
          status: 'script_generated',
          parameters: parameters.getParameters(),
          script_content: script
        })
        .select()

      if (error) {
        console.error('Error saving script:', error)
        throw error
      }

      console.log('Fine-tuning job created:', data)

      onScriptGenerated(script, model, parameters.getParameters())

      toast({
        title: "Script generated successfully",
        description: "You can view it in the Job History tab"
      })

    } catch (error: any) {
      console.error('Error in script generation:', error)
      toast({
        variant: "destructive",
        title: "Failed to generate script",
        description: error.message || "Please try again"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <ModelSelect value={model} onValueChange={setModel} />
            <DatasetSelect value={datasetId} onValueChange={setDatasetId} />
            <TaskSelect value={taskType} onValueChange={setTaskType} />
            <LanguageSelect value={scriptLanguage} onValueChange={setScriptLanguage} />
          </div>

          <ParameterTabs {...parameters} />

          <Button 
            onClick={handleGenerateScript}
            disabled={!model || !taskType}
            className="w-full"
          >
            Generate Script
          </Button>
        </div>
      </Card>

      {generatedScript && (
        <GeneratedScript script={generatedScript} />
      )}
    </div>
  )
}