import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/useDebounce"
import { DatasetSearchControls } from "./DatasetSearchControls"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetGrid } from "./DatasetGrid"

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

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets', selectedCategory, useCustomSearch, debouncedSearchQuery, page],
    queryFn: async () => {
      if (!selectedCategory && !debouncedSearchQuery) return { huggingface: [], github: [] }
      
      const { data, error } = await supabase.functions.invoke('fetch-datasets', {
        body: { 
          category: selectedCategory,
          useCustomSearch,
          searchQuery: useCustomSearch ? debouncedSearchQuery : undefined,
          page,
          perPage: ITEMS_PER_PAGE
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
    staleTime: 1000 * 60 * 5 // 5 minutes
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
              Adversarial Datasets - {selectedCategory}
            </h2>
          )}
          
          <Tabs defaultValue="huggingface" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="huggingface" className="flex items-center gap-2">
                Hugging Face
                <span className="text-xs text-muted-foreground">({huggingFaceDatasets.length})</span>
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2">
                GitHub
                <span className="text-xs text-muted-foreground">({githubDatasets.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="huggingface">
              <DatasetGrid
                datasets={huggingFaceDatasets}
                onLoadMore={handleLoadMore}
                hasMore={huggingFaceDatasets.length >= ITEMS_PER_PAGE}
                downloading={downloading}
                onDownload={handleDownload}
              />
              {huggingFaceDatasets.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No Hugging Face datasets found
                </p>
              )}
            </TabsContent>

            <TabsContent value="github">
              <DatasetGrid
                datasets={githubDatasets}
                onLoadMore={handleLoadMore}
                hasMore={githubDatasets.length >= ITEMS_PER_PAGE}
                downloading={downloading}
                onDownload={handleDownload}
              />
              {githubDatasets.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No GitHub datasets found
                </p>
              )}
            </TabsContent>
          </Tabs>

          {datasets && Object.keys(datasets).length > 0 && 
           huggingFaceDatasets.length === 0 && githubDatasets.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No datasets found for your search criteria
            </p>
          )}
        </>
      )}
    </div>
  )
}