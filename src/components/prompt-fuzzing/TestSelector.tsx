import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface TestSelectorProps {
  selectedTests: string[];
  setSelectedTests: (tests: string[]) => void;
}

const AVAILABLE_TESTS = [
  { id: "ucar", label: "Universal Classifier Attack Replacement" },
  { id: "amnesia", label: "Memory Manipulation" },
  { id: "toxic", label: "Toxic Content Generation" },
  { id: "prompt_injection", label: "Direct Prompt Injection" },
  { id: "prompt_leaking", label: "System Prompt Extraction" },
  { id: "jailbreak", label: "Security Bypass" },
  { id: "data_exfiltration", label: "Sensitive Data Extraction" },
  { id: "system_prompt", label: "System Prompt Manipulation" },
  { id: "role_play", label: "Unauthorized Role Playing" },
  { id: "social_engineering", label: "Social Engineering Attacks" },
  { id: "xss", label: "Cross-site Scripting" },
  { id: "sql_injection", label: "SQL Injection Attempts" },
  { id: "command_injection", label: "Command Injection" },
  { id: "path_traversal", label: "Path Traversal" },
  { id: "ssrf", label: "Server-side Request Forgery" }
];

export const TestSelector = ({ selectedTests, setSelectedTests }: TestSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Select Tests</Label>
      <ScrollArea className="h-[200px] border rounded-md p-4">
        <div className="space-y-2">
          {AVAILABLE_TESTS.map((test) => (
            <label key={test.id} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedTests.includes(test.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTests([...selectedTests, test.id]);
                  } else {
                    setSelectedTests(selectedTests.filter(t => t !== test.id));
                  }
                }}
              />
              <span className="text-sm">{test.label}</span>
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};