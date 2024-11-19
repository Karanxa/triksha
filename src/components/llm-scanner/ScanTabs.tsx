import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { GarakScanForm } from "../garak-scan/GarakScanForm";
import { PromptFuzzingForm } from "../prompt-fuzzing/PromptFuzzingForm";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="basic" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-3">Custom Scan</TabsTrigger>
        <TabsTrigger value="garak" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-3">Garak</TabsTrigger>
        <TabsTrigger value="fuzzer" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-3">Security Fuzzer</TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-0">
        <ScanForm />
      </TabsContent>
      <TabsContent value="garak" className="mt-0">
        <GarakScanForm />
      </TabsContent>
      <TabsContent value="fuzzer" className="mt-0">
        <PromptFuzzingForm />
      </TabsContent>
    </Tabs>
  );
};