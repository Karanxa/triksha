import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ModelSelect } from "./ModelSelect";
import { TestSuiteSelect } from "./TestSuiteSelect";
import { Loader2 } from "lucide-react";

export const GarakScanForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [modelType, setModelType] = useState("");
  const [modelName, setModelName] = useState("");
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug log
    console.log("Submit button clicked");
    console.log("Current form state:", { name, modelType, modelName, selectedSuites });
    console.log("Session:", session);

    // Validate all required fields with user feedback
    if (!name) {
      toast.error("Scan name is required");
      return;
    }
    if (!modelType) {
      toast.error("Model type is required");
      return;
    }
    if (!modelName) {
      toast.error("Model name is required");
      return;
    }
    if (selectedSuites.length === 0) {
      toast.error("At least one test suite must be selected");
      return;
    }
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a scan");
      return;
    }

    setIsLoading(true);
    toast.info("Starting Garak scan creation...");

    try {
      console.log("Creating scan record in database...");
      
      // Create the scan record
      const { data: scanData, error: scanError } = await supabase
        .from('garak_scans')
        .insert({
          name,
          model: `${modelType}/${modelName}`,
          prompts: [],
          test_suites: selectedSuites,
          user_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (scanError) {
        console.error("Database error:", scanError);
        toast.error(`Failed to create scan record: ${scanError.message}`);
        return;
      }

      console.log("Scan record created successfully:", scanData);

      if (!scanData?.id) {
        toast.error("No scan ID returned from database");
        return;
      }

      console.log("Calling run-garak-scan Edge Function...");
      
      // Call the Edge Function to run the Garak scan
      const { data: functionData, error: functionError } = await supabase.functions.invoke('run-garak-scan', {
        body: { 
          scanId: scanData.id,
          model: `${modelType}/${modelName}`,
          test_suites: selectedSuites
        }
      });

      console.log("Edge Function response:", functionData);
      console.log("Edge Function error:", functionError);

      if (functionError) {
        console.error("Edge function error:", functionError);
        toast.error(`Edge function error: ${functionError.message}`);
        return;
      }

      toast.success("Garak scan started successfully!");
      navigate('/llm-results');
      
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to create Garak scan: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Scan Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this scan"
          required
        />
      </div>

      <ModelSelect
        modelType={modelType}
        modelName={modelName}
        onModelTypeChange={setModelType}
        onModelNameChange={setModelName}
      />

      <TestSuiteSelect
        selectedSuites={selectedSuites}
        onSuitesChange={setSelectedSuites}
      />

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Scan...
          </>
        ) : (
          "Create Garak Scan"
        )}
      </Button>
    </form>
  );
};