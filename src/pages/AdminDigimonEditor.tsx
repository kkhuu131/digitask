import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useDigimonStore, UserDigimon, Digimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from '@/components/DigimonSprite';

const AdminDigimonEditor = () => {
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const navigate = useNavigate();
  
  // Selected Digimon for editing
  const [selectedDigimon, setSelectedDigimon] = useState<UserDigimon | null>(null);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    digimon_id: 0,
    name: '',
    current_level: 1,
    hp_bonus: 0,
    sp_bonus: 0,
    atk_bonus: 0,
    def_bonus: 0,
    int_bonus: 0,
    spd_bonus: 0,
    abi: 0,
    happiness: 100,
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('');
  
  // Derived values
  const digimonList = Object.values(DIGIMON_LOOKUP_TABLE);
  
  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({
        message: 'You do not have permission to access this page',
        type: 'error'
      });
    } else {
      fetchAllUserDigimon();
    }
  }, [isAdmin, navigate, addNotification, fetchAllUserDigimon]);
  
  // When a Digimon is selected for editing, populate the form
  useEffect(() => {
    if (selectedDigimon) {
      setEditForm({
        digimon_id: selectedDigimon.digimon_id,
        name: selectedDigimon.name,
        current_level: selectedDigimon.current_level,
        hp_bonus: selectedDigimon.hp_bonus,
        sp_bonus: selectedDigimon.sp_bonus,
        atk_bonus: selectedDigimon.atk_bonus,
        def_bonus: selectedDigimon.def_bonus,
        int_bonus: selectedDigimon.int_bonus,
        spd_bonus: selectedDigimon.spd_bonus,
        abi: selectedDigimon.abi || 0,
        happiness: selectedDigimon.happiness,
      });
    }
  }, [selectedDigimon]);
  
  // Filter Digimon based on search and filters
  const filteredDigimon = digimonList.filter(digimon => {
    const matchesSearch = searchTerm === '' || 
      digimon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      digimon.id.toString() === searchTerm;
    
    const matchesStage = stageFilter === '' || digimon.stage === stageFilter;
    const matchesType = typeFilter === '' || digimon.type === typeFilter;
    const matchesAttribute = attributeFilter === '' || digimon.attribute === attributeFilter;
    
    return matchesSearch && matchesStage && matchesType && matchesAttribute;
  });
  
  // Get unique values for filters
  const stages = [...new Set(digimonList.map(d => d.stage))].sort();
  const types = [...new Set(digimonList.map(d => d.type))].sort();
  const attributes = [...new Set(digimonList.map(d => d.attribute))].sort();
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: typeof prev[name as keyof typeof prev] === 'number' ? parseFloat(value) : value
    }));
  };
  
  // Handle Digimon selection from the list
  const handleDigimonSelection = (digimon: Digimon) => {
    setEditForm(prev => ({
      ...prev,
      digimon_id: digimon.id
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDigimon) {
      addNotification({
        message: 'No Digimon selected for editing',
        type: 'error'
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_digimon')
        .update({
          digimon_id: editForm.digimon_id,
          name: editForm.name,
          current_level: editForm.current_level,
          hp_bonus: editForm.hp_bonus,
          sp_bonus: editForm.sp_bonus,
          atk_bonus: editForm.atk_bonus,
          def_bonus: editForm.def_bonus,
          int_bonus: editForm.int_bonus,
          spd_bonus: editForm.spd_bonus,
          abi: editForm.abi,
          happiness: editForm.happiness,
        })
        .eq('id', selectedDigimon.id);
      
      if (error) throw error;
      
      addNotification({
        message: 'Digimon updated successfully',
        type: 'success'
      });
      
      // Refresh Digimon list
      fetchAllUserDigimon();
    } catch (error) {
      console.error('Error updating Digimon:', error);
      addNotification({
        message: 'Failed to update Digimon',
        type: 'error'
      });
    }
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Digimon Editor</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Digimon selection */}
        <div>
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Digimon Database</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  className="w-full p-2 border rounded"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attribute</label>
                <select
                  className="w-full p-2 border rounded"
                  value={attributeFilter}
                  onChange={(e) => setAttributeFilter(e.target.value)}
                >
                  <option value="">All Attributes</option>
                  {attributes.map(attribute => (
                    <option key={attribute} value={attribute}>{attribute}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="h-96 overflow-y-auto border rounded">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
                {filteredDigimon.map(digimon => (
                  <div
                    key={digimon.id}
                    className={`border rounded p-2 cursor-pointer hover:bg-gray-50 ${
                      editForm.digimon_id === digimon.id ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => handleDigimonSelection(digimon)}
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-500 mb-2">{digimon.id}</p>
                      <DigimonSprite
                        digimonName={digimon.name}
                        fallbackSpriteUrl={digimon.sprite_url}
                        size="sm"
                        showHappinessAnimations={false}
                      />
                      <p className="text-xs font-medium text-center mt-1">{digimon.name}</p>
                      <p className="text-xs text-gray-500">{digimon.stage}</p>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            {allUserDigimon.length === 0 ? (
              <p className="text-gray-500">No Digimon found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allUserDigimon.map(digimon => {
                  const digimonData = DIGIMON_LOOKUP_TABLE[digimon.digimon_id];
                  return (
                    <div 
                      key={digimon.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        selectedDigimon?.id === digimon.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedDigimon(digimon)}
                    >
                      <div className="flex flex-col items-center">
                        <DigimonSprite
                          digimonName={digimon.digimon?.name || ''}
                          fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                          size="sm"
                          showHappinessAnimations={true}
                        />
                        <h3 className="font-medium text-center mt-2">{digimon.name}</h3>
                        <p className="text-xs text-gray-500">{digimonData?.name}</p>
                        <p className="text-xs text-gray-500">Lv. {digimon.current_level}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side: Digimon editor */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Digimon</h2>
          
          {!selectedDigimon ? (
            <p className="text-gray-500">Select a Digimon to edit.</p>
          ) : (
            <>
              <div className="mb-6 flex items-center">
                <div className="mr-4">
                  <DigimonSprite
                    digimonName={editForm.name}
                    fallbackSpriteUrl={DIGIMON_LOOKUP_TABLE[editForm.digimon_id]?.sprite_url || selectedDigimon.digimon?.sprite_url || ''}
                    size="sm"
                    showHappinessAnimations={false}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{editForm.name}</h3>
                  <p className="text-sm text-gray-600">
                    {DIGIMON_LOOKUP_TABLE[editForm.digimon_id]?.name || selectedDigimon.digimon?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {DIGIMON_LOOKUP_TABLE[editForm.digimon_id]?.stage || selectedDigimon.digimon?.stage} | 
                    {DIGIMON_LOOKUP_TABLE[editForm.digimon_id]?.type || selectedDigimon.digimon?.type} | 
                    {DIGIMON_LOOKUP_TABLE[editForm.digimon_id]?.attribute || selectedDigimon.digimon?.attribute}
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <input
                      type="number"
                      name="current_level"
                      value={isNaN(editForm.current_level) ? '' : editForm.current_level}
                      onChange={handleInputChange}
                      min="1"
                      max="99"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Bonus Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HP Bonus</label>
                      <input
                        type="number"
                        name="hp_bonus"
                        value={isNaN(editForm.hp_bonus) ? '' : editForm.hp_bonus}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SP Bonus</label>
                      <input
                        type="number"
                        name="sp_bonus"
                        value={isNaN(editForm.sp_bonus) ? '' : editForm.sp_bonus}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ATK Bonus</label>
                      <input
                        type="number"
                        name="atk_bonus"
                        value={isNaN(editForm.atk_bonus) ? '' : editForm.atk_bonus}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DEF Bonus</label>
                      <input
                        type="number"
                        name="def_bonus"
                        value={isNaN(editForm.def_bonus) ? '' : editForm.def_bonus}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">INT Bonus</label>
                      <input
                        type="number"
                        name="int_bonus"
                        value={isNaN(editForm.int_bonus) ? '' : editForm.int_bonus}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SPD Bonus</label>
                      <input
                        type="number"
                        name="spd_bonus"
                        value={isNaN(editForm.spd_bonus) ? '' : editForm.spd_bonus}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ABI</label>
                    <input
                      type="number"
                      name="abi"
                      value={isNaN(editForm.abi) ? '' : editForm.abi}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Happiness</label>
                    <input
                      type="number"
                      name="happiness"
                      value={isNaN(editForm.happiness) ? '' : editForm.happiness}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDigimonEditor; 