import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

type ScanTestCategory = "prompt_injection" | "data_leakage" | "model_behavior" | "safety_bounds" | "system_prompt" | "performance";

const TEST_CATEGORIES: ScanTestCategory[] = [
  "prompt_injection",
  "data_leakage",
  "model_behavior",
  "safety_bounds",
  "system_prompt",
  "performance"
];

export const TestCaseForm = () => {
  const session = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ScanTestCategory>("prompt_injection");
  const [testPrompt, setTestPrompt] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in to create test cases");
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_scan_tests')
        .insert({
          user_id: session.user.id,
          name,
          description,
          category,
          test_prompt: testPrompt,
          expected_behavior: expectedBehavior
        });

      if (error) throw error;

      toast.success("Test case created successfully!");
      setName("");
      setDescription("");
      setCategory("prompt_injection");
      setTestPrompt("");
      setExpectedBehavior("");
      
    } catch (error: any) {
      toast.error("Failed to create test case: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Test Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter test case name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this test"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value: ScanTestCategory) => setCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select test category" />
          </SelectTrigger>
          <SelectContent>
            {TEST_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="testPrompt">Test Prompt</Label>
        <Textarea
          id="testPrompt"
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          placeholder="Enter the prompt to test"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedBehavior">Expected Behavior</Label>
        <Textarea
          id="expectedBehavior"
          value={expectedBehavior}
          onChange={(e) => setExpectedBehavior(e.target.value)}
          placeholder="Describe the expected model behavior"
        />
      </div>

      <Button type="submit" className="w-full">
        Create Test Case
      </Button>
    </form>
  );
};