import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ApiKeyCardProps {
  title: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export const ApiKeyCard = ({ 
  title, 
  description, 
  value, 
  placeholder, 
  onChange 
}: ApiKeyCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type={title === "Ollama Endpoint" ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </CardContent>
    </Card>
  );
};