const Bar = ({ className }: { className: string }) => (
  <div className={`rounded bg-gray-200 dark:bg-dark-100 ${className}`} />
);

export const LastArenaBattleSkeleton = () => (
  <section className="card mb-6" role="status" aria-busy="true">
    <span className="sr-only">Loading last arena battle…</span>
    <div className="ui-skeleton-pulse" aria-hidden="true">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Bar className="h-11 w-11 shrink-0 rounded-xl" />
          <div>
            <Bar className="h-4 w-28" />
            <Bar className="mt-1 h-7 w-36" />
          </div>
        </div>
        <Bar className="h-6 w-20 rounded-full" />
      </div>
      <div className="my-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Bar className="h-5 w-24" />
        <Bar className="h-4 w-40" />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-dark-100">
        <Bar className="h-11 w-36" />
        <Bar className="h-11 w-32" />
      </div>
    </div>
  </section>
);

export const ArenaLobbySkeleton = () => (
  <div role="status" aria-busy="true">
    <span className="sr-only">Loading opponents…</span>
    <div className="ui-skeleton-pulse space-y-3" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="card !p-0 overflow-hidden border-l-4">
          <div className="grid grid-cols-2 items-center gap-4 px-4 py-4 sm:grid-cols-[6rem_minmax(0,1fr)_8rem] sm:px-5">
            <div className="space-y-2">
              <Bar className="h-5 w-16" />
              <Bar className="h-5 w-12" />
              <Bar className="h-4 w-16" />
            </div>
            <div className="order-3 col-span-2 grid grid-cols-3 min-w-0 gap-2 sm:order-2 sm:col-span-1">
              {Array.from({ length: index + 1 }, (_, fighter) => (
                <div
                  key={fighter}
                  className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-1 pb-3 dark:border-dark-100 dark:bg-dark-200"
                >
                  <div className="flex h-28 items-center justify-center sm:h-32">
                    <Bar className="h-16 w-16" />
                  </div>
                  <Bar className="mx-auto h-5 w-4/5 sm:h-6" />
                  <Bar className="mx-auto mt-1 h-5 w-1/2" />
                </div>
              ))}
            </div>
            <div className="order-2 space-y-2 sm:order-3">
              <Bar className="ml-auto h-4 w-16" />
              <Bar className="ml-auto h-5 w-24" />
              <Bar className="h-9 w-full" />
            </div>
          </div>
        </div>
      ))}
      <Bar className="mx-auto h-4 w-3/4" />
    </div>
  </div>
);
