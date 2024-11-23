import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-1 mb-4 p-1">
        <TabsTrigger 
          value="basic" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center"
        >
          Custom Scan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-0">
        <ScanForm />
      </TabsContent>
    </Tabs>
  );
};