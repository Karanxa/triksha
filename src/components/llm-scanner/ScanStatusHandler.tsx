import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScanStatusHandlerProps {
  scanId: string | null;
  scanType: string;
  onResultUpdate: (results: any) => void;
  onProgress: (progress: number) => void;
}

export const ScanStatusHandler = ({ 
  scanId, 
  scanType,
  onResultUpdate,
  onProgress
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

          // Update progress
          const progress = payload.new.results?.progress || 0;
          onProgress(progress);

          if (payload.new.status === 'completed') {
            if (scanType === 'batch') {
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

    // Keep subscription active even if component unmounts
    return () => {
      console.log('Cleaning up subscription for scan:', scanId);
      if (scanType === 'manual') {
        subscription.unsubscribe();
      }
    };
  }, [scanId, scanType, navigate, onResultUpdate, onProgress]);

  return null;
};