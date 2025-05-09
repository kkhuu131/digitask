import { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { useDigimonStore } from '../store/petStore';
import { UserDigimon } from '../store/petStore';
import { DigimonType } from '@/store/battleStore';
import TypeAttributeIcon from './TypeAttributeIcon';
import { DigimonAttribute } from '@/store/battleStore';

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

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`
        ${isTeam ? 'w-40 h-40' : 'w-40 h-40'}
        border rounded-md flex flex-col items-center justify-start p-3
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver ? 'bg-blue-100 border border-blue-300' : 'bg-white'}
        cursor-move transition-all relative
      `}
    >
      {digimon.digimon?.type && digimon.digimon?.attribute && (
        <div className="absolute top-2 left-2">
          <TypeAttributeIcon
            type={digimon.digimon.type as DigimonType}
            attribute={digimon.digimon.attribute as DigimonAttribute}
            size="md"
            showLabel={false}
          />
        </div>
      )}
      
      {isTeam ? (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 flex items-center justify-center"
        >
          <img 
            src={digimon.digimon?.sprite_url} 
            alt={digimon.name} 
            className="scale-[1.5]"
            style={{ imageRendering: "pixelated" }}
            draggable="false"
          />
        </motion.div>
      ) : (
        <div className="w-20 h-20 flex items-center justify-center">
          <img 
            src={digimon.digimon?.sprite_url} 
            alt={digimon.name} 
            className="scale-[1.5]"
            style={{ imageRendering: "pixelated" }}
            draggable="false"
          />
        </div>
      )}
      
      <div className="w-full">
        <p className="text-sm truncate w-full text-center mt-1">{digimon.name || digimon.digimon?.name}</p>
        
        <div className="flex items-center justify-center gap-2 w-full">
          <p className="text-xs text-gray-500 whitespace-nowrap">Lv.{digimon.current_level}</p>
          <div className="w-20">
            <ProgressBar 
              value={digimon.experience_points % expForNextLevel} 
              maxValue={expForNextLevel} 
              color="bg-blue-500" 
              label=""
            />
          </div>
        </div>
      </div>
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
        ${isTeam ? 'w-40 h-40' : 'w-40 h-40'}
        border-2 border-dashed
        ${isTeam ? 'border-gray-300' : 'border-gray-200'}
        rounded-md flex items-center justify-center
        ${isOver ? 'bg-blue-100 border-blue-300' : ''}
        transition-colors duration-200
      `}
    >
      <p className={`text-sm ${isTeam ? 'text-gray-400' : 'text-gray-300'} ${isOver ? 'text-blue-500 font-medium' : ''}`}>
        Drop Here
      </p>
    </div>
  );
};

const MobileDigimonCard = ({ digimon, isTeam, onSwap }: DigimonCardProps) => {
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
        if (item.isTeam !== isTeam) {
          // Different team types - swap
          console.log(`Mobile Swapping ${item.id} with ${digimon.id}`);
          onSwap(item.id, digimon.id);
        }
        // If item.isTeam === isTeam, it means dragging within the same list (team or reserve)
        // We might want reordering logic here in the future, but for now, do nothing.
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`
        w-24 h-24 border flex flex-col items-center justify-start pt-2
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver ? 'bg-blue-100 border border-blue-300' : 'bg-white'}
        cursor-move transition-all rounded-md relative
      `}
    >
      {/* Type/Attribute Icon in top left corner */}
      {digimon.digimon?.type && digimon.digimon?.attribute && (
        <div className="absolute top-1 left-1">
          <TypeAttributeIcon
            type={digimon.digimon.type as DigimonType}
            attribute={digimon.digimon.attribute as DigimonAttribute}
            size="sm"
            showLabel={false}
          />
        </div>
      )}
      
      {/* Digimon sprite */}
      <div className="w-12 h-12 flex items-center justify-center">
        <img
          src={digimon.digimon?.sprite_url}
          alt={digimon.name || digimon.digimon?.name}
          className="scale-[1]"
          style={{ imageRendering: "pixelated" }}
          draggable="false"
        />
      </div>
      
      {/* Level indicator */}
      <p className="text-[10px]">{digimon.name || digimon.digimon?.name}</p>
      <p className="text-[10px] text-gray-500">Lv.{digimon.current_level}</p>
    </div>
  );
};

// NEW: Mobile Empty Slot Component
const MobileEmptySlot = ({ isTeam, onAddToTeam }: EmptySlotProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: DIGIMON_TYPE,
    drop: (item: DigimonDragItem) => {
      console.log(`Mobile Dropping ${item.id} to ${isTeam ? 'team' : 'reserve'} slot`);
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
        w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center
        ${isTeam ? 'border-gray-300' : 'border-gray-200'}
        ${isOver ? 'bg-blue-100 border-blue-300' : ''}
        transition-colors duration-200
      `}
    >
      <p className={`text-[10px] ${isTeam ? 'text-gray-400' : 'text-gray-300'} ${isOver ? 'text-blue-500 font-medium' : ''}`}>
        Drop Here
      </p>
    </div>
  );
};

// For the smallest screens (<320px)
const TinyDigimonCard = ({ digimon, isTeam, onSwap }: DigimonCardProps) => {
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
      if (item.id !== digimon.id && item.isTeam !== isTeam) {
        onSwap(item.id, digimon.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`
        w-20 h-20 border flex flex-col items-center justify-start pt-4
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver ? 'bg-blue-100 border border-blue-300' : 'bg-white'}
        cursor-move transition-all rounded-md relative
      `}
    >
      {/* Type/Attribute Icon in top left corner */}
      {digimon.digimon?.type && digimon.digimon?.attribute && (
        <div className="absolute top-1 left-1">
          <TypeAttributeIcon
            type={digimon.digimon.type as DigimonType}
            attribute={digimon.digimon.attribute as DigimonAttribute}
            size="sm"
            showLabel={false}
          />
        </div>
      )}
      
      {/* Digimon sprite */}
      <div className="w-8 h-8 flex items-center justify-center">
        <img
          src={digimon.digimon?.sprite_url}
          alt={digimon.name || digimon.digimon?.name}
          className="scale-[1]"
          style={{ imageRendering: "pixelated" }}
          draggable="false"
        />
      </div>

      {/* Level indicator */}
      <p className="text-[12px] font-bold mt-1">Lv.{digimon.current_level}</p>
    </div>
  );
};

// Update the main component to use the new TinyDigimonCard
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

      // Ensure we only swap between team and reserve
      if (digimon1.is_on_team === digimon2.is_on_team) {
        console.log("Cannot swap within the same group (team/reserve).");
        return; // Prevent swapping within the same list
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

      // Check if team is full before adding
      if (!digimon.is_on_team && teamDigimon.length >= 3) {
         console.log("Team is full. Cannot add more Digimon.");
         // Optionally show a user-facing message here
         return;
      }

      await setTeamMember(id, !digimon.is_on_team);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Team</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-2 lg_xl:gap-4 mb-8 justify-items-center">
          {teamDigimon.map((digimon) => (
            <div key={digimon.id}>
              <div className="hidden lg_xl:block">
                <DigimonCard
                  digimon={digimon}
                  isTeam={true}
                  onSwap={handleSwap}
                  onMove={handleAddToTeam}
                />
              </div>
              <div className="hidden sm:block lg_xl:hidden">
                <MobileDigimonCard
                  digimon={digimon}
                  isTeam={true}
                  onSwap={handleSwap}
                  onMove={handleAddToTeam}
                />
              </div>
              <div className="block sm:hidden">
                <TinyDigimonCard
                  digimon={digimon}
                  isTeam={true}
                  onSwap={handleSwap}
                  onMove={handleAddToTeam}
                />
              </div>
            </div>
          ))}

          {Array.from({ length: Math.max(0, 3 - teamDigimon.length) }).map((_, i) => (
            <div key={`empty-team-${i}`}>
              <div className="hidden lg_xl:block">
                <EmptySlot
                  isTeam={true}
                  onAddToTeam={handleAddToTeam}
                />
              </div>
              <div className="hidden sm:block lg_xl:hidden">
                <MobileEmptySlot
                  isTeam={true}
                  onAddToTeam={handleAddToTeam}
                />
              </div>
              <div className="block sm:hidden">
                <TinyEmptySlot
                  isTeam={true}
                  onAddToTeam={handleAddToTeam}
                />
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">Reserve</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-2 lg_xl:gap-4 gap-y-3 sm:gap-y-4 lg_xl:gap-y-6 justify-items-center">
          {reserveDigimon.map((digimon) => (
            <div key={digimon.id}>
              <div className="hidden lg_xl:block">
                <DigimonCard
                  digimon={digimon}
                  isTeam={false}
                  onSwap={handleSwap}
                  onMove={handleAddToTeam}
                />
              </div>
               <div className="hidden sm:block lg_xl:hidden">
                 <MobileDigimonCard
                  digimon={digimon}
                  isTeam={false}
                  onSwap={handleSwap}
                  onMove={handleAddToTeam}
                />
              </div>
              <div className="block sm:hidden">
                <TinyDigimonCard
                  digimon={digimon}
                  isTeam={false}
                  onSwap={handleSwap}
                  onMove={handleAddToTeam}
                />
              </div>
            </div>
          ))}

          {Array.from({ length: Math.max(0, 6 - reserveDigimon.length) }).map((_, i) => (
            <div key={`empty-reserve-${i}`}>
              <div className="hidden lg_xl:block">
                <EmptySlot
                  isTeam={false}
                  onAddToTeam={handleAddToTeam}
                />
              </div>
              <div className="hidden sm:block lg_xl:hidden">
                 <MobileEmptySlot
                  isTeam={false}
                  onAddToTeam={handleAddToTeam}
                />
              </div>
              <div className="block sm:hidden">
                <TinyEmptySlot
                  isTeam={false}
                  onAddToTeam={handleAddToTeam}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

// Add TinyEmptySlot component
const TinyEmptySlot = ({ isTeam, onAddToTeam }: EmptySlotProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: DIGIMON_TYPE,
    drop: (item: DigimonDragItem) => {
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
        w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center
        ${isTeam ? 'border-gray-300' : 'border-gray-200'}
        ${isOver ? 'bg-blue-100 border-blue-300' : ''}
        transition-colors duration-200
      `}
    >
      <p className={`text-[8px] ${isTeam ? 'text-gray-400' : 'text-gray-300'} ${isOver ? 'text-blue-500 font-medium' : ''}`}>
        Drop Here
      </p>
    </div>
  );
};

export default DigimonTeamManager; 