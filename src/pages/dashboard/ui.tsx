import React, {useState} from 'react';
import {MainLayout} from "../../widgets/layouts/main";
import {useUserStore} from "../../entities/user";

import {UserRole} from "../../entities/user/types";

export const Dashboard: React.FC = () => {
    const {session} = useUserStore()

    // Debug form state
    const [prefix, setPrefix] = useState('GST');
    const [part, setPart] = useState(10);
    const [quantity, setQuantity] = useState(10);
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const params = new URLSearchParams({
                prefix,
                part: String(part),
                quantity: String(quantity),
            });
            const url = `http://localhost:8000/tickets/generate_qr_code?${params.toString()}`;
            const token = session?.access_token;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            if (!response.ok) throw new Error('File download error');
            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'qr_codes.zip';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename\s*=\s*"?([^";\s]+)"?/i);
                if (match) filename = match[1];
            }
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert('File download error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout header={'Dashboard'}>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Welcome Back, {session?.username}!</h1>
                <p className="text-stone-600">Here's what's happening with your dashboard today.</p>
            </div>

            {/* Debug QR Download Form (admin only) */}
            {session?.role === UserRole.admin && (
                <div className="mb-8 p-4 bg-stone-50 border border-stone-200 rounded-lg max-w-xl">
                    <h2 className="text-lg font-semibold mb-2">Debug: QR Code Generation</h2>
                    <form className="flex flex-col gap-3" onSubmit={handleDownload}>
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
                </div>
            )}
        </MainLayout>
    )
};
