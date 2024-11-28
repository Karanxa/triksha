import { Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"

interface UseFileUploadProps {
  session: Session | null
  setName: (value: string) => void
  setDescription: (value: string) => void
  setMethod: (value: string) => void
  toast: any
}

export const useFileUpload = ({
  session,
  setName,
  setDescription,
  setMethod,
  toast
}: UseFileUploadProps) => {
  const handleFileUpload = async (data: { prompts: string[]; name?: string }) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to upload datasets")
      return
    }

    try {
      const content = data.prompts.join('\n')
      const file = new Blob([content], { type: 'text/plain' })
      const filePath = `${session.user.id}/${Date.now()}-dataset.txt`

      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          name: data.name || 'Uploaded Dataset',
          description: `Dataset uploaded from CSV with ${data.prompts.length} prompts`,
          file_path: filePath,
          user_id: session.user.id
        })

      if (dbError) throw dbError

      toast.success("Dataset uploaded successfully")

      // Reset form
      setName("")
      setDescription("")
      setMethod("manual")
    } catch (error: any) {
      console.error('Error uploading dataset:', error)
      toast.error(error.message || "Failed to upload dataset")
    }
  }

  return { handleFileUpload }
}