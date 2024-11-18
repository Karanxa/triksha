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
      const subscription = supabase
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
            if (payload.new.status === 'completed') {
              toast.success('Batch scan completed!', {
                action: {
                  label: 'View Results',
                  onClick: () => navigate('/llm-results'),
                },
              });
            } else if (payload.new.status === 'failed') {
              toast.error('Batch scan failed', {
                description: payload.new.results?.error || 'An unknown error occurred',
              });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    getUser();
  }, [navigate]);

  return null;
};