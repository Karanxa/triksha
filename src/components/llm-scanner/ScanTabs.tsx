import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { ContextualEngine } from "./contextual-engine/components/ContextualEngine";
import { DynamicScan } from "./dynamic-scan/DynamicScan";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger 
          value="basic" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Custom Scan
        </TabsTrigger>
        <TabsTrigger 
          value="geraide" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Contextual Analysis
        </TabsTrigger>
        <TabsTrigger 
          value="dynamic" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Dynamic Scan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-0">
        <ScanForm />
      </TabsContent>
      <TabsContent value="geraide" className="mt-0">
        <ContextualEngine />
      </TabsContent>
      <TabsContent value="dynamic" className="mt-0">
        <DynamicScan />
      </TabsContent>
    </Tabs>
  );
};