import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ScanFormScheduleProps {
  schedule: string;
  onScheduleChange: (value: string) => void;
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
  onScheduleDetailsChange?: (details: {
    hour?: number;
    minute?: number;
    day?: number;
    month?: number;
    weekday?: number;
  }) => void;
}

export const ScanFormSchedule = ({
  schedule,
  onScheduleChange,
  isRecurring,
  onRecurringChange,
  onScheduleDetailsChange
}: ScanFormScheduleProps) => {
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [day, setDay] = useState<number>(1);
  const [weekday, setWeekday] = useState<number>(0);

  const handleTimeChange = (newHour: number, newMinute: number) => {
    setHour(newHour);
    setMinute(newMinute);
    onScheduleDetailsChange?.({ hour: newHour, minute: newMinute });
  };

  const handleDayChange = (newDay: number) => {
    setDay(newDay);
    onScheduleDetailsChange?.({ day: newDay });
  };

  const handleWeekdayChange = (newWeekday: number) => {
    setWeekday(newWeekday);
    onScheduleDetailsChange?.({ weekday: newWeekday });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Schedule (Optional)</Label>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Coming in a few days
          </Badge>
        </div>
        <Select 
          value={schedule} 
          onValueChange={onScheduleChange}
          disabled={true}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select schedule frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Schedule</SelectItem>
            <SelectItem value="hourly">Every Hour</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        {schedule !== "none" && schedule !== "hourly" && (
          <div className="space-y-4 opacity-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hour (24h)</Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => handleTimeChange(parseInt(e.target.value), minute)}
                  disabled={true}
                />
              </div>
              <div className="space-y-2">
                <Label>Minute</Label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => handleTimeChange(hour, parseInt(e.target.value))}
                  disabled={true}
                />
              </div>
            </div>

            {schedule === "monthly" && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={(e) => handleDayChange(parseInt(e.target.value))}
                  disabled={true}
                />
              </div>
            )}

            {schedule === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select 
                  value={weekday.toString()} 
                  onValueChange={(v) => handleWeekdayChange(parseInt(v))}
                  disabled={true}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {schedule !== "none" && (
        <div className="flex items-center space-x-2 opacity-50">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={onRecurringChange}
            disabled={true}
          />
          <Label htmlFor="recurring">Make this scan recurring</Label>
        </div>
      )}
    </>
  );
};