import React, { useState } from "react";
import { createTicket } from "../../entities/ticket";

interface CreateTicketModalProps {
    onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        comment: '',
        ticket_type: 'V',
        active: true,
        is_used: false,
        language: "ru",
        send_email: true,
        send_tg: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            await createTicket(form);
            onClose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An error occurred while creating the ticket");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-stone-800">Create New Ticket</h2>
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-stone-600 text-2xl font-semibold"
                        >
                            ×
                        </button>
                    </div>

                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border-b border-stone-200 pb-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 block">
                                Name *
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </label>
                        </div>
                        <div className="border-b border-stone-200 pb-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 block">
                                Email *
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </label>
                        </div>
                        <div className="border-b border-stone-200 pb-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 block">
                                Phone/Telegram
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </label>
                        </div>
                        <div className="border-b border-stone-200 pb-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 block">
                                Тип билета *
                                <select
                                    name="ticket_type"
                                    value={form.ticket_type}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    required
                                >
                                    <option value="G">Гость</option>
                                    <option value="M">Мастер</option>
                                    <option value="V">Волонтер</option>
                                    <option value="O">Организатор</option>
                                    <option value="S">Семейный</option>
                                    <option value="F">Друзья</option>
                                    <option value="L">Льготный</option>
                                    <option value="C">Гость</option>
                                </select>
                            </label>
                        </div>
                        <div className="border-b border-stone-200 pb-2 sm:col-span-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 block">
                                Comment
                                <textarea
                                    name="comment"
                                    value={form.comment}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </label>
                        </div>
                        <div className="border-b border-stone-200 pb-2 flex items-center gap-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 cursor-pointer flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={!!form.active}
                                    onChange={handleChange}
                                />
                                Active
                            </label>
                        </div>
                        <div className="border-b border-stone-200 pb-2 flex items-center gap-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 cursor-pointer flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_used"
                                    checked={!!form.is_used}
                                    onChange={handleChange}
                                />
                                Used
                            </label>
                        </div>
                    </form>

                    <div className="mt-4 p-4 bg-stone-50 rounded border border-stone-200 flex flex-col gap-2">
                        <div className="border-b border-stone-200 pb-2">
                            <label className="text-sm font-medium text-stone-500 capitalize mb-1 block">
                                Язык *
                                <select
                                    name="language"
                                    value={form.language}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    required
                                >
                                    <option value="ru">Русский</option>
                                    <option value="ro">Română</option>
                                    <option value="en">English</option>
                                </select>
                            </label>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="send_email"
                                checked={!!form.send_email}
                                onChange={handleChange}
                            />
                            <span className="text-sm text-stone-700">Send ticket to email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="send_tg"
                                checked={!!form.send_tg}
                                onChange={handleChange}
                            />
                            <span className="text-sm text-stone-700">Send ticket to Telegram</span>
                        </label>
                    </div>

                    {error && (
                        <div className="text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !form.name.trim() || !form.email.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Ticket'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
