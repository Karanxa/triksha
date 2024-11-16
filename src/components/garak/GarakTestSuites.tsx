import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const AVAILABLE_TEST_SUITES = [
  { id: 'injection', name: 'Injection', description: 'Tests for prompt injection vulnerabilities' },
  { id: 'xss', name: 'XSS', description: 'Tests for cross-site scripting patterns' },
  { id: 'harmful', name: 'Harmful Content', description: 'Tests for generation of harmful content' },
  { id: 'bias', name: 'Bias', description: 'Tests for model biases' },
  { id: 'security', name: 'Security', description: 'General security test suite' },
  { id: 'custom', name: 'Custom Tests', description: 'Your custom test configurations' },
];

interface GarakTestSuitesProps {
  selected: string[];
  onSelect: (suites: string[]) => void;
}

export const GarakTestSuites = ({ selected, onSelect }: GarakTestSuitesProps) => {
  const toggleTestSuite = (suiteId: string) => {
    if (selected.includes(suiteId)) {
      onSelect(selected.filter(id => id !== suiteId));
    } else {
      onSelect([...selected, suiteId]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Test Suites</Label>
      <ScrollArea className="h-[120px] rounded-md border p-2">
        <div className="space-y-2">
          {AVAILABLE_TEST_SUITES.map((suite) => (
            <div
              key={suite.id}
              className="flex items-start space-x-2 cursor-pointer hover:bg-accent p-2 rounded-md"
              onClick={() => toggleTestSuite(suite.id)}
            >
              <Badge
                variant={selected.includes(suite.id) ? "default" : "outline"}
                className="cursor-pointer"
              >
                {suite.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {suite.description}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};