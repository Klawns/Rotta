"use client";

export function RideSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 rounded-[1.6rem] border border-border-subtle bg-card-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-24 rounded-md bg-secondary/20" />
          <div className="h-7 w-40 rounded-lg bg-secondary/25" />
          <div className="h-4 w-56 max-w-full rounded-md bg-secondary/20" />
        </div>

        <div className="w-28 space-y-2 text-right">
          <div className="ml-auto h-8 w-24 rounded-lg bg-secondary/25" />
          <div className="ml-auto h-6 w-20 rounded-full bg-secondary/20" />
          <div className="ml-auto h-3 w-24 rounded-md bg-secondary/20" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle/70 pt-3">
        <div className="h-4 w-24 rounded-md bg-secondary/20" />
        <div className="h-9 w-9 rounded-full bg-secondary/20" />
      </div>
    </div>
  );
}
