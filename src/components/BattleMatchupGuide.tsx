import { useId } from 'react';
import { AttributeAdvantageMap, TypeAdvantageMap } from '../engine/battleRules';

const iconPath = (name: string, typeChart: boolean) =>
  `/assets/type-attribute/${typeChart ? `${name.toLowerCase()}_neutral` : `free_${name.toLowerCase()}`}.png`;

// Keep the source at its native 16px resolution and magnify whole pixels, like Digimon sprites.
const MatchupIcon = ({ name, typeChart }: { name: string; typeChart: boolean }) => (
  <span className="block h-8 w-8 shrink-0" aria-hidden="true">
    <img
      src={iconPath(name, typeChart)}
      alt=""
      draggable={false}
      width="16"
      height="16"
      className="block max-w-none"
      style={{ imageRendering: 'pixelated', transform: 'scale(2)', transformOrigin: 'top left' }}
    />
  </span>
);

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
    : ['M 80 31 Q 111 44 106 60', 'M 82 111 Q 60 123 38 111', 'M 14 60 Q 9 43 40 31'];

  return (
    <div
      role="img"
      aria-label={advantages.join('. ')}
      className="relative h-[120px] w-[120px] shrink-0 text-gray-500 dark:text-gray-400"
    >
      <svg
        aria-hidden="true"
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
              <circle cx={x} cy={y} r="18" className="fill-gray-200 dark:fill-dark-100" />
              <text
                x={x}
                y={y + 28}
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
      {names.map((name, index) => {
        const [x, y] = positions[index];
        return (
          <span key={name} className="absolute" style={{ left: x - 16, top: y - 16 }}>
            <MatchupIcon name={name} typeChart={typeChart} />
          </span>
        );
      })}
    </div>
  );
};

const Island = ({ name, typeChart = false }: { name: string; typeChart?: boolean }) => (
  <div className="flex h-[120px] w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-3 text-center dark:border-dark-100 dark:bg-dark-200">
    <MatchupIcon name={name} typeChart={typeChart} />
    <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{name}</p>
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No advantage</p>
  </div>
);

const BattleMatchupGuide = () => (
  <section aria-label="Battle matchup guide" className="ui-panel mt-4 p-3 sm:p-4">
    <div className="mx-auto grid w-fit max-w-full grid-cols-1 gap-4 lg:grid-cols-[auto_auto] lg:gap-6">
      <div>
        <h3 className="text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
          Type advantages{' '}
          <span className="font-normal text-xs text-gray-500 dark:text-gray-400">2× damage</span>
        </h3>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Cycle names={['Vaccine', 'Virus', 'Data']} typeChart />
          <Island name="Free" typeChart />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
          Attribute advantages{' '}
          <span className="font-normal text-xs text-gray-500 dark:text-gray-400">1.5× damage</span>
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
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
