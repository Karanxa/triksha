import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

const LLMResults = () => {
  const mockResults = [
    {
      id: 1,
      type: "Manual Prompt",
      timestamp: "11/15/2024, 5:17:26 PM",
      prompt: "hey",
      result: "Hello! How can I assist you today?",
      model: "gpt-4o",
      provider: "openai",
    },
    {
      id: 2,
      type: "Batch Scan",
      timestamp: "11/11/2024, 11:16:23 PM",
      prompt: "what is your name",
      result: "I am an AI assistant.",
      model: "gpt-4o",
      provider: "openai",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">LLM Results</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-48">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="manual">Manual Prompt</SelectItem>
                <SelectItem value="batch">Batch Scan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by Label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="secondary" className="ml-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.type}</TableCell>
                  <TableCell>{result.timestamp}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {result.prompt}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {result.result}
                  </TableCell>
                  <TableCell>{result.model}</TableCell>
                  <TableCell>{result.provider}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a label"
                        className="h-8 w-32"
                      />
                      <Button variant="secondary" size="sm">
                        Add Label
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default LLMResults;