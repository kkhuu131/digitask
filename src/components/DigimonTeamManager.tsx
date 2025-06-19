import { useState, useEffect } from 'react';
import { useDigimonStore } from '../store/petStore';
import { UserDigimon } from '../store/petStore';
import { DigimonType, DigimonAttribute } from '@/store/battleStore';
import TypeAttributeIcon from './TypeAttributeIcon';
import DigimonSprite from './DigimonSprite';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define types for our items
interface DigimonItem {
  id: string;
  isTeam: boolean;
  digimon: UserDigimon | null;
}

// Sortable Digimon Card component
const SortableDigimonCard = ({ 
  id, 
  digimon, 
  isTeam 
}: { 
  id: string; 
  digimon: UserDigimon | null; 
  isTeam: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 0,
    touchAction: 'none'
  };

  // If this is an empty slot
  if (!digimon) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
          border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer
          ${isTeam 
            ? 'border-blue-400 dark:border-blue-500 bg-blue-100/60 dark:bg-blue-900/40 min-h-[100px] sm:min-h-[140px] hover:bg-blue-200/60 dark:hover:bg-blue-800/60' 
            : 'border-gray-400 dark:border-gray-500 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
          }
          transition-all duration-200 hover:scale-105 hover:border-solid
          w-full aspect-square
        `}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-center h-full">
          {/* Centered, subtle + symbol */}
          <svg className={`w-6 h-6 ${
            isTeam 
              ? 'text-blue-300 dark:text-blue-600' 
              : 'text-gray-300 dark:text-gray-600'
          }`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  // Calculate EXP needed for next level
  const expForNextLevel = digimon.current_level * 20;
  const expPercentage = Math.min(100, (digimon.experience_points / expForNextLevel) * 100);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative w-full aspect-square rounded-xl overflow-hidden cursor-move select-none
        ${isTeam 
          ? 'min-h-[100px] sm:min-h-[140px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-2 border-blue-200 dark:border-blue-700'
          : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700'
        }
        hover:shadow-lg transition-all duration-200 hover:scale-105
        group
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat opacity-20" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '20px 20px'
             }}
        />
      </div>

      {/* Type/Attribute icon - top left */}
      {digimon.digimon?.type && digimon.digimon?.attribute && (
        <div className="absolute top-1 left-1 z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md p-0.5 shadow-sm">
            <TypeAttributeIcon
              type={digimon.digimon.type as DigimonType}
              attribute={digimon.digimon.attribute as DigimonAttribute}
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      )}
      
      {/* Level badge - top right */}
      <div className="absolute top-1 right-1 z-20">
        <div className={`bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold rounded-md shadow-sm text-center ${
          isTeam 
            ? 'text-[9px] sm:text-[10px] px-1 py-0.5' 
            : 'text-[10px] px-1.5 py-0.5'
        }`}>
          {isTeam ? digimon.current_level : `Lv.${digimon.current_level}`}
        </div>
      </div>
      
      {/* Main sprite area - responsive sizing */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center px-2 ${
        isTeam 
          ? 'pt-12 sm:pt-8 pb-8 sm:pb-10' 
          : 'pt-6 pb-8'
      }`}>
        <div className={`relative w-full aspect-square flex items-center justify-center ${
          isTeam 
            ? 'max-w-[50px] sm:max-w-[90px]' 
            : 'max-w-[90px] sm:max-w-[110px]'
        }`}>
          <DigimonSprite
            digimonName={digimon.digimon?.name || ""}
            fallbackSpriteUrl={digimon.digimon?.sprite_url || "/assets/digimon/agumon_professor.png"}
            happiness={digimon.happiness}
            size="sm"
            showHappinessAnimations={true}
            enableHopping={false}
          />
        </div>
      </div>

      {/* Compact footer with name and minimal progress */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 ${
        isTeam ? 'p-1 sm:p-1.5' : 'p-1.5'
      }`}>
        <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm rounded-md px-2 py-1">
          {/* Name */}
          <p className={`font-medium text-center text-gray-800 dark:text-gray-200 truncate ${
            isTeam 
              ? 'text-[9px] sm:text-[11px] mb-0.5' 
              : 'text-[11px] mb-0.5'
          }`}>
            {digimon.name || digimon.digimon?.name || 'Digimon'}
          </p>
          
          {/* Minimal progress bar */}
          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${
            isTeam ? 'h-0.5 sm:h-1' : 'h-0.5'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" 
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Container for team or reserve
const DigimonContainer = ({ 
  items, 
  isTeam 
}: { 
  items: DigimonItem[]; 
  isTeam: boolean;
}) => {
  return (
    <div className={`
      rounded-2xl p-4 sm:p-6 border-2
      ${isTeam 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-gray-200 dark:border-gray-700'
      }
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isTeam 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-500 text-white'
            }
          `}>
            {isTeam ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path  fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
              {isTeam ? 'Team' : 'Reserve'}
            </h3>
          </div>
        </div>
        
        {/* Team member count */}
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${isTeam 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
          }
        `}>
          {items.filter(item => item.digimon).length}/{isTeam ? 3 : 12}
        </div>
      </div>

      {/* Grid */}
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className={`
          grid gap-3 sm:gap-6
          ${isTeam ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}
        `}>
          {items.map(item => (
            <div key={item.id} className="w-full max-w-[200px] mx-auto">
              <SortableDigimonCard
                id={item.id}
                digimon={item.digimon}
                isTeam={isTeam}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const DigimonTeamManager = () => {
  const { allUserDigimon, setTeamMember, swapTeamMember } = useDigimonStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [teamItems, setTeamItems] = useState<DigimonItem[]>([]);
  const [reserveItems, setReserveItems] = useState<DigimonItem[]>([]);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when allUserDigimon changes
  useEffect(() => {
    const teamDigimon = allUserDigimon.filter(d => d.is_on_team);
    const reserveDigimon = allUserDigimon.filter(d => !d.is_on_team);
    
    // Create team items
    const team = teamDigimon.map(digimon => ({
      id: `team-${digimon.id}`,
      isTeam: true,
      digimon
    }));
    
    // Add empty slots to team if needed
    while (team.length < 3) {
      team.push({
        id: `team-empty-${team.length}`,
        isTeam: true,
        digimon: null as any
      });
    }
    
    // Create reserve items
    const reserve = reserveDigimon.map(digimon => ({
      id: `reserve-${digimon.id}`,
      isTeam: false,
      digimon
    }));
    
    // Add empty slots to reserve if needed (fewer empty slots)
    while (reserve.length < 12) {
      reserve.push({
        id: `reserve-empty-${reserve.length}`,
        isTeam: false,
        digimon: null as any
      });
    }
    
    setTeamItems(team);
    setReserveItems(reserve);
  }, [allUserDigimon]);

  // Find the active item
  const getActiveItem = () => {
    if (!activeId) return null;
    
    const activeTeamItem = teamItems.find(item => item.id === activeId);
    if (activeTeamItem) return activeTeamItem;
    
    const activeReserveItem = reserveItems.find(item => item.id === activeId);
    if (activeReserveItem) return activeReserveItem;
    
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    // Extract container and item info
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const isActiveTeam = activeId.startsWith('team-');
    const isOverTeam = overId.startsWith('team-');
    
    // If dropping on the same item, do nothing
    if (activeId === overId) {
      setActiveId(null);
      return;
    }
    
    // Handle reordering within the same container
    if (isActiveTeam === isOverTeam) {
      const items = isActiveTeam ? teamItems : reserveItems;
      const activeIndex = items.findIndex(item => item.id === activeId);
      const overIndex = items.findIndex(item => item.id === overId);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newItems = arrayMove(items, activeIndex, overIndex);
        
        if (isActiveTeam) {
          setTeamItems(newItems);
        } else {
          setReserveItems(newItems);
        }
      }
    } 
    // Handle moving between containers
    else {
      // Get the active and over items
      const activeItem = isActiveTeam 
        ? teamItems.find(item => item.id === activeId)
        : reserveItems.find(item => item.id === activeId);
      
      const overItem = isOverTeam
        ? teamItems.find(item => item.id === overId)
        : reserveItems.find(item => item.id === overId);
      
      // Only proceed if we're dragging a Digimon (not an empty slot)
      if (activeItem?.digimon) {
        console.log('Drag operation:', {
          activeId,
          overId,
          isActiveTeam,
          isOverTeam,
          activeDigimon: activeItem.digimon.name,
          overDigimon: overItem?.digimon?.name || 'empty slot',
          activeOnTeam: activeItem.digimon.is_on_team
        });

        // If dropping onto another Digimon, swap them
        if (overItem?.digimon) {
          console.log('Swapping Digimon');
          // Determine which is team and which is reserve
          const teamDigimon = isActiveTeam ? activeItem.digimon : overItem.digimon;
          const reserveDigimon = isActiveTeam ? overItem.digimon : activeItem.digimon;
          
          // Use swapTeamMember if one is on team and one is in reserve
          if (teamDigimon.is_on_team && !reserveDigimon.is_on_team) {
            await swapTeamMember(teamDigimon.id, reserveDigimon.id);
          } else if (!teamDigimon.is_on_team && reserveDigimon.is_on_team) {
            await swapTeamMember(reserveDigimon.id, teamDigimon.id);
          } else {
            // If both are on team or both are in reserve, toggle individually
            await setTeamMember(activeItem.digimon.id, !activeItem.digimon.is_on_team);
          }
        } 
        // If dropping onto an empty slot, handle based on direction
        else {
          console.log('Dropping onto empty slot');
          // If dragging from team to reserve, remove from team
          if (isActiveTeam && !isOverTeam) {
            console.log('Removing from team');
            await setTeamMember(activeItem.digimon.id, false);
          }
          // If dragging from reserve to team, add to team
          else if (!isActiveTeam && isOverTeam) {
            console.log('Adding to team');
            await setTeamMember(activeItem.digimon.id, true);
          }
          // Otherwise, just toggle
          else {
            console.log('Toggling team membership');
            await setTeamMember(activeItem.digimon.id, !activeItem.digimon.is_on_team);
          }
        }
      }
    }
    
    setActiveId(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">

      {/* DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          <DigimonContainer items={teamItems} isTeam={true} />
          <DigimonContainer items={reserveItems} isTeam={false} />
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 w-32 h-32 transform rotate-6 scale-105">
              <SortableDigimonCard
                id={activeId.toString()}
                digimon={getActiveItem()?.digimon || null}
                isTeam={(getActiveItem()?.isTeam || false)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DigimonTeamManager; 