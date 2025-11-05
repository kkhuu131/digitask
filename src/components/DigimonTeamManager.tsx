import { useState, useEffect } from 'react';
import { useDigimonStore } from '../store/petStore';
import { UserDigimon } from '../store/petStore';
import { DigimonType, DigimonAttribute } from '@/store/battleStore';
import { calculateFinalStats } from '../utils/digimonStatCalculation';
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
          w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer
          ${isTeam 
            ? 'border-purple-300 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-900/20 hover:bg-purple-100/50' 
            : 'border-gray-300 dark:border-dark-500 bg-gray-50 dark:bg-dark-300 hover:bg-gray-100/70'
          }
          transition-colors
        `}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-center h-full">
          {/* Centered, subtle + symbol */}
          <svg className={`w-6 h-6 ${
            isTeam 
              ? 'text-purple-400 dark:text-purple-500' 
              : 'text-gray-300 dark:text-gray-500'
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
        relative w-full aspect-square rounded-lg overflow-hidden cursor-move select-none
        ${isTeam 
          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700' 
          : 'bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-dark-400'
        }
        hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors
        group
      `}
    >
      {/* Type/Attribute icon - top right */}
      {digimon.digimon?.type && digimon.digimon?.attribute && (
        <div className="absolute top-1 right-1 z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded p-0.5 shadow-sm">
            <TypeAttributeIcon
              type={digimon.digimon.type as DigimonType}
              attribute={digimon.digimon.attribute as DigimonAttribute}
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      )}
      
      {/* Main sprite area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full aspect-square flex items-center justify-center">
          {/* Small screens */}
          <div className="block md:hidden">
            <DigimonSprite
              digimonName={digimon.digimon?.name || ""}
              fallbackSpriteUrl={digimon.digimon?.sprite_url || "/assets/digimon/agumon_professor.png"}
              happiness={digimon.happiness}
              size="sm"
              showHappinessAnimations={true}
              enableHopping={false}
            />
          </div>
          {/* Medium and up */}
          <div className="hidden md:block">
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
      </div>

      {/* Bottom level + exp bar, party-grid style */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 z-20">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
          {digimon.current_level}
        </span>
        <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-purple-500 h-full transition-all duration-300" 
            style={{ width: `${expPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

function StatRow({ label, value, bonus, factor = 1 }: { label: string; value: number; bonus: number; factor?: number }) {
  const bonusDisplay = bonus ? `+${bonus * factor}` : '';
  return (
    <div className="flex items-center justify-between bg-white/60 dark:bg-dark-200 rounded px-2 py-1">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {value}
        {bonus ? <span className="text-green-500 ml-1">({bonusDisplay})</span> : null}
      </span>
    </div>
  );
}

// Container for team or reserve
const DigimonContainer = ({ 
  items, 
  isTeam,
  gridClass,
  onHover,
}: { 
  items: DigimonItem[]; 
  isTeam: boolean;
  gridClass: string;
  onHover?: (d: UserDigimon | null) => void;
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
        <div className="flex items-center gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
            {isTeam ? 'Team' : 'Reserve'}
          </h3>
        </div>
      </div>

      {/* Grid */}
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
          {items.map(item => (
            <div
              key={item.id}
              className=" w-[80px] sm:w-[120px] mx-auto"
              onMouseEnter={() => onHover?.(item.digimon)}
            >
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
  const [hoveredDigimon, setHoveredDigimon] = useState<UserDigimon | null>(null);

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
    
    // Create reserve items (limit grid to 6 visible; still draggable among those)
    const reserve = reserveDigimon.slice(0, 6).map(digimon => ({
      id: `reserve-${digimon.id}`,
      isTeam: false,
      digimon
    }));
    
    // Add empty slots to reserve up to 6 (3x2)
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
    <div className="max-w-7xl mx-auto p-4">

      {/* DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[200px_400px_1fr] gap-4 md:gap-6 items-start">
          {/* Left: Team (fixed at 200px on lg) */}
          <div className="col-span-1">
            <DigimonContainer
              items={teamItems}
              isTeam={true}
              gridClass="grid-cols-1 place-items-center"
              onHover={setHoveredDigimon}
            />
          </div>
          {/* Middle: Reserve (fixed at 400px on lg) */}
          <div className="col-span-1">
            <DigimonContainer
              items={reserveItems}
              isTeam={false}
              gridClass="grid-cols-2"
              onHover={setHoveredDigimon}
            />
          </div>
          {/* Right: Hover details panel fills remaining space on lg */}
          <div className="hidden lg:block col-span-1 min-w-0">
            <div className="h-full flex flex-col rounded-2xl p-5 border-2 bg-white dark:bg-dark-300 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Details</h3>
              {hoveredDigimon ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-48 h-48 flex items-center justify-center">
                      <DigimonSprite
                        digimonName={hoveredDigimon.digimon?.name || ''}
                        fallbackSpriteUrl={hoveredDigimon.digimon?.sprite_url || '/assets/digimon/agumon_professor.png'}
                        happiness={hoveredDigimon.happiness}
                        size="lg"
                        showHappinessAnimations={true}
                        enableHopping={false}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {hoveredDigimon.name || hoveredDigimon.digimon?.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {hoveredDigimon.digimon?.name}
                      </div>
                      {hoveredDigimon.digimon?.type && hoveredDigimon.digimon?.attribute && (
                        <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-200 text-sm text-gray-800 dark:text-gray-100">
                          <TypeAttributeIcon
                            type={hoveredDigimon.digimon.type as DigimonType}
                            attribute={hoveredDigimon.digimon.attribute as DigimonAttribute}
                            size="md"
                            showLabel={true}
                          />
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                        <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">Lv {hoveredDigimon.current_level}</span>
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">ABI {hoveredDigimon.abi ?? 0}</span>
                        <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded">❤ {hoveredDigimon.happiness}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm flex-1 overflow-auto">
                    <StatRow label="HP" value={calculateFinalStats(hoveredDigimon).hp} bonus={hoveredDigimon.hp_bonus || 0} factor={10} />
                    <StatRow label="SP" value={calculateFinalStats(hoveredDigimon).sp} bonus={hoveredDigimon.sp_bonus || 0} />
                    <StatRow label="ATK" value={calculateFinalStats(hoveredDigimon).atk} bonus={hoveredDigimon.atk_bonus || 0} />
                    <StatRow label="DEF" value={calculateFinalStats(hoveredDigimon).def} bonus={hoveredDigimon.def_bonus || 0} />
                    <StatRow label="INT" value={calculateFinalStats(hoveredDigimon).int} bonus={hoveredDigimon.int_bonus || 0} />
                    <StatRow label="SPD" value={calculateFinalStats(hoveredDigimon).spd} bonus={hoveredDigimon.spd_bonus || 0} />
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Hover a Digimon to preview stats</div>
              )}
            </div>
          </div>
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