"use client";

export function RideSkeleton() {
    return (
        <div className="flex animate-pulse flex-col gap-4 rounded-[1.75rem] border border-border-subtle bg-card-background p-4 shadow-sm sm:gap-5 sm:rounded-[2rem] sm:p-5">
            <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-secondary/20" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-3 w-24 rounded-md bg-secondary/20" />
                            <div className="h-6 w-32 rounded-lg bg-secondary/25" />
                        </div>
                        <div className="shrink-0 space-y-2">
                            <div className="ml-auto h-3 w-12 rounded-md bg-secondary/20" />
                            <div className="h-7 w-24 rounded-lg bg-secondary/25" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border-subtle/80 bg-secondary/5 px-3 py-2.5">
                <div className="space-y-2">
                    <div className="h-3 w-20 rounded-md bg-secondary/20" />
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-24 rounded-md bg-secondary/25" />
                        <div className="h-4 w-32 rounded-md bg-secondary/20" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 border-t border-border-subtle pt-3">
                <div className="h-10 w-10 rounded-2xl bg-secondary/20" />
                <div className="h-10 rounded-2xl bg-secondary/25" />
                <div className="h-10 rounded-2xl bg-secondary/20" />
            </div>
        </div>
    );
}
