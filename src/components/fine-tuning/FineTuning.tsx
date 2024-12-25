import { Lock } from "lucide-react"
import { Card } from "@/components/ui/card"

export const FineTuning = () => {
  return (
    <div className="container py-8 space-y-6">      
      <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          The fine-tuning module is currently being enhanced and will be available in the next few days. 
          Stay tuned for powerful model customization capabilities!
        </p>
      </Card>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  )
}

export default FineTuning