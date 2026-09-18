import type { ReactNode } from 'react';

const statColors: Record<string, string> = {
  HP: 'bg-red-500',
  SP: 'bg-cyan-500',
  ATK: 'bg-orange-500',
  DEF: 'bg-blue-500',
  INT: 'bg-purple-500',
  SPD: 'bg-green-500',
  ABI: 'bg-amber-500',
};

const DigimonStatRow = ({
  label,
  value,
  bonus = 0,
  maxReference,
  children,
}: {
  label: string;
  value: number;
  bonus?: number;
  maxReference: number;
  children?: ReactNode;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="font-heading font-semibold text-gray-700 dark:text-gray-200 w-10 shrink-0">
      {label}
    </span>
    <div className="flex-1 min-w-0 mx-3">
      <div
        className="h-2 bg-gray-200 dark:bg-dark-100 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${statColors[label] ?? 'bg-purple-500'}`}
          style={{
            width: `${Math.max(0, Math.min(100, ((value + bonus) / Math.max(1, maxReference)) * 100))}%`,
          }}
        />
      </div>
    </div>
    <div className="flex items-center gap-1.5 w-20 shrink-0 justify-end">
      <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{value}</span>
      {bonus > 0 && (
        <span className="text-green-500 dark:text-green-400 text-xs tabular-nums">+{bonus}</span>
      )}
      {children}
    </div>
  </div>
);
export default DigimonStatRow;
