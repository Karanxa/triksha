import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"

interface ScriptPreviewProps {
  script: string
}

export const ScriptPreview = ({ script }: ScriptPreviewProps) => {
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
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Generated Script</h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code>{script}</code>
      </pre>
    </Card>
  )
}