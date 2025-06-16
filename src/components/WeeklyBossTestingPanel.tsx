import React, { useState } from 'react';
import { useWeeklyBossStore } from '../store/weeklyBossStore';
import { useNotificationStore } from '../store/notificationStore';
import { supabase } from '../lib/supabase';
import { Settings, Play, RefreshCw, Award, Zap, Target } from 'lucide-react';

const WeeklyBossTestingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const {
    currentEvent,
    userParticipation,
    fetchCurrentEvent,
    fetchUserParticipation,
    checkDailyBossBattleLimit
  } = useWeeklyBossStore();

  const { addNotification } = useNotificationStore();

  // Only show in development environment
  if (!import.meta.env.DEV) {
    return null;
  }

  // Debug mode functions that directly modify frontend state
  const setPhaseDebug = (phase: number) => {
    console.log('Debug: Setting phase to', phase, 'Current event:', currentEvent);
    
    if (currentEvent) {
      // Directly modify the store state for testing
      const newEvent = {
        ...currentEvent,
        phase: phase
      };
      
      console.log('Debug: New event object:', newEvent);
      
      useWeeklyBossStore.setState({
        currentEvent: newEvent
      });
      
      addNotification({
        message: `🔧 DEBUG: Phase set to ${phase}`,
        type: 'success'
      });
    } else {
      // Create a minimal event if none exists
      useWeeklyBossStore.setState({
        currentEvent: {
          id: 'debug-event',
          week_start_date: new Date().toISOString(),
          preset_boss_id: 1,
          phase: phase,
          global_progress: 500,
          target_progress: 1000,
          total_damage_dealt: 200000,
          boss_max_hp: 2800000,
          boss_current_hp: 2600000,
          participants_count: 15,
          is_defeated: false,
          phase_1_end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          phase_2_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          boss_name: 'Debug Boss',
          boss_description: 'A powerful test boss for debugging',
          boss_config: {
            id: 1,
            name: 'Debug Boss',
            description: 'A powerful test boss',
            boss_digimon_id: 1,
            rotation_order: 1,
            stat_multiplier: 2.5,
            special_abilities: ['Intimidation', 'Fury'],
            reward_multiplier: 1.5,
            created_at: new Date().toISOString()
          }
        }
      });
      
      addNotification({
        message: `🔧 DEBUG: Created test event with Phase ${phase}`,
        type: 'success'
      });
    }
  };

  const addDebugParticipation = () => {
    // Create fake participation data for testing
    useWeeklyBossStore.setState({
      userParticipation: {
        id: 'debug-id',
        user_id: 'debug-user',
        event_id: currentEvent?.id || 'debug-event',
        tasks_contributed: 10,
        battle_attempts: 0,
        total_damage_dealt: 0,
        best_single_damage: 0,
        participation_tier: 1,
        rewards_claimed: false,
        last_battle_at: null,
        created_at: new Date().toISOString()
      },
      dailyBossBattlesRemaining: 5
    });

    addNotification({
      message: '🔧 DEBUG: Added fake participation data',
      type: 'success'
    });
  };

  const runSQLFunction = async (functionName: string, params: any[] = []) => {
    setLoading(true);
    try {
      let rpcParams = {};
      
      // Handle different function parameter names
      if (functionName === 'set_event_phase' && params.length > 0) {
        rpcParams = { p_phase: params[0] };
      } else if (functionName === 'test_contribute_tasks' && params.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        rpcParams = { 
          p_user_id: userData.user?.id,
          p_points: params[0] 
        };
      } else if (functionName === 'test_boss_battle' && params.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        rpcParams = { 
          p_user_id: userData.user?.id,
          p_damage: params[0] 
        };
      }

      const { data, error } = await supabase.rpc(functionName, rpcParams);

      if (error) throw error;

      addNotification({
        message: `✅ ${functionName} executed successfully`,
        type: 'success'
      });

      // Refresh data
      await Promise.all([
        fetchCurrentEvent(),
        fetchUserParticipation(),
        checkDailyBossBattleLimit()
      ]);

    } catch (error) {
      console.error(`Error executing ${functionName}:`, error);
      addNotification({
        message: `❌ Error executing ${functionName}: ${(error as Error).message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const setPhase = (phase: number) => {
    if (debugMode) {
      setPhaseDebug(phase);
    } else {
      runSQLFunction('set_event_phase', [phase]);
    }
  };

  const contributeTestTasks = (points: number = 10) => {
    runSQLFunction('test_contribute_tasks', [points]);
  };

  const testBossBattle = (damage: number = 5000) => {
    runSQLFunction('test_boss_battle', [damage]);
  };

  const resetBossHP = () => {
    runSQLFunction('reset_boss_hp');
  };

  const resetParticipation = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Delete user's participation and battles
      await supabase.from('weekly_boss_participation')
        .delete()
        .eq('user_id', userData.user.id);
      
      await supabase.from('weekly_boss_battles')
        .delete()
        .eq('user_id', userData.user.id);

      addNotification({
        message: '✅ Participation data reset',
        type: 'success'
      });

      // Refresh data
      await Promise.all([
        fetchCurrentEvent(),
        fetchUserParticipation(),
        checkDailyBossBattleLimit()
      ]);

    } catch (error) {
      addNotification({
        message: `❌ Error resetting participation: ${(error as Error).message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Boss Testing Panel"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Boss Testing Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Debug Mode Toggle */}
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="rounded"
          />
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            🔧 Debug Mode (Frontend Only)
          </span>
        </label>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          {debugMode ? 'Uses frontend state instead of database' : 'Uses real database functions'}
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="font-medium mb-2 dark:text-gray-100">Current Status</h4>
        <div className="text-sm space-y-1 dark:text-gray-300">
          <div>Phase: {currentEvent?.phase || 'N/A'}</div>
          <div>Boss HP: {currentEvent?.boss_current_hp?.toLocaleString() || 'N/A'}</div>
          <div>Tasks: {userParticipation?.tasks_contributed || 0}</div>
          <div>Battles: {userParticipation?.battle_attempts || 0}</div>
          <div>Tier: {userParticipation?.participation_tier || 0}</div>
        </div>
      </div>

      {/* Phase Controls */}
      <div className="mb-4">
        <h4 className="font-medium mb-2 dark:text-gray-100">Phase Controls</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPhase(1)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
          >
            Phase 1
          </button>
          <button
            onClick={() => setPhase(2)}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
          >
            Phase 2
          </button>
          <button
            onClick={() => setPhase(3)}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
          >
            Phase 3
          </button>
        </div>
      </div>

      {/* Debug Actions */}
      {debugMode && (
        <div className="mb-4 space-y-2">
          <h4 className="font-medium dark:text-gray-100">Debug Actions</h4>
          <button
            onClick={addDebugParticipation}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            🔧 Add Test Participation
          </button>
          <button
            onClick={() => {
              // Force a component re-render by triggering a state update
              const currentPhase = currentEvent?.phase || 1;
              setPhaseDebug(currentPhase);
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            🔄 Force Refresh Display
          </button>
        </div>
      )}

      {/* Testing Actions */}
      {!debugMode && (
        <div className="space-y-2">
          <h4 className="font-medium dark:text-gray-100">Testing Actions</h4>
          
          <button
            onClick={() => contributeTestTasks(10)}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Target className="h-4 w-4" />
            Contribute 10 Tasks
          </button>

          <button
            onClick={() => testBossBattle(5000)}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Test Battle (5k damage)
          </button>

          <button
            onClick={() => testBossBattle(50000)}
            disabled={loading}
            className="w-full bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Award className="h-4 w-4" />
            Defeat Boss (50k damage)
          </button>

          <button
            onClick={resetBossHP}
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Boss HP
          </button>

          <button
            onClick={resetParticipation}
            disabled={loading}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset My Participation
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            Executing...
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        💡 Development testing panel - not visible in production
      </div>
    </div>
  );
};

export default WeeklyBossTestingPanel; 