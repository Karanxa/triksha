import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScanStatusHandlerProps {
  scanId: string | null;
  scanType: string;
  onProgressUpdate: (progress: number) => void;
  onResultUpdate: (results: any) => void;
}

export const ScanStatusHandler = ({ 
  scanId, 
  scanType,
  onProgressUpdate,
  onResultUpdate
}: ScanStatusHandlerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!scanId) return;

    console.log('Setting up subscription for scan:', scanId);

    const subscription = supabase
      .channel(`scan_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'llm_scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          console.log('Received update for scan:', payload);

          if (payload.new.status === 'processing') {
            const progress = payload.new.results?.progress || 0;
            onProgressUpdate(progress);
          } else if (payload.new.status === 'completed') {
            onProgressUpdate(100);
            if (scanType === 'batch_scan') {
              toast.success('Batch scan completed! View results in the Results page.');
              navigate('/llm-results');
            } else {
              toast.success('Scan completed successfully');
              onResultUpdate(payload.new.results?.responses || []);
            }
          } else if (payload.new.status === 'failed') {
            toast.error('Scan failed: ' + (payload.new.results?.error || 'Unknown error'));
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription for scan:', scanId);
      subscription.unsubscribe();
    };
  }, [scanId, scanType, navigate, onProgressUpdate, onResultUpdate]);

  return null;
};