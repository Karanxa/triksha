import { Download, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Dataset {
  id: string
  title: string
  description: string
  downloads: number
  likes: number
}

interface DatasetCardProps {
  dataset: Dataset
  onDownload: (id: string, format: 'csv' | 'txt' | 'zip') => void
  downloading: string | null
}

export const DatasetCard = ({ dataset, onDownload, downloading }: DatasetCardProps) => {
  return (
    <Card className="flex flex-col">
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
            <DropdownMenuItem onClick={() => onDownload(dataset.id, 'csv')}>
              Download as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(dataset.id, 'txt')}>
              Download as TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(dataset.id, 'zip')}>
              Download as ZIP
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}