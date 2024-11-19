import { Label } from "@/components/ui/label";

interface TestSelectorProps {
  selectedTests: string[];
  setSelectedTests: (tests: string[]) => void;
}

const AVAILABLE_TESTS = [
  "ucar", "amnesia", "toxic", "prompt_injection", "prompt_leaking",
  "jailbreak", "data_exfiltration", "system_prompt", "role_play",
  "social_engineering", "xss", "sql_injection", "command_injection",
  "path_traversal", "ssrf"
];

export const TestSelector = ({ selectedTests, setSelectedTests }: TestSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Select Tests</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {AVAILABLE_TESTS.map((test) => (
          <label key={test} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTests.includes(test)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTests([...selectedTests, test]);
                } else {
                  setSelectedTests(selectedTests.filter(t => t !== test));
                }
              }}
              className="form-checkbox h-4 w-4"
            />
            <span className="text-sm">{test}</span>
          </label>
        ))}
      </div>
    </div>
  );
};