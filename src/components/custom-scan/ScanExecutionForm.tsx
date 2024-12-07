import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ProviderSelect from "@/components/augment-prompt/ProviderSelect";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  testIds: z.array(z.string()).min(1, "At least one test must be selected"),
});

type FormValues = z.infer<typeof formSchema>;

interface ScanExecutionFormProps {
  selectedTests: string[];
  onSubmit: (values: FormValues) => void;
  isSubmitting?: boolean;
}

export function ScanExecutionForm({
  selectedTests,
  onSubmit,
  isSubmitting = false,
}: ScanExecutionFormProps) {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      provider: "",
      model: "",
      testIds: selectedTests,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      toast.success("Scan execution created successfully");
      navigate("/llm-scanner");
    } catch (error) {
      toast.error("Failed to create scan execution");
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ProviderSelect
            value={`${form.watch("provider")}-${form.watch("model")}`}
            onValueChange={(value) => {
              const [provider, model] = value.split('-');
              form.setValue("provider", provider);
              form.setValue("model", model);
            }}
          />
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/llm-scanner")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Scan"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}