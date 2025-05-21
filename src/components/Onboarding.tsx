import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DigimonDialogue, { DialogueStep } from './DigimonDialogue';
import TaskForm from './TaskForm';
import DigimonSelection from './DigimonSelection';
import { useDigimonStore } from '../store/petStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { supabase } from '../lib/supabase';

enum OnboardingStage {
  WELCOME,
  INTRO,
  CREATE_TASK,
  SELECT_DIGIMON,
  COMPLETE
}

const Onboarding: React.FC = () => {
  const [stage, setStage] = useState<OnboardingStage>(OnboardingStage.WELCOME);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDigimonSelection, setShowDigimonSelection] = useState(false);
  const { createUserDigimon } = useDigimonStore();
  const navigate = useNavigate();
  const { markOnboardingComplete } = useOnboardingStore();
  
  useEffect(() => {
    // Check if we actually need onboarding
    const checkOnboardingStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        
        if (!userId) return;
        
        // Check if user has completed onboarding
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Error checking onboarding status:", error);
          return;
        }
        
        // If onboarding is already completed, redirect to dashboard
        if (profileData && profileData.has_completed_onboarding) {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Error in checkOnboardingStatus:", error);
      }
    };
    
    checkOnboardingStatus();
  }, [navigate]);

  const handleComplete = async () => {
    await markOnboardingComplete();
    navigate('/');
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    setStage(OnboardingStage.SELECT_DIGIMON);
  };

  const handleDigimonSelected = async (digimonId: number, name: string) => {
    try {
      await createUserDigimon(name, digimonId);
      setShowDigimonSelection(false);
      setStage(OnboardingStage.COMPLETE);
    } catch (error) {
      console.error('Error creating Digimon:', error);
    }
  };

  // Define dialogue steps for each stage
  const welcomeSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome, DigiDestined! I'm Bokomon, chronicler of all things Digimon!"
    },
    {
      speaker: 'neemon',
      text: "And I'm Neemon! I eat crackers! Uh, I mean... I help too!"
    },
    {
      speaker: 'bokomon',
      text: "We'll be your guides in this world. Let's get you started on your journey!",
      action: {
        label: "Let's Go!",
        onClick: () => setStage(OnboardingStage.INTRO)
      }
    }
  ];

  const introSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "This world needs your help! To keep Digimon happy and growing, you must complete real-life tasks!"
    },
    {
      speaker: 'neemon',
      text: "Like brushing your teeth! Or... taking a nap! Wait, is napping a task?"
    },
    {
      speaker: 'bokomon',
      text: "Let's begin your journey! First, add your first task — it can be something you do daily or a one-time goal!",
      action: {
        label: "Create My First Task",
        onClick: () => {
          setStage(OnboardingStage.CREATE_TASK);
          setShowTaskForm(true);
        }
      }
    }
  ];

  const selectDigimonSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Great job! Now, every hero needs a partner! Choose one of these Digimon to accompany you!"
    },
    {
      speaker: 'neemon',
      text: "Pick the cutest one! Or the coolest! Or the... snackiest?"
    },
    {
      speaker: 'both',
      text: "Choose wisely! This will be your first partner on your journey!",
      action: {
        label: "Select My Partner",
        onClick: () => {
          setShowDigimonSelection(true);
        }
      }
    }
  ];

  const completeSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "All set! Check in daily to complete tasks and care for your Digimon."
    },
    {
      speaker: 'neemon',
      text: "Don't forget to feed them! And maybe hug them. Hugs are important."
    },
    {
      speaker: 'both',
      text: "Your adventure begins now! Good luck, DigiDestined!",
      action: {
        label: "Start My Adventure!",
        onClick: handleComplete
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {stage === OnboardingStage.WELCOME && (
        <DigimonDialogue 
          steps={welcomeSteps} 
          onComplete={() => setStage(OnboardingStage.INTRO)} 
        />
      )}
      
      {stage === OnboardingStage.INTRO && (
        <DigimonDialogue 
          steps={introSteps} 
          onComplete={() => {
            setStage(OnboardingStage.CREATE_TASK);
            setShowTaskForm(true);
          }} 
        />
      )}
      
      {stage === OnboardingStage.CREATE_TASK && showTaskForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Your First Task</h2>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </div>
        </div>
      )}
      
      {stage === OnboardingStage.SELECT_DIGIMON && (
        <>
          {!showDigimonSelection && (
            <DigimonDialogue 
              steps={selectDigimonSteps} 
              onComplete={() => setShowDigimonSelection(true)} 
            />
          )}
          
          {showDigimonSelection && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
                <h2 className="text-xl font-bold mb-4">Choose Your Partner</h2>
                <DigimonSelection onSelect={handleDigimonSelected} />
              </div>
            </div>
          )}
        </>
      )}
      
      {stage === OnboardingStage.COMPLETE && (
        <DigimonDialogue 
          steps={completeSteps} 
          onComplete={handleComplete}
          isSkippable={false}
        />
      )}
    </div>
  );
};

export default Onboarding; 