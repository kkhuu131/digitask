import { useState, useEffect } from 'react';
import { useDigimonStore } from '../store/petStore';
import { UserDigimon } from '../store/petStore';
import { DigimonType, DigimonAttribute } from '@/store/battleStore';
import TypeAttributeIcon from './TypeAttributeIcon';
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
          border-2 border-dashed rounded-md flex items-center justify-center
          ${isTeam ? 'border-gray-300' : 'border-gray-200'}
          transition-colors duration-200
          w-full aspect-square
        `}
        {...attributes}
        {...listeners}
      >
        <p className={`text-xs text-center ${isTeam ? 'text-gray-400' : 'text-gray-300'}`}>
          Drop Here
        </p>
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
      className="border rounded-md relative w-full aspect-square select-none overflow-hidden bg-white cursor-move card-container"
    >
      {/* Type/Attribute icon - with responsive size */}
      {digimon.digimon?.type && digimon.digimon?.attribute && (
        <div className="absolute top-0.5 left-0.5 z-10 select-none small-icon">
          <TypeAttributeIcon
            type={digimon.digimon.type as DigimonType}
            attribute={digimon.digimon.attribute as DigimonAttribute}
            size="sm"
            showLabel={false}
          />
        </div>
      )}
      
      {/* Level badge - with responsive size */}
      <div className="absolute bottom-0.5 right-0.5 bg-black bg-opacity-60 text-white text-[8px] px-1 py-0.5 rounded select-none z-10 small-level">
        Lv.{digimon.current_level}
      </div>
      
      {/* Transparent overlay to ensure the entire card is draggable */}
      <div className="absolute inset-0 z-0"></div>
      
      {/* Sprite container with flex centering and max size */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 z-0">
        <div className="relative w-full h-full max-w-[80px] max-h-[80px] mx-auto">
          <img
            src={digimon.digimon?.sprite_url || '/assets/digimon/dot050.png'}
            alt={digimon.name || digimon.digimon?.name || 'Digimon'}
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{ imageRendering: 'pixelated' }}
            draggable="false"
          />
        </div>
        
        {/* Additional info for larger cards - using container query class */}
        <div className="large-card-content hidden w-full mt-2">
          {/* Name */}
          <p className="text-xs text-center font-medium truncate w-full">
            {digimon.name || digimon.digimon?.name || 'Digimon'}
          </p>
          
          {/* Simple EXP bar */}
          <div className="w-full mt-1 px-1">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${expPercentage}%` }}
              />
            </div>
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
    <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
      <h3 className="text-base xs:text-lg font-semibold mb-1 xs:mb-2">{isTeam ? 'Team' : 'Reserve'}</h3>
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className={`grid ${isTeam ? 'grid-cols-3' : 'grid-cols-3'} gap-1 xs:gap-2 sm:gap-3 max-w-3xl mx-auto`}>
          {items.map(item => (
            <div key={item.id} className="max-w-[160px] w-full mx-auto">
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
    
    // Add empty slots to reserve if needed
    while (reserve.length < 6) {
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
        // If dropping onto another Digimon, swap them
        if (overItem?.digimon) {
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
        // If dropping onto an empty slot, just toggle team membership
        else {
          await setTeamMember(activeItem.digimon.id, !activeItem.digimon.is_on_team);
        }
      }
    }
    
    setActiveId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Team Management</h2>
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop to arrange your team. Your active Digimon must be on the team to participate in battles.
      </p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          <DigimonContainer items={teamItems} isTeam={true} />
          <DigimonContainer items={reserveItems} isTeam={false} />
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80">
              <SortableDigimonCard
                id={activeId.toString()}
                digimon={getActiveItem()?.digimon || null}
                isTeam={getActiveItem()?.isTeam || false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DigimonTeamManager; 