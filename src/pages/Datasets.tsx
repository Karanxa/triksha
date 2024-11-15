import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Search } from "lucide-react";

interface Dataset {
  id: string;
  title: string;
  description: string;
  downloads: number;
  likes: number;
  formats: string[];
}

const mockDatasets: Dataset[] = [
  {
    id: "1",
    title: "prompt-injections",
    description: "Dataset Card for 'deberta-v3-base-injection-dataset'. More information needed",
    downloads: 1348,
    likes: 47,
    formats: ["CSV", "TXT", "ZIP"],
  },
  {
    id: "2",
    title: "safe-guard-prompt-injection",
    description: "We formulated the prompt injection detector problem as a classification problem and trained models.",
    downloads: 426,
    likes: 3,
    formats: ["CSV", "TXT", "ZIP"],
  },
  {
    id: "3",
    title: "SPML_Chatbot_Prompt_Injection",
    description: "SPML Chatbot Prompt Injection Dataset Arxiv Paper Introducing the SPML Chatbot Prompt",
    downloads: 333,
    likes: 12,
    formats: ["CSV", "TXT", "ZIP"],
  },
];

const Datasets = () => {
  const [useCustomSearch, setUseCustomSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={useCustomSearch}
                onCheckedChange={setUseCustomSearch}
                id="custom-search"
              />
              <label htmlFor="custom-search" className="text-sm">
                Use custom search keywords
              </label>
            </div>
          </div>

          {/* Category Selection */}
          <div className="w-full">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Attack Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
                <SelectItem value="data-extraction">Data Extraction</SelectItem>
                <SelectItem value="model-manipulation">Model Manipulation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dataset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDatasets.map((dataset) => (
              <Card key={dataset.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{dataset.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {dataset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{dataset.downloads} downloads</span>
                    <span>{dataset.likes} likes</span>
                  </div>
                  <div className="flex gap-2">
                    {dataset.formats.map((format) => (
                      <Button
                        key={format}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        {format}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datasets;