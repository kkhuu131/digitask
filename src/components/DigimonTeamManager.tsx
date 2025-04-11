import { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { useDigimonStore } from '../store/petStore';
import { UserDigimon } from '../store/petStore';

// Define types for drag items
interface DigimonDragItem {
  id: string;
  isTeam: boolean;
}

// Define component prop types
interface DigimonCardProps {
  digimon: UserDigimon;
  isTeam: boolean;
  onSwap: (id1: string, id2: string) => void;
  onMove: (id: string) => void;
}

interface EmptySlotProps {
  isTeam: boolean;
  onAddToTeam: (digimonId: string) => void;
}

// Progress bar component for HP and EXP
interface ProgressBarProps {
  value: number;
  maxValue: number;
  color: string;
  label: string;
}

const ProgressBar = ({ value, maxValue, color, label }: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  return (
    <div className="w-full mt-1">
      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
        <span>{label}</span>
        <span>{value}/{maxValue}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Single item type for all Digimon
const DIGIMON_TYPE = 'digimon';

// Simplified DigimonCard component
const DigimonCard = ({ digimon, isTeam, onSwap }: DigimonCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: DIGIMON_TYPE,
    item: { id: digimon.id, isTeam } as DigimonDragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DIGIMON_TYPE,
    drop: (item: DigimonDragItem) => {
      if (item.id !== digimon.id) {
        if (item.isTeam === isTeam) {
          // Same team type - do nothing for now
          console.log("Same team type, no action needed");
        } else {
          // Different team types - swap
          console.log(`Swapping ${item.id} with ${digimon.id}`);
          onSwap(item.id, digimon.id);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Calculate EXP needed for next level
  const expForNextLevel = digimon.current_level * 20;

  // Content based on team status
  const content = isTeam ? (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="w-20 h-20 flex items-center justify-center"
    >
      <img 
        src={digimon.digimon?.sprite_url} 
        alt={digimon.name} 
        className="scale-[1.5]"
        style={{ imageRendering: "pixelated" }}
      />
    </motion.div>
  ) : (
    <div className="w-16 h-16 flex items-center justify-center">
      <img 
        src={digimon.digimon?.sprite_url} 
        alt={digimon.name} 
        className="scale-[1.25]"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`
        ${isTeam ? 'w-32 h-40' : 'w-28 h-36'}
        border rounded-md flex flex-col items-center justify-start p-2
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver ? 'bg-blue-100 border border-blue-300' : 'bg-white'}
        cursor-move transition-all
      `}
    >
      {content}
      <p className="text-xs truncate w-full text-center">{digimon.name || digimon.digimon?.name}</p>
      <p className="text-xs text-gray-500 mt-1">Lv.{digimon.current_level}</p>
      
      {/* EXP Bar */}
      <ProgressBar 
        value={digimon.experience_points % expForNextLevel} 
        maxValue={expForNextLevel} 
        color="bg-blue-500" 
        label="EXP"
      />
    </div>
  );
};

// Simplified EmptySlot component
const EmptySlot = ({ isTeam, onAddToTeam }: EmptySlotProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: DIGIMON_TYPE,
    drop: (item: DigimonDragItem) => {
      console.log(`Dropping ${item.id} to ${isTeam ? 'team' : 'reserve'} slot`);
      if (isTeam !== item.isTeam) {
        onAddToTeam(item.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`
        ${isTeam ? 'w-32 h-40' : 'w-28 h-36'}
        border-2 border-dashed
        ${isTeam ? 'border-gray-300' : 'border-gray-200'}
        rounded-md flex items-center justify-center
        ${isOver ? 'bg-blue-100 border-blue-300' : ''}
        transition-colors duration-200
      `}
    >
      <p className={`text-xs ${isTeam ? 'text-gray-400' : 'text-gray-300'} ${isOver ? 'text-blue-500 font-medium' : ''}`}>
        Drop Here
      </p>
    </div>
  );
};

const DigimonTeamManager = () => {
  const { allUserDigimon, swapTeamMember, setTeamMember } = useDigimonStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);
  const reserveDigimon = allUserDigimon.filter(d => !d.is_on_team);

  // Simplified handlers
  const handleSwap = async (id1: string, id2: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Determine which is team and which is reserve
      const digimon1 = allUserDigimon.find(d => d.id === id1);
      const digimon2 = allUserDigimon.find(d => d.id === id2);
      
      if (!digimon1 || !digimon2) {
        console.error("Couldn't find one of the Digimon");
        return;
      }
      
      // Always call with team first, reserve second
      if (digimon1.is_on_team && !digimon2.is_on_team) {
        await swapTeamMember(id1, id2);
      } else if (!digimon1.is_on_team && digimon2.is_on_team) {
        await swapTeamMember(id2, id1);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToTeam = async (id: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const digimon = allUserDigimon.find(d => d.id === id);
      if (!digimon) return;
      
      await setTeamMember(id, !digimon.is_on_team);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Team</h3>
        <div className="flex justify-center space-x-6 mb-6">
          {teamDigimon.map((digimon) => (
            <DigimonCard 
              key={digimon.id} 
              digimon={digimon} 
              isTeam={true}
              onSwap={handleSwap}
              onMove={handleAddToTeam}
            />
          ))}
          
          {Array.from({ length: Math.max(0, 3 - teamDigimon.length) }).map((_, i) => (
            <EmptySlot 
              key={`empty-team-${i}`} 
              isTeam={true}
              onAddToTeam={handleAddToTeam}
            />
          ))}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Reserve</h3>
        <div className="grid grid-cols-3 gap-4">
          {reserveDigimon.map((digimon) => (
            <DigimonCard 
              key={digimon.id} 
              digimon={digimon} 
              isTeam={false}
              onSwap={handleSwap}
              onMove={handleAddToTeam}
            />
          ))}
          
          {Array.from({ length: Math.max(0, 6 - reserveDigimon.length) }).map((_, i) => (
            <EmptySlot 
              key={`empty-reserve-${i}`} 
              isTeam={false}
              onAddToTeam={handleAddToTeam}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default DigimonTeamManager; 