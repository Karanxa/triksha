import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { GarakScanForm } from "../garak-scan/GarakScanForm";
import { PromptFuzzingForm } from "../prompt-fuzzing/PromptFuzzingForm";
import { RedTeaming } from "../red-teaming/RedTeaming";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-4 mb-4 p-1">
        <TabsTrigger 
          value="basic" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Custom Scan
        </TabsTrigger>
        <TabsTrigger 
          value="garak" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Garak
        </TabsTrigger>
        <TabsTrigger 
          value="fuzzer" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Security Fuzzer
        </TabsTrigger>
        <TabsTrigger 
          value="red-teaming" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Red Teaming
        </TabsTrigger>
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
      <TabsContent value="red-teaming" className="mt-0">
        <RedTeaming />
      </TabsContent>
    </Tabs>
  );
};