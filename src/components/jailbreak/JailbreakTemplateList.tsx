import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

interface JailbreakTemplateListProps {
  templates: Tables<"jailbreak_templates">[];
  isLoading: boolean;
}

export const JailbreakTemplateList = ({
  templates,
  isLoading,
}: JailbreakTemplateListProps) => {
  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (!templates.length) {
    return <div>No templates found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {template.name}
            </CardTitle>
            {template.is_public ? (
              <Unlock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{template.category}</Badge>
                {template.success_rate !== null && (
                  <Badge variant="outline">
                    {Math.round(template.success_rate * 100)}% success
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium">Base Prompt:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.base_prompt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};