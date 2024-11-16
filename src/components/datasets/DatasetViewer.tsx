import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DatasetViewerProps {
  datasetId: string | null
  onClose: () => void
}

export const DatasetViewer = ({ datasetId, onClose }: DatasetViewerProps) => {
  const { toast } = useToast()
  const [viewType, setViewType] = useState<'table' | 'raw'>('table')

  const { data: content, isLoading } = useQuery({
    queryKey: ['dataset-content', datasetId],
    queryFn: async () => {
      if (!datasetId) return null

      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single()

      if (datasetError || !dataset?.file_path) {
        toast({
          variant: "destructive",
          title: "Error fetching dataset",
          description: datasetError?.message || "Dataset not found"
        })
        return null
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path)

      if (fileError) {
        toast({
          variant: "destructive",
          title: "Error fetching file",
          description: fileError.message
        })
        return null
      }

      const text = await fileData.text()
      try {
        // Try to parse as CSV
        const rows = text.split('\n').map(row => row.split(','))
        const headers = rows[0]
        const data = rows.slice(1).filter(row => row.length === headers.length)
        return { type: 'csv', headers, data, raw: text }
      } catch {
        // If parsing fails, return as raw text
        return { type: 'text', raw: text }
      }
    },
    enabled: !!datasetId
  })

  return (
    <Dialog open={!!datasetId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Dataset Viewer</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : content ? (
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'table' | 'raw')}>
            <TabsList>
              <TabsTrigger value="table" disabled={content.type !== 'csv'}>Table View</TabsTrigger>
              <TabsTrigger value="raw">Raw Text</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              {content.type === 'csv' ? (
                <ScrollArea className="h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {content.headers.map((header, i) => (
                          <TableHead key={i}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {content.data.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => (
                            <TableCell key={j}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Table view is only available for CSV files
                </p>
              )}
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <ScrollArea className="h-[60vh]">
                <pre className="whitespace-pre-wrap p-4 bg-muted rounded-lg">
                  {content.raw}
                </pre>
              </ScrollArea>
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