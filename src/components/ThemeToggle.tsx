import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Ensure dark mode is always set
    document.documentElement.classList.add("dark");
    setIsDark(true);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      toast({
        description: "Dark mode enabled",
      });
    } else {
      document.documentElement.classList.remove("dark");
      toast({
        description: "Light mode enabled",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full"
    >
      {isDark ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;