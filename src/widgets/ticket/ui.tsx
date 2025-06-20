import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTicketListStore } from "../../entities/ticket";
import { Ticket } from "../../entities/ticket/types.ts";
import { TicketModal } from "./TicketModal";
import { Pagination } from "./Pagination";

interface TicketTableProps {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalCount: number;
}

export function TicketTable({ currentPage = 1, setCurrentPage, itemsPerPage = 20, totalCount }: Partial<TicketTableProps> = {}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { list, getList } = useTicketListStore();

    const filteredData = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return list?.filter((ticket) => {
            return (
                (ticket.ticket_id || "").toLowerCase().includes(search) ||
                (ticket.comment || "").toLowerCase().includes(search)
            );
        }) || [];
    }, [list, searchTerm]);

    const totalPages = totalCount ? Math.ceil(totalCount / itemsPerPage) : 1;

    function getSearchParams(currentPage: number, itemsPerPage: number, searchTerm: string) {
        const params = new URLSearchParams();
        params.set("offset", String(((currentPage || 1) - 1) * itemsPerPage));
        params.set("limit", String(itemsPerPage));
        if (searchTerm) params.set("search", searchTerm);
        return params;
    }

    useEffect(() => {
        getList(getSearchParams(currentPage, itemsPerPage, searchTerm));
    }, [currentPage, getList, itemsPerPage, searchTerm]);

    const onCloseModal = async () => {
        await getList(getSearchParams(currentPage, itemsPerPage, searchTerm));
        setSelectedTicket(null);
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
                                    placeholder="Search by prefix Ticket ID"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (setCurrentPage) setCurrentPage(1);
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
                                    <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Ticket ID</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Created At</th>
                                        <th className="px-6 py-3">Comment</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-200">
                                    {filteredData.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="hover:bg-stone-200 cursor-pointer text-sm text-stone-700"
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            <td className="px-6 py-4 font-medium">{ticket.id}</td>
                                            <td className="px-6 py-4">{ticket.ticket_id}</td>
                                            <td className="px-6 py-4">{ticket.name}</td>
                                            <td className="px-6 py-4">{new Date(ticket.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4">{ticket.comment || "-"}</td>
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
                                        {Math.min(((currentPage || 1) - 1) * itemsPerPage + 1, filteredData.length)}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min((currentPage || 1) * itemsPerPage, filteredData.length)}
                                    </span>{" "}
                                    of <span className="font-medium">{filteredData.length}</span> results
                                </p>
                                <Pagination
                                    currentPage={currentPage || 1}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage!}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={onCloseModal}
                />
            )}
        </div>
    );
}
