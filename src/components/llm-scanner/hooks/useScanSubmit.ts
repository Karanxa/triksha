import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScanSubmitProps {
  onSubmit: (data: any) => Promise<any>;
  setResult: (result: any) => void;
  setScanId?: (id: string | null) => void;
}

export const useScanSubmit = ({ onSubmit, setResult, setScanId }: ScanSubmitProps) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = async ({
    provider,
    customEndpoint,
    prompts,
    category,
    label,
    schedule,
    isRecurring,
    qps
  }: {
    provider: string;
    customEndpoint?: any;
    prompts: string[];
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
    qps: number;
  }) => {
    setIsScanning(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Extract model from provider string (e.g., "openai-gpt-4" -> "gpt-4")
      const [baseProvider, model] = provider.split('-');
      
      // Create a new scan record with the correct scan_type and model
      const { data: scanData, error: scanError } = await supabase
        .from('llm_scans')
        .insert({
          user_id: user.id,
          name: label || `Scan ${new Date().toISOString()}`,
          category,
          label,
          schedule,
          is_recurring: isRecurring,
          status: 'pending',
          scan_type: prompts.length === 1 ? 'manual_scan' : 'batch_scan',
          results: { 
            prompts,
            model: model || 'custom'
          }
        })
        .select()
        .single();

      if (scanError) {
        throw new Error(`Failed to create scan: ${scanError.message}`);
      }

      if (setScanId) {
        setScanId(scanData.id);
      }

      // Call the edge function with all prompts and model information
      const response = await supabase.functions.invoke('scan-llm', {
        body: {
          scanId: scanData.id,
          prompts,
          provider,
          category,
          label,
          schedule,
          isRecurring,
          qps,
          customEndpoint
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data) {
        throw new Error('No response data received from scan');
      }

      const { results } = response.data;
      setResult(results);
      return results;
    } catch (error) {
      console.error("Scan failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Scan failed: ${errorMessage}`);
      setResult({ error: errorMessage });
      return null;
    } finally {
      setIsScanning(false);
      if (setScanId) {
        setScanId(null);
      }
    }
  };

  return { handleSubmit, isScanning };
};