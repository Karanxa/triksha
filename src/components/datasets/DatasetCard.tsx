import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, Star, GitFork, ExternalLink, FileDown } from "lucide-react"
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

  const handleHuggingFaceDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Get the raw file content from Hugging Face
      const files = ['prompts.csv', 'data.csv', 'dataset.csv']
      let content = null
      
      for (const file of files) {
        try {
          const response = await fetch(`https://huggingface.co/datasets/${dataset.id}/raw/main/${file}`)
          if (response.ok) {
            content = await response.text()
            break
          }
        } catch (err) {
          console.error(`Failed to fetch ${file}:`, err)
        }
      }

      if (!content) {
        throw new Error('No dataset file found')
      }

      // Create and trigger download
      const blob = new Blob([content], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${dataset.title}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Dataset downloaded successfully!")
    } catch (err) {
      console.error('Download error:', err)
      toast.error("Failed to download dataset. Please try using the external link.")
    } finally {
      setIsDownloading(false)
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
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleHuggingFaceDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span className="flex items-center">
                Downloading...
              </span>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download Dataset
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}