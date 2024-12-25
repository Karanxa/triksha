import { DatasetCard } from "./DatasetCard"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { Loader2 } from "lucide-react"

interface Dataset {
  id: string
  title: string
  description: string
  downloads: number
  likes: number
  source: 'github' | 'huggingface'
  url?: string
  language?: string
  topics?: string[]
}

interface DatasetGridProps {
  datasets: Dataset[]
  onLoadMore: () => void
  hasMore: boolean
  downloading: string | null
  onDownload: (datasetId: string, format: 'csv' | 'txt') => void
  isLoading: boolean
}

export const DatasetGrid = ({ 
  datasets, 
  onLoadMore, 
  hasMore,
  downloading,
  onDownload,
  isLoading
}: DatasetGridProps) => {
  const { lastElementRef, isFetching, resetFetching } = useInfiniteScroll(() => {
    if (hasMore && !isLoading) {
      onLoadMore()
      // Reset fetching state after the load more callback
      setTimeout(resetFetching, 500)
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset, index) => (
          <div 
            key={dataset.id} 
            ref={hasMore && index === datasets.length - 1 ? lastElementRef : null}
          >
            <DatasetCard
              dataset={dataset}
              onDownload={onDownload}
              downloading={downloading}
            />
          </div>
        ))}
      </div>
      
      {(isLoading || isFetching) && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}