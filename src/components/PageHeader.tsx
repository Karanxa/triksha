import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const PageHeader = ({ icon: Icon, title, description, action }: PageHeaderProps) => {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
      <div className="relative p-6 md:p-8 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              {description}
            </p>
          </div>
          {action && (
            <div className="hidden md:block">
              {action}
            </div>
          )}
        </div>
        {action && (
          <div className="mt-4 md:hidden">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;