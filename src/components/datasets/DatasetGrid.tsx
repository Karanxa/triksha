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
  onDownload: (datasetId: string, format: 'csv' | 'txt' | 'zip') => void
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
  const { lastElementRef } = useInfiniteScroll(() => {
    if (hasMore && !isLoading) {
      onLoadMore()
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset, index) => {
          if (datasets.length === index + 1) {
            return (
              <div key={dataset.id} ref={lastElementRef}>
                <DatasetCard
                  dataset={dataset}
                  onDownload={onDownload}
                  downloading={downloading}
                />
              </div>
            )
          }
          return (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onDownload={onDownload}
              downloading={downloading}
            />
          )
        })}
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}