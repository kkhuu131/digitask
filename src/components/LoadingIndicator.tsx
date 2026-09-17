interface LoadingIndicatorProps {
  message?: string;
  variant?: 'inline' | 'section' | 'screen';
  className?: string;
}

export const LoadingSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`ui-spinner inline-block shrink-0 rounded-full border-2 border-accent-200 border-t-accent-700 dark:border-accent-900 dark:border-t-accent-400 ${className}`}
  />
);

/** Reserve space immediately; delay the visual indicator to avoid brief flashes. */
const LoadingIndicator = ({
  message = 'Loading…',
  variant = 'section',
  className = '',
}: LoadingIndicatorProps) => (
  <div
    role="status"
    className={`${
      variant === 'screen'
        ? 'min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-dark-400'
        : variant === 'section'
          ? 'min-h-64 flex items-center justify-center'
          : 'inline-flex items-center'
    } ${className}`}
  >
    <span className="sr-only">{message}</span>
    <div
      aria-hidden="true"
      className={`ui-loading-reveal flex items-center ${variant === 'inline' ? 'gap-2' : 'flex-col gap-3'}`}
    >
      {variant === 'screen' && (
        <img
          src="/assets/digimon/agumon_professor.png"
          alt=""
          width={56}
          height={56}
          style={{ imageRendering: 'pixelated' }}
        />
      )}
      <LoadingSpinner className={variant === 'inline' ? 'h-4 w-4' : 'h-8 w-8'} />
      <span className="text-sm font-body text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  </div>
);

export default LoadingIndicator;
