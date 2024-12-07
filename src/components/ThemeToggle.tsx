import { Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";

const ThemeToggle = () => {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      description: "Dark mode is enforced in this application",
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="w-9 h-9 rounded-full"
    >
      <Moon className="h-5 w-5" />
      <span className="sr-only">Theme is locked to dark mode</span>
    </Button>
  );
};

export default ThemeToggle;