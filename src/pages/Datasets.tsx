import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/useDebounce"
import { DatasetSearchControls } from "@/components/datasets/DatasetSearchControls"
import { DatasetCard } from "@/components/datasets/DatasetCard"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const Datasets = () => {
  const { toast } = useToast()
  const [useCustomSearch, setUseCustomSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)
  const [localSearch, setLocalSearch] = useState("")
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets', selectedCategory, useCustomSearch, debouncedSearchQuery],
    queryFn: async () => {
      if (!selectedCategory && !debouncedSearchQuery) return { huggingface: [], github: [] }
      
      const { data, error } = await supabase.functions.invoke('fetch-datasets', {
        body: { 
          category: selectedCategory,
          useCustomSearch,
          searchQuery: useCustomSearch ? debouncedSearchQuery : undefined
        }
      })

      if (error) {
        if (error.message.includes("API key not found")) {
          toast({
            variant: "destructive",
            title: "API Key Missing",
            description: "Please add your API keys in the Settings page.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error fetching datasets",
            description: error.message,
          })
        }
        return { huggingface: [], github: [] }
      }

      return data
    },
    enabled: !!selectedCategory || (useCustomSearch && !!debouncedSearchQuery)
  })

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

  const filterDatasets = (datasets: any[]) => {
    if (!localSearch) return datasets
    return datasets.filter(dataset => 
      dataset.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      dataset.description.toLowerCase().includes(localSearch.toLowerCase())
    )
  }

  const huggingFaceDatasets = filterDatasets(datasets?.huggingface || [])
  const githubDatasets = filterDatasets(datasets?.github || [])

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <DatasetSearchControls
          useCustomSearch={useCustomSearch}
          setUseCustomSearch={setUseCustomSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {((datasets?.huggingface?.length || datasets?.github?.length) || isLoading) && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search in results..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {selectedCategory && !useCustomSearch && (
              <h2 className="text-2xl font-semibold mb-6">
                Adversarial Datasets - {selectedCategory}
              </h2>
            )}
            
            {huggingFaceDatasets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Hugging Face Datasets</h3>
                  <span className="text-muted-foreground">({huggingFaceDatasets.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {huggingFaceDatasets.map((dataset) => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      onDownload={handleDownload}
                      downloading={downloading}
                    />
                  ))}
                </div>
              </div>
            )}

            {huggingFaceDatasets.length > 0 && githubDatasets.length > 0 && (
              <Separator className="my-8" />
            )}

            {githubDatasets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">GitHub Datasets</h3>
                  <span className="text-muted-foreground">({githubDatasets.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {githubDatasets.map((dataset) => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      onDownload={handleDownload}
                      downloading={downloading}
                    />
                  ))}
                </div>
              </div>
            )}

            {datasets && Object.keys(datasets).length > 0 && 
             huggingFaceDatasets.length === 0 && githubDatasets.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No datasets found for your search criteria
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Datasets