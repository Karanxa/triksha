import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, Star, GitFork, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tables } from "@/integrations/supabase/types"

// Extend the database type with UI-specific properties
interface Dataset extends Tables<'datasets'> {
  downloads?: number
  likes?: number
  source?: 'github' | 'huggingface'
  url?: string
  language?: string
  topics?: string[]
  title?: string
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
          <h3 className="text-base font-medium leading-none">{dataset.title || dataset.name}</h3>
          {isGitHub && dataset.url && (
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
                <span>{dataset.downloads || 0} forks</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                <span>{dataset.downloads || 0} downloads</span>
              </>
            )}
            <span>•</span>
            <Star className="h-4 w-4" />
            <span>{dataset.likes || 0} stars</span>
          </div>

          {isGitHub && (
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
      <CardFooter>
        {isGitHub ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCloneRepo}
            disabled={!dataset.url}
          >
            <GitFork className="mr-2 h-4 w-4" />
            Clone Repository
          </Button>
        ) : (
          <div className="grid grid-cols-3 gap-2 w-full">
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
          </div>
        )}
      </CardFooter>
    </Card>
  )
}