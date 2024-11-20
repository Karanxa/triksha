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
    
    // Throw explicit errors for missing fields
    if (!name) {
      throw new Error("Scan name is required");
    }
    if (!modelType) {
      throw new Error("Model type is required");
    }
    if (!modelName) {
      throw new Error("Model name is required");
    }
    if (selectedSuites.length === 0) {
      throw new Error("At least one test suite must be selected");
    }
    if (!session?.user?.id) {
      throw new Error("User must be logged in to create a scan");
    }

    setIsLoading(true);
    try {
      // Create the scan record
      const { data: scanData, error: scanError } = await supabase
        .from('garak_scans')
        .insert({
          name,
          model: `${modelType}/${modelName}`,
          prompts: [], // Garak generates its own test prompts
          test_suites: selectedSuites,
          user_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (scanError) {
        throw new Error(`Database error: ${scanError.message}`);
      }

      if (!scanData?.id) {
        throw new Error("No scan ID returned from database");
      }

      // Call the Edge Function to run the Garak scan
      const { data: functionData, error: functionError } = await supabase.functions.invoke('run-garak-scan', {
        body: { 
          scanId: scanData.id,
          model: `${modelType}/${modelName}`,
          test_suites: selectedSuites
        }
      });

      if (functionError) {
        throw new Error(`Edge function error: ${functionError.message}`);
      }

      if (!functionData) {
        throw new Error("No response from edge function");
      }

      toast.success("Garak scan started successfully");
      navigate('/llm-results');
      
    } catch (error: any) {
      setIsLoading(false);
      // Re-throw the error to be caught by the error boundary
      throw error;
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
        {isLoading ? "Creating Scan..." : "Create Garak Scan"}
      </Button>
    </form>
  );
};