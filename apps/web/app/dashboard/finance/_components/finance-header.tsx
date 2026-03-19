interface FinanceHeaderProps {
    title: string;
    subtitle: string;
}

export function FinanceHeader({ title, subtitle }: FinanceHeaderProps) {
    return (
        <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
            <p className="text-slate-400 mt-1">{subtitle}</p>
        </div>
    );
}
