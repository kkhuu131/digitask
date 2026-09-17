import type { EvolutionPath } from '../constants/evolutionLookup';
import { getItemName } from '../constants/storeItems';

const EvolutionRequirements = ({
  statRequirements,
  itemRequirement,
}: {
  statRequirements: EvolutionPath['stat_requirements'];
  itemRequirement: EvolutionPath['item_requirement'];
}) => {
  const stats = Object.entries(statRequirements ?? {}).filter(([, value]) => value > 0);

  return (
    <>
      {stats.map(([stat, value]) => (
        <span
          key={stat}
          className="block text-xs text-gray-600 dark:text-gray-400 [overflow-wrap:anywhere]"
        >
          {stat.toUpperCase()} {value}
        </span>
      ))}
      {itemRequirement && (
        <span className="block text-xs text-gray-600 dark:text-gray-400 [overflow-wrap:anywhere]">
          Item: {getItemName(itemRequirement) ?? itemRequirement}
        </span>
      )}
    </>
  );
};

export default EvolutionRequirements;
