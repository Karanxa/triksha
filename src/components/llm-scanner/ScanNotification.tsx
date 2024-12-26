import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const ScanNotification = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to all scan status changes for the current user
      const scanSubscription = supabase
        .channel('scan-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'llm_scans',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const scanName = payload.new.name || 'Scan';
            
            if (payload.new.status === 'completed') {
              toast.success(`${scanName} completed!`, {
                action: {
                  label: 'View Results',
                  onClick: () => navigate('/llm-results'),
                },
              });
            } else if (payload.new.status === 'failed') {
              toast.error(`${scanName} failed`, {
                description: payload.new.results?.error || 'An unknown error occurred',
              });
            } else if (payload.new.status === 'processing') {
              const progress = payload.new.results?.progress || 0;
              if (progress > 0 && progress % 25 === 0) { // Show progress at 25%, 50%, 75%
                toast.info(`${scanName} is ${progress}% complete`, {
                  description: 'Processing continues in the background'
                });
              }
            }
          }
        )
        .subscribe();

      // Subscribe to contextual scan updates
      const contextualSubscription = supabase
        .channel('contextual-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'contextual_scans',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new.fingerprint_results) {
              toast.success('Model fingerprinting completed', {
                description: 'Starting dataset analysis phase'
              });
            }
            
            if (payload.new.dataset_analysis_results) {
              toast.success('Contextual analysis completed!', {
                action: {
                  label: 'View Results',
                  onClick: () => navigate('/llm-results'),
                },
              });
            }
          }
        )
        .subscribe();

      return () => {
        scanSubscription.unsubscribe();
        contextualSubscription.unsubscribe();
      };
    };

    getUser();
  }, [navigate]);

  return null;
};