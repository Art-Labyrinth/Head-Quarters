import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { Master } from "../../entities/master/types.ts";
import { useMasterListStore } from "../../entities/master";
import { getMaster, deleteMaster } from "../../entities/master/api.ts";
import { useNavigate, useParams } from "react-router-dom";

export function MasterTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
    const { list } = useMasterListStore();
    const itemsPerPage = 10;

    const navigate = useNavigate();
    const params = useParams<{ id?: string }>();

    const filteredData = useMemo(() => {
        return (list ?? []).filter((master) => {
            const name = master.name?.toLowerCase() || "";
            return name.includes(searchTerm.toLowerCase());
        });
    }, [list, searchTerm]);

    const totalPages = filteredData.length ? Math.ceil(filteredData.length / itemsPerPage) : 0;

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this master?");
        if (confirmed) {
            setSelectedMaster(null);
            navigate('/masters');
            await deleteMaster(String(selectedMaster?.id))
                .then(() => {
                    navigate('/masters');
                })
                .catch((error) => {
                    console.error("Error deleting master:", error);
                });
        }
    };

    const handleOpenMaster = useCallback(async (id: number) => {
        navigate(`/masters/${id}`);
    }, [navigate]);

    const handleCloseMaster = useCallback(() => {
        setSelectedMaster(null);
        navigate('/masters');
    }, [navigate]);

    useEffect(() => {
        const id = params.id ? Number(params.id) : null;
        if (id) {
            const found = list?.find((m) => m.id === id) ?? null;
            if (found) {
                setSelectedMaster(found);
            } else {
                getMaster(id).then(response => {
                    if ('data' in response) {
                        setSelectedMaster(response.data);
                    }
                });
            }
        } else {
            setSelectedMaster(null);
        }
    }, [params.id, list]);


    return (
        <div className="min-h-screen bg-stone-50">
            <main className="p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Masters Management</h1>
                        <p className="text-stone-600">
                            Manage your masters efficiently with our comprehensive dashboard.
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
                                    placeholder="Search masters names..."
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Id</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Program</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider hidden sm:table-cell">Date(s)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-200">
                                    {paginatedData.map((master) => (
                                        <tr key={master.id} className="hover:bg-stone-50">
                                            <td className="px-6 py-4 text-sm font-medium text-stone-900">{master.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-stone-900">{master.name}</td>
                                            <td className="px-6 py-4 text-sm text-stone-500">{master.program_name}</td>
                                            <td className="px-6 py-4 text-sm text-stone-500 hidden sm:table-cell">
                                                {master.event_dates || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => handleOpenMaster(master.id)}
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
                                <div className="text-sm text-stone-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                                    </span>{" "}
                                    of <span className="font-medium">{filteredData.length}</span> results
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-2 py-1 border rounded disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 border rounded ${currentPage === i + 1
                                                    ? "bg-amber-100 text-amber-800 border-amber-400"
                                                    : "text-stone-600 border-stone-300"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-2 py-1 border rounded disabled:opacity-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {selectedMaster && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-stone-800">Master Details</h2>
                                <button
                                    onClick={() => handleCloseMaster()}
                                    className="text-stone-400 hover:text-stone-600 text-2xl font-semibold"
                                    aria-label="Close modal"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(selectedMaster).map(([key, value]) => {
                                    if (key === "previously_participated" && !value) {
                                        value = "False";
                                    }
                                    const excludes = [
                                        "form_type",
                                        "deleted_at",
                                    ];
                                    if (excludes.includes(key)) {
                                        return null;
                                    }
                                    if (key === "created_at" && typeof value === "string") {
                                        const date = new Date(value);
                                        value = isNaN(date.getTime())
                                            ? value
                                            : date.toLocaleString("ru-RU");
                                    }
                                    return (
                                        <div key={key} className="border-b border-stone-200 pb-2">
                                            <dt className="text-sm font-medium text-stone-500 capitalize mb-1">
                                                {key.replace(/_/g, " ")}
                                            </dt>
                                            <dd className="text-sm text-stone-900 break-words">
                                                {Array.isArray(value)
                                                    ? value.join(", ")
                                                    : value === null || value === ""
                                                        ? "-"
                                                        : String(value)}
                                            </dd>
                                        </div>
                                    )
                                })}
                            </div>
                            {selectedMaster?.files && (
                                <div className="flex flex-wrap mt-6">
                                    {selectedMaster.files.map((file, index) => {
                                        const isImage = file.match(/\.(jpeg|jpg|gif|png|webp|svg|webp)$/i);
                                        const isVideo = file.match(/\.(mp4|webm|ogg|webm)$/i);
                                        return (
                                            <div key={index} className="bg-stone-100 p-3 rounded-md mr-3 mb-3 flex flex-col items-center gap-2 w-40 h-40 justify-center">
                                                {isImage && (
                                                    <img
                                                        src={file}
                                                        alt={`Preview ${index}`}
                                                        className="object-cover w-32 h-32 rounded"
                                                    />
                                                )}
                                                {isVideo && (
                                                    <video
                                                        controls
                                                        className="object-cover w-32 h-32 rounded"
                                                    >
                                                        <source src={file} type={`video/${file.split('.').pop()}`} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                                <a
                                                    href={file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-amber-600 hover:text-amber-800 mt-2 underline"
                                                    download
                                                >
                                                    Download file
                                                </a>
                                            </div>
                                        );
                                    })}


                                </div>
                            )}
                            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    onClick={() => handleDelete()}
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleCloseMaster()}
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
