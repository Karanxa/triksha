import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, AuthError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthGuard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        // If no session is found, clear any stale state
        if (!currentSession) {
          console.log('No current session found');
          setSession(null);
          setLoading(false);
          return;
        }

        // Set the session if it exists
        console.log('Session found:', currentSession.user.id);
        setSession(currentSession);
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleAuthError(error as AuthError);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in:', currentSession?.user?.id);
          setSession(currentSession);
          break;
          
        case 'SIGNED_OUT':
          console.log('User signed out');
          setSession(null);
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed for user:', currentSession?.user?.id);
          setSession(currentSession);
          break;
          
        case 'USER_UPDATED':
          console.log('User updated:', currentSession?.user?.id);
          setSession(currentSession);
          break;
          
        default:
          console.log('Unhandled auth event:', event);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = async (error: AuthError) => {
    console.error('Auth error:', error);
    
    // Clear invalid session state
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
    }
    
    setSession(null);
    
    // Show error message to user
    toast.error(
      error.message === 'Failed to fetch' 
        ? 'Unable to connect to authentication service. Please check your internet connection.'
        : error.message || 'Authentication error. Please sign in again.'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;