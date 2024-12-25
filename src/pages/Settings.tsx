import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";
import { AIProviderSettings } from "@/components/settings/AIProviderSettings";

const Settings = () => {
  return (
    <div className="container py-4 md:py-8">
      <PageHeader
        icon={Settings2}
        title="Settings"
        description="Manage your API keys and preferences."
      />
      
      <div className="space-y-8">
        <Card className="w-full mx-auto border border-border/50 shadow-lg">
          <div className="p-6">
            <ApiKeyForm />
          </div>
        </Card>

        <AIProviderSettings />
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default Settings;