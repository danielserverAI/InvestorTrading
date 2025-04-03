import { useState } from "react";
import { useLocation } from "wouter";
import { OnboardingSteps } from "@/components/onboarding/steps";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [, setLocation] = useLocation();
  const { createUser } = useUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    tradingExperience: "intermediate",
    tradingStyles: [] as string[],
    tradingGoals: [] as string[],
    interestTags: [] as string[],
  });

  const handleFormUpdate = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await createUser(formData);
      toast({
        title: "Profile created!",
        description: "Welcome to Trader's Daily Intel.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error creating profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const skipOnboarding = () => {
    toast({
      title: "Skipped onboarding",
      description: "You can complete your profile later.",
    });
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-primary text-white">
          <CardTitle className="text-xl">Welcome to Trader's Daily Intel</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <OnboardingSteps 
            currentStep={currentStep}
            formData={formData}
            updateForm={handleFormUpdate}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>Back</Button>
          ) : (
            <Button variant="outline" onClick={skipOnboarding}>Skip for Now</Button>
          )}
          
          {currentStep < 4 ? (
            <Button onClick={nextStep}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit}>Complete Setup</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
