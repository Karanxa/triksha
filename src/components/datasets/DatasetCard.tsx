import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Star, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{dataset.title}</CardTitle>
          <Badge variant="outline">
            {dataset.source === 'github' ? 'GitHub' : 'Hugging Face'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{dataset.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {dataset.source === 'github' ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{dataset.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{dataset.likes}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onDownload(dataset.id, 'csv')}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}