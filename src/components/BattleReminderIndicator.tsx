export default function BattleReminderIndicator({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center" title={label}>
      <span className="h-2 w-2 rounded-full bg-accent-600 dark:bg-accent-400" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
