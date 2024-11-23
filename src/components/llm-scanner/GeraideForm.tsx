import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ProviderSelect from "@/components/augment-prompt/ProviderSelect";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";

export const GeraideForm = () => {
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement Geraide scan logic
      toast.success("Scan started successfully");
    } catch (error) {
      toast.error("Failed to start scan");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProviderSelect
        value={provider}
        onValueChange={setProvider}
      />

      <AttackCategorySelect
        value={category}
        onValueChange={setCategory}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Starting Scan..." : "Start Geraide Scan"}
      </Button>
    </form>
  );
};