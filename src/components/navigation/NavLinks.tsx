import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const links = [
  { href: "/", label: "Home" },
  { href: "/llm-scanner", label: "Scans" },
  { href: "/automated-scans", label: "Automated" },
  { href: "/llm-results", label: "Results" },
  { href: "/datasets", label: "Datasets" },
  { href: "/augment-prompt", label: "Augmentation" },
  { href: "/fine-tuning", label: "Fine-tuning" },
  { href: "/geraid", label: "Geraid" },
  { href: "/contextual-scan", label: "Contextual Scan" },
];

export const NavLinks = () => {
  const location = useLocation();
  
  return (
    <>
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
    </>
  );
};