import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface GeneratedScriptProps {
  script: string
}

export const GeneratedScript = ({ script }: GeneratedScriptProps) => {
  const [copied, setCopied] = useState(false)

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      toast.success("Script copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy script")
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Generated Script</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code>{script}</code>
      </pre>
    </Card>
  )
}