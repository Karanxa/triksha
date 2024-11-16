import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { TablesInsert } from "@/integrations/supabase/types";

// Define the schema to match the required database fields
const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  base_prompt: z.string().min(1, "Base prompt is required"),
  is_public: z.boolean().default(false),
  target_models: z.array(z.string()).optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export const JailbreakTemplateForm = () => {
  const session = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      base_prompt: "",
      is_public: false,
      target_models: [],
    },
  });

  const onSubmit = async (values: TemplateFormValues) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to create templates");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the insert object with all required fields
      const insertData: TablesInsert<"jailbreak_templates"> = {
        user_id: session.user.id,
        name: values.name,
        description: values.description,
        category: values.category,
        base_prompt: values.base_prompt,
        is_public: values.is_public,
        target_models: values.target_models,
      };

      const { error } = await supabase
        .from("jailbreak_templates")
        .insert(insertData);

      if (error) throw error;

      toast.success("Template created successfully");
      form.reset();
    } catch (error) {
      toast.error("Failed to create template");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter template name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your template..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Enter category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="base_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your base prompt..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {"{variable}"} syntax for dynamic parts of your prompt
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Make template public</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Template"}
        </Button>
      </form>
    </Form>
  );
};