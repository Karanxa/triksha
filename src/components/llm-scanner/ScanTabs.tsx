import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { GeraideScanForm } from "@/components/geraide/GeraideScanForm";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-2 mb-4 p-1">
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
          Geraide Scan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-0">
        <ScanForm />
      </TabsContent>
      <TabsContent value="geraide" className="mt-0">
        <GeraideScanForm />
      </TabsContent>
    </Tabs>
  );
};