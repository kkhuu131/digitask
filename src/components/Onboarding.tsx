import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DigimonSelection from './DigimonSelection';
import { useDigimonStore } from '../store/petStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { supabase } from '../lib/supabase';
import { useTaskStore } from '../store/taskStore';
import { TutorialManager } from '../utils/tutorialManager';

enum OnboardingStage {
  WELCOME,
  CREATE_TASK,
  SELECT_DIGIMON,
  COMPLETE,
}

const Onboarding: React.FC = () => {
  const [stage, setStage] = useState<OnboardingStage>(OnboardingStage.WELCOME);
  const { createUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const navigate = useNavigate();
  const { markOnboardingComplete } = useOnboardingStore();
  const [taskDescription, setTaskDescription] = useState('');
  const [dailyTask, setDailyTask] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
          console.error('Error checking onboarding status:', error);
          return;
        }

        // If onboarding is already completed, redirect to dashboard
        if (profileData && profileData.has_completed_onboarding) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error in checkOnboardingStatus:', error);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleComplete = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await markOnboardingComplete();
      if (!useOnboardingStore.getState().hasCompletedOnboarding)
        throw new Error('Could not finish setup. Please try again.');
      // The setup already teaches the dashboard's first action; keep help replayable.
      TutorialManager.markCompleted('dashboard_intro');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not finish setup. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleTaskCreated = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !taskDescription.trim()) return;
    setBusy(true);
    setError('');
    try {
      const previousCount = useTaskStore.getState().tasks.length;
      await useTaskStore.getState().createTask({
        description: taskDescription.trim(),
        is_daily: dailyTask,
        recurring_days: null,
        due_date: null,
        category: null,
        difficulty: 'medium',
        priority: 'medium',
      });
      const taskState = useTaskStore.getState();
      if (taskState.error || taskState.tasks.length <= previousCount)
        throw new Error(taskState.error || 'Could not add your task. Please try again.');
      setStage(OnboardingStage.SELECT_DIGIMON);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add your task. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDigimonSelected = async (selections: Array<{ digimonId: number; name: string }>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Please sign in again to choose your partners.');

      // Check if user already has any Digimon
      const { data: existingDigimon, error: checkError } = await supabase
        .from('user_digimon')
        .select('id')
        .eq('user_id', userData.user.id)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing Digimon:', checkError);
        throw checkError;
      }

      if (!existingDigimon || existingDigimon.length === 0) {
        // Create the first Digimon as the active partner
        await createUserDigimon(selections[0].name, selections[0].digimonId);

        // Create the remaining two as inactive party members
        const rows = selections.slice(1).map((sel) => ({
          user_id: userData.user!.id,
          digimon_id: sel.digimonId,
          name: sel.name,
          is_active: false,
          is_on_team: true,
          happiness: 100,
          experience_points: 0,
          current_level: 1,
        }));

        const { error: insertError } = await supabase.from('user_digimon').insert(rows);
        if (insertError) {
          console.error('Error creating additional starter Digimon:', insertError);
          throw insertError;
        }
      }

      await fetchAllUserDigimon();
      await useDigimonStore.getState().fetchDiscoveredDigimon();

      setStage(OnboardingStage.COMPLETE);
    } catch (error) {
      console.error('Error during Digimon selection:', error);
      setError(
        error instanceof Error ? error.message : 'Could not save your partners. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const stepNumber =
    stage === OnboardingStage.SELECT_DIGIMON ? 2 : stage === OnboardingStage.COMPLETE ? 3 : 1;
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-dark-400 text-gray-900 dark:text-gray-100 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="ui-page-title mb-2">Start small. Grow together.</h1>
          <p className="ui-description">
            Turn real-life tasks into progress for your Digimon. You can learn the rest as you go.
          </p>
        </header>
        <ol aria-label="Setup progress" className="grid grid-cols-3 gap-2 mb-6">
          {['Add a task', 'Choose partners', 'You’re ready'].map((label, index) => (
            <li
              key={label}
              aria-current={stepNumber === index + 1 ? 'step' : undefined}
              className={`rounded-lg p-3 text-sm ${stepNumber === index + 1 ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-300' : 'bg-gray-100 text-gray-600 dark:bg-dark-200 dark:text-gray-400'}`}
            >
              <span className="block font-semibold">{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
          >
            {error}
          </p>
        )}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/assets/digimon/bokomon.png"
              alt="Bokomon"
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {stepNumber === 1
                ? 'Bokomon: One small task is all you need to start.'
                : stepNumber === 2
                  ? 'Bokomon: Pick the partners you like. There is no need to optimize your team yet.'
                  : 'Bokomon: You’re ready. Focus on your tasks; we’ll explain the game as you explore.'}
            </p>
          </div>
          {stage === OnboardingStage.WELCOME && (
            <>
              <h2 className="ui-section-title mb-2">A little progress, every day</h2>
              <p className="ui-description mb-4">
                Add a task, do it in real life, then check it off. Your partners gain experience and
                you earn a battle ticket.
              </p>
              <p className="ui-description mb-6">
                Battles, evolution and collection goals are optional things to explore later.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  setStage(
                    useTaskStore.getState().tasks.length > 0
                      ? OnboardingStage.SELECT_DIGIMON
                      : OnboardingStage.CREATE_TASK
                  )
                }
              >
                Let’s get started
              </button>
            </>
          )}
          {stage === OnboardingStage.CREATE_TASK && (
            <form onSubmit={handleTaskCreated} className="space-y-4">
              <h2 className="ui-section-title">Choose one achievable task</h2>
              <p className="ui-description">
                Something you can finish today is ideal. You can change its settings later.
              </p>
              <div>
                <label htmlFor="first-task" className="block text-sm font-semibold mb-2">
                  What will you do?
                </label>
                <input
                  id="first-task"
                  className="input w-full"
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                  placeholder="For example, take a 10-minute walk"
                  required
                  maxLength={500}
                  disabled={busy}
                />
              </div>
              <label className="flex items-center gap-3 min-h-11 text-sm">
                <input
                  type="checkbox"
                  checked={dailyTask}
                  onChange={(event) => setDailyTask(event.target.checked)}
                  disabled={busy}
                />
                Repeat this task daily
              </label>
              <button
                className="btn-primary"
                type="submit"
                disabled={busy || !taskDescription.trim()}
              >
                {busy ? 'Adding task...' : 'Add task & choose partners'}
              </button>
            </form>
          )}
          {stage === OnboardingStage.SELECT_DIGIMON && (
            <>
              <h2 className="ui-section-title mb-2">Choose your 3 partners</h2>
              <p className="ui-description mb-4">
                Your first pick is your active partner. The others join your party. Their species
                names work as nicknames too.
              </p>
              <fieldset disabled={busy} aria-busy={busy} className="min-w-0">
                <DigimonSelection
                  onSelect={() => {}}
                  multiSelect
                  onMultiSelect={handleDigimonSelected}
                />
              </fieldset>
              {busy && (
                <p role="status" className="text-sm mt-3">
                  Saving your partners...
                </p>
              )}
            </>
          )}
          {stage === OnboardingStage.COMPLETE && (
            <>
              <h2 className="ui-section-title mb-2">Your next step: finish your task</h2>
              <p className="ui-description mb-4">
                On the dashboard, check off your task after you do it in real life. That’s the main
                loop: do something useful, then watch your partners grow.
              </p>
              <div className="rounded-lg bg-gray-50 dark:bg-dark-200 p-4 mb-6">
                <h3 className="text-sm font-semibold mb-2">Explore when you’re ready</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>DigiFarm: manage partners and inspect evolution options.</li>
                  <li>Battle: spend earned tickets on optional arena fights.</li>
                  <li>Help: reopen tips whenever you need them.</li>
                </ul>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handleComplete}
                disabled={busy}
              >
                {busy ? 'Finishing setup...' : 'Go to my dashboard'}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Onboarding;
