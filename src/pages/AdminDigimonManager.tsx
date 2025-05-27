import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { Tab } from '@headlessui/react';
import { Digimon } from '../store/petStore';
import DigimonSprite from '@/components/DigimonSprite';

// Type definitions
interface DigimonFormData {
  digimon_id: number;
  request_id: number;
  name: string;
  stage: string;
  type: string;
  attribute: string;
  sprite_url: string;
  detail_url: string;
  hp: number;
  sp: number;
  atk: number;
  def: number;
  int: number;
  spd: number;
  hp_level1: number;
  sp_level1: number;
  atk_level1: number;
  def_level1: number;
  int_level1: number;
  spd_level1: number;
  hp_level99: number;
  sp_level99: number;
  atk_level99: number;
  def_level99: number;
  int_level99: number;
  spd_level99: number;
}

interface EvolutionPathFormData {
  id?: number;
  from_digimon_id: number | null;
  to_digimon_id: number | null;
  level_required: number;
  stat_requirements: {
    hp?: number;
    sp?: number;
    atk?: number;
    def?: number;
    int?: number;
    spd?: number;
    abi?: number;
  };
  dna_requirement: number | null;
}

interface EvolutionPathData {
  id: number;
  from_digimon_id: number | null;
  to_digimon_id: number | null;
  level_required: number;
  stat_requirements: {
    hp?: number;
    sp?: number;
    atk?: number;
    def?: number;
    int?: number;
    spd?: number;
    abi?: number;
  };
  dna_requirement: number | null;
  from_digimon?: Digimon;
  to_digimon?: Digimon;
  dna_digimon?: Digimon;
}

// Change this interface name to avoid the conflict
interface DigimonFormRelationData {
  id?: number;
  base_digimon_id: number | null;
  form_digimon_id: number | null;
  form_type: string;
  unlock_condition: string | null;
  base_digimon?: Digimon;
  form_digimon?: Digimon;
}

const AdminDigimonManager = () => {
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  
  // State for digimon form
  const [digimonForm, setDigimonForm] = useState<DigimonFormData>({
    digimon_id: 0,
    request_id: 0,
    name: '',
    stage: 'Rookie',
    type: 'Data',
    attribute: 'Neutral',
    sprite_url: '',
    detail_url: '',
    hp: 0,
    sp: 0,
    atk: 0,
    def: 0,
    int: 0,
    spd: 0,
    hp_level1: 0,
    sp_level1: 0,
    atk_level1: 0,
    def_level1: 0,
    int_level1: 0,
    spd_level1: 0,
    hp_level99: 0,
    sp_level99: 0,
    atk_level99: 0,
    def_level99: 0,
    int_level99: 0,
    spd_level99: 0
  });
  
  // State for evolution path form
  const [evolutionForm, setEvolutionForm] = useState<EvolutionPathFormData>({
    from_digimon_id: null,
    to_digimon_id: null,
    level_required: 0,
    stat_requirements: {},
    dna_requirement: null
  });
  
  // State for editing
  const [isEditingDigimon, setIsEditingDigimon] = useState(false);
  const [isEditingEvolution, setIsEditingEvolution] = useState(false);
  const [editingDigimonId, setEditingDigimonId] = useState<number | null>(null);
  const [editingEvolutionId, setEditingEvolutionId] = useState<number | null>(null);
  
  // State for list data
  const [digimonList, setDigimonList] = useState<Digimon[]>([]);
  const [evolutionPaths, setEvolutionPaths] = useState<EvolutionPathData[]>([]);
  
  // Search and filter state
  const [digimonSearchTerm, setDigimonSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('');
  const [evolutionSearchTerm, setEvolutionSearchTerm] = useState('');
  
  // Derived values for filters
  const digimonStages = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'];
  const digimonTypes = ['Vaccine', 'Data', 'Virus', 'Free'];
  const digimonAttributes = ['Neutral', 'Fire', 'Water', 'Plant', 'Electric', 'Wind', 'Earth', 'Light', 'Dark'];
  
  // Add these states to the AdminDigimonManager component
  const [digimonForms, setDigimonForms] = useState<DigimonFormRelationData[]>([]);
  const [formForm, setFormForm] = useState<DigimonFormRelationData>({
    base_digimon_id: null,
    form_digimon_id: null,
    form_type: 'X-Antibody',
    unlock_condition: null
  });
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [formSearchTerm, setFormSearchTerm] = useState('');
  
  // Add these form type options
  const formTypes = ['X-Antibody', 'Mode Change', 'Burst Mode', 'Spirit Evolution', 'Armor', 'Base'];
  
  // Add these states for the search functionality
  const [baseDigimonSearch, setBaseDigimonSearch] = useState('');
  const [formDigimonSearch, setFormDigimonSearch] = useState('');
  const [fromDigimonSearch, setFromDigimonSearch] = useState('');
  const [toDigimonSearch, setToDigimonSearch] = useState('');

  // Add these states for showing dropdown results
  const [showBaseDigimonResults, setShowBaseDigimonResults] = useState(false);
  const [showFormDigimonResults, setShowFormDigimonResults] = useState(false);
  const [showFromDigimonResults, setShowFromDigimonResults] = useState(false);
  const [showToDigimonResults, setShowToDigimonResults] = useState(false);
  
  // Filtered Digimon lists based on search
  const filteredBaseDigimon = digimonList.filter(digimon => 
    digimon.name.toLowerCase().includes(baseDigimonSearch.toLowerCase()) ||
    digimon.id.toString().includes(baseDigimonSearch)
  );

  const filteredFormDigimon = digimonList.filter(digimon => 
    digimon.name.toLowerCase().includes(formDigimonSearch.toLowerCase()) ||
    digimon.id.toString().includes(formDigimonSearch)
  );

  const filteredFromDigimon = digimonList.filter(digimon => 
    digimon.name.toLowerCase().includes(fromDigimonSearch.toLowerCase()) ||
    digimon.id.toString().includes(fromDigimonSearch)
  );

  const filteredToDigimon = digimonList.filter(digimon => 
    digimon.name.toLowerCase().includes(toDigimonSearch.toLowerCase()) ||
    digimon.id.toString().includes(toDigimonSearch)
  );
  
  // Helper functions to select a digimon
  const selectBaseDigimon = (digimon: Digimon) => {
    setFormForm(prev => ({ ...prev, base_digimon_id: digimon.id }));
    setBaseDigimonSearch(digimon.name);
    setShowBaseDigimonResults(false);
  };

  const selectFormDigimon = (digimon: Digimon) => {
    setFormForm(prev => ({ ...prev, form_digimon_id: digimon.id }));
    setFormDigimonSearch(digimon.name);
    setShowFormDigimonResults(false);
  };

  const selectFromDigimon = (digimon: Digimon) => {
    setEvolutionForm(prev => ({ ...prev, from_digimon_id: digimon.id }));
    setFromDigimonSearch(digimon.name);
    setShowFromDigimonResults(false);
  };

  const selectToDigimon = (digimon: Digimon) => {
    setEvolutionForm(prev => ({ ...prev, to_digimon_id: digimon.id }));
    setToDigimonSearch(digimon.name);
    setShowToDigimonResults(false);
  };
  
  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({
        message: 'You do not have permission to access this page',
        type: 'error'
      });
    } else {
      fetchDigimonList();
      fetchEvolutionPaths();
      fetchDigimonForms();
    }
  }, [isAdmin, navigate, addNotification]);
  
  // Fetch all digimon from the database
  const fetchDigimonList = async () => {
    try {
      const { data, error } = await supabase
        .from('digimon')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setDigimonList(data);
      }
    } catch (error) {
      console.error('Error fetching digimon list:', error);
      addNotification({
        message: 'Failed to load digimon list',
        type: 'error'
      });
    }
  };
  
  // Fetch all evolution paths from the database
  const fetchEvolutionPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('evolution_paths')
        .select(`
          *,
          from_digimon:from_digimon_id(*),
          to_digimon:to_digimon_id(*),
          dna_digimon:dna_requirement(*)
        `);
        
      if (error) throw error;
      
      if (data) {
        setEvolutionPaths(data as EvolutionPathData[]);
      }
    } catch (error) {
      console.error('Error fetching evolution paths:', error);
      addNotification({
        message: 'Failed to fetch evolution paths',
        type: 'error'
      });
    }
  };
  
  // Fetch all digimon forms from the database
  const fetchDigimonForms = async () => {
    try {
      const { data, error } = await supabase
        .from('digimon_forms')
        .select(`
          *,
          base_digimon:base_digimon_id(*),
          form_digimon:form_digimon_id(*)
        `)
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setDigimonForms(data);
        generateFormsLookupTableCode(data);
      }
    } catch (error) {
      console.error('Error fetching digimon forms:', error);
      addNotification({
        message: 'Failed to fetch digimon forms',
        type: 'error'
      });
    }
  };
  
  // Handle digimon form input changes
  const handleDigimonInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (
      [
        'digimon_id', 'request_id', 'hp', 'sp', 'atk', 'def', 'int', 'spd',
        'hp_level1', 'sp_level1', 'atk_level1', 'def_level1', 'int_level1', 'spd_level1',
        'hp_level99', 'sp_level99', 'atk_level99', 'def_level99', 'int_level99', 'spd_level99'
      ].includes(name)
    ) {
      setDigimonForm(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseInt(value, 10)
      }));
    } else {
      setDigimonForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle evolution form input changes
  const handleEvolutionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'from_digimon_id' || name === 'to_digimon_id' || name === 'dna_requirement') {
      setEvolutionForm(prev => ({
        ...prev,
        [name]: value === '' ? null : parseInt(value, 10)
      }));
    } else if (name === 'level_required') {
      setEvolutionForm(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseInt(value, 10)
      }));
    } else {
      setEvolutionForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle stat requirements input changes
  const handleStatRequirementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setEvolutionForm(prev => ({
      ...prev,
      stat_requirements: {
        ...prev.stat_requirements,
        [name]: value === '' ? undefined : parseInt(value, 10)
      }
    }));
  };
  
  // Reset digimon form
  const resetDigimonForm = () => {
    setDigimonForm({
      digimon_id: getNextDigimonId(),
      request_id: getNextDigimonId(),
      name: '',
      stage: 'Rookie',
      type: 'Data',
      attribute: 'Neutral',
      sprite_url: '',
      detail_url: '',
      hp: 0,
      sp: 0,
      atk: 0,
      def: 0,
      int: 0,
      spd: 0,
      hp_level1: 0,
      sp_level1: 0,
      atk_level1: 0,
      def_level1: 0,
      int_level1: 0,
      spd_level1: 0,
      hp_level99: 0,
      sp_level99: 0,
      atk_level99: 0,
      def_level99: 0,
      int_level99: 0,
      spd_level99: 0
    });
    setIsEditingDigimon(false);
    setEditingDigimonId(null);
  };
  
  // Reset evolution form
  const resetEvolutionForm = () => {
    setEvolutionForm({
      from_digimon_id: null,
      to_digimon_id: null,
      level_required: 0,
      stat_requirements: {},
      dna_requirement: null
    });
    
    // Clear search fields
    setFromDigimonSearch('');
    setToDigimonSearch('');
    
    setIsEditingEvolution(false);
    setEditingEvolutionId(null);
  };
  
  // Get next available digimon ID
  const getNextDigimonId = useCallback(() => {
    if (digimonList.length === 0) return 1;
    const maxId = Math.max(...digimonList.map(d => d.digimon_id));
    return maxId + 1;
  }, [digimonList]);
  
  // Function to add a new digimon to the local lookup table
  const addToLocalLookupTable = (digimon: Digimon) => {
    // Create a new entry in the lookup table
    (DIGIMON_LOOKUP_TABLE as any)[digimon.id] = digimon;
    
    // Generate an updated version of the lookup table for copy/paste
    generateLookupTableCode();
  };

  // Function to update an existing digimon in the local lookup table
  const updateLocalLookupTable = (id: number, digimon: Digimon) => {
    // Update the entry in the lookup table
    if ((DIGIMON_LOOKUP_TABLE as any)[id]) {
      (DIGIMON_LOOKUP_TABLE as any)[id] = digimon;
    }
    
    // Generate an updated version of the lookup table for copy/paste
    generateLookupTableCode();
  };

  // Function to generate code for the updated lookup table
  const [lookupTableCode, setLookupTableCode] = useState<string>('');

  const generateLookupTableCode = () => {
    const tableEntries = Object.values(DIGIMON_LOOKUP_TABLE)
      .sort((a, b) => a.id - b.id)
      .map(digimon => {
        return `  "${digimon.id}": ${JSON.stringify(digimon, null, 2)},`;
      })
      .join('\n');
      
    const code = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Generated from Supabase digimon table\n\nimport type { Digimon } from "../store/petStore";\n\nexport const DIGIMON_LOOKUP_TABLE: Record<number, Digimon> = {\n${tableEntries}\n};\n`;
    
    setLookupTableCode(code);
  };

  // Initialize the lookup table code on component mount
  useEffect(() => {
    generateLookupTableCode();
  }, []);
  
  // Handle digimon form submission
  const handleDigimonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditingDigimon && editingDigimonId) {
        // Update existing digimon
        const { data, error } = await supabase
          .from('digimon')
          .update({
            digimon_id: digimonForm.digimon_id,
            request_id: digimonForm.request_id,
            name: digimonForm.name,
            stage: digimonForm.stage,
            type: digimonForm.type,
            attribute: digimonForm.attribute,
            sprite_url: digimonForm.sprite_url,
            detail_url: digimonForm.detail_url,
            hp: digimonForm.hp,
            sp: digimonForm.sp,
            atk: digimonForm.atk,
            def: digimonForm.def,
            int: digimonForm.int,
            spd: digimonForm.spd,
            hp_level1: digimonForm.hp_level1,
            sp_level1: digimonForm.sp_level1,
            atk_level1: digimonForm.atk_level1,
            def_level1: digimonForm.def_level1,
            int_level1: digimonForm.int_level1,
            spd_level1: digimonForm.spd_level1,
            hp_level99: digimonForm.hp_level99,
            sp_level99: digimonForm.sp_level99,
            atk_level99: digimonForm.atk_level99,
            def_level99: digimonForm.def_level99,
            int_level99: digimonForm.int_level99,
            spd_level99: digimonForm.spd_level99
          })
          .eq('id', editingDigimonId)
          .select();
          
        if (error) throw error;
        
        // Update local lookup table
        if (data && data.length > 0) {
          updateLocalLookupTable(editingDigimonId, data[0] as Digimon);
        }
        
        addNotification({
          message: `Updated ${digimonForm.name} successfully`,
          type: 'success'
        });
      } else {
        // Add new digimon
        const { data, error } = await supabase
          .from('digimon')
          .insert({
            id: digimonForm.digimon_id,
            digimon_id: digimonForm.digimon_id,
            request_id: digimonForm.request_id,
            name: digimonForm.name,
            stage: digimonForm.stage,
            type: digimonForm.type,
            attribute: digimonForm.attribute,
            sprite_url: digimonForm.sprite_url,
            detail_url: digimonForm.detail_url,
            hp: digimonForm.hp,
            sp: digimonForm.sp,
            atk: digimonForm.atk,
            def: digimonForm.def,
            int: digimonForm.int,
            spd: digimonForm.spd,
            hp_level1: digimonForm.hp_level1,
            sp_level1: digimonForm.sp_level1,
            atk_level1: digimonForm.atk_level1,
            def_level1: digimonForm.def_level1,
            int_level1: digimonForm.int_level1,
            spd_level1: digimonForm.spd_level1,
            hp_level99: digimonForm.hp_level99,
            sp_level99: digimonForm.sp_level99,
            atk_level99: digimonForm.atk_level99,
            def_level99: digimonForm.def_level99,
            int_level99: digimonForm.int_level99,
            spd_level99: digimonForm.spd_level99
          })
          .select();
          
        if (error) throw error;
        
        // Update local lookup table
        if (data && data.length > 0) {
          addToLocalLookupTable(data[0] as Digimon);
        }
        
        addNotification({
          message: `Added ${digimonForm.name} successfully`,
          type: 'success'
        });
      }
      
      // Reset form and refresh data
      resetDigimonForm();
      fetchDigimonList();
    } catch (error: any) {
      console.error('Error saving digimon:', error);
      addNotification({
        message: `Error: ${error.message || 'Failed to save digimon'}`,
        type: 'error'
      });
    }
  };
  
  // Handle evolution form submission
  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditingEvolution && editingEvolutionId) {
        // Update existing evolution path
        const { error } = await supabase
          .from('evolution_paths')
          .update({
            from_digimon_id: evolutionForm.from_digimon_id,
            to_digimon_id: evolutionForm.to_digimon_id,
            level_required: evolutionForm.level_required,
            stat_requirements: evolutionForm.stat_requirements,
            dna_requirement: evolutionForm.dna_requirement
          })
          .eq('id', editingEvolutionId);
          
        if (error) throw error;
        
        addNotification({
          message: 'Evolution path updated successfully',
          type: 'success'
        });
      } else {
        // Add new evolution path
        const { error } = await supabase
          .from('evolution_paths')
          .insert({
            from_digimon_id: evolutionForm.from_digimon_id,
            to_digimon_id: evolutionForm.to_digimon_id,
            level_required: evolutionForm.level_required,
            stat_requirements: evolutionForm.stat_requirements,
            dna_requirement: evolutionForm.dna_requirement
          });
          
        if (error) throw error;
        
        addNotification({
          message: 'Evolution path added successfully',
          type: 'success'
        });
      }
      
      // Reset form and refresh data
      resetEvolutionForm();
      fetchEvolutionPaths();
    } catch (error: any) {
      console.error('Error saving evolution path:', error);
      addNotification({
        message: `Error: ${error.message || 'Failed to save evolution path'}`,
        type: 'error'
      });
    }
  };
  
  // Handle edit digimon click
  const handleEditDigimon = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('digimon')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setDigimonForm({
          digimon_id: data.digimon_id,
          request_id: data.request_id,
          name: data.name,
          stage: data.stage,
          type: data.type || '',
          attribute: data.attribute || '',
          sprite_url: data.sprite_url || '',
          detail_url: data.detail_url || '',
          hp: data.hp || 0,
          sp: data.sp || 0,
          atk: data.atk || 0,
          def: data.def || 0,
          int: data.int || 0,
          spd: data.spd || 0,
          hp_level1: data.hp_level1 || 0,
          sp_level1: data.sp_level1 || 0,
          atk_level1: data.atk_level1 || 0,
          def_level1: data.def_level1 || 0,
          int_level1: data.int_level1 || 0,
          spd_level1: data.spd_level1 || 0,
          hp_level99: data.hp_level99 || 0,
          sp_level99: data.sp_level99 || 0,
          atk_level99: data.atk_level99 || 0,
          def_level99: data.def_level99 || 0,
          int_level99: data.int_level99 || 0,
          spd_level99: data.spd_level99 || 0
        });
        setIsEditingDigimon(true);
        setEditingDigimonId(id);
      }
    } catch (error) {
      console.error('Error fetching digimon details:', error);
      addNotification({
        message: 'Failed to load digimon details',
        type: 'error'
      });
    }
  };
  
  // Handle edit evolution click
  const handleEditEvolution = (id: number) => {
    const evolutionToEdit = evolutionPaths.find(path => path.id === id);
    
    if (evolutionToEdit) {
      setEvolutionForm({
        id: evolutionToEdit.id,
        from_digimon_id: evolutionToEdit.from_digimon_id,
        to_digimon_id: evolutionToEdit.to_digimon_id,
        level_required: evolutionToEdit.level_required,
        stat_requirements: evolutionToEdit.stat_requirements,
        dna_requirement: evolutionToEdit.dna_requirement
      });
      
      // Set the search fields
      if (evolutionToEdit.from_digimon) {
        setFromDigimonSearch(evolutionToEdit.from_digimon.name);
      }
      
      if (evolutionToEdit.to_digimon) {
        setToDigimonSearch(evolutionToEdit.to_digimon.name);
      }
      
      setIsEditingEvolution(true);
      setEditingEvolutionId(id);
    }
  };
  
  // Filter digimon based on search and filters
  const filteredDigimon = digimonList
    .filter(digimon => {
      const matchesSearch = 
        digimonSearchTerm === '' || 
        digimon.name.toLowerCase().includes(digimonSearchTerm.toLowerCase()) ||
        digimon.digimon_id.toString().includes(digimonSearchTerm);
      
      const matchesStage = stageFilter === '' || digimon.stage === stageFilter;
      const matchesType = typeFilter === '' || digimon.type === typeFilter;
      const matchesAttribute = attributeFilter === '' || digimon.attribute === attributeFilter;
      
      return matchesSearch && matchesStage && matchesType && matchesAttribute;
    })
    .sort((a, b) => a.id - b.id);
  
  // Filter evolution paths based on search
  const filteredEvolutionPaths = evolutionPaths.filter(path => {
    if (evolutionSearchTerm === '') return true;
    
    const fromName = path.from_digimon?.name.toLowerCase() || '';
    const toName = path.to_digimon?.name.toLowerCase() || '';
    const dnaName = path.dna_digimon?.name.toLowerCase() || '';
    
    return (
      fromName.includes(evolutionSearchTerm.toLowerCase()) ||
      toName.includes(evolutionSearchTerm.toLowerCase()) ||
      dnaName.includes(evolutionSearchTerm.toLowerCase())
    );
  }).sort((a, b) => a.id - b.id);

  // Add these functions to fetch, create, update and delete forms
  const generateFormsLookupTableCode = (formsData: any[]) => {
    // Create the BASE_TO_FORMS_MAP
    const baseToForms: Record<string, any[]> = {};
    
    formsData.forEach(form => {
      if (!baseToForms[form.base_digimon_id]) {
        baseToForms[form.base_digimon_id] = [];
      }
      
      baseToForms[form.base_digimon_id].push({
        formDigimonId: form.form_digimon_id,
        formType: form.form_type,
        unlockCondition: form.unlock_condition
      });
    });
    
    // Create the FORM_TO_BASE_MAP
    const formToBase: Record<string, any> = {};
    
    formsData.forEach(form => {
      formToBase[form.form_digimon_id] = {
        baseDigimonId: form.base_digimon_id,
        formType: form.form_type,
        unlockCondition: form.unlock_condition
      };
    });
  
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormForm(prev => ({
      ...prev,
      [name]: name === 'base_digimon_id' || name === 'form_digimon_id'
        ? value === '' ? null : parseInt(value)
        : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditingForm && editingFormId) {
        // Update existing form
        const { error } = await supabase
          .from('digimon_forms')
          .update({
            base_digimon_id: formForm.base_digimon_id,
            form_digimon_id: formForm.form_digimon_id,
            form_type: formForm.form_type,
            unlock_condition: formForm.unlock_condition
          })
          .eq('id', editingFormId);
          
        if (error) throw error;
        
        addNotification({
          message: 'Digimon form updated successfully',
          type: 'success'
        });
      } else {
        // Create new form
        const { error } = await supabase
          .from('digimon_forms')
          .insert({
            base_digimon_id: formForm.base_digimon_id,
            form_digimon_id: formForm.form_digimon_id,
            form_type: formForm.form_type,
            unlock_condition: formForm.unlock_condition
          });
          
        if (error) throw error;
        
        addNotification({
          message: 'Digimon form created successfully',
          type: 'success'
        });
      }
      
      // Reset form and refresh data
      resetFormForm();
      fetchDigimonForms();
    } catch (error: any) {
      console.error('Error saving digimon form:', error);
      addNotification({
        message: `Error: ${error.message || 'Failed to save digimon form'}`,
        type: 'error'
      });
    }
  };

  // First, update the handleEditForm function to set the search values
  const handleEditForm = (id: number) => {
    const formToEdit = digimonForms.find(form => form.id === id);
    
    if (formToEdit) {
      setFormForm({
        id: formToEdit.id,
        base_digimon_id: formToEdit.base_digimon_id,
        form_digimon_id: formToEdit.form_digimon_id,
        form_type: formToEdit.form_type,
        unlock_condition: formToEdit.unlock_condition
      });
      
      // Set the search fields with the names of the digimon
      if (formToEdit.base_digimon) {
        setBaseDigimonSearch(formToEdit.base_digimon.name);
      }
      
      if (formToEdit.form_digimon) {
        setFormDigimonSearch(formToEdit.form_digimon.name);
      }
      
      setIsEditingForm(true);
      setEditingFormId(id);
    }
  };

  // Update the resetFormForm function to clear search fields
  const resetFormForm = () => {
    setFormForm({
      base_digimon_id: null,
      form_digimon_id: null,
      form_type: 'X-Antibody',
      unlock_condition: null
    });
    
    // Clear search fields
    setBaseDigimonSearch('');
    setFormDigimonSearch('');
    
    setIsEditingForm(false);
    setEditingFormId(null);
  };

  // Filter forms based on search and filters
  const filteredForms = digimonForms.filter(form => {
    const baseDigimon = form.base_digimon as Digimon;
    const formDigimon = form.form_digimon as Digimon;
    
    const matchesSearch = 
      formSearchTerm === '' || 
      (baseDigimon && baseDigimon.name.toLowerCase().includes(formSearchTerm.toLowerCase())) ||
      (formDigimon && formDigimon.name.toLowerCase().includes(formSearchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto p-4">
      <Tab.Group>
        <Tab.List className="flex border-b mb-6">
          <Tab 
            className={({ selected }) => 
              `px-4 py-2 font-medium ${
                selected 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Digimon Database
          </Tab>
          <Tab 
            className={({ selected }) => 
              `px-4 py-2 font-medium ${
                selected 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Evolution Paths
          </Tab>
          <Tab 
            className={({ selected }) => 
              `px-4 py-2 font-medium ${
                selected 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Digimon Forms
          </Tab>
        </Tab.List>
        
        <Tab.Panels>
          {/* Digimon Management Panel */}
          <Tab.Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Digimon Form */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {isEditingDigimon ? 'Edit Digimon' : 'Add New Digimon'}
                  </h2>
                  
                  <button
                    onClick={resetDigimonForm}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Reset Form
                  </button>
                </div>
                
                <form onSubmit={handleDigimonSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Digimon ID</label>
                      <input
                        type="number"
                        name="digimon_id"
                        value={digimonForm.digimon_id}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
                      <input
                        type="number"
                        name="request_id"
                        value={digimonForm.request_id}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={digimonForm.name}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                      <select
                        name="stage"
                        value={digimonForm.stage}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      >
                        {digimonStages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        name="type"
                        value={digimonForm.type}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      >
                        {digimonTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attribute</label>
                      <select
                        name="attribute"
                        value={digimonForm.attribute}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      >
                        {digimonAttributes.map(attribute => (
                          <option key={attribute} value={attribute}>{attribute}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sprite URL</label>
                      <input
                        type="text"
                        name="sprite_url"
                        value={digimonForm.sprite_url}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detail URL</label>
                      <input
                        type="text"
                        name="detail_url"
                        value={digimonForm.detail_url}
                        onChange={handleDigimonInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Level 50 Stats */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Level 50 Base Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HP</label>
                        <input
                          type="number"
                          name="hp"
                          value={digimonForm.hp || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SP</label>
                        <input
                          type="number"
                          name="sp"
                          value={digimonForm.sp || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ATK</label>
                        <input
                          type="number"
                          name="atk"
                          value={digimonForm.atk || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DEF</label>
                        <input
                          type="number"
                          name="def"
                          value={digimonForm.def || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">INT</label>
                        <input
                          type="number"
                          name="int"
                          value={digimonForm.int || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SPD</label>
                        <input
                          type="number"
                          name="spd"
                          value={digimonForm.spd || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Level 1 Stats */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Level 1 Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HP (Lv.1)</label>
                        <input
                          type="number"
                          name="hp_level1"
                          value={digimonForm.hp_level1 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SP (Lv.1)</label>
                        <input
                          type="number"
                          name="sp_level1"
                          value={digimonForm.sp_level1 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ATK (Lv.1)</label>
                        <input
                          type="number"
                          name="atk_level1"
                          value={digimonForm.atk_level1 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DEF (Lv.1)</label>
                        <input
                          type="number"
                          name="def_level1"
                          value={digimonForm.def_level1 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">INT (Lv.1)</label>
                        <input
                          type="number"
                          name="int_level1"
                          value={digimonForm.int_level1 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SPD (Lv.1)</label>
                        <input
                          type="number"
                          name="spd_level1"
                          value={digimonForm.spd_level1 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Level 99 Stats */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Level 99 Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HP (Lv.99)</label>
                        <input
                          type="number"
                          name="hp_level99"
                          value={digimonForm.hp_level99 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SP (Lv.99)</label>
                        <input
                          type="number"
                          name="sp_level99"
                          value={digimonForm.sp_level99 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ATK (Lv.99)</label>
                        <input
                          type="number"
                          name="atk_level99"
                          value={digimonForm.atk_level99 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DEF (Lv.99)</label>
                        <input
                          type="number"
                          name="def_level99"
                          value={digimonForm.def_level99 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">INT (Lv.99)</label>
                        <input
                          type="number"
                          name="int_level99"
                          value={digimonForm.int_level99 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SPD (Lv.99)</label>
                        <input
                          type="number"
                          name="spd_level99"
                          value={digimonForm.spd_level99 || ''}
                          onChange={handleDigimonInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded ${
                        isEditingDigimon 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isEditingDigimon ? 'Update Digimon' : 'Add Digimon'}
                    </button>
                  </div>
                </form>
                {/* Lookup Table Code Section */}
                <div className="mt-8 bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Update Digimon Lookup Table</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    After making changes, copy this code to replace the contents of <code>src/constants/digimonLookup.ts</code>
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lookupTableCode);
                        addNotification({
                          message: 'Lookup table code copied to clipboard',
                          type: 'success'
                        });
                      }}
                      className="absolute top-4 right-8 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Copy to Clipboard
                    </button>
                    <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-xs whitespace-pre-wrap">{lookupTableCode}</pre>
                  </div>
                </div>
              </div>
              
              {/* Digimon List */}
              <div>
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Digimon Database</h2>
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      className="w-full p-2 border rounded"
                      value={digimonSearchTerm}
                      onChange={(e) => setDigimonSearchTerm(e.target.value)}
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
                        {digimonStages.map(stage => (
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
                        {digimonTypes.map(type => (
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
                        {digimonAttributes.map(attribute => (
                          <option key={attribute} value={attribute}>{attribute}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredDigimon.map(digimon => (
                        <div 
                          key={digimon.id}
                          className="cursor-pointer border rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          onClick={() => handleEditDigimon(digimon.id)}
                        >
                          <div className="flex flex-col items-center">
                            <p className="text-xs text-gray-500 mb-1">ID: {digimon.digimon_id}</p>
                            <div className="w-16 h-16 flex items-center justify-center">
                              <DigimonSprite
                                digimonName={digimon.name}
                                fallbackSpriteUrl={digimon.sprite_url}
                                size="xs"
                                showHappinessAnimations={true}
                              />
                            </div>
                            <p className="text-xs font-medium text-center mt-1">{digimon.name}</p>
                            <p className="text-xs text-gray-500">{digimon.stage}</p>
                            <p className="text-xs text-gray-500">{digimon.type} | {digimon.attribute}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
          
          {/* Evolution Paths Management Panel */}
          <Tab.Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Evolution Path Form */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {isEditingEvolution ? 'Edit Evolution Path' : 'Add New Evolution Path'}
                  </h2>
                  
                  <button
                    onClick={resetEvolutionForm}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Reset Form
                  </button>
                </div>
                
                <form onSubmit={handleEvolutionSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* For the Evolution Paths tab - replace the From Digimon dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Digimon</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for source digimon..."
                          value={fromDigimonSearch}
                          onChange={(e) => {
                            setFromDigimonSearch(e.target.value);
                            setShowFromDigimonResults(true);
                          }}
                          className="w-full p-2 border rounded"
                          onBlur={() => setTimeout(() => setShowFromDigimonResults(false), 200)}
                          onFocus={() => setShowFromDigimonResults(true)}
                        />
                        {showFromDigimonResults && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            {filteredFromDigimon.length > 0 ? (
                              filteredFromDigimon.map(digimon => (
                                <div
                                  key={digimon.id}
                                  onClick={() => selectFromDigimon(digimon)}
                                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 flex items-center"
                                >
                                  <DigimonSprite
                                    digimonName={digimon.name}
                                    fallbackSpriteUrl={digimon.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                  <span className="ml-2">{digimon.name} - {digimon.stage}</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No digimon found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Replace the To Digimon dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Digimon</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for target digimon..."
                          value={toDigimonSearch}
                          onChange={(e) => {
                            setToDigimonSearch(e.target.value);
                            setShowToDigimonResults(true);
                          }}
                          className="w-full p-2 border rounded"
                          onBlur={() => setTimeout(() => setShowToDigimonResults(false), 200)}
                          onFocus={() => setShowToDigimonResults(true)}
                        />
                        {showToDigimonResults && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            {filteredToDigimon.length > 0 ? (
                              filteredToDigimon.map(digimon => (
                                <div
                                  key={digimon.id}
                                  onClick={() => selectToDigimon(digimon)}
                                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 flex items-center"
                                >
                                  <DigimonSprite
                                    digimonName={digimon.name}
                                    fallbackSpriteUrl={digimon.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                  <span className="ml-2">{digimon.name} - {digimon.stage}</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No digimon found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level Required</label>
                      <input
                        type="number"
                        name="level_required"
                        value={evolutionForm.level_required || ''}
                        onChange={handleEvolutionInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                        max="99"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNA Requirement</label>
                      <select
                        name="dna_requirement"
                        value={evolutionForm.dna_requirement || ''}
                        onChange={handleEvolutionInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">None (Normal Evolution)</option>
                        {digimonList.map(digimon => (
                          <option key={digimon.id} value={digimon.id}>
                            {digimon.name} - {digimon.stage}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Required second Digimon for DNA evolution</p>
                    </div>
                  </div>
                  
                  {/* Stat Requirements */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Stat Requirements</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HP Required</label>
                        <input
                          type="number"
                          name="hp"
                          value={evolutionForm.stat_requirements.hp || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SP Required</label>
                        <input
                          type="number"
                          name="sp"
                          value={evolutionForm.stat_requirements.sp || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ATK Required</label>
                        <input
                          type="number"
                          name="atk"
                          value={evolutionForm.stat_requirements.atk || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DEF Required</label>
                        <input
                          type="number"
                          name="def"
                          value={evolutionForm.stat_requirements.def || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">INT Required</label>
                        <input
                          type="number"
                          name="int"
                          value={evolutionForm.stat_requirements.int || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SPD Required</label>
                        <input
                          type="number"
                          name="spd"
                          value={evolutionForm.stat_requirements.spd || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ABI Required</label>
                        <input
                          type="number"
                          name="abi"
                          value={evolutionForm.stat_requirements.abi || ''}
                          onChange={handleStatRequirementChange}
                          className="w-full p-2 border rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded ${
                        isEditingEvolution 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isEditingEvolution ? 'Update Evolution Path' : 'Add Evolution Path'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Evolution Paths List */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Evolution Paths</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search evolution paths..."
                    className="w-full p-2 border rounded"
                    value={evolutionSearchTerm}
                    onChange={(e) => setEvolutionSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="max-h-[600px] overflow-y-auto mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level Req.</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNA</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEvolutionPaths.map(path => (
                        <tr key={path.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              {path.from_digimon ? (
                                <>
                                  <DigimonSprite
                                    digimonName={path.from_digimon.name}
                                    fallbackSpriteUrl={path.from_digimon.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                  <span className="ml-2">{path.from_digimon.name}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              {path.to_digimon && (
                                <>
                                  <DigimonSprite
                                    digimonName={path.to_digimon.name}
                                    fallbackSpriteUrl={path.to_digimon.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                  <span className="ml-2">{path.to_digimon.name}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {path.level_required > 0 ? `Lv. ${path.level_required}` : 'None'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {path.dna_digimon ? (
                              <div className="flex items-center">
                                <img 
                                  src={path.dna_digimon.sprite_url} 
                                  alt={path.dna_digimon.name}
                                  className="w-6 h-6 mr-2"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <span>{path.dna_digimon.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditEvolution(path.id)}
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Tab.Panel>
          
          {/* Digimon Forms Management Panel */}
          <Tab.Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Digimon Forms Form */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {isEditingForm ? 'Edit Digimon Form' : 'Add New Digimon Form'}
                  </h2>
                  
                  <button
                    onClick={resetFormForm}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Reset Form
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* For the Digimon Forms tab - replace the Base Digimon dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Digimon</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for base digimon..."
                          value={baseDigimonSearch}
                          onChange={(e) => {
                            setBaseDigimonSearch(e.target.value);
                            setShowBaseDigimonResults(true);
                          }}
                          className="w-full p-2 border rounded"
                          onBlur={() => setTimeout(() => setShowBaseDigimonResults(false), 200)}
                          onFocus={() => setShowBaseDigimonResults(true)}
                        />
                        {showBaseDigimonResults && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            {filteredBaseDigimon.length > 0 ? (
                              filteredBaseDigimon.map(digimon => (
                                <div
                                  key={digimon.id}
                                  onClick={() => selectBaseDigimon(digimon)}
                                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 flex items-center"
                                >
                                  <DigimonSprite
                                    digimonName={digimon.name}
                                    fallbackSpriteUrl={digimon.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                  <span className="ml-2">{digimon.name} - {digimon.stage}</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No digimon found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Replace the Form Digimon dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Form Digimon</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for form digimon..."
                          value={formDigimonSearch}
                          onChange={(e) => {
                            setFormDigimonSearch(e.target.value);
                            setShowFormDigimonResults(true);
                          }}
                          className="w-full p-2 border rounded"
                          onBlur={() => setTimeout(() => setShowFormDigimonResults(false), 200)}
                          onFocus={() => setShowFormDigimonResults(true)}
                        />
                        {showFormDigimonResults && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            {filteredFormDigimon.length > 0 ? (
                              filteredFormDigimon.map(digimon => (
                                <div
                                  key={digimon.id}
                                  onClick={() => selectFormDigimon(digimon)}
                                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 flex items-center"
                                >
                                  <DigimonSprite
                                    digimonName={digimon.name}
                                    fallbackSpriteUrl={digimon.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                  <span className="ml-2">{digimon.name} - {digimon.stage}</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No digimon found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                      <select
                        name="form_type"
                        value={formForm.form_type}
                        onChange={handleFormInputChange}
                        className="w-full p-2 border rounded"
                      >
                        {formTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unlock Condition</label>
                      <input
                        type="text"
                        name="unlock_condition"
                        value={formForm.unlock_condition || ''}
                        onChange={handleFormInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded ${
                        isEditingForm 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isEditingForm ? 'Update Digimon Form' : 'Add Digimon Form'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Digimon Forms List */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Digimon Forms</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search forms..."
                    className="w-full p-2 border rounded"
                    value={formSearchTerm}
                    onChange={(e) => setFormSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="max-h-[600px] overflow-y-auto mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Digimon</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Digimon</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Type</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unlock Condition</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredForms.map(form => (
                        <tr key={form.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {form.base_digimon as Digimon ? (
                              <div className="flex items-center">
                                <DigimonSprite
                                  digimonName={(form.base_digimon as Digimon).name}
                                  fallbackSpriteUrl={(form.base_digimon as Digimon).sprite_url}
                                  size="xs"
                                  showHappinessAnimations={false}
                                />
                                <span className="ml-2">{(form.base_digimon as Digimon).name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {form.form_digimon as Digimon ? (
                              <div className="flex items-center">
                                <DigimonSprite
                                  digimonName={(form.form_digimon as Digimon).name}
                                  fallbackSpriteUrl={(form.form_digimon as Digimon).sprite_url}
                                  size="xs"
                                  showHappinessAnimations={false}
                                />
                                <span className="ml-2">{(form.form_digimon as Digimon).name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {form.form_type}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {form.unlock_condition || 'None'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditForm(form.id || 0)}
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AdminDigimonManager; 