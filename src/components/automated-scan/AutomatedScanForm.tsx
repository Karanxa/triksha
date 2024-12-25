import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ProviderSelect from "@/components/augment-prompt/ProviderSelect";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";

export const AutomatedScanForm = () => {
  const session = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [isActive, setIsActive] = useState(true);
  const [prompts, setPrompts] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in to create automated scans");
      return;
    }

    // Extract model from provider string (format: "provider-model")
    const [providerName, model] = provider.split('-');
    if (!model) {
      toast.error("Please select both a provider and a model");
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_llm_scans')
        .insert({
          user_id: session.user.id,
          name,
          description,
          provider: providerName,
          model,
          prompts: JSON.parse(JSON.stringify(prompts.split('\n').filter(p => p.trim()))),
          schedule,
          is_active: isActive,
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Set next run to tomorrow
        });

      if (error) throw error;

      toast.success("Automated scan created successfully");
      setName("");
      setDescription("");
      setProvider("");
      setCategory("");
      setPrompts("");
      
    } catch (error: any) {
      toast.error("Failed to create automated scan: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Scan Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this automated scan"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this automated scan"
        />
      </div>

      <ProviderSelect
        value={provider}
        onValueChange={setProvider}
      />

      <AttackCategorySelect
        value={category}
        onValueChange={setCategory}
      />

      <div className="space-y-2">
        <Label htmlFor="schedule">Schedule</Label>
        <Select value={schedule} onValueChange={setSchedule}>
          <SelectTrigger>
            <SelectValue placeholder="Select schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Every Hour</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompts">Test Prompts</Label>
        <Textarea
          id="prompts"
          value={prompts}
          onChange={(e) => setPrompts(e.target.value)}
          placeholder="Enter your test prompts (one per line)"
          className="min-h-[200px]"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          id="active"
        />
        <Label htmlFor="active">Enable Scan</Label>
      </div>

      <Button type="submit" className="w-full">
        Create Automated Scan
      </Button>
    </form>
  );
};