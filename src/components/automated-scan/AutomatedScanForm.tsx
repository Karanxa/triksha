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
  
  // New state for specific time scheduling
  const [scheduleHour, setScheduleHour] = useState(0);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [scheduleDay, setScheduleDay] = useState(1);
  const [scheduleWeekday, setScheduleWeekday] = useState(0);
  const [scheduleMonth, setScheduleMonth] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in to create automated scans");
      return;
    }

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
          schedule_hour: scheduleHour,
          schedule_minute: scheduleMinute,
          schedule_day: scheduleDay,
          schedule_weekday: scheduleWeekday,
          next_run: calculateNextRun(schedule, scheduleHour, scheduleMinute, scheduleDay, scheduleWeekday)
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

  const calculateNextRun = (
    schedule: string,
    hour: number,
    minute: number,
    day: number,
    weekday: number
  ) => {
    const now = new Date();
    let nextRun = new Date();

    switch (schedule) {
      case 'hourly':
        nextRun.setMinutes(minute);
        if (nextRun <= now) {
          nextRun.setHours(nextRun.getHours() + 1);
        }
        break;
      case 'daily':
        nextRun.setHours(hour, minute, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        nextRun.setHours(hour, minute, 0, 0);
        const daysUntilWeekday = weekday - now.getDay();
        nextRun.setDate(now.getDate() + (daysUntilWeekday <= 0 ? 7 + daysUntilWeekday : daysUntilWeekday));
        break;
      case 'monthly':
        nextRun.setDate(day);
        nextRun.setHours(hour, minute, 0, 0);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun.toISOString();
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

      <div className="space-y-4">
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

        <div className="grid gap-4">
          {schedule !== 'hourly' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hour (0-23)</Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={scheduleHour}
                  onChange={(e) => setScheduleHour(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Minute (0-59)</Label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={scheduleMinute}
                  onChange={(e) => setScheduleMinute(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          {schedule === 'weekly' && (
            <div className="space-y-2">
              <Label>Day of Week (0-6, Sunday is 0)</Label>
              <Input
                type="number"
                min={0}
                max={6}
                value={scheduleWeekday}
                onChange={(e) => setScheduleWeekday(parseInt(e.target.value))}
              />
            </div>
          )}

          {schedule === 'monthly' && (
            <div className="space-y-2">
              <Label>Day of Month (1-31)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={scheduleDay}
                onChange={(e) => setScheduleDay(parseInt(e.target.value))}
              />
            </div>
          )}
        </div>
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