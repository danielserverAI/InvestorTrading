import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TRADING_STYLES, TRADING_GOALS, INTEREST_TAGS } from "@/lib/constants";

interface OnboardingStepsProps {
  currentStep: number;
  formData: any;
  updateForm: (field: string, value: any) => void;
}

export const OnboardingSteps = ({ currentStep, formData, updateForm }: OnboardingStepsProps) => {
  
  // Step 1: Account Creation
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Create Your Account</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Let's start by setting up your basic information.
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="username">Username</label>
          <Input 
            id="username"
            value={formData.username}
            onChange={(e) => updateForm('username', e.target.value)}
            placeholder="Enter username"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <Input 
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <Input 
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateForm('password', e.target.value)}
            placeholder="Create a secure password"
          />
        </div>
      </div>
    </div>
  );
  
  // Step 2: Trading Style
  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">What kind of trader are you?</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Select all that apply to personalize your experience.
      </p>
      
      <div className="space-y-3">
        {TRADING_STYLES.map((style) => (
          <div key={style.value} className="flex items-center space-x-2">
            <Checkbox 
              id={style.value}
              checked={formData.tradingStyles.includes(style.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateForm('tradingStyles', [...formData.tradingStyles, style.value]);
                } else {
                  updateForm('tradingStyles', formData.tradingStyles.filter((s: string) => s !== style.value));
                }
              }}
            />
            <label 
              htmlFor={style.value}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {style.label}
            </label>
          </div>
        ))}
      </div>
      
      <div className="pt-4">
        <h3 className="text-sm font-medium mb-3">Your experience level?</h3>
        <RadioGroup 
          value={formData.tradingExperience}
          onValueChange={(value) => updateForm('tradingExperience', value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <label htmlFor="beginner" className="text-sm">Beginner</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <label htmlFor="intermediate" className="text-sm">Intermediate</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <label htmlFor="advanced" className="text-sm">Advanced</label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
  
  // Step 3: Trading Goals
  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">What are your trading goals?</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Select all that apply to help us personalize your experience.
      </p>
      
      <div className="space-y-3">
        {TRADING_GOALS.map((goal) => (
          <div key={goal.value} className="flex items-center space-x-2">
            <Checkbox 
              id={goal.value}
              checked={formData.tradingGoals.includes(goal.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateForm('tradingGoals', [...formData.tradingGoals, goal.value]);
                } else {
                  updateForm('tradingGoals', formData.tradingGoals.filter((g: string) => g !== goal.value));
                }
              }}
            />
            <label 
              htmlFor={goal.value}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {goal.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Step 4: Interests
  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">What interests you?</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Select your interests to help us provide you with relevant information. (Optional)
      </p>
      
      <div className="space-y-3">
        {INTEREST_TAGS.map((tag) => (
          <div key={tag.value} className="flex items-center space-x-2">
            <Checkbox 
              id={tag.value}
              checked={formData.interestTags.includes(tag.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateForm('interestTags', [...formData.interestTags, tag.value]);
                } else {
                  updateForm('interestTags', formData.interestTags.filter((t: string) => t !== tag.value));
                }
              }}
            />
            <label 
              htmlFor={tag.value}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {tag.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render the appropriate step
  switch (currentStep) {
    case 1:
      return renderStep1();
    case 2:
      return renderStep2();
    case 3:
      return renderStep3();
    case 4:
      return renderStep4();
    default:
      return renderStep1();
  }
};
