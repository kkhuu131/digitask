import React from 'react';
import { supabase } from '../lib/supabase';

const Debug = () => {
  const [status, setStatus] = React.useState<string>('Checking connection...');
  
  React.useEffect(() => {
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
  }, []);
  
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
    </div>
  );
};

export default Debug; 