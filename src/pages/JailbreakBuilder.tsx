import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JailbreakTemplateForm } from "@/components/jailbreak/JailbreakTemplateForm";
import { JailbreakTemplateList } from "@/components/jailbreak/JailbreakTemplateList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const JailbreakBuilder = () => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState("browse");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["jailbreak-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jailbreak_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch templates");
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Jailbreak Template Builder</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage jailbreak templates for testing LLM security
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <JailbreakTemplateList templates={templates || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <JailbreakTemplateForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JailbreakBuilder;