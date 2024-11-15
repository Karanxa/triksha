import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users } from "lucide-react"

interface Dataset {
  id: string
  title: string
  description: string
  downloads: number
  likes: number
  source: 'github' | 'huggingface'
}

interface DatasetCardProps {
  dataset: Dataset
  onDownload: (datasetId: string, format: 'csv' | 'txt' | 'zip') => void
  downloading: string | null
}

export const DatasetCard = ({ dataset, onDownload, downloading }: DatasetCardProps) => {
  const isDownloading = downloading === dataset.id

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <h3 className="text-base font-medium leading-none">{dataset.title}</h3>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{dataset.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{dataset.downloads} downloads</span>
          <span>•</span>
          <span>{dataset.likes} likes</span>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onDownload(dataset.id, 'csv')}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onDownload(dataset.id, 'txt')}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          TXT
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onDownload(dataset.id, 'zip')}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          ZIP
        </Button>
      </CardFooter>
    </Card>
  )
}