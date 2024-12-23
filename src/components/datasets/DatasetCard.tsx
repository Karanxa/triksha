import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, Star, GitFork, ExternalLink, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useState } from "react"

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
  const [isDownloading, setIsDownloading] = useState(false)
  const isGitHub = dataset.source === 'github'

  const handleCloneRepo = async () => {
    const repoUrl = isGitHub 
      ? `${dataset.url}.git`
      : `https://huggingface.co/datasets/${dataset.id}`

    if (!repoUrl) {
      toast.error("Repository URL not available")
      return
    }
    
    try {
      const cloneCommand = `git clone ${repoUrl}`
      await navigator.clipboard.writeText(cloneCommand)
      toast.success("Git clone command copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <Card className="group flex flex-col h-full transition-all duration-300 hover:shadow-lg animate-fade-in bg-gradient-to-br from-card to-muted/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-medium leading-none group-hover:text-primary transition-colors">
              {dataset.title}
            </h3>
          </div>
          {dataset.url && (
            <a 
              href={dataset.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
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
            <div className="flex flex-wrap gap-2 animate-slide-in">
              {dataset.language && (
                <Badge variant="secondary" className="text-xs bg-primary/5 hover:bg-primary/10">
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
        <Button
          variant="outline"
          size="sm"
          className="w-full hover:bg-primary/5 transition-colors"
          onClick={handleCloneRepo}
          disabled={isDownloading}
        >
          <GitFork className="mr-2 h-4 w-4" />
          Clone Repository
        </Button>
      </CardFooter>
    </Card>
  )
}