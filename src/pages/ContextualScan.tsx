import { ContextualScanForm } from "@/components/contextual-scan/ContextualScanForm";
import { Card, CardContent } from "@/components/ui/card";

export default function ContextualScan() {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Contextual Scan</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Analyze model behavior through contextual scanning and fingerprinting.
      </p>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <ContextualScanForm />
        </CardContent>
      </Card>
    </div>
  );
}