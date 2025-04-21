import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useDigimonStore } from '../store/petStore';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';

const Debug = () => {
  const [status, setStatus] = useState<string>('Checking connection...');
  const { userDigimon, fetchUserDigimon } = useDigimonStore();
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('digimon').select('count');
        if (error) throw error;
        setStatus(`Connected to Supabase! Found table 'digimon' with ${data[0].count} entries.`);
      } catch (error) {
        console.error('Supabase connection error:', error);
        setStatus(`Error connecting to Supabase: ${(error as Error).message}`);
      }
    };
    
    checkConnection();
    // Also fetch the user's Digimon when the page loads
    fetchUserDigimon();
  }, [fetchUserDigimon]);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      <p className="mt-4">If you can see this, React is working!</p>
      
      <div className="mt-4 p-4 border rounded">
        <h2 className="font-semibold">Supabase Status:</h2>
        <p className="mt-2">{status}</p>
      </div>
      
      <div className="mt-4">
        <p>Environment variables:</p>
        <pre className="mt-2 p-2 bg-gray-100 rounded">
          SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
          <br />
          SUPABASE_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
        </pre>
      </div>
      
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Debug Logs</h2>
        <p>Check the browser console for detailed logs.</p>
        <button 
          className="btn-primary mt-2"
          onClick={() => console.log("Current Digimon state:", userDigimon)}
        >
          Log Digimon State
        </button>
      </div>
      
      <button 
        className="btn-primary mt-2"
        onClick={async () => {
          try {
            console.log("Checking RLS policies...");
            
            // Try to get the current user
            const { data: userData } = await supabase.auth.getUser();
            console.log("Current user:", userData);
            
            if (!userData.user) {
              console.log("No user logged in");
              return;
            }
            
            // Check if we can select the user's Digimon
            const { data: selectData, error: selectError } = await supabase
              .from("user_digimon")
              .select("*")
              .eq("user_id", userData.user.id);
              
            console.log("Select result:", selectData, selectError);
            
            // Check if we can delete (but don't actually delete)
            if (userDigimon) {
              // This is a test that won't actually delete
              const { count, error: countError } = await supabase
                .from("user_digimon")
                .select("*", { count: "exact", head: true })
                .eq("id", userDigimon.id);
                
              console.log("Delete check result:", count, countError);
            }
          } catch (error) {
            console.error("Error checking RLS:", error);
          }
        }}
      >
        Check RLS Policies
      </button>

      {/* Create a new Digimon and let user select id*/}
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Create New Digimon</h2>
        <div className="flex items-center space-x-2">
          <select 
            id="digimonId" 
            className="p-2 border rounded"
            defaultValue="18"
          >
            {Array.from({ length: 341 }, (_, i) => i + 1).map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={async () => {
              const selectElement = document.getElementById('digimonId') as HTMLSelectElement;
              const selectedId = parseInt(selectElement.value, 10);
              await useDigimonStore.getState().createUserDigimon("", selectedId);
            }}
          >
            Create New Digimon
          </button>
        </div>
      </div>
      
      <button 
        className="btn-primary bg-red-600 hover:bg-red-700 mt-2"
        onClick={async () => {
          if (!userDigimon) return;
          
          try {
            console.log("Attempting direct deletion of Digimon:", userDigimon.id);
            
            // First, delete all battles that reference this Digimon
            console.log("Deleting battles that reference this Digimon...");
            
            // Delete battles where this Digimon is the user's Digimon
            const { error: userBattlesError } = await supabase
              .from("battles")
              .delete()
              .eq("user_digimon_id", userDigimon.id);
              
            if (userBattlesError) {
              console.error("Error deleting user battles:", userBattlesError);
              return;
            }
            
            // Delete battles where this Digimon is the opponent's Digimon
            const { error: opponentBattlesError } = await supabase
              .from("battles")
              .delete()
              .eq("opponent_digimon_id", userDigimon.id);
              
            if (opponentBattlesError) {
              console.error("Error deleting opponent battles:", opponentBattlesError);
              return;
            }
            
            console.log("Successfully deleted all battles referencing this Digimon");
            
            // Now delete the Digimon
            const { error } = await supabase
              .from("user_digimon")
              .delete()
              .eq("id", userDigimon.id);
              
            if (error) {
              console.error("Direct deletion error:", error);
            } else {
              console.log("Direct deletion successful!");
              // Force refresh
              window.location.reload();
            }
          } catch (error) {
            console.error("Error in direct deletion:", error);
          }
        }}
        disabled={!userDigimon}
      >
        Force Delete Digimon
      </button>
      
      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4">Battle Debug</h2>
        <button 
          className="btn-primary bg-blue-600 hover:bg-blue-700 mt-2"
          onClick={async() => {

            const { data, error } = await supabase.rpc('reset_all_battle_limits');

            if (error) {
              console.error('Error resetting battle limits:', error);
              alert('❌ Error resetting battle limits. Check console.');
            } else {
              console.log('Battle limits reset:', data);
              alert('✅ Daily battle limits reset!');
            }

          }}
        >
          Reset Daily Battle Limit
        </button>
      </div>
      
      <button 
        onClick={() => useTaskStore.getState().forceCheckOverdueTasks()}
        className="btn-primary mt-4"
      >
        Force Check Overdue Tasks
      </button>
      
      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4">Notification Debug</h2>
        <button 
          className="btn-primary bg-red-600 hover:bg-red-700 mt-2"
          onClick={() => {
            useNotificationStore.getState().addNotification({
              message: "Your Digimon has died due to neglect. You'll need to create a new one.",
              type: "error",
              persistent: true
            });
          }}
        >
          Test Death Notification
        </button>
      </div>
    </div>
  );
};

export default Debug; 