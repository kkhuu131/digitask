import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleHelp, type LucideIcon } from 'lucide-react';

interface ResourceBalanceProps {
  icon: LucideIcon;
  label: string;
  value: string;
  to: string;
  description: string;
  loading?: boolean;
}

export default function ResourceBalance({
  icon: Icon,
  label,
  value,
  to,
  description,
  loading = false,
}: ResourceBalanceProps) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div
      ref={wrapper}
      className="relative flex min-w-0 items-center rounded-lg border border-gray-200 bg-gray-50 dark:border-dark-100 dark:bg-dark-200"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!wrapper.current?.contains(document.activeElement)) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          event.stopPropagation();
        }
      }}
    >
      <Link
        to={to}
        aria-label={`${value} ${label}. Open ${label === 'Tickets' ? 'arena' : 'shop'}`}
        aria-describedby={open ? descriptionId : undefined}
        onClick={() => setOpen(false)}
        className="flex min-h-[44px] min-w-0 items-center gap-1.5 rounded-l-lg px-2 text-xs font-body text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-gray-200 dark:hover:bg-dark-100"
      >
        <Icon
          className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400"
          aria-hidden="true"
        />
        <span className="truncate tabular-nums">
          {loading ? (
            <span role="status" aria-busy="true" className="inline-block align-middle mr-1">
              <span className="sr-only">Loading {label}…</span>
              <span
                aria-hidden="true"
                className="block h-3 w-8 rounded bg-gray-200 dark:bg-dark-100 ui-skeleton-pulse"
              />
            </span>
          ) : (
            value
          )}{' '}
          <span className="font-medium">{label}</span>
        </span>
      </Link>
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-controls={open ? descriptionId : undefined}
        aria-describedby={open ? descriptionId : undefined}
        onClick={() => setOpen(true)}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-gray-400 dark:hover:bg-dark-100 dark:hover:text-accent-400"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={descriptionId}
          role="tooltip"
          className={`absolute ${label === 'Tickets' ? 'left-0' : 'right-0'} top-full z-dropdown mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 text-sm font-body text-gray-600 shadow-lg dark:border-dark-100 dark:bg-dark-200 dark:text-gray-300`}
        >
          {description}
        </div>
      )}
    </div>
  );
}
