import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetGrid } from "./DatasetGrid"

interface DatasetSearchResultsProps {
  accumulatedDatasets: {
    huggingface: any[]
    github: any[]
  }
  onLoadMore: () => void
  page: number
  itemsPerPage: number
  downloading: string | null
  onDownload: (datasetId: string, format: 'csv' | 'txt' | 'zip') => void
  isLoading: boolean
}

export const DatasetSearchResults = ({
  accumulatedDatasets,
  onLoadMore,
  page,
  itemsPerPage,
  downloading,
  onDownload,
  isLoading
}: DatasetSearchResultsProps) => {
  return (
    <Tabs defaultValue="huggingface" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="huggingface" className="flex items-center gap-2">
          Hugging Face
          <span className="text-xs text-muted-foreground">
            ({accumulatedDatasets.huggingface.length})
          </span>
        </TabsTrigger>
        <TabsTrigger value="github" className="flex items-center gap-2">
          GitHub
          <span className="text-xs text-muted-foreground">
            ({accumulatedDatasets.github.length})
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="huggingface">
        <DatasetGrid
          datasets={accumulatedDatasets.huggingface}
          onLoadMore={onLoadMore}
          hasMore={accumulatedDatasets.huggingface.length >= page * itemsPerPage}
          downloading={downloading}
          onDownload={onDownload}
          isLoading={isLoading}
        />
        {accumulatedDatasets.huggingface.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-12">
            No Hugging Face datasets found
          </p>
        )}
      </TabsContent>

      <TabsContent value="github">
        <DatasetGrid
          datasets={accumulatedDatasets.github}
          onLoadMore={onLoadMore}
          hasMore={accumulatedDatasets.github.length >= page * itemsPerPage}
          downloading={downloading}
          onDownload={onDownload}
          isLoading={isLoading}
        />
        {accumulatedDatasets.github.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-12">
            No GitHub datasets found
          </p>
        )}
      </TabsContent>
    </Tabs>
  )
}