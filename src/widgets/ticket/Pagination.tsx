import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, setCurrentPage }) => {
    return (
        <nav className="inline-flex -space-x-px rounded-md shadow-sm">
            {/* first page */}
            {currentPage > 3 && (
                <button
                    onClick={() => setCurrentPage(1)}
                    className="px-2 py-2 border border-stone-300 text-sm text-stone-500 hover:bg-stone-50 rounded-l-md"
                >
                    1
                </button>
            )}
            {currentPage > 4 && (
                <button className="px-2 py-2 border border-stone-300 text-sm text-stone-500 hover:bg-stone-50">...</button>
            )}

            {/* previous page */}
            {currentPage > 2 && (
                <button
                    onClick={() => setCurrentPage(currentPage - 2)}
                    className="px-4 py-2 border text-sm bg-white text-stone-500 border-stone-300"
                >
                    {currentPage - 2}
                </button>
            )}
            {currentPage > 1 && (
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 border text-sm bg-white text-stone-500 border-stone-300"
                >
                    {currentPage - 1}
                </button>
            )}

            {/* current page */}
            <button
                disabled
                className="px-4 py-2 border text-sm bg-amber-100 text-amber-700 border-amber-500"
            >
                {currentPage}
            </button>

            {/* next page */}
            {currentPage < totalPages && (
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 border text-sm bg-white text-stone-500 border-stone-300"
                >
                    {currentPage + 1}
                </button>
            )}
            {currentPage < totalPages - 1 && (
                <button
                    onClick={() => setCurrentPage(currentPage + 2)}
                    className="px-4 py-2 border text-sm bg-white text-stone-500 border-stone-300"
                >
                    {currentPage + 2}
                </button>
            )}

            {/* last page */}
            {currentPage < totalPages - 3 && (
                <button className="px-2 py-2 border border-stone-300 text-sm text-stone-500 hover:bg-stone-50">...</button>
            )}
            {currentPage < totalPages - 2 && (
                <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-2 py-2 border border-stone-300 text-sm text-stone-500 hover:bg-stone-50"
                >
                    {totalPages}
                </button>
            )}
        </nav>
    );
};
