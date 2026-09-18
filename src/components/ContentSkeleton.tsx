interface Props {
  label: string;
  count?: number;
  layout?: 'list' | 'grid' | 'table';
  className?: string;
  itemClassName?: string;
  gridClassName?: string;
}

const ContentSkeleton = ({
  label,
  count = 3,
  layout = 'list',
  className = '',
  itemClassName = '',
  gridClassName = 'grid-cols-2 sm:grid-cols-3',
}: Props) => (
  <div role="status" aria-busy="true" className={className}>
    <span className="sr-only">{label}</span>
    <div
      aria-hidden="true"
      className={`ui-skeleton-pulse ${layout === 'grid' ? `grid ${gridClassName} gap-3` : 'space-y-3'} ${layout === 'table' ? 'p-4' : ''}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`rounded-lg bg-gray-100 dark:bg-dark-200 ${layout === 'grid' ? 'h-44' : 'h-16'} ${itemClassName}`}
        >
          <div
            className={`h-full flex items-center gap-3 p-4 ${layout === 'grid' ? 'flex-col justify-center' : ''}`}
          >
            <div className="h-8 w-8 shrink-0 rounded bg-gray-200 dark:bg-dark-100" />
            <div className={`space-y-2 ${layout === 'grid' ? 'w-full' : 'flex-1'}`}>
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-dark-100" />
              <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-dark-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ContentSkeleton;
