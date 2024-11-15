import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/llm-scanner", label: "LLM Scanner" },
    { href: "/llm-results", label: "Results" },
    { href: "/datasets", label: "Datasets" },
    { href: "/augment-prompt", label: "Augment Prompt" },
    { href: "/fine-tuning", label: "Fine Tuning" },
  ];

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            to="/settings"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/settings"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Keys
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;