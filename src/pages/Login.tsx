import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";

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
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Triksha
            </h1>
          </div>
          <div className="space-y-2">
            <p className="text-xl text-muted-foreground">
              An E2E LLM Offensive Security Testing Platform
            </p>
            <p className="text-sm text-muted-foreground">
              Developed by{" "}
              <a 
                href="https://twitter.com/itskaranxa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Karan Arora
              </a>
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#9b87f5',
                    brandAccent: '#7E69AB',
                  },
                },
              },
              style: {
                button: { 
                  fontFamily: 'inherit',
                  background: '#9b87f5',
                  color: 'white',
                  borderRadius: '0.5rem',
                },
                input: { 
                  fontFamily: 'inherit',
                  background: 'transparent',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                },
                label: { 
                  fontFamily: 'inherit',
                  color: 'hsl(var(--foreground))',
                },
                anchor: { 
                  fontFamily: 'inherit',
                  color: '#9b87f5',
                },
                message: {
                  fontFamily: 'inherit',
                  color: 'hsl(var(--foreground))',
                }
              }
            }}
            providers={[]}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;