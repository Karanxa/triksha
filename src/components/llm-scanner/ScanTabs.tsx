import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { GarakScanForm } from "../garak-scan/GarakScanForm";
import { PromptFuzzingForm } from "../prompt-fuzzing/PromptFuzzingForm";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Custom Scan</TabsTrigger>
        <TabsTrigger value="garak">Garak</TabsTrigger>
        <TabsTrigger value="fuzzer">Security Fuzzer</TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <ScanForm />
      </TabsContent>
      <TabsContent value="garak">
        <GarakScanForm />
      </TabsContent>
      <TabsContent value="fuzzer">
        <PromptFuzzingForm />
      </TabsContent>
    </Tabs>
  );
};