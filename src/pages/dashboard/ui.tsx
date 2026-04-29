import React, {useState} from 'react';
import {ChevronDown} from 'lucide-react';

import {MainLayout} from "../../widgets/layouts/main";
import {useUserStore} from "../../entities/user";
import {downloadExistingTickets, downloadQRCodes} from "../../entities/ticket/api.qr";
import {canAccessQrGeneration, canAccessTicketsArchive} from '../../shared/lib';

type TicketArchivePayload = {
    ids?: number[];
    ticket_ids?: string[];
    range_from?: number;
    range_to?: number;
    for_print?: boolean;
}

const triggerFileDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};

export const Dashboard: React.FC = () => {
    const {session} = useUserStore()
    const canUseQrGeneration = canAccessQrGeneration(session)
    const canUseTicketArchive = canAccessTicketsArchive(session)

    const [prefix, setPrefix] = useState('GST');
    const [part, setPart] = useState(10);
    const [quantity, setQuantity] = useState(10);
    const [loading, setLoading] = useState(false);

    const [idsInput, setIdsInput] = useState('');
    const [ticketIdsInput, setTicketIdsInput] = useState('');
    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');
    const [forPrint, setForPrint] = useState(false);
    const [archiveLoading, setArchiveLoading] = useState(false);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await downloadQRCodes({
                prefix,
                part,
                quantity,
            }, session?.access_token);

            if ('blob' in result && 'filename' in result) {
                triggerFileDownload(result.blob, result.filename);
            } else {
                throw result;
            }
        } catch (err) {
            console.error(err);
            alert('File download error');
        } finally {
            setLoading(false);
        }
    };

    const handleArchiveDownload = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasIds = idsInput.trim().length > 0;
        const hasTicketIds = ticketIdsInput.trim().length > 0;
        const hasRange = rangeFrom !== '' || rangeTo !== '';
        const selectedVariantCount = [hasIds, hasTicketIds, hasRange].filter(Boolean).length;

        if (selectedVariantCount !== 1) {
            alert('Use exactly one option: ids, ticket IDs, or range.');
            return;
        }

        const payload: TicketArchivePayload = {};

        if (hasIds) {
            const ids = idsInput
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
                .map((value) => Number(value));

            if (!ids.length || ids.some(Number.isNaN)) {
                alert('IDs must be a comma-separated list of numbers.');
                return;
            }

            payload.ids = ids;
        }

        if (hasTicketIds) {
            const ticketIds = ticketIdsInput
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);

            if (!ticketIds.length) {
                alert('Ticket IDs must be a comma-separated list of values.');
                return;
            }

            payload.ticket_ids = ticketIds;
        }

        if (hasRange) {
            if (rangeFrom !== '') {
                payload.range_from = Number(rangeFrom);
            }

            if (rangeTo !== '') {
                payload.range_to = Number(rangeTo);
            }

            if (
                (payload.range_from !== undefined && Number.isNaN(payload.range_from)) ||
                (payload.range_to !== undefined && Number.isNaN(payload.range_to))
            ) {
                alert('Range values must be numbers.');
                return;
            }
        }

        if (forPrint) {
            payload.for_print = true;
        }

        setArchiveLoading(true);

        try {
            const result = await downloadExistingTickets(payload, session?.access_token);

            if ('blob' in result && 'filename' in result) {
                triggerFileDownload(result.blob, result.filename);
            } else {
                throw result;
            }
        } catch (err) {
            console.error(err);
            alert('Archive download error');
        } finally {
            setArchiveLoading(false);
        }
    };

    return (
        <MainLayout header={'Dashboard'}>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Welcome Back, {session?.username}!</h1>
                <p className="text-stone-600">Here's what's happening with your dashboard today.</p>
            </div>

            {(canUseQrGeneration || canUseTicketArchive) && (
                <div className="space-y-4 max-w-2xl">
                    {canUseQrGeneration && (
                        <details className="bg-stone-50 border border-stone-200 rounded-lg p-4 group">
                            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-stone-800">Debug: QR Code Generation</h2>
                                    <p className="text-sm text-stone-500">Generate a new QR archive.</p>
                                </div>
                                <ChevronDown className="text-stone-500 transition-transform group-open:rotate-180" size={18} />
                            </summary>

                            <form className="flex flex-col gap-3 mt-4" onSubmit={handleDownload}>
                                <div className="flex gap-2 items-center">
                                    <label className="w-24 font-medium">Prefix:</label>
                                    <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="border rounded px-2 py-1 flex-1" required />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label className="w-24 font-medium">Part:</label>
                                    <input type="number" value={part} min={1} onChange={e => setPart(Number(e.target.value))} className="border rounded px-2 py-1 flex-1" required />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label className="w-24 font-medium">Quantity:</label>
                                    <input type="number" value={quantity} min={1} onChange={e => setQuantity(Number(e.target.value))} className="border rounded px-2 py-1 flex-1" required />
                                </div>
                                <button type="submit" className="mt-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60" disabled={loading}>
                                    {loading ? 'Downloading...' : 'Generate and Download'}
                                </button>
                            </form>
                        </details>
                    )}

                    {canUseTicketArchive && (
                        <details className="bg-stone-50 border border-stone-200 rounded-lg p-4 group">
                            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-stone-800">Debug: Existing Tickets Archive</h2>
                                    <p className="text-sm text-stone-500">Download already created tickets by one filter only.</p>
                                </div>
                                <ChevronDown className="text-stone-500 transition-transform group-open:rotate-180" size={18} />
                            </summary>

                            <form className="flex flex-col gap-3 mt-4" onSubmit={handleArchiveDownload}>
                                <p className="text-sm text-stone-500">
                                    Fill only one variant: <strong>ids</strong>, <strong>ticket IDs</strong>, or <strong>range</strong>.
                                </p>

                                <div className="flex gap-2 items-center">
                                    <label className="w-24 font-medium">IDs:</label>
                                    <input
                                        type="text"
                                        value={idsInput}
                                        onChange={e => setIdsInput(e.target.value)}
                                        placeholder="1, 2, 3"
                                        className="border rounded px-2 py-1 flex-1"
                                    />
                                </div>

                                <div className="flex gap-2 items-center">
                                    <label className="w-24 font-medium">Ticket IDs:</label>
                                    <input
                                        type="text"
                                        value={ticketIdsInput}
                                        onChange={e => setTicketIdsInput(e.target.value)}
                                        placeholder="GST-10-1, GST-10-2"
                                        className="border rounded px-2 py-1 flex-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex gap-2 items-center">
                                        <label className="w-24 font-medium">From:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={rangeFrom}
                                            onChange={e => setRangeFrom(e.target.value)}
                                            placeholder="100"
                                            className="border rounded px-2 py-1 flex-1"
                                        />
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <label className="w-24 font-medium">To:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={rangeTo}
                                            onChange={e => setRangeTo(e.target.value)}
                                            placeholder="200"
                                            className="border rounded px-2 py-1 flex-1"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm text-stone-700">
                                    <input
                                        type="checkbox"
                                        checked={forPrint}
                                        onChange={e => setForPrint(e.target.checked)}
                                    />
                                    For print
                                </label>

                                <button type="submit" className="mt-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60" disabled={archiveLoading}>
                                    {archiveLoading ? 'Downloading...' : 'Download Existing Tickets'}
                                </button>
                            </form>
                        </details>
                    )}
                </div>
            )}
        </MainLayout>
    )
};
