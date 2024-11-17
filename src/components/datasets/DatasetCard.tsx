import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, Star, GitFork, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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

interface DatasetCardProps {
  dataset: Dataset
  onDownload: (datasetId: string, format: 'csv' | 'txt' | 'zip') => void
  downloading: string | null
}

export const DatasetCard = ({ dataset, onDownload, downloading }: DatasetCardProps) => {
  const isDownloading = downloading === dataset.id
  const isGitHub = dataset.source === 'github'

  const handleCloneRepo = async () => {
    if (!dataset.url) {
      toast.error("Repository URL not available")
      return
    }
    
    try {
      await navigator.clipboard.writeText(`git clone ${dataset.url}.git`)
      toast.success("Git clone command copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium leading-none">{dataset.title}</h3>
          {dataset.url && (
            <a 
              href={dataset.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {dataset.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isGitHub ? (
              <>
                <GitFork className="h-4 w-4" />
                <span>{dataset.downloads} forks</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                <span>{dataset.downloads} downloads</span>
              </>
            )}
            <span>•</span>
            <Star className="h-4 w-4" />
            <span>{dataset.likes} stars</span>
          </div>

          {isGitHub && dataset.topics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dataset.language && (
                <Badge variant="secondary" className="text-xs">
                  {dataset.language}
                </Badge>
              )}
              {dataset.topics?.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isGitHub ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCloneRepo}
              disabled={!dataset.url}
            >
              <GitFork className="mr-2 h-4 w-4" />
              Clone Repository
            </Button>
            {dataset.url && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a 
                  href={dataset.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onDownload(dataset.id, 'csv')}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <span className="flex items-center">
                  Downloading...
                </span>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </>
              )}
            </Button>
            {dataset.url && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a 
                  href={dataset.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}