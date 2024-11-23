import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ModelFingerprintForm } from "./ModelFingerprintForm";
import { ModelFingerprintChat } from "./ModelFingerprintChat";

export const ModelFingerprintDashboard = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <div className="container py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Model Fingerprinting</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Analyze model behavior and generate targeted prompts based on responses.
      </p>

      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          {!sessionId ? (
            <ModelFingerprintForm onSessionCreated={setSessionId} />
          ) : (
            <ModelFingerprintChat sessionId={sessionId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};