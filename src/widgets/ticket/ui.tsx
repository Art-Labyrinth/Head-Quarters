import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { useTicketListStore } from "../../entities/ticket";
import {Ticket} from "../../entities/ticket/types.ts";

export function TicketTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { list } = useTicketListStore();
    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return list?.filter((ticket) => {
            return (
                (ticket.ticket_id || "").toLowerCase().includes(search) ||
                (ticket.comment || "").toLowerCase().includes(search)
            );
        }) || [];
    }, [list, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = () => {
        const confirmed = window.confirm("Are you sure you want to delete this ticket?");
        if (confirmed) {
            setSelectedTicket(null);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <main className="p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Ticket Management</h1>
                        <p className="text-stone-600">
                            Manage your tickets efficiently with our dashboard.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-stone-200 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by Ticket ID or Comment..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-200">
                                <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Active</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Used</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-200">
                                {paginatedData.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-stone-50">
                                        <td className="px-6 py-4 text-sm font-medium text-stone-900">{ticket.id}</td>
                                        <td className="px-6 py-4 text-sm text-stone-700">{ticket.ticket_id}</td>
                                        <td className="px-6 py-4 text-sm text-stone-700">{ticket.active ? "Yes" : "No"}</td>
                                        <td className="px-6 py-4 text-sm text-stone-700">{ticket.is_used ? "Yes" : "No"}</td>
                                        <td className="px-6 py-4 text-sm text-stone-700">{ticket.created_at}</td>
                                        <td className="px-6 py-4 text-sm text-stone-700">{ticket.comment || "-"}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-medium"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-white px-4 py-3 border-t border-stone-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-stone-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                                    </span>{" "}
                                    of <span className="font-medium">{filteredData.length}</span> results
                                </p>
                                <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-2 py-2 border border-stone-300 text-sm text-stone-500 hover:bg-stone-50 rounded-l-md"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 border text-sm ${
                                                currentPage === i + 1
                                                    ? "bg-amber-100 text-amber-700 border-amber-500"
                                                    : "bg-white text-stone-500 border-stone-300 hover:bg-stone-50"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-2 py-2 border border-stone-300 text-sm text-stone-500 hover:bg-stone-50 rounded-r-md"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-stone-800">Ticket Details</h2>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-stone-400 hover:text-stone-600 text-2xl font-semibold"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(selectedTicket).map(([key, value]) => (
                                    <div key={key} className="border-b border-stone-200 pb-2">
                                        <dt className="text-sm font-medium text-stone-500 capitalize mb-1">
                                            {key.replace(/_/g, " ")}
                                        </dt>
                                        <dd className="text-sm text-stone-900 break-words">
                                            {value === null || value === "" ? "-" : String(value)}
                                        </dd>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    onClick={() => handleDelete()}
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-6 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
