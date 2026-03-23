import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDigimonStore } from '../store/petStore';
import DigimonSelection from '../components/DigimonSelection';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useOnboardingStore } from '../store/onboardingStore';

const CreatePet = () => {
  const { createUserDigimon, error, fetchUserDigimon, userDigimon } = useDigimonStore();
  const [creationError, setCreationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  // Check if user already has a Digimon
  useEffect(() => {
    const checkExistingDigimon = async () => {
      try {
        setLoading(true);
        if (import.meta.hot) {
          setLoading(false);
          return;
        }
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }
        const { data: digimonData, error } = await supabase
          .from('user_digimon')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        if (error) {
          console.error('Error checking for Digimon:', error);
        } else if (digimonData && digimonData.length > 0) {
          navigate('/', { replace: true });
          return;
        }
        await fetchUserDigimon();
        setLoading(false);
      } catch (error) {
        console.error('Exception in checkExistingDigimon:', error);
        setLoading(false);
      }
    };
    const searchParams = new URLSearchParams(window.location.search);
    const fromAuth = searchParams.get('from') === 'auth';
    if (!fromAuth) {
      checkExistingDigimon();
    } else {
      setLoading(false);
    }
  }, [fetchUserDigimon, navigate]);

  useEffect(() => {
    const checkEmailConfirmation = () => {
      const { user } = useAuthStore.getState();
      if (user && !user.email_confirmed_at) {
        setNeedsEmailConfirmation(true);
      } else {
        setNeedsEmailConfirmation(false);
      }
    };
    checkEmailConfirmation();
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (!userId) return;
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', userId)
          .single();
        if (error) {
          console.error('Error checking onboarding status:', error);
        } else if (profileData && !profileData.has_completed_onboarding) {
          navigate('/onboarding', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Exception in checkOnboardingStatus:', error);
      }
    };
    if (useOnboardingStore.getState().hasCompletedOnboarding === false) {
      navigate('/onboarding', { replace: true });
    } else {
      checkOnboardingStatus();
    }
  }, [navigate]);

  const handleSelectDigimon = async (digimonId: number, name: string) => {
    try {
      setCreationError(null);
      setLoading(true);
      await createUserDigimon(name, digimonId);
      await useAuthStore.getState().fetchUserProfile();
      setLoading(false);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error in handleSelectDigimon:', err);
      setCreationError((err as Error).message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto" />
          <p className="font-body text-gray-500 dark:text-gray-400">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (needsEmailConfirmation) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-100 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Confirm Your Email
          </h2>
          <p className="font-body text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            Please check your email and click the confirmation link to activate your account. Once
            confirmed, you can choose your starter Digimon.
          </p>
          <button
            onClick={() => useAuthStore.getState().signOut()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200 font-body font-semibold text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 mb-4">
          <span className="text-purple-700 dark:text-purple-300 text-xs font-body font-semibold tracking-wide uppercase">
            New Journey
          </span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Choose Your Partner
        </h1>
        <p className="font-body text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Pick a starter Digimon. Complete your daily tasks to help it grow, evolve, and become
          stronger!
        </p>
      </div>

      {/* Errors */}
      {(error || creationError) && (
        <div className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 max-w-lg mx-auto">
          <p className="text-sm text-red-700 dark:text-red-400 font-body">
            {error || creationError}
          </p>
        </div>
      )}

      {userDigimon && (
        <div className="mb-6 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-400 font-body">
            You already have a Digimon!
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-sm font-body font-semibold text-green-700 dark:text-green-400 underline"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      <DigimonSelection onSelect={handleSelectDigimon} />
    </div>
  );
};

export default CreatePet;
