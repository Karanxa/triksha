import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleConfigProps {
  schedule: string;
  scheduleHour: number;
  scheduleMinute: number;
  scheduleDay: number;
  scheduleWeekday: number;
  onScheduleHourChange: (value: number) => void;
  onScheduleMinuteChange: (value: number) => void;
  onScheduleDayChange: (value: number) => void;
  onScheduleWeekdayChange: (value: number) => void;
}

export const ScheduleConfig = ({
  schedule,
  scheduleHour,
  scheduleMinute,
  scheduleDay,
  scheduleWeekday,
  onScheduleHourChange,
  onScheduleMinuteChange,
  onScheduleDayChange,
  onScheduleWeekdayChange,
}: ScheduleConfigProps) => {
  return (
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
              onChange={(e) => onScheduleHourChange(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Minute (0-59)</Label>
            <Input
              type="number"
              min={0}
              max={59}
              value={scheduleMinute}
              onChange={(e) => onScheduleMinuteChange(parseInt(e.target.value))}
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
            onChange={(e) => onScheduleWeekdayChange(parseInt(e.target.value))}
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
            onChange={(e) => onScheduleDayChange(parseInt(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};