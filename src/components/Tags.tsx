import clsx from 'clsx';

export default function Tags({ children, className }: { children?: React.ReactNode; className?: string }) {
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
    const tags = String(children).split(",").map((tag) => tag.trim());

    const getColor = (tag: string) => {
        switch (tag) {
            case "admin":
                return "bg-red-400";
            case "promo":
                return "bg-green-400";
            case "art":
                return "bg-blue-400";
            case "tech":
                return "bg-yellow-400";
            case "food":
                return "bg-purple-400";

            case "concert":
                return "bg-orange-400";
            case "workshop":
                return "bg-pink-400";
            case "lecture":
                return "bg-teal-400";
            case "practice":
                return "bg-indigo-400";
            case "performance":
                return "bg-gray-400";
            case "theatre":
                return "bg-slate-400";
            case "lesson":
                return "bg-rose-400";
            case "game":
                return "bg-emerald-400";

            default:
                return "bg-cyan-400";
        }
    }


    return (
        <div className={computedClassName}>
            {tags.map((tag, index) => (
                <span key={index} className={`text-black text-sm text-center p-1 rounded-md mr-1 ${getColor(tag)}`}>
                    {tag}
                </span>
            ))}
        </div>
    );
}