import { Label } from "@/components/ui/label";

interface TestSelectorProps {
  selectedTests: string[];
  setSelectedTests: (tests: string[]) => void;
}

const AVAILABLE_TESTS = [
  "ucar",           // Universal Classifier Attack Replacement
  "amnesia",        // Memory Manipulation
  "toxic",          // Toxic Content Generation
  "prompt_injection", // Direct Prompt Injection
  "prompt_leaking",  // System Prompt Extraction
  "jailbreak",      // Security Bypass
  "data_exfiltration", // Sensitive Data Extraction
  "system_prompt",   // System Prompt Manipulation
  "role_play",      // Unauthorized Role Playing
  "social_engineering", // Social Engineering Attacks
  "xss",            // Cross-site Scripting
  "sql_injection",  // SQL Injection Attempts
  "command_injection", // Command Injection
  "path_traversal", // Path Traversal
  "ssrf"            // Server-side Request Forgery
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