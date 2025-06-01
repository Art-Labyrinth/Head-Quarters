import clsx from 'clsx';

export default function Cell({ children, className }: { children?: React.ReactNode; className?: string }) {
    const computedClassName = clsx(
        "flex items-center justify-center flex-grow",
        // "text-slate-200 text-sm text-center",
        "text-sm text-center",
        "p-2",
        // "bg-slate-700",
        "border border-slate-700 rounded-md",
        "table-cell",
        className
    );

    return (
        <div className={computedClassName}>
            {children}
        </div>
    );
}