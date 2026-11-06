type CustomerPageSkeletonProps = {
  withinLayout?: boolean;
};

export function CustomerPageSkeleton({ withinLayout = false }: CustomerPageSkeletonProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải trang"
      className={`mx-auto w-full max-w-[38rem] min-w-0 flex-1 ${withinLayout ? "" : "px-5 pt-24 pb-12 md:pt-28"}`}
      role="status"
    >
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-28 rounded bg-cas-surface-container" />
        <div className="mt-3 h-8 w-56 max-w-full rounded bg-cas-surface-container" />
        <div className="mt-7 space-y-4 rounded-2xl bg-cas-surface-container p-5">
          <div className="h-5 w-2/3 rounded bg-cas-outline-variant/30" />
          <div className="h-4 w-full rounded bg-cas-outline-variant/30" />
          <div className="h-4 w-4/5 rounded bg-cas-outline-variant/30" />
          <div className="h-12 w-full rounded-xl bg-cas-outline-variant/30" />
        </div>
      </div>
    </main>
  );
}
