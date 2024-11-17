import { useQuery } from "@tanstack/react-query"
import { Database, Loader2, Search } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { DatasetViewer } from "./DatasetViewer"
import { DatasetList } from "./DatasetList"
import JSZip from "jszip"

export const DatasetsDashboard = () => {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)
  const [viewingDataset, setViewingDataset] = useState<string | null>(null)

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['user-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching datasets",
          description: error.message
        })
        return []
      }

      return data
    }
  })

  const filteredDatasets = datasets?.filter(dataset => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleDownload = async (datasetId: string, format: 'csv' | 'zip') => {
    try {
      setDownloading(datasetId)
      
      const { data: dataset } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single()

      if (!dataset?.file_path) {
        throw new Error('Dataset file not found')
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path)

      if (downloadError) throw downloadError

      let downloadContent: Blob
      let contentType: string
      let filename: string = dataset.name

      const content = await fileData.text()

      if (format === 'csv') {
        contentType = 'text/csv'
        filename = `${filename}.csv`
        downloadContent = new Blob([content], { type: contentType })
      } else if (format === 'zip') {
        const zip = new JSZip()
        zip.file(`${dataset.name}.csv`, content)
        downloadContent = await zip.generateAsync({ type: 'blob' })
        contentType = 'application/zip'
        filename = `${filename}.zip`
      }

      const url = window.URL.createObjectURL(downloadContent)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Dataset downloaded successfully"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message
      })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Datasets</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDatasets.length > 0 ? (
        <DatasetList
          datasets={filteredDatasets}
          onView={setViewingDataset}
          onDownload={handleDownload}
          downloading={downloading}
        />
      ) : (
        <div className="text-center py-12">
          <Database className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No datasets found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Create your first dataset to get started"}
          </p>
        </div>
      )}

      <DatasetViewer
        datasetId={viewingDataset}
        onClose={() => setViewingDataset(null)}
      />
    </div>
  )
}