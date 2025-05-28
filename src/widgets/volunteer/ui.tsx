import { useState } from "react";
import { useVolunteerListStore } from "../../entities/volunteer";
import { Dialog } from "@headlessui/react";

export function VolunteersTable() {
    const { list, listError, listLoading } = useVolunteerListStore();
    const [selected, setSelected] = useState(null);

    if (listLoading) return <div className="p-4 text-center">Loading...</div>;
    if (listError) return <div className="p-4 text-red-500">{listError}</div>;
    if (!list) return null;

    return (
        <div className="p-4">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 shadow rounded-lg text-amber-950">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold hidden md:table-cell">Age</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold hidden md:table-cell">Profession</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Department</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold hidden md:table-cell">Phone</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {list?.map((item) => (
                        <tr
                            key={item.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelected(item)}
                        >
                            <td className="px-4 py-2 text-sm">{item.name}</td>
                            <td className="px-4 py-2 text-sm hidden md:table-cell">{item.age}</td>
                            <td className="px-4 py-2 text-sm hidden md:table-cell">{item.profession}</td>
                            <td className="px-4 py-2 text-sm">{item.department}</td>
                            <td className="px-4 py-2 text-sm hidden md:table-cell">{item.phone}</td>
                            <td className="px-4 py-2 text-sm text-blue-600">View</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 overflow-y-auto max-h-[80vh] shadow-xl">
                        <Dialog.Title className="text-lg font-bold mb-4">Volunteer Info</Dialog.Title>
                        {selected && (
                            <div className="space-y-2 text-sm text-amber-950">
                                {Object.entries(selected).map(([key, value]) => (
                                    <div key={key} className="flex">
                                        <div className="w-1/3 font-semibold capitalize">{key.replace(/_/g, ' ')}:</div>
                                        <div className="w-2/3 break-words">{Array.isArray(value) ? value.join(', ') : String(value ?? '-')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setSelected(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
