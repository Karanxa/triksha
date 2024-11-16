import { DatasetCard } from "./DatasetCard"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

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
}

export const DatasetGrid = ({ 
  datasets, 
  onLoadMore, 
  hasMore,
  downloading,
  onDownload 
}: DatasetGridProps) => {
  const { lastElementRef, isFetching, setIsFetching } = useInfiniteScroll(() => {
    if (hasMore) {
      onLoadMore()
      setIsFetching(false)
    }
  })

  return (
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
      {isFetching && (
        <div className="col-span-full text-center py-4">
          Loading more datasets...
        </div>
      )}
    </div>
  )
}