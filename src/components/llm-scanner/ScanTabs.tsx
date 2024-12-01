import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";

interface ScanTabsProps {
  initialTab?: string;
}

export const ScanTabs = ({ initialTab = "basic" }: ScanTabsProps) => {
  return (
    <Tabs defaultValue={initialTab} className="w-full space-y-6">
      <TabsList className="w-full">
        <TabsTrigger 
          value="basic" 
          className="text-xs md:text-sm whitespace-normal h-auto min-h-[40px] text-center w-full"
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