import React from 'react';
import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleLoginProps {
  onSuccess: () => void;
  onError: () => void;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
  const session = useSession();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          user_id: session?.user.id,
          provider: 'google',
          settings: {
            access_token: credentialResponse.credential
          }
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error storing Google credentials:', error);
      onError();
    }
  };

  return (
    <GoogleOAuthLogin
      onSuccess={handleSuccess}
      onError={onError}
      useOneTap
    />
  );
};