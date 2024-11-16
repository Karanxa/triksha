import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { useScanSubmit } from "./hooks/useScanSubmit";

export const ScanTabs = () => {
  const { handleSubmit, isScanning } = useScanSubmit({
    onSubmit: async (data) => {
      // Implementation will be handled by ScanForm
      console.log("Scan data:", data);
    },
    setResult: () => {} // This will be handled by ScanForm
  });

  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Manual Scan</TabsTrigger>
        <TabsTrigger value="batch">Batch Scan</TabsTrigger>
      </TabsList>
      <TabsContent value="manual">
        <ScanForm onSubmit={handleSubmit} />
      </TabsContent>
      <TabsContent value="batch">
        <ScanForm onSubmit={handleSubmit} />
      </TabsContent>
    </Tabs>
  );
};