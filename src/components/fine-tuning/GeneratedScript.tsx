import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface GeneratedScriptProps {
  script: string
}

export const GeneratedScript = ({ script }: GeneratedScriptProps) => {
  if (!script) return null;

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fine-tuning-script.py'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success("Script downloaded successfully")
  }

  const openJupyterNotebook = () => {
    window.open('http://localhost:8888/tree', '_blank')
  }

  return (
    <Card className="p-6 space-y-4 bg-background border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Generated Script</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openJupyterNotebook}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Jupyter
          </Button>
        </div>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code>{script}</code>
      </pre>
    </Card>
  )
}