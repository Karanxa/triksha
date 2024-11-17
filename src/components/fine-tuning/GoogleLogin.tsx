import { Button } from "@/components/ui/button"
import { useGoogleLogin } from "@react-oauth/google"

interface GoogleLoginProps {
  onSuccess: () => void
  onError: () => void
}

export const GoogleLogin = ({ onSuccess, onError }: GoogleLoginProps) => {
  const login = useGoogleLogin({
    onSuccess: (response) => {
      // Store token in Supabase
      storeGoogleToken(response.access_token)
      onSuccess()
    },
    onError: () => onError(),
    scope: "https://www.googleapis.com/auth/drive.file"
  })

  const storeGoogleToken = async (token: string) => {
    const { error } = await supabase
      .from("integration_settings")
      .upsert({
        user_id: session?.user?.id,
        provider: "google",
        settings: { access_token: token }
      })

    if (error) console.error("Failed to store token:", error)
  }

  return (
    <Button onClick={() => login()} variant="outline">
      Connect Google Account
    </Button>
  )
}