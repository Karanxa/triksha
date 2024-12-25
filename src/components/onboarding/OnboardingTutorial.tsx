import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";
import { supabase } from "@/integrations/supabase/client";

export const OnboardingTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const checkFirstVisit = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!settings) {
        setIsOpen(true);
      }
    };

    checkFirstVisit();
  }, []);

  const steps = [
    {
      title: "Welcome to LLM Scanner",
      description: "Let's get you started with a quick tour of our main features.",
    },
    {
      title: "Custom Scan Tests",
      description: "Create and manage custom test cases to evaluate LLM vulnerabilities.",
    },
    {
      title: "Scan Execution",
      description: "Run scans against multiple models and analyze their responses.",
    },
    {
      title: "API Keys Setup",
      description: "To start scanning, you'll need to configure your API keys.",
      component: <ApiKeyForm />
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        {currentStep.component && (
          <div className="py-4">
            {currentStep.component}
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};