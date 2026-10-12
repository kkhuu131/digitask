import { useId } from 'react';
import { AttributeAdvantageMap, TypeAdvantageMap } from '../engine/battleRules';

const iconPath = (name: string, typeChart: boolean) =>
  `/assets/type-attribute/${typeChart ? `${name.toLowerCase()}_neutral` : `free_${name.toLowerCase()}`}.png`;

const Cycle = ({ names, typeChart = false }: { names: string[]; typeChart?: boolean }) => {
  const markerId = `matchup-${useId().replace(/:/g, '')}`;
  const rules: Record<string, Record<string, number>> = typeChart
    ? TypeAdvantageMap
    : AttributeAdvantageMap;
  const advantages = names.flatMap((attacker) =>
    names
      .filter((defender) => rules[attacker][defender] > 1)
      .map((defender) => `${attacker} beats ${defender}`)
  );
  const pair = names.length === 2;
  const positions = pair
    ? [
        [26, 63],
        [94, 63],
      ]
    : [
        [60, 20],
        [94, 78],
        [26, 78],
      ];
  const paths = pair
    ? ['M 42 43 Q 60 22 78 43', 'M 78 100 Q 60 119 42 100']
    : ['M 80 31 Q 111 44 106 60', 'M 82 106 Q 60 122 38 106', 'M 14 60 Q 9 43 40 31'];

  return (
    <svg
      role="img"
      aria-label={advantages.join('. ')}
      viewBox="0 0 120 120"
      className="shrink-0 text-gray-500 dark:text-gray-400"
      width="120"
      height="120"
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 1 1 L 6 4 L 1 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      {paths.map((path, index) => {
        const attacker = names[index];
        const defender = names[(index + 1) % names.length];
        const forward = rules[attacker][defender] > 1;
        const reverse = !forward && rules[defender][attacker] > 1;
        if (!forward && !reverse) return null;
        return (
          <path
            key={index}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            markerEnd={forward ? `url(#${markerId})` : undefined}
            markerStart={reverse ? `url(#${markerId})` : undefined}
          />
        );
      })}
      {names.map((name, index) => {
        const [x, y] = positions[index];
        return (
          <g key={name}>
            <circle cx={x} cy={y} r="16" className="fill-gray-200 dark:fill-dark-100" />
            <image
              href={iconPath(name, typeChart)}
              x={x - 12}
              y={y - 12}
              width="24"
              height="24"
              style={{ imageRendering: 'pixelated' }}
            />
            <text
              x={x}
              y={y + 24}
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
              fontWeight="600"
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Island = ({ name, typeChart = false }: { name: string; typeChart?: boolean }) => (
  <div className="flex h-[120px] w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-3 text-center dark:border-dark-100 dark:bg-dark-200">
    <img
      src={iconPath(name, typeChart)}
      alt=""
      width="24"
      height="24"
      style={{ imageRendering: 'pixelated' }}
    />
    <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{name}</p>
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No advantage</p>
  </div>
);

const BattleMatchupGuide = () => (
  <section aria-label="Battle matchup guide" className="ui-panel mt-4 p-3 sm:p-4">
    <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
      Arrows point to the type or attribute you have an advantage against.
    </p>
    <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:gap-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Type advantages{' '}
          <span className="font-normal text-xs text-gray-500 dark:text-gray-400">2× damage</span>
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <Cycle names={['Vaccine', 'Virus', 'Data']} typeChart />
          <Island name="Free" typeChart />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Attribute advantages{' '}
          <span className="font-normal text-xs text-gray-500 dark:text-gray-400">1.5× damage</span>
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Cycle names={['Fire', 'Plant', 'Water']} />
          <Cycle names={['Wind', 'Earth', 'Electric']} />
          <Cycle names={['Light', 'Dark']} />
          <Island name="Neutral" />
        </div>
      </div>
    </div>
  </section>
);

export default BattleMatchupGuide;
