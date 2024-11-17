import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DatasetContent } from "./DatasetContent"
import { parseCSVContent, cleanTextContent } from "./utils/datasetParser"

interface DatasetViewerProps {
  datasetId: string | null
  onClose: () => void
}

export const DatasetViewer = ({ datasetId, onClose }: DatasetViewerProps) => {
  const { toast } = useToast()
  const [viewType, setViewType] = useState<'table' | 'raw'>('table')
  const [copied, setCopied] = useState(false)

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['dataset-content', datasetId],
    queryFn: async () => {
      if (!datasetId) return null

      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .maybeSingle()

      if (datasetError || !dataset?.file_path) {
        throw new Error(datasetError?.message || "Dataset not found")
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path)

      if (fileError) throw fileError

      const text = await fileData.text()
      const { headers, data } = parseCSVContent(text)
      const cleanedText = cleanTextContent(text)
      
      return { 
        type: 'csv' as const, 
        headers, 
        data,
        raw: cleanedText 
      }
    },
    enabled: !!datasetId,
    retry: 1
  })

  const handleCopy = async () => {
    if (!content) return

    try {
      const textToCopy = viewType === 'raw' 
        ? content.raw
        : content.data.map(row => row.join(',')).join('\n')
      
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The content has been copied to your clipboard"
      })
      
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again"
      })
    }
  }

  return (
    <Dialog open={!!datasetId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Dataset Viewer</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!content}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-4">
            Failed to load dataset content: {error.message}
          </p>
        ) : content ? (
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'table' | 'raw')}>
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="raw">Raw Text</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              <DatasetContent viewType={viewType} content={content} />
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <DatasetContent viewType={viewType} content={content} />
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Failed to load dataset content
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}