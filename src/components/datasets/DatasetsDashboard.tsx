import { useQuery } from "@tanstack/react-query"
import { Database, Download, FolderOpen, Search, Eye } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { DatasetViewer } from "./DatasetViewer"

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

  const handleDownload = async (datasetId: string, format: 'csv' | 'txt' | 'zip') => {
    try {
      setDownloading(datasetId)
      
      const { data, error } = await supabase.functions.invoke('download-dataset', {
        body: { datasetId, format }
      })

      if (error) throw error

      const blob = new Blob([data.content], { type: data.contentType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${datasetId.split('/').pop()}.${format}`
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <Card key={dataset.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {dataset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                  {dataset.description || "No description provided"}
                </p>
                {dataset.category && (
                  <p className="text-sm">
                    <span className="font-medium">Category:</span> {dataset.category}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(dataset.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setViewingDataset(dataset.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownload(dataset.id, 'csv')}
                  disabled={!!downloading}
                >
                  {downloading === dataset.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      CSV
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownload(dataset.id, 'txt')}
                  disabled={!!downloading}
                >
                  {downloading === dataset.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      TXT
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownload(dataset.id, 'zip')}
                  disabled={!!downloading}
                >
                  {downloading === dataset.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      ZIP
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
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
