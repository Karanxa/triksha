import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/useDebounce"
import { DatasetSearchControls } from "@/components/datasets/DatasetSearchControls"
import { DatasetCard } from "@/components/datasets/DatasetCard"

interface Dataset {
  id: string
  title: string
  description: string
  downloads: number
  likes: number
}

const Datasets = () => {
  const { toast } = useToast()
  const [useCustomSearch, setUseCustomSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets', selectedCategory, useCustomSearch, debouncedSearchQuery],
    queryFn: async () => {
      if (!selectedCategory && !debouncedSearchQuery) return []
      
      const { data, error } = await supabase.functions.invoke('fetch-datasets', {
        body: { 
          category: selectedCategory,
          useCustomSearch,
          searchQuery: useCustomSearch ? debouncedSearchQuery : undefined
        }
      })

      if (error) {
        if (error.message.includes("Hugging Face API key not found")) {
          toast({
            variant: "destructive",
            title: "API Key Missing",
            description: "Please add your Hugging Face API key in the Settings page.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error fetching datasets",
            description: error.message,
          })
        }
        return []
      }

      return data.datasets.map((dataset: any) => ({
        id: dataset.id,
        title: dataset.id.split('/').pop(),
        description: dataset.description || 'No description available',
        downloads: dataset.downloads || 0,
        likes: dataset.likes || 0,
      }))
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
      a.download = data.filename || `dataset.${format}`
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="space-y-6">
          <DatasetSearchControls
            useCustomSearch={useCustomSearch}
            setUseCustomSearch={setUseCustomSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets?.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onDownload={handleDownload}
                  downloading={downloading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Datasets