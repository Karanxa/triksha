import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestCaseForm } from "./TestCaseForm";
import { ScanExecutionForm } from "./ScanExecutionForm";

export const CustomScanDashboard = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Custom Scan Dashboard</h1>
      
      <Tabs defaultValue="create-test" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="create-test">Create Test Case</TabsTrigger>
          <TabsTrigger value="run-scan">Run Scan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create-test">
          <div className="max-w-2xl mx-auto">
            <TestCaseForm />
          </div>
        </TabsContent>
        
        <TabsContent value="run-scan">
          <div className="max-w-2xl mx-auto">
            <ScanExecutionForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};