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

      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path)

        if (fileError) throw fileError

        const text = await fileData.text()
        
        // Parse CSV content
        const lines = text.split('\n').filter(line => line.trim() !== '')
        const headers = lines[0].split(',').map(header => 
          header.trim().replace(/(^"|"$)/g, '')
        )
        
        const data = lines.slice(1).map(line => {
          const values = []
          let currentValue = ''
          let insideQuotes = false
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            
            if (char === '"') {
              if (insideQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                currentValue += '"'
                i++
              } else {
                // Toggle quote state
                insideQuotes = !insideQuotes
              }
            } else if (char === ',' && !insideQuotes) {
              // End of field
              values.push(currentValue.trim())
              currentValue = ''
            } else {
              currentValue += char
            }
          }
          
          // Add the last value
          values.push(currentValue.trim())
          
          return values
        }).filter(row => row.length === headers.length)

        // Clean up the raw text by removing "Enhanced Prompt:" prefix
        const cleanedText = text.split('\n').map(line => {
          if (line.startsWith('Enhanced Prompt:')) {
            return line.replace('Enhanced Prompt:', '').trim()
          }
          return line
        }).join('\n')
        
        return { 
          type: 'csv', 
          headers, 
          // Clean up the data by removing "Enhanced Prompt:" prefix
          data: data.map(row => 
            row.map(cell => 
              cell.startsWith('Enhanced Prompt:') ? cell.replace('Enhanced Prompt:', '').trim() : cell
            )
          ),
          raw: cleanedText 
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching file",
          description: error.message
        })
        return null
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