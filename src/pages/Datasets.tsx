import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Download, Search, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect"
import { useDebounce } from "@/hooks/useDebounce"

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
  
  // Debounce search query to avoid too many API calls
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
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={useCustomSearch}
                onCheckedChange={setUseCustomSearch}
                id="custom-search"
              />
              <label htmlFor="custom-search" className="text-sm">
                Use custom search keywords
              </label>
            </div>
          </div>

          <div className="w-full">
            <AttackCategorySelect 
              value={selectedCategory} 
              onValueChange={setSelectedCategory} 
            />
          </div>

          {useCustomSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets?.map((dataset) => (
                <Card key={dataset.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{dataset.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {dataset.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{dataset.downloads} downloads</span>
                      <span>{dataset.likes} likes</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          disabled={downloading === dataset.id}
                        >
                          {downloading === dataset.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download Dataset
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDownload(dataset.id, 'csv')}>
                          Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(dataset.id, 'txt')}>
                          Download as TXT
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(dataset.id, 'zip')}>
                          Download as ZIP
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Datasets