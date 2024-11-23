import { Card, CardContent } from "@/components/ui/card";
import { GeraideForm } from "@/components/geraide/GeraideForm";

const Geraide = () => {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Geraide Analysis</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Advanced LLM testing with automated analysis and reporting
      </p>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-4 md:pt-6">
          <GeraideForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Geraide;