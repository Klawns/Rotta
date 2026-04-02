"use client";

export function RideListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex w-full flex-col gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex min-h-[124px] flex-col gap-2.5 rounded-[1.75rem] border border-white/5 bg-white/5 px-3 py-2.5 animate-pulse"
                >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                        <div className="grid shrink-0 grid-cols-1 gap-2 self-start">
                            <div className="h-9 w-9 rounded-2xl bg-white/5" />
                        </div>

                        <div className="flex min-w-0 flex-col gap-2 pt-1">
                            <div className="h-4 w-24 rounded bg-white/5" />
                            <div className="h-2.5 w-32 rounded bg-white/5" />
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1 pt-1">
                            <div className="h-2 w-10 rounded bg-white/5" />
                            <div className="h-5 w-18 rounded bg-white/5" />
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                        <div className="h-7 rounded-2xl bg-white/5" />
                        <div className="h-7 rounded-2xl bg-white/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}
