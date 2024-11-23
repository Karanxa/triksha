import { useState } from "react";
import { ModelFingerprintForm } from "@/components/model-fingerprint/ModelFingerprintForm";
import { ModelFingerprintChat } from "@/components/model-fingerprint/ModelFingerprintChat";
import { ModelFingerprintSession } from "@/integrations/supabase/types/tables/model-fingerprint";

export default function ModelFingerprint() {
  const [session, setSession] = useState<ModelFingerprintSession | null>(null);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Model Fingerprinting</h1>
      
      {!session ? (
        <ModelFingerprintForm onSessionCreated={setSession} />
      ) : (
        <ModelFingerprintChat sessionId={session.id} />
      )}
    </div>
  );
}