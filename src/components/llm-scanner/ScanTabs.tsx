import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "./ScanForm";
import { GarakScanForm } from "../garak-scan/GarakScanForm";
import { PromptFuzzingForm } from "../prompt-fuzzing/PromptFuzzingForm";

export const ScanTabs = () => {
  return (
    <Tabs defaultValue="llm" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="llm">LLM Scan</TabsTrigger>
        <TabsTrigger value="garak">Garak Scan</TabsTrigger>
        <TabsTrigger value="fuzzing">Prompt Fuzzing</TabsTrigger>
      </TabsList>
      <TabsContent value="llm">
        <ScanForm onSubmit={async () => {}} isScanning={false} />
      </TabsContent>
      <TabsContent value="garak">
        <GarakScanForm />
      </TabsContent>
      <TabsContent value="fuzzing">
        <PromptFuzzingForm />
      </TabsContent>
    </Tabs>
  );
};