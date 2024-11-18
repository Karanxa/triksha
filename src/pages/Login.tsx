import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Geraid</h1>
          <p className="text-xl text-muted-foreground">
            An E2E LLM Offensive Security Testing Platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Developed by {" "}
            <a 
              href="https://twitter.com/itskaranxa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Karan Arora
            </a>
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: { fontFamily: 'inherit' },
              input: { fontFamily: 'inherit' },
              label: { fontFamily: 'inherit' },
              anchor: { fontFamily: 'inherit' }
            }
          }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Login;