import React, { useState } from "react";
import { Ticket } from "../../entities/ticket/types";
import { updateTicket, deleteTicket } from "../../entities/ticket/api";

interface TicketModalProps {
    ticket: Ticket;
    onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({
        name: ticket.name || '',
        email: ticket.email || '',
        phone: ticket.phone || '',
        comment: ticket.comment || '',
        active: !!ticket.active,
        is_used: !!ticket.is_used,
        is_sold: !!ticket.is_sold,
        language: "en",
        send_email: false,
        send_tg: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await updateTicket(ticket.id, form);
            Object.assign(ticket, form);
            setIsEdit(false);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An error while maintaining");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            await deleteTicket(ticket.id);
            onClose();
        } catch (e) {
            alert("Error when removing");
            console.error("Delete ticket error:", e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-stone-800">Ticket Details</h2>
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-stone-600 text-2xl font-semibold"
                        >
                            ×
                        </button>
                    </div>
                    {isEdit ? (
                        <>
                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border-b border-stone-200 pb-2">
                                    <dt className="text-sm font-medium text-stone-500 capitalize mb-1">ID</dt>
                                    <dd className="text-sm text-stone-900 break-words">{ticket.id === null ? "-" : String(ticket.id)}</dd>
                                </div>
                                <div className="border-b border-stone-200 pb-2">
                                    <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Ticked code</dt>
                                    <dd className="text-sm text-stone-900 break-words">{ticket.ticket_id}</dd>
                                </div>
                                <div className="border-b border-stone-200 pb-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1">
                                        <span className="px-2">Name</span>
                                        <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-1" />
                                    </label>
                                </div>
                                <div className="border-b border-stone-200 pb-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1">
                                        <span className="px-2">Email</span>
                                        <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-1" />
                                    </label>
                                </div>
                                <div className="border-b border-stone-200 pb-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1">
                                        <span className="px-2">Phone/Telegram</span>
                                        <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded p-1" />
                                    </label>
                                </div>
                                <div className="border-b border-stone-200 pb-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1">
                                        <span className="px-2">Comment</span>
                                        <textarea name="comment" value={form.comment} onChange={handleChange} className="w-full border rounded p-1" />
                                    </label>
                                </div>
                                <div className="border-b border-stone-200 pb-2 flex items-center gap-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1 cursor-pointer">
                                        <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} />
                                        <span className="px-2">Active</span>
                                    </label>
                                </div>
                                <div className="border-b border-stone-200 pb-2 flex items-center gap-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1 cursor-pointer">
                                        <input type="checkbox" name="is_used" checked={!!form.is_used} onChange={handleChange} />
                                        <span className="px-2">Used</span>
                                    </label>
                                </div>
                                <div className="border-b border-stone-200 pb-2 flex items-center gap-2">
                                    <label className="text-sm font-medium text-stone-500 capitalize mb-1 cursor-pointer">
                                        <input type="checkbox" name="is_sold" checked={!!form.is_sold} onChange={handleChange} />
                                        <span className="px-2">Is sold</span>
                                    </label>
                                </div>
                            </form>
                            <div className="mt-4 p-4 bg-stone-50 rounded border border-stone-200 flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="send_email" checked={!!form.send_email} onChange={handleChange} />
                                    <span>Send ticket to email</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="send_tg" checked={!!form.send_tg} onChange={handleChange} />
                                    <span>Send ticket to Telegram</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span>Language:</span>
                                    <select
                                        value={form.language}
                                        onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                                        className="border rounded p-1"
                                    >
                                        <option value="ru">Russian</option>
                                        <option value="ro">Romanian</option>
                                        <option value="en">English</option>
                                    </select>
                                </label>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">ID</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.id === null ? "-" : String(ticket.id)}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Ticked code</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.ticket_id}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Name</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.name === null ? "-" : ticket.name}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Active</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.active === null ? "No" : ticket.active ? "Yes" : "No"}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Email</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.email === null ? "-" : ticket.email}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Phone/Telegram</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.phone === null ? "-" : ticket.phone}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Used</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.is_used === null ? "No" : ticket.is_used ? "Yes" : "No"}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Is sold</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.is_sold === null ? "No" : ticket.is_sold ? "Yes" : "No"}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Comment</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.comment === null ? "-" : ticket.comment}</dd>
                            </div>
                            <div className="border-b border-stone-200 pb-2">
                                <dt className="text-sm font-medium text-stone-500 capitalize mb-1">Created at</dt>
                                <dd className="text-sm text-stone-900 break-words">{ticket.created_at && new Date(ticket.created_at).toLocaleString()}</dd>
                            </div>
                        </div>
                    )}
                    {error && <div className="text-red-600 mt-2">{error}</div>}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                            {!isEdit && (
                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            {isEdit ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                    >
                                        {loading ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setIsEdit(false)}
                                        className="px-6 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEdit(true)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
