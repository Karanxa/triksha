import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ModelSelect } from "../garak-scan/ModelSelect";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export const ScanExecutionForm = () => {
  const session = useSession();
  const [name, setName] = useState("");
  const [modelType, setModelType] = useState("");
  const [modelName, setModelName] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: testCases, isLoading: isLoadingTests } = useQuery({
    queryKey: ['custom-scan-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_scan_tests')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !modelType || !modelName || selectedTests.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to create a scan");
      return;
    }

    setIsLoading(true);

    try {
      const { data: scanData, error: scanError } = await supabase
        .from('custom_scan_executions')
        .insert({
          name,
          model: `${modelType}/${modelName}`,
          test_ids: selectedTests,
          user_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (scanError) throw scanError;
      if (!scanData?.id) throw new Error("No scan ID returned");

      // Call Edge Function to run scan
      const { error: functionError } = await supabase.functions.invoke('run-custom-scan', {
        body: { 
          scanId: scanData.id,
          model: `${modelType}/${modelName}`,
          testIds: selectedTests
        }
      });

      if (functionError) throw functionError;

      toast.success("Custom scan started successfully!");
      
    } catch (error: any) {
      console.error("Scan creation error:", error);
      toast.error("Failed to create scan: " + error.message);
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

      <div className="space-y-2">
        <Label>Select Test Cases</Label>
        <ScrollArea className="h-[200px] border rounded-md p-4">
          {isLoadingTests ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {testCases?.map((test) => (
                <label key={test.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTests.includes(test.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTests([...selectedTests, test.id]);
                      } else {
                        setSelectedTests(selectedTests.filter(id => id !== test.id));
                      }
                    }}
                  />
                  <span className="text-sm">{test.name}</span>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

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
          "Start Custom Scan"
        )}
      </Button>
    </form>
  );
};