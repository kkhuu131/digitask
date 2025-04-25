// App.tsx
import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  Node,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Digimon } from '../store/petStore';
import { useDigimonData } from '../hooks/useDigimonData';

// First, let's add a function to get stage colors
const getStageColor = (stage: string): { bg: string, border: string, hoverBorder: string } => {
  switch(stage) {
    case 'Baby':
      return { bg: 'bg-pink-50', border: 'border-pink-200', hoverBorder: 'hover:border-pink-400' };
    case 'In-Training':
      return { bg: 'bg-blue-50', border: 'border-blue-200', hoverBorder: 'hover:border-blue-400' };
    case 'Rookie':
      return { bg: 'bg-green-50', border: 'border-green-200', hoverBorder: 'hover:border-green-400' };
    case 'Champion':
      return { bg: 'bg-yellow-50', border: 'border-yellow-200', hoverBorder: 'hover:border-yellow-400' };
    case 'Ultimate':
      return { bg: 'bg-purple-50', border: 'border-purple-200', hoverBorder: 'hover:border-purple-400' };
    case 'Mega':
      return { bg: 'bg-red-50', border: 'border-red-200', hoverBorder: 'hover:border-red-400' };
    case 'Ultra':
      return { bg: 'bg-indigo-50', border: 'border-indigo-200', hoverBorder: 'hover:border-indigo-400' };
    case 'Armor':
      return { bg: 'bg-amber-50', border: 'border-amber-200', hoverBorder: 'hover:border-amber-400' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', hoverBorder: 'hover:border-gray-400' };
  }
};

// DigimonNode with conditional rendering based on zoom level
const DigimonNode = memo(({ data }: { data: Digimon & { 
  isHighlighted: boolean; 
  onHover: (id: number) => void;
  zoomLevel: number;
  isDiscovered: boolean;
  isEvolution: boolean;
} }) => {
  const { bg, border } = useMemo(() => getStageColor(data.stage), [data.stage]);
  
  // Remove hover handlers since we're disabling hover effects
  
  // For undiscovered evolutions, show silhouette
  const renderUndiscoveredNode = () => (
    <div 
      className={`p-2 ${bg} rounded-lg shadow-lg border-2 ${data.isHighlighted ? 'border-blue-500' : border} 
        transition-colors cursor-pointer w-32 flex flex-col items-center justify-center`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex flex-col items-center justify-center">
        {data.sprite_url && (
          <div className="w-20 h-20 flex items-center justify-center">
            <img 
              src={data.sprite_url} 
              alt="Unknown Digimon" 
              style={{ imageRendering: "pixelated", filter: "brightness(0)" }} 
              className="w-20 h-20 object-contain opacity-70" 
              loading="lazy" 
            />
          </div>
        )}
        <p className="text-center text-sm font-medium mt-2">???</p>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
  
  if (data.zoomLevel < 0.4) {
    return (
      <div 
        className={`p-1 ${bg} rounded-lg shadow-sm border-2 ${data.isHighlighted ? 'border-blue-500' : border} 
          transition-colors w-16 h-16 flex items-center justify-center`}
      >
        <Handle type="target" position={Position.Left} />
        <p className="text-center text-xs truncate">
          {data.isDiscovered ? data.name : "???"}
        </p>
        <Handle type="source" position={Position.Right} />
      </div>
    );
  }

  // If not discovered but is an evolution, show silhouette
  if (!data.isDiscovered && data.isEvolution) {
    return renderUndiscoveredNode();
  }
  
  // If discovered, show normally
  return (
    <div 
      className={`p-2 ${bg} rounded-lg shadow-lg border-2 ${data.isHighlighted ? 'border-blue-500' : border} 
        transition-colors cursor-pointer w-32 flex flex-col items-center justify-center`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex flex-col items-center justify-center">
        {data.sprite_url && (
          <img 
            src={data.sprite_url} 
            alt={data.name} 
            style={{ imageRendering: "pixelated" }} 
            className="w-20 h-20 object-contain" 
            loading="lazy" 
          />
        )}
        <p className="text-center text-sm font-medium mt-2">{data.name}</p>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.data.isHighlighted === nextProps.data.isHighlighted &&
    prevProps.data.zoomLevel === nextProps.data.zoomLevel &&
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.isDiscovered === nextProps.data.isDiscovered &&
    prevProps.data.isEvolution === nextProps.data.isEvolution
  );
});

// Create nodeTypes outside the component
const nodeTypes = {
  digimonNode: DigimonNode,
};

const DigimonEvolutionGraph: React.FC = () => {
  // Use the shared hook instead of the local one
  const { digimon, evolutionPaths, loading } = useDigimonData();
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statLevel, setStatLevel] = useState<1 | 50 | 99>(1);
  
  // Get the user ID from the auth store
  const { user } = useAuthStore();
  
  // Move the discovered Digimon state inside the component
  const [discoveredDigimon, setDiscoveredDigimon] = useState<Set<number>>(new Set());
  
  // Use ReactFlow's built-in state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Add a ref to access the ReactFlow instance
  const reactFlowInstance = useRef<any>(null);

  const stages = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Ultra', 'Mega', 'Armor'];
  
  // Add a function to fetch user's discovered Digimon
  const fetchUserDiscoveredDigimon = useCallback(async () => {
    if (!user?.id) return; // Don't fetch if user ID is not available
    
    const { data } = await supabase
      .from('user_discovered_digimon')
      .select('digimon_id')
      .eq('user_id', user.id);
    
    if (data) {
      setDiscoveredDigimon(new Set(data.map(item => item.digimon_id)));
    }
  }, [user?.id]); // Add user?.id as a dependency
  
  // Call the function when the component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserDiscoveredDigimon();
    }
  }, [fetchUserDiscoveredDigimon, user?.id]);

  // Update the filteredDigimon function to only include discovered Digimon and their direct evolutions
  const filteredDigimon = useMemo(() => {
    if (loading || !discoveredDigimon.size) return [];
    
    // First, get all discovered Digimon
    const discoveredOnes = digimon.filter(d => discoveredDigimon.has(d.id));
    const discoveredIds = new Set(discoveredOnes.map(d => d.id));
    
    // Find only direct evolutions of discovered Digimon
    const directEvolutionIds = new Set<number>();
    
    evolutionPaths.forEach(path => {
      // If the "from" Digimon is discovered, add the "to" Digimon as a direct evolution
      if (discoveredIds.has(path.from_digimon_id)) {
        directEvolutionIds.add(path.to_digimon_id);
      }
      
      // If the "to" Digimon is discovered, add the "from" Digimon as a direct evolution
      if (discoveredIds.has(path.to_digimon_id)) {
        directEvolutionIds.add(path.from_digimon_id);
      }
    });
    
    // If there's a search term, only filter discovered Digimon (not evolutions)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      return discoveredOnes.filter(d => 
        d.name.toLowerCase().includes(term) || 
        (d.type && d.type.toLowerCase().includes(term)) || 
        (d.attribute && d.attribute.toLowerCase().includes(term))
      );
    }
    
    // Combine discovered Digimon with their direct evolutions
    let result = [...discoveredOnes];
    
    // Add direct evolutions that aren't already discovered
    digimon.forEach(d => {
      if (directEvolutionIds.has(d.id) && !discoveredIds.has(d.id)) {
        result.push(d);
      }
    });
    
    return result;
  }, [digimon, discoveredDigimon, searchTerm, loading, evolutionPaths]);
  
  // Get IDs of filtered digimon for edge filtering
  const filteredDigimonIds = useMemo(() => 
    new Set(filteredDigimon.map(d => d.id)), 
    [filteredDigimon]
  );
  
  // Memoize the filtered edges calculation
  const filteredEdges = useMemo(() => {
    if (loading || !filteredDigimonIds.size) return [];
    
    return evolutionPaths
      .filter(p =>
        filteredDigimonIds.has(p.from_digimon_id) &&
        filteredDigimonIds.has(p.to_digimon_id)
      )
      .map(p => {
        // Only highlight edges connected to the selected Digimon
        const isSelected = selectedDigimon?.id === p.from_digimon_id || selectedDigimon?.id === p.to_digimon_id;
        
        return {
          id: `e${p.from_digimon_id}-${p.to_digimon_id}`,
          source: p.from_digimon_id.toString(),
          target: p.to_digimon_id.toString(),
          type: 'default',
          animated: isSelected,
          style: {
            stroke: isSelected ? '#2563eb' : '#cbd5e1',
            strokeWidth: isSelected ? 5 : 1.5,
            opacity: selectedDigimon ? (isSelected ? 1 : 0.3) : 0.7
          },
        };
      });
  }, [evolutionPaths, filteredDigimonIds, selectedDigimon, loading]);

  // Update the node creation effect to properly mark direct evolutions
  useEffect(() => {
    if (loading) return;
    
    // Find all unique stages in the data
    const uniqueStages = Array.from(new Set(filteredDigimon.map(d => d.stage)));
    
    // Create a mapping of stages to column positions
    const stagePositions: Record<string, number> = {};
    
    // Maximum number of Digimon per column before splitting
    const MAX_DIGIMON_PER_COLUMN = 20;
    
    // Calculate how many columns each stage will need
    const stageColumnCounts: Record<string, number> = {};
    let totalColumns = 0;
    
    uniqueStages.forEach(stage => {
      const stageDigimon = filteredDigimon.filter(d => d.stage === stage);
      const columnCount = Math.ceil(stageDigimon.length / MAX_DIGIMON_PER_COLUMN);
      stageColumnCounts[stage] = columnCount;
      
      // Assign column positions
      if (stages.includes(stage)) {
        stagePositions[stage] = totalColumns;
        totalColumns += columnCount;
      } else {
        // For unknown stages, place at the end
        stagePositions[stage] = totalColumns;
        totalColumns += columnCount;
      }
    });
    
    // Group digimon by stage
    const digimonByStage = uniqueStages.reduce((acc, stage) => {
      acc[stage] = filteredDigimon.filter(d => d.stage === stage);
      return acc;
    }, {} as Record<string, Digimon[]>);
    
    // Find the maximum number of Digimon in any column after splitting
    const maxDigimonInColumn = Math.min(MAX_DIGIMON_PER_COLUMN, 
      Math.max(...Object.values(digimonByStage).map(group => 
        Math.ceil(group.length / stageColumnCounts[group[0]?.stage || ''])
      ))
    );
    
    // Create a set of discovered Digimon IDs
    const discoveredIds = new Set<number>();
    filteredDigimon.forEach(d => {
      if (discoveredDigimon.has(d.id)) {
        discoveredIds.add(d.id);
      }
    });
    
    // Find direct evolutions of discovered Digimon
    const directEvolutionIds = new Set<number>();
    evolutionPaths.forEach(path => {
      if (discoveredIds.has(path.from_digimon_id)) {
        directEvolutionIds.add(path.to_digimon_id);
      }
      if (discoveredIds.has(path.to_digimon_id)) {
        directEvolutionIds.add(path.from_digimon_id);
      }
    });
    
    const newNodes: Node[] = filteredDigimon.map((d) => {
      // Get the base column position for this stage
      const baseColumnIndex = stagePositions[d.stage] || 0;
      
      // Get position within this stage group
      const stageDigimon = digimonByStage[d.stage] || [];
      const indexInStage = stageDigimon.findIndex(sd => sd.id === d.id);
      
      // Calculate which sub-column this Digimon belongs to
      const subColumnIndex = Math.floor(indexInStage / MAX_DIGIMON_PER_COLUMN);
      const indexInSubColumn = indexInStage % MAX_DIGIMON_PER_COLUMN;
      
      // Calculate total Digimon in this sub-column
      const totalInSubColumn = Math.min(
        MAX_DIGIMON_PER_COLUMN,
        stageDigimon.length - (subColumnIndex * MAX_DIGIMON_PER_COLUMN)
      );
      
      // Calculate vertical offset for centering
      const verticalOffset = (maxDigimonInColumn - totalInSubColumn) * 50;
      
      // Only highlight nodes connected to the selected Digimon
      const isHighlighted = selectedDigimon?.id === d.id || evolutionPaths.some(p => 
        (selectedDigimon?.id && ((p.from_digimon_id === selectedDigimon.id && p.to_digimon_id === d.id) ||
          (p.to_digimon_id === selectedDigimon.id && p.from_digimon_id === d.id)))
      );

      return {
        id: d.id.toString(),
        type: 'digimonNode',
        position: {
          x: (baseColumnIndex + subColumnIndex) * 300,
          y: indexInSubColumn * 150 + verticalOffset
        },
        data: {
          ...d,
          isHighlighted,
          onHover: () => {}, // Empty function since we're not using hover effects
          zoomLevel,
          isDiscovered: discoveredIds.has(d.id),
          isEvolution: directEvolutionIds.has(d.id)
        }
      };
    });
    
    setNodes(newNodes);
    
  }, [filteredDigimon, evolutionPaths, selectedDigimon, zoomLevel, discoveredDigimon, loading]);

  // Add a state to track when search results change
  const [prevSearchLength, setPrevSearchLength] = useState<number>(0);

  // Update the edge effect to only fit view when search results change
  useEffect(() => {
    if (loading) return;
    
    setEdges(filteredEdges);
    
    // Only fit view when search results change, not on hover
    if (filteredDigimon.length !== prevSearchLength) {
      setPrevSearchLength(filteredDigimon.length);
      
      // Fit view after nodes and edges are updated
      setTimeout(() => {
        if (reactFlowInstance.current && filteredDigimon.length > 0 && filteredDigimon.length < digimon.length) {
          reactFlowInstance.current.fitView({ padding: 0.2, includeHiddenNodes: false });
        }
      }, 50);
    }
  }, [filteredEdges, filteredDigimon, digimon.length, loading, setEdges, prevSearchLength]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const digimonData = digimon.find(d => d.id.toString() === node.id);
    setSelectedDigimon(digimonData || null);
  }, [digimon]);

  const onZoomChange = useCallback((e: any) => {
    if (e && e.zoom != null) {
      setZoomLevel(e.zoom);
    }
  }, []);

  // Add search input handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Add search clear handler
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Update the getStatsForLevel function to use actual database values
  const getStatsForLevel = (digimon: Digimon, level: 1 | 50 | 99) => {
    if (level === 1) {
      return {
        hp: digimon.hp_level1 || digimon.hp,
        sp: digimon.sp_level1 || digimon.sp,
        atk: digimon.atk_level1 || digimon.atk,
        def: digimon.def_level1 || digimon.def,
        int: digimon.int_level1 || digimon.int,
        spd: digimon.spd_level1 || digimon.spd
      };
    } else if (level === 99) {
      return {
        hp: digimon.hp_level99,
        sp: digimon.sp_level99,
        atk: digimon.atk_level99,
        def: digimon.def_level99,
        int: digimon.int_level99,
        spd: digimon.spd_level99
      };
    } else {
      // For level 50, interpolate between level 1 and 99
      const calculateMidpoint = (val1: number | null, val99: number | null) => {
        if (val1 === null || val99 === null) return null;
        return Math.floor(val1 + (val99 - val1) * 0.5);
      };
      
      return {
        hp: calculateMidpoint(digimon.hp_level1, digimon.hp_level99),
        sp: calculateMidpoint(digimon.sp_level1, digimon.sp_level99),
        atk: calculateMidpoint(digimon.atk_level1, digimon.atk_level99),
        def: calculateMidpoint(digimon.def_level1, digimon.def_level99),
        int: calculateMidpoint(digimon.int_level1, digimon.int_level99),
        spd: calculateMidpoint(digimon.spd_level1, digimon.spd_level99)
      };
    }
  };

  // Update the evolution path click handlers to center on the selected node
  const handleEvolutionClick = useCallback((digimonToSelect: Digimon) => {
    setSelectedDigimon(digimonToSelect);
    
    // Center view on the selected node
    setTimeout(() => {
      if (reactFlowInstance.current) {
        const nodeId = digimonToSelect.id.toString();
        const node = reactFlowInstance.current.getNode(nodeId);
        
        if (node) {
          reactFlowInstance.current.setCenter(
            node.position.x + 150,
            node.position.y + 50,
            { zoom: 1, duration: 800 }
          );
        }
      }
    }, 50);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar - updated styling */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm mb-4">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, type, or attribute..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={clearSearch}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <div className="ml-4 text-sm text-gray-600 font-medium">
            {filteredDigimon.length} of {digimon.length} Digimon, only showing discovered and direct evolutions
          </div>
        </div>
      </div>
      
      {/* Main content - update to fixed width side panel */}
      <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-lg" style={{ height: "calc(100vh - 250px)" }}>
        <div className="flex-grow h-full" style={{ position: 'relative' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl">Loading Digimon data...</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onInit={(instance: any) => {
                  reactFlowInstance.current = instance;
                }}
                fitView
                minZoom={0.1}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                onMove={onZoomChange}
                connectionLineType={ConnectionLineType.Bezier}
                elementsSelectable={true}
                nodesDraggable={false}
                nodesConnectable={false}
                snapToGrid={true}
                snapGrid={[20, 20]}
                style={{ width: '100%', height: '100%' }}
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          )}
        </div>
        
        {/* Side panel with fixed width of 350px */}
        <div className="w-[350px] flex-shrink-0 h-full bg-gray-50 p-4 overflow-y-auto border-l border-gray-200 shadow-inner">
          {selectedDigimon ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <h2 className="text-xl font-bold">
                  {discoveredDigimon.has(selectedDigimon.id) ? selectedDigimon.name : "???"}
                </h2>
                <p className="text-sm opacity-80">
                  #{selectedDigimon.id} • {selectedDigimon.stage}
                </p>
              </div>
              
              {/* Image section with background */}
              <div className="p-4 bg-gray-100 flex justify-center">
                {selectedDigimon.sprite_url && (
                  <img 
                    src={selectedDigimon.sprite_url} 
                    alt={discoveredDigimon.has(selectedDigimon.id) ? selectedDigimon.name : "Unknown Digimon"} 
                    style={{ 
                      imageRendering: "pixelated",
                      filter: discoveredDigimon.has(selectedDigimon.id) ? "none" : "brightness(0)"
                    }} 
                    className={`w-32 h-32 ${!discoveredDigimon.has(selectedDigimon.id) && "opacity-70"}`}
                  />
                )}
              </div>
              
              {/* Details section */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Type</p>
                    <p className="font-medium text-gray-800">
                      {discoveredDigimon.has(selectedDigimon.id) ? (selectedDigimon.type || 'Unknown') : "???"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Attribute</p>
                    <p className="font-medium text-gray-800">
                      {discoveredDigimon.has(selectedDigimon.id) ? (selectedDigimon.attribute || 'Unknown') : "???"}
                    </p>
                  </div>
                </div>
                
                {/* Only show stats for discovered Digimon */}
                {discoveredDigimon.has(selectedDigimon.id) && (
                  <>
                    {/* Level tabs with updated styling */}
                    <div className="flex mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {[1, 50, 99].map((level) => (
                        <button 
                          key={level}
                          className={`py-2 px-4 font-medium text-sm flex-1 text-black m-1 ${
                            statLevel === level
                              ? 'bg-gray-200'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                          onClick={() => setStatLevel(level as 1 | 50 | 99)}
                        >
                          Level {level}
                        </button>
                      ))}
                    </div>

                    {/* Stats display with consistent styling */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(getStatsForLevel(selectedDigimon, statLevel)).map(([stat, value]) => (
                        <div key={stat} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                            {stat === 'hp' ? 'HP' : 
                             stat === 'sp' ? 'SP' : 
                             stat === 'atk' ? 'Attack' : 
                             stat === 'def' ? 'Defense' : 
                             stat === 'int' ? 'Intelligence' : 'Speed'}
                          </p>
                          <p className="font-medium text-gray-800 text-lg">{value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Evolution paths section - always show this section */}
                <div className="mt-5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Evolution Paths</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Evolves From
                      </h4>
                      
                      <div className="pl-2 border-l-2 border-blue-200">
                        {evolutionPaths.filter(p => p.to_digimon_id === selectedDigimon.id).length > 0 ? (
                          <ul className="space-y-1">
                            {evolutionPaths
                              .filter(p => p.to_digimon_id === selectedDigimon.id)
                              .map(p => {
                                const fromDigimon = digimon.find(d => d.id === p.from_digimon_id);
                                const isDiscovered = fromDigimon && discoveredDigimon.has(fromDigimon.id);
                                
                                return fromDigimon ? (
                                  <li 
                                    key={`from-${p.id}`} 
                                    className="p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                                    onClick={() => handleEvolutionClick(fromDigimon)}>
                                    {fromDigimon.sprite_url && (
                                      <img 
                                        src={fromDigimon.sprite_url} 
                                        alt={isDiscovered ? fromDigimon.name : "Unknown Digimon"} 
                                        style={{ 
                                          imageRendering: "pixelated",
                                          filter: isDiscovered ? "none" : "brightness(0)" 
                                        }} 
                                        className={`w-8 h-8 mr-2 ${!isDiscovered && "opacity-70"}`} 
                                      />
                                    )}
                                    <span className="font-medium text-black">
                                      {isDiscovered ? fromDigimon.name : "???"}
                                    </span>
                                    <span className="ml-auto text-xs text-gray-500">{fromDigimon.stage}</span>
                                  </li>
                                ) : null;
                              })}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">None found</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Evolves To
                      </h4>
                      
                      <div className="pl-2 border-l-2 border-green-200">
                        {evolutionPaths.filter(p => p.from_digimon_id === selectedDigimon.id).length > 0 ? (
                          <ul className="space-y-1">
                            {evolutionPaths
                              .filter(p => p.from_digimon_id === selectedDigimon.id)
                              .map(p => {
                                const toDigimon = digimon.find(d => d.id === p.to_digimon_id);
                                const isDiscovered = toDigimon && discoveredDigimon.has(toDigimon.id);
                                
                                return toDigimon ? (
                                  <li 
                                    key={`to-${p.id}`} 
                                    className="p-2 bg-green-50 rounded hover:bg-green-100 transition-colors cursor-pointer flex items-center"
                                    onClick={() => handleEvolutionClick(toDigimon)}>
                                    {toDigimon.sprite_url && (
                                      <img 
                                        src={toDigimon.sprite_url} 
                                        alt={isDiscovered ? toDigimon.name : "Unknown Digimon"}
                                        style={{ 
                                          imageRendering: "pixelated",
                                          filter: isDiscovered ? "none" : "brightness(0)" 
                                        }} 
                                        className={`w-8 h-8 mr-2 ${!isDiscovered && "opacity-70"}`} 
                                      />
                                      
                                    )}
                                    <div className="flex flex-col ml-2">
                                      <div>
                                      <span className="font-medium text-black">
                                        {isDiscovered ? toDigimon.name : "???"}
                                      </span>
                                      </div>
                                      <div>
                                        {p.level_required > 0 && (
                                          <span className="text-xs text-gray-600">
                                            Level: {p.level_required}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="ml-auto text-xs text-gray-500">{toDigimon.stage}</span>
                                  </li>
                                ) : null;
                              })}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">None found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 font-medium">Click a Digimon to view details</p>
              <p className="text-gray-400 text-sm mt-2">Select any node in the diagram to see its information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Install dependencies:
// npm install @supabase/supabase-js react-flow-renderer

export default DigimonEvolutionGraph;