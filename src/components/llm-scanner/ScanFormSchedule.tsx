import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ScanFormScheduleProps {
  schedule: string;
  onScheduleChange: (value: string) => void;
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
}

export const ScanFormSchedule = ({
  schedule,
  onScheduleChange,
  isRecurring,
  onRecurringChange
}: ScanFormScheduleProps) => {
  return (
    <>
      <div className="space-y-4">
        <Label>Schedule (Optional)</Label>
        <Select value={schedule} onValueChange={onScheduleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select schedule frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Schedule</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {schedule !== "none" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={onRecurringChange}
          />
          <Label htmlFor="recurring">Make this scan recurring</Label>
        </div>
      )}
    </>
  );
};