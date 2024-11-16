import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ScanResponse } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function updateScanStatus(scanId: string, status: 'processing' | 'completed' | 'failed', results?: ScanResponse) {
  console.log(`Updating scan ${scanId} status to ${status}`);
  
  const updateData: any = {
    status,
    results: results || null
  };

  if (results?.is_vulnerable !== undefined) {
    updateData.is_vulnerable = results.is_vulnerable;
  }

  const { error } = await supabase
    .from('llm_scans')
    .update(updateData)
    .eq('id', scanId);

  if (error) {
    console.error('Error updating scan status:', error);
    throw error;
  }
}