import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface TestSuite {
  id: string;
  label: string;
  description: string;
}

interface TestSuiteSelectProps {
  selectedSuites: string[];
  onSuitesChange: (suites: string[]) => void;
}

const TEST_SUITES: TestSuite[] = [
  { id: "art", label: "Art Tests", description: "Tests for art-related vulnerabilities" },
  { id: "continuation", label: "Continuation Tests", description: "Tests for continuation attacks" },
  { id: "dan", label: "DAN Tests", description: "Tests for DAN-style jailbreaks" },
  { id: "encoding", label: "Encoding Tests", description: "Tests for encoding-based attacks" },
  { id: "glitch", label: "Glitch Tests", description: "Tests for glitch exploits" },
  { id: "goodside", label: "Goodside Tests", description: "Tests from Riley Goodside's research" },
  { id: "knownbadsignatures", label: "Known Bad Signatures", description: "Tests for known malicious patterns" },
  { id: "leakreplay", label: "Leak Replay Tests", description: "Tests for information leakage" },
  { id: "lmrc", label: "LMRC Tests", description: "Language Model Risk Card tests" },
  { id: "malwaregen", label: "Malware Generation Tests", description: "Tests for malware generation capabilities" },
  { id: "misleading", label: "Misleading Tests", description: "Tests for misleading responses" },
  { id: "promptinject", label: "Prompt Injection Tests", description: "Tests for prompt injection attacks" },
  { id: "realtoxicityprompts", label: "Real Toxicity Tests", description: "Tests using real toxic prompts" },
  { id: "snowball", label: "Snowball Tests", description: "Tests for recursive expansion" },
  { id: "test", label: "Basic Tests", description: "Basic test suite" },
  { id: "xss", label: "XSS Tests", description: "Tests for XSS-style attacks" }
];

export const TestSuiteSelect = ({ selectedSuites, onSuitesChange }: TestSuiteSelectProps) => {
  return (
    <div className="space-y-4">
      <Label>Test Suites</Label>
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {TEST_SUITES.map((suite) => (
                <div key={suite.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={suite.id}
                    checked={selectedSuites.includes(suite.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSuitesChange([...selectedSuites, suite.id]);
                      } else {
                        onSuitesChange(selectedSuites.filter((id) => id !== suite.id));
                      }
                    }}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={suite.id} className="font-medium">
                      {suite.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {suite.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};