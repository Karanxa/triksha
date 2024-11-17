import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useToast } from "@/hooks/use-toast"
import { DatasetSearchControls } from "./DatasetSearchControls"
import { Input } from "@/components/ui/input"
import { DatasetSearchResults } from "./DatasetSearchResults"
import { useDatasetQuery } from "@/hooks/useDatasetQuery"
import { supabase } from "@/integrations/supabase/client"

const ITEMS_PER_PAGE = 12

export const ExistingDatasets = () => {
  const { toast } = useToast()
  const [useCustomSearch, setUseCustomSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)
  const [localSearch, setLocalSearch] = useState("")
  const [page, setPage] = useState(1)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { data: datasets = { huggingface: [], github: [] }, isLoading, isFetching } = useDatasetQuery({
    selectedCategory,
    useCustomSearch,
    searchQuery: debouncedSearchQuery,
    page,
    perPage: ITEMS_PER_PAGE
  })

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleDownload = async (datasetId: string, format: 'csv' | 'txt' | 'zip') => {
    try {
      setDownloading(datasetId)
      
      const { data, error } = await supabase.functions.invoke('download-dataset', {
        body: { datasetId, format }
      })

      if (error) throw error

      // Create blob and trigger download
      const blob = new Blob([data], { type: 'text/csv' })
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
      console.error('Download error:', error)
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
      dataset.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(localSearch.toLowerCase())
    )
  }

  const accumulatedDatasets = {
    huggingface: filterDatasets(datasets?.huggingface || []),
    github: filterDatasets(datasets?.github || [])
  }

  return (
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

      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {selectedCategory && !useCustomSearch && (
            <h2 className="text-2xl font-semibold mb-6">
              Public Datasets - {selectedCategory}
            </h2>
          )}
          
          <DatasetSearchResults
            accumulatedDatasets={accumulatedDatasets}
            onLoadMore={handleLoadMore}
            page={page}
            itemsPerPage={ITEMS_PER_PAGE}
            downloading={downloading}
            onDownload={handleDownload}
            isLoading={isFetching}
          />

          {datasets && Object.keys(datasets).length > 0 && 
           accumulatedDatasets.huggingface.length === 0 && 
           accumulatedDatasets.github.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No datasets found for your search criteria
            </p>
          )}
        </>
      )}
    </div>
  )
}